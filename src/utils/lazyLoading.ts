import { lazy, ComponentType } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

// Higher-order component for lazy loading with loading fallback
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);

  const WrappedComponent = (props: P) => (
    <LoadingSpinner text="Loading..." fullScreen />
  );

  return LazyComponent;
};

// Lazy load page components
export const LazyHome = withLazyLoading(() => import("@/pages/Home"));
export const LazyShop = withLazyLoading(() => import("@/pages/Shop"));
export const LazyProductDetail = withLazyLoading(
  () => import("@/pages/ProductDetail")
);
export const LazyCart = withLazyLoading(() => import("@/pages/Cart"));
export const LazyCheckout = withLazyLoading(() => import("@/pages/Checkout"));
export const LazyOrders = withLazyLoading(() => import("@/pages/Orders"));
export const LazyWishlist = withLazyLoading(() => import("@/pages/Wishlist"));
export const LazyProfile = withLazyLoading(() => import("@/pages/Profile"));
export const LazyAuth = withLazyLoading(() => import("@/pages/Auth"));
export const LazyContact = withLazyLoading(() => import("@/pages/Contact"));
export const LazyNotFound = withLazyLoading(() => import("@/pages/NotFound"));

// Lazy load admin components
export const LazyAdminDashboard = withLazyLoading(
  () => import("@/pages/AdminDashboard")
);
export const LazyAdminProducts = withLazyLoading(
  () => import("@/pages/AdminProducts")
);
export const LazyAdminOrders = withLazyLoading(
  () => import("@/pages/AdminOrders")
);
export const LazyAdminUsers = withLazyLoading(
  () => import("@/pages/AdminUsers")
);
export const LazyAdminCategories = withLazyLoading(
  () => import("@/pages/AdminCategories")
);
export const LazyAdminAnalytics = withLazyLoading(
  () => import("@/pages/AdminAnalytics")
);
export const LazyAdminCoupons = withLazyLoading(
  () => import("@/pages/AdminCoupons")
);
export const LazyAdminInventory = withLazyLoading(
  () => import("@/pages/AdminInventory")
);

// Lazy load heavy components
export const LazyProductReview = withLazyLoading(
  () => import("@/components/ProductReview")
);
export const LazyImageUpload = withLazyLoading(
  () => import("@/components/ImageUpload")
);
export const LazyShippingCalculator = withLazyLoading(
  () => import("@/components/ShippingCalculator")
);
export const LazyShippingTracking = withLazyLoading(
  () => import("@/components/ShippingTracking")
);
