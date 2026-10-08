import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
  img: string | null;
}

export default function VendorTopProducts() {
  const { user } = useAuth();
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProducts() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("product_name, product_image_url, quantity, total_price")
          .eq("vendor_id", user.id);

        if (error) throw error;

        const agg = new Map<string, TopProduct>();

        (data ?? []).forEach(row => {
          const existing = agg.get(row.product_name);
          if (existing) {
            existing.sold += row.quantity;
            existing.revenue += row.total_price;
          } else {
            agg.set(row.product_name, {
              name: row.product_name,
              sold: row.quantity,
              revenue: row.total_price,
              img: row.product_image_url,
            });
          }
        });

        const sorted = Array.from(agg.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(sorted);
      } catch (err) {
        console.error("Failed to load top products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopProducts();
  }, [user]);

  return (
    <div className="rounded-xl border border-line bg-ivory overflow-hidden h-full flex flex-col">
      <div className="border-b border-line p-5">
        <h3 className="font-display text-lg text-ink">Top Selling Products</h3>
      </div>
      
      <ul className="flex-1 divide-y divide-line overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 p-5">
              <div className="h-10 w-10 rounded-lg bg-cream animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-cream animate-pulse" />
                <div className="h-3 w-16 rounded bg-cream animate-pulse" />
              </div>
            </li>
          ))
        ) : topProducts.length === 0 ? (
          <li className="p-8 text-center text-espresso-light flex flex-col items-center">
            <Package size={24} className="mb-2 opacity-50" />
            <p className="text-sm">No sales data available yet.</p>
          </li>
        ) : (
          topProducts.map((p, i) => (
            <li key={p.name} className="flex items-center gap-4 p-5 hover:bg-cream/30 transition-colors">
              <span className="font-display text-lg text-espresso-light/40 w-4 text-right shrink-0">{i + 1}</span>
              {p.img ? (
                <img src={p.img} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-cream flex items-center justify-center shrink-0">
                  <Package size={14} className="text-espresso-light" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-espresso-light">{p.sold} units sold</p>
              </div>
              <span className="text-sm font-semibold text-ink shrink-0">{formatPrice(p.revenue)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
