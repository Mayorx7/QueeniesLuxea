import { Menu, Search, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface VendorHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function VendorHeader({ onMenuClick, title }: VendorHeaderProps) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const vendorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user?.email || "Vendor";
  const handleSignOut = async () => { await signOut(); navigate("/", { replace: true }); };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ivory/90 px-4 backdrop-blur-md sm:px-6 lg:h-20 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-espresso-light hover:text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-display text-xl text-ink lg:text-2xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex relative items-center">
          <Search size={16} className="absolute left-3 text-espresso-light" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-48 rounded-full border border-line bg-cream/30 py-2 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
          />
        </div>
        
        <button className="sm:hidden p-2 text-espresso-light hover:text-ink">
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

        <button type="button" onClick={() => void handleSignOut()} className="p-2 text-espresso-light transition-colors hover:text-ink" aria-label="Sign out">
          <LogOut size={18} />
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink group-hover:text-gold transition-colors">Luxe Boutique</p>
            <p className="text-xs text-espresso-light">{vendorName}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne bg-cream">
            <span className="font-display text-sm text-ink">LB</span>
          </div>
        </div>
      </div>
    </header>
  );
}
