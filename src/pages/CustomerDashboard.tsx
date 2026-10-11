import { useEffect, useState } from "react";
import { Package, MapPin, Heart, ShoppingBag } from "lucide-react";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import OverviewCard from "../components/dashboard/OverviewCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabase";
import type { Order } from "../components/dashboard/OrderItem";

export default function CustomerDashboard() {
  const { profile, user } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const customerName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0];

  useEffect(() => {
    if (!supabase || !user) return;

    // Fetch orders
    const fetchOrders = async () => {
      const { data, error } = await supabase!
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          currency,
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
          currency: row.currency,
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

    </>
  );
}
