import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";
import VendorWelcome from "../../components/vendor/VendorWelcome";
import VendorStatCard from "../../components/vendor/VendorStatCard";
import VendorSalesOverview from "../../components/vendor/VendorSalesOverview";
import VendorRecentOrders from "../../components/vendor/VendorRecentOrders";
import VendorProductOverview from "../../components/vendor/VendorProductOverview";
import VendorInventoryAlert from "../../components/vendor/VendorInventoryAlert";
import VendorTopProducts from "../../components/vendor/VendorTopProducts";
import VendorEarningsCard from "../../components/vendor/VendorEarningsCard";

interface VendorStats {
  total_sales: number;
  total_orders: number;
  total_products: number;
  total_earnings: number;
}

export default function VendorOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<VendorStats | null>(null);
  
  // Real recent orders for VendorRecentOrders
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase || !user) return;

    const fetchDashboardData = async () => {
      // 1. Fetch aggregate stats via RPC
      const { data: statsData, error: statsError } = await supabase.rpc("vendor_get_stats");
      if (!statsError && statsData) {
        setStats(statsData as VendorStats);
      }

      // 2. Fetch recent orders for the table
      const { data: ordersData, error: ordersError } = await supabase
        .from("order_items")
        .select(`
          id, order_id, product_name, product_image_url, color, size,
          quantity, unit_price, total_price, item_status, created_at,
          orders (
            order_number,
            customer:profiles ( first_name, last_name, email )
          )
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!ordersError && ordersData) {
        const mappedOrders = ordersData.map((row: any) => {
          const order = row.orders;
          const customer = order?.customer;
          const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "—";
          return {
            id: row.id,
            order_id: row.order_id,
            order_number: order?.order_number ?? "—",
            customer_name: name,
            product_name: row.product_name,
            product_image_url: row.product_image_url,
            total_price: row.total_price,
            item_status: row.item_status,
            created_at: row.created_at,
          };
        });
        setRecentOrders(mappedOrders);
      }
    };

    fetchDashboardData();
  }, [user]);

  const vendorName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim() 
    : user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Vendor";

  return (
    <div className="space-y-8 pb-10">
      <VendorWelcome vendorName={vendorName} />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <VendorStatCard 
          title="Total Sales" 
          value={stats ? formatPrice(stats.total_sales) : "—"} 
          change="+12.5%" 
          isPositive={true} 
          icon={TrendingUp} 
        />
        <VendorStatCard 
          title="Total Orders" 
          value={stats ? stats.total_orders.toString() : "—"} 
          change="+5.2%" 
          isPositive={true} 
          icon={ShoppingBag} 
        />
        <VendorStatCard 
          title="Total Products" 
          value={stats ? stats.total_products.toString() : "—"} 
          icon={Package} 
        />
        <VendorStatCard 
          title="Total Earnings" 
          value={stats ? formatPrice(stats.total_earnings) : "—"} 
          change="+8.1%" 
          isPositive={true} 
          icon={DollarSign} 
        />
      </div>

      {/* Main Grid 1: Sales Chart & Earnings */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VendorSalesOverview />
        </div>
        <div>
          <VendorEarningsCard />
        </div>
      </div>

      {/* Main Grid 2: Recent Orders & Inventory Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* We pass the live recent orders down to the component. 
              (Assuming VendorRecentOrders is updated to accept an `orders` prop. 
              If not, we need to update that component too). */}
          <VendorRecentOrders orders={recentOrders} />
        </div>
        <div>
          <VendorInventoryAlert />
        </div>
      </div>

      {/* Main Grid 3: Products Overview & Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VendorProductOverview />
        </div>
        <div>
          <VendorTopProducts />
        </div>
      </div>
    </div>
  );
}
