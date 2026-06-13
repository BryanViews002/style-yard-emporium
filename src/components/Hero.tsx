import { Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Hero3D } from "@/components/Hero3D";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const textY   = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const canvasY  = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-[#F8F5EF]">
      {/* 3D Canvas */}
      <motion.div
        style={{ y: canvasY }}
        className="absolute inset-0 z-0"
      >
        <Suspense fallback={null}>
          <Hero3D />
        </Suspense>
      </motion.div>

      {/* Grain overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')] bg-[length:256px]" />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-16 pt-[80px]"
      >
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8 flex items-center gap-4"
        >
          <span className="gold-line" />
          <span className="t-label">SS — 2026</span>
        </motion.div>

        {/* Massive Headline */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.2, 0, 0, 1], delay: 0.1 }}
            className="t-hero"
          >
            The
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.2, 0, 0, 1], delay: 0.25 }}
            className="t-hero italic text-gold"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Style Yard.
          </motion.h1>
        </div>

        {/* Subline + CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-14 flex flex-col md:flex-row items-start md:items-end gap-10 md:gap-24"
        >
          <p className="t-body max-w-[280px]">
            Precision-curated fashion, fine accessories, and bespoke fragrances — crafted for those who command every room they enter.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link to="/shop">
              <button className="btn-void" data-cursor>
                <span>Shop Collection</span>
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </Link>
            <Link to="/shop?category=new">
              <button className="btn-ghost" data-cursor>
                <span>New Arrivals</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity }}
      >
        <span className="t-label text-[0.5rem]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-3 h-3 text-[--c-stone]" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
