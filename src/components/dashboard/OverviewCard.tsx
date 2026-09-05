import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface OverviewCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  to: string;
}

export default function OverviewCard({ title, value, icon: Icon, to }: OverviewCardProps) {
  return (
    <Link 
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-line bg-ivory p-6 transition-all hover:border-gold hover:shadow-[0_4px_20px_-10px_rgba(169,128,63,0.3)]"
    >
      <div>
        <p className="text-sm font-medium text-espresso-light">{title}</p>
        <p className="mt-2 font-display text-3xl text-ink transition-colors group-hover:text-gold">{value}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream transition-transform group-hover:scale-110">
        <Icon size={24} className="text-gold" strokeWidth={1.5} />
      </div>
    </Link>
  );
}
