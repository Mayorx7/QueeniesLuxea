import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import MiniCart from "./MiniCart";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

const PRIMARY_NAV_LINKS = [
  { label: "Home", to: "/" },
  {
    label: "Women",
    to: "/shop?category=Women",
    hasDropdown: true,
    dropdownItems: [
      { label: "Dresses", to: "/shop?category=Dresses" },
      { label: "Tops & Blouses", to: "/shop?category=Tops" },
      { label: "Handbags", to: "/shop?category=Handbags" },
      { label: "Jewelry", to: "/shop?category=Jewelry" },
      { label: "Shoes", to: "/shop?category=Shoes" },
      { label: "Accessories", to: "/shop?category=Accessories" },
      { label: "View All Women", to: "/shop?category=Women" },
    ],
    subcategories: [
      { label: "Dresses", to: "/shop?category=Dresses" },
      { label: "Tops & Blouses", to: "/shop?category=Tops" },
      { label: "Handbags", to: "/shop?category=Handbags" },
      { label: "Jewelry", to: "/shop?category=Jewelry" },
      { label: "Shoes", to: "/shop?category=Shoes" },
      { label: "Accessories", to: "/shop?category=Accessories" },
      { label: "View All Women", to: "/shop?category=Women" },
    ]
  },
  {
    label: "Men",
    to: "/shop?category=Men",
    hasDropdown: true,
    dropdownItems: [
      { label: "Shirts", to: "/shop?category=Men" },
      { label: "T-Shirts & Polos", to: "/shop?category=Men" },
      { label: "Trousers & Jeans", to: "/shop?category=Men" },
      { label: "Native Wear", to: "/shop?category=Men" },
      { label: "Shorts", to: "/shop?category=Men" },
      { label: "Shoes", to: "/shop?category=Shoes" },
      { label: "Accessories", to: "/shop?category=Accessories" },
      { label: "View All Men", to: "/shop?category=Men" },
    ],
    subcategories: [
      { label: "Shirts", to: "/shop?category=Men" },
      { label: "T-Shirts & Polos", to: "/shop?category=Men" },
      { label: "Trousers & Jeans", to: "/shop?category=Men" },
      { label: "Native Wear", to: "/shop?category=Men" },
      { label: "Shorts", to: "/shop?category=Men" },
      { label: "Shoes", to: "/shop?category=Shoes" },
      { label: "Accessories", to: "/shop?category=Accessories" },
      { label: "View All Men", to: "/shop?category=Men" },
    ]
  },
  { label: "Accessories", to: "/shop?category=Accessories" },
  { label: "New Arrivals", to: "/shop?filter=new" },
  { label: "Offers", to: "/offers" },
];

const MORE_DROPDOWN_ITEMS = [
  { label: "All Products", to: "/shop" },
  { label: "Contact", to: "/contact" },
  { label: "About Us", to: "/about" },
];

const MOBILE_NAV_LINKS = [
  ...PRIMARY_NAV_LINKS,
  ...MORE_DROPDOWN_ITEMS.map(item => ({ ...item, subcategories: undefined })),
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-[var(--color-line)] bg-[var(--color-ivory)]/95 backdrop-blur"
          : "border-transparent bg-[var(--color-ivory)]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        {/* Mobile/tablet: hamburger (left) */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo — centered on mobile, left-aligned on desktop */}
        <Link to="/" className="mx-auto lg:mx-0">
          <img
            src="/log.png"
            alt="QueenLuxea"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>

        {/* Desktop nav links */}
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {PRIMARY_NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className="relative group"
              onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `eyebrow link-underline text-[0.72rem] flex items-center gap-1 whitespace-nowrap ${
                    isActive
                      ? "text-[var(--color-gold)]"
                      : "text-[var(--color-espresso)]"
                  }`
                }
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={14} className="opacity-70" />}
              </NavLink>

              {/* Dropdown menu */}
              {link.hasDropdown && openDropdown === link.label && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 bg-[var(--color-ivory)] border border-[var(--color-line)] shadow-xl rounded-lg py-2">
                  {link.dropdownItems?.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block px-4 py-2 text-sm text-[var(--color-espresso)] hover:bg-[var(--color-cream)] hover:text-[var(--color-gold)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* More dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setMoreDropdownOpen(true)}
            onMouseLeave={() => setMoreDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className="eyebrow link-underline text-[0.72rem] flex items-center gap-1 text-[var(--color-espresso)] whitespace-nowrap"
            >
              More
              <ChevronDown size={14} className="opacity-70" />
            </button>

            {moreDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-48 bg-[var(--color-ivory)] border border-[var(--color-line)] shadow-xl rounded-lg py-2">
                {MORE_DROPDOWN_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="block px-4 py-2 text-sm text-[var(--color-espresso)] hover:bg-[var(--color-cream)] hover:text-[var(--color-gold)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Search — visible on all screen sizes */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-colors"
          >
            <Search size={19} />
          </button>

          {/* Account / Login & Register — desktop only (mobile: in bottom nav) */}
          {!loading && user ? (
            <Link
              to="/account"
              aria-label="Account"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-colors md:flex"
            >
              <User size={19} />
            </Link>
          ) : !loading && !user ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/login"
                id="header-login-btn"
                className="eyebrow link-underline text-[0.72rem] text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-all duration-200 hover:scale-105 inline-block"
              >
                Login
              </Link>
              <Link
                to="/register"
                id="header-register-btn"
                className="eyebrow text-[0.72rem] text-[var(--color-ivory)] bg-[var(--color-ink)] px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-[var(--color-espresso)] hover:scale-105 hover:shadow-md active:scale-95"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="hidden min-h-[44px] min-w-[44px] md:flex" />
          )}

          {/* Wishlist — desktop only (mobile: in bottom nav) */}
          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} items`}
            className="relative hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-colors md:flex"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[0.6rem] font-semibold text-[var(--color-ivory)]">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart — desktop uses mini-cart drawer; mobile links to cart page */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping bag, ${itemCount} items`}
            className="relative hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-colors md:flex"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-gold)] text-[0.6rem] font-semibold text-[var(--color-ivory)]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={MOBILE_NAV_LINKS} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
