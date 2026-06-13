import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/catalog";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  stock_quantity?: number;
  category_slug?: string | null;
  is_featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const isFavorite = isInWishlist(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to save items", variant: "destructive" });
      return;
    }
    try {
      if (isFavorite) {
        await removeFromWishlist(product.id);
        toast({ title: "Removed from wishlist" });
      } else {
        await addToWishlist(product.id);
        toast({ title: "Saved to wishlist" });
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="product-minimal group" data-cursor>
      <Link to={`/product/${product.id}`}>
        <div className="img-wrap mb-4">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
          <div className="card-overlay" />

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 bg-[--c-ivory] flex items-center justify-center"
            data-cursor
          >
            <svg
              className={`w-4 h-4 transition-colors ${isFavorite ? "text-[--c-void] fill-[--c-void]" : "text-[--c-void]"}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Out of stock */}
          {product.inStock === false && (
            <div className="absolute bottom-4 left-4 t-label bg-[--c-ivory] px-2 py-1">
              Sold Out
            </div>
          )}

          {/* Quick add bar */}
          {product.inStock !== false && (
            <div className="quick-add">
              <button
                onClick={(e) => { e.preventDefault(); onAddToCart?.(product); }}
                className="w-full bg-[--c-void] text-[--c-ivory] py-3 t-label hover:bg-[--c-gold] transition-colors"
                data-cursor
              >
                Quick Add
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="flex justify-between items-start px-0.5">
        <div>
          <h3 className="text-sm font-medium tracking-wide text-[--c-void] mb-1 line-clamp-1">
            <Link to={`/product/${product.id}`} className="hover:text-[--c-stone] transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-[--c-stone] font-light">
            {formatNaira(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
