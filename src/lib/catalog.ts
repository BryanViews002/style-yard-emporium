export const SHOP_CATEGORIES = [
  {
    name: "Clothes",
    slug: "clothes",
    description: "Clothing collection",
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Jewelry collection",
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Premium bags and accessories",
  },
  {
    name: "Perfumes",
    slug: "perfumes",
    description: "Luxury fragrances and perfumes",
  },
] as const;

export type ShopCategorySlug = (typeof SHOP_CATEGORIES)[number]["slug"];
export type ShopCategoryFilter = ShopCategorySlug | "all";
export type ProductSortKey =
  | "featured"
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

export interface CategoryRecord {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
}

export interface CatalogProductLike {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  category_slug?: string | null;
  category_id?: string | null;
  categories?: CategoryRecord | CategoryRecord[] | null;
  description?: string | null;
  stock_quantity?: number | null;
  inStock?: boolean;
  is_featured?: boolean;
  created_at?: string | null;
}

export interface CatalogFilters {
  category?: string | null;
  searchQuery?: string;
  priceRange?: [number, number] | null;
  inStock?: boolean;
  sortBy?: ProductSortKey;
}

const CATEGORY_ALIASES: Record<string, ShopCategoryFilter> = {
  all: "all",
  shop: "all",
  collection: "all",
  collections: "all",
  clothes: "clothes",
  clothing: "clothes",
  cloth: "clothes",
  fashion: "clothes",
  apparel: "clothes",
  wear: "clothes",
  wears: "clothes",
  jewelry: "jewelry",
  jewellery: "jewelry",
  jewelery: "jewelry",
  jewerky: "jewelry",
  jewels: "jewelry",
  accessories: "jewelry",
  bags: "bags",
  bag: "bags",
  handbag: "bags",
  handbags: "bags",
  purse: "bags",
  purses: "bags",
  tote: "bags",
  totes: "bags",
  perfumes: "perfumes",
  perfume: "perfumes",
  fragrance: "perfumes",
  fragrances: "perfumes",
  scent: "perfumes",
  scents: "perfumes",
  cologne: "perfumes",
};

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeCategorySlug = (
  value?: string | null
): ShopCategoryFilter | null => {
  if (!value) return null;

  const slug = slugify(value);
  return CATEGORY_ALIASES[slug] ?? null;
};

export const getCategoryLabel = (category?: string | null) => {
  const slug = normalizeCategorySlug(category);
  const match = SHOP_CATEGORIES.find((item) => item.slug === slug);
  return match?.name ?? "Uncategorized";
};

export const buildCategoryLookup = (categories: CategoryRecord[] = []) => {
  const lookup = new Map<string, ShopCategorySlug>();

  SHOP_CATEGORIES.forEach((category) => {
    lookup.set(category.slug, category.slug);
    lookup.set(category.name.toLowerCase(), category.slug);
  });

  categories.forEach((category) => {
    const normalized =
      normalizeCategorySlug(category.slug) ?? normalizeCategorySlug(category.name);

    if (!normalized || normalized === "all") return;

    [category.id, category.slug, category.name].forEach((value) => {
      if (value) {
        lookup.set(value, normalized);
        lookup.set(slugify(value), normalized);
      }
    });
  });

  return lookup;
};

export const getRelatedCategory = (product: CatalogProductLike) => {
  if (Array.isArray(product.categories)) {
    return product.categories[0] ?? null;
  }

  return product.categories ?? null;
};

export const resolveProductCategorySlug = (
  product: CatalogProductLike,
  categories: CategoryRecord[] | Map<string, ShopCategorySlug> = []
): ShopCategorySlug | null => {
  if (product.category_slug) {
    const normalized = normalizeCategorySlug(product.category_slug);
    if (normalized && normalized !== "all") return normalized;
  }

  const lookup =
    categories instanceof Map ? categories : buildCategoryLookup(categories);
  const relatedCategory = getRelatedCategory(product);
  const candidates = [
    product.category_id,
    relatedCategory?.id,
    relatedCategory?.slug,
    relatedCategory?.name,
    product.category,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const direct = lookup.get(candidate) ?? lookup.get(slugify(candidate));
    if (direct) return direct;

    const normalized = normalizeCategorySlug(candidate);
    if (normalized && normalized !== "all") return normalized;
  }

  return null;
};

export const getProductCategoryLabel = (
  product: CatalogProductLike,
  categories: CategoryRecord[] | Map<string, ShopCategorySlug> = []
) => getCategoryLabel(resolveProductCategorySlug(product, categories));

export const parseListInput = (value?: string | null) => {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
};

export const createProductSlug = (name: string) => slugify(name);

export const getPriceCeiling = (products: CatalogProductLike[]) => {
  const highestPrice = products.reduce(
    (max, product) => Math.max(max, Number(product.price) || 0),
    0
  );

  if (highestPrice <= 0) return 1000;
  return Math.max(1000, Math.ceil(highestPrice / 1000) * 1000);
};

export const formatNaira = (value: number | string | null | undefined) => {
  const amount = Number(value) || 0;
  const hasDecimals = !Number.isInteger(amount);

  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  })}`;
};

export const filterProducts = <TProduct extends CatalogProductLike>(
  products: TProduct[],
  categories: CategoryRecord[] = [],
  filters: CatalogFilters = {}
) => {
  const categoryFilter = normalizeCategorySlug(filters.category) ?? "all";
  const searchQuery = filters.searchQuery?.trim().toLowerCase() ?? "";
  const categoryLookup = buildCategoryLookup(categories);

  const result = products.filter((product) => {
    const categorySlug = resolveProductCategorySlug(product, categoryLookup);
    const categoryLabel = getCategoryLabel(categorySlug);

    if (categoryFilter !== "all" && categorySlug !== categoryFilter) {
      return false;
    }

    if (searchQuery) {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        categoryLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(searchQuery)) return false;
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      const price = Number(product.price) || 0;
      if (price < min || price > max) return false;
    }

    if (filters.inStock) {
      const hasStock =
        product.inStock !== false &&
        (product.stock_quantity === undefined ||
          product.stock_quantity === null ||
          product.stock_quantity > 0);
      if (!hasStock) return false;
    }

    return true;
  });

  const sortBy = filters.sortBy ?? "featured";

  return [...result].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number(a.price) - Number(b.price);
      case "price-high":
        return Number(b.price) - Number(a.price);
      case "newest":
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        return Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured));
    }
  });
};
