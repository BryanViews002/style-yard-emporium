import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { data: products = [], isLoading } = useProducts();
  
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    priceRange: [0, 500],
    sortBy: "name",
    inStock: false,
  });

  useEffect(() => {
    if (!products.length) return;
    let result = [...products];

    // Filter by category
    if (filters.category !== "all") {
      result = result.filter(product => product.category === filters.category);
    }

    // Filter by price range
    result = result.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Filter by stock
    if (filters.inStock) {
      result = result.filter(product => product.inStock !== false);
    }

    // Sort products
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(result);
  }, [filters, products]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
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
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-wider text-primary mb-4">
            {filters.category === "all" ? "All Products" : 
             filters.category === "clothes" ? "Clothing Collection" : 
             "Jewelry Collection"}
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            Discover our carefully curated selection
          </p>
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
          <div className={`lg:w-64 space-y-6 ${showFilters || "hidden lg:block"}`}>
            <div className="bg-card p-6 rounded-lg border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              {/* Category Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="clothes">Clothes</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange("priceRange", value)}
                  max={500}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* In Stock Filter */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm font-medium text-muted-foreground">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground">
                {filteredProducts.length} products
              </span>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="animate-fade-in-scale">
                  <ProductCard 
                    product={product}
                    onAddToCart={addToCart}
                  />
                </div>
              ))}
            </div>

            {/* No Products Message */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground font-light mb-4">
                  No products found matching your criteria
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;