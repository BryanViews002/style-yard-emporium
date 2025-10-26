import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { wishlist, isLoading, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart(productId, 1);
      toast({
        title: "Added to Cart",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const handleClearWishlist = async () => {
    if (wishlist.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your wishlist...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-light tracking-wider text-primary">My Wishlist</h1>
            <p className="text-muted-foreground mt-2">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">
                Start adding items you love to your wishlist
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link to={`/products/${item.product_slug}`}>
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-64 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Wishlist indicator */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Heart className="h-4 w-4 text-accent fill-current" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-lg line-clamp-2 mb-1">
                        <Link 
                          to={`/products/${item.product_slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.product_name}
                        </Link>
                      </h3>
                      {item.product_brand && (
                        <Badge variant="secondary" className="text-xs">
                          {item.product_brand}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        ${item.product_price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(item.product_id, item.product_name)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex-1"
                      >
                        <Link to={`/products/${item.product_slug}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlist.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Love what you see? Continue shopping for more items
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/products">Browse All Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/products?featured=true">Featured Items</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;