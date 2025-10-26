import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test/utils";
import {
  createMockCartContext,
  createMockWishlistContext,
  mockProduct,
} from "../test/utils";
import ProductCard from "@/components/ProductCard";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    },
  },
}));

// Integration test for ProductCard
describe("ProductCard Integration", () => {
  it("displays product information correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockProduct.price.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(screen.getByAltText(mockProduct.name)).toBeInTheDocument();
  });

  it("handles add to cart interaction", async () => {
    const mockAddToCart = vi.fn();
    const mockCartContext = createMockCartContext({
      addToCart: mockAddToCart,
    });

    // Mock the cart context
    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    render(<ProductCard product={mockProduct} />);

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id, 1);
    });
  });

  it("handles wishlist interaction", async () => {
    const mockAddToWishlist = vi.fn();
    const mockWishlistContext = createMockWishlistContext({
      addToWishlist: mockAddToWishlist,
    });

    // Mock the wishlist context
    vi.doMock("@/context/WishlistContext", () => ({
      useWishlist: () => mockWishlistContext,
    }));

    render(<ProductCard product={mockProduct} />);

    const wishlistButton = screen.getByRole("button", {
      name: /add to wishlist/i,
    });
    fireEvent.click(wishlistButton);

    await waitFor(() => {
      expect(mockAddToWishlist).toHaveBeenCalledWith(mockProduct.id);
    });
  });
});

// Integration test for Cart page
describe("Cart Page Integration", () => {
  it("displays empty cart message when no items", () => {
    const mockCartContext = createMockCartContext({
      items: [],
    });

    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    render(<Cart />);

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("displays cart items when items exist", () => {
    const mockCartContext = createMockCartContext({
      items: [
        {
          ...mockProduct,
          quantity: 2,
          selectedSize: "M",
          selectedColor: "Red",
        },
      ],
    });

    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    render(<Cart />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("Size: M")).toBeInTheDocument();
    expect(screen.getByText("Color: Red")).toBeInTheDocument();
  });

  it("handles quantity updates", async () => {
    const mockUpdateQuantity = vi.fn();
    const mockCartContext = createMockCartContext({
      items: [
        {
          ...mockProduct,
          quantity: 1,
        },
      ],
      updateQuantity: mockUpdateQuantity,
    });

    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    render(<Cart />);

    const increaseButton = screen.getByRole("button", {
      name: /increase quantity/i,
    });
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(mockUpdateQuantity).toHaveBeenCalledWith(mockProduct.id, 2);
    });
  });

  it("handles item removal", async () => {
    const mockRemoveFromCart = vi.fn();
    const mockCartContext = createMockCartContext({
      items: [
        {
          ...mockProduct,
          quantity: 1,
        },
      ],
      removeFromCart: mockRemoveFromCart,
    });

    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    render(<Cart />);

    const removeButton = screen.getByRole("button", { name: /remove item/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith(mockProduct.id);
    });
  });
});

// Integration test for Wishlist page
describe("Wishlist Page Integration", () => {
  it("displays empty wishlist message when no items", () => {
    const mockWishlistContext = createMockWishlistContext({
      wishlist: [],
    });

    vi.doMock("@/context/WishlistContext", () => ({
      useWishlist: () => mockWishlistContext,
    }));

    render(<Wishlist />);

    expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
  });

  it("displays wishlist items when items exist", () => {
    const mockWishlistContext = createMockWishlistContext({
      wishlist: [
        {
          id: "wishlist-item-1",
          product_id: mockProduct.id,
          product_name: mockProduct.name,
          product_slug: "test-product",
          product_price: mockProduct.price,
          product_image: mockProduct.image,
          product_brand: mockProduct.brand,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    });

    vi.doMock("@/context/WishlistContext", () => ({
      useWishlist: () => mockWishlistContext,
    }));

    render(<Wishlist />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockProduct.price.toFixed(2)}`)
    ).toBeInTheDocument();
  });

  it("handles add to cart from wishlist", async () => {
    const mockAddToCart = vi.fn();
    const mockCartContext = createMockCartContext({
      addToCart: mockAddToCart,
    });

    const mockWishlistContext = createMockWishlistContext({
      wishlist: [
        {
          id: "wishlist-item-1",
          product_id: mockProduct.id,
          product_name: mockProduct.name,
          product_slug: "test-product",
          product_price: mockProduct.price,
          product_image: mockProduct.image,
          product_brand: mockProduct.brand,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    });

    vi.doMock("@/context/CartContext", () => ({
      useCart: () => mockCartContext,
    }));

    vi.doMock("@/context/WishlistContext", () => ({
      useWishlist: () => mockWishlistContext,
    }));

    render(<Wishlist />);

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id, 1);
    });
  });
});

// Integration test for error handling
describe("Error Handling Integration", () => {
  it("handles API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock a failing API call
    vi.doMock("@/integrations/supabase/client", () => ({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: null, error: { message: "API Error" } })
              ),
            })),
          })),
        })),
      },
    }));

    render(<ProductCard product={mockProduct} />);

    // The component should still render even if there's an API error
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("handles network errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock a network error
    vi.doMock("@/integrations/supabase/client", () => ({
      supabase: {
        from: vi.fn(() => {
          throw new Error("Network error");
        }),
      },
    }));

    render(<ProductCard product={mockProduct} />);

    // The component should still render even if there's a network error
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
