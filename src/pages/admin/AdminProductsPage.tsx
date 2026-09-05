import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Tag, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: "Active" | "Draft" | "Out of Stock";
  image: string;
}

const PRODUCTS: AdminProduct[] = [
  { id: "p1",  name: "Amara Silk Column Gown",   category: "Dresses",  price: 1280, stock: 14, sold: 30, status: "Active",       image: "https://images.unsplash.com/photo-1566160983935-8659b85c884d?q=80&w=100&auto=format&fit=crop" },
  { id: "p2",  name: "Verity Wrap Midi Dress",    category: "Dresses",  price: 640,  stock: 22, sold: 44, status: "Active",       image: "https://images.unsplash.com/photo-1583391733958-650fac5ceb1c?q=80&w=100&auto=format&fit=crop" },
  { id: "p3",  name: "Calla Linen Blazer",        category: "Tops",     price: 640,  stock: 8,  sold: 35, status: "Active",       image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=100&auto=format&fit=crop" },
  { id: "p4",  name: "Riviera Knit Cardigan",     category: "Tops",     price: 760,  stock: 19, sold: 24, status: "Active",       image: "https://images.unsplash.com/photo-1624623278313-a930126a11c3?q=80&w=100&auto=format&fit=crop" },
  { id: "p5",  name: "Bastien Crepe Trousers",    category: "Bottoms",  price: 480,  stock: 0,  sold: 18, status: "Out of Stock", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=100&auto=format&fit=crop" },
  { id: "p6",  name: "Soleil Straw Hat",          category: "Accessories", price: 1240, stock: 5, sold: 12, status: "Active",    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=100&auto=format&fit=crop" },
  { id: "p7",  name: "Pleated Satin Midi Skirt",  category: "Bottoms",  price: 395,  stock: 11, sold: 21, status: "Active",       image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=100&auto=format&fit=crop" },
  { id: "p8",  name: "Cashmere Wrap Coat",        category: "Outerwear",price: 2100, stock: 3,  sold: 9,  status: "Draft",        image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=100&auto=format&fit=crop" },
];

const STATUS_BADGE: Record<AdminProduct["status"], string> = {
  Active:          "bg-emerald-50 text-emerald-700",
  Draft:           "bg-cream text-espresso-light",
  "Out of Stock":  "bg-red-50 text-red-600",
};

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Accessories"];

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("All");

  const filtered = products.filter((p) => {
    const matchCat = cat === "All" || p.category === cat;
    const q = search.toLowerCase();
    return matchCat && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  });

  const remove = (id: string) => setProducts((ps) => ps.filter((p) => p.id !== id));

  return (
    <div className="space-y-6">
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
        {CATEGORIES.map((c) => (
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
          { label: "Active",         val: products.filter((p) => p.status === "Active").length },
          { label: "Out of Stock",   val: products.filter((p) => p.status === "Out of Stock").length },
          { label: "Draft",          val: products.filter((p) => p.status === "Draft").length },
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
                {["Product", "Category", "Price", "Stock", "Sold", "Status", ""].map((h) => (
                  <th key={h} className="py-3.5 px-4 text-left text-xs font-semibold text-espresso-light first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-espresso-light">No products found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        <span className="font-semibold text-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-espresso-light">
                        <Tag size={11} className="text-champagne" />
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ink">{fmt(p.price)}</td>
                    <td className={`py-3.5 px-4 font-medium ${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-ink"}`}>
                      {p.stock === 0 ? "—" : p.stock}
                    </td>
                    <td className="py-3.5 px-4 text-espresso-light">{p.sold}</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/product/${p.id}`} className="rounded-lg p-1.5 text-espresso-light hover:bg-cream hover:text-ink transition-colors" aria-label="Preview">
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
