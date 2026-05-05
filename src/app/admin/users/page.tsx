'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const supabase = createClient();

  async function loadUsers() {
    setIsLoading(true);
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }
    const { data } = await query.limit(50);
    if (data) setUsers(data as User[]);
    setIsLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function toggleAdmin(user: User) {
    if (!confirm(`Toggle admin status for ${user.username}?`)) return;
    const { error } = await supabase.from('users').update({ is_admin: !user.is_admin }).eq('id', user.id);
    if (error) alert(error.message);
    else loadUsers();
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>User Management</h1>
            <p style={{ fontSize: '0.75rem', color: '#555' }}>Manage platform users, permissions, and status.</p>
          </div>
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: '#161616', border: '1px solid #2A2A2A', padding: '8px 16px', borderRadius: 6, color: '#F0F0F0', fontSize: '0.8rem', width: 300 }}
          />
        </div>

        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Email', 'Level/XP', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1A1A1A', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} style={{ padding: 12 }}><div className="skeleton" style={{ height: 24, borderRadius: 4 }} /></td></tr>
                ))
              ) : users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#F0F0F0', fontWeight: 500 }}>{user.username}</div>
                    <div style={{ fontSize: '0.65rem', color: '#555' }}>ID: {user.id.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#888' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#00FF88', fontFamily: 'monospace' }}>Lvl {user.level}</div>
                    <div style={{ fontSize: '0.7rem', color: '#555' }}>{user.xp} XP</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: user.is_admin ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', color: user.is_admin ? '#00FF88' : '#666', border: user.is_admin ? '1px solid rgba(0,255,136,0.2)' : '1px solid #222' }}>
                      {user.is_admin ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggleAdmin(user)} style={{ background: 'none', border: 'none', color: '#00D9FF', cursor: 'pointer', fontSize: '0.75rem' }}>
                      {user.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
