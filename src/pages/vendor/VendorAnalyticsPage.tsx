import { useEffect, useState } from "react";
import { ArrowUpRight, ShoppingCart, Users, TrendingUp, RefreshCw, Package } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";
import VendorStatCard from "../../components/vendor/VendorStatCard";
import VendorSalesOverview from "../../components/vendor/VendorSalesOverview";
import VendorTopProducts from "../../components/vendor/VendorTopProducts";
import DonutChart from "../../components/admin/DonutChart";

// ── Types ────────────────────────────────────────────────────────────────────

interface OrderItemRow {
  total_price: number;
  item_status: string;
  created_at: string;
  order_id: string;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;     // unique orders
  totalUnitsSold: number;
  avgOrderValue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  thisMonthOrders: number;
  lastMonthOrders: number;
}

interface StatusCount {
  label: string;
  value: number;
  color: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:    "#C6A15B",
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

function pctLabel(current: number, previous: number): { text: string; isPositive: boolean } | undefined {
  if (previous === 0) return undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    text: `${pct >= 0 ? "+" : ""}${pct}%`,
    isPositive: pct >= 0,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function VendorAnalyticsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    if (!supabase || !user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("order_items")
        .select("total_price, item_status, created_at, order_id")
        .eq("vendor_id", user.id);

      if (err) throw err;

      const rows = (data ?? []) as OrderItemRow[];
      setItems(rows);

      const thisMonth = monthKey(new Date().toISOString());
      const lastMonth = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1).toISOString());

      const thisRows = rows.filter(r => monthKey(r.created_at) === thisMonth);
      const lastRows = rows.filter(r => monthKey(r.created_at) === lastMonth);

      const uniqueOrders = new Set(rows.map(r => r.order_id)).size;
      const totalRevenue = rows.reduce((s, r) => s + r.total_price, 0);

      setStats({
        totalRevenue,
        totalOrders: uniqueOrders,
        totalUnitsSold: rows.length,
        avgOrderValue: uniqueOrders ? totalRevenue / uniqueOrders : 0,
        thisMonthRevenue: thisRows.reduce((s, r) => s + r.total_price, 0),
        lastMonthRevenue: lastRows.reduce((s, r) => s + r.total_price, 0),
        thisMonthOrders: new Set(thisRows.map(r => r.order_id)).size,
        lastMonthOrders: new Set(lastRows.map(r => r.order_id)).size,
      });

