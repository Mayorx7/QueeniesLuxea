import { ArrowRight, MoreHorizontal, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface VendorRecentOrdersProps {
  orders?: any[];
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-blue-50 text-blue-700 border-blue-200",
  delivered:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
  refunded:   "bg-slate-100 text-slate-700 border-slate-200",
};

export default function VendorRecentOrders({ orders }: VendorRecentOrdersProps) {
  // If no orders prop is passed, it might be loading or we can default to empty array
  const displayOrders = orders || [];

  return (
    <div className="rounded-xl border border-line bg-ivory overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-5 sm:px-6">
        <h3 className="font-display text-lg text-ink">Recent Orders</h3>
        <Link to="/vendor/orders" className="text-sm font-medium text-ink hover:underline">
          View All
        </Link>
      </div>

      {displayOrders.length === 0 ? (
        <div className="p-8 text-center text-espresso-light flex flex-col items-center">
          <Package size={24} className="mb-2 opacity-50" />
          <p>No recent orders found.</p>
        </div>
      ) : (
        <>
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
                {displayOrders.map((o) => {
                  const status = o.item_status as OrderStatus;
                  const dateStr = new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  return (
                    <tr key={o.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-3.5 pl-6 font-medium text-ink font-mono text-xs">{o.order_number}</td>
                      <td className="py-3.5 px-4 text-ink">{o.customer_name}</td>
                      <td className="py-3.5 px-4 text-espresso-light truncate max-w-[150px]">{o.product_name}</td>
                      <td className="py-3.5 px-4 text-espresso-light">{dateStr}</td>
                      <td className="py-3.5 px-4 font-medium text-ink">{formatPrice(o.total_price)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center border rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 text-right">
                        <Link to="/vendor/orders" className="p-1 text-espresso-light hover:text-ink inline-block">
                          <MoreHorizontal size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-line">
            {displayOrders.map((o) => {
              const status = o.item_status as OrderStatus;
              const dateStr = new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
              return (
                <div key={o.id} className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-ink">{o.order_number}</span>
                    <span className={`inline-flex items-center border rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}>
                      {status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{o.customer_name}</p>
                    <p className="text-xs text-espresso-light">{o.product_name}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-espresso-light">{dateStr}</span>
                    <span className="font-medium text-ink">{formatPrice(o.total_price)}</span>
                  </div>
                  <Link to="/vendor/orders" className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-line bg-cream/30 py-2 text-sm font-medium text-ink">
                    View Order Details <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
