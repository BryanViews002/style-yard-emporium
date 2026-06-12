import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, User, LogOut, Shield, Heart, UserCircle, BarChart, FolderTree, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Clothes", href: "/shop?category=clothes", category: "clothes" },
  { label: "Jewelry", href: "/shop?category=jewelry", category: "jewelry" },
  { label: "Bags", href: "/shop?category=bags", category: "bags" },
  { label: "Perfumes", href: "/shop?category=perfumes", category: "perfumes" },
  { label: "Contact", href: "/contact" },
];

const Navigation = ({ cartItemsCount = 0 }: { cartItemsCount?: number }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const location = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
  });

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.href === "/") return location.pathname === "/";
    if (item.category) {
      const activeCategory = new URLSearchParams(location.search).get("category");
      return location.pathname === "/shop" && activeCategory === item.category;
    }
    return location.pathname.startsWith(item.href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        animate={{
          backgroundColor: isScrolled ? "rgba(8,8,8,0.92)" : "rgba(8,8,8,0.4)",
          borderBottomColor: isScrolled ? "rgba(212,175,55,0.12)" : "rgba(212,175,55,0.0)",
          borderBottomWidth: "1px",
          backdropFilter: isScrolled ? "blur(24px)" : "blur(8px)",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.img
                src="/IMG_4121.png"
                alt="The Style Yard Logo"
                className="h-9 w-9 object-cover rounded-full"
                loading="eager"
                fetchPriority="high"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              />
              <div className="font-playfair text-xl tracking-[0.15em] uppercase">
                <motion.span
                  className="inline-block"
                  style={{ color: "rgba(240,236,228,0.9)" }}
                  whileHover={{ color: "#D4AF37" }}
                  transition={{ duration: 0.4 }}
                >
                  The Style{" "}
                </motion.span>
                <span className="text-shimmer">Yard</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`nav-link ${isActive(item) ? "active" : ""}`}
                >
                  {item.label}
                  {isActive(item) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -bottom-[2px] left-0 right-0 h-px bg-[#D4AF37]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors duration-300"
                    >
                      <User className="h-4 w-4" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#0d0d0d] border-[#D4AF37]/15 text-white min-w-[200px] rounded-none mt-3"
                  >
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 cursor-pointer text-xs tracking-widest uppercase">
                            <Shield className="h-3.5 w-3.5" /> Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 cursor-pointer text-xs tracking-widest uppercase">
                        <UserCircle className="h-3.5 w-3.5" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 cursor-pointer text-xs tracking-widest uppercase">
                        <ShoppingBag className="h-3.5 w-3.5" /> Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 cursor-pointer text-xs tracking-widest uppercase">
                        <Heart className="h-3.5 w-3.5" /> Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/5 cursor-pointer text-xs tracking-widest uppercase"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-[#D4AF37] transition-colors duration-300 border border-white/10 hover:border-[#D4AF37]/40 px-5 py-2.5"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}

              <Link to="/wishlist">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors duration-300"
                >
                  <Heart className="h-4 w-4" />
                </motion.button>
              </Link>

              <Link to="/cart">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 flex items-center justify-center relative border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors duration-300"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {cartItemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[9px] w-4 h-4 flex items-center justify-center font-bold"
                    >
                      {cartItemsCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center space-x-3">
              <Link to="/cart" className="relative text-white/70">
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-black text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/70 w-9 h-9 flex items-center justify-center"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[#050505]/98 backdrop-blur-2xl flex flex-col pt-[80px]"
          >
            <div className="flex flex-col px-6 py-8 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-5 font-playfair text-3xl tracking-wide border-b border-white/5 transition-colors duration-300 ${
                      isActive(item) ? "text-[#D4AF37]" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="px-6 mt-auto pb-10 flex gap-4">
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                  className="text-xs tracking-[0.2em] uppercase text-red-400/70 border border-red-400/20 px-5 py-3"
                >
                  Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="text-xs tracking-[0.2em] uppercase text-[#D4AF37] border border-[#D4AF37]/40 px-5 py-3">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
