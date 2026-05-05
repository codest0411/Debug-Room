'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setIsLoading(false);
    } else {
      router.push('/hub');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
      <MatrixRain />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)', marginBottom: 8 }}>{'>'} DEBUG_ROOM</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>ACCESS TERMINAL</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>Authenticate to resume escape</p>
        </div>

        <div className="glass" style={{ borderRadius: 16, padding: 32 }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,59,59,0.1)', border: '1px solid var(--danger)', borderRadius: 8, marginBottom: 20, color: 'var(--danger)', fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
              ✗ {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'EMAIL', value: email, onChange: setEmail, type: 'email', placeholder: 'dev@company.com' },
              { label: 'PASSWORD', value: password, onChange: setPassword, type: 'password', placeholder: '••••••••' },
            ].map(({ label, value, onChange, type, placeholder }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', marginBottom: 8 }}>{label}</label>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            ))}
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: 8, opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'AUTHENTICATING...' : '⚡ ACCESS SYSTEM'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-display)' }}>REGISTER →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
