import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorAddProductPage() {
  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link 
          to="/vendor/products" 
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-ivory text-espresso-light hover:bg-cream transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="font-display text-2xl text-ink">Add New Product</h2>
          <p className="mt-1 text-sm text-espresso-light">Create a new listing for your store.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-line bg-ivory p-6">
            <h3 className="font-display text-lg text-ink mb-5">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Silk Evening Gown" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Description</label>
                <textarea 
                  rows={5}
                  placeholder="Describe the product material, fit, and care instructions..." 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne resize-none"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-xl border border-line bg-ivory p-6">
            <h3 className="font-display text-lg text-ink mb-5">Media</h3>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-cream/20 py-12 px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cream">
                <ImagePlus size={24} className="text-espresso-light" />
              </div>
              <p className="text-sm font-medium text-ink">Click to upload or drag and drop</p>
              <p className="mt-1 text-xs text-espresso-light">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          </div>
          
          {/* Pricing */}
          <div className="rounded-xl border border-line bg-ivory p-6">
            <h3 className="font-display text-lg text-ink mb-5">Pricing</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Price (₦)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Compare-at Price (₦)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-line bg-ivory p-6">
            <h3 className="font-display text-lg text-ink mb-5">Status</h3>
            <select className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Organization */}
          <div className="rounded-xl border border-line bg-ivory p-6">
            <h3 className="font-display text-lg text-ink mb-5">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Category</label>
                <select className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne">
                  <option value="dresses">Dresses</option>
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Tags</label>
                <input 
                  type="text" 
                  placeholder="e.g. Summer, Silk, Evening" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-xl border border-line bg-ivory p-6">
            <h3 className="font-display text-lg text-ink mb-5">Inventory</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">SKU</label>
                <input 
                  type="text" 
                  placeholder="e.g. DRESS-SILK-BLK" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Quantity</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link 
          to="/vendor/products"
          className="rounded-lg px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
        >
          Cancel
        </Link>
        <button className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso">
          <Save size={16} />
          Save Product
        </button>
      </div>
    </div>
  );
}
