import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Heart,
  Package,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { items: cartItems } = useCart();
  const { wishlist } = useWishlist();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
  ];

  const userMenuItems = user
    ? [
        { name: "My Orders", href: "/orders", icon: Package },
        {
          name: "Wishlist",
          href: "/wishlist",
          icon: Heart,
          badge: wishlist.length,
        },
        { name: "Profile", href: "/profile", icon: User },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    : [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-left">Style Yard Emporium</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Navigation
            </h3>
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Cart */}
          <div className="space-y-2">
            <Link
              to="/cart"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-4 w-4 mr-3" />
              Cart
              {cartItems.length > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>

          {/* User Menu */}
          {user ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Account
              </h3>
              <div className="space-y-2">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors text-left"
                >
                  <X className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/auth"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-3" />
                Sign In
              </Link>
            </div>
          )}

          {/* Admin Menu (if user is admin) */}
          {user && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </h3>
              <div className="space-y-2">
                <Link
                  to="/admin"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
