import { useEffect, useState, useMemo } from "react";
import { Search, Mail, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpend: number;
  lastOrder: string;
}

export default function VendorCustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!supabase || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("order_items")
        .select(`
          total_price, created_at,
          orders (
            customer:profiles ( id, first_name, last_name, email )
          )
        `)
        .eq("vendor_id", user.id);

      if (err) throw err;

      const customerMap = new Map<string, Customer>();

      (data ?? []).forEach((row) => {
        const order = row.orders as any;
        const profile = order?.customer;
        if (!profile) return;
        const id = profile.id;
        
        const existing = customerMap.get(id);
        const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed";
        const date = new Date(row.created_at);

        if (existing) {
          existing.orders += 1;
          existing.totalSpend += row.total_price;
          if (new Date(existing.lastOrder) < date) {
            existing.lastOrder = date.toISOString();
          }
        } else {
          customerMap.set(id, {
            id,
            name,
            email: profile.email || "No email",
            orders: 1,
            totalSpend: row.total_price,
            lastOrder: date.toISOString(),
          });
        }
      });

      setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpend - a.totalSpend));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const filtered = useMemo(() => customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  ), [customers, search]);




  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="font-display text-2xl text-ink">Customers</h2>
        <p className="mt-1 text-sm text-espresso-light">View and manage customers who have purchased from your store.</p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertTriangle size={16} /><span>{error}</span></div>
          <button onClick={fetchCustomers} className="flex items-center gap-1.5 font-semibold hover:text-red-900">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-line p-5">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Orders</th>
                <th className="py-3 px-4 font-medium">Total Spend</th>
                <th className="py-3 px-4 font-medium">Last Order</th>
                <th className="py-3 pr-6 font-medium text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
              {loading ? (
                <tr className="flex sm:table-row">
                  <td colSpan={5} className="py-10 text-center text-espresso-light w-full">Loading customers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr className="flex sm:table-row">
                  <td colSpan={5} className="py-10 text-center text-espresso-light w-full">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                    <td className="py-3.5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-gold font-display text-sm">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{c.name}</p>
                          <p className="text-xs text-espresso-light">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Orders:</span>
                      {c.orders}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 font-medium text-ink flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Total Spend:</span>
                      {formatPrice(c.totalSpend)}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Last Order:</span>
                      {new Date(c.lastOrder).toLocaleDateString()}
                    </td>
                    <td className="py-3 sm:py-3.5 sm:pr-6 text-left sm:text-right border-t border-line sm:border-0 mt-3 sm:mt-0 pt-4 sm:pt-0">
                      <div className="flex items-center justify-start sm:justify-end gap-2">
                        <a href={`mailto:${c.email}`} className="flex items-center gap-2 rounded-lg bg-cream/50 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream transition-colors">
                          <Mail size={14} />
                          <span className="sm:hidden">Email</span>
                        </a>
                        <button className="flex items-center gap-2 rounded-lg bg-cream/50 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream transition-colors">
                          <ExternalLink size={14} />
                          <span className="sm:hidden">View</span>
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
