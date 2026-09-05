import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: number; // percentage, positive = up
  icon: LucideIcon;
  prefix?: string;
  sparkline?: number[]; // 7 relative values for mini sparkline
}

export default function StatCard({ title, value, change, icon: Icon, prefix = "", sparkline }: StatCardProps) {
  const isUp = change > 0;
  const isFlat = change === 0;

  // Build SVG sparkline path
  const buildPath = (data: number[]) => {
    if (!data.length) return "";
    const w = 80, h = 28;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    });
    return `M ${pts.join(" L ")}`;
  };

  const areaPath = (data: number[]) => {
    if (!data.length) return "";
    const w = 80, h = 28;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    });
    return `M 0,${h} L ${pts.join(" L ")} L ${w},${h} Z`;
  };

  return (
    <div className="rounded-2xl border border-line bg-ivory p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow text-espresso-light">{title}</p>
          <p className="mt-1.5 font-display text-3xl text-ink">
            {prefix}{value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream">
          <Icon size={20} className="text-gold" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isFlat
              ? "bg-cream text-espresso-light"
              : isUp
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isFlat ? (
            <Minus size={12} />
          ) : isUp ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {isFlat ? "No change" : `${Math.abs(change)}% vs last month`}
        </span>

        {sparkline && (
          <svg width="80" height="28" viewBox="0 0 80 28" className="opacity-70">
            <defs>
              <linearGradient id={`spark-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a9803f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a9803f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={areaPath(sparkline)}
              fill={`url(#spark-${title.replace(/\s/g, "")})`}
            />
            <path
              d={buildPath(sparkline)}
              fill="none"
              stroke="#a9803f"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
