import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

const RECENT_ORDERS = [
  { id: "ORD-7291", customer: "Chiamaka Okafor", product: "Silk Evening Gown", date: "Sep 3, 2026", amount: 125000, status: "Pending" },
  { id: "ORD-7290", customer: "Tunde Bakare",    product: "Cashmere Turtleneck", date: "Sep 3, 2026", amount: 85000,  status: "Processing" },
  { id: "ORD-7288", customer: "Aisha Bello",     product: "Pleated Midi Skirt",  date: "Sep 2, 2026", amount: 65000,  status: "Shipped" },
  { id: "ORD-7285", customer: "Folake Davies",   product: "Tailored Wool Blazer",date: "Sep 1, 2026", amount: 145000, status: "Delivered" },
  { id: "ORD-7282", customer: "David Nwachukwu", product: "Silk Evening Gown", date: "Aug 30, 2026",amount: 125000, status: "Cancelled" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Pending:    "bg-slate-100 text-slate-700",
  Processing: "bg-amber-50 text-amber-700",
  Shipped:    "bg-blue-50 text-blue-700",
  Delivered:  "bg-emerald-50 text-emerald-700",
  Cancelled:  "bg-red-50 text-red-700",
};

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
}

export default function VendorRecentOrders() {
  return (
    <div className="rounded-xl border border-line bg-ivory overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-5 sm:px-6">
        <h3 className="font-display text-lg text-ink">Recent Orders</h3>
        <Link to="/vendor/orders" className="text-sm font-medium text-ink hover:underline">
          View All
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider">
            <tr>
              <th className="py-3 pl-6 font-medium">Order ID</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 pr-6 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {RECENT_ORDERS.map((o) => (
              <tr key={o.id} className="hover:bg-cream/30 transition-colors">
                <td className="py-3.5 pl-6 font-medium text-ink">{o.id}</td>
                <td className="py-3.5 px-4 text-ink">{o.customer}</td>
                <td className="py-3.5 px-4 text-espresso-light truncate max-w-[150px]">{o.product}</td>
                <td className="py-3.5 px-4 text-espresso-light">{o.date}</td>
                <td className="py-3.5 px-4 font-medium text-ink">{formatNaira(o.amount)}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[o.status as OrderStatus]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-3.5 pr-6 text-right">
                  <button className="p-1 text-espresso-light hover:text-ink">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="md:hidden divide-y divide-line">
        {RECENT_ORDERS.map((o) => (
          <div key={o.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{o.id}</span>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[o.status as OrderStatus]}`}>
                {o.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{o.customer}</p>
              <p className="text-xs text-espresso-light">{o.product}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-espresso-light">{o.date}</span>
              <span className="font-medium text-ink">{formatNaira(o.amount)}</span>
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-line bg-cream/30 py-2 text-sm font-medium text-ink">
              View Order Details <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
