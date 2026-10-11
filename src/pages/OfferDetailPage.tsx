import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Tag, ShoppingCart, MessageCircle, Loader2, AlertTriangle } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import SmartImage from "../components/SmartImage";
import { useOfferBySlug } from "../hooks/useOffers";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { OfferType, OrderingMethod } from "../types";
import { useCart } from "../context/CartContext";
import { WHATSAPP_PHONE } from "../utils/whatsapp";

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
    month: "long",
    year: "numeric",
  });
}

const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  fyb_campus: "FYB & Campus Deal",
  wholesale: "Wholesale Deal",
  special_promo: "Special Promotion",
};

const ORDERING_METHOD_LABEL: Record<OrderingMethod, string> = {
  checkout: "Website Checkout",
  whatsapp: "WhatsApp Enquiry",
  both: "Checkout or WhatsApp",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OfferDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addOffer } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomization, setSelectedCustomization] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  const { offer, loading, error } = useOfferBySlug(slug || "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gold" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center">
        <AlertTriangle size={48} className="mx-auto text-espresso-light mb-4" />
        <h2 className="font-display text-2xl text-ink mb-2">Offer Not Found</h2>
        <p className="text-sm text-espresso-light mb-6">
          {error || "This offer may have been removed or is no longer available."}
        </p>
        <Link to="/offers" className="inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-ink">
          Browse All Offers
        </Link>
      </div>
    );
  }

  const isExpiringSoon = offer.expiryDate && new Date(offer.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isExpired = offer.expiryDate && new Date(offer.expiryDate) < new Date();
  const minQty = offer.minQuantity || 1;
  const maxQty = offer.maxQuantity || 999;

  // Calculate price based on quantity tiers (for wholesale)
  let applicablePrice = offer.offerPrice;
  if (offer.pricingTiers.length > 0) {
    const applicableTier = [...offer.pricingTiers]
      .sort((a, b) => b.minQuantity - a.minQuantity)
      .find(tier => quantity >= tier.minQuantity);
    if (applicableTier) {
      applicablePrice = applicableTier.pricePerUnit;
    }
  }

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= minQty && newQty <= maxQty) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showToast("Please log in to add items to your cart");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      if (applicablePrice === null) throw new Error("This offer does not have a price yet.");
      addOffer(offer, applicablePrice, quantity, selectedCustomization);
      showToast("Offer added to your bag");
      navigate("/cart");
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWhatsAppOrder = () => {
    // Generate WhatsApp message
    const message = encodeURIComponent(
      `Hi, I'm interested in your offer: ${offer.title}\n\n` +
      `Offer ID: ${offer.id}\n` +
      `Quantity: ${quantity}\n` +
      (selectedCustomization ? `Customization: ${selectedCustomization}\n` : "") +
      `Total Price: ${formatNaira(applicablePrice ? applicablePrice * quantity : null)}\n\n` +
      `Please provide more information on how to proceed.`
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: "Offers", to: "/offers" },
        { label: offer.title }
      ]} />

      {isExpired && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle size={18} />
          <span>This offer has expired and is no longer available for purchase.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Images ── */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-cream border border-line">
            {offer.images[0]?.url ? (
              <SmartImage
                src={offer.images[0].url}
                alt={offer.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Tag size={64} className="text-espresso-light" strokeWidth={1} />
              </div>
            )}
          </div>
          
          {offer.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {offer.images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-cream border border-line cursor-pointer hover:border-gold transition-colors">
                  <SmartImage
                    src={img.url}
                    alt={`${offer.title} ${idx + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="space-y-6">
          {/* Type Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-ink/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink">
              {OFFER_TYPE_LABEL[offer.offerType]}
            </span>
            {isExpiringSoon && !isExpired && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
                <Clock size={12} />
                Ending Soon
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{offer.title}</h1>

          {/* Description */}
          {offer.description && (
            <p className="text-sm text-espresso-light leading-relaxed">{offer.description}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">{formatNaira(applicablePrice)}</span>
            {offer.originalPrice && (
              <span className="text-xl line-through text-espresso-light">
                {formatNaira(offer.originalPrice)}
              </span>
            )}
            {applicablePrice && offer.originalPrice && (
              <span className="text-sm font-medium text-emerald-600">
                {Math.round(((offer.originalPrice - applicablePrice) / offer.originalPrice) * 100)}% off
              </span>
            )}
          </div>

          {/* Wholesale Pricing Tiers */}
          {offer.pricingTiers.length > 0 && (
            <div className="rounded-xl border border-line bg-cream/30 p-4 space-y-2">
              <p className="text-xs font-semibold text-ink uppercase tracking-wide">Quantity-Based Pricing</p>
              {offer.pricingTiers.map((tier, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-espresso-light">
                    {tier.minQuantity}+ {tier.maxQuantity ? `- ${tier.maxQuantity}` : ""} units
                  </span>
                  <span className="font-medium text-ink">{formatNaira(tier.pricePerUnit)} each</span>
                </div>
              ))}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-line">
            <div>
              <p className="text-xs text-espresso-light mb-1">Minimum Quantity</p>
              <p className="font-medium text-ink">{minQty} unit{minQty > 1 ? "s" : ""}</p>
            </div>
            {offer.maxQuantity && (
              <div>
                <p className="text-xs text-espresso-light mb-1">Maximum Quantity</p>
                <p className="font-medium text-ink">{offer.maxQuantity} units</p>
              </div>
            )}
            <div>
              <p className="text-xs text-espresso-light mb-1">Ordering Method</p>
              <p className="font-medium text-ink">{ORDERING_METHOD_LABEL[offer.orderingMethod]}</p>
            </div>
            <div>
              <p className="text-xs text-espresso-light mb-1">Expiry Date</p>
              <p className={`font-medium ${isExpired ? "text-red-600" : "text-ink"}`}>
                {formatDate(offer.expiryDate)}
              </p>
            </div>
          </div>

          {/* FYB Customization */}
          {offer.offerType === "fyb_campus" && offer.customizationInfo && (
            <div className="rounded-xl border border-line bg-cream/30 p-4 space-y-3">
              <p className="text-xs font-semibold text-ink uppercase tracking-wide">Customization Options</p>
              {(offer.customizationInfo as any).university && (
                <div>
                  <p className="text-xs text-espresso-light">University/Campus</p>
                  <p className="font-medium text-ink">{(offer.customizationInfo as any).university}</p>
                </div>
              )}
              {(offer.customizationInfo as any).department && (
                <div>
                  <p className="text-xs text-espresso-light">Department/Group</p>
                  <p className="font-medium text-ink">{(offer.customizationInfo as any).department}</p>
                </div>
              )}
              {(offer.customizationInfo as any).options && (
                <div>
                  <p className="text-xs text-espresso-light">Available Options</p>
                  <p className="text-sm text-ink">{(offer.customizationInfo as any).options}</p>
                </div>
              )}
            </div>
          )}

          {/* Customization Input */}
          {(offer.offerType === "fyb_campus" || offer.customizationInfo) && (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Customization Details
              </label>
              <textarea
                value={selectedCustomization}
                onChange={(e) => setSelectedCustomization(e.target.value)}
                rows={3}
                placeholder="Specify colors, sizes, custom text, or any other customization requirements..."
                className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne resize-none"
              />
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-line rounded-lg">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= minQty}
                  className="px-4 py-2.5 text-ink hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2.5 font-medium text-ink min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQty}
                  className="px-4 py-2.5 text-ink hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-espresso-light">
                Min: {minQty} {maxQty < 999 && `| Max: ${maxQty}`}
              </p>
            </div>
          </div>

          {/* Total */}
          {applicablePrice && (
            <div className="flex items-center justify-between py-4 border-t border-line">
              <span className="text-sm text-espresso-light">Total ({quantity} unit{quantity > 1 ? "s" : ""})</span>
              <span className="text-2xl font-bold text-ink">
                {formatNaira(applicablePrice * quantity)}
              </span>
            </div>
          )}

          {/* Fulfilment Notes */}
          {offer.fulfilmentNotes && (
            <div className="rounded-xl border border-line bg-cream/30 p-4">
              <p className="text-xs font-semibold text-ink uppercase tracking-wide mb-2">
                Delivery & Fulfilment
              </p>
              <p className="text-sm text-espresso-light">{offer.fulfilmentNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button onClick={handleAddToCart} disabled={!!isExpired || addingToCart || applicablePrice === null} className="flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-espresso transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
              {addingToCart ? "Adding..." : "Add to Bag & Checkout"}
            </button>
            <button onClick={handleWhatsAppOrder} disabled={!!isExpired} className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:bg-[#128C7E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><MessageCircle size={18} />Order via WhatsApp</button>

            {isExpired && (
              <p className="text-center text-sm text-red-600">
                This offer has expired and is no longer available
              </p>
            )}
          </div>

          {/* Back Link */}
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 text-sm font-medium text-espresso-light hover:text-ink"
          >
            <ArrowLeft size={16} />
            Back to Offers
          </Link>
        </div>
      </div>
    </div>
  );
}
