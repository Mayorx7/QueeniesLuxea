import { useState } from "react";

const DATA = [
  { label: "Mon", revenue: 150000, orders: 12 },
  { label: "Tue", revenue: 230000, orders: 18 },
  { label: "Wed", revenue: 180000, orders: 15 },
  { label: "Thu", revenue: 320000, orders: 25 },
  { label: "Fri", revenue: 280000, orders: 22 },
  { label: "Sat", revenue: 450000, orders: 35 },
  { label: "Sun", revenue: 390000, orders: 30 },
];

export default function VendorSalesOverview() {
  const [period, setPeriod] = useState("7 Days");
  
  // Simple SVG Chart math
  const maxRev = Math.max(...DATA.map(d => d.revenue)) * 1.2;
  const W = 600;
  const H = 240;
  const PAD = { top: 20, right: 20, bottom: 30, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  
  const xScale = (i: number) => (i / (DATA.length - 1)) * innerW;
  const yScale = (v: number) => innerH - (v / maxRev) * innerH;
  
  const linePath = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(d.revenue)}`).join(" ");
  const areaPath = `${linePath} L ${innerW},${innerH} L 0,${innerH} Z`;

  const formatNaira = (v: number) => `₦${(v / 1000).toFixed(0)}k`;

  return (
    <div className="rounded-xl border border-line bg-ivory p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg text-ink">Sales Overview</h3>
          <p className="text-sm text-espresso-light mt-0.5">Revenue and orders over time</p>
        </div>
        <div className="flex rounded-lg border border-line bg-cream/50 p-1">
          {["7 Days", "30 Days", "3 Months", "1 Year"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p ? "bg-ivory text-ink shadow-sm" : "text-espresso-light hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[500px]" style={{ height: H }}>
          <defs>
            <linearGradient id="vendorRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14100d" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#14100d" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {/* Y Axis Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(pct => {
              const y = innerH * (1 - pct);
              const val = maxRev * pct;
              return (
                <g key={pct}>
                  <line x1={0} y1={y} x2={innerW} y2={y} stroke="#ded2bd" strokeDasharray="4 4" />
                  <text x={-10} y={y + 4} textAnchor="end" fontSize="10" fill="#5c4632">
                    {formatNaira(val)}
                  </text>
                </g>
              );
            })}

            {/* Area */}
            <path d={areaPath} fill="url(#vendorRevGrad)" />
            {/* Line */}
            <path d={linePath} fill="none" stroke="#14100d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points & X Axis */}
            {DATA.map((d, i) => (
              <g key={i}>
                <circle cx={xScale(i)} cy={yScale(d.revenue)} r="4" fill="#14100d" stroke="#fbf8f3" strokeWidth="2" />
                <text x={xScale(i)} y={innerH + 20} textAnchor="middle" fontSize="11" fill="#5c4632">
                  {d.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
