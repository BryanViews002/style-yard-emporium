import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock_quantity: number;
  };
}

const Wishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select("id, product_id, products(id, name, price, image, stock_quantity)")
        .eq("user_id", user.id);

      if (error) throw error;
      setWishlist(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading wishlist",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", wishlistId);

      if (error) throw error;

      toast({ title: "Removed from wishlist" });
      loadWishlist();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: "",
      inStock: product.stock_quantity > 0,
    }, 1);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-light tracking-wider text-primary mb-8">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
            <Link to="/shop">
              <Button className="btn-hero">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <Link to={`/product/${item.products.id}`}>
                  <img
                    src={item.products.image}
                    alt={item.products.name}
                    className="w-full h-64 object-cover rounded"
                  />
                </Link>
                <div>
                  <Link to={`/product/${item.products.id}`}>
                    <h3 className="font-medium text-lg hover:text-accent">{item.products.name}</h3>
                  </Link>
                  <p className="text-xl font-light text-primary mt-2">${item.products.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 btn-hero"
                    onClick={() => handleAddToCart(item.products)}
                    disabled={item.products.stock_quantity === 0}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
