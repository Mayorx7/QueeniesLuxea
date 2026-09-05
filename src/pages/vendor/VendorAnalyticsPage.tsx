import { ArrowUpRight, MousePointerClick, ShoppingCart, Users } from "lucide-react";
import VendorSalesOverview from "../../components/vendor/VendorSalesOverview";

const METRICS = [
  { label: "Store Visits", value: "24,892", icon: Users },
  { label: "Conversion Rate", value: "3.2%", icon: MousePointerClick },
  { label: "Add to Carts", value: "1,240", icon: ShoppingCart },
  { label: "Avg. Order Value", value: "₦145,000", icon: ArrowUpRight },
];

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="font-display text-2xl text-ink">Analytics</h2>
        <p className="mt-1 text-sm text-espresso-light">Deep dive into your store's performance metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map(m => (
          <div key={m.label} className="rounded-xl border border-line bg-ivory p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cream">
              <m.icon size={24} className="text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-espresso-light">{m.label}</p>
              <p className="mt-0.5 font-display text-xl text-ink">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <VendorSalesOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Breakdown */}
        <div className="rounded-xl border border-line bg-ivory p-6">
          <h3 className="font-display text-lg text-ink mb-6">Traffic by Device</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative h-40 w-40 shrink-0">
              {/* Very Simple SVG Donut */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbf8f3" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#14100d" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="75.36" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a9803f" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="175.84" />
              </svg>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-ink"></span>Mobile</span>
                  <span className="font-medium text-ink">70%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gold"></span>Desktop</span>
                  <span className="font-medium text-ink">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-xl border border-line bg-ivory p-6">
          <h3 className="font-display text-lg text-ink mb-6">Sales by Category</h3>
          <div className="space-y-5">
            {[
              { name: "Dresses", pct: 65, amount: "₦812,500" },
              { name: "Tops", pct: 20, amount: "₦250,000" },
              { name: "Outerwear", pct: 15, amount: "₦187,500" },
            ].map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-ink">{cat.name}</span>
                  <span className="text-espresso-light">{cat.amount}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-cream overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${cat.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
