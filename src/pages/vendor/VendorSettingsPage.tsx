import { Save, Image as ImageIcon } from "lucide-react";

export default function VendorSettingsPage() {
  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl text-ink">Store Settings</h2>
        <p className="mt-1 text-sm text-espresso-light">Manage your store profile, policies, and appearance.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile & Branding */}
        <div className="rounded-xl border border-line bg-ivory p-6">
          <h3 className="font-display text-lg text-ink mb-1">Brand Identity</h3>
          <p className="text-sm text-espresso-light mb-6">This is how your store appears to customers on QueenLuxea.</p>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-espresso-light">Store Logo</label>
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-line bg-cream/30 hover:bg-cream transition-colors cursor-pointer">
                  <div className="text-center">
                    <ImageIcon size={20} className="mx-auto text-espresso-light mb-1" />
                    <span className="text-[10px] text-espresso-light font-medium uppercase">Upload</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 flex-1 w-full">
                <label className="block text-sm font-medium text-espresso-light">Store Cover Image</label>
                <div className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-line bg-cream/30 hover:bg-cream transition-colors cursor-pointer">
                   <div className="text-center">
                    <ImageIcon size={24} className="mx-auto text-espresso-light mb-1" />
                    <span className="text-xs text-espresso-light font-medium">Click to upload cover image (1200x400)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Store Name</label>
                <input 
                  type="text" 
                  defaultValue="Luxe Boutique" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso-light mb-1.5">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@luxeboutique.com" 
                  className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso-light mb-1.5">Store Description</label>
              <textarea 
                rows={4}
                defaultValue="Curated luxury fashion for the modern woman. We specialize in high-quality silk, linen, and sustainable fabrics designed to last a lifetime." 
                className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne resize-none"
              />
              <p className="mt-1 text-xs text-espresso-light">Keep it brief. Max 250 characters.</p>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="rounded-xl border border-line bg-ivory p-6">
          <h3 className="font-display text-lg text-ink mb-1">Store Policies</h3>
          <p className="text-sm text-espresso-light mb-6">Set expectations for shipping and returns.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-espresso-light mb-1.5">Shipping Policy</label>
              <textarea 
                rows={3}
                defaultValue="All orders are processed within 1-2 business days. Standard shipping takes 3-5 business days." 
                className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso-light mb-1.5">Return & Refund Policy</label>
              <textarea 
                rows={3}
                defaultValue="We accept returns within 14 days of delivery. Items must be unworn and in original packaging with tags attached." 
                className="w-full rounded-lg border border-line bg-cream/30 py-2.5 px-4 text-sm text-ink outline-none transition-colors focus:border-champagne resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button className="rounded-lg px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream">
          Discard Changes
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso">
          <Save size={16} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
