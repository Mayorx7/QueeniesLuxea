import { useState } from "react";
import { Search, Mail, ExternalLink } from "lucide-react";

const CUSTOMERS = [
  { id: "CUS-102", name: "Chiamaka Okafor", email: "chiamaka@example.com", orders: 4, totalSpend: 345000, lastOrder: "Sep 3, 2026" },
  { id: "CUS-108", name: "Tunde Bakare",    email: "tunde.b@example.com",    orders: 1, totalSpend: 170000, lastOrder: "Sep 3, 2026" },
  { id: "CUS-094", name: "Aisha Bello",     email: "aisha.bello@example.com",orders: 8, totalSpend: 890000, lastOrder: "Sep 2, 2026" },
  { id: "CUS-115", name: "Folake Davies",   email: "folake.d@example.com",   orders: 2, totalSpend: 210000, lastOrder: "Sep 1, 2026" },
  { id: "CUS-088", name: "David Nwachukwu", email: "david.nwa@example.com",  orders: 3, totalSpend: 425000, lastOrder: "Aug 30, 2026" },
  { id: "CUS-105", name: "Grace Ibekwe",    email: "grace.ibekwe@example.com",orders:1, totalSpend: 85000,  lastOrder: "Aug 29, 2026" },
  { id: "CUS-091", name: "Samuel Ojo",      email: "samuel.ojo@example.com", orders: 5, totalSpend: 650000, lastOrder: "Aug 27, 2026" },
];

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
}

export default function VendorCustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="font-display text-2xl text-ink">Customers</h2>
        <p className="mt-1 text-sm text-espresso-light">View and manage customers who have purchased from your store.</p>
      </div>

      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-line p-5">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Orders</th>
                <th className="py-3 px-4 font-medium">Total Spend</th>
                <th className="py-3 px-4 font-medium">Last Order</th>
                <th className="py-3 pr-6 font-medium text-right">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
              {filtered.length === 0 ? (
                <tr className="flex sm:table-row">
                  <td colSpan={5} className="py-10 text-center text-espresso-light w-full">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                    <td className="py-3.5 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-gold font-display text-sm">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{c.name}</p>
                          <p className="text-xs text-espresso-light">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Orders:</span>
                      {c.orders}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 font-medium text-ink flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Total Spend:</span>
                      {formatNaira(c.totalSpend)}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Last Order:</span>
                      {c.lastOrder}
                    </td>
                    <td className="py-3 sm:py-3.5 sm:pr-6 text-left sm:text-right border-t border-line sm:border-0 mt-3 sm:mt-0 pt-4 sm:pt-0">
                      <div className="flex items-center justify-start sm:justify-end gap-2">
                        <a href={`mailto:${c.email}`} className="flex items-center gap-2 rounded-lg bg-cream/50 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream transition-colors">
                          <Mail size={14} />
                          <span className="sm:hidden">Email</span>
                        </a>
                        <button className="flex items-center gap-2 rounded-lg bg-cream/50 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream transition-colors">
                          <ExternalLink size={14} />
                          <span className="sm:hidden">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
