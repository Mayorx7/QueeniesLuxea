import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart2,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart2 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const adminName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user?.email || "Administrator";
  const initials = adminName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const handleSignOut = async () => { await signOut(); navigate("/", { replace: true }); };
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 lg:h-20">
          <NavLink to="/">
            <img
              src="/log.png"
              alt="QueenLuxea"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </NavLink>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-none">
          <p className="eyebrow mb-3 px-3 text-[0.55rem] text-white/30">Main Menu</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gold text-ivory shadow-lg shadow-gold/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <item.icon size={17} className="shrink-0" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="eyebrow mb-3 px-3 text-[0.55rem] text-white/30">Store</p>
            <NavLink
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
            >
              <ShoppingBag size={17} strokeWidth={1.75} className="shrink-0" />
              View Storefront
            </NavLink>
          </div>
        </nav>

        {/* Admin user */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 ring-1 ring-gold/40">
              <span className="font-display text-sm text-gold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ivory truncate">{adminName}</p>
              <p className="text-[0.65rem] text-white/40 truncate">{profile?.email || user?.email}</p>
            </div>
            <button type="button" onClick={() => void handleSignOut()} aria-label="Log out" className="text-white/40 hover:text-white">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
