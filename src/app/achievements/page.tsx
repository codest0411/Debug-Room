'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { Achievement } from '@/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: all } = await supabase.from('achievements').select('*').eq('is_active', true).order('category');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: mine } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id);
        if (mine) setUnlocked(mine.map(m => m.achievement_id));
      }

      if (all) setAchievements(all);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixRain />
      
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.9)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)', cursor: 'default', userSelect: 'none' }}>{'>'} DEBUG_ROOM</div>
        <Link href="/hub"><button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>BACK TO HUB</button></Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, padding: '100px 40px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', marginBottom: 8 }}>🏆 ACHIEVEMENTS</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Show off your coding prowess. Collect them all.</p>
          <div style={{ marginTop: 12, color: 'var(--accent)', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
            {unlocked.length} / {achievements.length} UNLOCKED
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {achievements.map((a) => {
            const isUnlocked = unlocked.includes(a.id);
            return (
              <motion.div key={a.id} whileHover={{ scale: 1.02 }} className="glass" style={{ borderRadius: 12, padding: 24, border: `1px solid ${isUnlocked ? 'var(--accent)' : 'var(--border)'}`, opacity: isUnlocked ? 1 : 0.6, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 40, filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>{a.icon}</div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 4 }}>{a.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.description}</p>
                    <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>+{a.xp_reward} XP</div>
                  </div>
                </div>
                {!isUnlocked && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#666', fontWeight: 600, letterSpacing: '0.1em' }}>LOCKED</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
