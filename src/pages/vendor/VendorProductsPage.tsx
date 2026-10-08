import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  EyeOff,
  Package,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import VendorConfirmDialog from "../../components/vendor/VendorConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type DbStatus = "draft" | "published" | "archived";

interface DbProduct {
  id: string;
  name: string;
  category: string | null;
  price: number;
  compare_at_price: number | null;
  sale_enabled: boolean;
  sku: string | null;
  status: DbStatus;
  created_at: string;
  // joined from product_images (first image)
  product_images: { url: string }[];
  // sum of variant stock
  product_variants: { stock: number }[];
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  saleEnabled: boolean;
  sku: string;
  status: DbStatus;
  imageUrl: string | null;
  stock: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(v);
}

function mapRow(row: DbProduct): Product {
  const stock = (row.product_variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
  return {
    id:           row.id,
    name:         row.name,
    category:     row.category ?? "—",
    price:        row.price,
    compareAtPrice: row.compare_at_price,
    saleEnabled:  row.sale_enabled,
    sku:          row.sku ?? "",
    status:       row.status,
    imageUrl:     row.product_images?.[0]?.url ?? null,
    stock,
  };
}

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Accessories", "Shoes", "Handbags", "Jewelry", "Beauty"];

type StatusTab = "all" | "published" | "draft" | "out-of-stock";

const STATUS_BADGE: Record<DbStatus, string> = {
  published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  draft:     "bg-slate-100  text-slate-600   border border-slate-200",
  archived:  "bg-red-50     text-red-600     border border-red-200",
};

const STATUS_LABEL: Record<DbStatus, string> = {
  published: "Published",
  draft:     "Draft",
  archived:  "Archived",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!supabase || !user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("products")
        .select(`
          id, name, category, price, compare_at_price, sale_enabled, sku, status, created_at,
          product_images ( url, display_order ),
          product_variants ( stock )
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;

      // Sort images by display_order so first image is correct
      const mapped = (data ?? []).map((row) => {
        const sorted = [...(row.product_images ?? [])].sort(
          (a, b) => (a as unknown as { display_order: number }).display_order - (b as unknown as { display_order: number }).display_order
        );
        return mapRow({ ...row, product_images: sorted } as DbProduct);
      });
      setProducts(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchTab =
      activeTab === "all" ||
      (activeTab === "published"   && p.status === "published") ||
      (activeTab === "draft"       && p.status === "draft") ||
      (activeTab === "out-of-stock" && p.stock === 0 && p.status === "published");
    return matchSearch && matchCat && matchTab;
  });

  const counts = {
    all:            products.length,
    published:      products.filter((p) => p.status === "published").length,
    draft:          products.filter((p) => p.status === "draft").length,
    "out-of-stock": products.filter((p) => p.stock === 0 && p.status === "published").length,
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!supabase) return;
    setActionLoading(true);
    try {
      const { error: err } = await supabase.from("products").delete().eq("id", id);
      if (err) throw err;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  // ── Toggle publish/draft ────────────────────────────────────────────────────
  const handleToggleStatus = async (id: string, current: DbStatus) => {
    if (!supabase) return;
    const next: DbStatus = current === "published" ? "draft" : "published";
    setActionLoading(true);
    try {
      const { error: err } = await supabase
        .from("products")
        .update({ status: next })
        .eq("id", id);
      if (err) throw err;
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: next } : p))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update product status.");
    } finally {
      setUnpublishTarget(null);
      setActionLoading(false);
    }
  };

  const TABS: { id: StatusTab; label: string }[] = [
    { id: "all",           label: "All" },
    { id: "published",     label: "Published" },
    { id: "draft",         label: "Drafts" },
    { id: "out-of-stock",  label: "Out of Stock" },
  ];

  const pendingUnpublishProduct = products.find((p) => p.id === unpublishTarget);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-14">
        <div className="flex justify-between items-center">
          <div className="h-7 w-32 animate-pulse rounded bg-cream" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-cream" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-cream" />)}
        </div>
        <div className="rounded-xl border border-line bg-ivory overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-line">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-cream" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded bg-cream" />
                <div className="h-3 w-20 animate-pulse rounded bg-cream" />
              </div>
              <div className="h-3.5 w-20 animate-pulse rounded bg-cream" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">Products</h2>
          <p className="mt-1 text-sm text-espresso-light">
            Manage your store's inventory and listings.
          </p>
        </div>
        <Link
          to="/vendor/products/add"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={fetchProducts} className="flex items-center gap-1.5 font-semibold hover:text-red-900">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Stats row / tab switcher ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              activeTab === tab.id
                ? "border-ink bg-ink text-ivory"
                : "border-line bg-ivory hover:border-espresso-light"
            }`}
          >
            <p className={`text-2xl font-semibold font-display ${activeTab === tab.id ? "text-ivory" : "text-ink"}`}>
              {counts[tab.id]}
            </p>
            <p className={`text-xs mt-1 ${activeTab === tab.id ? "text-ivory/70" : "text-espresso-light"}`}>
              {tab.label}
            </p>
          </button>
        ))}
      </div>

      {/* ── Products table card ── */}
      <div className="rounded-xl border border-line bg-ivory overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
            <span className="text-xs text-espresso-light shrink-0">Category:</span>
            <div className="flex gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    catFilter === c
                      ? "bg-ink text-ivory"
                      : "bg-cream/50 text-espresso-light hover:text-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/40 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-5 pr-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pr-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-espresso-light">
                      <Package size={36} strokeWidth={1} />
                      <p className="font-medium text-ink">No products found</p>
                      <p className="text-sm">
                        {search || catFilter !== "All" || activeTab !== "all"
                          ? "Try adjusting your search or filters."
                          : "Add your first product to get started."}
                      </p>
                      {activeTab === "all" && !search && catFilter === "All" && (
                        <Link
                          to="/vendor/products/add"
                          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-ivory hover:bg-espresso transition-colors"
                        >
                          <Plus size={15} />
                          Add Your First Product
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    actionLoading={actionLoading}
                    onEdit={() => navigate(`/vendor/products/${p.id}/edit`)}
                    onView={() => window.open(`/product/${p.id}`, "_blank")}
                    onDelete={() => setDeleteTarget(p.id)}
                    onTogglePublish={() => {
                      if (p.status === "published") {
                        setUnpublishTarget(p.id);
                      } else {
                        void handleToggleStatus(p.id, p.status);
                      }
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-line px-5 py-3 text-xs text-espresso-light">
            Showing {filtered.length} of {products.length} products
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <VendorConfirmDialog
          variant="danger"
          title="Delete Product"
          message={`"${products.find((p) => p.id === deleteTarget)?.name ?? "This product"}" will be permanently deleted and cannot be recovered. Are you sure?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Keep It"
          onConfirm={() => void handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Unpublish confirm ── */}
      {unpublishTarget && pendingUnpublishProduct && (
        <VendorConfirmDialog
          variant="warning"
          title="Unpublish Product"
          message={`"${pendingUnpublishProduct.name}" will be hidden from your store and saved as a Draft. You can re-publish it at any time.`}
          confirmLabel="Yes, Unpublish"
          cancelLabel="Keep Published"
          onConfirm={() => void handleToggleStatus(unpublishTarget, "published")}
          onCancel={() => setUnpublishTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

interface ProductRowProps {
  product: Product;
  actionLoading: boolean;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

function ProductRow({ product: p, actionLoading, onEdit, onView, onDelete, onTogglePublish }: ProductRowProps) {
  const isOos   = p.stock === 0 && p.status === "published";
  const isDraft = p.status === "draft";
  const isActive = p.status === "published";
  const isLowStock = p.stock > 0 && p.stock <= 5;

  return (
    <tr className={`group transition-colors hover:bg-cream/30 ${
      isOos ? "border-l-2 border-l-red-300" :
      isDraft ? "border-l-2 border-l-slate-300" :
      "border-l-2 border-l-transparent"
    }`}>
      {/* Product */}
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-12 w-12 rounded-lg object-cover border border-line"
                loading="lazy"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border border-line bg-cream flex items-center justify-center">
                <Package size={18} className="text-espresso-light" strokeWidth={1.5} />
              </div>
            )}
            {isDraft && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white">
                <EyeOff size={8} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink truncate max-w-[180px]">{p.name}</p>
            <p className="text-xs text-espresso-light mt-0.5">{p.sku || "—"}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-3.5 px-4 text-espresso-light text-xs">{p.category}</td>

      {/* Price */}
      <td className="py-3.5 px-4">
        <div>
          <span className="font-medium text-ink">{formatNaira(p.price)}</span>
          {p.compareAtPrice && p.saleEnabled && (
            <span className="ml-2 text-xs line-through text-espresso-light">
              {formatNaira(p.compareAtPrice)}
            </span>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5">
          {isLowStock && <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
          <span className={`font-medium ${isOos ? "text-red-500" : isLowStock ? "text-amber-600" : "text-ink"}`}>
            {p.stock}
          </span>
          <span className="text-xs text-espresso-light">units</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[p.status]}`}>
          {STATUS_LABEL[p.status]}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 pr-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={onView} title="View on store" disabled={actionLoading}
            className="p-1.5 text-espresso-light hover:bg-cream hover:text-ink rounded-md transition-colors disabled:opacity-40">
            <Eye size={15} />
          </button>
          <button onClick={onEdit} title="Edit product" disabled={actionLoading}
            className="p-1.5 text-espresso-light hover:bg-cream hover:text-ink rounded-md transition-colors disabled:opacity-40">
            <Edit2 size={15} />
          </button>
          <button onClick={onTogglePublish} title={isActive ? "Unpublish" : "Publish"} disabled={actionLoading}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${
              isActive
                ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                : "text-espresso-light hover:bg-cream hover:text-ink"
            }`}>
            {isActive ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button onClick={onDelete} title="Delete product" disabled={actionLoading}
            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors disabled:opacity-40">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
