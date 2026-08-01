'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  highlight?: 'primary' | 'accent' | 'success' | 'none';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  highlight = 'none',
}) => {
  const getGlowBorder = () => {
    switch (highlight) {
      case 'primary':
      case 'success':
        return 'borderLeft: "4px solid #10B981"';
      case 'accent':
        return 'borderLeft: "4px solid #06B6D4"';
      default:
        return '';
    }
  };

  const getIconContainerStyle = () => {
    switch (highlight) {
      case 'primary':
      case 'success':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#10B981',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
        };
      case 'accent':
        return {
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          color: '#06B6D4',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
        };
      default:
        return {
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#6366F1',
        };
    }
  };

  const getTrendBadgeClass = () => {
    if (!trend) return 'badge-neutral';
    if (trend.type === 'positive') return 'badge badge-success';
    if (trend.type === 'negative') return 'badge badge-danger';
    return 'badge badge-neutral';
  };

  return (
    <div
      className="metric-card animate-fade-in"
      style={{
        borderLeft:
          highlight === 'primary' || highlight === 'success'
            ? '4px solid #10B981'
            : highlight === 'accent'
            ? '4px solid #06B6D4'
            : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            {title}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '1.95rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-foreground)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            {value}
          </span>
        </div>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms ease',
            ...getIconContainerStyle(),
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      {(subtext || trend) && (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {trend && (
            <span className={getTrendBadgeClass()} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {trend.value}
            </span>
          )}
          {subtext && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)', fontWeight: 500 }}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default MetricCard;

