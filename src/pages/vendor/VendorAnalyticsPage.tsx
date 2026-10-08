import { useEffect, useState } from "react";
import { ArrowUpRight, MousePointerClick, ShoppingCart, Users, TrendingUp, BarChart2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

export default function VendorAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    avgOrderValue: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("total_price")
          .eq("vendor_id", user.id);
        
        if (error) throw error;
        
        const orders = data ?? [];
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0);
        
        setStats({
          totalOrders: orders.length,
          totalRevenue,
          avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        });
      } catch (err) {
        console.error("Failed to load vendor analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  const METRICS = [
    { label: "Total Orders", value: stats.totalOrders.toLocaleString(), icon: ShoppingCart },
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp },
    { label: "Avg. Order Value", value: formatPrice(stats.avgOrderValue), icon: ArrowUpRight },
    { label: "Store Visits", value: "—", icon: Users, note: "Requires Analytics" },
  ];

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
              {loading ? (
                <div className="mt-2 h-6 w-20 animate-pulse rounded bg-cream" />
              ) : (
                <p className="mt-0.5 font-display text-xl text-ink">
                  {m.value}
                  {m.note && <span className="ml-2 text-[0.65rem] uppercase tracking-wider text-espresso-light font-sans">{m.note}</span>}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-cream/30 p-10 text-center h-64">
          <BarChart2 size={28} className="text-champagne" />
          <p className="font-semibold text-ink">Sales Overview</p>
          <p className="max-w-xs text-sm text-espresso-light">
            Connect a time-series analytics source to visualise revenue over time.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-cream/30 p-10 text-center h-64">
          <Users size={28} className="text-champagne" />
          <p className="font-semibold text-ink">Traffic by Device</p>
          <p className="max-w-xs text-sm text-espresso-light">
            Integrate an analytics provider to track session and traffic data.
          </p>
        </div>
      </div>
    </div>
  );
}
