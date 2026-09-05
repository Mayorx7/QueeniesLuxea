import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SmartImage from "../components/SmartImage";
import EmptyState from "../components/EmptyState";
import { useCart, FREE_SHIPPING_THRESHOLD } from "../context/CartContext";
import { formatPrice } from "../utils/format";

const VALID_PROMO_CODES: Record<string, number> = {
  QUEENSLUXEA10: 0.1,
  WELCOME15: 0.15,
};

export default function CartPage() {
  const { lines, subtotal, shipping, total, updateQuantity, removeItem } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [discountRate, setDiscountRate] = useState(0);

  const handlePromoSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMO_CODES[code]) {
      setDiscountRate(VALID_PROMO_CODES[code]);
      setPromoStatus("valid");
    } else {
      setDiscountRate(0);
      setPromoStatus("invalid");
    }
  };

  const discount = subtotal * discountRate;
  const finalTotal = total - discount;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Shopping Bag" }]} />
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Your Bag</h1>

      {lines.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            message="Explore the collection and find something worth carrying."
            action={
              <Link
                to="/shop"
                className="eyebrow bg-ink px-6 py-3 text-ivory transition-colors hover:bg-espresso"
              >
                Continue Shopping
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {remainingForFreeShipping > 0 ? (
              <p className="mb-6 border border-line bg-cream px-4 py-3 text-xs text-espresso">
                Add {formatPrice(remainingForFreeShipping)} more for complimentary shipping.
              </p>
            ) : (
              <p className="mb-6 border border-line bg-cream px-4 py-3 text-xs text-espresso">
                You've unlocked complimentary shipping.
              </p>
            )}

            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {lines.map((line) => (
                <li key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-5 py-6">
                  <Link to={`/product/${line.product.slug}`} className="h-32 w-24 shrink-0 bg-cream sm:h-36 sm:w-28">
                    <SmartImage src={line.product.images[0]} alt={line.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/product/${line.product.slug}`} className="font-display text-lg link-underline">
                          {line.product.name}
                        </Link>
                        <p className="mt-1 text-xs text-espresso-light">
                          {line.color} · Size {line.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId, line.color, line.size)}
                        aria-label={`Remove ${line.product.name} from bag`}
                        className="text-espresso-light hover:text-ink"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="inline-flex items-center border border-espresso/25">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(line.productId, line.color, line.size, line.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center hover:bg-cream"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(line.productId, line.color, line.size, line.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center hover:bg-cream"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-sm">{formatPrice(line.product.price * line.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/shop" className="eyebrow link-underline mt-6 inline-block text-espresso">
              Continue Shopping
            </Link>
          </div>

          <div className="border border-line p-6 sm:p-8 lg:col-span-1">
            <h2 className="font-display text-xl">Order Summary</h2>

            <form onSubmit={handlePromoSubmit} className="mt-6">
              <label htmlFor="promo-code" className="eyebrow mb-2 block text-espresso-light">
                Promo code
              </label>
              <div className="flex gap-2">
                <input
                  id="promo-code"
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoStatus("idle");
                  }}
                  placeholder="Enter code"
                  className="w-full border border-espresso/30 px-3 py-2.5 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 border border-espresso px-4 text-xs font-semibold uppercase tracking-wider text-espresso hover:bg-espresso hover:text-ivory"
                >
                  Apply
                </button>
              </div>
              {promoStatus === "valid" && (
                <p className="mt-2 text-xs text-emerald-800">
                  Code applied — {Math.round(discountRate * 100)}% off.
                </p>
              )}
              {promoStatus === "invalid" && (
                <p className="mt-2 text-xs text-red-800">That code isn't valid. Try QUEENSLUXEA10.</p>
              )}
            </form>

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between text-espresso-light">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-espresso-light">
                  <span>Discount</span>
                  <span>&minus;{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-espresso-light">
                <span>Estimated shipping</span>
                <span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 font-display text-lg text-ink">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-6 block w-full bg-ink py-4 text-center text-xs font-semibold uppercase tracking-wider text-ivory transition-colors hover:bg-espresso"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
