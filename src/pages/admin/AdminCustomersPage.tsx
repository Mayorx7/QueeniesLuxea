import { useEffect, useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Profile, UserRole } from "../../context/AuthContext";

const ROLES: UserRole[] = ["customer", "vendor", "admin"];
const fullName = (p: Profile) => [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unnamed customer";
const joinedOn = (value: string) => new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(value));

export default function AdminCustomersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]); const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); const [updatingId, setUpdatingId] = useState<string | null>(null); const [error, setError] = useState("");
  useEffect(() => { if (!supabase) return; supabase.from("profiles").select("id, email, first_name, last_name, role, created_at").order("created_at", { ascending: false }).then(({ data, error: loadError }) => { if (loadError) setError(loadError.message); else setProfiles((data ?? []) as Profile[]); setLoading(false); }); }, []);
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return profiles.filter((p) => !query || fullName(p).toLowerCase().includes(query) || p.email?.toLowerCase().includes(query)); }, [profiles, search]);
  const updateRole = async (profile: Profile, role: UserRole) => { if (!supabase || role === profile.role) return; setUpdatingId(profile.id); setError(""); const { data, error: updateError } = await supabase.rpc("update_user_role", { user_id_input: profile.id, role_input: role }); setUpdatingId(null); if (updateError) return setError(updateError.message); setProfiles((current) => current.map((item) => item.id === profile.id ? { ...item, role: (data as Profile).role } : item)); };
  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{ROLES.map((role) => <div key={role} className="rounded-2xl border border-line bg-ivory p-5"><p className="eyebrow text-espresso-light">{role}s</p><p className="mt-1.5 font-display text-2xl capitalize text-ink">{profiles.filter((p) => p.role === role).length}</p></div>)}</div>
    <div className="relative max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full rounded-xl border border-line bg-ivory py-2.5 pl-9 pr-4 text-sm text-ink outline-none placeholder-espresso-light/60 focus:border-champagne" /></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border border-line bg-ivory"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-cream/60"><tr>{["Customer", "Joined", "Role", ""].map((heading) => <th key={heading} className="px-4 py-3.5 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6">{heading}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={4} className="py-16 text-center text-espresso-light">Loading accounts…</td></tr> : filtered.length === 0 ? <tr><td colSpan={4} className="py-16 text-center text-espresso-light">No accounts found.</td></tr> : filtered.map((profile) => <tr key={profile.id} className="border-t border-line transition-colors hover:bg-cream/30"><td className="py-3.5 pl-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream font-display text-sm text-gold">{fullName(profile).split(" ").map((name) => name[0]).join("")}</div><div><p className="font-semibold text-ink">{fullName(profile)}</p><p className="text-xs text-espresso-light">{profile.email || "No email available"}</p></div></div></td><td className="px-4 py-3.5 text-espresso-light">{joinedOn(profile.created_at)}</td><td className="px-4 py-3.5"><select aria-label={`Role for ${fullName(profile)}`} value={profile.role} disabled={updatingId === profile.id} onChange={(e) => void updateRole(profile, e.target.value as UserRole)} className="rounded-lg border border-line bg-cream px-3 py-2 text-sm capitalize text-ink outline-none focus:border-champagne disabled:opacity-60">{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td className="py-3.5 pr-6"><a href={profile.email ? `mailto:${profile.email}` : undefined} className="rounded-lg p-1.5 text-espresso-light transition-colors hover:bg-cream hover:text-ink" aria-label={`Email ${fullName(profile)}`}><Mail size={15} /></a></td></tr>)}
    </tbody></table></div></div>
  </div>;
}
