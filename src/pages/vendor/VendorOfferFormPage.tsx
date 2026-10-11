import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, Plus, Trash2, Loader2, ImagePlus, GripVertical, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { OfferFormData } from "../../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatNaira(v: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(v));
}

interface ImageSlot {
  id: string;
  url: string;
  file?: File;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorOfferFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OfferFormData>({
    title: "",
    slug: "",
    description: "",
    offerType: "fyb_campus",
    subcategory: null,
    originalPrice: null,
    offerPrice: null,
    discountType: "none",
    discountValue: null,
    minQuantity: 1,
    maxQuantity: null,
    startDate: null,
    expiryDate: null,
    customizationInfo: {},
    orderingMethod: "whatsapp",
    fulfilmentNotes: "",
    isFeatured: false,
    linkedProductIds: [],
    tags: [],
    images: [],
    pricingTiers: [],
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  // Image upload state
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch existing offer ─────────────────────────────────────────────────────
  const fetchOffer = useCallback(async () => {
    if (!id || !supabase || !user) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("offers")
        .select(`
          *,
          offer_images (*),
          offer_pricing_tiers (*)
        `)
        .eq("id", id)
        .eq("vendor_id", user.id)
        .single();

      if (err) throw err;

      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          description: data.description || "",
          offerType: data.offer_type,
          subcategory: data.subcategory || null,
          originalPrice: data.original_price,
          offerPrice: data.offer_price,
          discountType: data.discount_type,
          discountValue: data.discount_value,
          minQuantity: data.min_quantity,
          maxQuantity: data.max_quantity,
          startDate: data.start_date ? data.start_date.split("T")[0] : null,
          expiryDate: data.expiry_date ? data.expiry_date.split("T")[0] : null,
          customizationInfo: data.customization_info || {},
          orderingMethod: data.ordering_method,
          fulfilmentNotes: data.fulfilment_notes || "",
          isFeatured: data.is_featured,
          linkedProductIds: data.linked_product_ids || [],
          tags: data.tags || [],
          images: (data.offer_images ?? []).map((img: any) => ({
            url: img.url,
            displayOrder: img.display_order,
          })),
          pricingTiers: (data.offer_pricing_tiers ?? []).map((tier: any) => ({
            minQuantity: tier.min_quantity,
            maxQuantity: tier.max_quantity,
            pricePerUnit: tier.price_per_unit,
          })),
        });

        // Load images for display
        const loadedImages = (data.offer_images ?? [])
          .map((img: any) => ({
            id: img.id,
            url: img.url,
          }));
        setImages(loadedImages);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load offer.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) fetchOffer();
  }, [id, fetchOffer]);

  useEffect(() => {
    if (!supabase || !user) return;
    void supabase.from("products").select("id,name,price").eq("vendor_id", user.id).order("name").then(({ data }) => setProducts(data ?? []));
  }, [user]);

  // ── Handle form changes ───────────────────────────────────────────────────────
  const handleChange = (field: keyof OfferFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === "title" && !id) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handlePricingTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...formData.pricingTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setFormData((prev) => ({ ...prev, pricingTiers: newTiers }));
  };

  const addPricingTier = () => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: [
        ...prev.pricingTiers,
        { minQuantity: 1, maxQuantity: null, pricePerUnit: 0 },
      ],
    }));
  };

  const removePricingTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index),
    }));
  };

  // ── Image handlers ─────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const slots = Math.min(files.length, 8 - images.length);
    const newImgs = files.slice(0, slots).map((f) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(f),
      file: f,
    }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 8));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed.url.startsWith("blob:")) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOver(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOver(null); return; }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(null);
    setDragOver(null);
  };

  // ── Save offer ───────────────────────────────────────────────────────────────
  const handleSave = async (publish = false) => {
    if (!supabase || !user) return;

    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.slug.trim()) throw new Error("Slug is required");
      if (!formData.offerPrice && formData.offerType !== "fyb_campus") {
        throw new Error("Offer price is required");
      }
      if (formData.minQuantity < 1) throw new Error("Minimum quantity must be at least 1");

      const offerData = {
        vendor_id: user.id,
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        offer_type: formData.offerType,
        subcategory: formData.subcategory,
        original_price: formData.originalPrice,
        offer_price: formData.offerPrice,
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        min_quantity: formData.minQuantity,
        max_quantity: formData.maxQuantity,
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        expiry_date: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        customization_info: formData.customizationInfo,
        ordering_method: formData.orderingMethod,
        fulfilment_notes: formData.fulfilmentNotes,
        status: publish ? "active" : "draft",
        is_featured: formData.isFeatured,
        linked_product_ids: formData.linkedProductIds,
        tags: formData.tags,
      };

      let offerId: string;

      if (id) {
        // Update existing
        const { error: err } = await supabase.from("offers").update(offerData).eq("id", id);
        if (err) throw err;
        offerId = id;
      } else {
        // Create new
        const { data, error: err } = await supabase.from("offers").insert(offerData).select().single();
        if (err) throw err;
        offerId = data.id;
      }

      // ── Upload images to Supabase Storage ───────────────────────────────────────
      const uploadedImages: ImageSlot[] = await Promise.all(
        images.map(async (img) => {
          if (!img.url.startsWith("blob:") || !img.file) return img; // already an https:// URL
          const ext = img.file.name.split(".").pop() ?? "jpg";
          const path = `${offerId}/${img.id}.${ext}`;
          const { error: upErr } = await supabase!.storage
            .from("offer-images")
            .upload(path, img.file, { upsert: true, contentType: img.file.type });
          if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
          const { data: urlData } = supabase!.storage
            .from("offer-images")
            .getPublicUrl(path);
          URL.revokeObjectURL(img.url);
          return { id: img.id, url: urlData.publicUrl };
        })
      );

      // ── Sync offer_images table ────────────────────────────────────────────────
      if (id) {
        await supabase.from("offer_images").delete().eq("offer_id", offerId);
      }
      if (uploadedImages.length > 0) {
        const { error: imgErr } = await supabase.from("offer_images").insert(
          uploadedImages.map((img, i) => ({
            offer_id: offerId,
            url: img.url,
            display_order: i,
          }))
        );
        if (imgErr) throw imgErr;
      }

      // Handle pricing tiers (for wholesale)
      if (formData.offerType === "wholesale" && formData.pricingTiers.length > 0) {
        if (id) {
          await supabase.from("offer_pricing_tiers").delete().eq("offer_id", offerId);
        }
        const tierInserts = formData.pricingTiers.map((tier) => ({
          offer_id: offerId,
          min_quantity: tier.minQuantity,
          max_quantity: tier.maxQuantity,
          price_per_unit: tier.pricePerUnit,
        }));
        await supabase.from("offer_pricing_tiers").insert(tierInserts);
      }

      showToast(publish ? "Offer published successfully" : "Offer saved as draft");
      navigate("/vendor/offers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save offer.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/vendor/offers")}
            className="p-2 text-espresso-light hover:text-ink rounded-lg hover:bg-cream transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-display text-2xl text-ink">
              {id ? "Edit Offer" : "Create New Offer"}
            </h2>
            <p className="text-sm text-espresso-light mt-0.5">
              {id ? "Update offer details and pricing" : "Set up a new promotion or deal"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-espresso-light hover:text-ink rounded-lg hover:bg-cream transition-colors"
          >
            <Eye size={16} />
            {previewMode ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Form ── */}
      {!previewMode ? (
        <form onSubmit={(e) => { e.preventDefault(); void handleSave(false); }} className="space-y-8">
          {/* Basic Info */}
          <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
            <h3 className="font-display text-lg text-ink">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Offer Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder="e.g., FYB Corporate Day Package"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder="fyb-corporate-day-package"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne resize-none"
                placeholder="Describe your offer, what's included, and any special conditions..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Offer Type *</label>
              <select
                value={formData.offerType}
                onChange={(e) => handleChange("offerType", e.target.value)}
                className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
              >
                <option value="fyb_campus">FYB & Campus Deals</option>
                <option value="wholesale">Wholesale Deals</option>
                <option value="special_promo">Special Promotions</option>
              </select>
              <p className="text-xs text-espresso-light mt-1.5">
                {formData.offerType === "fyb_campus" && "Customized university outfits, group orders, graduation packages"}
                {formData.offerType === "wholesale" && "Bulk purchases with quantity-based pricing tiers"}
                {formData.offerType === "special_promo" && "Discounts, bundles, limited-time promotions"}
              </p>
            </div>

            {formData.offerType === "fyb_campus" && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Subcategory</label>
                <select
                  value={formData.subcategory || ""}
                  onChange={(e) => handleChange("subcategory", e.target.value || null)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                >
                  <option value="">Select subcategory</option>
                  <option value="jackets">Jackets</option>
                  <option value="denim">Denim</option>
                  <option value="corporate_wear">Corporate Wear</option>
                  <option value="sneakers">Sneakers</option>
                  <option value="shirts">Shirts</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="accessories">Accessories</option>
                  <option value="packages">Packages</option>
                </select>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
            <h3 className="font-display text-lg text-ink flex items-center gap-2">
              <ImagePlus size={18} />
              Offer Images
            </h3>
            
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => {
                const img = images[i];
                const isOver = dragOver === i;
                return img ? (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={() => handleDrop(i)}
                    onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                    className={`group relative aspect-square cursor-grab rounded-xl overflow-hidden border-2 transition-all ${
                      isOver ? "border-champagne scale-105" : "border-line"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Offer image ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 rounded-md bg-ink/80 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ivory">
                        Cover
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={14} />
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      aria-label="Remove image"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    key={`empty-${i}`}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= 8}
                    className="aspect-square rounded-xl border-2 border-dashed border-line bg-cream/20 flex flex-col items-center justify-center gap-1 text-espresso-light hover:border-champagne hover:bg-champagne/5 hover:text-champagne transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    {i === 0 && <span className="text-[0.6rem] font-medium">Add</span>}
                  </button>
                );
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 8}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-ivory px-4 py-2 text-sm font-medium text-espresso-light hover:bg-cream hover:text-ink transition-colors disabled:opacity-40"
              >
                <ImagePlus size={15} />
                Upload Images
              </button>
              <p className="text-xs text-espresso-light">
                {images.length}/8 images · JPG, PNG, WEBP · Max 5MB each · Drag to reorder
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
            <h3 className="font-display text-lg text-ink">Pricing</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Original Price</label>
                <input
                  type="number"
                  value={formData.originalPrice || ""}
                  onChange={(e) => handleChange("originalPrice", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder="Regular price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Offer Price *</label>
                <input
                  type="number"
                  value={formData.offerPrice || ""}
                  onChange={(e) => handleChange("offerPrice", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder="Special price"
                  required={formData.offerType !== "fyb_campus"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleChange("discountType", e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                >
                  <option value="none">None</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                  <option value="fixed_price">Fixed Price Override</option>
                </select>
              </div>
            </div>

            {formData.discountType !== "none" && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Discount Value</label>
                <input
                  type="number"
                  value={formData.discountValue || ""}
                  onChange={(e) => handleChange("discountValue", e.target.value ? Number(e.target.value) : null)}
                  className="w-full max-w-xs rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 5000"}
                />
              </div>
            )}

            {/* Wholesale pricing tiers */}
            {formData.offerType === "wholesale" && (
              <div className="space-y-4 pt-4 border-t border-cream">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink">Quantity-Based Pricing Tiers</label>
                  <button
                    type="button"
                    onClick={addPricingTier}
                    className="flex items-center gap-1.5 text-xs font-medium text-gold hover:text-ink"
                  >
                    <Plus size={14} /> Add Tier
                  </button>
                </div>
                
                {formData.pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-end gap-3 p-4 bg-cream/30 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs text-espresso-light mb-1">Min Quantity</label>
                      <input
                        type="number"
                        value={tier.minQuantity}
                        onChange={(e) => handlePricingTierChange(index, "minQuantity", Number(e.target.value))}
                        className="w-full rounded border border-line bg-ivory px-3 py-2 text-sm text-ink"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-espresso-light mb-1">Max Quantity (optional)</label>
                      <input
                        type="number"
                        value={tier.maxQuantity || ""}
                        onChange={(e) => handlePricingTierChange(index, "maxQuantity", e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded border border-line bg-ivory px-3 py-2 text-sm text-ink"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-espresso-light mb-1">Price per Unit</label>
                      <input
                        type="number"
                        value={tier.pricePerUnit}
                        onChange={(e) => handlePricingTierChange(index, "pricePerUnit", Number(e.target.value))}
                        className="w-full rounded border border-line bg-ivory px-3 py-2 text-sm text-ink"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePricingTier(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                {formData.pricingTiers.length === 0 && (
                  <p className="text-sm text-espresso-light italic">No pricing tiers configured. Add tiers above.</p>
                )}
              </div>
            )}
          </div>

          {/* Quantity & Dates */}
          <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
            <h3 className="font-display text-lg text-ink">Quantity & Schedule</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Minimum Quantity *</label>
                <input
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => handleChange("minQuantity", Number(e.target.value))}
                  min={1}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Maximum Quantity (optional)</label>
                <input
                  type="number"
                  value={formData.maxQuantity || ""}
                  onChange={(e) => handleChange("maxQuantity", e.target.value ? Number(e.target.value) : null)}
                  min={formData.minQuantity}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Start Date (optional)</label>
                <input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                />
              </div>
            </div>
          </div>

          {/* Ordering Method */}
          <div className="rounded-xl border border-line bg-ivory p-6 space-y-4">
            <h3 className="font-display text-lg text-ink">Products in This Offer</h3>
            <p className="text-sm text-espresso-light">Select any of your products included in this offer. You can change this list and pricing whenever you edit the offer.</p>
            {products.length === 0 ? <p className="text-sm text-espresso-light">No products found. Add a product first, then return here to link it.</p> : <div className="max-h-56 space-y-2 overflow-y-auto pr-1">{products.map((product) => <label key={product.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"><span className="flex items-center gap-3"><input type="checkbox" checked={formData.linkedProductIds.includes(product.id)} onChange={(e) => handleChange("linkedProductIds", e.target.checked ? [...formData.linkedProductIds, product.id] : formData.linkedProductIds.filter((productId) => productId !== product.id))} className="accent-gold" />{product.name}</span><span className="text-espresso-light">{formatNaira(product.price)}</span></label>)}</div>}
          </div>

          <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
            <h3 className="font-display text-lg text-ink">Ordering Method</h3>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-2">How should customers order?</label>
              <select
                value={formData.orderingMethod}
                onChange={(e) => handleChange("orderingMethod", e.target.value)}
                className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
              >
                <option value="checkout">Website Checkout</option>
                <option value="whatsapp">WhatsApp Enquiry</option>
                <option value="both">Both Options</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Fulfilment Notes</label>
              <textarea
                value={formData.fulfilmentNotes}
                onChange={(e) => handleChange("fulfilmentNotes", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne resize-none"
                placeholder="Delivery information, pickup options, or special instructions..."
              />
            </div>
          </div>

          {/* FYB Customization */}
          {formData.offerType === "fyb_campus" && (
            <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
              <h3 className="font-display text-lg text-ink">FYB & Campus Customization</h3>
              
              <div>
                <label className="block text-sm font-medium text-ink mb-2">University/Campus Name</label>
                <input
                  type="text"
                  value={(formData.customizationInfo as any).university || ""}
                  onChange={(e) => handleChange("customizationInfo", { ...formData.customizationInfo, university: e.target.value })}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder="e.g., University of Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Department/Group</label>
                <input
                  type="text"
                  value={(formData.customizationInfo as any).department || ""}
                  onChange={(e) => handleChange("customizationInfo", { ...formData.customizationInfo, department: e.target.value })}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne"
                  placeholder="e.g., Computer Science, Final Year Brethren"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Customization Options</label>
                <textarea
                  value={(formData.customizationInfo as any).options || ""}
                  onChange={(e) => handleChange("customizationInfo", { ...formData.customizationInfo, options: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-line bg-cream/30 px-4 py-2.5 text-sm text-ink outline-none focus:border-champagne resize-none"
                  placeholder="Available colors, logo placement, custom text options..."
                />
              </div>
            </div>
          )}

          {/* Publication */}
          <div className="rounded-xl border border-line bg-ivory p-6 space-y-6">
            <h3 className="font-display text-lg text-ink">Publication</h3>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.isFeatured}
                onChange={(e) => handleChange("isFeatured", e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              <label htmlFor="featured" className="text-sm text-ink">Feature on homepage</label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/vendor/offers")}
              className="px-6 py-2.5 text-sm font-medium text-espresso-light hover:text-ink rounded-lg hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-ivory bg-ink rounded-lg hover:bg-espresso transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => void handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-ivory bg-gold rounded-lg hover:bg-ink transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
              Publish
            </button>
          </div>
        </form>
      ) : (
        // Preview mode
        <div className="rounded-xl border border-line bg-ivory p-8">
          <div className="max-w-2xl mx-auto">
            <div className="aspect-video bg-cream rounded-lg mb-6 flex items-center justify-center">
              <span className="text-espresso-light">Offer Image Preview</span>
            </div>
            <h2 className="font-display text-3xl text-ink mb-2">{formData.title}</h2>
            <p className="text-espresso-light mb-6">{formData.description}</p>
            
            <div className="flex items-baseline gap-3 mb-6">
              {formData.offerPrice && (
                <span className="text-2xl font-bold text-ink">{formatNaira(formData.offerPrice)}</span>
              )}
              {formData.originalPrice && (
                <span className="text-lg line-through text-espresso-light">{formatNaira(formData.originalPrice)}</span>
              )}
            </div>

            <div className="space-y-2 text-sm text-espresso-light">
              <p>Minimum Quantity: {formData.minQuantity}</p>
              {formData.expiryDate && <p>Expires: {formData.expiryDate}</p>}
              <p>Ordering: {formData.orderingMethod === "whatsapp" ? "WhatsApp" : "Website Checkout"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
