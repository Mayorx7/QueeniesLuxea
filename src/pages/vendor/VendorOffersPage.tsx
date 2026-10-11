import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  EyeOff,
  Tag,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import VendorConfirmDialog from "../../components/vendor/VendorConfirmDialog";
import type { Offer, OfferStatus, OfferType } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbOffer {
  id: string;
  title: string;
  slug: string;
  offer_type: OfferType;
  original_price: number | null;
  offer_price: number | null;
  min_quantity: number;
  max_quantity: number | null;
  start_date: string | null;
  expiry_date: string | null;
  status: OfferStatus;
  is_featured: boolean;
  created_at: string;
  offer_images: { url: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(v: number | null) {
  if (v === null) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(v);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const OFFER_TYPES = [
  { id: "all", label: "All Types" },
  { id: "fyb_campus", label: "FYB & Campus" },
  { id: "wholesale", label: "Wholesale" },
  { id: "special_promo", label: "Special Promo" },
] as const;

type StatusTab = "all" | "active" | "draft" | "scheduled" | "paused" | "expired";

const STATUS_BADGE: Record<OfferStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  draft: "bg-slate-100 text-slate-600 border border-slate-200",
  scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
  paused: "bg-amber-50 text-amber-700 border border-amber-200",
  expired: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_LABEL: Record<OfferStatus, string> = {
  active: "Active",
  draft: "Draft",
  scheduled: "Scheduled",
  paused: "Paused",
  expired: "Expired",
};

const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  fyb_campus: "FYB & Campus",
  wholesale: "Wholesale",
  special_promo: "Special Promo",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorOffersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("offers")
        .select(`
          id, title, slug, offer_type, original_price, offer_price,
          min_quantity, max_quantity, start_date, expiry_date,
          status, is_featured, created_at,
          offer_images ( url, display_order )
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const mapped = (data ?? []).map((row: DbOffer) => ({
        id: row.id,
        vendorId: user.id,
        title: row.title,
        slug: row.slug,
        description: null,
        offerType: row.offer_type,
        originalPrice: row.original_price,
        offerPrice: row.offer_price,
        discountType: "none" as const,
        discountValue: null,
        minQuantity: row.min_quantity,
        maxQuantity: row.max_quantity,
        startDate: row.start_date,
        expiryDate: row.expiry_date,
        customizationInfo: {},
        orderingMethod: "checkout" as const,
        fulfilmentNotes: null,
        status: row.status,
        isFeatured: row.is_featured,
        linkedProductIds: [],
        tags: [],
        images: (row.offer_images ?? []).map((img) => ({
          id: img.url,
          offerId: row.id,
          url: img.url,
          displayOrder: 0,
        })),
        pricingTiers: [],
        createdAt: row.created_at,
        updatedAt: row.created_at,
      }));
      setOffers(mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load offers.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = offers.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || o.offerType === typeFilter;
    const matchTab =
      activeTab === "all" ||
      (activeTab === "active" && o.status === "active") ||
      (activeTab === "draft" && o.status === "draft") ||
      (activeTab === "scheduled" && o.status === "scheduled") ||
      (activeTab === "paused" && o.status === "paused") ||
      (activeTab === "expired" && o.status === "expired");
    return matchSearch && matchType && matchTab;
  });

  const counts = {
    all: offers.length,
    active: offers.filter((o) => o.status === "active").length,
    draft: offers.filter((o) => o.status === "draft").length,
    scheduled: offers.filter((o) => o.status === "scheduled").length,
    paused: offers.filter((o) => o.status === "paused").length,
    expired: offers.filter((o) => o.status === "expired").length,
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!supabase) return;
    setActionLoading(true);
    try {
      const { error: err } = await supabase.from("offers").delete().eq("id", id);
      if (err) throw err;
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete offer.");
    } finally {
      setDeleteTarget(null);
      setActionLoading(false);
    }
  };

  // ── Toggle status ────────────────────────────────────────────────────────────
  const handleToggleStatus = async (id: string, current: OfferStatus) => {
    if (!supabase) return;
    const next: OfferStatus = current === "active" ? "paused" : "active";
    setActionLoading(true);
    try {
      const { error: err } = await supabase.from("offers").update({ status: next }).eq("id", id);
      if (err) throw err;
      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update offer status.");
    } finally {
      setActionLoading(false);
    }
  };

  const TABS: { id: StatusTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
    { id: "scheduled", label: "Scheduled" },
    { id: "paused", label: "Paused" },
    { id: "expired", label: "Expired" },
  ];

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-14">
        <div className="flex justify-between items-center">
          <div className="h-7 w-32 animate-pulse rounded bg-cream" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-cream" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-cream" />
          ))}
        </div>
        <div className="rounded-xl border border-line bg-ivory overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
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
          <h2 className="font-display text-2xl text-ink">Offers & Promotions</h2>
          <p className="mt-1 text-sm text-espresso-light">
            Manage FYB deals, wholesale offers, and special promotions.
          </p>
        </div>
        <Link
          to="/vendor/offers/add"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso"
        >
          <Plus size={16} />
          Create Offer
        </Link>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={fetchOffers} className="flex items-center gap-1.5 font-semibold hover:text-red-900">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Stats row / tab switcher ── */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
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

      {/* ── Offers table card ── */}
      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input
              type="text"
              placeholder="Search offers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
            <span className="text-xs text-espresso-light shrink-0">Type:</span>
            <div className="flex gap-1.5">
              {OFFER_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    typeFilter === t.id
                      ? "bg-ink text-ivory"
                      : "bg-cream/50 text-espresso-light hover:text-ink"
                  }`}
                >
                  {t.label}
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
                <th className="py-3 pl-5 pr-4 font-medium">Offer</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Min Qty</th>
                <th className="py-3 px-4 font-medium">Expiry</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pr-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-espresso-light">
                      <Tag size={36} strokeWidth={1} />
                      <p className="font-medium text-ink">No offers found</p>
                      <p className="text-sm">
                        {search || typeFilter !== "all" || activeTab !== "all"
                          ? "Try adjusting your search or filters."
                          : "Create your first offer to get started."}
                      </p>
                      {activeTab === "all" && !search && typeFilter === "all" && (
                        <Link
                          to="/vendor/offers/add"
                          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-ivory hover:bg-espresso transition-colors"
                        >
                          <Plus size={15} />
                          Create Your First Offer
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <OfferRow
                    key={o.id}
                    offer={o}
                    actionLoading={actionLoading}
                    onEdit={() => navigate(`/vendor/offers/${o.id}/edit`)}
                    onView={() => window.open(`/offers/${o.slug}`, "_blank")}
                    onDelete={() => setDeleteTarget(o.id)}
                    onToggleStatus={() => void handleToggleStatus(o.id, o.status)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="border-t border-line px-5 py-3 text-xs text-espresso-light">
            Showing {filtered.length} of {offers.length} offers
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <VendorConfirmDialog
          variant="danger"
          title="Delete Offer"
          message={`"${offers.find((o) => o.id === deleteTarget)?.title ?? "This offer"}" will be permanently deleted and cannot be recovered. Are you sure?`}
          confirmLabel="Yes, Delete"
          cancelLabel="Keep It"
          onConfirm={() => void handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Offer Row ──────────────────────────────────────────────────────────────

interface OfferRowProps {
  offer: Offer;
  actionLoading: boolean;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

function OfferRow({ offer: o, actionLoading, onEdit, onView, onDelete, onToggleStatus }: OfferRowProps) {
  const isDraft = o.status === "draft";
  const isActive = o.status === "active";
  const isExpiringSoon = o.expiryDate && new Date(o.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <tr className={`group transition-colors hover:bg-cream/30 ${
      isDraft ? "border-l-2 border-l-slate-300" :
      isExpiringSoon ? "border-l-2 border-l-amber-300" :
      "border-l-2 border-l-transparent"
    }`}>
      {/* Offer */}
      <td className="py-3.5 pl-5 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {o.images[0]?.url ? (
              <img
                src={o.images[0].url}
                alt={o.title}
                className="h-12 w-12 rounded-lg object-cover border border-line"
                loading="lazy"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border border-line bg-cream flex items-center justify-center">
                <Tag size={18} className="text-espresso-light" strokeWidth={1.5} />
              </div>
            )}
            {isDraft && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white">
                <EyeOff size={8} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink truncate max-w-[180px]">{o.title}</p>
            <p className="text-xs text-espresso-light mt-0.5">{o.slug}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-3.5 px-4 text-espresso-light text-xs">{OFFER_TYPE_LABEL[o.offerType]}</td>

      {/* Price */}
      <td className="py-3.5 px-4">
        <div>
          <span className="font-medium text-ink">{formatNaira(o.offerPrice)}</span>
          {o.originalPrice && (
            <span className="ml-2 text-xs line-through text-espresso-light">
              {formatNaira(o.originalPrice)}
            </span>
          )}
        </div>
      </td>

      {/* Min Qty */}
      <td className="py-3.5 px-4">
        <span className="font-medium text-ink">{o.minQuantity}</span>
        {o.maxQuantity && (
          <span className="text-xs text-espresso-light ml-1">/ {o.maxQuantity}</span>
        )}
      </td>

      {/* Expiry */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5">
          {isExpiringSoon && <Clock size={12} className="text-amber-400 shrink-0" />}
          <span className={isExpiringSoon ? "text-amber-600 font-medium" : "text-ink"}>
            {formatDate(o.expiryDate)}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${STATUS_BADGE[o.status]}`}>
          {STATUS_LABEL[o.status]}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 pr-5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={onView} title="View on store" disabled={actionLoading || isDraft}
            className="p-1.5 text-espresso-light hover:bg-cream hover:text-ink rounded-md transition-colors disabled:opacity-40">
            <Eye size={15} />
          </button>
          <button onClick={onEdit} title="Edit offer" disabled={actionLoading}
            className="p-1.5 text-espresso-light hover:bg-cream hover:text-ink rounded-md transition-colors disabled:opacity-40">
            <Edit2 size={15} />
          </button>
          <button onClick={onToggleStatus} title={isActive ? "Pause" : "Activate"} disabled={actionLoading}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${
              isActive
                ? "text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                : "text-espresso-light hover:bg-cream hover:text-ink"
            }`}>
            {isActive ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button onClick={onDelete} title="Delete offer" disabled={actionLoading}
            className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors disabled:opacity-40">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
