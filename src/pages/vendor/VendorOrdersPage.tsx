import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Package, RefreshCw, Truck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface VendorOrderItem {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  product_image_url: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_status: ItemStatus;
  tracking_number: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ItemStatus, string> = {
  pending:    "bg-amber-50  text-amber-700  border border-amber-200",
  processing: "bg-purple-50 text-purple-700 border border-purple-200",
  shipped:    "bg-sky-50    text-sky-700    border border-sky-200",
  delivered:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:  "bg-red-50   text-red-600    border border-red-200",
  refunded:   "bg-slate-100 text-slate-600  border border-slate-200",
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
};

// Statuses a vendor can set on an item they own
const NEXT_STATUSES: Partial<Record<ItemStatus, ItemStatus[]>> = {
  pending:    ["processing"],
  processing: ["shipped"],
  shipped:    ["delivered"],
};

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<VendorOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingInputId, setTrackingInputId] = useState<string | null>(null);
  const [trackingValue, setTrackingValue] = useState("");

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    if (!supabase || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      // order_items joined with orders (for order_number + customer)
      // and with profiles (customer name/email)
      const { data, error: err } = await supabase
        .from("order_items")
        .select(`
          id, order_id, product_name, product_image_url, color, size,
          quantity, unit_price, total_price, item_status, tracking_number, created_at,
          orders (
            order_number,
            customer:profiles ( first_name, last_name, email )
          )
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const mapped: VendorOrderItem[] = (data ?? []).map((row) => {
        const order = row.orders as unknown as {
          order_number: string;
          customer: { first_name: string | null; last_name: string | null; email: string | null } | null;
        };
        const customer = order?.customer;
        const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "—";
        return {
          id:               row.id,
          order_id:         row.order_id,
          order_number:     order?.order_number ?? "—",
          customer_name:    name,
          customer_email:   customer?.email ?? "—",
          product_name:     row.product_name,
          product_image_url: row.product_image_url,
          color:            row.color,
          size:             row.size,
          quantity:         row.quantity,
          unit_price:       row.unit_price,
          total_price:      row.total_price,
          item_status:      row.item_status as ItemStatus,
          tracking_number:  row.tracking_number,
          created_at:       row.created_at,
        };
      });
      setItems(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // ── Update item status ──────────────────────────────────────────────────────
  const updateStatus = async (itemId: string, newStatus: ItemStatus, tracking?: string) => {
    if (!supabase) return;
    setUpdatingId(itemId);
    try {
      const { error: err } = await supabase.rpc("vendor_update_order_item_status", {
        item_id_input:         itemId,
        new_status_input:      newStatus,
        tracking_number_input: tracking ?? null,
      });
      if (err) throw err;
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, item_status: newStatus, tracking_number: tracking ?? i.tracking_number }
            : i
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingId(null);
      setTrackingInputId(null);
      setTrackingValue("");
    }
  };

  // ── Filtering + pagination ──────────────────────────────────────────────────
  const filtered = items.filter((i) => {
    const matchStatus =
      statusFilter === "All" || i.item_status === statusFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      i.order_number.toLowerCase().includes(q) ||
      i.customer_name.toLowerCase().includes(q) ||
      i.product_name.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = TABS.reduce((acc, tab) => {
    acc[tab] =
      tab === "All"
        ? items.length
        : items.filter((i) => i.item_status === tab.toLowerCase()).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-7 w-24 animate-pulse rounded bg-cream" />
        <div className="rounded-xl border border-line bg-ivory overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-line">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-cream shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded bg-cream" />
                <div className="h-3 w-24 animate-pulse rounded bg-cream" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-cream" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="font-display text-2xl text-ink">Orders</h2>
        <p className="mt-1 text-sm text-espresso-light">
          Manage and fulfil your customer orders.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={fetchItems} className="flex items-center gap-1.5 font-semibold hover:text-red-900">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Tab counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setPage(1); }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === tab
                ? "bg-ink text-ivory"
                : "bg-cream/60 text-espresso-light hover:text-ink"
            }`}
          >
            {tab}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[0.6rem] ${
              statusFilter === tab ? "bg-white/20 text-ivory" : "bg-cream text-espresso-light"
            }`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        {/* Toolbar */}
        <div className="flex gap-3 border-b border-line p-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input
              type="text"
              placeholder="Search order, customer, or product…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/40 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-6 pr-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-espresso-light">
                      <Package size={32} strokeWidth={1} />
                      <p className="font-medium text-ink">No orders found</p>
                      <p className="text-xs">
                        {items.length === 0
                          ? "Orders from customers will appear here once your products sell."
                          : "Try adjusting your search or filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((item) => {
                  const nextStatuses = NEXT_STATUSES[item.item_status] ?? [];
                  const isShipping = nextStatuses[0] === "shipped";
                  const isUpdating = updatingId === item.id;
                  const showTrackingInput = trackingInputId === item.id;

                  return (
                    <tr key={item.id} className="group hover:bg-cream/30 transition-colors">
                      {/* Product */}
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream border border-line">
                            {item.product_image_url ? (
                              <img src={item.product_image_url} alt={item.product_name}
                                className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package size={15} className="text-espresso-light" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate max-w-[160px]">{item.product_name}</p>
                            <p className="text-xs text-espresso-light">
                              {[item.color, item.size].filter(Boolean).join(" · ")} · Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-xs font-semibold text-ink">{item.order_number}</p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-ink">{item.customer_name}</p>
                        <p className="text-xs text-espresso-light">{item.customer_email}</p>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-espresso-light whitespace-nowrap">
                        {fmtDate(item.created_at)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-medium text-ink">
                        {formatPrice(item.total_price)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[item.item_status]}`}>
                          {STATUS_LABEL[item.item_status]}
                        </span>
                        {item.tracking_number && (
                          <p className="mt-1 flex items-center gap-1 text-[0.65rem] text-sky-700">
                            <Truck size={10} /> {item.tracking_number}
                          </p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pr-6 text-right">
                        {nextStatuses.length > 0 && (
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Tracking number input (shown before marking as shipped) */}
                            {showTrackingInput && isShipping && (
                              <input
                                type="text"
                                placeholder="Tracking number"
                                value={trackingValue}
                                onChange={(e) => setTrackingValue(e.target.value)}
                                className="w-40 rounded-lg border border-line bg-cream/50 px-3 py-1.5 text-xs text-ink outline-none focus:border-champagne"
                                autoFocus
                              />
                            )}
                            <div className="flex items-center gap-1.5">
                              {isShipping && !showTrackingInput && (
                                <button
                                  onClick={() => { setTrackingInputId(item.id); setTrackingValue(""); }}
                                  className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors"
                                >
                                  Mark Shipped
                                </button>
                              )}
                              {showTrackingInput && isShipping && (
                                <>
                                  <button
                                    onClick={() => void updateStatus(item.id, "shipped", trackingValue || undefined)}
                                    disabled={isUpdating}
                                    className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-ivory hover:bg-espresso disabled:opacity-60 transition-colors"
                                  >
                                    {isUpdating ? "Saving…" : "Confirm"}
                                  </button>
                                  <button
                                    onClick={() => setTrackingInputId(null)}
                                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-espresso-light hover:bg-cream"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {!isShipping && (
                                <button
                                  onClick={() => void updateStatus(item.id, nextStatuses[0])}
                                  disabled={isUpdating}
                                  className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-ivory hover:bg-espresso disabled:opacity-60 transition-colors"
                                >
                                  {isUpdating ? "Saving…" : `Mark ${STATUS_LABEL[nextStatuses[0]]}`}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-6 py-3">
            <p className="text-xs text-espresso-light">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg p-1.5 text-espresso-light hover:bg-cream disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                    n === page ? "bg-ink text-ivory" : "text-espresso-light hover:bg-cream"
                  }`}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="rounded-lg p-1.5 text-espresso-light hover:bg-cream disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
