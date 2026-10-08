import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
import EmptyState from "../components/EmptyState";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  delivery_method: string;
  total: number;
  currency: string;
  created_at: string;
  // aggregate from order_items
  item_count?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:    "bg-amber-50  text-amber-700  border border-amber-200",
  confirmed:  "bg-blue-50   text-blue-700   border border-blue-200",
  processing: "bg-purple-50 text-purple-700 border border-purple-200",
  shipped:    "bg-sky-50    text-sky-700    border border-sky-200",
  delivered:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:  "bg-red-50   text-red-600    border border-red-200",
  refunded:   "bg-slate-100 text-slate-600  border border-slate-200",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Fetch orders + a count of their items in one shot using a relationship
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          payment_status,
          delivery_method,
          total,
          currency,
          created_at,
          order_items(count)
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Supabase returns count as { count: number }[] on aggregated relations
      const mapped: Order[] = (data ?? []).map((row: Record<string, unknown>) => ({
        id:              row.id as string,
        order_number:    row.order_number as string,
        status:          row.status as OrderStatus,
        payment_status:  row.payment_status as string,
        delivery_method: row.delivery_method as string,
        total:           row.total as number,
        currency:        row.currency as string,
        created_at:      row.created_at as string,
        item_count:      Array.isArray(row.order_items)
          ? (row.order_items[0] as { count: number } | undefined)?.count ?? 0
          : 0,
      }));

      setOrders(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fade-in space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-cream" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-line bg-ivory p-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-cream" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-28 rounded bg-cream" />
                <div className="h-3 w-20 rounded bg-cream" />
              </div>
              <div className="h-3.5 w-16 rounded bg-cream" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fade-in rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="fade-in space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-espresso-light">
            Showing <span className="font-semibold text-ink">0</span> orders
          </p>
        </div>
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
      </div>
    );
  }

  // ── Orders list ───────────────────────────────────────────────────────────
  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-light">
          Showing <span className="font-semibold text-ink">{orders.length}</span>{" "}
          {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              to={`/account/orders/${order.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-ivory p-5 transition-shadow hover:shadow-md"
              aria-label={`View order ${order.order_number}`}
            >
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
                <Package size={17} className="text-gold" strokeWidth={1.5} />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base text-ink">{order.order_number}</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${
                      STATUS_BADGE[order.status]
                    }`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-espresso-light">
                  {fmtDate(order.created_at)}
                  {order.item_count !== undefined && order.item_count > 0 && (
                    <> · {order.item_count} {order.item_count === 1 ? "item" : "items"}</>
                  )}
                  {" · "}
                  {order.delivery_method.charAt(0).toUpperCase() + order.delivery_method.slice(1)} delivery
                </p>
              </div>

              {/* Total + chevron */}
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-display text-sm text-ink">
                  {formatPrice(order.total)}
                </span>
                <ChevronRight
                  size={16}
                  className="text-espresso-light transition-transform group-hover:translate-x-0.5"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
