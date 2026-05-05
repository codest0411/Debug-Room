'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { loginAdmin } from './actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D', padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '0.7rem', color: '#00FF88', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'monospace' }}>
            THE DEBUG ROOM
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', marginBottom: 4 }}>Admin Console</h1>
          <p style={{ fontSize: '0.8rem', color: '#555' }}>Authorized personnel only</p>
        </div>

        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, padding: 28 }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 4, marginBottom: 20, color: '#FF4444', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>Email Address</label>
              <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                style={{ width: '100%', padding: '10px 12px', background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 4, color: '#F0F0F0', fontSize: '0.875rem', outline: 'none', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                style={{ width: '100%', padding: '10px 12px', background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 4, color: '#F0F0F0', fontSize: '0.875rem', outline: 'none', fontFamily: 'monospace' }} />
            </div>

            <button type="submit" disabled={isLoading}
              style={{ padding: '10px', background: isLoading ? '#1E1E1E' : '#00FF88', color: isLoading ? '#888' : '#000', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: '0.875rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s', marginTop: 4 }}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.7rem', color: '#333' }}>
          All admin actions are logged and audited
        </div>
      </motion.div>
    </div>
  );
}
