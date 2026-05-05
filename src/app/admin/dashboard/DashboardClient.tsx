'use client';

import { motion } from 'framer-motion';

function StatCard({ label, value, color = '#00FF88' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, padding: '16px 20px' }}>
      <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: 8, fontWeight: 500, letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

interface Props {
  initialStats: any;
  initialRecentUsers: any[];
  initialHardestPuzzles: any[];
}

export default function DashboardClient({ initialStats, initialRecentUsers, initialHardestPuzzles }: Props) {
  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F0F0F0', marginBottom: 4 }}>Dashboard</h1>
          <div style={{ fontSize: '0.75rem', color: '#555' }}>Platform overview · Server-side synchronized</div>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#00FF88', fontFamily: 'monospace' }}>● CONNECTED</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Users" value={initialStats.totalUsers.toLocaleString()} color="#F0F0F0" />
        <StatCard label="Active Today" value={initialStats.activeToday.toLocaleString()} color="#00FF88" />
        <StatCard label="New This Week" value={initialStats.newThisWeek.toLocaleString()} color="#0099FF" />
        <StatCard label="Puzzles Today" value={initialStats.puzzlesToday.toLocaleString()} color="#FFB800" />
        <StatCard label="Solved Today" value={initialStats.solvedToday.toLocaleString()} color="#00CC66" />
        <StatCard label="Total XP" value={initialStats.totalXP.toLocaleString()} color="#9D4EDD" />
        <StatCard label="Active Sessions" value={initialStats.activeSessions} color="#00D9FF" />
        <StatCard label="Open Reports" value={initialStats.openReports} color={initialStats.openReports ? '#FF4444' : '#00CC66'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1E1E1E' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#F0F0F0' }}>Recent Signups</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1A1A1A' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555' }}>USERNAME</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555' }}>XP</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555' }}>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {initialRecentUsers.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#F0F0F0' }}>{u.username}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#00FF88' }}>{u.xp}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.7rem', color: '#555' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1E1E1E' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#F0F0F0' }}>Hardest Puzzles</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1A1A1A' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555' }}>PUZZLE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.65rem', color: '#555' }}>SOLVE RATE</th>
              </tr>
            </thead>
            <tbody>
              {initialHardestPuzzles.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#F0F0F0' }}>{p.title}</td>
                  <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#FFB800' }}>{p.solve_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
