import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Store, Users, DollarSign, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth, type Profile } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

type DbOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUS_LABEL: Record<DbOrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_BADGE: Record<DbOrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  processing: "bg-purple-50 text-purple-700 border border-purple-200",
  shipped: "bg-sky-50 text-sky-700 border border-sky-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  refunded: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function AdminOverview() {
  const { profile, user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ revenue: 0, orderCount: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    // Load users
    supabase
      .from("profiles")
      .select("id, email, first_name, last_name, role, created_at")
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        else setProfiles((data ?? []) as Profile[]);
      });

    // Load orders (recent 5 for table, and aggregate for metrics)
    supabase
      .from("orders")
      .select("id, order_number, total, status, created_at, profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        else if (data) {
          setRecentOrders(data.slice(0, 5));
          const totalRev = data.reduce((sum, o) => sum + (o.total || 0), 0);
          setMetrics({ revenue: totalRev, orderCount: data.length });
        }
      });
  }, []);

  const name = profile?.first_name || user?.email?.split("@")[0] || "Administrator";
  const count = (role: Profile["role"]) => profiles.filter((item) => item.role === role).length;

  return (
    <div className="space-y-8 fade-in">
      <section className="rounded-2xl border border-line bg-ivory p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-gold">Administration</p>
            <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Welcome, {name}</h2>
            <p className="mt-2 max-w-xl text-sm text-espresso-light">
              Manage the people, orders, and overall performance across QueensLuxea.
            </p>
          </div>
          <Link
            to="/admin/analytics"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-espresso"
          >
            View full analytics <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-ivory p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-espresso-light">Total Revenue</p>
            <DollarSign size={18} className="text-gold" />
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{formatPrice(metrics.revenue)}</p>
        </div>
        
        <div className="rounded-2xl border border-line bg-ivory p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-espresso-light">Total Orders</p>
            <Package size={18} className="text-gold" />
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{metrics.orderCount.toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-line bg-ivory p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-espresso-light">Customers</p>
            <Users size={18} className="text-gold" />
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{count("customer").toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-line bg-ivory p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-espresso-light">Vendors</p>
            <Store size={18} className="text-gold" />
          </div>
          <p className="mt-3 font-display text-3xl text-ink">{count("vendor").toLocaleString()}</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <section className="rounded-2xl border border-line bg-ivory lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-line p-5">
            <h2 className="font-display text-xl text-ink">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-gold transition-colors hover:text-gold-light"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-cream/60 border-b border-line">
                <tr>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-espresso-light">Order</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-espresso-light">Customer</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-espresso-light">Total</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-espresso-light">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-espresso-light">
                      No recent orders.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => {
                    const profileInfo = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
                    const custName = profileInfo 
                      ? [profileInfo.first_name, profileInfo.last_name].filter(Boolean).join(" ") 
                      : "Unknown";
                    
                    return (
                      <tr key={o.id} className="hover:bg-cream/30 transition-colors">
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <Link to={`/admin/orders/${o.id}`} className="font-mono font-semibold text-ink hover:text-gold transition-colors">
                            {o.order_number}
                          </Link>
                          <p className="text-xs text-espresso-light mt-0.5">
                            {new Date(o.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <p className="font-medium text-ink">{custName || "Guest"}</p>
                          {profileInfo?.email && <p className="text-xs text-espresso-light">{profileInfo.email}</p>}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-ink whitespace-nowrap">
                          {formatPrice(o.total)}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[o.status as DbOrderStatus] || "bg-cream text-espresso"}`}>
                            {STATUS_LABEL[o.status as DbOrderStatus] || o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Roles overview */}
        <section className="rounded-2xl border border-line bg-ivory p-6">
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck size={20} className="text-gold" />
            <h2 className="font-display text-xl text-ink">User Access</h2>
          </div>
          <p className="text-sm text-espresso-light mb-6">
            Use the Customers page to search accounts and elevate privileges. 
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-line">
              <span className="text-sm font-medium text-ink">Administrators</span>
              <span className="font-display text-lg text-ink">{count("admin")}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-line">
              <span className="text-sm font-medium text-ink">Vendors</span>
              <span className="font-display text-lg text-ink">{count("vendor")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-ink">Customers</span>
              <span className="font-display text-lg text-ink">{count("customer")}</span>
            </div>
          </div>
          <Link
            to="/admin/customers"
            className="inline-flex items-center justify-center w-full rounded-full border border-line bg-cream px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-champagne hover:text-ink"
          >
            Manage user roles
          </Link>
        </section>
      </div>
    </div>
  );
}
