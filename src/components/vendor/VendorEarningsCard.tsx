import { useEffect, useState } from "react";
import { ArrowRight, Wallet } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/format";

export default function VendorEarningsCard() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase || !user) return;
      try {
        const { data, error } = await supabase.rpc("vendor_get_stats");
        if (error) throw error;
        setEarnings(data?.total_earnings || 0);
      } catch (err) {
        console.error("Failed to load earnings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

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
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded bg-cream" />
          ) : (
            <p className="font-display text-3xl text-ink">{formatPrice(earnings)}</p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-espresso-light">Pending Balance</span>
            <span className="text-sm font-medium text-ink">{formatPrice(0)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-espresso-light">Total Earnings</span>
            <span className="text-sm font-medium text-ink">{formatPrice(earnings)}</span>
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
