import { useEffect, useState } from "react";
import { Edit2, Eye, Trash2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  img: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-slate-100 text-slate-700",
  archived: "bg-red-50 text-red-700",
};

export default function VendorProductOverview() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            id, name, category, price, status,
            product_images ( url, display_order ),
            product_variants ( stock )
          `)
          .eq("vendor_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) throw error;

        const mapped: ProductRow[] = (data ?? []).map(p => {
          const stock = (p.product_variants ?? []).reduce((sum, v) => sum + (v.stock ?? 0), 0);
          const images = [...(p.product_images ?? [])].sort(
            (a, b) => (a as any).display_order - (b as any).display_order
          );
          
          return {
            id: p.id,
            name: p.name,
            category: p.category || "Uncategorized",
            price: p.price,
            stock,
            status: p.status,
            img: images[0]?.url || null,
          };
        });

        setProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch recent products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [user]);



  return (
    <div className="rounded-xl border border-line bg-ivory overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-5 sm:px-6">
        <h3 className="font-display text-lg text-ink">My Products</h3>
        <Link to="/vendor/products" className="text-sm font-medium text-ink hover:underline">
          View All Products
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
            <tr>
              <th className="py-3 pl-6 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Price</th>
              <th className="py-3 px-4 font-medium">Stock</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 pr-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
            {loading ? (
              <tr className="flex sm:table-row">
                <td colSpan={6} className="py-10 text-center text-espresso-light text-sm">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr className="flex sm:table-row">
                <td colSpan={6} className="py-10 text-center text-espresso-light text-sm">
                  No products found. Add your first product to get started.
                </td>
              </tr>
            ) : products.map((p) => (
              <tr key={p.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                <td className="py-3.5 sm:pl-6">
                  <div className="flex items-center gap-3">
                    {p.img ? (
                      <img src={p.img} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-cream flex items-center justify-center">
                        <Package size={16} className="text-espresso-light" />
                      </div>
                    )}
                    <span className="font-medium text-ink max-w-[140px] truncate" title={p.name}>{p.name}</span>
                  </div>
                </td>
                <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light text-xs sm:text-sm">{p.category}</td>
                <td className="py-1 sm:py-3.5 sm:px-4 font-medium text-ink">{formatPrice(p.price)}</td>
                <td className={`py-1 sm:py-3.5 sm:px-4 font-medium ${p.stock === 0 ? 'text-red-500' : 'text-ink'}`}>
                  {p.stock}
                </td>
                <td className="py-2 sm:py-3.5 sm:px-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[p.status] || STATUS_BADGE.draft}`}>
                    {p.stock === 0 && p.status === 'published' ? 'Out of Stock' : p.status}
                  </span>
                </td>
                <td className="py-3 sm:py-3.5 sm:pr-6 text-left sm:text-right">
                  <div className="flex items-center justify-start sm:justify-end gap-2">
                    <Link to={`/vendor/products/${p.id}/edit`} className="p-1.5 text-espresso-light hover:bg-cream rounded-md" aria-label="Edit">
                      <Edit2 size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
