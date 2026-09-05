import { Wallet, Download, History } from "lucide-react";
import VendorEarningsCard from "../../components/vendor/VendorEarningsCard";

const PAYOUTS = [
  { id: "PAY-9382", date: "Sep 1, 2026", amount: 450000, status: "Completed", account: "GTBank **** 1234" },
  { id: "PAY-9301", date: "Aug 15, 2026", amount: 620000, status: "Completed", account: "GTBank **** 1234" },
  { id: "PAY-9244", date: "Aug 1, 2026", amount: 380000, status: "Completed", account: "GTBank **** 1234" },
];

const TRANSACTIONS = [
  { id: "TRX-7291", orderId: "ORD-7291", date: "Sep 3, 2026", type: "Sale", amount: 125000, fee: 6250 },
  { id: "TRX-7290", orderId: "ORD-7290", date: "Sep 3, 2026", type: "Sale", amount: 170000, fee: 8500 },
  { id: "TRX-7288", orderId: "ORD-7288", date: "Sep 2, 2026", type: "Sale", amount: 65000, fee: 3250 },
  { id: "TRX-7285", orderId: "ORD-7285", date: "Sep 1, 2026", type: "Sale", amount: 145000, fee: 7250 },
  { id: "TRX-7282", orderId: "ORD-7282", date: "Aug 30, 2026", type: "Refund", amount: -125000, fee: -6250 },
];

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
}

export default function VendorEarningsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="font-display text-2xl text-ink">Earnings & Payouts</h2>
        <p className="mt-1 text-sm text-espresso-light">Manage your revenue, request payouts, and view history.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VendorEarningsCard />
        </div>
        
        <div className="lg:col-span-2 rounded-xl border border-line bg-ivory p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg text-ink flex items-center gap-2">
              <History size={18} className="text-espresso-light" />
              Recent Payouts
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
                <tr>
                  <th className="py-2.5 pl-4 font-medium rounded-l-md">Payout ID</th>
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-4 font-medium">Account</th>
                  <th className="py-2.5 px-4 font-medium">Amount</th>
                  <th className="py-2.5 pr-4 font-medium rounded-r-md text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
                {PAYOUTS.map((p) => (
                  <tr key={p.id} className="flex flex-col sm:table-row p-4 sm:p-0">
                    <td className="py-1 sm:py-3.5 sm:pl-4 font-medium text-ink">{p.id}</td>
                    <td className="py-1 sm:py-3.5 sm:px-4 text-espresso-light text-xs sm:text-sm">{p.date}</td>
                    <td className="py-1 sm:py-3.5 sm:px-4 text-espresso-light text-xs sm:text-sm">{p.account}</td>
                    <td className="py-1 sm:py-3.5 sm:px-4 font-medium text-ink">{formatNaira(p.amount)}</td>
                    <td className="py-2 sm:py-3.5 sm:pr-4 text-left sm:text-right">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-700">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-ivory overflow-hidden mt-8">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-lg text-ink flex items-center gap-2">
            <Wallet size={18} className="text-espresso-light" />
            Transaction Ledger
          </h3>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-line bg-cream/50 px-4 py-2 text-sm font-medium text-ink hover:bg-cream transition-colors">
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream/50 text-xs text-espresso-light uppercase tracking-wider hidden sm:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Transaction ID</th>
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Fee (5%)</th>
                <th className="py-3 pr-6 font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line flex-1 sm:flex-none flex flex-col sm:table-row-group">
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                  <td className="py-2 sm:py-3.5 sm:pl-6 font-medium text-ink flex justify-between sm:table-cell">
                    <span className="sm:hidden text-espresso-light">TRX ID:</span>
                    {t.id}
                  </td>
                  <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                    <span className="sm:hidden text-espresso-light">Order ID:</span>
                    <a href="#" className="hover:underline">{t.orderId}</a>
                  </td>
                  <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell">
                    <span className="sm:hidden text-espresso-light">Date:</span>
                    {t.date}
                  </td>
                  <td className="py-2 sm:py-3.5 sm:px-4 flex justify-between sm:table-cell items-center">
                    <span className="sm:hidden text-espresso-light">Type:</span>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${t.type === 'Sale' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`py-2 sm:py-3.5 sm:px-4 font-medium flex justify-between sm:table-cell ${t.amount < 0 ? 'text-red-600' : 'text-ink'}`}>
                    <span className="sm:hidden text-espresso-light">Amount:</span>
                    {formatNaira(t.amount)}
                  </td>
                  <td className={`py-2 sm:py-3.5 sm:px-4 font-medium flex justify-between sm:table-cell ${t.fee < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className="sm:hidden text-espresso-light">Fee:</span>
                    {t.fee > 0 ? '-' : '+'}{formatNaira(Math.abs(t.fee))}
                  </td>
                  <td className="py-3 sm:py-3.5 sm:pr-6 font-semibold text-ink text-left sm:text-right border-t border-line sm:border-0 mt-3 sm:mt-0 pt-4 sm:pt-0 flex justify-between sm:table-cell">
                    <span className="sm:hidden text-espresso-light">Net:</span>
                    {formatNaira(t.amount - t.fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
