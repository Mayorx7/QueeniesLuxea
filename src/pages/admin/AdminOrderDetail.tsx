import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Truck, CheckCircle, ChevronDown, RefreshCw, AlertTriangle, User } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/format";

type DbOrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface DbOrder {
  id: string;
  order_number: string;
  customer_id: string;
  status: DbOrderStatus;
  payment_status: string;
  delivery_method: string;
  shipping_address: any;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  created_at: string;
}

interface DbOrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_status: string;
}

interface CustomerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

const STATUS_OPTIONS: DbOrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const STATUS_BADGE: Record<DbOrderStatus, string> = {
  pending:    "bg-slate-100 text-slate-700 border border-slate-200",
  confirmed:  "bg-indigo-50 text-indigo-700 border border-indigo-200",
  processing: "bg-amber-50 text-amber-700 border border-amber-200",
  shipped:    "bg-sky-50 text-sky-700 border border-sky-200",
  delivered:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:  "bg-red-50 text-red-600 border border-red-200",
  refunded:   "bg-slate-100 text-slate-600 border border-slate-200",
};
const STATUS_LABEL: Record<DbOrderStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [items, setItems] = useState<DbOrderItem[]>([]);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!supabase || !orderId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc("get_order_with_items", { order_id_input: orderId });
      if (err) throw err;
      if (!data || !data.order) throw new Error("Order not found.");

      const o = data.order as DbOrder;
      setOrder(o);
      setItems((data.items ?? []) as DbOrderItem[]);

      // Fetch customer separately if needed, since the RPC doesn't embed it deeply
      if (o.customer_id) {
        const { data: cData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone")
          .eq("id", o.customer_id)
          .single();
        if (cData) setCustomer(cData as CustomerProfile);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrderDetails(); }, [fetchOrderDetails]);

  const updateStatus = async (s: DbOrderStatus) => {
    if (!supabase || !order) return;
    setDropdownOpen(false);
    setUpdating(true);
    try {
      const { data, error: err } = await supabase.rpc("admin_update_order_status", {
        order_id_input: order.id,
        new_status_input: s,
      });
      if (err) throw err;
      if (data) {
        setOrder(data as DbOrder);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-cream" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 animate-pulse rounded-2xl bg-cream/50" />
          </div>
          <div className="space-y-5">
            <div className="h-40 animate-pulse rounded-2xl bg-cream/50" />
            <div className="h-32 animate-pulse rounded-2xl bg-cream/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle className="text-red-600" />
          <p className="text-red-700 font-medium">{error || "Order not found."}</p>
        </div>
        <Link to="/admin/orders" className="text-gold font-medium hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={16} /> Back to orders
        </Link>
      </div>
    );
  }

  const cName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "Unnamed";
  const address = order.shipping_address as { address?: string; city?: string; state?: string; country?: string; postcode?: string };
  const addressLine = [address?.address, address?.city, address?.state, address?.postcode, address?.country].filter(Boolean).join(", ");

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Back + header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            to="/admin/orders"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-ivory text-espresso-light hover:bg-cream hover:text-ink transition-colors mt-1"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="eyebrow text-gold mb-1">Order Reference</p>
            <h2 className="font-display text-2xl text-ink font-mono">{order.order_number}</h2>
            <p className="text-sm text-espresso-light mt-0.5">Placed on {fmtDate(order.created_at)}</p>
          </div>
        </div>

        {/* Status editor */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            disabled={updating}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all ${STATUS_BADGE[order.status]} hover:brightness-95 disabled:opacity-70`}
          >
            {updating ? "Updating..." : STATUS_LABEL[order.status]}
            <ChevronDown size={14} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-xl border border-line bg-ivory shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-line bg-cream/30">
                <p className="text-[0.65rem] font-semibold text-espresso-light uppercase tracking-wider">Change Status</p>
              </div>
              <div className="p-1">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-cream ${
                      s === order.status ? "text-gold bg-gold/5" : "text-espresso-light"
                    }`}
                  >
                    {s === order.status ? <CheckCircle size={14} className="text-gold" /> : <div className="w-[14px]" />}
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchOrderDetails} className="text-red-700 hover:text-red-900 font-medium text-sm flex items-center gap-1">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + totals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
            <h3 className="eyebrow border-b border-line px-6 py-4 text-espresso-light">Items ({items.length})</h3>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream border border-line flex items-center justify-center">
                      {item.product_image_url ? (
                        <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <Package size={18} className="text-espresso-light" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{item.product_name}</p>
                      <p className="text-xs text-espresso-light mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-48 shrink-0 mt-3 sm:mt-0 pl-16 sm:pl-0">
                    <span className="text-sm text-espresso-light">Qty {item.quantity}</span>
                    <span className="text-sm font-semibold text-ink">{formatPrice(item.total_price)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5 space-y-2.5 text-sm bg-cream/10">
              <div className="flex justify-between text-espresso-light">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-light">
                <span>Shipping ({order.delivery_method})</span>
                <span>{order.shipping_fee === 0 ? "Complimentary" : formatPrice(order.shipping_fee)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-3 font-display text-xl text-ink">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: customer + delivery */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-ivory p-6">
            <h3 className="eyebrow mb-5 text-espresso-light flex items-center gap-2">
              <User size={15} /> Customer
            </h3>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream border border-line font-display text-base text-gold">
                {cName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{cName}</p>
                <p className="text-xs text-espresso-light truncate">{customer?.email}</p>
              </div>
            </div>
            {customer?.phone && (
              <p className="text-sm text-espresso-light mb-4">{customer.phone}</p>
            )}
            <Link
              to="/admin/customers"
              className="inline-flex items-center justify-center w-full rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-cream transition-colors"
            >
              View Profile
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-ivory p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-gold" strokeWidth={1.5} />
              <h3 className="eyebrow text-espresso-light">Delivery Address</h3>
            </div>
            <p className="text-sm text-espresso leading-relaxed">{addressLine}</p>
          </div>

          <div className="rounded-2xl border border-line bg-ivory p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={15} className="text-gold" strokeWidth={1.5} />
              <h3 className="eyebrow text-espresso-light">Shipping Method</h3>
            </div>
            <p className="text-sm text-espresso font-medium capitalize">{order.delivery_method} Shipping</p>
            <p className="mt-1 text-xs text-espresso-light">
              {order.shipping_fee === 0 ? "Complimentary delivery" : formatPrice(order.shipping_fee)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
