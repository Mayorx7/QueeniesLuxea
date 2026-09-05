interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

export default function DonutChart({
  segments,
  size = 160,
  thickness = 32,
  centerLabel,
  centerSub,
}: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f4eee3"
            strokeWidth={thickness}
          />
          {segments.map((seg, i) => {
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const rotationDeg = (offset / total) * 360 - 90;
            offset += seg.value;

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={0}
                strokeLinecap="butt"
                style={{
                  transform: `rotate(${rotationDeg}deg)`,
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: "stroke-dasharray 0.6s ease",
                }}
              />
            );
          })}
        </svg>

        {(centerLabel || centerSub) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerLabel && (
              <span className="font-display text-xl text-ink leading-none">{centerLabel}</span>
            )}
            {centerSub && (
              <span className="mt-0.5 text-[0.65rem] text-espresso-light uppercase tracking-wide">{centerSub}</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <ul className="flex flex-col gap-3 pt-1">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: seg.color }}
            />
            <div>
              <p className="text-sm font-medium text-ink">{seg.label}</p>
              <p className="text-xs text-espresso-light">
                {seg.value} orders · {Math.round((seg.value / total) * 100)}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
