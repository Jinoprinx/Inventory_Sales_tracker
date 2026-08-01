'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  Store,
  Boxes,
  DollarSign,
  TrendingUp,
  LogOut,
  Plus,
  Menu,
  X,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onAddStoreClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddStoreClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { state, setActiveStore, logoutUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Stores', href: '/stores', icon: Store },
    { name: 'Inventory Batches', href: '/inventory', icon: Boxes },
    { name: 'Sales & Expenses', href: '/sales', icon: DollarSign },
    { name: 'Analytics & Insights', href: '/analytics', icon: TrendingUp },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="btn btn-secondary"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 50,
          padding: '8px',
          display: 'none',
        }}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <style jsx>{`
        @media (max-width: 1024px) {
          button[aria-label="Toggle Sidebar"] {
            display: inline-flex !important;
          }
        }
      `}</style>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className="glass-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 45,
          width: '264px',
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          {/* Logo / Brand Title */}
          <div style={{ marginBottom: '28px', padding: '0 6px' }}>
            <Link href="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-heading)',
                      background: 'linear-gradient(135deg, var(--color-foreground) 0%, var(--color-muted) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Jinoprinx
                  </span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                </div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-accent)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Business Tracker
                </span>
              </div>
            </Link>
          </div>

          {/* Store Switcher Widget */}
          {state.currentUser && (
            <div
              className="glass-panel"
              style={{
                marginBottom: '28px',
                padding: '14px',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-card-border)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Active Store
                </label>
                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Live</span>
              </div>
              {state.stores.length > 0 ? (
                <div>
                  <select
                    value={state.activeStoreId || ''}
                    onChange={(e) => {
                      setActiveStore(e.target.value);
                      router.refresh();
                    }}
                    className="form-select"
                    style={{
                      width: '100%',
                      background: 'var(--color-card)',
                      color: 'var(--color-foreground)',
                      border: '1px solid var(--color-card-border)',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {state.stores.map((store) => (
                      <option key={store.id} value={store.id} style={{ background: '#0F172A', color: 'var(--color-foreground)' }}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onAddStoreClick) onAddStoreClick();
                    else router.push('/stores');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(16, 185, 129, 0.5)',
                    color: '#34D399',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: 'rgba(16, 185, 129, 0.08)',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} /> Create Store
                </button>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.14) 0%, rgba(6, 182, 212, 0.03) 100%)'
                      : 'transparent',
                    borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.12)' : 'none',
                    transition: 'all 180ms ease',
                    textDecoration: 'none',
                  }}
                >
                  <Icon
                    size={19}
                    style={{
                      color: isActive ? '#10B981' : 'var(--color-muted)',
                      transition: 'color 180ms ease',
                    }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        {state.currentUser && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--color-card-border)',
              background: 'var(--color-bg-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', padding: '0 4px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                  position: 'relative',
                }}
              >
                <UserIcon size={18} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', borderRadius: '50%', background: '#10B981', border: '2px solid var(--color-bg)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {state.currentUser.username}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {state.currentUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#FB7185',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                cursor: 'pointer',
                transition: 'all 180ms ease',
              }}
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;
