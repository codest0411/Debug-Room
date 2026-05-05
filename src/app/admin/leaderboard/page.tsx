import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/layout/AdminShell';

export default async function AdminLeaderboardPage() {
  const supabase = await createClient();

  const { data: leaders } = await supabase
    .from('users')
    .select('username, email, xp, level, created_at')
    .order('xp', { ascending: false })
    .limit(50);

  return (
    <AdminShell>
      <div style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', marginBottom: 8 }}>Global Leaderboard</h1>
          <p style={{ fontSize: '0.875rem', color: '#888' }}>Real-time player rankings based on total XP earned.</p>
        </div>

        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1A1A1A', borderBottom: '1px solid #2A2A2A' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rank</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Player</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>XP</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {(leaders || []).map((user, i) => (
                <tr key={user.email} style={{ borderBottom: '1px solid #111', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 700, color: i < 3 ? '#00FF88' : '#333', fontFamily: 'monospace' }}>
                    #{(i + 1).toString().padStart(2, '0')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#F0F0F0' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#00FF88', fontWeight: 700, fontFamily: 'monospace' }}>
                    {user.xp.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#FFF', fontFamily: 'monospace' }}>
                    Lvl {user.level || 1}
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
