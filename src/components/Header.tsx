import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import MiniCart from "./MiniCart";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const NAV_LINKS = [
  { label: "New Arrivals", to: "/shop?filter=new" },
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "Lookbook", to: "/lookbook" },
  { label: "About", to: "/about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

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
        {/* Mobile: hamburger (left) */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] md:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo — centered on mobile, left-aligned on desktop */}
        <Link to="/" className="mx-auto md:mx-0">
          <img
            src="/log.png"
            alt="QueenLuxea"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </Link>

        {/* Desktop nav links */}
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `eyebrow link-underline text-[0.72rem] ${
                  isActive
                    ? "text-[var(--color-gold)]"
                    : "text-[var(--color-espresso)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
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

          {/* Account — desktop only (mobile: in bottom nav) */}
          <Link
            to="/account"
            aria-label="Account"
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center text-[var(--color-espresso)] hover:text-[var(--color-gold)] transition-colors md:flex"
          >
            <User size={19} />
          </Link>

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

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
