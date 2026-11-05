import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, Table as TableIcon } from 'lucide-react';

interface DataPoint {
  label: string;
  value: number;
}

interface DataChartProps {
  title?: string;
  data: DataPoint[];
  isRtl?: boolean;
}

export const DataChart: React.FC<DataChartProps> = ({
  title = 'بيانات التحليل الإحصائي',
  data,
  isRtl = false,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 160;
  const chartWidth = 480;
  const paddingX = 40;
  const paddingY = 25;
  const effectiveWidth = chartWidth - paddingX * 2;
  const effectiveHeight = chartHeight - paddingY * 2;
  const stepX = effectiveWidth / Math.max(data.length - 1, 1);

  // Line chart path points
  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + effectiveHeight - (d.value / maxValue) * effectiveHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z` : '';

  return (
    <div className="my-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-white/10 text-[#0d0d0d] dark:text-[#ececec]">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <BarChart3 size={15} className="text-emerald-500" />
          <span>{title}</span>
        </div>

        {/* Type Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-200 dark:bg-white/10 text-xs">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1 rounded-md ${chartType === 'bar' ? 'bg-white dark:bg-[#2f2f2f] text-emerald-500 shadow-xs' : 'text-[#8e8e8e]'}`}
            title="Bar Chart"
          >
            <BarChart3 size={13} />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-1 rounded-md ${chartType === 'line' ? 'bg-white dark:bg-[#2f2f2f] text-emerald-500 shadow-xs' : 'text-[#8e8e8e]'}`}
            title="Line Chart"
          >
            <LineChart size={13} />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative pt-4 flex items-center justify-center">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-lg h-auto overflow-visible">
          {/* Subtle horizontal grid lines */}
          {[0, 0.5, 1].map((pct, i) => {
            const y = paddingY + effectiveHeight * (1 - pct);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeDasharray="4 4"
                />
                <text
                  x={isRtl ? chartWidth - paddingX + 8 : paddingX - 8}
                  y={y + 3}
                  textAnchor={isRtl ? 'start' : 'end'}
                  fontSize="9"
                  fill="currentColor"
                  opacity="0.4"
                  className="font-mono"
                >
                  {Math.round(maxValue * pct)}
                </text>
              </g>
            );
          })}

          {chartType === 'line' && (
            <>
              {/* Gradient fill */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#areaGradient)" />
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 5 : 3.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </>
          )}

          {chartType === 'bar' && (
            <>
              {data.map((d, i) => {
                const barWidth = Math.min(effectiveWidth / data.length - 8, 32);
                const x = paddingX + i * (effectiveWidth / data.length) + (effectiveWidth / data.length - barWidth) / 2;
                const h = (d.value / maxValue) * effectiveHeight;
                const y = chartHeight - paddingY - h;
                const isHovered = hoveredIdx === i;

                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(h, 2)}
                    rx="4"
                    fill={isHovered ? '#059669' : '#10b981'}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </>
          )}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = paddingX + i * (effectiveWidth / Math.max(data.length - 1, 1));
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 6}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                opacity="0.6"
              >
                {d.label.slice(0, 10)}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-2 start-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black text-white text-xs font-mono shadow-lg border border-white/10 pointer-events-none">
            {data[hoveredIdx].label}: <span className="text-emerald-400 font-bold">{data[hoveredIdx].value}</span>
          </div>
        )}
      </div>
    </div>
  );
};
