import { useState } from "react";
import { Search, Mail, ShoppingBag, ChevronRight } from "lucide-react";

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  totalSpend: number;
  lastOrder: string;
  tier: "Bronze" | "Silver" | "Gold";
}

const CUSTOMERS: AdminCustomer[] = [
  { id: "c1",  name: "Alexandra Whitmore", email: "a.whitmore@example.com", joined: "Mar 2024", orders: 12, totalSpend: 18240, lastOrder: "28 Aug 2026", tier: "Gold" },
  { id: "c2",  name: "Sophie Laurent",     email: "s.laurent@example.com",  joined: "Jan 2025", orders: 7,  totalSpend: 6480,  lastOrder: "27 Aug 2026", tier: "Silver" },
  { id: "c3",  name: "Imogen Clarke",      email: "i.clarke@example.com",   joined: "Jun 2024", orders: 9,  totalSpend: 10920, lastOrder: "26 Aug 2026", tier: "Gold" },
  { id: "c4",  name: "Celeste Moreau",     email: "c.moreau@example.com",   joined: "Apr 2026", orders: 3,  totalSpend: 2340,  lastOrder: "25 Aug 2026", tier: "Bronze" },
  { id: "c5",  name: "Natasha Volkov",     email: "n.volkov@example.com",   joined: "Nov 2023", orders: 18, totalSpend: 34200, lastOrder: "24 Aug 2026", tier: "Gold" },
  { id: "c6",  name: "Diana Ferreira",     email: "d.ferreira@example.com", joined: "Jul 2025", orders: 4,  totalSpend: 3120,  lastOrder: "23 Aug 2026", tier: "Bronze" },
  { id: "c7",  name: "Elena Marchetti",    email: "e.marchetti@example.com",joined: "Feb 2025", orders: 8,  totalSpend: 9600,  lastOrder: "22 Aug 2026", tier: "Silver" },
  { id: "c8",  name: "Freya Andersen",     email: "f.andersen@example.com", joined: "May 2026", orders: 2,  totalSpend: 960,   lastOrder: "21 Aug 2026", tier: "Bronze" },
  { id: "c9",  name: "Beatrice Romano",    email: "b.romano@example.com",   joined: "Sep 2023", orders: 21, totalSpend: 42000, lastOrder: "20 Aug 2026", tier: "Gold" },
  { id: "c10", name: "Vivienne Dupont",    email: "v.dupont@example.com",   joined: "Dec 2024", orders: 6,  totalSpend: 5400,  lastOrder: "19 Aug 2026", tier: "Silver" },
];

const TIER_BADGE: Record<AdminCustomer["tier"], string> = {
  Gold:   "bg-amber-50 text-amber-700",
  Silver: "bg-slate-100 text-slate-600",
  Bronze: "bg-orange-50 text-orange-700",
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = CUSTOMERS.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const totalRevenue = CUSTOMERS.reduce((s, c) => s + c.totalSpend, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Customers", val: CUSTOMERS.length.toString() },
          { label: "Gold Members",    val: CUSTOMERS.filter((c) => c.tier === "Gold").length.toString() },
          { label: "Avg. LTV",        val: fmt(totalRevenue / CUSTOMERS.length) },
          { label: "Total Revenue",   val: fmt(totalRevenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-ivory p-5">
            <p className="eyebrow text-espresso-light">{s.label}</p>
            <p className="mt-1.5 font-display text-2xl text-ink">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-xl border border-line bg-ivory pl-9 pr-4 py-2.5 text-sm text-ink outline-none placeholder-espresso-light/60 focus:border-champagne"
        />
      </div>

      {/* Customer table */}
      <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60">
              <tr>
                {["Customer", "Joined", "Orders", "Total Spend", "Last Order", "Tier", ""].map((h) => (
                  <th key={h} className="py-3.5 px-4 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-espresso-light">No customers found.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream font-display text-sm text-gold">
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{c.name}</p>
                          <p className="text-xs text-espresso-light">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-espresso-light">{c.joined}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-ink">
                        <ShoppingBag size={12} className="text-gold" />
                        {c.orders}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ink">{fmt(c.totalSpend)}</td>
                    <td className="py-3.5 px-4 text-espresso-light">{c.lastOrder}</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${TIER_BADGE[c.tier]}`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <a href={`mailto:${c.email}`} className="rounded-lg p-1.5 text-espresso-light hover:bg-cream hover:text-ink transition-colors" aria-label="Email customer">
                          <Mail size={15} />
                        </a>
                        <button className="rounded-lg p-1.5 text-espresso-light hover:bg-cream hover:text-ink transition-colors" aria-label="View customer">
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
