import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function MobileSearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?search=${encodeURIComponent(q)}`);
      setQuery("");
    }
  };

  return (
    <div className="px-4 py-3 md:hidden bg-[var(--color-ivory)]">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="mobile-search" className="sr-only">
          Search QueenLuxea
        </label>
        <div className="flex items-center gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-2.5 transition-colors focus-within:border-[var(--color-champagne)]">
          <Search
            size={16}
            className="shrink-0 text-[var(--color-espresso-light)]"
            aria-hidden="true"
          />
          <input
            id="mobile-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent text-sm text-[var(--color-espresso)] placeholder:text-[var(--color-espresso-light)]/60 focus:outline-none"
            autoComplete="off"
          />
        </div>
      </form>
    </div>
  );
}
