import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-line px-6 py-20 text-center">
      <Icon size={28} className="text-gold" strokeWidth={1.3} />
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-espresso-light">{message}</p>
      {action}
    </div>
  );
}
