import { Menu, Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function DashboardHeader({ onMenuClick, title = "Dashboard" }: DashboardHeaderProps) {
  // Use mock data for now
  const customerName = "Alexandra Whitmore";
  const initials = customerName.split(" ").map((n) => n[0]).join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ivory/80 px-4 backdrop-blur-md sm:px-6 lg:h-20 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-espresso-light hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-display text-xl text-ink lg:text-2xl">{title}</h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          className="p-2 text-espresso-light transition-colors hover:text-ink"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
        
        <button 
          className="relative p-2 text-espresso-light transition-colors hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold"></span>
        </button>

        <div className="h-6 w-px bg-line hidden sm:block"></div>

        <Link 
          to="/account/profile" 
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">{customerName}</p>
            <p className="text-xs text-espresso-light">Customer</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne bg-cream">
            <span className="font-display text-sm text-ink">{initials}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
