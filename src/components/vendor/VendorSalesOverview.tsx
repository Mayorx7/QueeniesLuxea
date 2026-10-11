import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";
import RevenueChart from "../admin/RevenueChart";

interface SalesDataPoint {
  label: string;
  value: number;
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortMonth(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" });
}

function lastNMonthKeys(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

interface VendorSalesOverviewProps {
  totalRevenue?: number;
}

export default function VendorSalesOverview({ totalRevenue }: VendorSalesOverviewProps) {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("total_price, created_at")
          .eq("vendor_id", user.id);

        if (error) throw error;

        const months = lastNMonthKeys(12);
        const revenueByMonth: Record<string, number> = {};
        (data ?? []).forEach(row => {
          const k = monthKey(row.created_at);
          revenueByMonth[k] = (revenueByMonth[k] ?? 0) + (row.total_price ?? 0);
        });

        setChartData(months.map(k => ({ label: shortMonth(k), value: revenueByMonth[k] ?? 0 })));
      } catch (err) {
        console.error("Failed to load sales chart data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, [user]);

  const hasData = chartData.some(d => d.value > 0);

  return (
    <div className="rounded-xl border border-line bg-ivory p-6 h-full flex flex-col">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-espresso-light">Revenue</p>
          <h3 className="mt-0.5 font-display text-lg text-ink">Last 12 Months</h3>
        </div>
        {totalRevenue !== undefined && (
          <p className="font-display text-2xl text-ink">{formatPrice(totalRevenue)}</p>
        )}
      </div>

      <div className="flex-1 min-h-[220px] flex items-center justify-center">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-cream min-h-[180px]" />
        ) : !hasData ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium text-ink">No revenue yet</p>
            <p className="max-w-xs text-sm text-espresso-light">
              Revenue data will appear here once you start receiving orders.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <RevenueChart data={chartData} height={200} />
          </div>
        )}
      </div>
    </div>
  );
}