      // Status breakdown
      const statusMap: Record<string, number> = {};
      rows.forEach(r => { statusMap[r.item_status] = (statusMap[r.item_status] ?? 0) + 1; });
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
  }

  useEffect(() => { fetchStats(); }, [user]);

  const revenueChange = stats ? pctLabel(stats.thisMonthRevenue, stats.lastMonthRevenue) : undefined;
  const ordersChange  = stats ? pctLabel(stats.thisMonthOrders,  stats.lastMonthOrders)  : undefined;

  const METRICS = [
    {
      title: "Total Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : "—",
      icon: TrendingUp,
      change: revenueChange?.text,
      isPositive: revenueChange?.isPositive,
    },
    {
      title: "Total Orders",
      value: stats ? stats.totalOrders.toLocaleString() : "—",
      icon: ShoppingCart,
      change: ordersChange?.text,
      isPositive: ordersChange?.isPositive,
    },
    {
      title: "Units Sold",
      value: stats ? stats.totalUnitsSold.toLocaleString() : "—",
      icon: Package,
    },
    {
      title: "Avg. Order Value",
      value: stats ? formatPrice(stats.avgOrderValue) : "—",
      icon: ArrowUpRight,
    },
    {
      title: "Store Visits",
      value: "—",
      icon: Users,
      change: "Connect Analytics",
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-6 pb-10 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">Analytics</h2>
          <p className="mt-1 text-sm text-espresso-light">Deep dive into your store's performance metrics.</p>
        </div>
        <button
          onClick={fetchStats}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {METRICS.map(m => (
          <div key={m.title} className={loading ? "animate-pulse" : ""}>
            {loading ? (
              <div className="rounded-xl border border-line bg-ivory p-5 h-24" />
            ) : (
              <VendorStatCard
                title={m.title}
                value={m.value}
                icon={m.icon}
                change={m.change}
                isPositive={m.isPositive}
              />
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue chart — 3 cols */}
        <div className="lg:col-span-3">
          <VendorSalesOverview totalRevenue={stats?.totalRevenue} />
        </div>

        {/* Item status donut — 2 cols */}
        <div className="rounded-xl border border-line bg-ivory p-6 lg:col-span-2">
          <div className="mb-5">
            <p className="eyebrow text-espresso-light">Fulfilment Status</p>
            <h3 className="mt-0.5 font-display text-lg text-ink">
              {stats ? stats.totalUnitsSold.toLocaleString() : "—"} line items
            </h3>
          </div>
          {loading ? (
            <div className="h-40 animate-pulse rounded-xl bg-cream" />
          ) : statusData.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-espresso-light">
              No order data yet
            </div>
          ) : (
            <DonutChart
              segments={statusData}
              size={140}
              thickness={28}
              centerLabel={stats?.totalUnitsSold.toString()}
              centerSub="items"
            />
          )}
        </div>
      </div>

      {/* This month summary + top products */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* This month panel */}
        <div className="rounded-xl border border-line bg-ivory p-6 lg:col-span-2">
          <p className="eyebrow text-espresso-light mb-4">This Month</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <p className="text-sm text-espresso-light">Revenue</p>
              {loading ? (
                <div className="h-5 w-24 animate-pulse rounded bg-cream" />
              ) : (
                <div className="text-right">
                  <p className="font-semibold text-ink">{formatPrice(stats?.thisMonthRevenue ?? 0)}</p>
                  {revenueChange && (
                    <p className={`text-xs ${revenueChange.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                      {revenueChange.text} vs last month
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <p className="text-sm text-espresso-light">Orders</p>
              {loading ? (
                <div className="h-5 w-16 animate-pulse rounded bg-cream" />
              ) : (
                <div className="text-right">
                  <p className="font-semibold text-ink">{stats?.thisMonthOrders ?? 0}</p>
                  {ordersChange && (
                    <p className={`text-xs ${ordersChange.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                      {ordersChange.text} vs last month
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-espresso-light">Last Month Revenue</p>
              {loading ? (
                <div className="h-5 w-24 animate-pulse rounded bg-cream" />
              ) : (
                <p className="font-semibold text-ink">{formatPrice(stats?.lastMonthRevenue ?? 0)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-3">
          <VendorTopProducts />
        </div>
      </div>

      {/* Monthly order volume bar chart */}
      <div className="rounded-xl border border-line bg-ivory p-6">
        <div className="mb-5">
          <p className="eyebrow text-espresso-light">Order Volume</p>
          <h3 className="mt-0.5 font-display text-lg text-ink">Monthly Items Fulfilled</h3>
        </div>
        {loading ? (
          <div className="h-28 animate-pulse rounded-xl bg-cream" />
        ) : (
          <VendorMonthlyBar items={items} />
        )}
      </div>
    </div>
  );
}

// ── Monthly bar chart (vendor-scoped) ────────────────────────────────────────

function VendorMonthlyBar({ items }: { items: OrderItemRow[] }) {
  function lastNMonthKeys(n: number): string[] {
    const now = new Date();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
  }

  function shortMonth(key: string) {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" });
  }

  const months = lastNMonthKeys(12);
  const countByMonth: Record<string, number> = {};
  items.forEach(r => {
    const k = `${new Date(r.created_at).getFullYear()}-${String(new Date(r.created_at).getMonth() + 1).padStart(2, "0")}`;
    countByMonth[k] = (countByMonth[k] ?? 0) + 1;
  });

  const data = months.map(k => ({ label: shortMonth(k), value: countByMonth[k] ?? 0 }));
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map(d => (
        <div key={d.label} className="group relative flex flex-1 flex-col items-center gap-1">
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10px] text-ivory opacity-0 transition-opacity group-hover:opacity-100 z-10">
            {d.value} items
          </div>
          <div
            className="w-full rounded-t-md bg-gold/70 transition-all duration-300 group-hover:bg-gold"
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
          />
          <span className="text-[9px] text-espresso-light">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
