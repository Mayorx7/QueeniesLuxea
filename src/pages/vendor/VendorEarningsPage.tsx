import { useEffect, useState } from "react";
import { Wallet, Download, History, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import VendorEarningsCard from "../../components/vendor/VendorEarningsCard";

interface Transaction {
  id: string;
  orderId: string;
  date: string;
  type: string;
  amount: number;
  fee: number;
}

export default function VendorEarningsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("id, order_id, total_price, created_at, orders(order_number)")
          .eq("vendor_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped: Transaction[] = (data ?? []).map((row) => ({
          id: row.id.slice(0, 8),
          orderId: (row.orders as any)?.order_number ?? row.order_id.slice(0, 8),
          date: new Date(row.created_at).toLocaleDateString(),
          type: "Sale",
          amount: row.total_price,
          fee: row.total_price * 0.05, // 5% fee
        }));

        setTransactions(mapped);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [user]);

  function formatNaira(v: number) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
  }

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
                <tr className="flex sm:table-row">
                  <td colSpan={5} className="py-10 text-center text-espresso-light text-sm w-full">
                    No payouts yet. Your earnings will appear here once processed.
                  </td>
                </tr>
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
              {loading ? (
                <tr className="flex sm:table-row p-5 sm:p-0">
                  <td colSpan={7} className="py-10 text-center text-espresso-light text-sm w-full">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr className="flex sm:table-row p-5 sm:p-0">
                  <td colSpan={7} className="py-10 text-center text-espresso-light text-sm w-full">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="flex flex-col sm:table-row hover:bg-cream/30 transition-colors p-5 sm:p-0">
                    <td className="py-2 sm:py-3.5 sm:pl-6 font-medium text-ink flex justify-between sm:table-cell uppercase">
                      <span className="sm:hidden text-espresso-light">TRX ID:</span>
                      {t.id}
                    </td>
                    <td className="py-2 sm:py-3.5 sm:px-4 text-espresso-light flex justify-between sm:table-cell uppercase">
                      <span className="sm:hidden text-espresso-light">Order ID:</span>
                      {t.orderId}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
