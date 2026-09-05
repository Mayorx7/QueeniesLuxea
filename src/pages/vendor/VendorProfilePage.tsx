import { useState } from "react";
import { User, Lock, Bell, Save } from "lucide-react";

export default function VendorProfilePage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl text-ink">My Profile</h2>
        <p className="mt-1 text-sm text-espresso-light">Manage your personal account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "general" ? "bg-cream/50 text-ink" : "text-espresso-light hover:bg-cream/30 hover:text-ink"
              }`}
            >
              <User size={18} className={activeTab === "general" ? "text-gold" : ""} />
              General Info
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "security" ? "bg-cream/50 text-ink" : "text-espresso-light hover:bg-cream/30 hover:text-ink"
              }`}
            >
              <Lock size={18} className={activeTab === "security" ? "text-gold" : ""} />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "notifications" ? "bg-cream/50 text-ink" : "text-espresso-light hover:bg-cream/30 hover:text-ink"
              }`}
            >
              <Bell size={18} className={activeTab === "notifications" ? "text-gold" : ""} />
              Notifications
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 rounded-xl border border-line bg-ivory p-6 sm:p-8">
          
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-display text-lg text-ink border-b border-line pb-4 mb-6">General Information</h3>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-champagne bg-cream text-2xl font-display text-ink">
                  LB
                </div>
                <button className="rounded-lg border border-line bg-transparent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream">
                  Change Avatar
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">First Name</label>
                  <input type="text" defaultValue="Sarah" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">Last Name</label>
                  <input type="text" defaultValue="Jenkins" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">Email Address</label>
                  <input type="email" defaultValue="sarah@luxeboutique.com" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">Phone Number</label>
                  <input type="tel" defaultValue="+234 801 234 5678" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-display text-lg text-ink border-b border-line pb-4 mb-6">Security & Password</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso-light mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-display text-lg text-ink border-b border-line pb-4 mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { title: "New Orders", desc: "Receive an email when a new order is placed." },
                  { title: "Low Stock Alerts", desc: "Get notified when a product inventory falls below 5." },
                  { title: "Payout Updates", desc: "Receive emails about payout status changes." },
                  { title: "Marketing & Promos", desc: "Receive tips and offers from QueenLuxea." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <p className="text-xs text-espresso-light mt-0.5">{item.desc}</p>
                    </div>
                    <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gold transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2">
                      <span className="translate-x-4 inline-block h-4 w-4 transform rounded-full bg-ivory transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end border-t border-line pt-6">
            <button className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
