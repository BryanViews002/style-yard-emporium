import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/hooks/useAuth";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock Supabase client
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    ),
    signInWithPassword: vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    ),
    signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
  },
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  functions: {
    invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
};

// Mock user data
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
  },
};

// Mock product data
export const mockProduct = {
  id: "test-product-id",
  name: "Test Product",
  description: "A test product",
  price: 29.99,
  image: "https://example.com/image.jpg",
  stock_quantity: 10,
  is_featured: true,
  is_active: true,
  category_id: "test-category-id",
  sku: "TEST-SKU-001",
  brand: "Test Brand",
  size_options: ["S", "M", "L"],
  color_options: ["Red", "Blue", "Green"],
};

// Mock cart item
export const mockCartItem = {
  id: "test-product-id",
  name: "Test Product",
  price: 29.99,
  image: "https://example.com/image.jpg",
  quantity: 1,
  selectedSize: "M",
  selectedColor: "Red",
};

// Mock order data
export const mockOrder = {
  id: "test-order-id",
  order_number: "TSY-123456789",
  created_at: "2024-01-01T00:00:00Z",
  status: "pending",
  total_amount: 29.99,
  email: "test@example.com",
  shipping_address: {
    first_name: "Test",
    last_name: "User",
    address_line_1: "123 Test St",
    city: "Test City",
    state: "TS",
    postal_code: "12345",
    country: "US",
  },
  tracking_number: "TRACK123",
  tracking_url: "https://example.com/track/TRACK123",
  order_items: [
    {
      id: "test-order-item-id",
      product_snapshot: mockProduct,
      quantity: 1,
      total_price: 29.99,
    },
  ],
};

// Helper function to create mock context values
export const createMockContextValue = (overrides = {}) => ({
  user: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
});

// Helper function to create mock cart context
export const createMockCartContext = (overrides = {}) => ({
  items: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  getTotalPrice: vi.fn(() => 0),
  getTotalItems: vi.fn(() => 0),
  ...overrides,
});

// Helper function to create mock wishlist context
export const createMockWishlistContext = (overrides = {}) => ({
  wishlist: [],
  isLoading: false,
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  isInWishlist: vi.fn(() => false),
  clearWishlist: vi.fn(),
  ...overrides,
});

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
