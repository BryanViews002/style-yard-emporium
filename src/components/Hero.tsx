import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with blur-up placeholder */}
      <div className="absolute inset-0 z-0">
        {/* Low-quality placeholder while full image loads */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 transition-opacity duration-700 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={heroBanner}
          alt="The Style Yard Fashion Collection"
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-bg/80 via-hero-bg/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-light tracking-wider text-hero-text mb-6 leading-tight">
              Elevate Your
              <span className="block bg-gradient-to-r from-premium-gold to-accent bg-clip-text text-transparent">
                Style
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-hero-text/80 mb-8 font-light leading-relaxed">
              Discover our curated collection of contemporary fashion, luxury jewelry, 
              premium bags and exquisite fragrances.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop?category=clothes">
                <Button size="lg" className="btn-hero group">
                  Clothes
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/shop?category=jewelry">
                <Button size="lg" variant="outline" className="border-premium-gold/60 text-premium-gold hover:bg-premium-gold hover:text-primary backdrop-blur-sm">
                  Jewelry
                </Button>
              </Link>
              <Link to="/shop?category=bags">
                <Button size="lg" variant="outline" className="border-premium-gold/60 text-premium-gold hover:bg-premium-gold hover:text-primary backdrop-blur-sm">
                  Bags
                </Button>
              </Link>
              <Link to="/shop?category=perfumes">
                <Button size="lg" variant="outline" className="border-premium-gold/60 text-premium-gold hover:bg-premium-gold hover:text-primary backdrop-blur-sm">
                  Perfumes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-hero-text/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-hero-text/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

