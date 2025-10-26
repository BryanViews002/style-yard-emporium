import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_image: string;
  product_brand?: string;
  created_at: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_wishlist', {
        p_user_id: user.id
      });

      if (error) throw error;

      setWishlist(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in Wishlist",
            description: "This item is already in your wishlist.",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist.",
      });

      // Reload wishlist to get updated data
      await loadWishlist();
      return true;
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });

      // Update local state immediately
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      return true;
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.product_id === productId);
  };

  const clearWishlist = async (): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setWishlist([]);
      toast({
        title: "Wishlist Cleared",
        description: "All items have been removed from your wishlist.",
      });
    } catch (error: any) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to clear wishlist.",
        variant: "destructive",
      });
    }
  };

  const value: WishlistContextType = {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
