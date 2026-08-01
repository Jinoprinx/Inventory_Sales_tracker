'use client';

import React from 'react';

// Common Chart Interfaces
interface ChartDataPoint {
  label: string;
  value1: number; // e.g. Sales, Gross Profit
  value2?: number; // e.g. Net Profit
}

interface PieDataPoint {
  label: string;
  value: number;
  color: string;
}

// 1. Line Chart Component
export const LineChart: React.FC<{
  data: ChartDataPoint[];
  title?: string;
  label1?: string;
  label2?: string;
}> = ({ data, title, label1 = 'Revenue', label2 = 'Net Profit' }) => {
  const width = 520;
  const height = 240;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-subtle)', borderRadius: '16px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
        No analytics data available for this period.
      </div>
    );
  }

  // Find max value for Y scaling
  const allValues = data.flatMap((d) => [d.value1, d.value2 || 0]);
  const maxValue = Math.max(...allValues, 100);
  const yTicks = 4;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return height - paddingBottom - (val / maxValue) * chartHeight;
  };

  // Build SVG Path strings
  let path1 = '';
  let path2 = '';
  let areaPath1 = '';
  let areaPath2 = '';

  data.forEach((point, i) => {
    const x = getX(i);
    const y1 = getY(point.value1);
    const y2 = getY(point.value2 || 0);

    if (i === 0) {
      path1 = `M ${x} ${y1}`;
      path2 = `M ${x} ${y2}`;
      areaPath1 = `M ${x} ${height - paddingBottom} L ${x} ${y1}`;
      areaPath2 = `M ${x} ${height - paddingBottom} L ${x} ${y2}`;
    } else {
      path1 += ` L ${x} ${y1}`;
      path2 += ` L ${x} ${y2}`;
      areaPath1 += ` L ${x} ${y1}`;
      areaPath2 += ` L ${x} ${y2}`;
    }
    if (i === data.length - 1) {
      areaPath1 += ` L ${x} ${height - paddingBottom} Z`;
      areaPath2 += ` L ${x} ${height - paddingBottom} Z`;
    }
  });

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          {title}
        </h4>
      )}
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid lines */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const val = (maxValue / yTicks) * i;
            const y = getY(val);
            return (
              <g key={i} style={{ opacity: 0.4 }}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#94A3B8"
                  fontSize="10px"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  ₦{Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.map((point, i) => {
            const x = getX(i);
            if (data.length > 7 && i % Math.ceil(data.length / 6) !== 0) return null;
            return (
              <text
                key={i}
                x={x}
                y={height - paddingBottom + 20}
                fill="#94A3B8"
                fontSize="10px"
                fontFamily="var(--font-heading)"
                textAnchor="middle"
              >
                {point.label}
              </text>
            );
          })}

          {/* Area Fills */}
          <path d={areaPath1} fill="url(#areaGradient1)" />
          {data[0]?.value2 !== undefined && <path d={areaPath2} fill="url(#areaGradient2)" />}

          {/* Line 1: Emerald Green */}
          <path
            d={path1}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'all 300ms ease', filter: 'drop-shadow(0px 3px 6px rgba(16, 185, 129, 0.4))' }}
          />
          {/* Line 2: Cyber Cyan */}
          {data[0]?.value2 !== undefined && (
            <path
              d={path2}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'all 300ms ease', filter: 'drop-shadow(0px 3px 6px rgba(6, 182, 212, 0.4))' }}
            />
          )}

          {/* Interactive Dots */}
          {data.map((point, i) => {
            const x = getX(i);
            const y1 = getY(point.value1);
            const y2 = getY(point.value2 || 0);

            return (
              <g key={i} style={{ cursor: 'pointer' }}>
                <circle cx={x} cy={y1} r="5" fill="#10B981" stroke="var(--color-bg)" strokeWidth="2" />
                {point.value2 !== undefined && (
                  <circle cx={x} cy={y2} r="5" fill="#06B6D4" stroke="var(--color-bg)" strokeWidth="2" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Pills */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', fontWeight: 600 }}>
          <span style={{ width: '12px', height: '4px', borderRadius: '2px', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          {label1}
        </div>
        {data[0]?.value2 !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', fontWeight: 600 }}>
            <span style={{ width: '12px', height: '4px', borderRadius: '2px', background: '#06B6D4', boxShadow: '0 0 8px #06B6D4' }} />
            {label2}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Bar Chart Component (Gross vs Net Comparison)
export const BarChart: React.FC<{
  data: ChartDataPoint[];
  title?: string;
}> = ({ data, title }) => {
  const width = 520;
  const height = 240;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-subtle)', borderRadius: '16px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
        No sales data available.
      </div>
    );
  }

  const allValues = data.flatMap((d) => [d.value1, d.value2 || 0]);
  const maxValue = Math.max(...allValues, 100);
  const yTicks = 4;

  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.max(barGroupWidth * 0.28, 6);

  const getBar1X = (index: number) => {
    return paddingLeft + index * barGroupWidth + barGroupWidth / 2 - barWidth - 3;
  };

  const getBar2X = (index: number) => {
    return paddingLeft + index * barGroupWidth + barGroupWidth / 2 + 3;
  };

  const getY = (val: number) => {
    const safeVal = Math.max(val, 0);
    return height - paddingBottom - (safeVal / maxValue) * chartHeight;
  };

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          {title}
        </h4>
      )}
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {/* Y Axis Grid lines */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const val = (maxValue / yTicks) * i;
            const y = getY(val);
            return (
              <g key={i} style={{ opacity: 0.4 }}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="#94A3B8"
                  fontSize="10px"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  ₦{Math.round(val)}
                </text>
              </g>
            );
          })}

          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />

          {/* Bars */}
          {data.map((point, i) => {
            const bar1X = getBar1X(i);
            const bar2X = getBar2X(i);

            const y1 = getY(point.value1);
            const h1 = height - paddingBottom - y1;

            const y2 = getY(point.value2 || 0);
            const h2 = height - paddingBottom - y2;

            const labelX = paddingLeft + i * barGroupWidth + barGroupWidth / 2;

            return (
              <g key={i}>
                {/* Bar 1: Emerald Green */}
                <rect
                  x={bar1X}
                  y={y1}
                  width={barWidth}
                  height={Math.max(h1, 1)}
                  fill="#10B981"
                  rx="4"
                  style={{ transition: 'all 200ms ease' }}
                />

                {/* Bar 2: Cyber Cyan */}
                {point.value2 !== undefined && (
                  <rect
                    x={bar2X}
                    y={y2}
                    width={barWidth}
                    height={Math.max(h2, 1)}
                    fill="#06B6D4"
                    rx="4"
                    style={{ transition: 'all 200ms ease' }}
                  />
                )}

                <text
                  x={labelX}
                  y={height - paddingBottom + 20}
                  fill="#94A3B8"
                  fontSize="10px"
                  fontFamily="var(--font-heading)"
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', fontWeight: 600 }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          Gross Profit
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', fontWeight: 600 }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#06B6D4', boxShadow: '0 0 8px #06B6D4' }} />
          Net Profit
        </div>
      </div>
    </div>
  );
};

// 3. Donut Pie Chart Component
export const DonutChart: React.FC<{
  data: PieDataPoint[];
  title?: string;
}> = ({ data, title }) => {
  const width = 360;
  const height = 180;
  const radius = 60;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || !data || data.length === 0) {
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-subtle)', borderRadius: '16px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
        No expense breakdown available.
      </div>
    );
  }

  let accumulatedPercent = 0;

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <h4 style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          {title}
        </h4>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <svg viewBox="0 0 180 180" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="18" />

            {data.map((item, i) => {
              if (item.value === 0) return null;

              const percent = item.value / total;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;

              accumulatedPercent += percent;

              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="18"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'all 500ms ease' }}
                />
              );
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              TOTAL
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>
              ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Breakdown Items List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
          {data.map((item, i) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            if (item.value === 0) return null;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>₦{item.value.toFixed(0)}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>({percent.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default { LineChart, BarChart, DonutChart };

