import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  MapPin,
  Heart, 
  ShoppingBag, 
  User, 
  Settings, 
  LogOut,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/account", icon: LayoutDashboard, exact: true },
  { label: "My Orders", to: "/account/orders", icon: Package },
  { label: "Addresses", to: "/account/addresses", icon: MapPin },
  { label: "Wishlist", to: "/wishlist", icon: Heart },
  { label: "Cart", to: "/cart", icon: ShoppingBag },
  { label: "Profile", to: "/account/profile", icon: User },
  { label: "Settings", to: "/account/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-line bg-ivory transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-6 lg:h-20">
          <NavLink to="/">
            <img
              src="/log.png"
              alt="QueenLuxea"
              className="h-9 w-auto object-contain"
            />
          </NavLink>
          <button 
            onClick={onClose}
            className="p-2 text-espresso-light hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-none">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-cream text-ink"
                        : "text-espresso-light hover:bg-cream/50 hover:text-ink"
                    }`
                  }
                >
                  <item.icon size={18} className="shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-md px-4 py-3 text-sm font-medium text-espresso-light transition-colors hover:bg-cream/50 hover:text-ink"
          >
            <LogOut size={18} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
