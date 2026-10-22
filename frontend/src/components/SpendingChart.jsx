import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { formatDisplayDate } from '../utils/date';

export const SpendingChart = ({ expenses = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Aggregate expenses by date and sort chronologically
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const map = new Map();
    expenses.forEach((item) => {
      const dateKey = item.date || 'Undated';
      const amt = Number(item.amount) || 0;
      map.set(dateKey, (map.get(dateKey) || 0) + amt);
    });

    const sortedEntries = Array.from(map.entries()).sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return sortedEntries.map(([date, total]) => ({
      date,
      total,
      label: formatDisplayDate(date),
    }));
  }, [expenses]);

  if (chartData.length === 0) {
    return (
      <div className="card" style={{ marginTop: '1.75rem' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h3 className="section-title">Spending Over Time</h3>
            <p className="section-subtitle">Chronological trend of your recorded expenditures</p>
          </div>
        </div>
        <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
          <div className="empty-state-icon">
            <TrendingUp size={26} />
          </div>
          <h4 className="empty-state-title">No spending trend available</h4>
          <p className="empty-state-text">
            Start recording your daily expenses to visualize spending patterns and track expenditures over time.
          </p>
        </div>
      </div>
    );
  }

  // Calculate scales for SVG rendering
  const width = 800;
  const height = 260;
  const paddingX = 60;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...chartData.map((d) => d.total), 100);
  const minVal = 0;

  // Generate points
  const points = chartData.map((d, index) => {
    const x =
      chartData.length === 1
        ? width / 2
        : paddingX + (index / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.total - minVal) / (maxVal - minVal)) * chartHeight;
    return { ...d, x, y };
  });

  // Construct SVG path for line and area
  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
          paddingTop + chartHeight
        } Z`
      : '';

  // Generate 4 horizontal gridlines
  const gridLines = [0, 0.33, 0.66, 1].map((ratio) => {
    const value = minVal + ratio * (maxVal - minVal);
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { y, value: formatINR(value) };
  });

  return (
    <div className="card" style={{ marginTop: '1.75rem' }}>
      <div className="section-header">
        <div>
          <h3 className="section-title">Spending Over Time</h3>
          <p className="section-subtitle">
            Timeline of {chartData.length} unique {chartData.length === 1 ? 'date' : 'dates'} with recorded expenditures
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
          <span>Expense Volume (₹)</span>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '550px', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Spending trend line chart"
        >
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y labels */}
          {gridLines.map((gl, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={gl.y}
                x2={width - paddingX}
                y2={gl.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={gl.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                {gl.value}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#spendingGradient)" />}

          {/* Main trend line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.date === pt.date ? 6 : 4}
                fill="#ffffff"
                stroke="#059669"
                strokeWidth={hoveredPoint?.date === pt.date ? 3 : 2}
                style={{ cursor: 'pointer', transition: 'all 150ms ease' }}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* X Axis Label */}
              <text
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                fontWeight="500"
              >
                {chartData.length > 8 && idx % Math.ceil(chartData.length / 8) !== 0 ? '' : pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{hoveredPoint.label}</div>
            <div style={{ color: '#34d399', fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>
              {formatINR(hoveredPoint.total)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingChart;
