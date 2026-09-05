import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ALERTS = [
  { id: 1, name: "Luxury Handbag - Black", stock: 5, status: "Low Stock" },
  { id: 2, name: "Silk Evening Dress - S", stock: 2, status: "Low Stock" },
  { id: 3, name: "Gold Plated Necklace", stock: 0, status: "Out of Stock" },
];

export default function VendorInventoryAlert() {
  return (
    <div className="rounded-xl border border-line bg-ivory p-6 h-full flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={18} />
          <h3 className="font-display text-lg">Inventory Alerts</h3>
        </div>
      </div>

      <ul className="flex-1 space-y-4">
        {ALERTS.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink truncate max-w-[160px]" title={item.name}>
                {item.name}
              </p>
              <p className={`text-xs mt-0.5 ${item.stock === 0 ? 'text-red-500 font-medium' : 'text-espresso-light'}`}>
                {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
              </p>
            </div>
            <span className={`rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
              item.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
            }`}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>

      <Link 
        to="/vendor/inventory"
        className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-cream/50 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
      >
        Manage Inventory
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
