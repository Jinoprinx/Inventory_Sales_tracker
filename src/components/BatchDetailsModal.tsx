'use client';

import React, { useState } from 'react';
import { InventoryBatch } from '@/types/store';
import { useStore } from '@/context/StoreContext';
import { X, DollarSign, Tag, TrendingUp, Calendar, Activity, Sparkles, Box } from 'lucide-react';

interface BatchDetailsModalProps {
  batch: InventoryBatch;
  onClose: () => void;
}

export const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({ batch, onClose }) => {
  const { recordSale, recordExpense } = useStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'sales' | 'expenses' | 'action'>('summary');

  const [saleQty, setSaleQty] = useState('');
  const [salePrice, setSalePrice] = useState(batch.sellingPricePerUnit.toString());
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleError, setSaleError] = useState('');
  const [saleSuccess, setSaleSuccess] = useState(false);

  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expError, setExpError] = useState('');
  const [expSuccess, setExpSuccess] = useState(false);

  const remainingQty = batch.quantityPurchased - batch.quantitySold;
  const isCompleted = batch.completedAt !== null;

  const dateBrought = new Date(batch.dateBrought);
  const dateEnd = batch.completedAt ? new Date(batch.completedAt) : new Date();
  const turnaroundDays = Math.ceil((dateEnd.getTime() - dateBrought.getTime()) / (1000 * 60 * 60 * 24));

  const totalRevenue = batch.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const costOfGoodsSold = batch.quantitySold * batch.purchaseCostPerUnit;
  const grossProfit = totalRevenue - costOfGoodsSold;
  const totalExpenses = batch.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const handleLogSale = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError('');
    setSaleSuccess(false);

    const qty = parseInt(saleQty);
    const price = parseFloat(salePrice);

    if (isNaN(qty) || qty <= 0) {
      setSaleError('Please enter a valid quantity.');
      return;
    }
    if (qty > remainingQty) {
      setSaleError(`Cannot sell more than remaining stock (${remainingQty} units).`);
      return;
    }
    if (isNaN(price) || price <= 0) {
      setSaleError('Please enter a valid sale price.');
      return;
    }

    const sale = recordSale(batch.id, qty, price, saleDate);
    if (sale) {
      setSaleSuccess(true);
      setSaleQty('');
      setTimeout(() => {
        setSaleSuccess(false);
        setActiveTab('summary');
      }, 1000);
    } else {
      setSaleError('Failed to record sale.');
    }
  };

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');
    setExpSuccess(false);

    const amt = parseFloat(expAmount);

    if (!expDesc.trim()) {
      setExpError('Please enter a valid description.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setExpError('Please enter a valid expense amount.');
      return;
    }

    const expense = recordExpense(batch.id, expDesc, amt, expDate);
    if (expense) {
      setExpSuccess(true);
      setExpDesc('');
      setExpAmount('');
      setTimeout(() => {
        setExpSuccess(false);
        setActiveTab('summary');
      }, 1000);
    } else {
      setExpError('Failed to record expense.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      <div
        className="glass-modal animate-fade-in"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 65,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(2, 6, 23, 0.6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                BATCH RECORD PROFILE
              </span>
              <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}>
                {isCompleted ? 'Completed (Sold Out)' : `Active (${remainingQty} left)`}
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
              {batch.goodsName}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
              Category: <strong style={{ color: 'var(--color-muted)' }}>{batch.category}</strong> • Purchased:{' '}
              {new Date(batch.dateBrought).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(2, 6, 23, 0.35)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              flex: 1,
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              color: activeTab === 'summary' ? '#10B981' : 'var(--color-muted)',
              borderBottom: activeTab === 'summary' ? '2px solid #10B981' : '2px solid transparent',
              background: activeTab === 'summary' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              transition: 'all 200ms ease',
            }}
          >
            Financial Summary
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            style={{
              flex: 1,
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              color: activeTab === 'sales' ? '#10B981' : 'var(--color-muted)',
              borderBottom: activeTab === 'sales' ? '2px solid #10B981' : '2px solid transparent',
              background: activeTab === 'sales' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              transition: 'all 200ms ease',
            }}
          >
            Sales Logs ({batch.sales.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              flex: 1,
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              color: activeTab === 'expenses' ? '#10B981' : 'var(--color-muted)',
              borderBottom: activeTab === 'expenses' ? '2px solid #10B981' : '2px solid transparent',
              background: activeTab === 'expenses' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              transition: 'all 200ms ease',
            }}
          >
            Expenses ({batch.expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('action')}
            style={{
              flex: 1,
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              color: activeTab === 'action' ? '#06B6D4' : 'var(--color-muted)',
              borderBottom: activeTab === 'action' ? '2px solid #06B6D4' : '2px solid transparent',
              background: activeTab === 'action' ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
              transition: 'all 200ms ease',
            }}
          >
            + Add Transaction
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Velocity Ribbon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <Calendar size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Turnaround Velocity
                  </p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
                    {isCompleted ? `Completed in ${turnaroundDays} days` : `Currently active for ${turnaroundDays} days`}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>Sell-Through</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    {((batch.quantitySold / batch.quantityPurchased) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Grid KPI Boxes */}
              <div className="grid-cols-4">
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Purchased</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-foreground)' }}>{batch.quantityPurchased}</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Sold</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10B981' }}>{batch.quantitySold}</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Remaining</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>{remainingQty}</span>
                </div>
                <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Unit Cost</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#06B6D4' }}>₦{batch.purchaseCostPerUnit}</span>
                </div>
              </div>

              {/* Financial Audit Statement Card */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  Financial Audit Ledger
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                    <span>Gross Sales Revenue ({batch.quantitySold} units):</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>₦{totalRevenue.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                    <span>(-) Cost of Goods Sold (COGS):</span>
                    <span>-₦{costOfGoodsSold.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-foreground)', fontWeight: 700 }}>
                    <span>Gross Operating Profit:</span>
                    <span style={{ color: '#06B6D4' }}>₦{grossProfit.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
                    <span>(-) Total Batch Expenses:</span>
                    <span>-₦{totalExpenses.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--color-foreground)' }}>Net Surplus Profit:</span>
                    <span style={{ color: netProfit >= 0 ? '#10B981' : '#F43F5E' }}>
                      ₦{netProfit.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                    <span>Net Margin Rate:</span>
                    <span style={{ fontWeight: 700 }}>{netMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SALES LOGS */}
          {activeTab === 'sales' && (
            <div>
              {batch.sales.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date Sold</th>
                        <th>Qty Sold</th>
                        <th>Sale Price</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.sales.map((sale) => (
                        <tr key={sale.id}>
                          <td style={{ fontFamily: 'var(--font-body)', color: 'var(--color-muted)' }}>
                            {new Date(sale.dateSold).toLocaleDateString()}
                          </td>
                          <td className="font-mono" style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>{sale.quantitySold}</td>
                          <td className="font-mono" style={{ color: 'var(--color-muted)' }}>₦{sale.salePricePerUnit.toFixed(2)}</td>
                          <td className="font-mono" style={{ color: '#10B981', fontWeight: 700 }}>
                            +₦{sale.totalRevenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px', color: 'var(--color-muted)' }}>
                  No sales logged for this batch yet. Use the "+ Add Transaction" tab to log sales.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPENSE LOGS */}
          {activeTab === 'expenses' && (
            <div>
              {batch.expenses.length > 0 ? (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date Incurred</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td style={{ color: 'var(--color-muted)' }}>
                            {new Date(expense.dateIncurred).toLocaleDateString()}
                          </td>
                          <td style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{expense.description}</td>
                          <td className="font-mono" style={{ color: '#F43F5E', fontWeight: 700 }}>
                            -₦{expense.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px', color: 'var(--color-muted)' }}>
                  No expenses registered for this batch. Use the "+ Add Transaction" tab to log expenses.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADD TRANSACTIONS */}
          {activeTab === 'action' && (
            <div className="grid-cols-2">
              {/* Log Sale Form */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <DollarSign size={20} style={{ color: '#10B981' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                    Log Goods Sold
                  </h4>
                </div>

                {isCompleted ? (
                  <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#34D399', fontSize: '0.85rem' }}>
                    This inventory batch is fully completed! All units have been sold.
                  </div>
                ) : (
                  <form onSubmit={handleLogSale} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {saleError && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', fontSize: '0.8rem' }}>{saleError}</div>}
                    {saleSuccess && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: '0.8rem' }}>Sale entry logged successfully!</div>}

                    <div>
                      <label className="form-label">Quantity Sold (Max {remainingQty})</label>
                      <input
                        type="number"
                        min="1"
                        max={remainingQty}
                        value={saleQty}
                        onChange={(e) => setSaleQty(e.target.value)}
                        placeholder="e.g. 5"
                        className="form-input font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Sale Price Per Unit (₦)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        className="form-input font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Date Sold</label>
                      <input
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary-glow" style={{ width: '100%', padding: '11px', marginTop: '4px' }}>
                      <Sparkles size={16} /> Record Sale Entry
                    </button>
                  </form>
                )}
              </div>

              {/* Log Expense Form */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Tag size={20} style={{ color: '#F43F5E' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                    Log Batch Expense
                  </h4>
                </div>

                <form onSubmit={handleLogExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {expError && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185', fontSize: '0.8rem' }}>{expError}</div>}
                  {expSuccess && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontSize: '0.8rem' }}>Expense logged successfully!</div>}

                  <div>
                    <label className="form-label">Expense Description</label>
                    <input
                      type="text"
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="e.g. Courier Transport, Packaging"
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Amount Incurred (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="form-input font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Date Incurred</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-accent-glow" style={{ width: '100%', padding: '11px', marginTop: '4px' }}>
                    Record Expense Entry
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BatchDetailsModal;

