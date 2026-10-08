import { BarChart2 } from "lucide-react";

export default function VendorSalesOverview() {
  return (
    <div className="rounded-xl border border-line bg-ivory p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg text-ink">Sales Overview</h3>
          <p className="text-sm text-espresso-light mt-0.5">Revenue and orders over time</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-cream/30 p-10 text-center min-h-[300px]">
        <BarChart2 size={32} className="text-champagne" />
        <p className="font-semibold text-ink">Analytics Chart</p>
        <p className="max-w-sm text-sm text-espresso-light">
          Connect a time-series analytics source (like Supabase Edge Functions or Posthog) to visualise daily revenue and order trends.
        </p>
      </div>
    </div>
  );
}
