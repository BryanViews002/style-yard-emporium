import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  getProductCategoryLabel,
  resolveProductCategorySlug,
  type ShopCategorySlug,
} from "@/lib/catalog";

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
  slug?: string;
  stock_quantity?: number;
  is_featured?: boolean;
  category_id?: string;
  category_slug?: ShopCategorySlug | null;
  sku?: string;
  brand?: string;
  size_options?: string[];
  color_options?: string[];
  created_at?: string;
  gender?: string | null;
}

export const useProducts = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleProductsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    window.addEventListener("productsUpdated", handleProductsUpdate);
    return () =>
      window.removeEventListener("productsUpdated", handleProductsUpdate);
  }, [queryClient]);

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories:category_id(id, name, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((product: any) => {
        const categorySlug = resolveProductCategorySlug(product);

        return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        category: getProductCategoryLabel(product),
        category_slug: categorySlug,
        description: product.description,
        sizes: product.size_options || [],
        colors: product.color_options || [],
        inStock: product.stock_quantity == null || product.stock_quantity > 0,
        slug: product.slug,
        stock_quantity: product.stock_quantity,
        is_featured: product.is_featured,
        category_id: product.category_id,
        sku: product.sku,
        brand: product.brand,
        created_at: product.created_at,
        gender: product.gender ?? null,
        };
      }) as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("products")
        .select("*, categories:category_id(id, name, slug)")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const categorySlug = resolveProductCategorySlug(data as any);

      return {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        image: data.image,
        category: getProductCategoryLabel(data as any),
        category_slug: categorySlug,
        description: data.description,
        sizes: data.size_options || [],
        colors: data.color_options || [],
        inStock: data.stock_quantity == null || data.stock_quantity > 0,
        slug: data.slug,
        stock_quantity: data.stock_quantity,
        is_featured: data.is_featured,
        category_id: data.category_id,
        sku: data.sku,
        brand: data.brand,
        gender: (data as any).gender ?? null,
      } as Product;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};
