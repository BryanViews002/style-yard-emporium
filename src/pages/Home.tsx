import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const categories = [
  {
    label: "Ready to Wear",
    tag:   "01 — Clothing",
    href:  "/shop?category=clothes",
    img:   "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    desc:  "A meticulous study in form, cut, and absolute necessity. Each piece is precision-engineered for the modern wardrobe.",
  },
  {
    label: "Fine Accessories",
    tag:   "02 — Jewellery",
    href:  "/shop?category=jewelry",
    img:   "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop",
    desc:  "Ornaments stripped of excess — defined by weight, permanence, and quiet authority.",
  },
  {
    label: "Leather Goods",
    tag:   "03 — Bags",
    href:  "/shop?category=bags",
    img:   "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2015&auto=format&fit=crop",
    desc:  "Structural integrity meets raw material. Designed not just to carry, but to anchor an aesthetic.",
  },
  {
    label: "Signature Scents",
    tag:   "04 — Perfumes",
    href:  "/shop?category=perfumes",
    img:   "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1974&auto=format&fit=crop",
    desc:  "Olfactory architecture. Fragrances that construct an invisible, indelible, permanent presence.",
  },
];

const marqueeItems = [
  "The Style Yard", "Lagos Fashion", "SS 2026", "Precision Made",
  "Fine Accessories", "Curated Collection", "Premium Quality",
  "The Style Yard", "Lagos Fashion", "SS 2026", "Precision Made",
  "Fine Accessories", "Curated Collection", "Premium Quality",
];

const CategoryBlock = ({ cat, index }: { cat: typeof categories[0]; index: number }) => {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-stretch gap-0`}>
      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
        className="w-full md:w-[55%] aspect-[4/5] md:aspect-auto overflow-hidden bg-[--c-bone]"
      >
        <img
          src={cat.img}
          alt={cat.label}
          className="w-full h-full object-cover hover-scale-subtle"
          loading="lazy"
        />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, delay: 0.25, ease: [0.2, 0, 0, 1] }}
        className={`w-full md:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 bg-[--c-ivory]`}
      >
        <span className="t-label mb-8 text-gold">{cat.tag}</span>
        <h3 className="t-section mb-8">{cat.label}</h3>
        <div className="gold-line mb-8" />
        <p className="t-body max-w-[280px] mb-16">{cat.desc}</p>
        <Link to={cat.href} data-cursor>
          <button className="btn-void w-full sm:w-auto justify-center sm:justify-start" style={{ display: "inline-flex" }}>
            <span>Explore</span>
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

const Home = () => {
  const { addToCart } = useCart();
  const { data: allProducts = [] } = useProducts();
  const featured = allProducts.filter((p) => p.is_featured).slice(0, 4);

  const featRef = useRef(null);
  const featInView = useInView(featRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-[--c-ivory]">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <div className="marquee-track bg-[--c-void]" style={{ borderColor: "transparent" }}>
        <div className="marquee-inner">
          {[...marqueeItems, ...marqueeItems].map((text, i) => (
            <span key={i} className="t-label text-[--c-warmgray] whitespace-nowrap text-[0.55rem]">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="bg-[--c-ivory]">
        {/* Intro */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-32 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="t-label block mb-6"
          >
            Our Universe
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="t-section"
          >
            Four disciplines.<br />
            <em className="text-gold">One philosophy.</em>
          </motion.h2>
        </div>

        {/* Alternating blocks */}
        <div className="section-divider" />
        {categories.map((cat, i) => (
          <div key={cat.label}>
            <CategoryBlock cat={cat} index={i} />
            <div className="section-divider" />
          </div>
        ))}
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────── */}
      <section ref={featRef} className="py-32 bg-[--c-bone]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1 }}
            >
              <span className="t-label block mb-4">New In</span>
              <h2 className="t-section">Curated Selection.</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={featInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <Link to="/shop" className="nav-link" data-cursor>
                View All →
              </Link>
            </motion.div>
          </div>

          {/* Grid */}
          {featured.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={featInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, staggerChildren: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14"
            >
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-24 t-label">
              New arrivals arriving soon.
            </div>
          )}
        </div>
      </section>

      {/* ── STATEMENT SECTION ────────────────────────────────────────── */}
      <section className="py-40 bg-[--c-void] text-[--c-ivory]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <span className="t-label text-[--c-warmgray] block mb-10">The Philosophy</span>
            <h2 className="font-editorial text-[clamp(3rem,8vw,8rem)] font-light leading-[0.9] tracking-tight mb-12">
              Wear it.<br />
              <em className="text-gold">Mean it.</em>
            </h2>
            <p className="t-body text-[--c-warmgray] max-w-md mx-auto mb-16 text-base">
              Style is not decoration. It is a statement of presence, of intention, of who you are before you speak a single word.
            </p>
            <Link to="/shop">
              <button className="btn-void border border-[--c-warmgray]" data-cursor>
                <span>Enter the Collection</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── EMAIL SECTION ────────────────────────────────────────────── */}
      <section className="py-32 bg-[--c-ivory] border-t border-[--c-bone]">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="t-label block mb-6">Inner Circle</span>
            <h3 className="t-section mb-6">
              Access the archive.
            </h3>
            <p className="t-body mb-12">
              Private drops, editorial content, and exclusive previews — only for members.
            </p>
            <div className="flex flex-col sm:flex-row gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-5 py-4 bg-[--c-bone] border border-[--c-warmgray] text-[--c-void] placeholder-[--c-stone] text-xs tracking-wider focus:outline-none focus:border-[--c-void] transition-colors"
              />
              <button className="btn-void mt-4 sm:mt-0 justify-center" data-cursor>
                <span>Subscribe</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
