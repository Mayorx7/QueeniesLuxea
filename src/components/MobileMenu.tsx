import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavLink {
  label: string;
  to: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const location = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95] md:hidden">
      <div className="fade-in absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="absolute left-0 top-0 flex h-full w-full max-w-xs flex-col bg-ivory shadow-xl"
        style={{ animation: "slideInLeft 0.3s ease both" }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <span className="font-display text-lg tracking-wide">Menu</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close menu" className="text-espresso hover:text-gold">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-6 py-6" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="border-b border-line py-4 font-display text-xl text-ink"
            >
              {link.label}
            </Link>
          ))}
          {!loading && !user && (
            <>
              <Link to="/login" className="border-b border-line py-4 font-display text-xl text-ink">
                Login
              </Link>
              <Link to="/register" className="border-b border-line py-4 font-display text-xl text-[var(--color-gold)]">
                Register
              </Link>
            </>
          )}
          {!loading && user && (
            <Link to="/account" className="border-b border-line py-4 font-display text-xl text-[var(--color-gold)]">
              My Account
            </Link>
          )}
        </nav>
        <div className="border-t border-line px-6 py-5 text-xs text-espresso-light">
          <p>Complimentary shipping on orders over $150</p>
        </div>
      </div>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
