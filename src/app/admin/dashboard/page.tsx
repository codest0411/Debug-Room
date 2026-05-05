'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AdminShell } from '@/components/admin/layout/AdminShell';

function StatCard({ label, value, delta, color = '#00FF88' }: { label: string; value: string | number; delta?: string; color?: string }) {
  return (
    <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, padding: '16px 20px' }}>
      <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: 8, fontWeight: 500, letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
      {delta && <div style={{ fontSize: '0.7rem', color: delta.startsWith('+') ? '#00CC66' : '#FF4444', marginTop: 6 }}>{delta} vs yesterday</div>}
    </div>
  );
}

interface DashStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  puzzlesToday: number;
  solvedToday: number;
  totalXP: number;
  activeSessions: number;
  openReports: number;
  totalRoomsCompleted: number;
  totalPuzzlesSolved: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<{ username: string; email: string; created_at: string; xp: number }[]>([]);
  const [hardestPuzzles, setHardestPuzzles] = useState<{ title: string; room_id: string; solve_rate: number; total_attempts: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [
        { count: totalUsers },
        { count: activeToday },
        { count: newThisWeek },
        { count: puzzlesToday },
        { count: solvedToday },
        { count: activeSessions },
        { count: openReports },
        { data: xpData },
        { data: recent },
        { data: puzzleStats },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('last_active_at', `${today}T00:00:00`),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('puzzle_attempts').select('*', { count: 'exact', head: true }).gte('attempted_at', `${today}T00:00:00`),
        supabase.from('puzzle_attempts').select('*', { count: 'exact', head: true }).gte('attempted_at', `${today}T00:00:00`).eq('is_correct', true),
        supabase.from('room_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('users').select('xp'),
        supabase.from('users').select('username, email, created_at, xp').order('created_at', { ascending: false }).limit(5),
        supabase.from('puzzle_analytics').select('*, puzzle:puzzle_id(title, room_id)').order('solve_rate', { ascending: true }).limit(5),
      ]);

      const totalXP = (xpData || []).reduce((sum: number, u: { xp: number }) => sum + (u.xp || 0), 0);

      setStats({
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        newThisWeek: newThisWeek || 0,
        puzzlesToday: puzzlesToday || 0,
        solvedToday: solvedToday || 0,
        totalXP,
        activeSessions: activeSessions || 0,
        openReports: openReports || 0,
        totalRoomsCompleted: 0,
        totalPuzzlesSolved: 0,
      });

      setRecentUsers((recent || []) as { username: string; email: string; created_at: string; xp: number }[]);
      setHardestPuzzles((puzzleStats || []).map((p: Record<string, unknown>) => ({
        title: (p.puzzle as Record<string, unknown>)?.title as string || 'Unknown',
        room_id: (p.puzzle as Record<string, unknown>)?.room_id as string || '',
        solve_rate: p.solve_rate as number,
        total_attempts: p.total_attempts as number,
      })));
      setIsLoading(false);
    }
    load();

    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminShell>
      <div style={{ maxWidth: 1400 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>Dashboard</h1>
            <div style={{ fontSize: '0.75rem', color: '#555' }}>Live platform overview · Auto-refreshes every 60s</div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#00FF88', fontFamily: 'monospace' }}>● LIVE</div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 6 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard label="Total Users" value={(stats?.totalUsers || 0).toLocaleString()} color="#F0F0F0" />
              <StatCard label="Active Today" value={(stats?.activeToday || 0).toLocaleString()} color="#00FF88" />
              <StatCard label="New This Week" value={(stats?.newThisWeek || 0).toLocaleString()} color="#0099FF" />
              <StatCard label="Puzzles Today" value={(stats?.puzzlesToday || 0).toLocaleString()} color="#FFB800" />
              <StatCard label="Solved Today" value={(stats?.solvedToday || 0).toLocaleString()} color="#00CC66" />
              <StatCard label="Total XP" value={(stats?.totalXP || 0).toLocaleString()} color="#9D4EDD" />
              <StatCard label="Active Sessions" value={stats?.activeSessions || 0} color="#00D9FF" />
              <StatCard label="Open Reports" value={stats?.openReports || 0} color={stats?.openReports ? '#FF4444' : '#00CC66'} />
            </div>

            {/* Bottom panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Recent signups */}
              <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #1E1E1E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#F0F0F0' }}>Recent Signups</span>
                  <a href="/admin/users" style={{ fontSize: '0.7rem', color: '#00FF88', textDecoration: 'none' }}>View All →</a>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Username', 'Email', 'XP', 'Joined'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1A1A1A', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #111' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A1A')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#F0F0F0', fontFamily: 'monospace' }}>{u.username}</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.75rem', color: '#888' }}>{u.email}</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#00FF88', fontFamily: 'monospace' }}>{u.xp}</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.7rem', color: '#555' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {!recentUsers.length && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>No users yet</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Hardest puzzles */}
              <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #1E1E1E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#F0F0F0' }}>Hardest Puzzles</span>
                  <a href="/admin/analytics" style={{ fontSize: '0.7rem', color: '#00FF88', textDecoration: 'none' }}>Analytics →</a>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Puzzle', 'Solve Rate', 'Attempts'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1A1A1A', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hardestPuzzles.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #111' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A1A')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#F0F0F0' }}>{p.title}</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: p.solve_rate < 30 ? '#FF4444' : p.solve_rate < 60 ? '#FFB800' : '#00CC66', fontFamily: 'monospace' }}>{p.solve_rate.toFixed(1)}%</td>
                        <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#888', fontFamily: 'monospace' }}>{p.total_attempts}</td>
                      </tr>
                    ))}
                    {!hardestPuzzles.length && <tr><td colSpan={3} style={{ padding: 20, textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>No puzzle data yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
