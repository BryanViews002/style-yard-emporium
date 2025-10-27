import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-hero-bg text-hero-text py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/IMG_4121.png" 
                alt="The Style Yard Logo" 
                className="h-12 w-12 object-cover rounded-full"
              />
              <div className="text-2xl font-light tracking-wider">
                <span className="text-hero-text">THE STYLE</span>
                <span className="bg-gradient-to-r from-premium-gold to-accent bg-clip-text text-transparent"> YARD</span>
              </div>
            </div>
            <p className="text-hero-text/70 text-sm leading-relaxed">
              Curating luxury fashion and jewelry for the modern aesthetic. 
              Elevate your style with our carefully selected collection.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-hero-text font-medium mb-4 tracking-wide">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/shop" className="text-hero-text/70 hover:text-accent transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=clothes" className="text-hero-text/70 hover:text-accent transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/shop?category=jewelry" className="text-hero-text/70 hover:text-accent transition-colors">
                  Jewelry
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-hero-text/70 hover:text-accent transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-hero-text font-medium mb-4 tracking-wide">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/contact" className="text-hero-text/70 hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-hero-text font-medium mb-4 tracking-wide">Stay Updated</h3>
            <p className="text-hero-text/70 text-sm mb-4">
              Subscribe to our newsletter for exclusive offers and style inspiration.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm bg-hero-text/10 border border-hero-text/30 rounded text-hero-text placeholder-hero-text/60 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button className="w-full px-3 py-2 text-sm bg-accent text-primary rounded hover:bg-accent/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-hero-text/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-hero-text/70 text-sm">
              © 2024 The Style Yard. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-hero-text/70 hover:text-accent transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;