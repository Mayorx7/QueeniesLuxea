import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Truck, Clock, CheckCircle, ChevronDown } from "lucide-react";

type OrderStatus = "Processing" | "Dispatched" | "Delivered" | "Cancelled";

interface AdminOrderData {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  status: OrderStatus;
  address: string;
  delivery: string;
  items: { name: string; color: string; size: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  timeline: { status: string; date: string; note?: string }[];
}

const DEMO: Record<string, AdminOrderData> = {
  "QL-M3F2KZ": {
    id: "QL-M3F2KZ", customer: "Alexandra Whitmore", email: "a.whitmore@example.com", phone: "+1 212 555 0198",
    date: "28 Aug 2026", status: "Delivered", address: "14 West 57th Street, New York, NY 10019, US", delivery: "Standard",
    items: [
      { name: "Amara Silk Column Gown", color: "Ivory", size: "S", qty: 1, price: 1280 },
      { name: "Calla Linen Blazer",     color: "Espresso", size: "M", qty: 1, price: 640 },
    ],
    subtotal: 1920, shipping: 0, total: 1920,
    timeline: [
      { status: "Order Placed",  date: "25 Aug 2026, 10:14",  note: "Payment confirmed via Visa •••• 4242" },
      { status: "Processing",    date: "25 Aug 2026, 14:30" },
      { status: "Dispatched",    date: "26 Aug 2026, 09:00",  note: "Tracking: DHL • 1Z999AA10123456784" },
      { status: "Delivered",     date: "28 Aug 2026, 14:22",  note: "Left at front door" },
    ],
  },
  "QL-9XA1PT": {
    id: "QL-9XA1PT", customer: "Sophie Laurent", email: "s.laurent@example.com", phone: "+33 6 12 34 56 78",
    date: "27 Aug 2026", status: "Dispatched", address: "8 Rue de Rivoli, 75001 Paris, France", delivery: "Express",
    items: [
      { name: "Verity Wrap Midi Dress", color: "Deep Merlot", size: "S", qty: 1, price: 640 },
    ],
    subtotal: 640, shipping: 18, total: 658,
    timeline: [
      { status: "Order Placed", date: "26 Aug 2026, 08:30", note: "Payment confirmed via Mastercard •••• 7890" },
      { status: "Processing",   date: "26 Aug 2026, 11:00" },
      { status: "Dispatched",   date: "27 Aug 2026, 09:15", note: "Tracking: FedEx • 7489 2345 8901" },
    ],
  },
};

// Fallback order for any other ID
const FALLBACK: AdminOrderData = {
  id: "QL-4D8NXR", customer: "Celeste Moreau", email: "c.moreau@example.com", phone: "+33 1 23 45 67 89",
  date: "25 Aug 2026", status: "Processing", address: "22 Avenue Montaigne, 75008 Paris, France", delivery: "Standard",
  items: [
    { name: "Bastien Crepe Trousers", color: "Onyx", size: "M", qty: 1, price: 480 },
    { name: "Calla Linen Blazer",     color: "Camel", size: "S", qty: 1, price: 415 },
  ],
  subtotal: 895, shipping: 0, total: 895,
  timeline: [
    { status: "Order Placed", date: "25 Aug 2026, 16:20", note: "Payment confirmed" },
    { status: "Processing",   date: "25 Aug 2026, 17:00" },
  ],
};

const STATUS_OPTIONS: OrderStatus[] = ["Processing", "Dispatched", "Delivered", "Cancelled"];
const STATUS_BADGE: Record<OrderStatus, string> = {
  Delivered:  "bg-emerald-50 text-emerald-700",
  Dispatched: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled:  "bg-red-50 text-red-600",
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const base = orderId ? (DEMO[orderId] ?? { ...FALLBACK, id: orderId }) : FALLBACK;
  const [order, setOrder] = useState<AdminOrderData>(base);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const updateStatus = (s: OrderStatus) => {
    setOrder((o) => ({ ...o, status: s }));
    setDropdownOpen(false);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Back + header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-ivory text-espresso-light hover:bg-cream hover:text-ink transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="eyebrow text-gold">Order Reference</p>
            <h2 className="font-display text-2xl text-ink">{order.id}</h2>
          </div>
        </div>

        {/* Status editor */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${STATUS_BADGE[order.status]}`}
          >
            {order.status}
            <ChevronDown size={13} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-line bg-ivory shadow-xl">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-cream first:rounded-t-xl last:rounded-b-xl ${
                    s === order.status ? "text-gold" : "text-espresso-light"
                  }`}
                >
                  {s === order.status && <CheckCircle size={12} className="text-gold" />}
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
            <h3 className="eyebrow border-b border-line px-6 py-4 text-espresso-light">Items</h3>
            <ul className="divide-y divide-line">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream">
                    <Package size={15} className="text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-espresso-light">{item.color} · {item.size} · Qty {item.qty}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{fmt(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-4 space-y-2 text-sm">
              <div className="flex justify-between text-espresso-light">
                <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-light">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Complimentary" : fmt(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5 font-display text-lg text-ink">
                <span>Total</span><span>{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
            <h3 className="eyebrow border-b border-line px-6 py-4 text-espresso-light">Order Timeline</h3>
            <ul className="px-6 py-5 space-y-5">
              {order.timeline.map((t, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${i === order.timeline.length - 1 ? "bg-gold" : "bg-cream"}`}>
                      <Clock size={13} className={i === order.timeline.length - 1 ? "text-ivory" : "text-gold"} />
                    </div>
                    {i < order.timeline.length - 1 && (
                      <div className="mt-1 h-full w-px bg-line" style={{ minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-ink">{t.status}</p>
                    <p className="text-xs text-espresso-light">{t.date}</p>
                    {t.note && <p className="mt-1 text-xs text-espresso-light italic">{t.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: customer + delivery */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="rounded-2xl border border-line bg-ivory p-5">
            <h3 className="eyebrow mb-4 text-espresso-light">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream font-display text-sm text-gold">
                {order.customer.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{order.customer}</p>
                <p className="text-xs text-espresso-light">{order.email}</p>
              </div>
            </div>
            <p className="text-xs text-espresso-light">{order.phone}</p>
            <Link
              to={`/admin/customers`}
              className="mt-3 inline-block eyebrow text-gold hover:text-gold-light transition-colors"
            >
              View Profile →
            </Link>
          </div>

          {/* Delivery address */}
          <div className="rounded-2xl border border-line bg-ivory p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-gold" strokeWidth={1.5} />
              <h3 className="eyebrow text-espresso-light">Delivery Address</h3>
            </div>
            <p className="text-sm text-espresso leading-relaxed">{order.address}</p>
          </div>

          {/* Shipping method */}
          <div className="rounded-2xl border border-line bg-ivory p-5">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={15} className="text-gold" strokeWidth={1.5} />
              <h3 className="eyebrow text-espresso-light">Shipping Method</h3>
            </div>
            <p className="text-sm text-espresso">{order.delivery} Shipping</p>
            <p className="mt-1 text-xs text-espresso-light">
              {order.shipping === 0 ? "Complimentary delivery" : fmt(order.shipping)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
