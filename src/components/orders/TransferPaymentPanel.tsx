import { useEffect, useState } from "react";
import { FileText, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../utils/format";
import { openWhatsAppPaymentProof } from "../../utils/whatsapp";

export default function TransferPaymentPanel({ orderId, orderNumber }: { orderId: string; orderNumber: string; total: number }) {
  const [invoice, setInvoice] = useState<any>(null); const [payment, setPayment] = useState<any>(null);
  const load = async () => { if (!supabase) return; const { data: i } = await supabase.from("invoices").select("*").eq("order_id", orderId).maybeSingle(); setInvoice(i); const { data: p } = await supabase.from("payments").select("*").eq("order_id", orderId).order("created_at", { ascending: false }).limit(1).maybeSingle(); setPayment(p); };
  useEffect(() => { void load(); }, [orderId]);
  if (!invoice) return null;
  const bank = invoice.bank_details_snapshot as Record<string,string>;
  return (
    <section className="rounded-2xl border border-line bg-ivory p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg text-ink">Proceed to payment</h3>
        <a href={`/invoice/${invoice.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-gold"><FileText size={15} />View invoice</a>
      </div>
      <p className="mt-3 text-sm text-espresso-light">Transfer exactly <strong className="text-ink">{formatPrice(invoice.amount_due)}</strong> to:</p>
      <div className="mt-3 rounded-lg bg-cream/50 p-4 text-sm text-espresso">
        <p><b>Bank:</b> {bank.bank_name}</p>
        <p><b>Account name:</b> {bank.account_name}</p>
        <p><b>Account number:</b> {bank.account_number}</p>
        {bank.instructions && <p className="mt-2">{bank.instructions}</p>}
      </div>
      {payment?.status === "verified" ? <p className="mt-4 text-sm font-semibold text-emerald-700">Payment verified. Your receipt is available in your invoice.</p> : (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-espresso-light">After you pay, send your proof to WhatsApp. The vendor will check the transfer and be with you shortly. Once payment is verified, your order moves to processing.</p>
          <button type="button" onClick={() => openWhatsAppPaymentProof(orderNumber)} className="inline-flex items-center gap-2 border border-[#25D366] px-4 py-3 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/10"><MessageCircle size={16} />Send proof to WhatsApp</button>
        </div>
      )}
    </section>
  );
}
