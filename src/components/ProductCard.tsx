import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center gap-2 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}>
          <Button
            size="sm"
            className="btn-hero"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleFavorite?.(product.id)}
            className={isFavorite ? "bg-luxury-rose text-luxury-rose-foreground" : ""}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Stock Status */}
        {product.inStock === false && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs rounded">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-light text-lg text-foreground hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm font-light capitalize">
          {product.category}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-light text-primary">
            ${product.price}
          </span>
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div 
                  key={index}
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;