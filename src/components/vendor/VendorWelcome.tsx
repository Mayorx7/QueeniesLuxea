import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface VendorWelcomeProps {
  vendorName: string;
}

export default function VendorWelcome({ vendorName }: VendorWelcomeProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h2 className="font-display text-2xl text-ink sm:text-3xl">
          Welcome back, {vendorName}
        </h2>
        <p className="mt-1 text-espresso-light">
          Here's what's happening with your store today.
        </p>
      </div>
      
      <Link 
        to="/vendor/products/add" 
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso shrink-0"
      >
        <Plus size={16} />
        Add Product
      </Link>
    </div>
  );
}
