const TOP_PRODUCTS = [
  { name: "Amara Silk Column Gown", sold: 45, revenue: 5625000, img: "https://images.unsplash.com/photo-1566160983935-8659b85c884d?q=80&w=100&auto=format&fit=crop" },
  { name: "Verity Wrap Midi Dress", sold: 38, revenue: 3230000, img: "https://images.unsplash.com/photo-1583391733958-650fac5ceb1c?q=80&w=100&auto=format&fit=crop" },
  { name: "Calla Linen Blazer",     sold: 32, revenue: 4640000, img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=100&auto=format&fit=crop" },
  { name: "Riviera Knit Cardigan",  sold: 28, revenue: 2380000, img: "https://images.unsplash.com/photo-1624623278313-a930126a11c3?q=80&w=100&auto=format&fit=crop" },
  { name: "Pleated Satin Midi",     sold: 24, revenue: 1560000, img: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=100&auto=format&fit=crop" },
];

function formatNaira(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(v);
}

export default function VendorTopProducts() {
  return (
    <div className="rounded-xl border border-line bg-ivory overflow-hidden h-full flex flex-col">
      <div className="border-b border-line p-5">
        <h3 className="font-display text-lg text-ink">Top Selling Products</h3>
      </div>
      
      <ul className="flex-1 divide-y divide-line overflow-y-auto">
        {TOP_PRODUCTS.map((p, i) => (
          <li key={p.name} className="flex items-center gap-4 p-5 hover:bg-cream/30 transition-colors">
            <span className="font-display text-lg text-espresso-light/40 w-4 text-right shrink-0">{i + 1}</span>
            <img src={p.img} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{p.name}</p>
              <p className="text-xs text-espresso-light">{p.sold} units sold</p>
            </div>
            <span className="text-sm font-semibold text-ink shrink-0">{formatNaira(p.revenue)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
