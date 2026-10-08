import { useEffect, useState } from "react";
import { Package, MapPin, Heart, ShoppingBag } from "lucide-react";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import OverviewCard from "../components/dashboard/OverviewCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import RecommendedProducts from "../components/dashboard/RecommendedProducts";
import type { Product } from "../types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabase";
import type { Order } from "../components/dashboard/OrderItem";

const RECOMMENDATIONS: Product[] = [
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
  const { profile, user } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const customerName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    if (!supabase || !user) return;
    const fetchOrders = async () => {
      const { data, error } = await supabase!
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          order_items(count)
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mappedOrders: Order[] = data.map((row: any) => ({
          id: row.id,
          order_number: row.order_number,
          date: new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          products: Array.isArray(row.order_items) ? (row.order_items[0] as any)?.count ?? 0 : 0,
          total: row.total,
          status: row.status,
        }));
        setOrders(mappedOrders);
      }
    };

    fetchOrders();
  }, [user]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ["pending", "processing", "confirmed"].includes(o.status)).length;
  
  return (
    <>
      <WelcomeSection customerName={customerName} />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          icon={Package} 
          to="/account/orders" 
        />
        <OverviewCard 
          title="Pending Orders" 
          value={pendingOrders.toString()} 
          icon={MapPin} 
          to="/account/orders" 
        />
        <OverviewCard 
          title="Wishlist Items" 
          value={wishlistCount.toString()} 
          icon={Heart} 
          to="/wishlist" 
        />
        <OverviewCard 
          title="Cart Items" 
          value={itemCount.toString()} 
          icon={ShoppingBag} 
          to="/cart" 
        />
      </div>

      <RecentOrders orders={orders.slice(0, 5)} />
      
      <RecommendedProducts products={RECOMMENDATIONS} />
    </>
  );
}
