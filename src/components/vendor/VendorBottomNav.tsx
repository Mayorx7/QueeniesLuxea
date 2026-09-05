import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Menu } from "lucide-react";

interface VendorBottomNavProps {
  onMoreClick: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/vendor", icon: LayoutDashboard, exact: true },
  { label: "Products",  to: "/vendor/products", icon: Package },
  { label: "Orders",   to: "/vendor/orders",   icon: ShoppingBag },
  { label: "Earnings", to: "/vendor/earnings", icon: DollarSign },
];

export default function VendorBottomNav({ onMoreClick }: VendorBottomNavProps) {
  const { pathname } = useLocation();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <nav
      aria-label="Vendor mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 slide-in-up lg:hidden"
    >
      <div className="h-px bg-[var(--color-line)]" />
      <div className="flex items-stretch bg-[var(--color-ivory)]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                active
                  ? "text-[var(--color-gold)]"
                  : "text-[var(--color-espresso-light)]"
              }`}
            >
              <item.icon size={22} strokeWidth={active ? 2 : 1.5} />
              <span
                className={`text-[0.6rem] font-semibold uppercase tracking-wider ${
                  active
                    ? "text-[var(--color-gold)]"
                    : "text-[var(--color-espresso-light)]"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-[var(--color-gold)]" />
              )}
            </Link>
          );
        })}

        {/* More — opens the sidebar drawer */}
        <button
          type="button"
          onClick={onMoreClick}
          aria-label="More options"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[var(--color-espresso-light)] transition-colors"
        >
          <Menu size={22} strokeWidth={1.5} />
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
