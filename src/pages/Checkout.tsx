import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import ShippingCalculator from "@/components/ShippingCalculator";
import { CouponInput } from "@/components/CouponInput";
import StripePaymentForm from "@/components/StripePaymentForm";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<
    { code: string; id: string; discount: number } | undefined
  >();
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);

    // Check if form is valid
    const isValid = !!(
      newFormData.email &&
      newFormData.firstName &&
      newFormData.lastName &&
      newFormData.address1 &&
      newFormData.city &&
      newFormData.state &&
      newFormData.postalCode &&
      newFormData.phone
    );
    setIsFormValid(isValid);
  };

  const handleCouponApplied = (couponId: string, discountAmount: number) => {
    setAppliedCoupon({
      code: appliedCoupon?.code || "",
      id: couponId,
      discount: discountAmount,
    });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(undefined);
  };

  const getSubtotal = () => getTotalPrice();
  const getDiscount = () => appliedCoupon?.discount || 0;
  const getFinalTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const shipping = selectedShipping?.shipping_cost || 0;
    return subtotal - discount + shipping;
  };

  const createOrder = async () => {
    if (!isFormValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      // Validate stock before proceeding
      const stockValidation = await supabase.functions.invoke(
        "validate-stock",
        {
          body: {
            items: items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
          },
        }
      );

      if (stockValidation.error) {
        throw new Error("Failed to validate stock");
      }

      if (!stockValidation.data.valid) {
        const issues = stockValidation.data.issues;
        const issueMessages = issues
          .map(
            (issue: any) =>
              `${issue.productName}: Only ${issue.available} available (requested ${issue.requested})`
          )
          .join("\n");

        toast({
          title: "Stock Unavailable",
          description: issueMessages,
          variant: "destructive",
        });
        return null;
      }

      // Generate order number
      const orderNumber = `TSY-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)
        .toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id || null,
            email: formData.email,
            order_number: orderNumber,
            total_amount: getFinalTotal(),
            subtotal: getSubtotal(),
            tax_amount: 0,
            shipping_amount: selectedShipping?.shipping_cost || 0,
            discount_amount: getDiscount(),
            coupon_id: appliedCoupon?.id || null,
            status: "pending",
            shipping_address: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              address_line_1: formData.address1,
              address_line_2: formData.address2,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postalCode,
              country: formData.country,
              phone: formData.phone,
            },
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        product_snapshot: {
          name: item.name,
          image: item.image,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        },
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setCurrentOrder(order);
      return order;
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Update inventory for each product
      for (const item of items) {
        const { error: inventoryError } = await supabase.rpc(
          "update_inventory",
          {
            p_product_id: item.id,
            p_quantity: item.quantity,
            p_movement_type: "out",
            p_reason: `Order ${currentOrder.order_number}`,
            p_reference_id: currentOrder.id,
          }
        );

        if (inventoryError) {
          console.error("Inventory update error:", inventoryError);
        }
      }

      // Send order confirmation
      await supabase.functions.invoke("send-order-confirmation", {
        body: { orderId: currentOrder.id },
      });

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Order #${currentOrder.order_number} has been confirmed.`,
      });

      navigate("/orders");
    } catch (error: any) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description:
          "Order created but there was an issue with confirmation. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-light tracking-wider text-primary mb-4">
            Your cart is empty
          </h1>
          <Link to="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/cart">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-light tracking-wider text-primary mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-light mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-light mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      name="address1"
                      required
                      value={formData.address1}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Section */}
              {isFormValid && (
                <div>
                  <Button
                    onClick={createOrder}
                    disabled={isProcessing || currentOrder}
                    className="w-full btn-hero mb-6"
                  >
                    {isProcessing
                      ? "Creating Order..."
                      : currentOrder
                      ? "Order Created"
                      : "Create Order & Continue to Payment"}
                  </Button>

                  {currentOrder && (
                    <StripePaymentForm
                      amount={getFinalTotal()}
                      orderId={currentOrder.id}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-light mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                        {item.selectedSize && ` • Size: ${item.selectedSize}`}
                        {item.selectedColor &&
                          ` • Color: ${item.selectedColor}`}
                      </p>
                      <p className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Shipping Calculator */}
              {isFormValid && formData.country && (
                <ShippingCalculator
                  countryCode={formData.country}
                  orderAmount={getSubtotal() - getDiscount()}
                  itemCount={items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                  onShippingSelected={setSelectedShipping}
                  selectedShipping={selectedShipping}
                />
              )}

              <Separator className="my-4" />

              <CouponInput
                cartTotal={getSubtotal()}
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                appliedCoupon={appliedCoupon}
              />

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>Discount</span>
                    <span>-${getDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {selectedShipping?.is_free
                      ? "FREE"
                      : selectedShipping
                      ? `$${selectedShipping.shipping_cost.toFixed(2)}`
                      : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
