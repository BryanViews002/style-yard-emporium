import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const categories = [
  {
    label: "Clothes",
    sub: "Ready to Wear",
    href: "/shop?category=clothes",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    span: "md:col-span-8 md:row-span-2",
    textSize: "text-5xl md:text-7xl",
    gradDir: "bg-gradient-to-br from-black/80 via-black/40 to-transparent",
    align: "justify-between",
    showArrow: true,
  },
  {
    label: "Jewelry",
    sub: "Fine Accessories",
    href: "/shop?category=jewelry",
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop",
    span: "md:col-span-4 md:row-span-2",
    textSize: "text-4xl",
    gradDir: "bg-gradient-to-t from-black/90 via-black/20 to-transparent",
    align: "justify-between",
    showArrow: true,
  },
  {
    label: "Bags",
    sub: "Leather Goods",
    href: "/shop?category=bags",
    img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2015&auto=format&fit=crop",
    span: "md:col-span-6 md:row-span-1",
    textSize: "text-3xl",
    gradDir: "bg-gradient-to-r from-black/80 to-transparent",
    align: "justify-center",
    showArrow: false,
  },
  {
    label: "Perfumes",
    sub: "Signature Scents",
    href: "/shop?category=perfumes",
    img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1974&auto=format&fit=crop",
    span: "md:col-span-6 md:row-span-1",
    textSize: "text-3xl",
    gradDir: "bg-gradient-to-l from-black/80 to-transparent",
    align: "justify-center items-end text-right",
    showArrow: false,
  },
];

const Home = () => {
  const { addToCart } = useCart();
  const { data: allProducts = [] } = useProducts();
  const featuredProducts = allProducts.filter((p) => p.is_featured).slice(0, 4);

  const catRef = useRef(null);
  const featRef = useRef(null);
  const ctaRef = useRef(null);
  const catInView = useInView(catRef, { once: true, margin: "-80px" });
  const featInView = useInView(featRef, { once: true, margin: "-80px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Hero />

      {/* ── Categories — Editorial Bento Grid ──────────────────────── */}
      <section ref={catRef} className="py-32 bg-[#050505] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={catInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9 }}
              className="max-w-lg"
            >
              <span className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-4 block">
                The Collections
              </span>
              <h2 className="heading-editorial text-5xl md:text-7xl text-white">
                Curated for the{" "}
                <em className="text-[#D4AF37]">Exceptional</em>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={catInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="text-white/35 font-light text-sm max-w-xs md:text-right leading-loose"
            >
              Carefully selected pieces that blend contemporary design with enduring elegance.
            </motion.p>
          </div>

          {/* Bento grid */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={catInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 auto-rows-[280px]"
          >
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                to={cat.href}
                className={`group relative overflow-hidden bg-[#0d0d0d] border border-white/[0.04] hover:border-[#D4AF37]/20 ${cat.span} transition-all duration-700`}
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 ease-out"
                  />
                </div>
                {/* Gradient overlay */}
                <div className={`absolute inset-0 z-10 ${cat.gradDir} transition-opacity duration-500 group-hover:opacity-70`} />

                {/* Gold shimmer border on hover */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 60%)" }}
                />

                {/* Content */}
                <div className={`relative z-20 h-full flex flex-col ${cat.align} p-8 md:p-10`}>
                  {cat.showArrow && (
                    <div className="self-end">
                      <motion.div
                        initial={false}
                        className="w-10 h-10 border border-white/20 group-hover:border-[#D4AF37]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-500"
                      >
                        <ArrowRight className="h-4 w-4 text-white group-hover:text-[#D4AF37] transition-colors" />
                      </motion.div>
                    </div>
                  )}
                  <div>
                    <h3 className={`font-playfair font-light tracking-wide text-white mb-2 ${cat.textSize}`}>
                      {cat.label}
                    </h3>
                    <p className="text-[#D4AF37]/60 text-[10px] tracking-[0.3em] uppercase">
                      {cat.sub}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="divider-gold w-full" />
      </div>

      {/* ── Featured Products ────────────────────────────────────────── */}
      <section ref={featRef} className="py-32 bg-[#050505] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={featInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9 }}
            >
              <span className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-4 block">New Arrivals</span>
              <h2 className="heading-editorial text-5xl md:text-6xl text-white">
                Pieces That <em className="text-white/40">Command</em>
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={featInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <Link
                to="/shop"
                className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-[#D4AF37] transition-colors duration-400 group"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>

          {featuredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={featInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={featInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 * i + 0.3 }}
                >
                  <ProductCard product={product} onAddToCart={addToCart} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-white/20 text-sm tracking-widest uppercase">
              Products coming soon
            </div>
          )}
        </div>
      </section>

      {/* ── Full-width CTA ───────────────────────────────────────────── */}
      <section ref={ctaRef} className="relative overflow-hidden py-40 bg-[#080808]">
        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full" style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)"
          }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <span className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-8 block">
              Stay Elevated
            </span>
            <h2 className="heading-editorial text-5xl md:text-8xl text-white mb-8 leading-none">
              Style is a <br />
              <em className="text-shimmer">Language.</em>
            </h2>
            <p className="text-white/30 font-light text-lg max-w-md mx-auto mb-14 leading-relaxed">
              Join the inner circle. Get first access to new collections, exclusive drops and private previews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-5 py-4 bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors duration-300 text-sm"
              />
              <button className="btn-hero px-8 py-4">
                Join Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
