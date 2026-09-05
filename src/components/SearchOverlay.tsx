import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?search=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[95]">
      <div className="fade-in absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div className="fade-in relative mx-auto mt-24 w-[92%] max-w-xl border border-line bg-ivory p-6 shadow-xl sm:mt-32">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="absolute right-5 top-5 text-espresso hover:text-gold"
        >
          <X size={20} />
        </button>
        <form onSubmit={handleSubmit} role="search">
          <label htmlFor="site-search" className="eyebrow mb-3 block text-gold">
            Search QueensLuxea
          </label>
          <div className="flex items-center gap-3 border-b border-espresso/30 pb-3">
            <Search size={18} className="text-espresso-light" aria-hidden="true" />
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dresses, handbags, jewelry…"
              className="w-full bg-transparent text-lg placeholder:text-espresso-light/70 focus:outline-none"
            />
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
