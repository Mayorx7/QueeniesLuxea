import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  X,
  Plus,
  ImagePlus,
  RefreshCw,
  Eye,
  Save,
  Rocket,
  Check,
  Tag,
  Truck,
  GripVertical,
  ChevronDown,
  AlertTriangle,
  Star,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import VendorConfirmDialog from "../../components/vendor/VendorConfirmDialog";
import { generateSlug } from "../../hooks/useProductListing";

/* ── Constants ───────────────────────────────────────────────────── */

const CATEGORIES: Record<string, string[]> = {
  Dresses: ["Gowns", "Mini Dresses", "Midi Dresses", "Maxi Dresses", "Wrap Dresses", "Shift Dresses"],
  Tops: ["Blouses", "T-Shirts", "Crop Tops", "Shirts", "Bodysuits", "Camisoles"],
  Bottoms: ["Skirts", "Trousers", "Shorts", "Leggings", "Palazzos"],
  Outerwear: ["Coats", "Jackets", "Blazers", "Cardigans", "Kimonos"],
  Accessories: ["Earrings", "Necklaces", "Bracelets", "Belts", "Head Wraps", "Scarves"],
  Shoes: ["Heels", "Flats", "Sandals", "Boots", "Sneakers", "Mules"],
  Handbags: ["Tote Bags", "Clutches", "Shoulder Bags", "Crossbody Bags", "Backpacks"],
  Jewelry: ["Rings", "Earrings", "Necklaces", "Bracelets", "Sets", "Body Jewelry"],
  Beauty: ["Skincare", "Makeup", "Hair Care", "Fragrances", "Body Care"],
};

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const SHIPPING_ZONES = [
  { key: "lagos", label: "Lagos", hint: "₦1,500 typical" },
  { key: "abuja", label: "Abuja", hint: "₦2,500 typical" },
  { key: "portHarcourt", label: "Port Harcourt", hint: "₦2,500 typical" },
  { key: "others", label: "Other States", hint: "₦3,500 typical" },
  { key: "nationwide", label: "Nationwide Flat Rate", hint: "One fee for all" },
];

/* ── Helpers ─────────────────────────────────────────────────────── */

function formatNaira(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n) || n === 0) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

interface ColorItem { id: string; name: string; hex: string }
interface Variant  { id: string; label: string; stock: number; lowStock: number }
interface ImageSlot { id: string; url: string; file?: File; colorName?: string }

function rebuildVariants(
  sizes: string[],
  colors: ColorItem[],
  existing: Variant[]
): Variant[] {
  const map = new Map(existing.map((v) => [v.label, v]));
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  let labels: string[];
  if (hasSizes && hasColors) {
    labels = sizes.flatMap((s) => colors.map((c) => `${s} / ${c.name}`));
  } else if (hasSizes) {
    labels = [...sizes];
  } else if (hasColors) {
    labels = colors.map((c) => c.name);
  } else {
    labels = ["Default"];
  }

  return labels.map((label) => {
    const prev = map.get(label);
    return { id: label, label, stock: prev?.stock ?? 0, lowStock: prev?.lowStock ?? 3 };
  });
}

