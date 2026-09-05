import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Lock, ChevronDown, ChevronUp } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SmartImage from "../components/SmartImage";
import EmptyState from "../components/EmptyState";
import { useCart, FREE_SHIPPING_THRESHOLD } from "../context/CartContext";
import { formatPrice } from "../utils/format";

type DeliveryMethod = "standard" | "express" | "overnight";

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  delivery: DeliveryMethod;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

const DELIVERY_OPTIONS: { id: DeliveryMethod; label: string; description: string; price: number }[] = [
  { id: "standard", label: "Standard", description: "5–8 business days", price: 0 },
  { id: "express", label: "Express", description: "2–3 business days", price: 18 },
  { id: "overnight", label: "Overnight", description: "Next business day", price: 38 },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "France", "Germany", "Italy", "Japan", "Netherlands", "Spain",
];

function Field({
  label,
  id,
  children,
  half,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  half?: boolean;
}) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label htmlFor={id} className="eyebrow mb-2 block text-espresso-light">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-espresso/25 bg-ivory px-4 py-3 text-sm text-ink focus:border-espresso focus:outline-none transition-colors";

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "United States",
    delivery: "standard",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === form.delivery)!;
  const deliveryCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : selectedDelivery.price;
  const orderTotal = subtotal + deliveryCost;

  const set = (field: keyof ContactForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async processing — replace with real payment integration
    await new Promise((r) => setTimeout(r, 900));
    clearCart();
    navigate("/order-confirmation", {
      state: {
        orderNumber: `QL-${Date.now().toString(36).toUpperCase()}`,
        email: form.email,
        name: `${form.firstName} ${form.lastName}`,
        address: `${form.address}, ${form.city}, ${form.state} ${form.postcode}, ${form.country}`,
        delivery: selectedDelivery.label,
        total: orderTotal,
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
      },
    });
  };

  if (lines.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="Add items to your bag before proceeding to checkout."
          action={
            <Link to="/shop" className="eyebrow bg-ink px-6 py-3 text-ivory hover:bg-espresso">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Bag", to: "/cart" },
          { label: "Checkout" },
        ]}
      />

      {/* Mobile order summary toggle */}
      <button
        type="button"
        onClick={() => setSummaryOpen((o) => !o)}
        className="mb-6 flex w-full items-center justify-between border border-line bg-cream px-5 py-4 text-sm lg:hidden"
        aria-expanded={summaryOpen}
      >
        <span className="eyebrow text-espresso">
          {summaryOpen ? "Hide" : "Show"} order summary
        </span>
        <span className="flex items-center gap-3">
          <span className="font-display text-lg text-ink">{formatPrice(orderTotal)}</span>
          {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* ── Checkout form ── */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="lg:col-span-3"
          aria-label="Checkout form"
        >
          {/* Contact */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="font-display text-2xl text-ink">
              Contact
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Field label="First name" id="firstName" half>
                <input id="firstName" required value={form.firstName} onChange={set("firstName")} className={inputCls} />
              </Field>
              <Field label="Last name" id="lastName" half>
                <input id="lastName" required value={form.lastName} onChange={set("lastName")} className={inputCls} />
              </Field>
              <Field label="Email" id="email">
                <input id="email" type="email" required value={form.email} onChange={set("email")} className={inputCls} />
              </Field>
              <Field label="Phone" id="phone">
                <input id="phone" type="tel" value={form.phone} onChange={set("phone")} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Shipping address */}
          <section aria-labelledby="address-heading" className="mt-10">
            <h2 id="address-heading" className="font-display text-2xl text-ink">
              Shipping Address
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Field label="Street address" id="address">
                <input id="address" required value={form.address} onChange={set("address")} className={inputCls} />
              </Field>
              <Field label="City" id="city" half>
                <input id="city" required value={form.city} onChange={set("city")} className={inputCls} />
              </Field>
              <Field label="State / Region" id="state" half>
                <input id="state" value={form.state} onChange={set("state")} className={inputCls} />
              </Field>
              <Field label="Postcode" id="postcode" half>
                <input id="postcode" required value={form.postcode} onChange={set("postcode")} className={inputCls} />
              </Field>
              <Field label="Country" id="country" half>
                <select id="country" value={form.country} onChange={set("country")} className={inputCls}>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* Delivery */}
          <section aria-labelledby="delivery-heading" className="mt-10">
            <h2 id="delivery-heading" className="font-display text-2xl text-ink">
              Delivery
            </h2>
            <div className="mt-6 flex flex-col divide-y divide-line border border-line">
              {DELIVERY_OPTIONS.map((opt) => {
                const cost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : opt.price;
                return (
                  <label
                    key={opt.id}
                    htmlFor={`delivery-${opt.id}`}
                    className={`flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors ${
                      form.delivery === opt.id ? "bg-cream" : "hover:bg-cream/50"
                    }`}
                  >
                    <input
                      type="radio"
                      id={`delivery-${opt.id}`}
                      name="delivery"
                      value={opt.id}
                      checked={form.delivery === opt.id}
                      onChange={set("delivery")}
                      className="accent-espresso"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink">{opt.label}</p>
                      <p className="text-xs text-espresso-light">{opt.description}</p>
                    </div>
                    <span className="text-sm text-espresso">
                      {cost === 0 ? "Complimentary" : formatPrice(cost)}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section aria-labelledby="payment-heading" className="mt-10">
            <h2 id="payment-heading" className="font-display text-2xl text-ink">
              Payment
            </h2>
            <p className="mt-1 text-xs text-espresso-light flex items-center gap-1.5">
              <Lock size={12} aria-hidden="true" />
              Your payment details are encrypted and secure.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Field label="Name on card" id="cardName">
                <input id="cardName" required value={form.cardName} onChange={set("cardName")} className={inputCls} />
              </Field>
              <Field label="Card number" id="cardNumber">
                <input
                  id="cardNumber"
                  required
                  maxLength={19}
                  placeholder="•••• •••• •••• ••••"
                  value={form.cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                    const formatted = v.replace(/(.{4})/g, "$1 ").trim();
                    setForm((prev) => ({ ...prev, cardNumber: formatted }));
                  }}
                  className={inputCls + " font-mono tracking-widest"}
                />
              </Field>
              <Field label="Expiry (MM / YY)" id="cardExpiry" half>
                <input
                  id="cardExpiry"
                  required
                  maxLength={7}
                  placeholder="MM / YY"
                  value={form.cardExpiry}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const formatted = v.length > 2 ? `${v.slice(0, 2)} / ${v.slice(2)}` : v;
                    setForm((prev) => ({ ...prev, cardExpiry: formatted }));
                  }}
                  className={inputCls}
                />
              </Field>
              <Field label="CVC" id="cardCvc" half>
                <input
                  id="cardCvc"
                  required
                  maxLength={4}
                  placeholder="•••"
                  value={form.cardCvc}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setForm((prev) => ({ ...prev, cardCvc: v }));
                  }}
                  className={inputCls + " font-mono"}
                />
              </Field>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="mt-10 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso disabled:opacity-60"
          >
            {submitting ? "Processing…" : `Place Order · ${formatPrice(orderTotal)}`}
          </button>

          <p className="mt-4 text-center text-xs text-espresso-light">
            By placing your order you agree to our{" "}
            <Link to="/terms" className="link-underline">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="link-underline">Privacy Policy</Link>.
          </p>
        </form>

        {/* ── Order summary ── */}
        <aside
          className={`lg:col-span-2 ${summaryOpen ? "block" : "hidden lg:block"}`}
          aria-label="Order summary"
        >
          <div className="border border-line p-6">
            <h2 className="font-display text-xl text-ink">Order Summary</h2>

            <ul className="mt-6 flex flex-col divide-y divide-line">
              {lines.map((line) => (
                <li
                  key={`${line.productId}-${line.color}-${line.size}`}
                  className="flex gap-4 py-4"
                >
                  <div className="relative h-20 w-16 shrink-0 bg-cream">
                    <SmartImage
                      src={line.product.images[0]}
                      alt={line.product.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-espresso text-[0.6rem] font-semibold text-ivory">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-semibold text-ink leading-snug">{line.product.name}</p>
                    <p className="mt-0.5 text-xs text-espresso-light">
                      {line.color} · {line.size}
                    </p>
                  </div>
                  <span className="self-center text-sm text-espresso">
                    {formatPrice(line.product.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between text-espresso-light">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-light">
                <span>Shipping</span>
                <span>
                  {deliveryCost === 0
                    ? "Complimentary"
                    : formatPrice(deliveryCost)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 font-display text-lg text-ink">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-espresso-light">
            <Lock size={12} aria-hidden="true" />
            SSL encrypted · Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
