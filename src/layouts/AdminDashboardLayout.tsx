import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/customers": "Customers",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/admin/orders/") ? "Order Detail" :
     pathname.startsWith("/admin/products/") ? "Product Detail" :
     pathname.startsWith("/admin/customers/") ? "Customer Detail" :
     "Admin");

  return (
    <div className="flex h-screen overflow-hidden bg-cream/30">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