/* ── Card wrapper ────────────────────────────────────────────────── */
function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-ivory p-6">
      <h3 className="font-display text-lg text-ink mb-5 flex items-center gap-2">
        {icon && <span className="text-espresso-light">{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Input / Label helpers ───────────────────────────────────────── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-espresso-light mb-1.5">
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne placeholder:text-espresso-light/50";

const selectCls =
  "w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne appearance-none cursor-pointer";

/* ── Main Component ──────────────────────────────────────────────── */
export default function VendorAddProductPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  /* Images */
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Basic */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* Category */
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  /* Pricing */
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [saleEnabled, setSaleEnabled] = useState(false);
  const [saleStart, setSaleStart] = useState("");
  const [saleEnd, setSaleEnd] = useState("");

  /* Sizes */
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [showCustomSizeInput, setShowCustomSizeInput] = useState(false);

  /* Colors */
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [showColorForm, setShowColorForm] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#C6A15B");

  /* Variants */
  const [variants, setVariants] = useState<Variant[]>(
    [{ id: "default", label: "Default", stock: 0, lowStock: 3 }]
  );
  const [applyAllStock, setApplyAllStock] = useState("");

  /* Shipping */
  const [weight, setWeight] = useState("");
  const [shippingType, setShippingType] = useState<"fixed" | "free" | "calculated">("fixed");
  const [shippingFee, setShippingFee] = useState("");
  const [zones, setZones] = useState<Record<string, boolean>>({
    lagos: true,
    abuja: true,
    portHarcourt: false,
    others: true,
    nationwide: false,
  });

  /* SKU */
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");

  /* Status & UI */
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPriceGuard, setShowPriceGuard] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"draft" | "published">("published");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(isEditing);

  /* ── Load existing product for edit mode ────────────────────── */
  const loadExisting = useCallback(async () => {
    if (!supabase || !id) return;
    setLoadingExisting(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, description, category, subcategory, price, compare_at_price,
          sale_enabled, tags, sizes, colors, weight, shipping_type, shipping_fee,
          delivery_zones, sku, barcode, status, is_featured,
          product_images ( id, url, display_order, color_name ),
          product_variants ( id, label, stock, low_stock_threshold )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Product not found.");

      const d = data as Record<string, unknown>;
      setTitle((d.name as string) ?? "");
      setDescription((d.description as string) ?? "");
      setCategory((d.category as string) ?? "");
      setSubcategory((d.subcategory as string) ?? "");
      setTags((d.tags as string[]) ?? []);
      setPrice(String(d.price ?? ""));
      setCompareAtPrice(d.compare_at_price ? String(d.compare_at_price) : "");
      setSaleEnabled((d.sale_enabled as boolean) ?? false);
      setSku((d.sku as string) ?? "");
      setBarcode((d.barcode as string) ?? "");
      setWeight(d.weight ? String(d.weight) : "");
      setShippingType((d.shipping_type as "fixed" | "free" | "calculated") ?? "fixed");
      setShippingFee(d.shipping_fee ? String(d.shipping_fee) : "");
      setZones((d.delivery_zones as Record<string, boolean>) ?? {});
      setStatus((d.status as "draft" | "published") ?? "draft");
      setIsFeatured((d.is_featured as boolean) ?? false);

      // Sizes — stored as jsonb array of strings
      const sizesArr: string[] = (d.sizes as string[]) ?? [];
      setSelectedSizes(sizesArr.filter((s) => PRESET_SIZES.includes(s)));
      setCustomSizes(sizesArr.filter((s) => !PRESET_SIZES.includes(s)));

      // Colors — stored as jsonb array of {id, name, hex}
      setColors((d.colors as ColorItem[]) ?? []);

      // Images — sorted by display_order
      const imgs = ((d.product_images as { id: string; url: string; display_order: number; color_name?: string }[]) ?? [])
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => ({ id: img.id, url: img.url, colorName: img.color_name ?? undefined }));
      setImages(imgs);

      // Variants
      const dbVariants = ((d.product_variants as { id: string; label: string; stock: number; low_stock_threshold: number }[]) ?? [])
        .map((v) => ({ id: v.id, label: v.label, stock: v.stock, lowStock: v.low_stock_threshold }));
      if (dbVariants.length > 0) setVariants(dbVariants);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to load product.");
    } finally {
      setLoadingExisting(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      loadExisting();
    } else {
      // Load draft
      const draftStr = localStorage.getItem("vendor_product_draft");
      if (draftStr) {
        try {
          const d = JSON.parse(draftStr);
          setTitle(d.title || "");
          setDescription(d.description || "");
          setCategory(d.category || "");
          setSubcategory(d.subcategory || "");
          setTags(d.tags || []);
          setPrice(d.price || "");
          setCompareAtPrice(d.compareAtPrice || "");
          setSaleEnabled(d.saleEnabled || false);
          setSku(d.sku || "");
          setBarcode(d.barcode || "");
          setWeight(d.weight || "");
          setShippingType(d.shippingType || "fixed");
          setShippingFee(d.shippingFee || "");
          if (d.zones) setZones(d.zones);
          if (d.selectedSizes) setSelectedSizes(d.selectedSizes);
          if (d.customSizes) setCustomSizes(d.customSizes);
          if (d.colors) setColors(d.colors);
          if (d.variants && d.variants.length > 0) setVariants(d.variants);
        } catch (e) {
          // ignore
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Auto-save draft
  useEffect(() => {
    if (!isEditing && !saved && (title || description || category)) {
      const draft = {
        title, description, category, subcategory, tags, price, compareAtPrice,
        saleEnabled, sku, barcode, weight, shippingType, shippingFee, zones,
        selectedSizes, customSizes, colors, variants
      };
      localStorage.setItem("vendor_product_draft", JSON.stringify(draft));
    }
  }, [isEditing, saved, title, description, category, subcategory, tags, price, compareAtPrice, saleEnabled, sku, barcode, weight, shippingType, shippingFee, zones, selectedSizes, customSizes, colors, variants]);


  /* ── Effects ─────────────────────────────────────────────────── */
  useEffect(() => {
    setVariants((prev) =>
      rebuildVariants([...selectedSizes, ...customSizes], colors, prev)
    );
  }, [selectedSizes, customSizes, colors]);

  useEffect(() => {
    setSubcategory("");
  }, [category]);

  /* ── Image handlers ─────────────────────────────────────────── */
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

  /* ── Tag handlers ────────────────────────────────────────────── */
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  /* ── Size handlers ───────────────────────────────────────────── */
  const toggleSize = (size: string) =>
    setSelectedSizes((p) =>
      p.includes(size) ? p.filter((s) => s !== size) : [...p, size]
    );

  const addCustomSize = () => {
    const s = customSizeInput.trim();
    if (s && !customSizes.includes(s) && !selectedSizes.includes(s))
      setCustomSizes((p) => [...p, s]);
    setCustomSizeInput("");
    setShowCustomSizeInput(false);
  };

  const removeCustomSize = (s: string) =>
    setCustomSizes((p) => p.filter((x) => x !== s));

  /* ── Color handlers ──────────────────────────────────────────── */
  const addColor = () => {
    const n = newColorName.trim();
    if (n && !colors.find((c) => c.name.toLowerCase() === n.toLowerCase()))
      setColors((p) => [...p, { id: crypto.randomUUID(), name: n, hex: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#C6A15B");
    setShowColorForm(false);
  };

  /* ── Variant stock handlers ──────────────────────────────────── */
  const updateVariant = (idx: number, field: "stock" | "lowStock", val: string) =>
    setVariants((p) =>
      p.map((v, i) => (i === idx ? { ...v, [field]: parseInt(val) || 0 } : v))
    );

  const applyAllToVariants = () => {
    const qty = parseInt(applyAllStock) || 0;
    setVariants((p) => p.map((v) => ({ ...v, stock: qty })));
  };

  /* ── SKU generator ───────────────────────────────────────────── */
  const generateSku = () => {
    const prefix =
      title
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3) || "QLX";
    const cat = category.slice(0, 3).toUpperCase() || "PRD";
    const num = Math.floor(Math.random() * 900 + 100);
    setSku(`${prefix}-${cat}-${num}`);
  };

  /* ── Save handlers ───────────────────────────────────────────── */
  const handleSave = (targetStatus: "draft" | "published") => {
    const priceNum = parseFloat(price);
    if (!isNaN(priceNum) && priceNum > 0 && priceNum < 500) {
      setPendingStatus(targetStatus);
      setShowPriceGuard(true);
      return;
    }
    void doSave(targetStatus);
  };

  const doSave = async (targetStatus: "draft" | "published") => {
    if (!supabase || !user) {
      setSaveError("Not authenticated.");
      return;
    }
    setSaveError(null);
    setShowPriceGuard(false);

    try {
      const allSizes = [...selectedSizes, ...customSizes];
      const payload = {
        slug:             generateSlug(title.trim()),
        vendor_id:        user.id,
        name:             title.trim(),
        description:      description.trim() || null,
        category:         category || null,
        subcategory:      subcategory || null,
        price:            parseFloat(price) || 0,
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        sale_enabled:     saleEnabled,
        tags,
        sizes:            allSizes,
        colors,
        weight:           weight ? parseFloat(weight) : null,
        shipping_type:    shippingType,
        shipping_fee:     shippingFee ? parseFloat(shippingFee) : null,
        delivery_zones:   zones,
        sku:              sku.trim() || null,
        barcode:          barcode.trim() || null,
        status:           targetStatus,
        is_featured:      isFeatured,
      };

      let productId = id;

      if (isEditing && productId) {
        // ── Update ─────────────────────────────────────────────
        const { error: updateErr } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productId);
        if (updateErr) throw updateErr;
      } else {
        // ── Insert ─────────────────────────────────────────────
        const { data: inserted, error: insertErr } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (insertErr) throw insertErr;
        productId = (inserted as { id: string }).id;
      }

      // ── Upload any newly-added (blob:) images to Supabase Storage ────────
      const uploadedImages: ImageSlot[] = await Promise.all(
        images.map(async (img) => {
          if (!img.url.startsWith("blob:") || !img.file) return img; // already an https:// URL
          const ext = img.file.name.split(".").pop() ?? "jpg";
          const path = `${productId}/${img.id}.${ext}`;
          const { error: upErr } = await supabase!.storage
            .from("product-images")
            .upload(path, img.file, { upsert: true, contentType: img.file.type });
          if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
          const { data: urlData } = supabase!.storage
            .from("product-images")
            .getPublicUrl(path);
          URL.revokeObjectURL(img.url);
          return { id: img.id, url: urlData.publicUrl, colorName: img.colorName };
        })
      );

      // ── Sync product_images table ────────────────────────────────────────
      if (isEditing) {
        await supabase.from("product_images").delete().eq("product_id", productId!);
      }
      if (uploadedImages.length > 0) {
        const { error: imgErr } = await supabase.from("product_images").insert(
          uploadedImages.map((img, i) => ({
            product_id:    productId,
            url:           img.url,
            display_order: i,
            color_name:    img.colorName ?? null,
          }))
        );
        if (imgErr) throw imgErr;
      }

      // ── Sync product_variants ────────────────────────────────
      if (isEditing) {
        await supabase.from("product_variants").delete().eq("product_id", productId!);
      }
      const { error: varErr } = await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id:          productId,
          label:               v.label,
          stock:               v.stock,
          low_stock_threshold: v.lowStock,
        }))
      );
      if (varErr) throw varErr;

      setStatus(targetStatus);
      setSaved(true);
      if (!isEditing) localStorage.removeItem("vendor_product_draft");
      setTimeout(() => navigate("/vendor/products"), 1800);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save product.");
    }
  };

  /* ── Derived values ──────────────────────────────────────────── */
  const priceNum = parseFloat(price);
  const compareNum = parseFloat(compareAtPrice);
  const hasDiscount = saleEnabled && !isNaN(priceNum) && !isNaN(compareNum) && compareNum > priceNum;
  const discountPct = hasDiscount ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0;
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const subcategories = category ? (CATEGORIES[category] ?? []) : [];

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 pb-14 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          to="/vendor/products"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-ivory text-espresso-light hover:bg-cream transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="font-display text-2xl text-ink">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <p className="mt-0.5 text-sm text-espresso-light">
            {isEditing
              ? "Update your product details below."
              : "Fill in the form to create a new listing. You can save as a draft first."}
          </p>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <Check size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">
              {status === "published" ? "Product published successfully!" : "Product saved as draft!"}
            </p>
            <p className="text-xs text-emerald-600">Redirecting to your products list…</p>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {saveError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle size={18} className="shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* ── Loading overlay for edit mode ── */}
      {loadingExisting ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-cream" />
          ))}
        </div>
      ) : (
        <>

      {/* ── Two-column grid ── */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ════ LEFT COLUMN ════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── 1. Basic Information ── */}
          <Card title="Basic Information">
            <div className="space-y-4">
              <div>
                <Label required>Product Title</Label>
                <input
                  id="product-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Silk Evening Gown"
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-espresso-light">
                  Keep it short and descriptive — this is what customers see first.
                </p>
              </div>
              <div>
                <Label required>Description</Label>
                <textarea
                  id="product-description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the fabric, fit, care instructions, and who it's for..."
                  className={`${inputCls} resize-none`}
                />
                <p className="mt-1 text-xs text-espresso-light text-right">
                  {description.length} characters
                </p>
              </div>
            </div>
          </Card>

          {/* ── 2. Media / Images ── */}
          <Card title="Product Images" icon={<ImagePlus size={18} />}>
            <div className="space-y-4">
              {/* Image grid */}
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
                        alt={`Product image ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {/* Cover badge */}
                      {i === 0 && (
                        <span className="absolute top-1 left-1 rounded-md bg-ink/80 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ivory">
                          Cover
                        </span>
                      )}
                      {/* Grip indicator */}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={14} />
                      </span>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        aria-label="Remove image"
                      >
                        <X size={10} />
                      </button>
                      {/* Color tag: only shown when colors exist */}
                      {colors.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-ink/70 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            value={img.colorName ?? ""}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              const val = e.target.value;
                              setImages((prev) =>
                                prev.map((slot, idx) =>
                                  idx === i ? { ...slot, colorName: val || undefined } : slot
                                )
                              );
                            }}
                            className="w-full rounded text-[0.55rem] bg-transparent text-ivory border-none outline-none cursor-pointer leading-tight"
                            title="Tag this image to a color"
                            draggable={false}
                          >
                            <option value="">All colors</option>
                            {colors.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
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

              {/* Upload input */}
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
          </Card>

          {/* ── 3. Category ── */}
          <Card title="Category & Tags" icon={<Tag size={18} />}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Category</Label>
                  <div className="relative">
                    <select
                      id="product-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select category…</option>
                      {Object.keys(CATEGORIES).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-espresso-light" />
                  </div>
                </div>
                <div>
                  <Label>Subcategory</Label>
                  <div className="relative">
                    <select
                      id="product-subcategory"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      disabled={!category}
                      className={`${selectCls} disabled:opacity-50`}
                    >
                      <option value="">
                        {category ? "Select subcategory…" : "Choose category first"}
                      </option>
                      {subcategories.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="__custom__">+ Other / Custom</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-espresso-light" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="e.g. Summer, Luxury, Evening…"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="shrink-0 rounded-lg border border-line bg-ivory px-4 py-2.5 text-sm font-medium text-espresso-light hover:bg-cream hover:text-ink transition-colors"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-espresso-light"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => setTags((p) => p.filter((x) => x !== t))}
                          className="text-espresso-light/60 hover:text-red-400 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── 4. Pricing ── */}
          <Card title="Pricing">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label required>Regular Price (₦)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-espresso-light">₦</span>
                    <input
                      id="product-price"
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                  {price && !isNaN(priceNum) && priceNum > 0 && (
                    <p className="mt-1 text-xs text-espresso-light">= {formatNaira(priceNum)}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label>Sale / Compare Price (₦)</Label>
                    <button
                      type="button"
                      onClick={() => setSaleEnabled((p) => !p)}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                        saleEnabled ? "bg-champagne" : "bg-line"
                      }`}
                      role="switch"
                      aria-checked={saleEnabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          saleEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-espresso-light">₦</span>
                    <input
                      type="number"
                      min="0"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="Original / higher price"
                      disabled={!saleEnabled}
                      className={`${inputCls} pl-8 disabled:opacity-50`}
                    />
                  </div>
                  {hasDiscount && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      {discountPct}% discount · Customer sees:{" "}
                      <span className="line-through text-espresso-light">{formatNaira(compareNum)}</span>{" "}
                      {formatNaira(priceNum)}
                    </p>
                  )}
                </div>
              </div>

              {/* Sale period */}
              {saleEnabled && (
                <div className="rounded-lg border border-champagne/30 bg-champagne/5 p-4">
                  <p className="text-xs font-medium text-espresso-light mb-3 uppercase tracking-wider">
                    Sale Period (optional)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Start Date</Label>
                      <input
                        type="date"
                        value={saleStart}
                        onChange={(e) => setSaleStart(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <input
                        type="date"
                        value={saleEnd}
                        onChange={(e) => setSaleEnd(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-espresso-light">
                    Leave blank to keep the sale running until you turn it off.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* ── 5. Sizes & Variants ── */}
          <Card title="Sizes & Variants">
            <div className="space-y-5">
              {/* Sizes */}
              <div>
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? "border-ink bg-ink text-ivory"
                          : "border-line bg-cream/30 text-espresso-light hover:border-ink hover:text-ink"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                  {/* Custom sizes */}
                  {customSizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-champagne bg-champagne/10 px-3 py-1.5 text-sm font-medium text-espresso"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeCustomSize(size)}
                        className="text-espresso-light hover:text-red-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {/* Add custom */}
                  {showCustomSizeInput ? (
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addCustomSize(); if (e.key === "Escape") setShowCustomSizeInput(false); }}
                        placeholder="e.g. Free Size"
                        className="w-32 rounded-lg border border-champagne/50 bg-cream/30 px-3 py-1.5 text-sm text-ink outline-none focus:border-champagne"
                      />
                      <button
                        type="button"
                        onClick={addCustomSize}
                        className="rounded-lg bg-ink px-3 py-1.5 text-sm text-ivory hover:bg-espresso transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomSizeInput(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-sm text-espresso-light hover:border-champagne hover:text-champagne transition-colors"
                    >
                      <Plus size={13} /> Custom
                    </button>
                  )}
                </div>
              </div>

              <div className="hairline" />

              {/* Colors */}
              <div>
                <Label>Colours (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-line bg-cream/30 px-3 py-1.5 text-sm font-medium text-espresso-light"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-line/50"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                      <button
                        type="button"
                        onClick={() => setColors((p) => p.filter((x) => x.id !== c.id))}
                        className="text-espresso-light/60 hover:text-red-400 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  {showColorForm ? (
                    <div className="flex items-center gap-2 rounded-lg border border-champagne/40 bg-champagne/5 px-3 py-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded-md border-0 bg-transparent p-0"
                      />
                      <input
                        autoFocus
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addColor(); if (e.key === "Escape") setShowColorForm(false); }}
                        placeholder="Colour name…"
                        className="w-28 bg-transparent text-sm text-ink outline-none placeholder:text-espresso-light/50"
                      />
                      <button type="button" onClick={addColor} className="text-champagne hover:text-gold transition-colors">
                        <Check size={15} />
                      </button>
                      <button type="button" onClick={() => setShowColorForm(false)} className="text-espresso-light hover:text-ink transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowColorForm(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-sm text-espresso-light hover:border-champagne hover:text-champagne transition-colors"
                    >
                      <Plus size={13} /> Add Colour
                    </button>
                  )}
                </div>
              </div>

              {(selectedSizes.length > 0 || customSizes.length > 0) && colors.length > 0 && (
                <p className="text-xs text-espresso-light bg-cream/50 rounded-lg px-3 py-2">
                  ℹ️ {(selectedSizes.length + customSizes.length) * colors.length} variants will be generated (
                  {selectedSizes.length + customSizes.length} sizes × {colors.length} colours).
                  Stock is set per variant below.
                </p>
              )}
            </div>
          </Card>

          {/* ── 6. Stock Table ── */}
          <Card title="Stock Quantity">
            <div className="space-y-4">
              {/* Bulk fill */}
              <div className="flex items-center gap-3 rounded-lg border border-line bg-cream/30 p-3">
                <span className="text-sm text-espresso-light shrink-0">Apply same quantity to all:</span>
                <input
                  type="number"
                  min="0"
                  value={applyAllStock}
                  onChange={(e) => setApplyAllStock(e.target.value)}
                  placeholder="0"
                  className="w-20 rounded-md border border-line bg-ivory py-1.5 px-3 text-sm text-ink outline-none focus:border-champagne"
                />
                <button
                  type="button"
                  onClick={applyAllToVariants}
                  className="rounded-md bg-ink px-4 py-1.5 text-xs font-medium text-ivory hover:bg-espresso transition-colors"
                >
                  Apply
                </button>
                <span className="ml-auto text-xs text-espresso-light">
                  Total stock: <strong className="text-ink">{totalStock}</strong>
                </span>
              </div>

              {/* Variant table */}
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream/50">
                    <tr>
                      <th className="py-2.5 pl-5 pr-4 text-left text-xs font-medium text-espresso-light uppercase tracking-wider">
                        Variant
                      </th>
                      <th className="py-2.5 px-4 text-left text-xs font-medium text-espresso-light uppercase tracking-wider">
                        Stock (units)
                      </th>
                      <th className="py-2.5 pl-4 pr-5 text-left text-xs font-medium text-espresso-light uppercase tracking-wider">
                        Alert when below
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {variants.map((v, i) => (
                      <tr key={v.id} className="hover:bg-cream/20">
                        <td className="py-3 pl-5 pr-4 font-medium text-ink">
                          {v.label}
                          {v.stock === 0 && (
                            <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[0.65rem] font-semibold text-red-500">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => updateVariant(i, "stock", e.target.value)}
                            className="w-20 rounded-md border border-line bg-ivory py-1.5 px-3 text-sm text-ink outline-none focus:border-champagne"
                          />
                        </td>
                        <td className="py-2.5 pl-4 pr-5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={v.lowStock}
                              onChange={(e) => updateVariant(i, "lowStock", e.target.value)}
                              className="w-20 rounded-md border border-line bg-ivory py-1.5 px-3 text-sm text-ink outline-none focus:border-champagne"
                            />
                            <span className="text-xs text-espresso-light">units</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* ── 7. Shipping ── */}
          <Card title="Shipping Details" icon={<Truck size={18} />}>
            <div className="space-y-4">
              <div>
                <Label>Product Weight</Label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.5"
                    className={inputCls}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-espresso-light">
                    kg
                  </span>
                </div>
              </div>

              {/* Shipping type */}
              <div>
                <Label>Delivery Fee Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["fixed", "free", "calculated"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setShippingType(t)}
                      className={`rounded-lg border py-3 text-sm font-medium capitalize transition-all ${
                        shippingType === t
                          ? "border-ink bg-ink text-ivory"
                          : "border-line bg-cream/30 text-espresso-light hover:border-ink hover:text-ink"
                      }`}
                    >
                      {t === "fixed" ? "Fixed Fee" : t === "free" ? "Free Shipping" : "Calculated"}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-espresso-light">
                  {shippingType === "fixed" && "You set one delivery fee for the product."}
                  {shippingType === "free" && "No delivery charge — ideal for promotions."}
                  {shippingType === "calculated" && "Fee is calculated based on the customer's location."}
                </p>
              </div>

              {shippingType === "fixed" && (
                <div className="max-w-xs">
                  <Label>Delivery Fee (₦)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-espresso-light">₦</span>
                    <input
                      type="number"
                      min="0"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      placeholder="1500"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
              )}

              {/* Delivery zones */}
              <div>
                <Label>Delivery Zones</Label>
                <div className="space-y-2">
                  {SHIPPING_ZONES.map((z) => (
                    <label
                      key={z.key}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-cream/20 px-4 py-3 hover:bg-cream/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={zones[z.key] ?? false}
                        onChange={(e) =>
                          setZones((p) => ({ ...p, [z.key]: e.target.checked }))
                        }
                        className="h-4 w-4 accent-champagne"
                      />
                      <span className="flex-1 text-sm font-medium text-ink">{z.label}</span>
                      <span className="text-xs text-espresso-light">{z.hint}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* ── 8. SKU ── */}
          <Card title="Product Code (SKU)">
            <div className="space-y-4">
              <div>
                <Label>SKU — Stock Keeping Unit</Label>
                <div className="flex gap-2">
                  <input
                    id="product-sku"
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. QLX-DRS-001"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    title="Auto-generate SKU"
                    className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-line bg-ivory px-4 py-2.5 text-sm font-medium text-espresso-light hover:bg-cream hover:text-ink transition-colors"
                  >
                    <RefreshCw size={14} />
                    Generate
                  </button>
                </div>
                <p className="mt-1 text-xs text-espresso-light">
                  A unique code to help you track this product. Leave blank and click "Generate" if unsure.
                </p>
              </div>
              <div>
                <Label>Barcode (optional)</Label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="ISBN, UPC, EAN…"
                  className={inputCls}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ════ RIGHT SIDEBAR ════ */}
        <div className="space-y-4 self-start lg:sticky lg:top-4">

          {/* Status card */}
          <div className="rounded-xl border border-line bg-ivory p-5">
            <h3 className="font-display text-base text-ink mb-4">Visibility</h3>
            <div className="space-y-2">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all text-left ${
                    status === s
                      ? s === "published"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-ink bg-ink text-ivory"
                      : "border-line bg-cream/30 text-espresso-light hover:border-ink"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    status === s ? "bg-current" : "border-2 border-current"
                  }`}>
                    {status === s && <Check size={11} className={s === "published" ? "text-emerald-50" : "text-ink"} />}
                  </span>
                  <div>
                    <p className="font-semibold capitalize">{s === "published" ? "Published" : "Draft"}</p>
                    <p className={`text-xs mt-0.5 ${status === s ? "opacity-70" : "text-espresso-light"}`}>
                      {s === "published" ? "Visible to customers" : "Hidden from store"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature toggle */}
          <div className="rounded-xl border border-line bg-ivory p-5">
            <h3 className="font-display text-base text-ink mb-3 flex items-center gap-2">
              <Star size={15} className="text-gold" />
              Visibility Boost
            </h3>
            <label className="flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  id="is-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`h-5 w-9 rounded-full transition-colors ${
                    isFeatured ? "bg-gold" : "bg-line"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-ivory shadow transition-transform ${
                      isFeatured ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Feature this product</p>
                <p className="mt-0.5 text-xs text-espresso-light">
                  Featured products appear in homepage showcase sections and category highlights.
                </p>
              </div>
            </label>
          </div>

          {/* Quick summary */}
          <div className="rounded-xl border border-line bg-ivory p-5">
            <h3 className="font-display text-base text-ink mb-3">Summary</h3>
            <ul className="space-y-2 text-xs">
              <SummaryRow label="Images" value={`${images.length} / 8`} ok={images.length > 0} />
              <SummaryRow label="Price" value={price ? formatNaira(price) : "Not set"} ok={!!price} />
              <SummaryRow label="Category" value={category || "Not set"} ok={!!category} />
              <SummaryRow label="Sizes / Variants" value={`${variants.length} variant${variants.length !== 1 ? "s" : ""}`} ok={variants.some(v => v.stock > 0) || variants[0]?.label === "Default"} />
              <SummaryRow label="Total Stock" value={`${totalStock} units`} ok={totalStock > 0} />
              <SummaryRow label="SKU" value={sku || "Not set"} ok={!!sku} />
            </ul>
          </div>

          {/* Actions */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-ivory py-3 text-sm font-medium text-espresso-light hover:bg-cream hover:text-ink transition-colors"
          >
            <Eye size={16} />
            Preview Product
          </button>

          <button
            type="button"
            onClick={() => handleSave("draft")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-ink bg-ivory py-3 text-sm font-medium text-ink hover:bg-cream transition-colors"
          >
            <Save size={16} />
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("published")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-ivory hover:bg-espresso transition-colors"
          >
            <Rocket size={16} />
            Publish Now
          </button>

          <p className="text-center text-xs text-espresso-light">
            Products go live immediately when published. No approval needed.
          </p>
        </div>
      </div>

      {/* ════ PREVIEW MODAL ════ */}
      {showPreview && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-ivory shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "dialogIn 0.2s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-ivory px-5 py-4 z-10">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-espresso-light" />
                <span className="text-sm font-medium text-espresso-light">Customer Preview</span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-lg text-espresso-light hover:bg-cream hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Product preview */}
            <div className="p-5 space-y-5">
              {/* Image */}
              <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-cream">
                {images.length > 0 ? (
                  <img src={images[0].url} alt={title || "Product"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-espresso-light/40">
                    <ImagePlus size={48} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                {category && (
                  <p className="text-xs text-espresso-light uppercase tracking-widest mb-1">{category}</p>
                )}
                <h2 className="font-display text-2xl text-ink">
                  {title || <span className="text-espresso-light/50">Product Title</span>}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-xl font-semibold text-ink">
                    {price ? formatNaira(price) : <span className="text-espresso-light/50">₦0</span>}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm line-through text-espresso-light">{formatNaira(compareNum)}</span>
                  )}
                  {hasDiscount && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                      -{discountPct}%
                    </span>
                  )}
                </div>

                {/* Sizes */}
                {(selectedSizes.length > 0 || customSizes.length > 0) && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-espresso-light mb-2">Select Size</p>
                    <div className="flex flex-wrap gap-2">
                      {[...selectedSizes, ...customSizes].map((s) => {
                        const variant = variants.find((v) => v.label === s || v.label.startsWith(s + " /"));
                        const outOfStock = variant && variant.stock === 0;
                        return (
                          <span
                            key={s}
                            className={`rounded-lg border px-3.5 py-2 text-sm font-medium ${
                              outOfStock
                                ? "border-line bg-cream/20 text-espresso-light/50 line-through cursor-not-allowed"
                                : "border-line bg-cream/30 text-ink cursor-pointer hover:border-ink"
                            }`}
                          >
                            {s}
                            {outOfStock && <span className="ml-1 text-[0.6rem]">OOS</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description preview */}
                {description && (
                  <p className="mt-4 text-sm text-espresso-light leading-relaxed line-clamp-3">
                    {description}
                  </p>
                )}

                {/* Shipping note */}
                <div className="mt-4 flex items-center gap-2 text-xs text-espresso-light">
                  <Truck size={13} />
                  {shippingType === "free"
                    ? "Free delivery"
                    : shippingFee
                    ? `Delivery from ${formatNaira(shippingFee)}`
                    : "Delivery fee applies"}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-line bg-ivory px-5 py-4">
              <p className="text-center text-xs text-espresso-light">
                This is how customers will see your product. Close to keep editing.
              </p>
            </div>
          </div>
          <style>{`
            @keyframes dialogIn {
              from { opacity: 0; transform: scale(0.97) translateY(10px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      , document.body)}

      {/* ════ PRICE GUARD MODAL ════ */}
      {showPriceGuard && (
        <VendorConfirmDialog
          variant="warning"
          title="Double-check your price"
          message={`You entered ${formatNaira(price) || `₦${price}`} for this product. This seems very low — is that intentional, or did you mean a higher amount?`}
          confirmLabel="Yes, price is correct"
          cancelLabel="Let me fix it"
          onConfirm={() => void doSave(pendingStatus)}
          onCancel={() => setShowPriceGuard(false)}
        />
      )}
        </>
      )}
    </div>
  );
}

/* ── Summary row helper ──────────────────────────────────────────── */
function SummaryRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-espresso-light">{label}</span>
      <span className={`font-medium flex items-center gap-1 ${ok ? "text-ink" : "text-espresso-light/60"}`}>
        {value}
        {ok ? (
          <Check size={11} className="text-emerald-500" />
        ) : (
          <AlertTriangle size={11} className="text-amber-400" />
        )}
      </span>
    </li>
  );
}
