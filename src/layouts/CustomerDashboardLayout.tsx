import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";

export default function CustomerDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine the page title based on the route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/account") return "Overview";
    if (path.includes("/orders")) return "My Orders";
    if (path.includes("/profile")) return "Profile";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/addresses")) return "Addresses";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-cream/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader 
          onMenuClick={() => setIsSidebarOpen(true)} 
          title={getPageTitle()}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
