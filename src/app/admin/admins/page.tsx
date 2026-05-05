'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminShell } from '@/components/admin/layout/AdminShell';

export default function AdminListPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  async function loadAdmins() {
    setIsLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
      .order('admin_granted_at', { ascending: false });
    
    if (data) setAdmins(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <AdminShell>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>Administrative Personnel</h1>
          <p style={{ fontSize: '0.75rem', color: '#555' }}>Manage accounts with access to the Admin Console.</p>
        </div>

        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Admin', 'Role', 'Access Granted', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, textTransform: 'uppercase', background: '#1A1A1A', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#F0F0F0' }}>{admin.username}</div>
                    <div style={{ fontSize: '0.7rem', color: '#555' }}>{admin.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#00FF88', background: 'rgba(0,255,136,0.1)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(0,255,136,0.2)' }}>
                      {admin.admin_role || 'SUPER_ADMIN'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#888' }}>
                    {admin.admin_granted_at ? new Date(admin.admin_granted_at).toLocaleDateString() : 'Initial Setup'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#00FF88' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88' }} /> ACTIVE
                    </div>
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
