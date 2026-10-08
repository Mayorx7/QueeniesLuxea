import { useCallback, useEffect, useState } from "react";
import { BarChart2, Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/format";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("total"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (customersRes.error) throw customersRes.error;

      const orders = ordersRes.data ?? [];
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
      setStats({
        totalOrders:   orders.length,
        totalRevenue,
        avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
        totalProducts: productsRes.count ?? 0,
        totalCustomers: customersRes.count ?? 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const kpis = stats
    ? [
        { label: "Total Orders",     value: stats.totalOrders.toLocaleString(),   icon: ShoppingBag },
        { label: "Total Revenue",    value: formatPrice(stats.totalRevenue),       icon: TrendingUp  },
        { label: "Avg. Order Value", value: formatPrice(stats.avgOrderValue),      icon: BarChart2   },
        { label: "Total Products",   value: stats.totalProducts.toLocaleString(),  icon: Package     },
        { label: "Customers",        value: stats.totalCustomers.toLocaleString(), icon: Users       },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Analytics</p>
          <h2 className="mt-1 font-display text-2xl text-ink">Store Overview</h2>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-ivory p-5">
                <div className="h-3 w-16 rounded bg-cream animate-pulse" />
                <div className="mt-3 h-7 w-20 rounded bg-cream animate-pulse" />
              </div>
            ))
          : kpis.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-line bg-ivory p-5">
                <div className="flex items-center justify-between">
                  <p className="eyebrow text-espresso-light">{label}</p>
                  <Icon size={16} className="text-gold" />
                </div>
                <p className="mt-3 font-display text-2xl text-ink">{value}</p>
              </div>
            ))
        }
      </div>

      {/* Charts coming-soon */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-cream/30 p-10 text-center">
          <BarChart2 size={28} className="text-champagne" />
          <p className="font-semibold text-ink">Revenue Chart</p>
          <p className="max-w-xs text-sm text-espresso-light">
            Connect a time-series analytics source (e.g. Supabase Edge Functions or Posthog) to visualise revenue over time.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-cream/30 p-10 text-center">
          <Users size={28} className="text-champagne" />
          <p className="font-semibold text-ink">Traffic Sources</p>
          <p className="max-w-xs text-sm text-espresso-light">
            Integrate an analytics provider (e.g. Plausible or Google Analytics 4) to track session and traffic data.
          </p>
        </div>
      </div>
    </div>
  );
}
