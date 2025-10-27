import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, LogOut, Shield, Heart, UserCircle, BarChart, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navigation = ({ cartItemsCount = 0 }: { cartItemsCount?: number }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const location = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Clothes", href: "/shop?category=clothes" },
    { label: "Jewelry", href: "/shop?category=jewelry" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
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
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/IMG_4121.png" 
              alt="The Style Yard Logo" 
              className="h-10 w-10 object-cover rounded-full"
            />
            <div className="text-2xl font-light tracking-wider">
              <span className="text-primary">THE STYLE</span>
              <span className="bg-gradient-to-r from-premium-gold to-accent bg-clip-text text-transparent"> YARD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`text-sm font-light tracking-wide transition-colors duration-300 ${
                  isActive(item.href)
                    ? "text-accent border-b border-accent"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <UserCircle className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center cursor-pointer">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center cursor-pointer">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/products" className="flex items-center cursor-pointer">
                          <Shield className="h-4 w-4 mr-2" />
                          Products
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/orders" className="flex items-center cursor-pointer">
                          <Shield className="h-4 w-4 mr-2" />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users" className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/categories" className="flex items-center cursor-pointer">
                          <FolderTree className="h-4 w-4 mr-2" />
                          Categories
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics" className="flex items-center cursor-pointer">
                          <BarChart className="h-4 w-4 mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="h-4 w-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`block py-2 text-base font-light tracking-wide transition-colors duration-300 ${
                  isActive(item.href) ? "text-accent font-medium" : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border/50 space-y-2">
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <UserCircle className="h-5 w-5 mr-3" />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/orders" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    <span>My Orders</span>
                  </Link>
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    <span>Wishlist</span>
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-2 text-accent hover:text-accent/80 transition-colors"
                    >
                      <Shield className="h-5 w-5 mr-3" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full py-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center py-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5 mr-3" />
                  <span>Sign In / Sign Up</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;