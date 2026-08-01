'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardShell } from '@/components/DashboardShell';
import { Store, Trash2, ShoppingBag, DollarSign, Plus, CheckCircle2, Sparkles, Building2, ArrowRight } from 'lucide-react';

export default function StoresPage() {
  const { state, createStore, deleteStore, setActiveStore } = useStore();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createStore(name.trim(), description.trim());
      setName('');
      setDescription('');
      setShowAddForm(false);
    }
  };

  const getStoreSummary = (storeId: string) => {
    const storeBatches = state.batches.filter((b) => b.storeId === storeId);
    let totalRev = 0;
    let totalCogs = 0;
    let totalExp = 0;

    storeBatches.forEach((b) => {
      totalRev += b.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      totalCogs += b.quantitySold * b.purchaseCostPerUnit;
      totalExp += b.expenses.reduce((sum, e) => sum + e.amount, 0);
    });

    const netProfit = totalRev - totalCogs - totalExp;
    return {
      batchesCount: storeBatches.length,
      netProfit,
      totalRev,
    };
  };

  return (
    <DashboardShell>
      {/* Hero Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
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
              ENTERPRISE MULTI-STORE MANAGEMENT
            </span>
            <span className="badge badge-success">
              {state.stores.length} ACTIVE BRANDS
            </span>
          </div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
            Store Fronts & Retail Registry
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Configure branch locations, monitor individual store surpluses, and isolate inventory lots
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary-glow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
        >
          <Plus size={16} /> Add New Store Front
        </button>
      </div>

      <div className="grid-cols-3">
        {/* Stores Grid List */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                REGISTERED RETAIL OUTLETS ({state.stores.length})
              </h3>
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>CLICK TO ACTIVATE STORE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {state.stores.map((store) => {
                const summary = getStoreSummary(store.id);
                const isActive = state.activeStoreId === store.id;

                return (
                  <div
                    key={store.id}
                    onClick={() => setActiveStore(store.id)}
                    className="glass-card"
                    style={{
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 250ms ease',
                      border: isActive
                        ? '1px solid rgba(16, 185, 129, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
                      boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? '#10B981' : '#06B6D4',
                          }}
                        >
                          <Building2 size={22} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isActive && (
                            <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '4px 10px' }}>
                              <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> ACTIVE
                            </span>
                          )}
                          {state.stores.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    `Are you sure you want to delete "${store.name}"? This will delete all batches, sales, and expenses associated with this store.`
                                  )
                                ) {
                                  deleteStore(store.id);
                                }
                              }}
                              style={{
                                padding: '6px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                color: 'var(--color-muted)',
                                cursor: 'pointer',
                              }}
                              title="Delete Store Profile"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-foreground)', fontFamily: 'var(--font-heading)' }}>
                          {store.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                          {store.description || 'No location or description details provided.'}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted)' }}>
                        <ShoppingBag size={14} style={{ color: '#06B6D4' }} />
                        <span>{summary.batchesCount} Batches</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DollarSign size={14} style={{ color: '#10B981' }} />
                        <span style={{ fontWeight: 700, color: summary.netProfit >= 0 ? '#10B981' : '#F43F5E' }}>
                          {summary.netProfit >= 0 ? '+' : ''}₦{summary.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} Net
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create Store Profile Card & Guidance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(showAddForm || state.stores.length === 0) && (
            <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <Sparkles size={18} style={{ color: '#06B6D4' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                  New Store Profile
                </h3>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Store Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Downtown High-Street Flagship"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Description & Location</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Specializes in premium leather goods, located at Level 2..."
                    className="form-input"
                    style={{ minHeight: '90px', paddingTop: '10px', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {state.stores.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '10px' }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary-glow" style={{ flex: 2, padding: '10px' }}>
                    Initialize Store
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '22px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-foreground)', marginBottom: '10px', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Multi-Store Architecture Notes
            </h4>
            <ul style={{ fontSize: '0.8rem', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5, paddingLeft: '16px', listStyleType: 'disc' }}>
              <li>
                You can register unlimited store fronts (e.g., physical branches, online shops, or popup stores) under your operator account.
              </li>
              <li>
                Switching the active store instantly updates all dashboard metrics, inventory ledgers, and AI leak diagnostics.
              </li>
              <li>
                Deleting a store profile will permanently remove all shipment batches and transaction ledgers tied to that location.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

