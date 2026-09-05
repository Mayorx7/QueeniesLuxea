import { DollarSign, ShoppingBag, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import RevenueChart from "../../components/admin/RevenueChart";
import DonutChart from "../../components/admin/DonutChart";

// ── Mock data ──────────────────────────────────────────────
const SPARKLINE_REVENUE = [42, 55, 48, 70, 65, 82, 78];
const SPARKLINE_ORDERS  = [12, 18, 14, 22, 19, 25, 21];
const SPARKLINE_USERS   = [5, 8, 6, 9, 11, 10, 14];
const SPARKLINE_AOV     = [310, 290, 340, 325, 360, 345, 380];

// 30-day revenue data
const REVENUE_DATA = (() => {
  const months = ["Aug 5","Aug 7","Aug 9","Aug 11","Aug 13","Aug 15","Aug 17","Aug 19",
                  "Aug 21","Aug 23","Aug 25","Aug 27","Aug 29","Aug 31","Sep 1","Sep 3"];
  const vals   = [3200,4100,3800,5200,4700,6100,5800,7200,6500,8100,7400,9200,8600,10400,9800,11200];
  return months.map((label, i) => ({ label, value: vals[i] }));
})();

const ORDER_DONUT = [
  { label: "Delivered",  value: 284, color: "#10b981" },
  { label: "Processing", value: 63,  color: "#a9803f" },
  { label: "Dispatched", value: 41,  color: "#3b82f6" },
  { label: "Cancelled",  value: 18,  color: "#ef4444" },
];

const RECENT_ORDERS = [
  { id: "QL-M3F2KZ", customer: "Alexandra Whitmore", total: 1920, status: "Delivered",  date: "28 Aug 2026" },
  { id: "QL-9XA1PT", customer: "Sophie Laurent",     total: 640,  status: "Dispatched", date: "27 Aug 2026" },
  { id: "QL-7BC5WY", customer: "Imogen Clarke",      total: 2480, status: "Delivered",  date: "26 Aug 2026" },
  { id: "QL-4D8NXR", customer: "Celeste Moreau",     total: 895,  status: "Processing", date: "25 Aug 2026" },
  { id: "QL-2P1QYT", customer: "Natasha Volkov",     total: 3200, status: "Delivered",  date: "24 Aug 2026" },
];

const TOP_PRODUCTS = [
  { name: "Amara Silk Column Gown",    revenue: 38400, sold: 30, img: "https://images.unsplash.com/photo-1566160983935-8659b85c884d?q=80&w=100&auto=format&fit=crop" },
  { name: "Verity Wrap Midi Dress",    revenue: 28160, sold: 44, img: "https://images.unsplash.com/photo-1583391733958-650fac5ceb1c?q=80&w=100&auto=format&fit=crop" },
  { name: "Calla Linen Blazer",        revenue: 22400, sold: 35, img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=100&auto=format&fit=crop" },
  { name: "Riviera Knit Cardigan",     revenue: 18240, sold: 24, img: "https://images.unsplash.com/photo-1624623278313-a930126a11c3?q=80&w=100&auto=format&fit=crop" },
];

const STATUS_BADGE: Record<string, string> = {
  Delivered:  "bg-emerald-50 text-emerald-700",
  Dispatched: "bg-blue-50 text-blue-700",
  Processing: "bg-amber-50 text-amber-700",
  Cancelled:  "bg-red-50 text-red-600",
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue"   value="$124,850" change={18}  icon={DollarSign} sparkline={SPARKLINE_REVENUE} />
        <StatCard title="Total Orders"    value="406"      change={12}  icon={ShoppingBag} sparkline={SPARKLINE_ORDERS} />
        <StatCard title="New Customers"   value="143"      change={9}   icon={Users}        sparkline={SPARKLINE_USERS} />
        <StatCard title="Avg. Order Value" value="$307"    change={5}   icon={TrendingUp}   sparkline={SPARKLINE_AOV} />
      </div>

      {/* Revenue chart + donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-line bg-ivory p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-ink">Revenue</h2>
              <p className="text-xs text-espresso-light mt-0.5">Last 30 days</p>
            </div>
            <span className="eyebrow rounded-full bg-cream px-3 py-1.5 text-espresso-light">
              Aug – Sep 2026
            </span>
          </div>
          <RevenueChart data={REVENUE_DATA} height={200} />
        </div>

        <div className="rounded-2xl border border-line bg-ivory p-6">
          <h2 className="mb-5 font-display text-lg text-ink">Order Status</h2>
          <DonutChart
            segments={ORDER_DONUT}
            size={140}
            thickness={28}
            centerLabel={String(ORDER_DONUT.reduce((s, d) => s + d.value, 0))}
            centerSub="orders"
          />
        </div>
      </div>

      {/* Recent orders + Top products */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent orders */}
        <div className="lg:col-span-3 rounded-2xl border border-line bg-ivory overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg text-ink">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="eyebrow flex items-center gap-1 text-gold hover:text-gold-light transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/50">
                <tr>
                  {["Order", "Customer", "Total", "Status", "Date"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="border-t border-line hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 pl-6 font-medium text-ink">
                      <Link to={`/admin/orders/${o.id}`} className="hover:text-gold transition-colors">
                        {o.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-espresso-light">{o.customer}</td>
                    <td className="py-3.5 px-4 text-ink font-medium">{fmt(o.total)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 text-espresso-light">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-ivory overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-lg text-ink">Top Products</h2>
            <Link to="/admin/products" className="eyebrow flex items-center gap-1 text-gold hover:text-gold-light transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {TOP_PRODUCTS.map((p, i) => (
              <li key={p.name} className="flex items-center gap-4 px-6 py-4 hover:bg-cream/30 transition-colors">
                <span className="font-display text-xl text-espresso-light/40 w-5 shrink-0">{i + 1}</span>
                <img src={p.img} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-espresso-light">{p.sold} sold</p>
                </div>
                <span className="text-sm font-semibold text-ink shrink-0">{fmt(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
