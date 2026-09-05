import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import VendorSidebar from "../components/vendor/VendorSidebar";
import VendorHeader from "../components/vendor/VendorHeader";
import VendorBottomNav from "../components/vendor/VendorBottomNav";

export default function VendorDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/vendor") return "Vendor Dashboard";
    if (path.includes("/products/add")) return "Add Product";
    if (path.includes("/products")) return "Products";
    if (path.includes("/orders")) return "Orders";
    if (path.includes("/customers")) return "Customers";
    if (path.includes("/inventory")) return "Inventory";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/earnings")) return "Earnings";
    if (path.includes("/settings")) return "Store Settings";
    if (path.includes("/profile")) return "Profile";
    return "Vendor Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-cream/20">
      <VendorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <VendorHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          title={getPageTitle()}
        />

        {/* pb-20 keeps content above the fixed bottom nav on mobile */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          <div className="mx-auto max-w-7xl fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Fixed bottom nav — mobile/tablet only (lg:hidden inside component) */}
      <VendorBottomNav onMoreClick={() => setIsSidebarOpen(true)} />
    </div>
  );
}
