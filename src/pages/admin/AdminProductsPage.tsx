import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Tag, Eye, RefreshCw, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/format";

interface AdminProduct {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  price: number;
  stock: number;
  status: "draft" | "published" | "archived";
  image: string | null;
  vendor: string;
}

const STATUS_BADGE: Record<AdminProduct["status"], string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft:     "bg-cream text-espresso-light",
  archived:  "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<AdminProduct["status"], string> = {
  published: "Published",
  draft:     "Draft",
  archived:  "Archived",
};


export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");

  const fetchProducts = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("products")
        .select(`
          id, name, slug, category, price, status,
          product_images ( url, display_order ),
          product_variants ( stock ),
          vendor:profiles ( first_name, last_name )
        `)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const mapped: AdminProduct[] = (data ?? []).map((row) => {
        const imgs = (row.product_images as { url: string; display_order: number }[] | null) ?? [];
        const sorted = [...imgs].sort((a, b) => a.display_order - b.display_order);
        const variants = (row.product_variants as { stock: number }[] | null) ?? [];
        const totalStock = variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
        const v = row.vendor as { first_name: string | null; last_name: string | null } | null;
        return {
          id:       row.id,
          name:     row.name,
          slug:     row.slug ?? null,
          category: row.category ?? null,
          price:    row.price,
          stock:    totalStock,
          status:   row.status as AdminProduct["status"],
          image:    sorted[0]?.url ?? null,
          vendor:   [v?.first_name, v?.last_name].filter(Boolean).join(" ") || "Unknown vendor",
        };
      });
      setProducts(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))] as string[];

  const filtered = products.filter((p) => {
    const matchCat = cat === "All" || p.category === cat;
    const q = search.toLowerCase();
    return matchCat && (!q || p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q));
  });

  const remove = async (id: string) => {
    if (!supabase) return;
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    const { error: err } = await supabase.from("products").delete().eq("id", id);
    if (err) { alert(err.message); return; }
    setProducts((ps) => ps.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <div className="flex items-center gap-2"><AlertTriangle size={16} /><span>{error}</span></div>
          <button onClick={fetchProducts} className="flex items-center gap-1.5 font-semibold hover:text-red-900">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-line bg-ivory pl-9 pr-4 py-2.5 text-sm text-ink outline-none placeholder-espresso-light/60 focus:border-champagne"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-ivory transition-all hover:bg-espresso hover:scale-[1.02] shrink-0">
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`eyebrow rounded-full px-3 py-1.5 text-[0.65rem] transition-colors ${
              cat === c ? "bg-ink text-ivory" : "bg-cream text-espresso-light hover:bg-champagne-light hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Products", val: products.length },
          { label: "Published",      val: products.filter((p) => p.status === "published").length },
          { label: "Draft",          val: products.filter((p) => p.status === "draft").length },
          { label: "Archived",       val: products.filter((p) => p.status === "archived").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-ivory px-4 py-3">
            <p className="eyebrow text-espresso-light">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-ink">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Product table */}
      <div className="rounded-2xl border border-line bg-ivory overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/60">
              <tr>
                {["Product", "Vendor", "Category", "Price", "Stock", "Status", ""].map((h) => (
                  <th key={h} className="py-3.5 px-4 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-t border-line">
                    {[1,2,3,4,5,6,7].map((j) => (
                      <td key={j} className="py-4 px-4 first:pl-6 last:pr-6">
                        <div className="h-4 rounded bg-cream animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-espresso-light">
                    {search || cat !== "All" ? "No products match your filters." : "No products yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-cream shrink-0" />
                        )}
                        <span className="font-semibold text-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-espresso-light text-xs">{p.vendor}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-espresso-light">
                        <Tag size={11} className="text-champagne" />
                        {p.category ?? "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ink">{formatPrice(p.price)}</td>
                    <td className={`py-3.5 px-4 font-medium ${
                      p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-ink"
                    }`}>
                      {p.stock === 0 ? "—" : p.stock}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${p.slug ?? p.id}`}
                          className="rounded-lg p-1.5 text-espresso-light hover:bg-cream hover:text-ink transition-colors"
                          aria-label="Preview"
                        >
                          <Eye size={15} />
                        </Link>
                        <button className="rounded-lg p-1.5 text-espresso-light hover:bg-cream hover:text-ink transition-colors" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="rounded-lg p-1.5 text-espresso-light hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
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
