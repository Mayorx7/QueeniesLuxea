import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ProductCategory, ProductFilterState } from "../types";
import ProductFilters from "./ProductFilters";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  maxPrice: number;
  availableCategories?: ProductCategory[];
  resultCount: number;
}

export default function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  maxPrice,
  availableCategories,
  resultCount,
}: FilterDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

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
    <div className="fixed inset-0 z-[95] lg:hidden">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className="absolute left-0 top-0 flex h-full w-full max-w-xs flex-col bg-ivory shadow-xl"
        style={{ animation: "slideInLeft 0.3s ease both" }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <span className="font-display text-lg">Filter</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close filters" className="text-espresso hover:text-gold">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ProductFilters
            filters={filters}
            onChange={onChange}
            maxPrice={maxPrice}
            availableCategories={availableCategories}
          />
        </div>
        <div className="border-t border-line px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-ink py-3.5 text-center eyebrow text-ivory hover:bg-espresso"
          >
            Show {resultCount} results
          </button>
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
