import RevenueChart from "../../components/admin/RevenueChart";
import DonutChart from "../../components/admin/DonutChart";

// ── 30-day revenue ────────────────────────────────────────
const REVENUE_30 = (() => {
  const labels = ["Aug 5","Aug 7","Aug 9","Aug 11","Aug 13","Aug 15","Aug 17","Aug 19",
                  "Aug 21","Aug 23","Aug 25","Aug 27","Aug 29","Aug 31","Sep 1","Sep 3"];
  const vals   = [3200,4100,3800,5200,4700,6100,5800,7200,6500,8100,7400,9200,8600,10400,9800,11200];
  return labels.map((label, i) => ({ label, value: vals[i] }));
})();

// ── Category revenue share ────────────────────────────────
const CATEGORY_DONUT = [
  { label: "Dresses",     value: 66560, color: "#a9803f" },
  { label: "Tops",        value: 40960, color: "#cbb48b" },
  { label: "Bottoms",     value: 18240, color: "#e3d6bd" },
  { label: "Outerwear",   value: 12600, color: "#3a2a1e" },
  { label: "Accessories", value: 9240,  color: "#5c4632" },
];

// ── Traffic sources ───────────────────────────────────────
const TRAFFIC = [
  { source: "Organic Search",  sessions: 4820, share: 42 },
  { source: "Direct",          sessions: 2310, share: 20 },
  { source: "Social Media",    sessions: 1960, share: 17 },
  { source: "Email Campaign",  sessions: 1380, share: 12 },
  { source: "Referral",        sessions: 1030, share: 9  },
];

// ── KPI metrics ───────────────────────────────────────────
const KPIS = [
  { label: "Conversion Rate",  value: "3.4%",   note: "+0.4% vs prev period" },
  { label: "Avg. Session Time",value: "4m 12s", note: "–8s vs prev period"  },
  { label: "Bounce Rate",      value: "28.6%",  note: "–1.2% vs prev period" },
  { label: "Returning Customers", value: "64%", note: "+3% vs prev period"  },
];

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Period banner */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-light">
          Reporting period: <span className="font-semibold text-ink">1 Aug 2026 – 3 Sep 2026</span>
        </p>
        <span className="eyebrow rounded-full bg-cream px-3 py-1.5 text-espresso-light">Last 34 days</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-ivory p-5">
            <p className="eyebrow text-espresso-light">{k.label}</p>
            <p className="mt-1.5 font-display text-2xl text-ink">{k.value}</p>
            <p className="mt-1 text-xs text-espresso-light">{k.note}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-line bg-ivory p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-ink">Revenue Over Time</h2>
            <p className="text-xs text-espresso-light mt-0.5">Daily revenue, last 34 days</p>
          </div>
          <p className="font-display text-2xl text-gold">
            {fmt(REVENUE_30.reduce((s, d) => s + d.value, 0))}
          </p>
        </div>
        <RevenueChart data={REVENUE_30} height={220} />
      </div>

      {/* Category + Traffic */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category donut */}
        <div className="rounded-2xl border border-line bg-ivory p-6">
          <h2 className="mb-5 font-display text-lg text-ink">Revenue by Category</h2>
          <DonutChart
            segments={CATEGORY_DONUT}
            size={150}
            thickness={30}
            centerLabel={fmt(CATEGORY_DONUT.reduce((s, d) => s + d.value, 0))}
            centerSub="total"
          />
        </div>

        {/* Traffic sources */}
        <div className="rounded-2xl border border-line bg-ivory p-6">
          <h2 className="mb-5 font-display text-lg text-ink">Traffic Sources</h2>
          <ul className="space-y-4">
            {TRAFFIC.map((t) => (
              <li key={t.source}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{t.source}</span>
                  <span className="text-espresso-light">{t.sessions.toLocaleString()} sessions · {t.share}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-700"
                    style={{ width: `${t.share}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
