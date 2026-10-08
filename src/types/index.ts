export type ProductCategory =
  | "Dresses"
  | "Tops"
  | "Handbags"
  | "Jewelry"
  | "Shoes"
  | "Beauty"
  | "Accessories";

export interface Product {
  id: string;
  /** UUID of the vendor who owns this product. Present for DB products;
   *  static/demo products use a placeholder string. */
  vendorId?: string;
  name: string;
  slug: string;
  category: ProductCategory;
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
