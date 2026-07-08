import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[--c-void] text-[--c-ivory]">
      {/* Top Statement Strip */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-4 sm:px-8 md:px-16 py-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="flex items-center gap-6 md:gap-10">
            <img src="/IMG_4121.png" alt="Logo" className="w-16 h-16 md:w-28 md:h-28 object-cover rounded-full drop-shadow-md opacity-90" />
            <div>
              <h2 className="font-editorial text-[clamp(2.5rem,7vw,7rem)] font-light leading-none tracking-tight">
                The Style Yard
              </h2>
              <span className="t-label text-[--c-stone] block mt-4">
                Lagos · Premium Fashion House · Est. 2024
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <span className="t-label text-[--c-stone]">Follow</span>
            <div className="flex gap-6">
              <a href="https://instagram.com/thestyleyard_01" target="_blank" rel="noopener noreferrer" className="nav-link text-[--c-warmgray] hover:text-[--c-ivory]" data-cursor>
                Instagram
              </a>
              <a href="#" className="nav-link text-[--c-warmgray] hover:text-[--c-ivory]" data-cursor>
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Link Grid */}
      <div className="px-4 sm:px-8 md:px-16 py-16 border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <span className="t-label text-[--c-stone] block mb-6">Shop</span>
            <ul className="space-y-3">
              {["Clothes", "Jewelry", "Bags", "Perfumes", "New Arrivals"].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item.toLowerCase()}`} className="nav-link text-[--c-warmgray] hover:text-[--c-ivory] text-[0.75rem] tracking-wide normal-case font-light" data-cursor>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="t-label text-[--c-stone] block mb-6">Account</span>
            <ul className="space-y-3">
              {["Sign In", "Create Account", "Wishlist", "Orders", "Profile"].map((item) => (
                <li key={item}>
                  <Link to="/auth" className="nav-link text-[--c-warmgray] hover:text-[--c-ivory] text-[0.75rem] tracking-wide normal-case font-light" data-cursor>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="t-label text-[--c-stone] block mb-6">Info</span>
            <ul className="space-y-3">
              {[
                { name: "About Us", path: "/about" },
                { name: "Contact", path: "/contact" },
                { name: "Shipping Policy", path: "/shipping-policy" },
                { name: "Returns", path: "/returns" },
                { name: "Size Guide", path: "/size-guide" }
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="nav-link text-[--c-warmgray] hover:text-[--c-ivory] text-[0.75rem] tracking-wide normal-case font-light" data-cursor>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="t-label text-[--c-stone] block mb-6">Contact</span>
            <ul className="space-y-3 text-[0.75rem] font-light text-[--c-warmgray]">
              <li>thestyleyardd@gmail.com</li>
              <li>Lagos, Nigeria</li>
              <li className="pt-4">
                <a href="mailto:thestyleyardd@gmail.com" className="nav-link text-[--c-warmgray] hover:text-[--c-ivory] normal-case font-light" data-cursor>
                  Reach Out →
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-4 sm:px-8 md:px-16 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="t-label text-[--c-stone]">
            © {year} The Style Yard. All rights reserved.
          </span>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="nav-link text-[--c-stone] hover:text-[--c-warmgray] normal-case font-light text-[0.65rem]" data-cursor>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
