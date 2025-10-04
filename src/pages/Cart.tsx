import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-scale">
            <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-8" />
            <h1 className="text-4xl font-light tracking-wider text-primary mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-muted-foreground font-light mb-8">
              Discover our beautiful collection and add items to your cart
            </p>
            <Link to="/shop">
              <Button size="lg" className="btn-hero">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider text-primary mb-4">
            Shopping Cart
          </h1>
          <Link to="/shop">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} 
                   className="product-card p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-light text-primary mb-1">
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground text-sm capitalize">
                        {item.category}
                      </p>
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && (
                            <div className="flex items-center gap-1">
                              <span>Color:</span>
                              <div 
                                className="w-4 h-4 rounded border border-border/50"
                                style={{ backgroundColor: item.selectedColor }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-light text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="pt-4 border-t border-border/50">
              <Button variant="outline" onClick={clearCart} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-6 rounded-lg border border-border/50 h-fit">
            <h2 className="text-2xl font-light text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-border/50 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">${(getTotalPrice() * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full mt-6 btn-hero"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {user ? "Proceed to Checkout" : "Sign In to Checkout"}
            </Button>

            {!user && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                You must be signed in to complete your purchase
              </p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;