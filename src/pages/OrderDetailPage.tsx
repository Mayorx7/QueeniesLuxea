import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  Truck,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type OrderItemStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface OrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  color: string | null;
  size: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_status: OrderItemStatus;
  tracking_number: string | null;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  delivery_method: string;
  shipping_address: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    phone?: string;
  };
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  currency: string;
  coupon_code: string | null;
  customer_note: string | null;
  created_at: string;
}

interface OrderWithItems {
  order: OrderDetail;
  items: OrderItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STEPS: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];

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
    month: "long",
    year: "numeric",
  });
}

function addrLine(addr: OrderDetail["shipping_address"]) {
  const parts = [
    [addr.first_name, addr.last_name].filter(Boolean).join(" "),
    addr.address,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.postcode, addr.country].filter(Boolean).join(", "),
  ].filter(Boolean);
  return parts.join("\n");
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!supabase || !user || !orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: rpcError } = await supabase.rpc("get_order_with_items", {
        order_id_input: orderId,
      });

      if (rpcError) throw rpcError;
      if (!result) throw new Error("Order not found.");

      setData(result as OrderWithItems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ── Cancel order ────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!supabase || !orderId) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const { error: cancelErr } = await supabase.rpc("cancel_order", {
        order_id_input: orderId,
      });
      if (cancelErr) throw cancelErr;
      await fetchOrder(); // refresh
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fade-in space-y-5">
        <div className="h-8 w-40 animate-pulse rounded bg-cream" />
        <div className="h-40 animate-pulse rounded-2xl bg-cream" />
        <div className="h-48 animate-pulse rounded-2xl bg-cream" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fade-in rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={fetchOrder}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
          >
            <RefreshCw size={14} /> Retry
          </button>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-espresso hover:text-ink"
          >
            <ArrowLeft size={14} /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
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

  const { order, items } = data;
  const isCancellable = order.status === "pending" || order.status === "confirmed";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminal = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="fade-in space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Order Reference</p>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{order.order_number}</h2>
          <p className="mt-1 text-sm text-espresso-light">
            Placed {fmtDate(order.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link
            to="/account/orders"
            className="eyebrow hidden items-center gap-1.5 text-espresso-light link-underline hover:text-ink sm:flex"
          >
            <ArrowLeft size={14} />
            All Orders
          </Link>
          <span
            className={`inline-block rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
              STATUS_BADGE[order.status]
            }`}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      {/* ── Status tracker ──────────────────────────────────────────────── */}
      {!isTerminal && (
        <div className="rounded-2xl border border-line bg-ivory p-6">
          <h3 className="mb-5 font-display text-base text-ink">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const done   = currentStepIndex >= 0 && i <= currentStepIndex;
              const active = i === currentStepIndex;
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
                      {done ? (
                        <CheckCircle size={14} />
                      ) : (
                        <span className="text-xs font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[0.62rem] font-semibold uppercase tracking-wide ${
                        done ? "text-gold" : "text-espresso-light"
                      }`}
                    >
                      {STATUS_LABEL[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        currentStepIndex > i ? "bg-gold" : "bg-line"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Pending note */}
          {order.status === "pending" && (
            <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Payment confirmation pending — your order will be confirmed shortly.
            </p>
          )}
        </div>
      )}

      {/* ── Cancelled / Refunded banner ──────────────────────────────────── */}
      {isTerminal && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              This order has been {order.status}.
            </p>
            {order.status === "cancelled" && (
              <p className="mt-1 text-xs text-red-600">
                Any stock held for this order has been released.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Items ───────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-line bg-ivory">
        <h3 className="eyebrow border-b border-line px-5 py-4 text-espresso-light">
          Items ({items.length})
        </h3>
        <ul className="flex flex-col divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              {/* Thumbnail or icon */}
              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                {item.product_image_url ? (
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={16} className="text-gold" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink leading-snug">
                  {item.product_name}
                </p>
                <p className="mt-0.5 text-xs text-espresso-light">
                  {[item.color, item.size].filter(Boolean).join(" · ")}
                  {item.sku && <> · SKU: {item.sku}</>}
                  {" · "}Qty {item.quantity}
                </p>
                {item.tracking_number && (
                  <p className="mt-1 text-[0.65rem] font-medium text-sky-700">
                    Tracking: {item.tracking_number}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm text-espresso">
                {formatPrice(item.total_price)}
              </span>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4 text-sm">
          <div className="flex justify-between text-espresso-light">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-espresso-light">
            <span>Shipping</span>
            <span>
              {order.shipping_fee === 0 ? "Complimentary" : formatPrice(order.shipping_fee)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
              <span>−{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 font-display text-lg text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {/* ── Delivery info ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-2xl border border-line bg-ivory p-5">
          <MapPin size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
          <div>
            <p className="eyebrow mb-1 text-espresso-light">Delivery Address</p>
            <p className="whitespace-pre-line text-sm text-espresso leading-relaxed">
              {addrLine(order.shipping_address)}
            </p>
            {order.shipping_address.phone && (
              <p className="mt-1 text-xs text-espresso-light">
                {order.shipping_address.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-line bg-ivory p-5">
          <Truck size={18} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
          <div>
            <p className="eyebrow mb-1 text-espresso-light">Delivery Method</p>
            <p className="text-sm text-espresso">
              {order.delivery_method.charAt(0).toUpperCase() +
                order.delivery_method.slice(1)}{" "}
              Shipping
            </p>
            <p className="mt-1 text-xs text-espresso-light capitalize">
              Payment:{" "}
              <span className="font-medium text-ink">{order.payment_status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Customer note ────────────────────────────────────────────────── */}
      {order.customer_note && (
        <div className="rounded-2xl border border-line bg-ivory p-5">
          <p className="eyebrow mb-2 text-espresso-light">Your Note</p>
          <p className="text-sm text-espresso italic">"{order.customer_note}"</p>
        </div>
      )}

      {/* ── Cancel order ─────────────────────────────────────────────────── */}
      {isCancellable && (
        <div className="rounded-2xl border border-line bg-ivory p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-amber-500"
              strokeWidth={1.5}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Need to cancel?</p>
              <p className="mt-1 text-xs text-espresso-light">
                You can cancel while your order is pending or confirmed. After processing
                begins, cancellation is no longer available.
              </p>
              {cancelError && (
                <p className="mt-2 text-xs text-red-600">{cancelError}</p>
              )}
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="mt-3 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-60 transition-colors"
              >
                {cancelling ? "Cancelling…" : "Cancel this order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile back link */}
      <Link
        to="/account/orders"
        className="eyebrow flex items-center gap-1.5 text-espresso-light link-underline hover:text-ink sm:hidden"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={14} />
        All Orders
      </Link>
    </div>
  );
}
