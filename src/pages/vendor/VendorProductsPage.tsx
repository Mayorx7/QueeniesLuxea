import { useState } from "react";
import { Plus, Search, Filter, Edit2, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const PRODUCTS = [
  { id: "p1", name: "Amara Silk Gown", category: "Dresses", price: 125000, stock: 15, status: "Active", img: "https://images.unsplash.com/photo-1566160983935-8659b85c884d?q=80&w=100&auto=format&fit=crop" },
  { id: "p2", name: "Linen Summer Blazer", category: "Tops", price: 85000, stock: 0, status: "Out of Stock", img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=100&auto=format&fit=crop" },
  { id: "p3", name: "Pleated Midi Skirt", category: "Bottoms", price: 65000, stock: 8, status: "Active", img: "https://images.unsplash.com/photo-1583391733958-650fac5ceb1c?q=80&w=100&auto=format&fit=crop" },
  { id: "p4", name: "Velvet Wrap Coat", category: "Outerwear", price: 210000, stock: 0, status: "Draft", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=100&auto=format&fit=crop" },
  { id: "p5", name: "Classic Cotton Shirt", category: "Tops", price: 45000, stock: 32, status: "Active", img: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=100&auto=format&fit=crop" },
  { id: "p6", name: "Satin Evening Trousers", category: "Bottoms", price: 95000, stock: 12, status: "Active", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=100&auto=format&fit=crop" },
];

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-700",
  "Out of Stock": "bg-red-50 text-red-700",
};

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms", "Outerwear"];

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
}

export default function VendorProductsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  
  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">Products</h2>
          <p className="mt-1 text-sm text-espresso-light">Manage your store's inventory and listings.</p>
        </div>
        <Link 
          to="/vendor/products/add" 
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={16} className="text-espresso-light shrink-0 ml-1 mr-2" />
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  catFilter === c ? "bg-ink text-ivory" : "bg-cream/50 text-espresso-light hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
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
              {filteredProducts.length === 0 ? (
                <tr className="flex sm:table-row">
                  <td colSpan={6} className="py-10 text-center text-espresso-light w-full">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                    <td className="py-3.5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                        <span className="font-medium text-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light text-xs sm:text-sm">{p.category}</td>
                    <td className="py-1 sm:py-3.5 sm:px-4 font-medium text-ink">{formatNaira(p.price)}</td>
                    <td className={`py-1 sm:py-3.5 sm:px-4 font-medium ${p.stock === 0 ? 'text-red-500' : 'text-ink'}`}>
                      {p.stock}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 sm:py-3.5 sm:pr-6 text-left sm:text-right">
                      <div className="flex items-center justify-start sm:justify-end gap-2">
                        <button className="p-1.5 text-espresso-light hover:bg-cream hover:text-ink rounded-md transition-colors" aria-label="View">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-espresso-light hover:bg-cream hover:text-ink rounded-md transition-colors" aria-label="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors" aria-label="Delete">
                          <Trash2 size={16} />
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
