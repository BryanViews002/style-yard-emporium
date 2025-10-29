import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const { addToCart } = useCart();
  const { data: allProducts = [] } = useProducts();
  const featuredProducts = allProducts.filter((p) => p.is_featured).slice(0, 4);
  const [categoryIds, setCategoryIds] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      
      if (data) {
        const categoryMap: { [key: string]: string } = {};
        data.forEach((cat) => {
          categoryMap[cat.name.toLowerCase()] = cat.id;
        });
        setCategoryIds(categoryMap);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Featured Categories */}
      <section className="py-20 bg-gradient-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-light tracking-wider text-primary mb-6">
              Explore Our Collections
            </h2>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              Discover carefully curated pieces that blend contemporary design
              with timeless elegance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Clothes Category */}
            <Link
              to={categoryIds.clothes ? `/shop?category=${categoryIds.clothes}` : "/shop"}
              className="group relative overflow-hidden rounded-lg luxury-hover"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-3xl font-light tracking-wider text-primary mb-4">
                    CLOTHES
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Contemporary fashion for every occasion
                  </p>
                  <Button
                    variant="outline"
                    className="group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Shop Clothes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>

            {/* Jewelry Category */}
            <Link
              to={categoryIds.jewelry ? `/shop?category=${categoryIds.jewelry}` : "/shop"}
              className="group relative overflow-hidden rounded-lg luxury-hover"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-soft-rose to-luxury-rose/30 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-3xl font-light tracking-wider text-primary mb-4">
                    JEWELRY
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Exquisite pieces crafted with precision
                  </p>
                  <Button
                    variant="outline"
                    className="btn-gold group-hover:bg-premium-gold group-hover:text-primary"
                  >
                    Shop Jewelry
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-light tracking-wider text-primary mb-6">
              New Arrivals
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Fresh styles, just for you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="animate-fade-in-scale">
                <ProductCard product={product} onAddToCart={addToCart} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button size="lg" className="btn-hero">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 hero-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-wider text-hero-text mb-6">
            Stay In Style
          </h2>
          <p className="text-xl text-hero-text/80 mb-8 font-light">
            Subscribe to our newsletter for exclusive offers and style
            inspiration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded border border-hero-text/30 bg-hero-text/10 text-hero-text placeholder-hero-text/60 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button className="btn-gold">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
