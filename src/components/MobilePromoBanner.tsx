import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function MobilePromoBanner() {
  return (
    <div className="px-4 pb-2 md:hidden">
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-5"
        style={{
          background:
            "linear-gradient(135deg, var(--color-espresso) 0%, var(--color-espresso-light) 60%, var(--color-champagne) 100%)",
        }}
      >
        {/* Decorative circle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-10"
          style={{ background: "var(--color-gold-light)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-16 h-24 w-24 rounded-full opacity-10"
          style={{ background: "var(--color-champagne-light)" }}
        />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={12} className="text-[var(--color-gold-light)]" aria-hidden="true" />
              <p className="eyebrow text-[0.62rem] text-[var(--color-gold-light)]">
                Fall Collection 2026
              </p>
            </div>
            <h2 className="font-display text-xl leading-tight text-[var(--color-ivory)]">
              Up to 30% Off
            </h2>
            <p className="mt-1 text-[0.72rem] leading-snug text-[var(--color-ivory)]/75">
              Discover our latest curated pieces
            </p>
            <Link
              to="/shop?filter=new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ivory)] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--color-espresso)] transition-opacity hover:opacity-90"
            >
              Shop Now <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
