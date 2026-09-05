import { ArrowRight, Wallet } from "lucide-react";

export default function VendorEarningsCard() {
  return (
    <div className="rounded-xl border border-line bg-ivory p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg text-ink">Earnings</h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream text-gold">
          <Wallet size={16} />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <p className="text-sm font-medium text-espresso-light mb-1">Available Balance</p>
          <p className="font-display text-3xl text-ink">₦450,000</p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-espresso-light">Pending Balance</span>
            <span className="text-sm font-medium text-ink">₦125,500</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-espresso-light">Total Earnings</span>
            <span className="text-sm font-medium text-ink">₦2,850,000</span>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-espresso">
        Withdraw Funds
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
