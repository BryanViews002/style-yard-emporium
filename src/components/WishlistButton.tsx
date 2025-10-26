import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  productName,
  variant = 'outline',
  size = 'default',
  className,
  showText = true
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  const isWishlisted = isInWishlist(productId);

  const handleToggleWishlist = async () => {
    setIsLoading(true);
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn(
        "transition-colors",
        isWishlisted && "text-accent border-accent hover:bg-accent/10",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          showText && "mr-2",
          isWishlisted && "fill-current"
        )} 
      />
      {showText && (
        isLoading 
          ? "Loading..." 
          : isWishlisted 
            ? "Remove from Wishlist" 
            : "Add to Wishlist"
      )}
    </Button>
  );
};

export default WishlistButton;
