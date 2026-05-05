'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';
import type { LeaderboardEntry } from '@/types';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<(LeaderboardEntry & { username: string; display_name: string | null; avatar_url: string | null; personality_type: string | null })[]>([]);
  const [tab, setTab] = useState<'all' | 'weekly'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, personality_type, xp, created_at')
        .order('xp', { ascending: false })
        .limit(100);

      if (data) {
        const mapped = data.map((u, i) => ({
          id: u.id,
          user_id: u.id,
          username: u.username,
          display_name: u.display_name,
          avatar_url: u.avatar_url,
          personality_type: u.personality_type,
          total_xp: u.xp,
          weekly_xp: u.xp, // Fallback if weekly table doesn't exist
          rank: i + 1,
        }));
        setEntries(mapped as any);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const myIndex = data.findIndex((u) => u.id === user.id);
        if (myIndex !== -1) setMyRank(myIndex + 1);
      }

      setIsLoading(false);
    }
    load();
  }, [tab]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixRain />
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.9)' }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>{'>'} DEBUG_ROOM</Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/hub"><button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>HUB</button></Link>
          <Link href="/profile"><button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>PROFILE</button></Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, padding: '120px 40px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', marginBottom: 8 }}>
            🏆 ESCAPE LEGENDS
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>The developers who escaped. Ranked by XP.</p>
          {myRank && <p style={{ color: 'var(--accent)', marginTop: 8, fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>YOUR RANK: #{myRank}</p>}
        </motion.div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'var(--surface)', borderRadius: 8, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
          {(['all', 'weekly'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#000' : 'var(--text-secondary)' }}>
              {t === 'all' ? 'ALL TIME' : 'THIS WEEK'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 64, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map((entry, i) => {
              const rank = i + 1;
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: rank <= 3 ? 'var(--surface)' : 'rgba(17,17,24,0.5)', border: `1px solid ${rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--border)'}`, borderRadius: 8, boxShadow: rank <= 3 ? `0 0 15px ${rank === 1 ? '#FFD70033' : rank === 2 ? '#C0C0C033' : '#CD7F3233'}` : 'none' }}>
                  <div style={{ width: 36, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: rank <= 3 ? ['#FFD700','#C0C0C0','#CD7F32'][rank-1] : 'var(--text-muted)' }}>
                    {MEDAL[rank] || `#${rank}`}
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--accent)', flexShrink: 0 }}>
                    {entry.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                      {entry.display_name || entry.username}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>@{entry.username}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
                        {tab === 'weekly' ? entry.weekly_xp.toLocaleString() : entry.total_xp.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>XP</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-2)', fontSize: '1rem' }}>{entry.rooms_completed}/10</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>ROOMS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-3)', fontSize: '1rem' }}>{entry.perfect_rooms}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PERFECT</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                No escapees yet. Be the first to break out.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
