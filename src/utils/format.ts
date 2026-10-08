export function formatPrice(value: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
