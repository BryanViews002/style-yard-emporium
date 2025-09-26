import { Product } from "@/components/ProductCard";
import dress1 from "@/assets/dress-1.jpg";
import jewelry1 from "@/assets/jewelry-1.jpg";
import blazer1 from "@/assets/blazer-1.jpg";

export const products: Product[] = [
  {
    id: "1",
    name: "Silk Midi Dress",
    price: 189,
    image: dress1,
    category: "clothes",
    description: "Elegant silk midi dress perfect for day to evening wear. Features a flowing silhouette with subtle draping and a flattering neckline.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#F4A6A6", "#E8D5C5", "#A8A8A8"],
    inStock: true,
  },
  {
    id: "2",
    name: "Gold Layer Necklace Set",
    price: 129,
    image: jewelry1,
    category: "jewelry",
    description: "Delicate layered necklace set featuring three complementary chains in 18k gold vermeil. Perfect for everyday elegance or special occasions.",
    colors: ["#FFD700", "#FFA500"],
    inStock: true,
  },
  {
    id: "3",
    name: "Tailored Blazer",
    price: 245,
    image: blazer1,
    category: "clothes",
    description: "Contemporary tailored blazer crafted from premium wool blend. Features structured shoulders and a modern slim fit.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#2C2C2C", "#4A4A4A", "#1A1A1A"],
    inStock: true,
  },
  // Additional mock products for demonstration
  {
    id: "4",
    name: "Crystal Drop Earrings",
    price: 85,
    image: jewelry1,
    category: "jewelry",
    description: "Sparkling crystal drop earrings with gold-plated settings.",
    colors: ["#FFD700"],
    inStock: true,
  },
  {
    id: "5",
    name: "Cashmere Wrap Top",
    price: 165,
    image: dress1,
    category: "clothes",
    description: "Luxurious cashmere wrap top with three-quarter sleeves.",
    sizes: ["XS", "S", "M", "L"],
    colors: ["#F5F5DC", "#DDA0DD", "#F0E68C"],
    inStock: true,
  },
  {
    id: "6",
    name: "Statement Ring Set",
    price: 95,
    image: jewelry1,
    category: "jewelry",
    description: "Bold statement ring set featuring geometric designs.",
    colors: ["#FFD700", "#C0C0C0"],
    inStock: false,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = (limit: number = 4): Product[] => {
  return products.slice(0, limit);
};