import { useState } from "react";
import { Store, Globe, Bell, Users, Plus, Trash2, CheckCircle, Save } from "lucide-react";

interface TeamMember { id: string; name: string; email: string; role: "Admin" | "Editor" | "Viewer"; }

const INITIAL_TEAM: TeamMember[] = [
  { id: "tm1", name: "Super Admin",    email: "admin@queensluxea.com",    role: "Admin" },
  { id: "tm2", name: "Grace Hollis",   email: "g.hollis@queensluxea.com", role: "Editor" },
  { id: "tm3", name: "Louis Bernard",  email: "l.bernard@queensluxea.com",role: "Viewer" },
];

const ROLE_BADGE = {
  Admin:  "bg-gold/10 text-gold",
  Editor: "bg-blue-50 text-blue-700",
  Viewer: "bg-cream text-espresso-light",
};

export default function AdminSettingsPage() {
  const [storeName,   setStoreName]  = useState("QueenLuxea");
  const [storeURL,    setStoreURL]   = useState("queensluxea.com");
  const [currency,    setCurrency]   = useState("USD");
  const [timezone,    setTimezone]   = useState("Europe/London");
  const [saved,       setSaved]      = useState(false);

  const [team, setTeam]             = useState(INITIAL_TEAM);
  const [notifs, setNotifs]         = useState({ newOrder: true, lowStock: true, newCustomer: false, refund: true });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ── Store Details ── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <Store size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl text-ink">Store Details</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="storeName" className="eyebrow text-espresso-light">Store Name</label>
              <input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink outline-none focus:border-champagne focus:bg-ivory"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="storeURL" className="eyebrow text-espresso-light">Store URL</label>
              <div className="flex rounded-lg border border-line bg-cream/40 focus-within:border-champagne focus-within:bg-ivory overflow-hidden">
                <span className="flex items-center pl-3 text-sm text-espresso-light">https://</span>
                <input
                  id="storeURL"
                  value={storeURL}
                  onChange={(e) => setStoreURL(e.target.value)}
                  className="flex-1 bg-transparent px-2 py-3 text-sm text-ink outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currency" className="eyebrow text-espresso-light">Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink outline-none focus:border-champagne focus:bg-ivory"
              >
                {["USD", "GBP", "EUR", "JPY", "AED"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="timezone" className="eyebrow text-espresso-light">Timezone</label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="rounded-lg border border-line bg-cream/40 px-4 py-3 text-sm text-ink outline-none focus:border-champagne focus:bg-ivory"
              >
                {["Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "Asia/Dubai"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory transition-all hover:bg-espresso hover:scale-[1.02]"
            >
              <Save size={14} />
              Save Changes
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle size={14} />
                Saved
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ── Notifications ── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <Bell size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl text-ink">Admin Notifications</h2>
        </div>
        <ul className="divide-y divide-line">
          {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => {
            const labels: Record<keyof typeof notifs, { label: string; desc: string }> = {
              newOrder:    { label: "New Order",        desc: "Notify me when a new order is placed" },
              lowStock:    { label: "Low Stock Alert",  desc: "Alert when product stock drops below 5" },
              newCustomer: { label: "New Customer",     desc: "Notify me when a new account is created" },
              refund:      { label: "Refund Request",   desc: "Alert when a customer requests a refund" },
            };
            return (
              <li key={key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{labels[key].label}</p>
                  <p className="mt-0.5 text-xs text-espresso-light">{labels[key].desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={val}
                  onClick={() => setNotifs((n) => ({ ...n, [key]: !val }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    val ? "border-gold bg-gold" : "border-line bg-cream"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-ivory shadow-sm transition-transform ${val ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Team Members ── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
              <Users size={16} className="text-gold" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-xl text-ink">Team Members</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-4 py-2 text-sm font-medium text-ink hover:bg-champagne-light transition-colors">
            <Plus size={13} />
            Invite
          </button>
        </div>

        <ul className="divide-y divide-line">
          {team.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream font-display text-sm text-gold">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{m.name}</p>
                  <p className="text-xs text-espresso-light">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${ROLE_BADGE[m.role]}`}>
                  {m.role}
                </span>
                {m.role !== "Admin" && (
                  <button
                    onClick={() => setTeam((t) => t.filter((x) => x.id !== m.id))}
                    aria-label={`Remove ${m.name}`}
                    className="text-espresso-light hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Storefront ── */}
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <Globe size={16} className="text-gold" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl text-ink">Storefront</h2>
        </div>
        <p className="mb-5 text-sm text-espresso-light">Manage the public-facing store status and maintenance mode.</p>
        <div className="flex flex-wrap gap-3">
          <button className="eyebrow inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-ivory hover:bg-espresso transition-colors">
            <Globe size={13} />
            View Live Store
          </button>
          <button className="eyebrow inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-2.5 text-amber-700 hover:bg-amber-100 transition-colors">
            Enable Maintenance Mode
          </button>
        </div>
      </section>
    </div>
  );
}
