'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardShell } from '@/components/DashboardShell';
import { BarChart } from '@/components/AnalyticsCharts';
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Briefcase,
  Layers,
  Sparkles,
  Percent,
  ShieldAlert,
  Zap,
} from 'lucide-react';

type PeriodFilter = 'all' | 'weekly' | 'monthly' | 'yearly';

export default function AnalyticsPage() {
  const { state, getStoreRecommendations } = useStore();
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeStore = state.stores.find((s) => s.id === state.activeStoreId);
  const storeBatches = state.batches.filter((b) => b.storeId === state.activeStoreId);

  // Date threshold helper
  const getPeriodStartDate = (filter: PeriodFilter) => {
    const now = new Date();
    switch (filter) {
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setDate(now.getDate() - 30));
      case 'yearly':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return null;
    }
  };

  const periodStart = getPeriodStartDate(period);

  // Period Calculations
  let totalRevenue = 0;
  let totalCogs = 0;
  let totalExpenses = 0;
  let completedBatchesCount = 0;
  let totalTurnaroundDays = 0;

  storeBatches.forEach((batch) => {
    const filteredSales = batch.sales.filter((s) => {
      if (!periodStart) return true;
      return new Date(s.dateSold) >= periodStart;
    });

    const filteredExpenses = batch.expenses.filter((e) => {
      if (!periodStart) return true;
      return new Date(e.dateIncurred) >= periodStart;
    });

    const batchRev = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const batchQtySold = filteredSales.reduce((sum, s) => sum + s.quantitySold, 0);
    const batchCogs = batchQtySold * batch.purchaseCostPerUnit;
    const batchExp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    totalRevenue += batchRev;
    totalCogs += batchCogs;
    totalExpenses += batchExp;

    if (batch.completedAt) {
      const compDate = new Date(batch.completedAt);
      const broughtDate = new Date(batch.dateBrought);
      if (!periodStart || compDate >= periodStart) {
        completedBatchesCount++;
        const days = Math.ceil((compDate.getTime() - broughtDate.getTime()) / (1000 * 60 * 60 * 24));
        totalTurnaroundDays += days;
      }
    }
  });

  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Turnaround metrics
  const avgTurnaround = completedBatchesCount > 0 ? (totalTurnaroundDays / completedBatchesCount).toFixed(1) : 'N/A';

  // Comparative batch profit margins
  const barChartData = storeBatches.slice(-5).map((b) => {
    const rev = b.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const cogs = b.quantitySold * b.purchaseCostPerUnit;
    const exp = b.expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      label: b.goodsName.substring(0, 15),
      value1: rev - cogs,
      value2: rev - cogs - exp,
    };
  });

  const recommendations = getStoreRecommendations();

  return (
    <DashboardShell>
      {/* Hero Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              ALGORITHMIC FINANCIAL INTELLIGENCE
            </span>
            <span className="badge badge-success">
              <Zap size={11} style={{ marginRight: '4px' }} /> LIVE TELEMETRY
            </span>
          </div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
            Financial Analytics & Margin Audit
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Multi-horizon review of capital velocity, overhead burn rate, and COGS efficiency
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-card-border)', borderRadius: '14px', padding: '4px' }}>
          {(['all', 'weekly', 'monthly', 'yearly'] as PeriodFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPeriod(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                background: period === tab ? 'rgba(8, 145, 178, 0.12)' : 'transparent',
                color: period === tab ? 'var(--color-accent)' : 'var(--color-muted)',
                border: period === tab ? '1px solid rgba(8, 145, 178, 0.3)' : '1px solid transparent',
                textTransform: 'capitalize',
                transition: 'all 200ms ease',
                cursor: 'pointer',
              }}
            >
              {tab === 'all' ? 'All-Time' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Analytics Bento Grid */}
      <div className="grid-cols-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {/* Margin Card */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              NET PROFIT MARGIN
            </span>
            <Percent size={18} style={{ color: '#10B981' }} />
          </div>
          <p className="font-mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-foreground)' }}>
            {netMargin.toFixed(1)}%
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Gross Margin: <strong style={{ color: '#10B981' }}>{grossMargin.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Operating Overhead Ratio */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              OVERHEAD RATIO
            </span>
            <Briefcase size={18} style={{ color: '#6366F1' }} />
          </div>
          <p className="font-mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-foreground)' }}>
            {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Expenses Incurred: <strong style={{ color: '#F43F5E' }}>₦{totalExpenses.toFixed(0)}</strong>
          </div>
        </div>

        {/* Turnaround Time */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SELLOUT VELOCITY
            </span>
            <Layers size={18} style={{ color: '#F59E0B' }} />
          </div>
          <p className="font-mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-foreground)' }}>
            {avgTurnaround === 'N/A' ? 'N/A' : `${avgTurnaround}d`}
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Completed Lots: <strong style={{ color: 'var(--color-muted)' }}>{completedBatchesCount}</strong>
          </div>
        </div>

        {/* Inventory Turnover Rate */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              INVENTORY TURNOVER
            </span>
            <TrendingUp size={18} style={{ color: '#06B6D4' }} />
          </div>
          <p className="font-mono" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-foreground)' }}>
            {totalCogs > 0
              ? (totalCogs / (storeBatches.reduce((s, b) => s + b.totalPurchaseCost, 0) || 1)).toFixed(2)
              : '0.00'}
            x
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            COGS Outlay: <strong style={{ color: 'var(--color-muted)' }}>₦{totalCogs.toFixed(0)}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Charts Comparison & Auditing recommendations */}
      <div className="grid-cols-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* comparative margins chart */}
        <div className="glass-card" style={{ gridColumn: 'span 2', padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                Batch Profit Margin Comparison
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                Gross vs Net profit realization across top shipment lots
              </p>
            </div>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>5 RECENT BATCHES</span>
          </div>
          <BarChart data={barChartData} />
        </div>

        {/* Revenue Leak Checker */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                Revenue Leak Alerts
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Real-time heuristic audit</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {recommendations.length > 0 ? (
              recommendations.map((rec) => {
                const isLeak = rec.type === 'leak';
                const isSuccess = rec.type === 'success';

                return (
                  <div
                    key={rec.id}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      border: isLeak
                        ? '1px solid rgba(244, 63, 94, 0.35)'
                        : isSuccess
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : '1px solid rgba(245, 158, 11, 0.35)',
                      background: isLeak
                        ? 'rgba(244, 63, 94, 0.08)'
                        : isSuccess
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(245, 158, 11, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {isLeak ? (
                        <AlertTriangle size={15} style={{ color: '#F43F5E' }} />
                      ) : isSuccess ? (
                        <CheckCircle size={15} style={{ color: '#10B981' }} />
                      ) : (
                        <Lightbulb size={15} style={{ color: '#F59E0B' }} />
                      )}
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {rec.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>
                      {rec.description}
                    </p>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--color-foreground)', fontWeight: 600 }}>
                      Action: {rec.impact}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                All business operations check out cleanly. No profit leakage detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

