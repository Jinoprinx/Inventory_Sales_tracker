'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardShell } from '@/components/DashboardShell';
import { BatchDetailsModal } from '@/components/BatchDetailsModal';
import { InventoryBatch } from '@/types/store';
import { Tag, ArrowRight, ShoppingCart, Search, Filter, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export default function SalesPage() {
  const { state } = useStore();
  const [mounted, setMounted] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeStore = state.stores.find((s) => s.id === state.activeStoreId);
  const storeBatches = state.batches.filter((b) => b.storeId === state.activeStoreId);

  // Compile full sales ledger
  const allSales = storeBatches
    .flatMap((b) => b.sales.map((s) => ({ ...s, goodsName: b.goodsName, category: b.category })))
    .sort((a, b) => new Date(b.dateSold).getTime() - new Date(a.dateSold).getTime());

  // Compile full expenses ledger
  const allExpenses = storeBatches
    .flatMap((b) => b.expenses.map((e) => ({ ...e, goodsName: b.goodsName, category: b.category })))
    .sort((a, b) => new Date(b.dateIncurred).getTime() - new Date(a.dateIncurred).getTime());

  const activeBatches = storeBatches.filter((b) => b.completedAt === null);

  // Total calculations
  const totalSalesRevenue = allSales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalExpensesAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Filtered lists
  const filteredSales = allSales.filter((s) =>
    s.goodsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExpenses = allExpenses.filter((e) =>
    e.goodsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell>
      {/* Hero Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
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
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              FINANCIAL AUDIT TRAIL
            </span>
            <span className="badge badge-success">
              {allSales.length} TRANSACTIONS
            </span>
          </div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
            Sales & Operational Expense Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Audit client transactions, operational outflow, and active lot sell-through velocity
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '10px 18px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#10B981', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              GROSS SALES REVENUE
            </span>
            <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-foreground)' }}>
              ₦{totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="glass-panel" style={{ padding: '10px 18px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#F43F5E', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
              LOGGED EXPENSES
            </span>
            <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-foreground)' }}>
              ₦{totalExpensesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Tab Switcher */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          animationDelay: '100ms',
        }}
      >
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('sales')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              background: activeTab === 'sales' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'sales' ? '#10B981' : '#CBD5E1',
              border: activeTab === 'sales' ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            <ShoppingCart size={14} /> Store Sales History ({allSales.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: 'var(--font-heading)',
              background: activeTab === 'expenses' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'expenses' ? '#F43F5E' : '#CBD5E1',
              border: activeTab === 'expenses' ? '1px solid rgba(244, 63, 94, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
          >
            <Tag size={14} /> Store Expenses History ({allExpenses.length})
          </button>
        </div>

        {/* Search Box */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'sales' ? 'sales' : 'expenses'}...`}
            className="form-input"
            style={{
              paddingLeft: '38px',
              height: '40px',
              fontSize: '0.82rem',
              borderRadius: '10px',
            }}
          />
        </div>
      </div>

      {/* Grid: 2 sections - Ledger Table & Active Batches Action Panel */}
      <div className="grid-cols-3">
        {/* Left/Middle: Ledger Table */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            {activeTab === 'sales' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    CLIENT TRANSACTIONS ({filteredSales.length})
                  </h3>
                  <span className="badge badge-success">INCOME LEDGER</span>
                </div>

                {filteredSales.length > 0 ? (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Goods Profile</th>
                          <th>Units Sold</th>
                          <th>Unit Sale Price</th>
                          <th>Total Gross Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSales.map((sale) => (
                          <tr key={sale.id}>
                            <td className="text-slate-300 font-mono" style={{ fontSize: '0.82rem' }}>
                              {new Date(sale.dateSold).toLocaleDateString()}
                            </td>
                            <td>
                              <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-foreground)', fontSize: '0.9rem' }}>
                                {sale.goodsName}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                                {sale.category}
                              </span>
                            </td>
                            <td className="font-mono" style={{ color: '#E2E8F0', fontWeight: 600 }}>
                              {sale.quantitySold}
                            </td>
                            <td className="font-mono" style={{ color: '#CBD5E1' }}>
                              ₦{sale.salePricePerUnit.toFixed(2)}
                            </td>
                            <td className="font-mono" style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>
                              +₦{sale.totalRevenue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    No client sales transactions recorded yet. Use the active batch action panel on the right to log sales.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    OPERATIONAL EXPENSE LOGS ({filteredExpenses.length})
                  </h3>
                  <span className="badge badge-warning" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                    COST OUTFLOW
                  </span>
                </div>

                {filteredExpenses.length > 0 ? (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date Incurred</th>
                          <th>Associated Batch</th>
                          <th>Expense Description</th>
                          <th>Amount Outflow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map((exp) => (
                          <tr key={exp.id}>
                            <td className="text-slate-300 font-mono" style={{ fontSize: '0.82rem' }}>
                              {new Date(exp.dateIncurred).toLocaleDateString()}
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--color-foreground)', fontSize: '0.9rem' }}>
                                {exp.goodsName}
                              </span>
                            </td>
                            <td style={{ color: '#CBD5E1' }}>{exp.description}</td>
                            <td className="font-mono" style={{ color: '#F43F5E', fontWeight: 700, fontSize: '0.9rem' }}>
                              -₦{exp.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    No operational expenses logged yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Batches Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#06B6D4' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ACTIVE BATCHES ({activeBatches.length})
                </h3>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>SELECT TO LOG</span>
            </div>

            {activeBatches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeBatches.map((batch) => {
                  const remaining = batch.quantityPurchased - batch.quantitySold;
                  const sellThrough = (batch.quantitySold / batch.quantityPurchased) * 100;

                  return (
                    <div
                      key={batch.id}
                      onClick={() => setSelectedBatch(batch)}
                      className="glass-panel"
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-foreground)', fontFamily: 'var(--font-heading)' }}>
                            {batch.goodsName}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                            Remaining: <strong style={{ color: '#E2E8F0' }}>{remaining}</strong> of {batch.quantityPurchased} units
                          </p>
                        </div>
                        <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 800, color: '#06B6D4' }}>
                          {sellThrough.toFixed(0)}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${sellThrough}%`,
                            background: 'linear-gradient(90deg, #10B981, #06B6D4)',
                            borderRadius: '999px',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                        <span>Brought: {new Date(batch.dateBrought).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06B6D4', fontWeight: 700 }}>
                          Log Transaction <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                No active batches. Go to the Inventory page to restock shipment lots.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch audit detail modal overlay */}
      {selectedBatch && (
        <BatchDetailsModal
          batch={selectedBatch}
          onClose={() => {
            setSelectedBatch(null);
          }}
        />
      )}
    </DashboardShell>
  );
}

