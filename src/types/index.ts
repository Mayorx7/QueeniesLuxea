export type ProductCategory =
  | "Dresses"
  | "Tops"
  | "Bottoms"
  | "Outerwear"
  | "Handbags"
  | "Jewelry"
  | "Shoes"
  | "Beauty"
  | "Accessories"
  | "Men"
  | "Women"
  | "Offers";

export interface Product {
  id: string;
  /** UUID of the vendor who owns this product. Present for DB products;
   *  static/demo products use a placeholder string. */
  vendorId?: string;
  name: string;
  slug: string;
  /** The primary category, retained for existing links and navigation. */
  category: ProductCategory;
  /** All categories the vendor selected for this product. */
  categories?: ProductCategory[];
  price: number;
  compareAtPrice?: number;
  description: string;
  details: string[];
  colors: string[];
  sizes: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
  tags: string[];
  sku?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string; // Maps to product_variants table
  quantity: number;
  color: string;
  size: string;
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export interface ProductFilterState {
  categories: ProductCategory[];
  colors: string[];
  sizes: string[];
  priceMax: number;
  inStockOnly: boolean;
}

// ─────────────────────────────────────────────
// OFFERS TYPES
// ─────────────────────────────────────────────

export type OfferType = "fyb_campus" | "wholesale" | "special_promo";

export type OfferStatus = "draft" | "scheduled" | "active" | "paused" | "expired";

export type DiscountType = "none" | "percentage" | "fixed_amount" | "fixed_price";

export type OrderingMethod = "checkout" | "whatsapp" | "both";

export type FybSubcategory = "jackets" | "denim" | "corporate_wear" | "sneakers" | "shirts" | "streetwear" | "accessories" | "packages";

export interface Offer {
  id: string;
  vendorId: string;
  title: string;
  slug: string;
  description: string | null;
  offerType: OfferType;
  subcategory?: FybSubcategory;
  originalPrice: number | null;
  offerPrice: number | null;
  discountType: DiscountType;
  discountValue: number | null;
  minQuantity: number;
  maxQuantity: number | null;
  startDate: string | null;
  expiryDate: string | null;
  customizationInfo: Record<string, unknown>;
  orderingMethod: OrderingMethod;
  fulfilmentNotes: string | null;
  status: OfferStatus;
  isFeatured: boolean;
  linkedProductIds: string[];
  tags: string[];
  images: OfferImage[];
  pricingTiers: OfferPricingTier[];
  createdAt: string;
  updatedAt: string;
}

export interface OfferImage {
  id: string;
  offerId: string;
  url: string;
  displayOrder: number;
}

export interface OfferPricingTier {
  id: string;
  offerId: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
}

export interface OfferFormData {
  title: string;
  slug: string;
  description: string;
  offerType: OfferType;
  subcategory: string | null;
  originalPrice: number | null;
  offerPrice: number | null;
  discountType: DiscountType;
  discountValue: number | null;
  minQuantity: number;
  maxQuantity: number | null;
  startDate: string | null;
  expiryDate: string | null;
  customizationInfo: Record<string, unknown>;
  orderingMethod: OrderingMethod;
  fulfilmentNotes: string;
  isFeatured: boolean;
  linkedProductIds: string[];
  tags: string[];
  images: { url: string; displayOrder: number }[];
  pricingTiers: { minQuantity: number; maxQuantity: number | null; pricePerUnit: number }[];
}
