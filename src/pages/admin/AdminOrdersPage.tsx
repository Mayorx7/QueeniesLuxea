import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type OrderStatus = "All" | "Processing" | "Dispatched" | "Delivered" | "Cancelled";

interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: Exclude<OrderStatus, "All">;
}

const ALL_ORDERS: AdminOrder[] = [
  { id: "QL-M3F2KZ", customer: "Alexandra Whitmore", email: "a.whitmore@example.com", date: "28 Aug 2026", items: 2, total: 1920, status: "Delivered" },
  { id: "QL-9XA1PT", customer: "Sophie Laurent",     email: "s.laurent@example.com",  date: "27 Aug 2026", items: 1, total: 640,  status: "Dispatched" },
  { id: "QL-7BC5WY", customer: "Imogen Clarke",      email: "i.clarke@example.com",   date: "26 Aug 2026", items: 3, total: 2480, status: "Delivered" },
  { id: "QL-4D8NXR", customer: "Celeste Moreau",     email: "c.moreau@example.com",   date: "25 Aug 2026", items: 2, total: 895,  status: "Processing" },
  { id: "QL-2P1QYT", customer: "Natasha Volkov",     email: "n.volkov@example.com",   date: "24 Aug 2026", items: 4, total: 3200, status: "Delivered" },
  { id: "QL-5R9KXB", customer: "Diana Ferreira",     email: "d.ferreira@example.com", date: "23 Aug 2026", items: 1, total: 480,  status: "Cancelled" },
  { id: "QL-8V3MWP", customer: "Elena Marchetti",    email: "e.marchetti@example.com",date: "22 Aug 2026", items: 2, total: 1560, status: "Delivered" },
  { id: "QL-1T6ZQA", customer: "Freya Andersen",     email: "f.andersen@example.com", date: "21 Aug 2026", items: 1, total: 320,  status: "Dispatched" },
  { id: "QL-3C7YNH", customer: "Beatrice Romano",    email: "b.romano@example.com",   date: "20 Aug 2026", items: 3, total: 2240, status: "Delivered" },
  { id: "QL-6J4LES", customer: "Vivienne Dupont",    email: "v.dupont@example.com",   date: "19 Aug 2026", items: 2, total: 1100, status: "Processing" },
  { id: "QL-0X8DFG", customer: "Margot Leclerc",     email: "m.leclerc@example.com",  date: "18 Aug 2026", items: 1, total: 760,  status: "Delivered" },
  { id: "QL-K2H5RU", customer: "Sienna Bianchi",     email: "s.bianchi@example.com",  date: "17 Aug 2026", items: 2, total: 1380, status: "Delivered" },
];

const STATUS_BADGE: Record<AdminOrder["status"], string> = {
  Delivered:  "bg-emerald-50 text-emerald-700",
  Dispatched: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled:  "bg-red-50 text-red-600",
};

const STATUSES: OrderStatus[] = ["All", "Processing", "Dispatched", "Delivered", "Cancelled"];
const PAGE_SIZE = 8;

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function AdminOrdersPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<OrderStatus>("All");
  const [page, setPage]           = useState(1);

  const filtered = ALL_ORDERS.filter((o) => {
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID, customer, email…"
            className="w-full rounded-xl border border-line bg-ivory pl-9 pr-4 py-2.5 text-sm text-ink outline-none placeholder-espresso-light/60 focus:border-champagne"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-espresso-light shrink-0" />
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`eyebrow rounded-full px-3 py-1.5 text-[0.65rem] transition-colors ${
                statusFilter === s
                  ? "bg-ink text-ivory"
                  : "bg-cream text-espresso-light hover:bg-champagne-light hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60">
              <tr>
                {["Order ID", "Customer", "Date", "Items", "Total", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="py-3.5 px-4 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-espresso-light">
                    No orders match your search.
                  </td>
                </tr>
              ) : (
                paged.map((o) => (
                  <tr key={o.id} className="border-t border-line hover:bg-cream/30 transition-colors">
                    <td className="py-4 pl-6 font-semibold text-ink">
                      <Link to={`/admin/orders/${o.id}`} className="hover:text-gold transition-colors">
                        {o.id}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-ink">{o.customer}</p>
                      <p className="text-xs text-espresso-light">{o.email}</p>
                    </td>
                    <td className="py-4 px-4 text-espresso-light">{o.date}</td>
                    <td className="py-4 px-4 text-espresso-light">{o.items}</td>
                    <td className="py-4 px-4 font-semibold text-ink">{fmt(o.total)}</td>
                    <td className="py-4 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="eyebrow text-gold hover:text-gold-light transition-colors"
                      >
                        View →
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
          <div className="flex items-center justify-between border-t border-line px-6 py-3">
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
