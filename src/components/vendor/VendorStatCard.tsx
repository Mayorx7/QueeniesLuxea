import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface VendorStatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
}

export default function VendorStatCard({ 
  title, 
  value, 
  change, 
  isPositive = true,
  icon: Icon 
}: VendorStatCardProps) {
  return (
    <div className="rounded-xl border border-line bg-ivory p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-espresso-light">{title}</p>
          <p className="mt-2 font-display text-2xl text-ink">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream">
          <Icon size={20} className="text-gold" strokeWidth={1.5} />
        </div>
      </div>
      
      {change && (
        <div className="mt-4 flex items-center gap-1.5">
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}
          </div>
          <span className="text-xs text-espresso-light">this month</span>
        </div>
      )}
    </div>
  );
}
