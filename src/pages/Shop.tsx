import { useState, useEffect } from "react";
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
import { Filter, X, Search, RefreshCw, Grid3x3, LayoutGrid, SlidersHorizontal, TrendingUp, Star, Package } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { data: products = [], isLoading, refetch } = useProducts();

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4'>('grid-3');
  const productsPerPage = 12;

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    priceRange: [0, 500],
    sortBy: sortBy,
    inStock: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  useEffect(() => {
    if (!products.length) return;
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category ID
    if (filters.category !== "all") {
      result = result.filter(
        (product) => product.category_id === filters.category
      );
    }

    // Filter by price range
    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Filter by stock
    if (filters.inStock) {
      result = result.filter((product) => product.stock_quantity > 0);
    }

    // Sort products
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return (
            new Date((b as any).created_at || 0).getTime() -
            new Date((a as any).created_at || 0).getTime()
          );
        case "featured":
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, products, searchQuery]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    // Update URL params for category
    if (key === "category") {
      if (value === "all") {
        searchParams.delete("category");
      } else {
        searchParams.set("category", value);
      }
      setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      priceRange: [0, 500],
      sortBy: "name",
      inStock: false,
    });
    setSearchQuery("");
    setSearchParams({});
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-8 md:mb-12 text-center">
          <div className="inline-block mb-3 md:mb-4">
            <Badge variant="outline" className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-light tracking-wider">
              <Star className="h-3 w-3 mr-1.5 md:mr-2 inline" />
              Premium Collection
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wider text-primary mb-3 md:mb-4 px-4">
            Shop Our Collection
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-light max-w-2xl mx-auto px-4">
            Discover our carefully curated selection of luxury fashion and jewelry
          </p>
          <Separator className="mt-6 md:mt-8 max-w-xs mx-auto" />
        </div>

        {/* Search and Quick Stats */}
        <div className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-card border border-border/50 rounded-lg p-3 md:p-4 text-center">
              <Package className="h-4 md:h-5 w-4 md:w-5 mx-auto mb-1.5 md:mb-2 text-muted-foreground" />
              <div className="text-xl md:text-2xl font-light text-primary">{products.length}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Total Products</div>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-3 md:p-4 text-center">
              <Filter className="h-4 md:h-5 w-4 md:w-5 mx-auto mb-1.5 md:mb-2 text-muted-foreground" />
              <div className="text-xl md:text-2xl font-light text-primary">{filteredProducts.length}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Filtered</div>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-3 md:p-4 text-center">
              <TrendingUp className="h-4 md:h-5 w-4 md:w-5 mx-auto mb-1.5 md:mb-2 text-muted-foreground" />
              <div className="text-xl md:text-2xl font-light text-primary">{categories.length}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Categories</div>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-3 md:p-4 text-center">
              <Star className="h-4 md:h-5 w-4 md:w-5 mx-auto mb-1.5 md:mb-2 text-accent" />
              <div className="text-xl md:text-2xl font-light text-primary">{products.filter(p => p.is_featured).length}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Featured</div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Mobile Filter Toggle */}
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

          {/* Filters Panel */}
          <div
            className={`lg:w-72 space-y-6 ${showFilters || "hidden lg:block"}`}
          >
            <div className="bg-card p-6 rounded-lg border-2 border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-accent" />
                  <h3 className="text-xl font-light">Filters</h3>
                </div>
                {(filters.category !== 'all' || filters.inStock || searchQuery || filters.priceRange[0] !== 0 || filters.priceRange[1] !== 500) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              <Separator className="mb-6" />

              {/* Category Filter */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-semibold text-foreground">
                  Price Range
                </label>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span className="font-medium">${filters.priceRange[0]}</span>
                  <span className="font-medium">${filters.priceRange[1]}</span>
                </div>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    handleFilterChange("priceRange", value)
                  }
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* In Stock Filter */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) =>
                      handleFilterChange("inStock", e.target.checked)
                    }
                    className="rounded border-border w-5 h-5 text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    <Package className="h-4 w-4 inline mr-1" />
                    In Stock Only
                  </span>
                </label>
              </div>
              
              {/* Active Filters Summary */}
              {(filters.category !== 'all' || filters.inStock || searchQuery) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">ACTIVE FILTERS</div>
                  <div className="flex flex-wrap gap-2">
                    {filters.category !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.id === filters.category)?.name || 'Category'}
                      </Badge>
                    )}
                    {filters.inStock && (
                      <Badge variant="secondary" className="text-xs">In Stock</Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="secondary" className="text-xs">Search: {searchQuery.slice(0, 15)}...</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar: Sort, View Mode, Results */}
            <div className="bg-card border border-border/50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex flex-col gap-3">
                {/* Results Count */}
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Showing </span>
                    <span className="font-semibold text-foreground">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-semibold text-foreground">{filteredProducts.length}</span>
                  </span>
                  
                  {/* View Mode Toggle - Desktop Only */}
                  <div className="hidden lg:flex items-center gap-1 border border-border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid-3' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid-3')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid-4' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid-4')}
                      className="h-8 w-8 p-0"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Sort Dropdown - Full Width on Mobile */}
                <div className="w-full">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">
                        <Star className="h-4 w-4 inline mr-2" />
                        Featured First
                      </SelectItem>
                      <SelectItem value="newest">
                        <TrendingUp className="h-4 w-4 inline mr-2" />
                        Newest Arrivals
                      </SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${viewMode === 'grid-4' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mt-6 md:mt-8">
                <div className="flex flex-col gap-4">
                  {/* Page Info - Mobile */}
                  <div className="flex justify-between items-center text-xs md:text-sm text-muted-foreground">
                    <span>
                      Page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>
                    <span className="hidden sm:inline">
                      {filteredProducts.length} total
                    </span>
                  </div>
                  
                  {/* Pagination Controls */}
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
                      {[...Array(Math.min(totalPages, window.innerWidth < 640 ? 3 : 5))].map((_, index) => {
                        let pageNum;
                        const maxPages = window.innerWidth < 640 ? 3 : 5;
                        if (totalPages <= maxPages) {
                          pageNum = index + 1;
                        } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                          pageNum = totalPages - maxPages + 1 + index;
                        } else {
                          pageNum = currentPage - Math.floor(maxPages / 2) + index;
                        }
                        
                        return (
                          <Button
                            key={index}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => paginate(pageNum)}
                            className="min-w-[36px] md:min-w-[40px] h-9 md:h-10 px-2 md:px-3"
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
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

            {/* No Products Message */}
            {filteredProducts.length === 0 && (
              <div className="bg-card border-2 border-dashed border-border/50 rounded-lg text-center py-12 md:py-20 px-4">
                <Package className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-3 md:mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl md:text-2xl font-light text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button onClick={() => setSearchQuery('')} className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
