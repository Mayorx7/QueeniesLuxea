import type { Product } from "../types";

export const WHATSAPP_PHONE = "2348150959869";

export function openWhatsAppOrder(lines: Array<{ product: Product; quantity: number; color: string; size: string }>, total?: number) {
  const items = lines.map((line) => {
    const options = [line.color, line.size].filter((value) => value && value !== "Standard").join(" · ");
    return `• ${line.product.name}${options ? ` (${options})` : ""} × ${line.quantity}`;
  }).join("\n");
  const price = total === undefined ? "" : `\nEstimated total: ₦${total.toLocaleString("en-NG")}`;
  const message = encodeURIComponent(`Hello QueensLuxea, I would like to order:\n\n${items}${price}\n\nPlease let me know the next steps.`);
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, "_blank", "noopener,noreferrer");
}

export function openWhatsAppPaymentProof(orderNumber: string) {
  const message = encodeURIComponent(
    `Hello QueensLuxea, I have paid for order ${orderNumber}. I am sending my proof of payment for verification.`
  );
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, "_blank", "noopener,noreferrer");
}
