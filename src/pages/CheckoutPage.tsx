import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Building2, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SmartImage from "../components/SmartImage";
import EmptyState from "../components/EmptyState";
import { useCart, FREE_SHIPPING_THRESHOLD } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../utils/format";
import { openWhatsAppOrder } from "../utils/whatsapp";

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

const COUNTRIES = [
  "Nigeria", "United States", "United Kingdom", "Canada", "Australia",
  "France", "Germany", "Italy", "Japan", "Netherlands", "Spain",
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function Field({
  label, id, children, half,
}: {
  label: string; id: string; children: React.ReactNode; half?: boolean;
}) {
  return (
    <div className={half ? "sm:col-span-1" : "col-span-1 sm:col-span-2"}>
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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [form, setForm] = useState<ContactForm>({
    firstName: profile?.first_name ?? "",
    lastName:  profile?.last_name  ?? "",
    email:     user?.email         ?? "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  const deliveryCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 14;
  const orderTotal = subtotal + deliveryCost;

  const set = (field: keyof ContactForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!user) {
      setApiError("Please sign in to complete your purchase.");
      return;
    }
    if (!supabase) {
      setApiError("Service unavailable. Please try again later.");
      return;
    }
    const unsupportedLine = lines.find((line) => {
      const productId = line.product.id.startsWith("offer:") ? line.product.id.slice(6) : line.product.id;
      return !UUID_PATTERN.test(productId) || !line.product.vendorId || !UUID_PATTERN.test(line.product.vendorId);
    });
    if (unsupportedLine) {
      setApiError(`“${unsupportedLine.product.name}” is sample catalogue data and cannot be ordered yet. Add it as a vendor product in Supabase before accepting transfer orders.`);
      return;
    }

    setSubmitting(true);

    try {
      const shippingAddress = {
        first_name: form.firstName,
        last_name:  form.lastName,
        address:    form.address,
        city:       form.city,
        state:      form.state,
        country:    form.country,
        phone:      form.phone,
      };

      const cartItems = lines.map((line) => ({
        product_id:        line.product.id.startsWith("offer:") ? null : line.product.id,
        variant_id:        line.variantId ?? null,
        vendor_id:         line.product.vendorId!,
        product_name:      line.product.name,
        product_image_url: line.product.images?.[0] ?? null,
        sku:               line.product.sku ?? null,
        color:             line.color,
        size:              line.size,
        quantity:          line.quantity,
        unit_price:        line.product.price,
      }));

      const { data: order, error } = await supabase.rpc("place_order", {
        cart_items:              cartItems,
        shipping_address_input:  shippingAddress,
        billing_address_input:   null,
        delivery_method_input:   "standard",
        coupon_code_input:       null,
        customer_note_input:     "Payment method: bank transfer",
        payment_reference_input: null,
      });

      if (error) throw error;

      clearCart();
      // The order is pending until its bank transfer has been verified.
      // Take the customer straight to its invoice and payment instructions.
      navigate(`/account/orders/${order.id}`, { replace: true });
    } catch (err: unknown) {
      const message = typeof err === "object" && err && "message" in err && typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Something went wrong. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
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
        {/* Checkout form */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="lg:col-span-3"
          aria-label="Checkout form"
        >
          {/* Guest notice */}
          {!user && (
            <div className="mb-8 border border-gold/40 bg-gold/5 px-5 py-4 text-sm text-espresso">
              <span className="font-semibold">Sign in</span> to save your order history.{" "}
              <Link to="/login" className="link-underline font-semibold">Sign in</Link>{" "}
              or{" "}
              <Link to="/register" className="link-underline font-semibold">create an account</Link>.
            </div>
          )}

          {/* Contact */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="font-display text-2xl text-ink">Contact</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <input id="phone" type="tel" placeholder="WhatsApp number" value={form.phone} onChange={set("phone")} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Shipping address */}
          <section aria-labelledby="address-heading" className="mt-10">
            <h2 id="address-heading" className="font-display text-2xl text-ink">Shipping Address</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Street address" id="address">
                <input id="address" required value={form.address} onChange={set("address")} className={inputCls} />
              </Field>
              <Field label="City" id="city" half>
                <input id="city" required value={form.city} onChange={set("city")} className={inputCls} />
              </Field>
              <Field label="State / Region" id="state" half>
                 <select id="state" required value={form.state} onChange={set("state")} className={inputCls}>
                   <option value="" disabled>Select your state</option>
                   {NIGERIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                 </select>
              </Field>
               <Field label="Country" id="country">
                <select id="country" value={form.country} onChange={set("country")} className={inputCls}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* Payment */}
          <section aria-labelledby="payment-heading" className="mt-10">
             <h2 id="payment-heading" className="font-display text-2xl text-ink">Payment by Bank Transfer</h2>
             <div className="mt-5 flex gap-3 rounded-xl border border-line bg-cream/40 p-5 text-sm text-espresso-light">
               <Building2 size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
               <p>Place your order, then bank-transfer details and delivery arrangements will be shared with you. Your order is confirmed once your transfer is verified.</p>
             </div>
          </section>

          {/* Error banner */}
          {apiError && (
            <div role="alert" className="mt-6 border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-10 w-full bg-ink py-4 text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-espresso disabled:opacity-60"
          >
             {submitting ? "Placing order..." : `Place Transfer Order · ${formatPrice(orderTotal)}`}
          </button>
          <button type="button" onClick={() => openWhatsAppOrder(lines, orderTotal)} className="mt-3 flex w-full items-center justify-center gap-2 border border-[#25D366] py-4 text-xs font-semibold uppercase tracking-widest text-[#128C7E] transition-colors hover:bg-[#25D366]/10"><MessageCircle size={16} />Order via WhatsApp instead</button>

          <p className="mt-4 text-center text-xs text-espresso-light">
            By placing your order you agree to our{" "}
            <Link to="/terms" className="link-underline">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="link-underline">Privacy Policy</Link>.
          </p>
        </form>

        {/* Order summary */}
        <aside className={`lg:col-span-2 ${summaryOpen ? "block" : "hidden lg:block"}`} aria-label="Order summary">
          <div className="border border-line p-6">
            <h2 className="font-display text-xl text-ink">Order Summary</h2>
            <ul className="mt-6 flex flex-col divide-y divide-line">
              {lines.map((line) => (
                <li key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 bg-cream">
                    <SmartImage src={line.product.images[0]} alt={line.product.name} className="h-full w-full object-cover" />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-espresso text-[0.6rem] font-semibold text-ivory">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-semibold text-ink leading-snug">{line.product.name}</p>
                    <p className="mt-0.5 text-xs text-espresso-light">{line.color} · {line.size}</p>
                  </div>
                  <span className="self-center text-sm text-espresso">
                    {formatPrice(line.product.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between text-espresso-light">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-light">
                <span>Shipping</span>
                <span>{deliveryCost === 0 ? "Complimentary" : formatPrice(deliveryCost)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 font-display text-lg text-ink">
                <span>Total</span><span>{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
