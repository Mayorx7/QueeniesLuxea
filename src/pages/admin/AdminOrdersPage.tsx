import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/format";

type DbOrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface AdminOrder {
  id: string;
  order_number: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: DbOrderStatus;
}

const STATUS_BADGE: Record<DbOrderStatus, string> = {
  pending:    "bg-slate-100 text-slate-700",
  confirmed:  "bg-indigo-50 text-indigo-700",
  processing: "bg-amber-50 text-amber-700",
  shipped:    "bg-sky-50 text-sky-700",
  delivered:  "bg-emerald-50 text-emerald-700",
  cancelled:  "bg-red-50 text-red-600",
  refunded:   "bg-slate-100 text-slate-600",
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

const STATUSES: ("All" | DbOrderStatus)[] = ["All", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAGE_SIZE = 10;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState<AdminOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<"All" | DbOrderStatus>("All");
  const [page, setPage]           = useState(1);

  const fetchOrders = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("orders")
        .select(`
          id, order_number, created_at, total, status,
          customer:profiles ( first_name, last_name, email )
        `)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const mapped: AdminOrder[] = (data ?? []).map((row) => {
        const c = row.customer as unknown as { first_name: string | null; last_name: string | null; email: string | null } | null;
        const name = [c?.first_name, c?.last_name].filter(Boolean).join(" ") || "Unnamed";
        return {
          id:           row.id,
          order_number: row.order_number,
          customer:     name,
          email:        c?.email ?? "—",
          date:         fmtDate(row.created_at),
          total:        row.total,
          status:       row.status as DbOrderStatus,
        };
      });
      setOrders(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || o.order_number.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-full max-w-sm animate-pulse rounded-xl bg-cream" />
        <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-line animate-pulse bg-cream/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-1.5 font-semibold hover:text-red-900">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order number, customer, email…"
            className="w-full rounded-xl border border-line bg-ivory pl-9 pr-4 py-2.5 text-sm text-ink outline-none placeholder-espresso-light/60 focus:border-champagne transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-espresso-light shrink-0 ml-1" />
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                statusFilter === s
                  ? "bg-ink text-ivory"
                  : "bg-cream text-espresso-light hover:bg-champagne-light hover:text-ink"
              }`}
            >
              {s === "All" ? "All" : STATUS_LABEL[s as DbOrderStatus]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60 border-b border-line">
              <tr>
                {["Order No", "Customer", "Date", "Total", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-4 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-espresso-light">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                paged.map((o) => (
                  <tr key={o.id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-4 pl-6 font-semibold text-ink whitespace-nowrap">
                      <Link to={`/admin/orders/${o.id}`} className="hover:text-gold transition-colors font-mono">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-medium text-ink">{o.customer}</p>
                      <p className="text-xs text-espresso-light">{o.email}</p>
                    </td>
                    <td className="py-4 px-4 text-espresso-light whitespace-nowrap">{o.date}</td>
                    <td className="py-4 px-4 font-semibold text-ink whitespace-nowrap">{formatPrice(o.total)}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="text-xs font-semibold text-gold hover:text-gold-light transition-colors"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-6 py-3 bg-cream/20">
            <p className="text-xs text-espresso-light">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-1.5 text-espresso-light hover:bg-cream disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                    n === page ? "bg-ink text-ivory" : "text-espresso-light hover:bg-cream"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg p-1.5 text-espresso-light hover:bg-cream disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
