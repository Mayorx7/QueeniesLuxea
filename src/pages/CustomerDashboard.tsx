import { Package, MapPin, Heart, ShoppingBag } from "lucide-react";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import OverviewCard from "../components/dashboard/OverviewCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import RecommendedProducts from "../components/dashboard/RecommendedProducts";
import type { Order } from "../components/dashboard/OrderItem";
import type { Product } from "../types";

// Mock Data
const MOCK_ORDERS: Order[] = [
  {
    id: "QL-4829",
    date: "Mar 1, 2024",
    products: 3,
    total: 345.0,
    status: "Processing"
  },
  {
    id: "QL-4752",
    date: "Feb 15, 2024",
    products: 1,
    total: 120.5,
    status: "Delivered"
  },
  {
    id: "QL-4610",
    date: "Jan 28, 2024",
    products: 2,
    total: 215.0,
    status: "Delivered"
  }
];

const MOCK_RECOMMENDATIONS: Product[] = [
  {
    id: "p1",
    name: "Silk Evening Gown",
    slug: "silk-evening-gown",
    price: 295.0,
    category: "Dresses",
    images: ["https://images.unsplash.com/photo-1566160983935-8659b85c884d?q=80&w=2574&auto=format&fit=crop"],
    colors: ["Black", "Emerald"],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    isNew: true,
    isFeatured: false,
    description: "Elegant silk gown.",
    details: ["100% Silk", "Dry clean only"],
    rating: 5,
    reviewCount: 12,
    tags: []
  },
  {
    id: "p2",
    name: "Cashmere Turtleneck",
    slug: "cashmere-turtleneck",
    price: 185.0,
    category: "Tops",
    images: ["https://images.unsplash.com/photo-1624623278313-a930126a11c3?q=80&w=2574&auto=format&fit=crop"],
    colors: ["Cream", "Charcoal"],
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    isNew: false,
    isFeatured: true,
    description: "Soft cashmere sweater.",
    details: ["100% Cashmere", "Hand wash cold"],
    rating: 4.8,
    reviewCount: 45,
    tags: []
  },
  {
    id: "p3",
    name: "Tailored Wool Blazer",
    slug: "tailored-wool-blazer",
    price: 320.0,
    category: "Tops",
    images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=2574&auto=format&fit=crop"],
    colors: ["Navy", "Camel"],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    isNew: false,
    isFeatured: false,
    description: "Classic wool blazer.",
    details: ["100% Wool", "Dry clean only"],
    rating: 4.9,
    reviewCount: 32,
    tags: []
  },
  {
    id: "p4",
    name: "Pleated Midi Skirt",
    slug: "pleated-midi-skirt",
    price: 145.0,
    category: "Dresses",
    images: ["https://images.unsplash.com/photo-1583391733958-650fac5ceb1c?q=80&w=2574&auto=format&fit=crop"],
    colors: ["Blush", "Olive"],
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    isNew: true,
    isFeatured: false,
    description: "Flowy pleated skirt.",
    details: ["100% Polyester", "Machine wash cold"],
    rating: 4.7,
    reviewCount: 18,
    tags: []
  }
];

export default function CustomerDashboard() {
  return (
    <>
      <WelcomeSection customerName="Alexandra" />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard 
          title="Total Orders" 
          value="12" 
          icon={Package} 
          to="/account/orders" 
        />
        <OverviewCard 
          title="Pending Orders" 
          value="1" 
          icon={MapPin} 
          to="/account/orders" 
        />
        <OverviewCard 
          title="Wishlist Items" 
          value="8" 
          icon={Heart} 
          to="/wishlist" 
        />
        <OverviewCard 
          title="Cart Items" 
          value="3" 
          icon={ShoppingBag} 
          to="/cart" 
        />
      </div>

      <RecentOrders orders={MOCK_ORDERS} />
      
      <RecommendedProducts products={MOCK_RECOMMENDATIONS} />
    </>
  );
}
