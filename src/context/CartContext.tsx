import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/components/ProductCard";
import { toast } from "sonner";

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.stock_quantity != null ? Math.min(item.quantity + quantity, item.stock_quantity) : item.quantity + quantity }
            : item
        );
      }

      const initialQuantity = product.stock_quantity != null ? Math.min(quantity, product.stock_quantity) : quantity;
      return [...prevItems, { ...product, quantity: initialQuantity, selectedSize: size, selectedColor: color }];
    });

    toast.success("Added to cart", {
      description: `${quantity}x ${product.name} has been added to your cart.`
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setItems(prevItems => prevItems.filter(item => 
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
          const newQuantity = item.stock_quantity != null ? Math.min(quantity, item.stock_quantity) : quantity;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};