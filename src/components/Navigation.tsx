import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, X, User, LogOut, Shield, Heart, UserCircle, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Collection", href: "/shop" },
  { label: "Clothes",    href: "/shop?category=clothes",  category: "clothes"  },
  { label: "Jewelry",    href: "/shop?category=jewelry",  category: "jewelry"  },
  { label: "Bags",       href: "/shop?category=bags",     category: "bags"     },
  { label: "Perfumes",   href: "/shop?category=perfumes", category: "perfumes" },
  { label: "Contact",    href: "/contact" },
];

const Navigation = ({ cartItemsCount = 0 }: { cartItemsCount?: number }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.href === "/") return location.pathname === "/";
    if (item.category) {
      const cat = new URLSearchParams(location.search).get("category");
      return location.pathname === "/shop" && cat === item.category;
    }
    return location.pathname.startsWith(item.href.split("?")[0]);
  };

  const handleSignOut = async () => {
    try { await signOut(); toast.success("Signed out."); }
    catch { toast.error("Error signing out."); }
  };

  return (
    <>
      <nav className={`nav-3d px-4 sm:px-6 md:px-8 lg:px-8 xl:px-20 ${scrolled ? "scrolled" : ""}`}>
        <div className="w-full flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex flex-col" data-cursor>
            <span className="font-editorial text-[1.3rem] leading-none tracking-tight text-[--c-void]">
              The Style Yard
            </span>
            <span className="t-label tracking-[0.3em] text-[0.45rem] text-gold mt-0.5">
              Lagos · Premium Fashion
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-10">
            {navItems.map((item) => (
              <Link key={item.label} to={item.href} className={`nav-link ${isActive(item) ? "active" : ""}`} data-cursor>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="nav-link flex items-center gap-2" data-cursor>
                    <User className="w-3 h-3" /> Account
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[--c-ivory] border-[--c-bone] rounded-none min-w-[200px] mt-4 text-[--c-void]">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="t-label py-3 px-4 hover:bg-[--c-bone] cursor-none flex items-center gap-2">
                          <Shield className="w-3 h-3" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[--c-bone]" />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="t-label py-3 px-4 hover:bg-[--c-bone] cursor-none flex items-center gap-2">
                      <UserCircle className="w-3 h-3" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="t-label py-3 px-4 hover:bg-[--c-bone] cursor-none flex items-center gap-2">
                      <ShoppingBag className="w-3 h-3" /> Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="t-label py-3 px-4 hover:bg-[--c-bone] cursor-none flex items-center gap-2">
                      <Heart className="w-3 h-3" /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[--c-bone]" />
                  <DropdownMenuItem onClick={handleSignOut} className="t-label py-3 px-4 text-red-600 hover:bg-[--c-bone] cursor-none flex items-center gap-2">
                    <LogOut className="w-3 h-3" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="nav-link" data-cursor>Sign In</Link>
            )}

            <Link to="/wishlist" data-cursor>
              <Heart className="w-4 h-4 text-[--c-stone] hover:text-[--c-void] transition-colors" />
            </Link>

            <Link to="/cart" className="relative" data-cursor>
              <ShoppingBag className="w-4 h-4 text-[--c-void]" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[--c-void] text-[--c-ivory] flex items-center justify-center text-[8px] font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-5">
            <Link to="/cart" className="relative" data-cursor>
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[--c-void] text-[--c-ivory] flex items-center justify-center text-[8px] font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} data-cursor>
              {isMobileOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-screen Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[999] bg-[--c-ivory] flex flex-col pt-24"
          >
            <div className="flex flex-col px-8 py-6 flex-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block py-6 font-editorial text-5xl tracking-tight border-b border-[--c-bone] transition-colors ${
                      isActive(item) ? "text-[--c-void] italic" : "text-[--c-warmgray]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="px-8 pb-12">
              {user ? (
                <button onClick={() => { handleSignOut(); setIsMobileOpen(false); }} className="btn-ghost w-full justify-center">
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsMobileOpen(false)}>
                  <button className="btn-void w-full justify-center"><span>Sign In</span></button>
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
