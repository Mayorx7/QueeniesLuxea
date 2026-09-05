import { useParams, Link } from "react-router-dom";
import { Package, MapPin, Truck, ArrowLeft, CheckCircle } from "lucide-react";

function formatPrice(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(v);
}

interface DemoOrderDetail {
  id: string;
  date: string;
  status: "Processing" | "Dispatched" | "Delivered" | "Cancelled";
  address: string;
  delivery: string;
  items: { name: string; color: string; size: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}

const STATUS_STEPS = ["Processing", "Dispatched", "Delivered"] as const;

const DEMO_DETAIL: Record<string, DemoOrderDetail> = {
  "QL-M3F2KZ": {
    id: "QL-M3F2KZ",
    date: "28 Aug 2026",
    status: "Delivered",
    address: "14 West 57th Street, New York, NY 10019, United States",
    delivery: "Standard",
    items: [
      { name: "Amara Silk Column Gown", color: "Ivory", size: "S", qty: 1, price: 1280 },
      { name: "Calla Linen Blazer", color: "Espresso", size: "M", qty: 1, price: 640 },
    ],
    subtotal: 1920,
    shipping: 0,
    total: 1920,
  },
  "QL-9XA1PT": {
    id: "QL-9XA1PT",
    date: "14 Jul 2026",
    status: "Delivered",
    address: "14 West 57th Street, New York, NY 10019, United States",
    delivery: "Express",
    items: [{ name: "Verity Wrap Midi Dress", color: "Deep Merlot", size: "S", qty: 1, price: 640 }],
    subtotal: 640,
    shipping: 18,
    total: 658,
  },
  "QL-7BC5WY": {
    id: "QL-7BC5WY",
    date: "02 Jun 2026",
    status: "Delivered",
    address: "14 West 57th Street, New York, NY 10019, United States",
    delivery: "Standard",
    items: [
      { name: "Bastien Crepe Trousers", color: "Onyx", size: "M", qty: 1, price: 480 },
      { name: "Riviera Knit Cardigan", color: "Sand", size: "S", qty: 1, price: 760 },
      { name: "Soleil Straw Hat", color: "Natural", size: "One Size", qty: 1, price: 1240 },
    ],
    subtotal: 2480,
    shipping: 0,
    total: 2480,
  },
};

const STATUS_BADGE: Record<DemoOrderDetail["status"], string> = {
  Delivered: "text-emerald-800 bg-emerald-50",
  Dispatched: "text-blue-800 bg-blue-50",
  Processing: "text-amber-800 bg-amber-50",
  Cancelled: "text-red-800 bg-red-50",
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = orderId ? DEMO_DETAIL[orderId] : null;

  if (!order) {
    return (
      <div className="fade-in py-16 text-center">
        <p className="text-sm text-espresso-light">Order not found.</p>
        <Link
          to="/account/orders"
          className="eyebrow mt-4 inline-block link-underline text-espresso hover:text-gold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);

  return (
    <div className="fade-in space-y-6">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Order Reference</p>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{order.id}</h2>
          <p className="mt-1 text-sm text-espresso-light">
            Placed {order.date}
          </p>
        </div>
        <Link
          to="/account/orders"
          className="eyebrow hidden items-center gap-1.5 text-espresso-light link-underline hover:text-ink sm:flex shrink-0"
        >
          <ArrowLeft size={14} />
          All Orders
        </Link>
      </div>

      {/* Status tracker */}
      {order.status !== "Cancelled" && (
        <div className="rounded-2xl border border-line bg-ivory p-6">
          <h3 className="mb-5 font-display text-base text-ink">Order Status</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                        done
                          ? "border-gold bg-gold text-ivory"
                          : "border-line bg-cream text-espresso-light"
                      } ${active ? "ring-4 ring-gold/20" : ""}`}
                    >
                      {done ? <CheckCircle size={14} /> : <span className="text-xs font-semibold">{i + 1}</span>}
                    </div>
                    <span className={`text-[0.65rem] font-semibold uppercase tracking-wide ${done ? "text-gold" : "text-espresso-light"}`}>
                      {step}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 transition-colors ${i < currentStep ? "bg-gold" : "bg-line"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <section className="rounded-2xl border border-line bg-ivory overflow-hidden">
        <h3 className="eyebrow border-b border-line px-5 py-4 text-espresso-light">Items</h3>
        <ul className="flex flex-col divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream">
                <Package size={15} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{item.name}</p>
                <p className="mt-0.5 text-xs text-espresso-light">
                  {item.color} · {item.size} · Qty {item.qty}
                </p>
              </div>
              <span className="text-sm text-espresso">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 text-sm">
          <div className="flex justify-between text-espresso-light">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-espresso-light">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 font-display text-lg text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {/* Delivery details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-2xl border border-line bg-ivory p-5">
          <MapPin size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
          <div>
            <p className="eyebrow mb-1 text-espresso-light">Delivery Address</p>
            <p className="text-sm text-espresso leading-relaxed">{order.address}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-line bg-ivory p-5">
          <Truck size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
          <div>
            <p className="eyebrow mb-1 text-espresso-light">Delivery Method</p>
            <p className="text-sm text-espresso">{order.delivery} Shipping</p>
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[order.status]}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
