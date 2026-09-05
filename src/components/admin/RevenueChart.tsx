interface RevenueChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export default function RevenueChart({ data, height = 200 }: RevenueChartProps) {
  const W = 700;
  const H = height;
  const PAD = { top: 12, right: 12, bottom: 36, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values) * 1.1;
  const minVal = 0;

  const xScale = (i: number) => (i / (data.length - 1)) * innerW;
  const yScale = (v: number) => innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(d.value)}`)
    .join(" ");

  const areaPath = `${linePath} L ${xScale(data.length - 1)},${innerH} L 0,${innerH} Z`;

  // Y-axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) =>
    minVal + ((maxVal - minVal) / tickCount) * i
  );

  // X-axis labels — show every nth label to avoid crowding
  const labelStep = Math.ceil(data.length / 7);

  const formatMoney = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320, height }}
        aria-label="Revenue over time"
      >
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a9803f" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#a9803f" stopOpacity="0" />
          </linearGradient>
          <clipPath id="chartClip">
            <rect x="0" y="0" width={innerW} height={innerH} />
          </clipPath>
        </defs>

        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                y1={yScale(tick)}
                x2={innerW}
                y2={yScale(tick)}
                stroke="#ded2bd"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={-8}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#5c4632"
                fontFamily="Karla, sans-serif"
              >
                {formatMoney(tick)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#revenueGrad)" clipPath="url(#chartClip)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#a9803f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#chartClip)"
          />

          {/* Dots on data points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(d.value)}
              r="3"
              fill="#a9803f"
              stroke="#fbf8f3"
              strokeWidth="1.5"
              opacity={i % labelStep === 0 ? 1 : 0}
            />
          ))}

          {/* X-axis labels */}
          {data.map((d, i) =>
            i % labelStep === 0 ? (
              <text
                key={i}
                x={xScale(i)}
                y={innerH + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#5c4632"
                fontFamily="Karla, sans-serif"
              >
                {d.label}
              </text>
            ) : null
          )}
        </g>
      </svg>
    </div>
  );
}
