import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  ShoppingBag,
  Users,
  Box,
  BarChart2,
  DollarSign,
  Settings,
  User,
  LogOut,
  X,
} from "lucide-react";

interface VendorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/vendor", icon: LayoutDashboard, exact: true },
  { label: "Products", to: "/vendor/products", icon: Package },
  { label: "Add Product", to: "/vendor/products/add", icon: PlusSquare },
  { label: "Orders", to: "/vendor/orders", icon: ShoppingBag },
  { label: "Customers", to: "/vendor/customers", icon: Users },
  { label: "Inventory", to: "/vendor/inventory", icon: Box },
  { label: "Analytics", to: "/vendor/analytics", icon: BarChart2 },
  { label: "Earnings", to: "/vendor/earnings", icon: DollarSign },
  { label: "Store Settings", to: "/vendor/settings", icon: Settings },
  { label: "Profile", to: "/vendor/profile", icon: User },
];

export default function VendorSidebar({ isOpen, onClose }: VendorSidebarProps) {
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-ivory transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
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
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-ink text-ivory"
                        : "text-espresso-light hover:bg-cream/50 hover:text-ink"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} className="shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-espresso-light transition-colors hover:bg-cream/50 hover:text-ink"
          >
            <LogOut size={18} className="shrink-0" strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
