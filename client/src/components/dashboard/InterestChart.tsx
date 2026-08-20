import { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineChartBar } from 'react-icons/hi2';

export type ChartPoint = {
  label: string;
  value: number;
};

type InterestChartProps = {
  points: ChartPoint[];
  color?: string;
  emptyMessage?: string;
};

const WIDTH = 600;
const HEIGHT = 220;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PAD_X = 12;

export default function InterestChart({
  points,
  color = '#152A4E',
  emptyMessage = 'אין עדיין מספיק נתונים כדי להציג גרף',
}: InterestChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const hasData = points.length > 0 && points.some((p) => p.value > 0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [points]);

  const { linePath, areaPath, coords, maxValue } = useMemo(() => {
    if (points.length === 0) {
      return { linePath: '', areaPath: '', coords: [] as { x: number; y: number }[], maxValue: 0 };
    }
    const max = Math.max(1, ...points.map((p) => p.value));
    const innerWidth = WIDTH - PAD_X * 2;
    const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    const pts = points.map((p, i) => ({
      x: PAD_X + step * i,
      y: PAD_TOP + innerHeight - (p.value / max) * innerHeight,
    }));

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const area =
      `M ${pts[0].x.toFixed(2)} ${(PAD_TOP + innerHeight).toFixed(2)} ` +
      pts.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') +
      ` L ${pts[pts.length - 1].x.toFixed(2)} ${(PAD_TOP + innerHeight).toFixed(2)} Z`;

    return { linePath: line, areaPath: area, coords: pts, maxValue: max };
  }, [points]);

  if (!hasData) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/15 bg-navy/[0.02] text-center">
        <HiOutlineChartBar className="h-8 w-8 text-navy/25" />
        <p className="font-sans text-sm text-ink/50">{emptyMessage}</p>
      </div>
    );
  }

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || coords.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let best = Infinity;
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - relX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
    setTooltipPos({ x: (coords[nearest].x / WIDTH) * 100, y: (coords[nearest].y / HEIGHT) * 100 });
  };

  const gridLines = [0.25, 0.5, 0.75];
  const yTickValue = Math.max(1, Math.round(maxValue));

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label="גרף רמת עניין לאורך זמן"
      >
        <defs>
          <linearGradient id="interest-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.16} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {gridLines.map((g) => {
          const y = PAD_TOP + (HEIGHT - PAD_TOP - PAD_BOTTOM) * g;
          return (
            <line
              key={g}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-ink/[0.06]"
              strokeWidth={1}
            />
          );
        })}

        <path
          d={areaPath}
          fill="url(#interest-fill)"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 500ms var(--ease-out-strong) 350ms',
          }}
        />

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: mounted ? 0 : 1,
            transition: 'stroke-dashoffset 900ms var(--ease-out-strong)',
          }}
        />

        {coords.map((c, i) => {
          const isLast = i === coords.length - 1;
          const isHover = hoverIndex === i;
          if (!isLast && !isHover) return null;
          return (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={isHover ? 5.5 : 4.5}
              fill={color}
              stroke="white"
              strokeWidth={2}
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 300ms var(--ease-out-strong) 700ms, r 150ms var(--ease-out-strong)',
              }}
            />
          );
        })}

        {hoverIndex !== null && (
          <line
            x1={coords[hoverIndex].x}
            x2={coords[hoverIndex].x}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            stroke={color}
            strokeOpacity={0.25}
            strokeWidth={1}
          />
        )}

        <text x={PAD_X} y={HEIGHT - 8} className="fill-ink/35 font-sans" fontSize={11}>
          {points[0]?.label}
        </text>
        <text
          x={WIDTH - PAD_X}
          y={HEIGHT - 8}
          textAnchor="end"
          className="fill-ink/35 font-sans"
          fontSize={11}
        >
          {points[points.length - 1]?.label}
        </text>
        <text x={PAD_X} y={PAD_TOP - 4} className="fill-ink/30 font-sans" fontSize={10}>
          {yTickValue}
        </text>
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-3 py-1.5 text-center shadow-lg"
          style={{ left: `${tooltipPos.x}%`, top: `calc(${tooltipPos.y}% - 10px)` }}
        >
          <p className="font-display text-sm font-bold text-white">{points[hoverIndex].value}</p>
          <p className="font-sans text-[10px] text-white/60">{points[hoverIndex].label}</p>
        </div>
      )}

      <table className="sr-only">
        <caption>רמת עניין לאורך זמן</caption>
        <thead>
          <tr>
            <th>תאריך</th>
            <th>פניות מצטברות</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.label}>
              <td>{p.label}</td>
              <td>{p.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
