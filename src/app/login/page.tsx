'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { KeyRound, Mail, User as UserIcon, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { state, registerUser, loginUser } = useStore();
  const [isRegister, setIsRegister] = useState(false);

  // Fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (state.currentUser) {
      router.push('/');
    }
  }, [state.currentUser, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please provide an email address.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      if (isRegister) {
        if (!username.trim()) {
          setError('Please provide a username.');
          setLoading(false);
          return;
        }
        const newUser = registerUser(username.trim(), email.trim());
        if (!newUser) {
          setError('An account with this email already exists.');
          setLoading(false);
        } else {
          setLoading(false);
          router.push('/');
        }
      } else {
        const success = loginUser(email.trim());
        if (!success) {
          setError('No account found with this email. Please register first.');
          setLoading(false);
        } else {
          setLoading(false);
          router.push('/');
        }
      }
    }, 600);
  };

  // Quick Demo Access helper
  const handleQuickDemo = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const demoEmail = 'demo@jinoprinx.com';
      const exists = state.users.find((u) => u.email === demoEmail);

      if (!exists) {
        registerUser('Jinoprinx Partner', demoEmail);
      } else {
        loginUser(demoEmail);
      }
      setLoading(false);
      router.push('/');
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '25%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, rgba(6, 182, 212, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          transform: 'translate(50%, 50%)',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Glass Panel */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo Banner */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06B6D4',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
              marginBottom: '6px',
            }}
          >
            <Sparkles size={26} />
          </div>
          <h1
            style={{
              fontSize: '2.1rem',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(135deg, #38BDF8 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Jinoprinx
          </h1>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            ENTERPRISE RETAIL OPERATING SYSTEM
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#F43F5E',
              fontSize: '0.82rem',
              padding: '12px 14px',
              borderRadius: '12px',
              lineHeight: 1.4,
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label className="form-label">Business Contact Name</label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '14px',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Executive Partner"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Corporate Email</label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '14px',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. operator@jinoprinx.com"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary-glow"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #06B6D4',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
                className="animate-spin"
              />
            ) : isRegister ? (
              <>
                Create Merchant Account <ArrowRight size={16} />
              </>
            ) : (
              <>
                Enter Control Suite <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle option */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--color-muted)' }}>
            {isRegister ? 'Already have an account? ' : 'New to Jinoprinx? '}
          </span>
          <button
            onClick={() => {
              setError('');
              setIsRegister(!isRegister);
            }}
            style={{
              color: '#06B6D4',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginLeft: '4px',
            }}
          >
            {isRegister ? 'Sign In' : 'Register Corporate Email'}
          </button>
        </div>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0', fontSize: '0.72rem', color: '#475569' }}>
          <div style={{ flexGrow: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            SANDBOX ENVIRONMENT
          </span>
          <div style={{ flexGrow: 1, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* Fast Sandbox Login */}
        <button
          onClick={handleQuickDemo}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <KeyRound size={16} style={{ color: '#10B981' }} />
          Launch Quick Sandbox Demo (1-Click)
        </button>
      </div>
    </div>
  );
}

