import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";
import { motion } from "framer-motion";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505]">
      {/* Background Image Parallax layer */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-full lg:w-[65%] z-0"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div
          className={`absolute inset-0 bg-[#050505] transition-opacity duration-1000 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={heroBanner}
          alt="The Style Yard Fashion Collection"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="eager"
          fetchPriority="high"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Soft edge gradient to blend image into the dark background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent lg:via-[#050505]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </motion.div>

      {/* Editorial Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center pt-20">
        <div className="w-full lg:w-3/5 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <span className="text-premium-gold uppercase tracking-[0.3em] text-xs font-semibold">The New Standard</span>
          </motion.div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-playfair text-white leading-[0.9] tracking-tighter mb-8 mix-blend-difference">
            <motion.span 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block"
            >
              Beyond
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="block italic text-transparent bg-clip-text bg-gradient-to-r from-premium-gold to-[#f3e5ab]"
            >
              Luxury
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-gray-400 font-light max-w-md leading-relaxed mb-12 border-l border-premium-gold/30 pl-6"
          >
            Curated contemporary fashion, bespoke jewelry, and exquisite fragrances designed for those who command the room.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/shop?category=clothes">
              <Button size="lg" className="rounded-none bg-white text-black hover:bg-premium-gold hover:text-black transition-colors duration-500 h-14 px-8 text-xs tracking-[0.2em] uppercase group">
                Clothes
                <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <Link to="/shop?category=jewelry">
              <Button size="lg" variant="outline" className="rounded-none border-white/20 text-white hover:bg-white hover:text-black transition-colors duration-500 h-14 px-8 text-xs tracking-[0.2em] uppercase backdrop-blur-sm">
                Jewelry
              </Button>
            </Link>
            <Link to="/shop?category=bags">
              <Button size="lg" variant="outline" className="rounded-none border-white/20 text-white hover:bg-white hover:text-black transition-colors duration-500 h-14 px-8 text-xs tracking-[0.2em] uppercase backdrop-blur-sm">
                Bags
              </Button>
            </Link>
            <Link to="/shop?category=perfumes">
              <Button size="lg" variant="outline" className="rounded-none border-white/20 text-white hover:bg-white hover:text-black transition-colors duration-500 h-14 px-8 text-xs tracking-[0.2em] uppercase backdrop-blur-sm">
                Perfumes
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-10 right-10 md:right-auto md:left-1/2 md:transform md:-translate-x-1/2 flex flex-col items-center z-20"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4 rotate-90 md:rotate-0 origin-bottom">Scroll</span>
        <div className="w-[1px] h-16 bg-gray-800 relative overflow-hidden">
          <motion.div 
            className="w-full h-1/2 bg-premium-gold absolute top-0"
            animate={{ top: ['-50%', '150%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

