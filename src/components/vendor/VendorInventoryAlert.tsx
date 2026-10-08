import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface AlertItem {
  id: string;
  name: string;
  stock: number;
  status: string;
}

export default function VendorInventoryAlert() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("product_variants")
          .select("id, stock, color, size, products!inner(name, vendor_id)")
          .eq("products.vendor_id", user.id)
          .lte("stock", 5)
          .order("stock", { ascending: true })
          .limit(5);

        if (error) throw error;

        const mapped: AlertItem[] = (data ?? []).map(v => {
          const details = [v.color, v.size].filter(Boolean).join(" ");
          return {
            id: v.id,
            name: `${(v.products as any).name}${details ? ` - ${details}` : ""}`,
            stock: v.stock,
            status: v.stock === 0 ? "Out of Stock" : "Low Stock",
          };
        });
        setAlerts(mapped);
      } catch (err) {
        console.error("Failed to load inventory alerts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [user]);

  return (
    <div className="rounded-xl border border-line bg-ivory p-6 h-full flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={18} />
          <h3 className="font-display text-lg">Inventory Alerts</h3>
        </div>
      </div>

      <ul className="flex-1 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-cream" />
                <div className="h-3 w-16 animate-pulse rounded bg-cream" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded bg-cream" />
            </li>
          ))
        ) : alerts.length === 0 ? (
          <li className="text-sm text-espresso-light text-center py-4">
            No inventory alerts. All products are well stocked.
          </li>
        ) : (
          alerts.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink truncate max-w-[160px]" title={item.name}>
                  {item.name}
                </p>
                <p className={`text-xs mt-0.5 ${item.stock === 0 ? 'text-red-500 font-medium' : 'text-espresso-light'}`}>
                  {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                </p>
              </div>
              <span className={`rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
                item.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
              }`}>
                {item.status}
              </span>
            </li>
          ))
        )}
      </ul>

      <Link 
        to="/vendor/inventory"
        className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-cream/50 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
      >
        Manage Inventory
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
