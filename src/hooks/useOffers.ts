import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { img } from "../utils/image";
import type { Offer, OfferType, OfferStatus, FybSubcategory } from "../types";

// ─── Mock Data for FYB & Campus Deals ───────────────────────────────────────

const MOCK_FYB_OFFERS: Offer[] = [
  // 1. Department Jackets
  {
    id: "mock-1",
    vendorId: "mock-vendor-1",
    title: "Custom Varsity Jackets - Class of 2026",
    slug: "custom-varsity-jackets-class-2026",
    description: "Premium varsity jackets with embroidered department names, logos, and graduation year. Perfect for signing-out ceremonies and group orders.",
    offerType: "fyb_campus",
    subcategory: "jackets",
    originalPrice: 45000,
    offerPrice: 35000,
    discountType: "percentage",
    discountValue: 22,
    minQuantity: 10,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      university: "Available for all universities",
      department: "Custom department embroidery",
      options: "Name, Logo, Year, Size (S-XXL)",
      colors: "Navy, Maroon, Black, Royal Blue"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Production time: 2-3 weeks after order confirmation. Group orders receive priority.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["jackets", "custom", "embroidered", "varsity"],
    images: [
      { id: "img-1", offerId: "mock-1", url: img("photo-1591047138522-83f8f8a9a6c8", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-1", offerId: "mock-1", minQuantity: 10, maxQuantity: 24, pricePerUnit: 35000 },
      { id: "pt-2", offerId: "mock-1", minQuantity: 25, maxQuantity: 49, pricePerUnit: 32000 },
      { id: "pt-3", offerId: "mock-1", minQuantity: 50, maxQuantity: null, pricePerUnit: 28000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-2",
    vendorId: "mock-vendor-1",
    title: "Department Bomber Jackets",
    slug: "department-bomber-jackets",
    description: "Stylish bomber jackets with department branding. Lightweight and comfortable for daily wear.",
    offerType: "fyb_campus",
    subcategory: "jackets",
    originalPrice: 38000,
    offerPrice: 30000,
    discountType: "percentage",
    discountValue: 21,
    minQuantity: 15,
    maxQuantity: 80,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      university: "Available for all universities",
      department: "Department name and logo",
      options: "Name, Size (S-XXL)",
      colors: "Black, Olive, Grey, Navy"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Production time: 2 weeks. Minimum order applies.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["jackets", "bomber", "department"],
    images: [
      { id: "img-2", offerId: "mock-2", url: img("photo-1551028719-00167b16eac5", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-4", offerId: "mock-2", minQuantity: 15, maxQuantity: 29, pricePerUnit: 30000 },
      { id: "pt-5", offerId: "mock-2", minQuantity: 30, maxQuantity: null, pricePerUnit: 27000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 2. Jeans-on-Jeans Collection
  {
    id: "mock-3",
    vendorId: "mock-vendor-1",
    title: "Denim Jacket & Jeans Set",
    slug: "denim-jacket-jeans-set",
    description: "Matching denim jacket and jeans set for coordinated group looks. Available in multiple washes.",
    offerType: "fyb_campus",
    subcategory: "denim",
    originalPrice: 42000,
    offerPrice: 32000,
    discountType: "percentage",
    discountValue: 24,
    minQuantity: 5,
    maxQuantity: 50,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (S-XXL), Wash (Light, Medium, Dark)",
      colors: "Blue, Black, Grey"
    },
    orderingMethod: "both",
    fulfilmentNotes: "Ready stock available for popular sizes. Custom orders take 1-2 weeks.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["denim", "jeans", "jacket", "set"],
    images: [
      { id: "img-3", offerId: "mock-3", url: img("photo-1525507119028-ed4c6297603e", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-6", offerId: "mock-3", minQuantity: 5, maxQuantity: 9, pricePerUnit: 32000 },
      { id: "pt-7", offerId: "mock-3", minQuantity: 10, maxQuantity: 24, pricePerUnit: 29000 },
      { id: "pt-8", offerId: "mock-3", minQuantity: 25, maxQuantity: null, pricePerUnit: 26000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-4",
    vendorId: "mock-vendor-1",
    title: "Premium Denim Trousers",
    slug: "premium-denim-trousers",
    description: "High-quality denim trousers in various fits. Perfect for casual wear or coordinated group outfits.",
    offerType: "fyb_campus",
    subcategory: "denim",
    originalPrice: 18000,
    offerPrice: 14000,
    discountType: "percentage",
    discountValue: 22,
    minQuantity: 1,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (28-40), Fit (Slim, Regular, Relaxed)",
      colors: "Blue, Black, Grey"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Group orders eligible for discount.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["denim", "jeans", "trousers"],
    images: [
      { id: "img-4", offerId: "mock-4", url: img("photo-1542272604-787c3835535d", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 3. Corporate Signing-Out Wear
  {
    id: "mock-5",
    vendorId: "mock-vendor-1",
    title: "Corporate Signing-Out Package",
    slug: "corporate-signing-out-package",
    description: "Complete formal wear package including shirt, trousers, and blazer. Perfect for corporate signing-out ceremonies.",
    offerType: "fyb_campus",
    subcategory: "corporate_wear",
    originalPrice: 75000,
    offerPrice: 55000,
    discountType: "percentage",
    discountValue: 27,
    minQuantity: 10,
    maxQuantity: 60,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Shirt Size, Trouser Size, Blazer Size, Color",
      colors: "Navy, Black, Charcoal, Grey"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Custom tailoring included. Production time: 3-4 weeks.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["corporate", "formal", "blazer", "signing-out"],
    images: [
      { id: "img-5", offerId: "mock-5", url: img("photo-1507003211169-0a1dd7228f2d", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-9", offerId: "mock-5", minQuantity: 10, maxQuantity: 19, pricePerUnit: 55000 },
      { id: "pt-10", offerId: "mock-5", minQuantity: 20, maxQuantity: 39, pricePerUnit: 50000 },
      { id: "pt-11", offerId: "mock-5", minQuantity: 40, maxQuantity: null, pricePerUnit: 45000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-6",
    vendorId: "mock-vendor-1",
    title: "Formal Corporate Shirts",
    slug: "formal-corporate-shirts",
    description: "Premium formal shirts with optional monogramming. Available in various colors and fits.",
    offerType: "fyb_campus",
    subcategory: "corporate_wear",
    originalPrice: 15000,
    offerPrice: 12000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 5,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (S-XXL), Fit (Slim, Regular), Monogramming",
      colors: "White, Light Blue, Pink, Lavender"
    },
    orderingMethod: "both",
    fulfilmentNotes: "Ready stock available. Monogramming adds 3-5 days.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["corporate", "shirts", "formal"],
    images: [
      { id: "img-6", offerId: "mock-6", url: img("photo-1596755094514-f87e34085b2c", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-12", offerId: "mock-6", minQuantity: 5, maxQuantity: 14, pricePerUnit: 12000 },
      { id: "pt-13", offerId: "mock-6", minQuantity: 15, maxQuantity: null, pricePerUnit: 10500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 4. Signing-Out Sneakers
  {
    id: "mock-7",
    vendorId: "mock-vendor-1",
    title: "Signing-Out Sneakers Collection",
    slug: "signing-out-sneakers-collection",
    description: "Stylish sneakers perfect for signing-out events and daily wear. Multiple styles available.",
    offerType: "fyb_campus",
    subcategory: "sneakers",
    originalPrice: 35000,
    offerPrice: 28000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 1,
    maxQuantity: 50,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (EU 38-45), Style (High-top, Low-top)",
      colors: "White, Black, Red, Blue"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available for common sizes. Custom colors require 2 weeks.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["sneakers", "shoes", "casual"],
    images: [
      { id: "img-7", offerId: "mock-7", url: img("photo-1542291026-7eec264c27ff", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-8",
    vendorId: "mock-vendor-1",
    title: "Custom Group Sneakers",
    slug: "custom-group-sneakers",
    description: "Custom-designed sneakers for group orders. Add your department logo or class colors.",
    offerType: "fyb_campus",
    subcategory: "sneakers",
    originalPrice: 40000,
    offerPrice: 32000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 15,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (EU 38-45), Custom Colors, Logo Printing",
      colors: "Custom colors available"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Production time: 3-4 weeks. Design consultation included.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["sneakers", "custom", "group"],
    images: [
      { id: "img-8", offerId: "mock-8", url: img("photo-1608231387042-66d1773070a5", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-14", offerId: "mock-8", minQuantity: 15, maxQuantity: 29, pricePerUnit: 32000 },
      { id: "pt-15", offerId: "mock-8", minQuantity: 30, maxQuantity: null, pricePerUnit: 28000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 5. FYB & Department Shirts
  {
    id: "mock-9",
    vendorId: "mock-vendor-1",
    title: "Class of 2026 Round-Neck Shirts",
    slug: "class-2026-round-neck-shirts",
    description: "Comfortable round-neck shirts with 'Class of 2026' printing. Available in various colors.",
    offerType: "fyb_campus",
    subcategory: "shirts",
    originalPrice: 8000,
    offerPrice: 6000,
    discountType: "percentage",
    discountValue: 25,
    minQuantity: 10,
    maxQuantity: 200,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (S-XXL), Name Printing, Color",
      colors: "White, Black, Navy, Maroon, Grey"
    },
    orderingMethod: "both",
    fulfilmentNotes: "Ready stock available. Name printing adds 2-3 days.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["shirts", "round-neck", "class-2026"],
    images: [
      { id: "img-9", offerId: "mock-9", url: img("photo-1521572163470-3c893b0d8111", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-16", offerId: "mock-9", minQuantity: 10, maxQuantity: 24, pricePerUnit: 6000 },
      { id: "pt-17", offerId: "mock-9", minQuantity: 25, maxQuantity: 49, pricePerUnit: 5500 },
      { id: "pt-18", offerId: "mock-9", minQuantity: 50, maxQuantity: null, pricePerUnit: 5000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-10",
    vendorId: "mock-vendor-1",
    title: "Custom Department Polos",
    slug: "custom-department-polos",
    description: "Premium polo shirts with department logo and name. Professional yet comfortable.",
    offerType: "fyb_campus",
    subcategory: "shirts",
    originalPrice: 12000,
    offerPrice: 9500,
    discountType: "percentage",
    discountValue: 21,
    minQuantity: 15,
    maxQuantity: 150,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      university: "Available for all departments",
      department: "Department name and logo",
      options: "Size (S-XXL), Name, Color",
      colors: "Navy, Black, White, Maroon, Royal Blue"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Production time: 1-2 weeks. Logo embroidery included.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["shirts", "polo", "department", "custom"],
    images: [
      { id: "img-10", offerId: "mock-10", url: img("photo-1625910513443-5b61a526e0e5", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-19", offerId: "mock-10", minQuantity: 15, maxQuantity: 29, pricePerUnit: 9500 },
      { id: "pt-20", offerId: "mock-10", minQuantity: 30, maxQuantity: 59, pricePerUnit: 8500 },
      { id: "pt-21", offerId: "mock-10", minQuantity: 60, maxQuantity: null, pricePerUnit: 7500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 6. Matching Streetwear Packages
  {
    id: "mock-11",
    vendorId: "mock-vendor-1",
    title: "Streetwear Group Package",
    slug: "streetwear-group-package",
    description: "Coordinated streetwear package including graphic tee, oversized shirt, and cargo trousers.",
    offerType: "fyb_campus",
    subcategory: "streetwear",
    originalPrice: 35000,
    offerPrice: 28000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 8,
    maxQuantity: 80,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (S-XXL), Color Coordination",
      colors: "Black, Beige, Olive, Grey"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Mix and match available. Production time: 2 weeks.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["streetwear", "oversized", "cargo", "graphic"],
    images: [
      { id: "img-11", offerId: "mock-11", url: img("photo-1515886657613-9f3515b0c78f", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-22", offerId: "mock-11", minQuantity: 8, maxQuantity: 19, pricePerUnit: 28000 },
      { id: "pt-23", offerId: "mock-11", minQuantity: 20, maxQuantity: 39, pricePerUnit: 25000 },
      { id: "pt-24", offerId: "mock-11", minQuantity: 40, maxQuantity: null, pricePerUnit: 22000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-12",
    vendorId: "mock-vendor-1",
    title: "Graphic T-Shirts - Bulk Order",
    slug: "graphic-t-shirts-bulk-order",
    description: "Custom graphic t-shirts for group events. High-quality prints on comfortable fabric.",
    offerType: "fyb_campus",
    subcategory: "streetwear",
    originalPrice: 7000,
    offerPrice: 5500,
    discountType: "percentage",
    discountValue: 21,
    minQuantity: 20,
    maxQuantity: 200,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size (S-XXL), Custom Design, Color",
      colors: "White, Black, Grey, Navy"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Design consultation included. Production time: 1-2 weeks.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["streetwear", "t-shirt", "graphic", "custom"],
    images: [
      { id: "img-12", offerId: "mock-12", url: img("photo-1576566588028-4147f3842f27", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-25", offerId: "mock-12", minQuantity: 20, maxQuantity: 49, pricePerUnit: 5500 },
      { id: "pt-26", offerId: "mock-12", minQuantity: 50, maxQuantity: 99, pricePerUnit: 5000 },
      { id: "pt-27", offerId: "mock-12", minQuantity: 100, maxQuantity: null, pricePerUnit: 4500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 7. Signing-Out Accessories
  {
    id: "mock-13",
    vendorId: "mock-vendor-1",
    title: "Signing-Out Accessories Bundle",
    slug: "signing-out-accessories-bundle",
    description: "Complete accessories bundle including sunglasses, cap, and wristband. Perfect for signing-out photos.",
    offerType: "fyb_campus",
    subcategory: "accessories",
    originalPrice: 12000,
    offerPrice: 9000,
    discountType: "percentage",
    discountValue: 25,
    minQuantity: 1,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Color, Custom Engraving",
      colors: "Black, White, Navy, Maroon"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Custom engraving adds 3-5 days.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["accessories", "sunglasses", "cap", "bundle"],
    images: [
      { id: "img-13", offerId: "mock-13", url: img("photo-1523275335688-37898b6baf30", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-14",
    vendorId: "mock-vendor-1",
    title: "Custom Group Caps",
    slug: "custom-group-caps",
    description: "Custom embroidered caps for group orders. Add your department or class logo.",
    offerType: "fyb_campus",
    subcategory: "accessories",
    originalPrice: 5000,
    offerPrice: 4000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 20,
    maxQuantity: 200,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Color, Logo Embroidery, Text",
      colors: "Navy, Black, White, Maroon, Grey"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Production time: 1 week. Logo design assistance available.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["accessories", "cap", "custom", "embroidered"],
    images: [
      { id: "img-14", offerId: "mock-14", url: img("photo-1588850578493-24b5ec129946", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-28", offerId: "mock-14", minQuantity: 20, maxQuantity: 49, pricePerUnit: 4000 },
      { id: "pt-29", offerId: "mock-14", minQuantity: 50, maxQuantity: null, pricePerUnit: 3500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // 8. Complete FYB Signing-Out Packages
  {
    id: "mock-15",
    vendorId: "mock-vendor-1",
    title: "Complete FYB Package - Premium",
    slug: "complete-fyb-package-premium",
    description: "Full signing-out package: varsity jacket, formal shirt, trousers, sneakers, and accessories bundle. Everything you need for the perfect signing-out.",
    offerType: "fyb_campus",
    subcategory: "packages",
    originalPrice: 150000,
    offerPrice: 110000,
    discountType: "percentage",
    discountValue: 27,
    minQuantity: 5,
    maxQuantity: 30,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Full customization of all items, Size coordination, Color theme",
      colors: "Custom color themes available"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Complete package customization. Production time: 4-5 weeks. Personal styling consultation included.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["package", "complete", "premium", "signing-out"],
    images: [
      { id: "img-15", offerId: "mock-15", url: img("photo-1617137968427-85924c800a22", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-30", offerId: "mock-15", minQuantity: 5, maxQuantity: 9, pricePerUnit: 110000 },
      { id: "pt-31", offerId: "mock-15", minQuantity: 10, maxQuantity: 19, pricePerUnit: 100000 },
      { id: "pt-32", offerId: "mock-15", minQuantity: 20, maxQuantity: null, pricePerUnit: 90000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "mock-16",
    vendorId: "mock-vendor-1",
    title: "FYB Essentials Package",
    slug: "fyb-essentials-package",
    description: "Essential signing-out package: round-neck shirt, denim trousers, and sneakers. Great value for group orders.",
    offerType: "fyb_campus",
    subcategory: "packages",
    originalPrice: 65000,
    offerPrice: 48000,
    discountType: "percentage",
    discountValue: 26,
    minQuantity: 8,
    maxQuantity: 60,
    startDate: "2026-01-01",
    expiryDate: "2026-12-31",
    customizationInfo: {
      options: "Size coordination, Color selection, Name printing",
      colors: "Multiple color combinations"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Production time: 2-3 weeks. Mix and match options available.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["package", "essentials", "value", "signing-out"],
    images: [
      { id: "img-16", offerId: "mock-16", url: img("photo-1487222477894-8943e31ef7b2", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "pt-33", offerId: "mock-16", minQuantity: 8, maxQuantity: 19, pricePerUnit: 48000 },
      { id: "pt-34", offerId: "mock-16", minQuantity: 20, maxQuantity: 39, pricePerUnit: 43000 },
      { id: "pt-35", offerId: "mock-16", minQuantity: 40, maxQuantity: null, pricePerUnit: 38000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

// ─── Mock Data for Wholesale Deals ─────────────────────────────────────────────

const MOCK_WHOLESALE_OFFERS: Offer[] = [
  // Bulk T-Shirts
  {
    id: "wholesale-1",
    vendorId: "mock-vendor-1",
    title: "Bulk Plain T-Shirts",
    slug: "bulk-plain-t-shirts",
    description: "High-quality plain cotton t-shirts available in multiple colors. Perfect for resellers, events, and bulk orders.",
    offerType: "wholesale",
    originalPrice: 8000,
    offerPrice: 6500,
    discountType: "percentage",
    discountValue: 19,
    minQuantity: 1,
    maxQuantity: 500,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (S-XXL), Color",
      colors: "White, Black, Navy, Grey, Red, Blue"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Bulk orders receive tiered pricing.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["t-shirts", "bulk", "plain", "wholesale"],
    images: [
      { id: "wh-img-1", offerId: "wholesale-1", url: img("photo-1521572163470-3c893b0d8111", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-1", offerId: "wholesale-1", minQuantity: 1, maxQuantity: 9, pricePerUnit: 8000 },
      { id: "wh-pt-2", offerId: "wholesale-1", minQuantity: 10, maxQuantity: 19, pricePerUnit: 7000 },
      { id: "wh-pt-3", offerId: "wholesale-1", minQuantity: 20, maxQuantity: 49, pricePerUnit: 6500 },
      { id: "wh-pt-4", offerId: "wholesale-1", minQuantity: 50, maxQuantity: null, pricePerUnit: 5500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "wholesale-2",
    vendorId: "mock-vendor-1",
    title: "Printed T-Shirts Bulk Order",
    slug: "printed-t-shirts-bulk-order",
    description: "Custom printed t-shirts for events, brands, and promotions. High-quality prints on comfortable cotton fabric.",
    offerType: "wholesale",
    originalPrice: 10000,
    offerPrice: 8500,
    discountType: "percentage",
    discountValue: 15,
   minQuantity: 20,
    maxQuantity: 300,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (S-XXL), Custom Design, Color",
      colors: "White, Black, Grey, Navy"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Design consultation included. Production time: 1-2 weeks.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["t-shirts", "printed", "custom", "bulk"],
    images: [
      { id: "wh-img-2", offerId: "wholesale-2", url: img("photo-1576566588028-4147f3842f27", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-5", offerId: "wholesale-2", minQuantity: 20, maxQuantity: 49, pricePerUnit: 8500 },
      { id: "wh-pt-6", offerId: "wholesale-2", minQuantity: 50, maxQuantity: 99, pricePerUnit: 7500 },
      { id: "wh-pt-7", offerId: "wholesale-2", minQuantity: 100, maxQuantity: null, pricePerUnit: 6500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Wholesale Polo Shirts
  {
    id: "wholesale-3",
    vendorId: "mock-vendor-1",
    title: "Wholesale Polo Shirts",
    slug: "wholesale-polo-shirts",
    description: "Premium polo shirts for resellers, boutiques, and campus vendors. Available in various colors and sizes.",
    offerType: "wholesale",
    originalPrice: 12000,
    offerPrice: 9500,
    discountType: "percentage",
    discountValue: 21,
    minQuantity: 15,
    maxQuantity: 200,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (S-XXL), Color, Embroidery",
      colors: "Navy, Black, White, Maroon, Royal Blue, Grey"
    },
    orderingMethod: "both",
    fulfilmentNotes: "Ready stock available. Logo embroidery available at extra cost.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["polos", "wholesale", "reseller"],
    images: [
      { id: "wh-img-3", offerId: "wholesale-3", url: img("photo-1625910513443-5b61a526e0e5", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-8", offerId: "wholesale-3", minQuantity: 15, maxQuantity: 29, pricePerUnit: 9500 },
      { id: "wh-pt-9", offerId: "wholesale-3", minQuantity: 30, maxQuantity: 59, pricePerUnit: 8500 },
      { id: "wh-pt-10", offerId: "wholesale-3", minQuantity: 60, maxQuantity: null, pricePerUnit: 7500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Bulk Jeans and Trousers
  {
    id: "wholesale-4",
    vendorId: "mock-vendor-1",
    title: "Bulk Denim Jeans",
    slug: "bulk-denim-jeans",
    description: "High-quality denim jeans in various fits and washes. Perfect for boutiques and resellers.",
    offerType: "wholesale",
    originalPrice: 18000,
    offerPrice: 14000,
    discountType: "percentage",
    discountValue: 22,
    minQuantity: 10,
    maxQuantity: 200,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (28-40), Fit (Slim, Regular, Relaxed), Wash",
      colors: "Blue, Black, Grey"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Mixed sizes and washes allowed.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["jeans", "denim", "bulk", "wholesale"],
    images: [
      { id: "wh-img-4", offerId: "wholesale-4", url: img("photo-1542272604-787c3835535d", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-11", offerId: "wholesale-4", minQuantity: 10, maxQuantity: 24, pricePerUnit: 14000 },
      { id: "wh-pt-12", offerId: "wholesale-4", minQuantity: 25, maxQuantity: 49, pricePerUnit: 13000 },
      { id: "wh-pt-13", offerId: "wholesale-4", minQuantity: 50, maxQuantity: null, pricePerUnit: 11500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "wholesale-5",
    vendorId: "mock-vendor-1",
    title: "Casual Trousers Bulk",
    slug: "casual-trousers-bulk",
    description: "Comfortable casual trousers for everyday wear. Available in chinos, cargos, and relaxed fits.",
    offerType: "wholesale",
    originalPrice: 15000,
    offerPrice: 12000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 15,
    maxQuantity: 150,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (28-40), Style",
      colors: "Beige, Khaki, Black, Navy, Olive"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Group orders eligible for discount.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["trousers", "casual", "bulk"],
    images: [
      { id: "wh-img-5", offerId: "wholesale-5", url: img("photo-1473966968600-fa801b869a1f", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-14", offerId: "wholesale-5", minQuantity: 15, maxQuantity: 29, pricePerUnit: 12000 },
      { id: "wh-pt-15", offerId: "wholesale-5", minQuantity: 30, maxQuantity: null, pricePerUnit: 10500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Wholesale Sneakers
  {
    id: "wholesale-6",
    vendorId: "mock-vendor-1",
    title: "Wholesale Sneakers",
    slug: "wholesale-sneakers",
    description: "Selected sneaker styles available at bulk-buying prices. Popular styles for resale.",
    offerType: "wholesale",
    originalPrice: 35000,
    offerPrice: 28000,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 5,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (EU 38-45), Style",
      colors: "White, Black, Red, Blue, Multi"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available for popular sizes. Custom orders take 2 weeks.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["sneakers", "wholesale", "bulk"],
    images: [
      { id: "wh-img-6", offerId: "wholesale-6", url: img("photo-1542291026-7eec264c27ff", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-16", offerId: "wholesale-6", minQuantity: 5, maxQuantity: 9, pricePerUnit: 28000 },
      { id: "wh-pt-17", offerId: "wholesale-6", minQuantity: 10, maxQuantity: 24, pricePerUnit: 26000 },
      { id: "wh-pt-18", offerId: "wholesale-6", minQuantity: 25, maxQuantity: null, pricePerUnit: 23000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Wholesale Shirts
  {
    id: "wholesale-7",
    vendorId: "mock-vendor-1",
    title: "Men's Casual Shirts Bulk",
    slug: "mens-casual-shirts-bulk",
    description: "Men's casual shirts offered at discounted bulk rates. Perfect for boutiques and resellers.",
    offerType: "wholesale",
    originalPrice: 18000,
    offerPrice: 14000,
    discountType: "percentage",
    discountValue: 22,
    minQuantity: 10,
    maxQuantity: 150,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (S-XXL), Style, Color",
      colors: "White, Blue, Pink, Striped, Checked"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Mixed styles allowed.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["shirts", "mens", "casual", "bulk"],
    images: [
      { id: "wh-img-7", offerId: "wholesale-7", url: img("photo-1596755094514-f87e34085b2c", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-19", offerId: "wholesale-7", minQuantity: 10, maxQuantity: 24, pricePerUnit: 14000 },
      { id: "wh-pt-20", offerId: "wholesale-7", minQuantity: 25, maxQuantity: 49, pricePerUnit: 13000 },
      { id: "wh-pt-21", offerId: "wholesale-7", minQuantity: 50, maxQuantity: null, pricePerUnit: 11500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "wholesale-8",
    vendorId: "mock-vendor-1",
    title: "Women's Blouses Bulk",
    slug: "womens-blouses-bulk",
    description: "Women's casual and formal blouses at wholesale prices. Various styles available.",
    offerType: "wholesale",
    originalPrice: 15000,
    offerPrice: 11500,
    discountType: "percentage",
    discountValue: 23,
    minQuantity: 10,
    maxQuantity: 150,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Size (S-XXL), Style, Color",
      colors: "White, Floral, Pastels, Solid"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Group orders eligible for discount.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["blouses", "womens", "bulk"],
    images: [
      { id: "wh-img-8", offerId: "wholesale-8", url: img("photo-1483985988355-763728e1935b", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-22", offerId: "wholesale-8", minQuantity: 10, maxQuantity: 24, pricePerUnit: 11500 },
      { id: "wh-pt-23", offerId: "wholesale-8", minQuantity: 25, maxQuantity: null, pricePerUnit: 10000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Fashion Accessories
  {
    id: "wholesale-9",
    vendorId: "mock-vendor-1",
    title: "Fashion Accessories Bundle",
    slug: "fashion-accessories-bundle",
    description: "Bags, caps, sunglasses, belts, and other accessories available in bulk. Mix and match available.",
    offerType: "wholesale",
    originalPrice: 8000,
    offerPrice: 6000,
    discountType: "percentage",
    discountValue: 25,
    minQuantity: 20,
    maxQuantity: 300,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Type, Color",
      colors: "Black, Brown, Beige, Multi"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Minimum 20 pieces per order.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["accessories", "bulk", "wholesale"],
    images: [
      { id: "wh-img-9", offerId: "wholesale-9", url: img("photo-1523275335688-37898b6baf30", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-24", offerId: "wholesale-9", minQuantity: 20, maxQuantity: 49, pricePerUnit: 6000 },
      { id: "wh-pt-25", offerId: "wholesale-9", minQuantity: 50, maxQuantity: 99, pricePerUnit: 5000 },
      { id: "wh-pt-26", offerId: "wholesale-9", minQuantity: 100, maxQuantity: null, pricePerUnit: 4500 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Boutique Starter Package
  {
    id: "wholesale-10",
    vendorId: "mock-vendor-1",
    title: "Boutique Starter Package",
    slug: "boutique-starter-package",
    description: "A bundle of selected fashion products intended for small resellers starting a clothing business. Includes t-shirts, polos, jeans, and accessories.",
    offerType: "wholesale",
    originalPrice: 200000,
    offerPrice: 150000,
    discountType: "percentage",
    discountValue: 25,
    minQuantity: 1,
    maxQuantity: 20,
    startDate: "2026-01-01",
    expiryDate: null,
    customizationInfo: {
      options: "Package Size, Product Mix",
      colors: "Assorted"
    },
    orderingMethod: "whatsapp",
    fulfilmentNotes: "Customizable package contents. Consultation included for first-time resellers.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["package", "starter", "boutique", "reseller"],
    images: [
      { id: "wh-img-10", offerId: "wholesale-10", url: img("photo-1441986300917-64674bd600d8", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "wh-pt-27", offerId: "wholesale-10", minQuantity: 1, maxQuantity: 4, pricePerUnit: 150000 },
      { id: "wh-pt-28", offerId: "wholesale-10", minQuantity: 5, maxQuantity: 9, pricePerUnit: 135000 },
      { id: "wh-pt-29", offerId: "wholesale-10", minQuantity: 10, maxQuantity: null, pricePerUnit: 120000 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

// ─── Mock Data for Special Promotions ───────────────────────────────────────────

const MOCK_PROMO_OFFERS: Offer[] = [
  // Two-Piece Outfit Deals
  {
    id: "promo-1",
    vendorId: "mock-vendor-1",
    title: "Two-Piece Outfit Deal - Top & Trousers",
    slug: "two-piece-outfit-deal",
    description: "Coordinated top and trousers sold together at a bundle price. Perfect for matching outfits.",
    offerType: "special_promo",
    originalPrice: 35000,
    offerPrice: 25000,
    discountType: "percentage",
    discountValue: 29,
    minQuantity: 1,
    maxQuantity: 50,
    startDate: "2026-01-01",
    expiryDate: "2026-03-31",
    customizationInfo: {
      options: "Size (S-XXL), Color",
      colors: "Black, Beige, Navy, Grey"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Limited stock available. While supplies last.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["outfit", "bundle", "two-piece"],
    images: [
      { id: "promo-img-1", offerId: "promo-1", url: img("photo-1515886657613-9f3515b0c78f", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Jeans and Top Combo
  {
    id: "promo-2",
    vendorId: "mock-vendor-1",
    title: "Jeans and Top Combo",
    slug: "jeans-and-top-combo",
    description: "Selected jeans paired with a matching top. Great value combo deal.",
    offerType: "special_promo",
    originalPrice: 30000,
    offerPrice: 22000,
    discountType: "percentage",
    discountValue: 27,
    minQuantity: 1,
    maxQuantity: 40,
    startDate: "2026-01-01",
    expiryDate: "2026-04-30",
    customizationInfo: {
      options: "Size (S-XXL), Wash, Top Style",
      colors: "Blue, Black, Grey"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Limited quantities.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["combo", "jeans", "top"],
    images: [
      { id: "promo-img-2", offerId: "promo-2", url: img("photo-1525507119028-ed4c6297603e", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Sneakers Promotion
  {
    id: "promo-3",
    vendorId: "mock-vendor-1",
    title: "Sneakers Flash Sale",
    slug: "sneakers-flash-sale",
    description: "Discounts on selected sneaker styles. Limited time offer.",
    offerType: "special_promo",
    originalPrice: 40000,
    offerPrice: 28000,
    discountType: "percentage",
    discountValue: 30,
    minQuantity: 1,
    maxQuantity: 30,
    startDate: "2026-01-01",
    expiryDate: "2026-02-28",
    customizationInfo: {
      options: "Size (EU 38-45), Style",
      colors: "White, Black, Red, Blue"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Limited stock per style. First come, first served.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["sneakers", "flash-sale", "promotion"],
    images: [
      { id: "promo-img-3", offerId: "promo-3", url: img("photo-1608231387042-66d1773070a5", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Handbag Bundle
  {
    id: "promo-4",
    vendorId: "mock-vendor-1",
    title: "Buy 2 Handbags Bundle",
    slug: "buy-2-handbags-bundle",
    description: "Special price for purchasing two selected handbags together. Mix and match available styles.",
    offerType: "special_promo",
    originalPrice: 45000,
    offerPrice: 32000,
    discountType: "percentage",
    discountValue: 29,
    minQuantity: 2,
    maxQuantity: 20,
    startDate: "2026-01-01",
    expiryDate: "2026-03-31",
    customizationInfo: {
      options: "Style 1, Style 2, Color",
      colors: "Black, Brown, Beige, Tan"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Must purchase 2 handbags. Can mix different styles.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["handbags", "bundle", "buy-2"],
    images: [
      { id: "promo-img-4", offerId: "promo-4", url: img("photo-1584917865447-65472b4b2e9e", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Buy More, Save More
  {
    id: "promo-5",
    vendorId: "mock-vendor-1",
    title: "Buy More Save More - Selected Items",
    slug: "buy-more-save-more",
    description: "Configurable discounts when customers purchase multiple eligible products. Buy 2 get 10% off, buy 3 get 15% off, buy 5+ get 20% off.",
    offerType: "special_promo",
    originalPrice: null,
    offerPrice: null,
    discountType: "percentage",
    discountValue: 20,
    minQuantity: 2,
    maxQuantity: 20,
    startDate: "2026-01-01",
    expiryDate: "2026-06-30",
    customizationInfo: {
      options: "Product Selection, Quantity",
      colors: "Various"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Discount applies automatically at checkout. Cannot be combined with other offers.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["promotion", "bulk-discount", "multi-buy"],
    images: [
      { id: "promo-img-5", offerId: "promo-5", url: img("photo-1441986300917-64674bd600d8", 600), displayOrder: 0 },
    ],
    pricingTiers: [
      { id: "promo-pt-1", offerId: "promo-5", minQuantity: 2, maxQuantity: 2, pricePerUnit: 0 },
      { id: "promo-pt-2", offerId: "promo-5", minQuantity: 3, maxQuantity: 4, pricePerUnit: 0 },
      { id: "promo-pt-3", offerId: "promo-5", minQuantity: 5, maxQuantity: null, pricePerUnit: 0 },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Clearance Sale
  {
    id: "promo-6",
    vendorId: "mock-vendor-1",
    title: "Clearance Sale - Up to 50% Off",
    slug: "clearance-sale",
    description: "Reduced prices on selected products with limited stock. Final clearance on previous season items.",
    offerType: "special_promo",
    originalPrice: 25000,
    offerPrice: 12500,
    discountType: "percentage",
    discountValue: 50,
    minQuantity: 1,
    maxQuantity: 100,
    startDate: "2026-01-01",
    expiryDate: "2026-02-28",
    customizationInfo: {
      options: "Size, Color",
      colors: "Various"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Limited stock. No returns or exchanges on clearance items.",
    status: "active",
    isFeatured: true,
    linkedProductIds: [],
    tags: ["clearance", "sale", "discount"],
    images: [
      { id: "promo-img-6", offerId: "promo-6", url: img("photo-1483985988355-763728e1935b", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Seasonal Fashion Promotion
  {
    id: "promo-7",
    vendorId: "mock-vendor-1",
    title: "Summer Collection Promo",
    slug: "summer-collection-promo",
    description: "A temporary promotion on our summer collection. Lightweight fabrics and bright colors.",
    offerType: "special_promo",
    originalPrice: 20000,
    offerPrice: 15000,
    discountType: "percentage",
    discountValue: 25,
    minQuantity: 1,
    maxQuantity: 80,
    startDate: "2026-01-01",
    expiryDate: "2026-04-30",
    customizationInfo: {
      options: "Size, Style, Color",
      colors: "Bright, Pastel, White"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "New season collection. Limited time offer.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["seasonal", "summer", "promotion"],
    images: [
      { id: "promo-img-7", offerId: "promo-7", url: img("photo-1515886657613-9f3515b0c78f", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },

  // Accessories Combo
  {
    id: "promo-8",
    vendorId: "mock-vendor-1",
    title: "Accessories Combo - Sunglasses & Cap",
    slug: "accessories-combo",
    description: "Bundled fashion accessories sold at a combined price. Sunglasses and cap set.",
    offerType: "special_promo",
    originalPrice: 12000,
    offerPrice: 8000,
    discountType: "percentage",
    discountValue: 33,
    minQuantity: 1,
    maxQuantity: 60,
    startDate: "2026-01-01",
    expiryDate: "2026-03-31",
    customizationInfo: {
      options: "Style, Color",
      colors: "Black, Brown, Beige, Navy"
    },
    orderingMethod: "checkout",
    fulfilmentNotes: "Ready stock available. Perfect gift set.",
    status: "active",
    isFeatured: false,
    linkedProductIds: [],
    tags: ["accessories", "combo", "bundle"],
    images: [
      { id: "promo-img-8", offerId: "promo-8", url: img("photo-1523275335688-37898b6baf30", 600), displayOrder: 0 },
    ],
    pricingTiers: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export function useOffers(filters?: {
  offerType?: OfferType;
  status?: OfferStatus;
  isFeatured?: boolean;
  vendorId?: string;
  subcategory?: FybSubcategory;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffers() {
      // Use mock data when Supabase is not configured or for testing
      if (!supabase) {
        setLoading(true);
        setError(null);

        let filtered = [...MOCK_FYB_OFFERS, ...MOCK_WHOLESALE_OFFERS, ...MOCK_PROMO_OFFERS];

        // Apply offer type filter
        if (filters?.offerType) {
          filtered = filtered.filter(o => o.offerType === filters.offerType);
        }

        // Apply subcategory filter (only for FYB)
        if (filters?.subcategory) {
          filtered = filtered.filter(o => o.subcategory === filters.subcategory);
        }

        // Apply status filter
        if (filters?.status) {
          filtered = filtered.filter(o => o.status === filters.status);
        }

        // Apply featured filter
        if (filters?.isFeatured) {
          filtered = filtered.filter(o => o.isFeatured);
        }

        setOffers(filtered);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("offers")
          .select(`
            *,
            offer_images (*),
            offer_pricing_tiers (*)
          `);

        // Apply filters
        if (filters?.offerType) {
          query = query.eq("offer_type", filters.offerType);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.isFeatured) {
          query = query.eq("is_featured", true);
        }
        if (filters?.vendorId) {
          query = query.eq("vendor_id", filters.vendorId);
        }

        // Only show active offers for public view (unless filtering by vendor)
        if (!filters?.vendorId) {
          query = query.eq("status", "active");
        }

        const { data, error: err } = await query
          .order("created_at", { ascending: false });

        if (err) throw err;

        const mapped = (data ?? []).map((row: any) => mapDbRow(row));
        setOffers(mapped);
      } catch (err: unknown) {
        // Fall back to mock data on error (e.g., 401 Unauthorized, RLS issues)
        console.warn("Supabase fetch failed, falling back to mock data:", err);
        setLoading(true);
        setError(null);

        let filtered = [...MOCK_FYB_OFFERS, ...MOCK_WHOLESALE_OFFERS, ...MOCK_PROMO_OFFERS];

        // Apply offer type filter
        if (filters?.offerType) {
          filtered = filtered.filter(o => o.offerType === filters.offerType);
        }

        // Apply subcategory filter (only for FYB)
        if (filters?.subcategory) {
          filtered = filtered.filter(o => o.subcategory === filters.subcategory);
        }

        // Apply status filter
        if (filters?.status) {
          filtered = filtered.filter(o => o.status === filters.status);
        }

        // Apply featured filter
        if (filters?.isFeatured) {
          filtered = filtered.filter(o => o.isFeatured);
        }

        setOffers(filtered);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, [filters?.offerType, filters?.status, filters?.isFeatured, filters?.vendorId, filters?.subcategory]);

  return { offers, loading, error };
}

export function useOfferBySlug(slug: string) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffer() {
      if (!supabase || !slug) {
        setLoading(false);
        // Try to find in mock data
        const mockOffer = [...MOCK_FYB_OFFERS, ...MOCK_WHOLESALE_OFFERS, ...MOCK_PROMO_OFFERS].find(o => o.slug === slug);
        if (mockOffer) {
          setOffer(mockOffer);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from("offers")
          .select(`
            *,
            offer_images (*),
            offer_pricing_tiers (*)
          `)
          .eq("slug", slug)
          .eq("status", "active")
          .single();

        if (err) throw err;

        if (data) {
          setOffer(mapDbRow(data));
        } else {
          setOffer(null);
        }
      } catch (err: unknown) {
        // Fall back to mock data on error
        console.warn("Supabase fetch failed, falling back to mock data:", err);
        const mockOffer = [...MOCK_FYB_OFFERS, ...MOCK_WHOLESALE_OFFERS, ...MOCK_PROMO_OFFERS].find(o => o.slug === slug);
        if (mockOffer) {
          setOffer(mockOffer);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load offer");
          setOffer(null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOffer();
  }, [slug]);

  return { offer, loading, error };
}

export function useFeaturedOffers(limit = 6) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      if (!supabase) {
        setLoading(true);
        setError(null);

        // Get featured offers from all mock data
        const allFeatured = [...MOCK_FYB_OFFERS, ...MOCK_WHOLESALE_OFFERS, ...MOCK_PROMO_OFFERS]
          .filter(o => o.isFeatured && o.status === "active")
          .slice(0, limit);

        setOffers(allFeatured);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
          .from("offers")
          .select(`
            *,
            offer_images (*),
            offer_pricing_tiers (*)
          `)
          .eq("is_featured", true)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (err) throw err;

        const mapped = (data ?? []).map((row: any) => mapDbRow(row));
        setOffers(mapped);
      } catch (err: unknown) {
        // Fall back to mock data on error
        console.warn("Supabase fetch failed, falling back to mock data:", err);
        setLoading(true);
        setError(null);

        const allFeatured = [...MOCK_FYB_OFFERS, ...MOCK_WHOLESALE_OFFERS, ...MOCK_PROMO_OFFERS]
          .filter(o => o.isFeatured && o.status === "active")
          .slice(0, limit);

        setOffers(allFeatured);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, [limit]);

  return { offers, loading, error };
}

function mapDbRow(row: any): Offer {
  const images = (row.offer_images ?? []).map((img: any) => ({
    id: img.id,
    offerId: img.offer_id,
    url: img.url,
    displayOrder: img.display_order,
  }));

  const pricingTiers = (row.offer_pricing_tiers ?? []).map((tier: any) => ({
    id: tier.id,
    offerId: tier.offer_id,
    minQuantity: tier.min_quantity,
    maxQuantity: tier.max_quantity,
    pricePerUnit: tier.price_per_unit,
  }));

  return {
    id: row.id,
    vendorId: row.vendor_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    offerType: row.offer_type,
    originalPrice: row.original_price,
    offerPrice: row.offer_price,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    minQuantity: row.min_quantity,
    maxQuantity: row.max_quantity,
    startDate: row.start_date,
    expiryDate: row.expiry_date,
    customizationInfo: row.customization_info || {},
    orderingMethod: row.ordering_method,
    fulfilmentNotes: row.fulfilment_notes,
    status: row.status,
    isFeatured: row.is_featured,
    linkedProductIds: row.linked_product_ids || [],
    tags: row.tags || [],
    images,
    pricingTiers,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
