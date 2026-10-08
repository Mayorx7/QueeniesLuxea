// Shared vendor product mock data
// Used by VendorProductsPage and VendorAddProductPage (edit mode)

export interface VendorProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  saleEnabled?: boolean;
  description: string;
  tags: string[];
  sizes: string[];
  colors: { id: string; name: string; hex: string }[];
  variants: { id: string; label: string; stock: number; lowStock: number }[];
  images: string[];
  weight: string;
  shippingType: "fixed" | "free" | "calculated";
  shippingFee: string;
  zones: Record<string, boolean>;
  sku: string;
  barcode: string;
  stock: number; // total across all variants
  status: "Active" | "Draft" | "Out of Stock";
}

export const VENDOR_PRODUCTS: VendorProduct[] = [
  {
    id: "p1",
    name: "Amara Silk Gown",
    category: "Dresses",
    subcategory: "Gowns",
    price: 125000,
    compareAtPrice: 158000,
    saleEnabled: true,
    description:
      "An elegant floor-length gown crafted from premium silk. Features a flattering wrap silhouette and adjustable tie waist. Perfect for evening events, galas, and formal occasions. Dry clean only.",
    tags: ["Silk", "Evening", "Gown", "Luxury"],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ id: "c1", name: "Ivory", hex: "#FAFAFA" }],
    variants: [
      { id: "S", label: "S", stock: 4, lowStock: 2 },
      { id: "M", label: "M", stock: 6, lowStock: 2 },
      { id: "L", label: "L", stock: 3, lowStock: 2 },
      { id: "XL", label: "XL", stock: 2, lowStock: 1 },
    ],
    images: [
      "https://images.unsplash.com/photo-1566160983935-8659b85c884d?q=80&w=600&auto=format&fit=crop",
    ],
    weight: "0.8",
    shippingType: "fixed",
    shippingFee: "2500",
    zones: { lagos: true, abuja: true, portHarcourt: false, others: true, nationwide: false },
    sku: "AMA-DRS-001",
    barcode: "",
    stock: 15,
    status: "Active",
  },
  {
    id: "p2",
    name: "Linen Summer Blazer",
    category: "Outerwear",
    subcategory: "Blazers",
    price: 85000,
    description:
      "Relaxed-fit linen blazer with a single-button closure. Breathable and lightweight — ideal for warm weather styling. Pair with trousers or shorts for a smart-casual look.",
    tags: ["Linen", "Blazer", "Summer"],
    sizes: ["S", "M", "L"],
    colors: [{ id: "c1", name: "Beige", hex: "#D4B896" }],
    variants: [
      { id: "S", label: "S", stock: 0, lowStock: 2 },
      { id: "M", label: "M", stock: 0, lowStock: 2 },
      { id: "L", label: "L", stock: 0, lowStock: 2 },
    ],
    images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=600&auto=format&fit=crop",
    ],
    weight: "0.5",
    shippingType: "fixed",
    shippingFee: "1500",
    zones: { lagos: true, abuja: true, portHarcourt: false, others: false, nationwide: false },
    sku: "LIN-BLZ-002",
    barcode: "",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: "p3",
    name: "Pleated Midi Skirt",
    category: "Bottoms",
    subcategory: "Skirts",
    price: 65000,
    description:
      "A flowy pleated midi skirt with an elasticated waistband for all-day comfort. Available in a range of sizes. Machine washable on gentle cycle.",
    tags: ["Pleated", "Midi", "Skirt"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ id: "c1", name: "Dusty Rose", hex: "#C4848A" }],
    variants: [
      { id: "XS", label: "XS", stock: 2, lowStock: 2 },
      { id: "S", label: "S", stock: 3, lowStock: 2 },
      { id: "M", label: "M", stock: 2, lowStock: 2 },
      { id: "L", label: "L", stock: 1, lowStock: 1 },
      { id: "XL", label: "XL", stock: 0, lowStock: 1 },
    ],
    images: [
      "https://images.unsplash.com/photo-1583391733958-650fac5ceb1c?q=80&w=600&auto=format&fit=crop",
    ],
    weight: "0.4",
    shippingType: "fixed",
    shippingFee: "1500",
    zones: { lagos: true, abuja: true, portHarcourt: true, others: true, nationwide: false },
    sku: "PLT-SKT-003",
    barcode: "",
    stock: 8,
    status: "Active",
  },
  {
    id: "p4",
    name: "Velvet Wrap Coat",
    category: "Outerwear",
    subcategory: "Coats",
    price: 210000,
    description:
      "Luxurious velvet wrap coat with a self-tie belt. Floor-length silhouette. Ideal for evening events or as a statement layer.",
    tags: ["Velvet", "Coat", "Evening", "Luxury"],
    sizes: ["S", "M", "L"],
    colors: [{ id: "c1", name: "Deep Plum", hex: "#4A235A" }],
    variants: [
      { id: "S", label: "S", stock: 0, lowStock: 1 },
      { id: "M", label: "M", stock: 0, lowStock: 1 },
      { id: "L", label: "L", stock: 0, lowStock: 1 },
    ],
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
    ],
    weight: "1.2",
    shippingType: "fixed",
    shippingFee: "3000",
    zones: { lagos: true, abuja: true, portHarcourt: false, others: false, nationwide: false },
    sku: "VLV-CT-004",
    barcode: "",
    stock: 0,
    status: "Draft",
  },
  {
    id: "p5",
    name: "Classic Cotton Shirt",
    category: "Tops",
    subcategory: "Shirts",
    price: 45000,
    description:
      "A timeless cotton poplin shirt with a relaxed fit. Features a pointed collar and single-button cuffs. Available in multiple colours. Machine washable.",
    tags: ["Cotton", "Shirt", "Classic", "Casual"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [{ id: "c1", name: "White", hex: "#FFFFFF" }],
    variants: [
      { id: "XS", label: "XS", stock: 5, lowStock: 3 },
      { id: "S", label: "S", stock: 8, lowStock: 3 },
      { id: "M", label: "M", stock: 10, lowStock: 3 },
      { id: "L", label: "L", stock: 5, lowStock: 3 },
      { id: "XL", label: "XL", stock: 3, lowStock: 2 },
      { id: "XXL", label: "XXL", stock: 1, lowStock: 1 },
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop",
    ],
    weight: "0.3",
    shippingType: "fixed",
    shippingFee: "1500",
    zones: { lagos: true, abuja: true, portHarcourt: true, others: true, nationwide: false },
    sku: "CTN-SHT-005",
    barcode: "",
    stock: 32,
    status: "Active",
  },
  {
    id: "p6",
    name: "Satin Evening Trousers",
    category: "Bottoms",
    subcategory: "Trousers",
    price: 95000,
    description:
      "Wide-leg satin trousers with a high-rise waistband and side zip. A versatile evening staple that pairs beautifully with blouses or tailored jackets.",
    tags: ["Satin", "Trousers", "Evening", "Wide-Leg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ id: "c1", name: "Champagne", hex: "#C6A15B" }],
    variants: [
      { id: "XS", label: "XS", stock: 2, lowStock: 2 },
      { id: "S", label: "S", stock: 3, lowStock: 2 },
      { id: "M", label: "M", stock: 4, lowStock: 2 },
      { id: "L", label: "L", stock: 2, lowStock: 2 },
      { id: "XL", label: "XL", stock: 1, lowStock: 1 },
    ],
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
    ],
    weight: "0.5",
    shippingType: "fixed",
    shippingFee: "1500",
    zones: { lagos: true, abuja: true, portHarcourt: false, others: true, nationwide: false },
    sku: "SAT-TRS-006",
    barcode: "",
    stock: 12,
    status: "Active",
  },
];
