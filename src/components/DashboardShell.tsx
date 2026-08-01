'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Sidebar } from '@/components/Sidebar';
import { Store as StoreIcon, Plus, Search, Bell, ShieldCheck, Sparkles } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { state, createStore } = useStore();
  const [mounted, setMounted] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreDesc, setNewStoreDesc] = useState('');
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !state.currentUser) {
      router.push('/login');
    }
  }, [mounted, state.currentUser, router]);

  const handleCreateInitialStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStoreName.trim()) {
      createStore(newStoreName.trim(), newStoreDesc.trim());
      setNewStoreName('');
      setNewStoreDesc('');
      setShowAddStoreModal(false);
    }
  };

  if (!mounted || !state.currentUser) {
    return (
      <div className="ambient-mesh-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10B981',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-muted)', letterSpacing: '0.1em' }}>
            INITIALIZING JINOPRINX ENGINE...
          </p>
        </div>
      </div>
    );
  }

  const hasNoStores = state.stores.length === 0;
  const isOnStoresPage = pathname === '/stores';
  const activeStore = state.stores.find((s) => s.id === state.activeStoreId);

  if (hasNoStores && !isOnStoresPage) {
    return (
      <div className="ambient-mesh-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '36px 32px', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34D399',
              margin: '0 auto 20px',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
            }}
          >
            <StoreIcon size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)', marginBottom: '8px' }}>
            Initialize Your First Store Profile
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '28px' }}>
            To track inventory batches, sales margins, and operational KPIs, configure your store profile below.
          </p>
          <form onSubmit={handleCreateInitialStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <label className="form-label">Store Profile Name</label>
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="e.g. Flagship Retail Branch, Lagos Distribution"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">Operational Description (Optional)</label>
              <textarea
                value={newStoreDesc}
                onChange={(e) => setNewStoreDesc(e.target.value)}
                placeholder="e.g. Primary warehouse for high-demand consumer electronics and accessories"
                className="form-textarea"
                style={{ minHeight: '80px', resize: 'none' }}
              />
            </div>
            <button type="submit" className="btn btn-primary-glow" style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '0.95rem' }}>
              <Sparkles size={18} /> Create Store Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="ambient-mesh-bg" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Glass Sidebar */}
      <Sidebar onAddStoreClick={() => setShowAddStoreModal(true)} />

      {/* Main Container with offset for fixed sidebar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: '264px' }} className="main-wrapper-responsive">
        <style jsx>{`
          @media (max-width: 1024px) {
            .main-wrapper-responsive {
              padding-left: 0 !important;
            }
          }
        `}</style>

        {/* Luxury Frosted Glass Header */}
        <header className="glass-header" style={{ height: '72px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            {/* Store Breadcrumb Badge */}
            {activeStore && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} className="animate-pulse-glow" />
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
                  <span className="hidden-mobile">ACTIVE STORE: </span><strong style={{ color: 'var(--color-foreground)' }}>{activeStore.name.toUpperCase()}</strong>
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setShowAddStoreModal(true)}
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: '0.78rem' }}
            >
              <Plus size={15} /> <span className="hidden-mobile">New Store Profile</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, padding: '32px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Glass Add Store Modal */}
      {showAddStoreModal && (
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
            onClick={() => setShowAddStoreModal(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(2, 6, 23, 0.82)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          />
          <div
            className="glass-modal animate-fade-in"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              padding: '32px',
              zIndex: 65,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                }}
              >
                <StoreIcon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}>
                  Create New Store Profile
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                  Add a new location or brand under your BusinessTracker account
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateInitialStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. Mainland Retail Center"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Operational Description</label>
                <textarea
                  value={newStoreDesc}
                  onChange={(e) => setNewStoreDesc(e.target.value)}
                  placeholder="Details about stock capacity, address, or branch manager..."
                  className="form-textarea"
                  style={{ minHeight: '80px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-glow" style={{ padding: '9px 20px' }}>
                  <Sparkles size={16} /> Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardShell;
