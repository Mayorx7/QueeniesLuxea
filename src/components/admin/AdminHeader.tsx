import { useState } from "react";
import { Menu, Search, Bell, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function AdminHeader({ onMenuClick, title = "Overview" }: AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const adminName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user?.email || "Admin";
  const handleSignOut = async () => { await signOut(); navigate("/", { replace: true }); };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-ivory/90 px-4 backdrop-blur-md sm:px-6 lg:h-[72px] lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-espresso-light hover:bg-cream hover:text-ink lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-display text-xl text-ink lg:text-2xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2 transition-all">
            <Search size={15} className="shrink-0 text-espresso-light" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, products…"
              className="w-40 bg-transparent text-sm text-ink outline-none placeholder-espresso-light/60 sm:w-56"
            />
            <button
              onClick={() => { setSearchOpen(false); setQuery(""); }}
              className="text-espresso-light hover:text-ink"
              aria-label="Close search"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-espresso-light hover:bg-cream hover:text-ink"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-espresso-light hover:bg-cream hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold ring-2 ring-ivory" />
        </button>

        <div className="h-5 w-px bg-line" />

        <button type="button" onClick={() => void handleSignOut()} className="rounded-lg p-2 text-espresso-light hover:bg-cream hover:text-ink" aria-label="Sign out">
          <LogOut size={18} />
        </button>

        {/* Admin avatar */}
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">{adminName}</p>
            <p className="text-[0.65rem] text-espresso-light">Administrator</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink">
            <span className="font-display text-sm text-ivory">{adminName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
