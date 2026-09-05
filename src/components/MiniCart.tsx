import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import SmartImage from "./SmartImage";

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
}

export default function MiniCart({ open, onClose }: MiniCartProps) {
  const { lines, subtotal, updateQuantity, removeItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
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
    <div className="fixed inset-0 z-[95]">
      <div className="fade-in absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-ivory shadow-xl"
        style={{ animation: "slideIn 0.35s ease both" }}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl">Your Bag ({lines.length})</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close bag" className="text-espresso hover:text-gold">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lines.length === 0 ? (
            <p className="mt-10 text-center text-sm text-espresso-light">
              Your bag is empty. Everything you add will appear here.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {lines.map((line) => (
                <li key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-4">
                  <Link to={`/product/${line.product.slug}`} onClick={onClose} className="h-24 w-20 shrink-0 bg-cream">
                    <SmartImage src={line.product.images[0]} alt={line.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-sm leading-tight">{line.product.name}</p>
                        <p className="mt-1 text-xs text-espresso-light">
                          {line.color} · {line.size}
                        </p>
                      </div>
                      <span className="text-sm">{formatPrice(line.product.price * line.quantity)}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center border border-espresso/25">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(line.productId, line.color, line.size, line.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center hover:bg-cream"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(line.productId, line.color, line.size, line.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center hover:bg-cream"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId, line.color, line.size)}
                        className="text-xs text-espresso-light underline underline-offset-2 hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-espresso-light">Subtotal</span>
              <span className="font-display text-lg">{formatPrice(subtotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full bg-ink py-3.5 text-center eyebrow text-ivory transition-colors hover:bg-espresso"
            >
              View Bag
            </Link>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style] { animation: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
}
