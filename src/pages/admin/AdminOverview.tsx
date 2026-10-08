import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth, type Profile } from "../../context/AuthContext";

export default function AdminOverview() {
  const { profile, user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { if (!supabase) return; supabase.from("profiles").select("id, email, first_name, last_name, role, created_at").then(({ data, error: loadError }) => { if (loadError) setError(loadError.message); else setProfiles((data ?? []) as Profile[]); }); }, []);
  const name = profile?.first_name || user?.email?.split("@")[0] || "Administrator";
  const count = (role: Profile["role"]) => profiles.filter((item) => item.role === role).length;
  return <div className="space-y-8">
    <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="eyebrow text-gold">Administration</p><h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Welcome, {name}</h2><p className="mt-2 max-w-xl text-sm text-espresso-light">Manage the people and access levels across QueensLuxea. All new accounts are customers until an administrator changes their role.</p></div><Link to="/admin/customers" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-espresso">Manage user roles <ArrowRight size={16} /></Link></div></section>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <section className="grid gap-4 sm:grid-cols-3"><Summary label="Customers" value={count("customer")} icon={Users} /><Summary label="Vendors" value={count("vendor")} icon={Store} /><Summary label="Administrators" value={count("admin")} icon={ShieldCheck} /></section>
    <section className="rounded-2xl border border-line bg-ivory p-6"><h2 className="font-display text-xl text-ink">User access</h2><p className="mt-2 text-sm text-espresso-light">Use the Customers page to search accounts and change a user’s role. The database rejects role changes from anyone who is not an administrator.</p><Link to="/admin/customers" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-colors hover:text-gold-light">Open user management <ArrowRight size={15} /></Link></section>
  </div>;
}

function Summary({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return <div className="rounded-2xl border border-line bg-ivory p-5"><div className="flex items-center justify-between"><p className="eyebrow text-espresso-light">{label}</p><Icon size={18} className="text-gold" /></div><p className="mt-3 font-display text-3xl text-ink">{value}</p></div>;
}
