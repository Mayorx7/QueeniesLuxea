import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Heart, User, LayoutGrid, LogIn } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
  exact?: boolean;
}

export default function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, loading } = useAuth();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const navItems: NavItem[] = [
    {
      label: "Home",
      to: "/",
      icon: <Home size={22} />,
      exact: true,
    },
    {
      label: "Shop",
      to: "/shop",
      icon: <LayoutGrid size={22} />,
    },
    {
      label: "Wishlist",
      to: "/wishlist",
      icon: <Heart size={22} />,
      badge: wishlistCount,
    },
    {
      label: "Cart",
      to: "/cart",
      icon: <ShoppingBag size={22} />,
      badge: itemCount,
    },
    {
      label: loading ? "…" : user ? "Profile" : "Login",
      to: loading ? "#" : user ? "/account" : "/login",
      icon: loading ? <User size={22} /> : user ? <User size={22} /> : <LogIn size={22} />,
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 slide-in-up md:hidden"
    >
      {/* Hairline separator */}
      <div className="h-px bg-[var(--color-line)]" />
      <div className="flex items-stretch bg-[var(--color-ivory)] safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={
                item.badge
                  ? `${item.label}, ${item.badge} items`
                  : item.label
              }
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                active
                  ? "text-[var(--color-gold)]"
                  : "text-[var(--color-espresso-light)]"
              }`}
            >
              <span className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--color-gold)] px-0.5 text-[0.58rem] font-semibold text-[var(--color-ivory)]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[0.6rem] font-semibold uppercase tracking-wider ${
                  active
                    ? "text-[var(--color-gold)]"
                    : "text-[var(--color-espresso-light)]"
                }`}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-[var(--color-gold)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
