import { useState } from "react";
import { Search, AlertTriangle, CheckCircle2 } from "lucide-react";

const INVENTORY = [
  { id: "INV-1", name: "Linen Summer Blazer", sku: "BLZ-LIN-01", stock: 0, status: "Out of Stock" },
  { id: "INV-2", name: "Velvet Wrap Coat", sku: "COT-VEL-02", stock: 0, status: "Out of Stock" },
  { id: "INV-3", name: "Pleated Midi Skirt", sku: "SKT-PLT-01", stock: 2, status: "Low Stock" },
  { id: "INV-4", name: "Silk Evening Gown", sku: "GWN-SLK-01", stock: 15, status: "In Stock" },
  { id: "INV-5", name: "Satin Evening Trousers", sku: "TRS-SAT-03", stock: 12, status: "In Stock" },
  { id: "INV-6", name: "Classic Cotton Shirt", sku: "SHT-COT-05", stock: 32, status: "In Stock" },
];

export default function VendorInventoryPage() {
  const [search, setSearch] = useState("");
  // In a real app, this would be complex state management. For now, simple mock state.
  const [quantities, setQuantities] = useState<Record<string, number>>(
    INVENTORY.reduce((acc, item) => ({ ...acc, [item.id]: item.stock }), {})
  );

  const filtered = INVENTORY.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusDisplay = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50", icon: AlertTriangle };
    if (stock <= 5) return { label: "Low Stock", color: "text-amber-700 bg-amber-50", icon: AlertTriangle };
    return { label: "In Stock", color: "text-emerald-700 bg-emerald-50", icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink">Inventory Management</h2>
          <p className="mt-1 text-sm text-espresso-light">Monitor and adjust your product stock levels.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="rounded-lg border border-line bg-ivory px-4 py-2 text-sm">
            <span className="text-espresso-light mr-2">Low Stock:</span>
            <span className="font-semibold text-amber-600">
              {Object.values(quantities).filter(q => q > 0 && q <= 5).length}
            </span>
          </div>
          <div className="rounded-lg border border-line bg-ivory px-4 py-2 text-sm">
            <span className="text-espresso-light mr-2">Out of Stock:</span>
            <span className="font-semibold text-red-600">
              {Object.values(quantities).filter(q => q === 0).length}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-ivory overflow-hidden">
        <div className="border-b border-line p-5">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-light" />
            <input 
              type="text" 
              placeholder="Search by Product Name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream/30 py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Product Name</th>
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Available</th>
                <th className="py-3 pr-6 font-medium text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
              {filtered.map((item) => {
                const currentQty = quantities[item.id];
                const status = getStatusDisplay(currentQty);
                const Icon = status.icon;
                
                return (
                  <tr key={item.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                    <td className="py-3 sm:py-4 sm:pl-6 font-medium text-ink">{item.name}</td>
                    <td className="py-1 sm:py-4 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">SKU:</span>
                      {item.sku}
                    </td>
                    <td className="py-2 sm:py-4 sm:px-4 flex justify-between sm:table-cell items-center">
                      <span className="sm:hidden text-espresso-light">Status:</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ${status.color}`}>
                        <Icon size={12} strokeWidth={2.5} />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2 sm:py-4 sm:px-4 flex justify-between sm:table-cell">
                      <span className="sm:hidden text-espresso-light">Available:</span>
                      <span className={`font-medium ${currentQty === 0 ? 'text-red-500' : 'text-ink'}`}>
                        {currentQty}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 sm:pr-6 text-left sm:text-right border-t border-line sm:border-0 mt-3 sm:mt-0 pt-4 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="sm:hidden text-espresso-light">Update:</span>
                        <div className="flex items-center gap-1 bg-cream/30 border border-line rounded-lg p-1">
                          <button 
                            onClick={() => setQuantities(prev => ({...prev, [item.id]: Math.max(0, prev[item.id] - 1)}))}
                            className="w-7 h-7 rounded bg-ivory text-ink border border-line flex items-center justify-center hover:bg-cream hover:border-champagne"
                          >
                            -
                          </button>
                          <input 
                            type="number"
                            value={currentQty}
                            onChange={(e) => setQuantities(prev => ({...prev, [item.id]: Math.max(0, parseInt(e.target.value) || 0)}))}
                            className="w-12 h-7 bg-transparent text-center text-sm outline-none text-ink font-medium"
                          />
                          <button 
                            onClick={() => setQuantities(prev => ({...prev, [item.id]: prev[item.id] + 1}))}
                            className="w-7 h-7 rounded bg-ivory text-ink border border-line flex items-center justify-center hover:bg-cream hover:border-champagne"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
