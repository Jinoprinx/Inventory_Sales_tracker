'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardShell } from '@/components/DashboardShell';
import { BatchDetailsModal } from '@/components/BatchDetailsModal';
import { InventoryBatch } from '@/types/store';
import { Boxes, Plus, Info, Trash2, ArrowUpRight, Search, Filter, Sparkles, Box } from 'lucide-react';

export default function InventoryPage() {
  const { state, addBatch, deleteBatch } = useStore();
  const [mounted, setMounted] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form states
  const [goodsName, setGoodsName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [dateBrought, setDateBrought] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeStore = state.stores.find((s) => s.id === state.activeStoreId);
  const storeBatches = state.batches.filter((b) => b.storeId === state.activeStoreId);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set(storeBatches.map((b) => b.category));
    return ['ALL', ...Array.from(set)];
  }, [storeBatches]);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return storeBatches.filter((batch) => {
      const matchesCategory = selectedCategory === 'ALL' || batch.category === selectedCategory;
      const matchesSearch =
        batch.goodsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [storeBatches, selectedCategory, searchQuery]);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    const cost = parseFloat(purchaseCost);
    const price = parseFloat(sellingPrice);

    if (goodsName.trim() && !isNaN(qty) && !isNaN(cost) && !isNaN(price)) {
      addBatch(
        goodsName.trim(),
        category.trim() || 'General',
        qty,
        cost,
        price,
        dateBrought
      );
      setGoodsName('');
      setCategory('');
      setQuantity('');
      setPurchaseCost('');
      setSellingPrice('');
      setShowAddForm(false);
    }
  };

  return (
    <DashboardShell>
      {/* Hero Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
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
              SUPPLY CHAIN MANAGEMENT
            </span>
            <span className="badge badge-neutral">
              {storeBatches.length} BATCHES REGISTERED
            </span>
          </div>
          <h2 style={{ fontSize: '1.95rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
            Inventory Intake & Stock Ledger
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            Track shipment lots, acquisition costs, sell-through velocity, and remaining units
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary-glow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
        >
          <Plus size={16} /> Record New Batch Shipment
        </button>
      </div>

      {/* Filter Toolbar & Search */}
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
        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', marginRight: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            CATEGORY:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                background: selectedCategory === cat ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedCategory === cat ? '#10B981' : 'var(--color-muted)',
                border: selectedCategory === cat ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 200ms ease',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
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
            placeholder="Search goods name or category..."
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

      <div className="grid-cols-3">
        {/* Batches Table List */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ACTIVE & COMPLETED INVENTORY BATCHES ({filteredBatches.length})
              </h3>
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                {selectedCategory !== 'ALL' ? `FILTER: ${selectedCategory}` : 'SHOWING ALL'}
              </span>
            </div>

            {filteredBatches.length > 0 ? (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Batch Profile</th>
                      <th>Sell-Through Velocity</th>
                      <th>Capital Outlay</th>
                      <th>Target Unit Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((batch) => {
                      const remaining = batch.quantityPurchased - batch.quantitySold;
                      const isCompleted = batch.completedAt !== null;
                      const sellThrough = (batch.quantitySold / batch.quantityPurchased) * 100;

                      return (
                        <tr key={batch.id}>
                          <td>
                            <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-foreground)', fontSize: '0.9rem' }}>
                              {batch.goodsName}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                              {batch.category} • {new Date(batch.dateBrought).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-muted)' }}>
                                {batch.quantitySold}/{batch.quantityPurchased}
                              </span>
                              <div style={{ width: '64px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${sellThrough}%`,
                                    background: isCompleted
                                      ? '#10B981'
                                      : 'linear-gradient(90deg, #10B981, #06B6D4)',
                                    borderRadius: '999px',
                                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="font-mono" style={{ color: 'var(--color-muted)', fontWeight: 600 }}>
                            ₦{(batch.quantityPurchased * batch.purchaseCostPerUnit).toLocaleString()}
                          </td>
                          <td className="font-mono" style={{ color: '#10B981', fontWeight: 700 }}>
                            ₦{batch.sellingPricePerUnit}
                          </td>
                          <td>
                            <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}>
                              {isCompleted ? 'Sold out' : `${remaining} left`}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => setSelectedBatch(batch)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: 'rgba(6, 182, 212, 0.15)',
                                  border: '1px solid rgba(6, 182, 212, 0.35)',
                                  color: '#06B6D4',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                }}
                                title="Audit details, record transactions"
                              >
                                Audit <ArrowUpRight size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete this batch "${batch.goodsName}"? This will erase all its sales and expenses.`
                                    )
                                  ) {
                                    deleteBatch(batch.id);
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
                                title="Delete Batch"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  padding: '48px',
                  textAlign: 'center',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <Boxes size={40} style={{ opacity: 0.5, color: '#06B6D4' }} />
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                    No inventory batch shipments found
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                    {searchQuery || selectedCategory !== 'ALL'
                      ? 'Try clearing your filter or search query.'
                      : `Log your first goods intake batch in ${activeStore?.name} to start tracking margin.`}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-secondary"
                  style={{ marginTop: '8px', padding: '8px 16px' }}
                >
                  + Log First Shipment Batch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add Batch Form & Intake Guidance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {showAddForm && (
            <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <Sparkles size={18} style={{ color: '#06B6D4' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                  New Goods Shipment Intake
                </h3>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Goods Name</label>
                  <input
                    type="text"
                    value={goodsName}
                    onChange={(e) => setGoodsName(e.target.value)}
                    placeholder="e.g. Leather Wallet Premium"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category / Label</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Fashion, Accessories"
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Qty Purchased</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="50"
                      className="form-input font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Cost / Unit (₦)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      placeholder="10.00"
                      className="form-input font-mono"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Suggested Selling Price (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="25.00"
                    className="form-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Intake Date</label>
                  <input
                    type="date"
                    value={dateBrought}
                    onChange={(e) => setDateBrought(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-glow" style={{ flex: 2, padding: '10px' }}>
                    Log Shipment
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <Info size={22} style={{ color: '#06B6D4', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-foreground)', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                Batch-Based Inventory Ledger
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                Inventory is batch-isolated. Instead of generic aggregate stock levels, goods are recorded under a date-stamped batch containing exact unit costs and target selling prices. This allows the financial engine to isolate true COGS and net surplus calculations for every shipment sold.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Audit modal overlay */}
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

