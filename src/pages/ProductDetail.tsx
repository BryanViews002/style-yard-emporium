import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, ShoppingBag, Star } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { data: product, isLoading } = useProduct(id || "");
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (product) {
      // Set default selections
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-light tracking-wider text-primary mb-4">
            Product Not Found
          </h1>
          <Link to="/shop">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/shop">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Thumbnail gallery placeholder for multiple images */}
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="aspect-square bg-muted/50 rounded border-2 border-transparent hover:border-accent cursor-pointer transition-colors">
                  <img 
                    src={product.image} 
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-wider text-primary mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-light text-primary">
                  ${product.price}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="text-muted-foreground text-sm ml-2">(24 reviews)</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Product Options */}
            <div className="space-y-6">
              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-primary mb-3 block">
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-primary mb-3 block">
                    Color
                  </label>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-colors ${
                          selectedColor === color ? "border-accent" : "border-border"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-primary mb-3 block">
                  Quantity
                </label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full btn-hero"
                onClick={handleAddToCart}
                disabled={product.inStock === false}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.inStock === false ? "Out of Stock" : "Add to Cart"}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current text-luxury-rose" : ""}`} />
                {isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>

            {/* Product Features */}
            <div className="border-t border-border/50 pt-8">
              <h3 className="text-lg font-medium text-primary mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Premium quality materials</li>
                <li>• Ethically sourced and manufactured</li>
                <li>• Free shipping on orders over $100</li>
                <li>• 30-day return policy</li>
                <li>• Size guide available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;