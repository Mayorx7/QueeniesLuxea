import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

const ALL_ORDERS = [
  { id: "ORD-7291", customer: "Chiamaka Okafor", product: "Silk Evening Gown", items: 1, date: "Sep 3, 2026", amount: 125000, status: "Pending" },
  { id: "ORD-7290", customer: "Tunde Bakare",    product: "Cashmere Turtleneck", items: 2, date: "Sep 3, 2026", amount: 170000, status: "Processing" },
  { id: "ORD-7288", customer: "Aisha Bello",     product: "Pleated Midi Skirt", items: 1, date: "Sep 2, 2026", amount: 65000,  status: "Shipped" },
  { id: "ORD-7285", customer: "Folake Davies",   product: "Tailored Wool Blazer",items: 1, date: "Sep 1, 2026", amount: 145000, status: "Delivered" },
  { id: "ORD-7282", customer: "David Nwachukwu", product: "Silk Evening Gown", items: 1, date: "Aug 30, 2026",amount: 125000, status: "Cancelled" },
  { id: "ORD-7280", customer: "Grace Ibekwe",    product: "Linen Summer Blazer", items: 1, date: "Aug 29, 2026",amount: 85000, status: "Delivered" },
  { id: "ORD-7275", customer: "Samuel Ojo",      product: "Velvet Wrap Coat", items: 1, date: "Aug 27, 2026",amount: 210000, status: "Delivered" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending:    "bg-slate-100 text-slate-700",
  Processing: "bg-amber-50 text-amber-700",
  Shipped:    "bg-blue-50 text-blue-700",
  Delivered:  "bg-emerald-50 text-emerald-700",
  Cancelled:  "bg-red-50 text-red-700",
};

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
}

export default function VendorOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = ALL_ORDERS.filter(o => {
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                        o.customer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="font-display text-2xl text-ink">Orders</h2>
        <p className="mt-1 text-sm text-espresso-light">Manage and fulfill your customer orders.</p>
      </div>

      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === tab ? "bg-ink text-ivory" : "bg-cream/50 text-espresso-light hover:text-ink"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
              {filteredOrders.length === 0 ? (
                <tr className="flex sm:table-row">
                  <td colSpan={7} className="py-10 text-center text-espresso-light w-full">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                    <td className="py-2 sm:py-3.5 sm:pl-6 font-medium text-ink flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Order ID:</span>
                      {o.id}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-ink flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Customer:</span>
                      {o.customer}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Date:</span>
                      {o.date}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Items:</span>
                      {o.items}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 font-medium text-ink flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Total:</span>
                      {formatNaira(o.amount)}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 flex justify-between items-center sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Status:</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[o.status as OrderStatus]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 sm:py-3.5 sm:pr-6 text-left sm:text-right border-t border-line sm:border-0 mt-3 sm:mt-0 pt-4 sm:pt-0">
                      <button className="flex items-center justify-center w-full sm:w-auto gap-2 rounded-lg bg-cream/50 px-4 py-2 sm:p-1.5 text-sm sm:text-base font-medium sm:font-normal text-ink sm:text-espresso-light sm:hover:bg-cream sm:hover:text-ink sm:bg-transparent">
                        <span className="sm:hidden">Manage Order</span>
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between border-t border-line p-5">
            <span className="text-sm text-espresso-light">Showing 1 to {filteredOrders.length} of {filteredOrders.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 text-espresso-light opacity-50 cursor-not-allowed">
                <ChevronLeft size={18} />
              </button>
              <button className="rounded-md bg-ink w-8 h-8 flex items-center justify-center text-xs font-medium text-ivory">1</button>
              <button className="rounded-md p-1.5 text-espresso-light opacity-50 cursor-not-allowed">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
