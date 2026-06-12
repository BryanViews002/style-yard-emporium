import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Twitter } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <footer className="bg-[#050505] relative overflow-hidden">
      {/* Ambient glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

      {/* Marquee strip */}
      <div className="border-y border-white/5 py-5 overflow-hidden">
        <div className="flex">
          <div className="marquee-track">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center mx-8 text-[10px] tracking-[0.4em] uppercase text-white/20 whitespace-nowrap">
                The Style Yard <span className="mx-6 text-[#D4AF37]">✦</span>
                Luxury Fashion <span className="mx-6 text-[#D4AF37]">✦</span>
                Premium Jewelry <span className="mx-6 text-[#D4AF37]">✦</span>
                Signature Scents <span className="mx-6 text-[#D4AF37]">✦</span>
              </span>
            ))}
          </div>
          <div className="marquee-track" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center mx-8 text-[10px] tracking-[0.4em] uppercase text-white/20 whitespace-nowrap">
                The Style Yard <span className="mx-6 text-[#D4AF37]">✦</span>
                Luxury Fashion <span className="mx-6 text-[#D4AF37]">✦</span>
                Premium Jewelry <span className="mx-6 text-[#D4AF37]">✦</span>
                Signature Scents <span className="mx-6 text-[#D4AF37]">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-6">

          {/* Brand — large column */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/IMG_4121.png"
                alt="The Style Yard Logo"
                className="h-10 w-10 object-cover rounded-full"
              />
              <div className="font-playfair text-2xl tracking-[0.15em] uppercase">
                <span className="text-white/90">The Style</span>
                <span className="text-shimmer"> Yard</span>
              </div>
            </div>
            <p className="text-white/35 text-sm leading-loose max-w-xs mb-8 font-light">
              Redefining luxury fashion for those who refuse to blend in. Curated for the exceptional.
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/2349136552909"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-300 text-xs tracking-widest"
              >
                W
              </a>
              <a
                href="#"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-300"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-300"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Shop */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-6">Shop</h3>
            <ul className="space-y-4 text-sm font-light">
              {[
                { label: "Clothes", href: "/shop?category=clothes" },
                { label: "Jewelry", href: "/shop?category=jewelry" },
                { label: "Bags", href: "/shop?category=bags" },
                { label: "Perfumes", href: "/shop?category=perfumes" },
                { label: "Cart", href: "/cart" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-gold-underline text-white/40 hover:text-white transition-colors duration-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-6">Support</h3>
            <ul className="space-y-4 text-sm font-light">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "Size Guide", href: "#" },
                { label: "Shipping Info", href: "#" },
                { label: "Returns", href: "#" },
                { label: "FAQ", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-gold-underline text-white/40 hover:text-white transition-colors duration-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] mb-6">Stay in the Know</h3>
            <p className="text-white/35 text-sm font-light mb-6 leading-relaxed">
              Exclusive access to new drops and private events.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 text-sm bg-transparent border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-[#D4AF37]/50 transition-colors duration-300"
              />
              <button className="btn-gold flex items-center justify-center gap-2 py-3 text-xs">
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs tracking-widest">
            © {new Date().getFullYear()} The Style Yard. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-white/20">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <a key={t} href="#" className="hover:text-white/50 transition-colors duration-300 tracking-wider">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
