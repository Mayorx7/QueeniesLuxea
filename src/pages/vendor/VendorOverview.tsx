import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import VendorWelcome from "../../components/vendor/VendorWelcome";
import VendorStatCard from "../../components/vendor/VendorStatCard";
import VendorSalesOverview from "../../components/vendor/VendorSalesOverview";
import VendorRecentOrders from "../../components/vendor/VendorRecentOrders";
import VendorProductOverview from "../../components/vendor/VendorProductOverview";
import VendorInventoryAlert from "../../components/vendor/VendorInventoryAlert";
import VendorTopProducts from "../../components/vendor/VendorTopProducts";
import VendorEarningsCard from "../../components/vendor/VendorEarningsCard";

export default function VendorOverview() {
  return (
    <div className="space-y-8 pb-10">
      <VendorWelcome vendorName="Sarah Jenkins" />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <VendorStatCard 
          title="Total Sales" 
          value="₦1,250,000" 
          change="+12.5%" 
          isPositive={true} 
          icon={TrendingUp} 
        />
        <VendorStatCard 
          title="Total Orders" 
          value="184" 
          change="+5.2%" 
          isPositive={true} 
          icon={ShoppingBag} 
        />
        <VendorStatCard 
          title="Total Products" 
          value="42" 
          icon={Package} 
        />
        <VendorStatCard 
          title="Total Earnings" 
          value="₦2,850,000" 
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
          <VendorRecentOrders />
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
