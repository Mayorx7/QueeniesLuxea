import { useCallback, useEffect, useState } from "react";
import { BarChart2, Package, ShoppingBag, Users, TrendingUp, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/format";
import RevenueChart from "../../components/admin/RevenueChart";
import DonutChart from "../../components/admin/DonutChart";
import StatCard from "../../components/admin/StatCard";

// ── Types ────────────────────────────────────────────────────────────────────

interface OrderRow {
  total: number;
  status: string;
  created_at: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalProducts: number;
  totalCustomers: number;
  // month-over-month deltas (compared to previous calendar month)
  ordersChange: number;
  revenueChange: number;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface StatusCount {
  label: string;
  value: number;
  color: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:    "#C6A15B",
  confirmed:  "#3B82F6",
  processing: "#8B5CF6",
  shipped:    "#F59E0B",
  delivered:  "#10B981",
  cancelled:  "#EF4444",
  refunded:   "#6B7280",
};

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortMonth(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" });
}

/** Last N calendar months including current, sorted oldest → newest */
function lastNMonthKeys(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("total, status, created_at"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (customersRes.error) throw customersRes.error;

      const rows = (ordersRes.data ?? []) as OrderRow[];
      setOrders(rows);

      // ── KPI stats ────────────────────────────────────────────────────────
      const totalRevenue = rows.reduce((s, o) => s + (o.total ?? 0), 0);
      const totalOrders = rows.length;

      const thisMonth = monthKey(new Date().toISOString());
      const lastMonth = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1).toISOString());

      const thisOrders = rows.filter(o => monthKey(o.created_at) === thisMonth);
      const lastOrders = rows.filter(o => monthKey(o.created_at) === lastMonth);

      setStats({
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        totalProducts: productsRes.count ?? 0,
        totalCustomers: customersRes.count ?? 0,
        ordersChange: pctChange(thisOrders.length, lastOrders.length),
        revenueChange: pctChange(
          thisOrders.reduce((s, o) => s + o.total, 0),
          lastOrders.reduce((s, o) => s + o.total, 0)
        ),
      });

      // ── Revenue chart — last 12 months ───────────────────────────────────
      const months = lastNMonthKeys(12);
      const revenueByMonth: Record<string, number> = {};
      rows.forEach(o => {
        const k = monthKey(o.created_at);
        revenueByMonth[k] = (revenueByMonth[k] ?? 0) + o.total;
      });
      setChartData(
        months.map(k => ({ label: shortMonth(k), value: revenueByMonth[k] ?? 0 }))
      );

      // ── Order status breakdown (donut) ───────────────────────────────────
      const statusMap: Record<string, number> = {};
      rows.forEach(o => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
      setStatusData(
        Object.entries(statusMap)
          .filter(([, count]) => count > 0)
          .map(([status, count]) => ({
            label: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            color: STATUS_COLORS[status] ?? "#C6A15B",
          }))
          .sort((a, b) => b.value - a.value)
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived sparklines (last 7 months of order counts) ───────────────────
  const months7 = lastNMonthKeys(7);
  const countByMonth: Record<string, number> = {};
  orders.forEach(o => { const k = monthKey(o.created_at); countByMonth[k] = (countByMonth[k] ?? 0) + 1; });
  const ordersSparkline = months7.map(k => countByMonth[k] ?? 0);

  const revenueByMonth7: Record<string, number> = {};
  orders.forEach(o => { const k = monthKey(o.created_at); revenueByMonth7[k] = (revenueByMonth7[k] ?? 0) + o.total; });
  const revenueSparkline = months7.map(k => revenueByMonth7[k] ?? 0);

  const kpis = stats
    ? [
        {
          title: "Total Orders",
          value: stats.totalOrders.toLocaleString(),
          change: stats.ordersChange,
          icon: ShoppingBag,
          sparkline: ordersSparkline,
        },
        {
          title: "Total Revenue",
          value: formatPrice(stats.totalRevenue),
          change: stats.revenueChange,
          icon: TrendingUp,
          sparkline: revenueSparkline,
        },
        {
          title: "Avg. Order Value",
          value: formatPrice(stats.avgOrderValue),
          change: 0,
          icon: BarChart2,
        },
        {
          title: "Total Products",
          value: stats.totalProducts.toLocaleString(),
          change: 0,
          icon: Package,
        },
        {
          title: "Customers",
          value: stats.totalCustomers.toLocaleString(),
          change: 0,
          icon: Users,
        },
      ]
    : [];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold">Analytics</p>
          <h2 className="mt-1 font-display text-2xl text-ink">Store Overview</h2>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-line bg-ivory px-4 py-2 text-sm text-espresso-light transition-colors hover:border-champagne hover:text-ink disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
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
          : kpis.map((kpi) => (
              <StatCard key={kpi.title} {...kpi} />
            ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue over time — spans 3 cols */}
        <div className="rounded-2xl border border-line bg-ivory p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow text-espresso-light">Revenue</p>
              <h3 className="mt-0.5 font-display text-lg text-ink">Last 12 Months</h3>
            </div>
            {stats && (
              <p className="font-display text-2xl text-ink">{formatPrice(stats.totalRevenue)}</p>
            )}
          </div>
          {loading ? (
            <div className="h-48 animate-pulse rounded-xl bg-cream" />
          ) : chartData.every(d => d.value === 0) ? (
            <div className="flex h-48 items-center justify-center text-sm text-espresso-light">
              No revenue data yet
            </div>
          ) : (
            <RevenueChart data={chartData} height={190} />
          )}
        </div>

        {/* Order status donut — spans 2 cols */}
        <div className="rounded-2xl border border-line bg-ivory p-6 lg:col-span-2">
          <div className="mb-5">
            <p className="eyebrow text-espresso-light">Orders by Status</p>
            <h3 className="mt-0.5 font-display text-lg text-ink">
              {stats ? stats.totalOrders.toLocaleString() : "—"} total
            </h3>
          </div>
          {loading ? (
            <div className="h-48 animate-pulse rounded-xl bg-cream" />
          ) : statusData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-espresso-light">
              No orders yet
            </div>
          ) : (
            <DonutChart
              segments={statusData}
              size={148}
              thickness={30}
              centerLabel={stats?.totalOrders.toString()}
              centerSub="orders"
            />
          )}
        </div>
      </div>

      {/* Monthly orders bar — simple SVG */}
      <div className="rounded-2xl border border-line bg-ivory p-6">
        <div className="mb-5">
          <p className="eyebrow text-espresso-light">Order Volume</p>
          <h3 className="mt-0.5 font-display text-lg text-ink">Monthly Order Count</h3>
        </div>
        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-cream" />
        ) : (
          <MonthlyBarChart data={chartData.map((d, i) => ({ label: d.label, value: countByMonth[lastNMonthKeys(12)[i]] ?? 0 }))} />
        )}
      </div>
    </div>
  );
}

// ── Inline bar chart for order counts ────────────────────────────────────────
function MonthlyBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center gap-1">
            {/* Tooltip */}
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] text-ivory opacity-0 transition-opacity group-hover:opacity-100 z-10">
              {d.value} orders
            </div>
            <div
              className="w-full rounded-t-md bg-gold/70 transition-all duration-300 group-hover:bg-gold"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-[9px] text-espresso-light">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
