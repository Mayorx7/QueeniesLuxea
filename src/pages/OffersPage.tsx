import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag, Calendar, Clock } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SmartImage from "../components/SmartImage";
import { useOffers } from "../hooks/useOffers";
import type { OfferType, FybSubcategory } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(v: number | null) {
  if (v === null) return "Contact for Price";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(v);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "No expiry";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const OFFER_CATEGORIES = [
  { id: "all", label: "All Offers", description: "Browse all available deals" },
  { id: "fyb_campus", label: "FYB & Campus", description: "University outfits and group orders" },
  { id: "wholesale", label: "Wholesale", description: "Bulk purchases and reseller pricing" },
  { id: "special_promo", label: "Special Promotions", description: "Limited-time deals and bundles" },
] as const;

const FYB_SUBCATEGORIES = [
  { id: "jackets" as FybSubcategory, label: "Jackets", description: "Varsity and department jackets" },
  { id: "denim" as FybSubcategory, label: "Denim", description: "Jeans and denim sets" },
  { id: "corporate_wear" as FybSubcategory, label: "Corporate Wear", description: "Formal signing-out outfits" },
  { id: "sneakers" as FybSubcategory, label: "Sneakers", description: "Signing-out footwear" },
  { id: "shirts" as FybSubcategory, label: "Shirts", description: "Round-necks and polos" },
  { id: "streetwear" as FybSubcategory, label: "Streetwear", description: "Casual coordinated outfits" },
  { id: "accessories" as FybSubcategory, label: "Accessories", description: "Caps, sunglasses, and more" },
  { id: "packages" as FybSubcategory, label: "Packages", description: "Complete signing-out bundles" },
];

const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  fyb_campus: "FYB & Campus",
  wholesale: "Wholesale",
  special_promo: "Special Promo",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OffersPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<FybSubcategory | null>(null);

  const { offers, loading, error } = useOffers(
    selectedCategory === "all"
      ? undefined
      : selectedCategory === "fyb_campus"
      ? selectedSubcategory
        ? { offerType: "fyb_campus" as OfferType, subcategory: selectedSubcategory }
        : { offerType: "fyb_campus" as OfferType }
      : { offerType: selectedCategory as OfferType }
  );

  const filteredOffers = selectedCategory === "all"
    ? offers
    : selectedCategory === "fyb_campus"
    ? offers
    : offers.filter(o => o.offerType === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Offers" }]} />

      {/* ── Hero Section ── */}
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow mb-3 text-[var(--color-gold)]">Exclusive Deals</p>
        <h1 className="font-display text-4xl text-ink sm:text-5xl mb-4">
          Discover Exclusive Offers
        </h1>
        <p className="text-sm text-espresso-light leading-relaxed">
          Special deals, wholesale prices, campus outfits, and limited-time promotions — 
          curated offers for every need. From FYB packages to bulk purchases, find the perfect deal.
        </p>
      </div>

      {/* ── Category Filters ── */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {OFFER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedSubcategory(null);
            }}
            className={`rounded-xl border p-5 text-left transition-all ${
              selectedCategory === cat.id
                ? "border-ink bg-ink text-ivory"
                : "border-line bg-ivory hover:border-espresso-light"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Tag size={18} className={selectedCategory === cat.id ? "text-ivory" : "text-gold"} />
              <span className={`font-semibold ${selectedCategory === cat.id ? "text-ivory" : "text-ink"}`}>
                {cat.label}
              </span>
            </div>
            <p className={`text-xs ${selectedCategory === cat.id ? "text-ivory/70" : "text-espresso-light"}`}>
              {cat.description}
            </p>
          </button>
        ))}
      </div>

      {/* ── FYB Subcategory Filters ── */}
      {selectedCategory === "fyb_campus" && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSubcategory === null
                  ? "bg-ink text-ivory"
                  : "bg-cream text-espresso hover:bg-line"
              }`}
            >
              All FYB
            </button>
            {FYB_SUBCATEGORIES.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSubcategory === sub.id
                    ? "bg-ink text-ivory"
                    : "bg-cream text-espresso hover:bg-line"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 mb-8">
          {error}
        </div>
      )}

      {/* ── Loading State ── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-xl bg-cream mb-4" />
              <div className="h-6 w-3/4 rounded bg-cream mb-2" />
              <div className="h-4 w-1/2 rounded bg-cream" />
            </div>
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        /* ── Empty State ── */
        <div className="rounded-xl border border-line bg-cream/30 py-20 text-center">
          <Tag size={48} className="mx-auto text-espresso-light mb-4" strokeWidth={1} />
          <h3 className="font-display text-xl text-ink mb-2">No offers available</h3>
          <p className="text-sm text-espresso-light max-w-md mx-auto">
            {selectedCategory === "all"
              ? "Check back soon for new deals, wholesale offers, and campus packages."
              : `No ${OFFER_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase()} offers available at the moment.`}
          </p>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-ink"
            >
              View All Offers <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        /* ── Offers Grid ── */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Offer Card ──────────────────────────────────────────────────────────────

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    offerType: OfferType;
    originalPrice: number | null;
    offerPrice: number | null;
    minQuantity: number;
    maxQuantity: number | null;
    expiryDate: string | null;
    images: { url: string }[];
  };
}

function OfferCard({ offer }: OfferCardProps) {
  const isExpiringSoon = offer.expiryDate && new Date(offer.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Link
      to={`/offers/${offer.slug}`}
      className="group block rounded-xl border border-line bg-ivory overflow-hidden hover:border-espresso-light transition-colors"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-cream relative">
        {offer.images[0]?.url ? (
          <SmartImage
            src={offer.images[0].url}
            alt={offer.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Tag size={48} className="text-espresso-light" strokeWidth={1} />
          </div>
        )}
        
        {/* Offer Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full bg-ink/80 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ivory backdrop-blur-sm">
            {OFFER_TYPE_LABEL[offer.offerType]}
          </span>
        </div>

        {/* Expiring Soon Badge */}
        {isExpiringSoon && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ivory backdrop-blur-sm">
              <Clock size={10} />
              Ending Soon
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg text-ink mb-2 group-hover:text-gold transition-colors">
          {offer.title}
        </h3>
        
        {offer.description && (
          <p className="text-sm text-espresso-light line-clamp-2 mb-4">
            {offer.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-ink">{formatNaira(offer.offerPrice)}</span>
          {offer.originalPrice && (
            <span className="text-sm line-through text-espresso-light">
              {formatNaira(offer.originalPrice)}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-espresso-light mb-4">
          <div className="flex items-center gap-1">
            <span className="font-medium text-ink">{offer.minQuantity}</span>
            <span>min qty</span>
          </div>
          {offer.expiryDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(offer.expiryDate)}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-medium text-gold group-hover:text-ink transition-colors">
          View Offer <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}
