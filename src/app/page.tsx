'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardShell } from '@/components/DashboardShell';
import { MetricCard } from '@/components/MetricCard';
import { LineChart, DonutChart } from '@/components/AnalyticsCharts';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { state, getStoreRecommendations } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeStore = state.stores.find((s) => s.id === state.activeStoreId);
  const storeBatches = state.batches.filter((b) => b.storeId === state.activeStoreId);

  // Calculations
  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalCostOfGoodsSold = 0;
  let completedCount = 0;
  let totalTurnaroundDays = 0;

  storeBatches.forEach((batch) => {
    const batchRev = batch.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const batchExp = batch.expenses.reduce((sum, e) => sum + e.amount, 0);
    const batchCogs = batch.quantitySold * batch.purchaseCostPerUnit;

    totalRevenue += batchRev;
    totalExpenses += batchExp;
    totalCostOfGoodsSold += batchCogs;

    if (batch.completedAt) {
      completedCount++;
      const dateBrought = new Date(batch.dateBrought);
      const completedDate = new Date(batch.completedAt);
      const days = Math.ceil((completedDate.getTime() - dateBrought.getTime()) / (1000 * 60 * 60 * 24));
      totalTurnaroundDays += days;
    }
  });

  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const netProfit = grossProfit - totalExpenses;
  const averageTurnaround = completedCount > 0 ? (totalTurnaroundDays / completedCount).toFixed(1) : 'N/A';

  // Format charts data
  const salesHistory = storeBatches
    .flatMap((b) => b.sales.map((s) => ({ ...s, goodsName: b.goodsName })))
    .sort((a, b) => new Date(a.dateSold).getTime() - new Date(b.dateSold).getTime());

  const chartData = salesHistory.slice(-7).map((s) => ({
    label: new Date(s.dateSold).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value1: s.totalRevenue,
    value2: s.totalRevenue - s.quantitySold * (storeBatches.find(b => b.id === s.batchId)?.purchaseCostPerUnit || 0),
  }));

  // Expense distribution pie data
  const expenseCategories: { [key: string]: number } = {};
  storeBatches.flatMap((b) => b.expenses).forEach((e) => {
    const desc = e.description.toLowerCase();
    let category = 'Logistics / Shipping';
    if (desc.includes('wrap') || desc.includes('box') || desc.includes('pack')) {
      category = 'Packaging';
    } else if (desc.includes('ad') || desc.includes('market') || desc.includes('promo')) {
      category = 'Marketing / Ads';
    } else if (desc.includes('rent') || desc.includes('storage') || desc.includes('warehouse')) {
      category = 'Storage & Rent';
    } else if (desc.includes('tax') || desc.includes('duty') || desc.includes('fee')) {
      category = 'Fees & Customs';
    }
    expenseCategories[category] = (expenseCategories[category] || 0) + e.amount;
  });

  const colors = ['#10B981', '#06B6D4', '#6366F1', '#F59E0B', '#EF4444'];
  const pieData = Object.keys(expenseCategories).map((key, i) => ({
    label: key,
    value: expenseCategories[key],
    color: colors[i % colors.length],
  }));

  const recommendations = getStoreRecommendations().slice(0, 3);

  return (
    <DashboardShell>
      {/* Hero Executive Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
              EXECUTIVE INTELLIGENCE CENTER
            </span>
            <span className="badge badge-success">
              <Zap size={11} style={{ marginRight: '4px' }} /> LIVE TELEMETRY
            </span>
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', letterSpacing: '-0.03em' }}>
            {activeStore ? activeStore.name : 'Business Hub'} Dashboard
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Real-time capital flow, batch velocity analysis & profit leak detection • Operator: <strong style={{ color: '#E2E8F0' }}>{state.currentUser?.username}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/inventory" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            + Restock Inventory
          </Link>
          <Link href="/sales" className="btn btn-primary-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Record Transaction <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid-cols-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <MetricCard
          title="Net Profit Surplus"
          value={`₦${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          highlight="success"
          subtext={`Gross: ₦${grossProfit.toFixed(0)}`}
          trend={{ value: `${((netProfit / (totalRevenue || 1)) * 100).toFixed(1)}% margin`, type: netProfit >= 0 ? 'positive' : 'negative' }}
        />
        <MetricCard
          title="Gross Revenue Flow"
          value={`₦${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          highlight="primary"
          subtext={`COGS: ₦${totalCostOfGoodsSold.toFixed(0)}`}
        />
        <MetricCard
          title="Operational Expenses"
          value={`₦${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Briefcase}
          highlight="accent"
          subtext={`${storeBatches.flatMap((b) => b.expenses).length} expense entries logged`}
        />
        <MetricCard
          title="Average Turnaround"
          value={averageTurnaround === 'N/A' ? 'N/A' : `${averageTurnaround} days`}
          icon={Layers}
          highlight="none"
          subtext={`Based on ${completedCount} completed batches`}
        />
      </div>

      {/* Grid: Charts Section */}
      <div className="grid-cols-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* Line Chart Card */}
        <div className="glass-card" style={{ gridColumn: 'span 2', padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                Revenue & Net Profit Velocity
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Historical transaction trajectory across batches</p>
            </div>
            <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>LIVE AUDIT</span>
          </div>
          <LineChart data={chartData} label1="Revenue Flow" label2="Profit Margin" />
        </div>

        {/* Donut Card */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                Expense Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Outflow by cost category</p>
            </div>
          </div>
          <DonutChart data={pieData} />
        </div>
      </div>

      {/* AI Recommendations & Optimization Insights */}
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.9) 0%, rgba(15, 23, 42, 0.75) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          animationDelay: '300ms',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06B6D4' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                AI Profit Optimization & Leak Diagnostics
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                Automated heuristic audit of active stock and margin health
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> AUDIT STATUS: ACTIVE
          </span>
        </div>

        <div className="grid-cols-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => {
              const isLeak = rec.type === 'leak';
              const isSuccess = rec.type === 'success';
              return (
                <div
                  key={rec.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 300ms ease',
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isLeak ? (
                        <AlertTriangle size={18} style={{ color: '#F43F5E' }} />
                      ) : isSuccess ? (
                        <CheckCircle size={18} style={{ color: '#10B981' }} />
                      ) : (
                        <Lightbulb size={18} style={{ color: '#F59E0B' }} />
                      )}
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {rec.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {rec.description}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                    <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      RECOMMENDATION ACTION
                    </p>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-foreground)', marginTop: '3px' }}>
                      {rec.impact}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 3', padding: '36px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              No revenue leaks detected. Your business metrics look healthy!
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

