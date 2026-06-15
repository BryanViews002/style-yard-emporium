import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  X,
  Search,
  RefreshCw,
  Grid3x3,
  LayoutGrid,
  SlidersHorizontal,
  TrendingUp,
  Star,
  Package,
} from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import {
  filterProducts,
  formatNaira,
  getCategoryLabel,
  getPriceCeiling,
  normalizeCategorySlug,
  SHOP_CATEGORIES,
  type ProductSortKey,
  type ShopCategoryFilter,
} from "@/lib/catalog";

const PRODUCTS_PER_PAGE = 12;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const categoryFromUrl = normalizeCategorySlug(categoryParam) ?? "all";
  const { addToCart } = useCart();
  const { data: products = [], isLoading, refetch } = useProducts();
  const { data: categories = [] } = useCategories();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSortKey>("featured");
  const [viewMode, setViewMode] = useState<"grid-3" | "grid-4">("grid-3");
  const [category, setCategory] =
    useState<ShopCategoryFilter>(categoryFromUrl);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [inStock, setInStock] = useState(false);
  const [gender, setGender] = useState<string>("all");

  const priceCeiling = useMemo(() => getPriceCeiling(products), [products]);
  const activePriceRange = priceRange ?? [0, priceCeiling];

  useEffect(() => {
    setCategory(categoryFromUrl);
    setCurrentPage(1);
  }, [categoryFromUrl]);

  const filteredProducts = useMemo(() => {
    let result = filterProducts(products, categories, {
      category,
      searchQuery,
      priceRange,
      inStock,
      sortBy,
    });
    // Apply gender filter on top
    if (gender !== "all") {
      result = result.filter((p) => (p as any).gender === gender);
    }
    return result;
  }, [category, categories, gender, inStock, priceRange, products, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, inStock, priceRange, searchQuery, sortBy]);

  const updateCategory = (value: ShopCategoryFilter) => {
    setCategory(value);

    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", value);
    }

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setCategory("all");
    setSearchQuery("");
    setPriceRange(null);
    setInStock(false);
    setGender("all");
    setSearchParams({});
  };

  const hasActiveFilters =
    category !== "all" ||
    inStock ||
    gender !== "all" ||
    Boolean(searchQuery.trim()) ||
    priceRange !== null;

  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const firstVisibleProduct =
    filteredProducts.length === 0 ? 0 : indexOfFirstProduct + 1;
  const lastVisibleProduct = Math.min(
    indexOfLastProduct,
    filteredProducts.length
  );
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 640 : false;
  // A simple re-eval on resize could be added, but for now we'll rely on the existing logic
  // or use an effect. Let's use a resize event listener.
  const [pageButtonCount, setPageButtonCount] = useState(isMobile ? 3 : 5);

  useEffect(() => {
    const handleResize = () => setPageButtonCount(window.innerWidth < 640 ? 3 : 5);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categoryTitle =
    category === "all" ? "Shop Our Collection" : `${getCategoryLabel(category)} Collection`;

  const productGridRef = useRef<HTMLDivElement>(null);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of product grid
    setTimeout(() => {
      productGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16 text-center">
          <div className="inline-block mb-4 md:mb-6">
            <Badge
              variant="outline"
              className="px-4 py-2 text-xs md:text-sm font-medium tracking-widest uppercase bg-transparent border-primary/20 text-primary"
            >
              <Star className="h-3 w-3 mr-2 inline" />
              Premium Collection
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tight text-primary mb-4 md:mb-6 px-4">
            {categoryTitle}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-sans max-w-2xl mx-auto px-4">
            Discover our carefully curated selection of luxury fashion and
            jewelry.
          </p>
          <Separator className="mt-6 md:mt-8 max-w-xs mx-auto" />
        </div>

        <div className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 md:pl-12 h-12 md:h-14 text-sm md:text-base border-2 focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex-1 h-12 md:h-14"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-card border border-border/50 rounded px-2 py-2 text-center">
              <div className="text-base font-light text-primary">{products.length}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Total</div>
            </div>
            <div className="bg-card border border-border/50 rounded px-2 py-2 text-center">
              <div className="text-base font-light text-primary">{filteredProducts.length}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Showing</div>
            </div>
            <div className="bg-card border border-border/50 rounded px-2 py-2 text-center">
              <div className="text-base font-light text-primary">{SHOP_CATEGORIES.length}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Categories</div>
            </div>
            <div className="bg-card border border-border/50 rounded px-2 py-2 text-center">
              <div className="text-base font-light text-primary">{products.filter((p) => p.is_featured).length}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Featured</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          <div
            className={`lg:w-56 space-y-4 ${
              showFilters || "hidden lg:block"
            }`}
          >
            <div className="bg-card p-4 rounded-lg border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-semibold">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs h-7 px-2"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <Separator className="mb-4" />

              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <LayoutGrid className="h-3 w-3" />
                  Category
                </label>
                <Select
                  value={category}
                  onValueChange={(value) =>
                    updateCategory(value as ShopCategoryFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {SHOP_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-foreground">Price Range</label>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span className="font-medium">
                    {formatNaira(activePriceRange[0])}
                  </span>
                  <span className="font-medium">
                    {formatNaira(activePriceRange[1])}
                  </span>
                </div>
                <Slider
                  value={activePriceRange}
                  onValueChange={(value) =>
                    setPriceRange([value[0], value[1]] as [number, number])
                  }
                  max={priceCeiling}
                  min={0}
                  step={priceCeiling > 10000 ? 1000 : 100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(event) => setInStock(event.target.checked)}
                    className="rounded border-border w-4 h-4 text-accent focus:ring-accent"
                  />
                  <span className="text-xs font-medium text-foreground group-hover:text-accent transition-colors">
                    <Package className="h-3 w-3 inline mr-1" />
                    In Stock Only
                  </span>
                </label>
              </div>

              {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">
                    ACTIVE FILTERS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(category)}
                      </Badge>
                    )}
                    {inStock && (
                      <Badge variant="secondary" className="text-xs">
                        In Stock
                      </Badge>
                    )}
                    {gender !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Badge>
                    )}
                    {priceRange && (
                      <Badge variant="secondary" className="text-xs">
                        Price
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="secondary" className="text-xs">
                        Search: {searchQuery.slice(0, 15)}
                        {searchQuery.length > 15 ? "..." : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-card border border-border/50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {filteredProducts.length === 0 ? (
                      "No products to show"
                    ) : (
                      <>
                        <span className="hidden sm:inline">Showing </span>
                        <span className="font-semibold text-foreground">
                          {firstVisibleProduct}-{lastVisibleProduct}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-foreground">
                          {filteredProducts.length}
                        </span>
                      </>
                    )}
                  </span>

                  <div className="hidden lg:flex items-center gap-1 border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid-3" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid-3")}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid-4" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid-4")}
                      className="h-8 w-8 p-0"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="w-full">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as ProductSortKey)}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured First</SelectItem>
                      <SelectItem value="newest">Newest Arrivals</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Gender Tab Bar — shown for clothes, bags, perfumes & all */}
            {(category === "clothes" || category === "bags" || category === "perfumes" || category === "all") && (
              <div className="mb-6" ref={productGridRef}>
                <div className="flex border-b border-[--c-bone]">
                  {(["all", "men", "women", "unisex"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`relative px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-colors ${
                        gender === g
                          ? "text-[--c-void]"
                          : "text-[--c-stone] hover:text-[--c-void]"
                      }`}
                    >
                      {g === "all" ? "All" : g === "men" ? "Men" : g === "women" ? "Women" : "Unisex"}
                      {gender === g && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[--c-void]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`grid grid-cols-2 sm:grid-cols-2 ${
                viewMode === "grid-4" ? "lg:grid-cols-4" : "lg:grid-cols-3"
              } gap-3 sm:gap-6 mb-8`}
            >
              {currentProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in hover-lift"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} onAddToCart={addToCart} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mt-6 md:mt-8">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs md:text-sm text-muted-foreground">
                    <span>
                      Page{" "}
                      <span className="font-semibold text-foreground">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {totalPages}
                      </span>
                    </span>
                    <span className="hidden sm:inline">
                      {filteredProducts.length} total
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 md:h-10 px-3 md:px-4"
                      size="sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>

                    <div className="flex gap-1">
                      {[...Array(Math.min(totalPages, pageButtonCount))].map(
                        (_, index) => {
                          let pageNum;
                          if (totalPages <= pageButtonCount) {
                            pageNum = index + 1;
                          } else if (
                            currentPage <= Math.floor(pageButtonCount / 2) + 1
                          ) {
                            pageNum = index + 1;
                          } else if (
                            currentPage >=
                            totalPages - Math.floor(pageButtonCount / 2)
                          ) {
                            pageNum = totalPages - pageButtonCount + 1 + index;
                          } else {
                            pageNum =
                              currentPage -
                              Math.floor(pageButtonCount / 2) +
                              index;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              onClick={() => paginate(pageNum)}
                              className="min-w-[36px] md:min-w-[40px] h-9 md:h-10 px-2 md:px-3"
                              size="sm"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 md:h-10 px-3 md:px-4"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="bg-card border-2 border-dashed border-border/50 rounded-lg text-center py-12 md:py-20 px-4">
                <Package className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-3 md:mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl md:text-2xl font-light text-foreground mb-2">
                  {hasActiveFilters
                    ? "No products found"
                    : "No products are available yet"}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "We couldn't find products that match those filters."
                    : "New products will appear here as soon as they are added."}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
