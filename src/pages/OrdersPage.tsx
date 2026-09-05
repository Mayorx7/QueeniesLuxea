import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import EmptyState from "../components/EmptyState";

interface DemoOrder {
  id: string;
  date: string;
  status: "Delivered" | "Dispatched" | "Processing" | "Cancelled";
  items: number;
  total: number;
}

const DEMO_ORDERS: DemoOrder[] = [
  { id: "QL-M3F2KZ", date: "28 Aug 2026", status: "Delivered", items: 2, total: 1920 },
  { id: "QL-9XA1PT", date: "14 Jul 2026", status: "Delivered", items: 1, total: 640 },
  { id: "QL-7BC5WY", date: "02 Jun 2026", status: "Delivered", items: 3, total: 2480 },
];

const STATUS_STYLE: Record<DemoOrder["status"], string> = {
  Delivered: "text-emerald-800 bg-emerald-50",
  Dispatched: "text-blue-800 bg-blue-50",
  Processing: "text-amber-800 bg-amber-50",
  Cancelled: "text-red-800 bg-red-50",
};

function formatPrice(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(v);
}

export default function OrdersPage() {
  return (
    <div className="fade-in space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-light">
          Showing <span className="font-semibold text-ink">{DEMO_ORDERS.length}</span> orders
        </p>
      </div>

      {DEMO_ORDERS.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="Your order history will appear here once you make a purchase."
          action={
            <Link to="/shop" className="eyebrow bg-ink px-6 py-3 text-ivory hover:bg-espresso">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
          <ul className="flex flex-col divide-y divide-line">
            {DEMO_ORDERS.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="flex items-center gap-5 px-5 py-5 transition-colors hover:bg-cream/40 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                    <Package size={16} className="text-gold" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-ink">{order.id}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-espresso-light">
                      {order.date} · {order.items} {order.items === 1 ? "item" : "items"} ·{" "}
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-espresso-light" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
