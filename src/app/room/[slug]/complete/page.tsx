'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Room, RoomProgress } from '@/types';

export default function RoomCompletePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [prog, setProg] = useState<RoomProgress | null>(null);
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 1,
    })));

    async function load() {
      const supabase = createClient();
      const { data: roomData } = await supabase.from('rooms').select('*').eq('slug', slug).single();
      if (roomData) setRoom(roomData);
      const { data: { user } } = await supabase.auth.getUser();
      if (user && roomData) {
        const { data: p } = await supabase.from('room_progress').select('*').eq('user_id', user.id).eq('room_id', roomData.id).single();
        if (p) setProg(p);
      }
    }
    load();
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
      {/* Particles */}
      {particles.map((p, i) => (
        <motion.div key={i} initial={{ x: `${p.x}vw`, y: '110vh', opacity: 1 }}
          animate={{ y: '-10vh', opacity: 0 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeOut' }}
          style={{ position: 'fixed', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', pointerEvents: 'none' }} />
      ))}

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', maxWidth: 600 }}>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 3 }} style={{ fontSize: 80, marginBottom: 24 }}>
          🔓
        </motion.div>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontFamily: 'var(--font-display)', letterSpacing: '0.3em', marginBottom: 16 }}>
          ESCAPE SEQUENCE INITIATED
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: 12 }}>
          {room?.name} ESCAPED
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
          {prog?.is_perfect ? '⭐ PERFECT ESCAPE — No wrong answers!' : `You solved it in ${prog?.time_taken_seconds ? `${Math.floor(prog.time_taken_seconds / 60)}m ${prog.time_taken_seconds % 60}s` : 'record time'}.`}
        </p>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'XP Earned', value: `+${prog?.xp_earned || 0}`, color: 'var(--accent)' },
            { label: 'Puzzles', value: `${prog?.puzzles_solved || 0}/${prog?.puzzles_total || 0}`, color: 'var(--accent-2)' },
            { label: 'Hints Used', value: prog?.hints_used || 0, color: 'var(--accent-3)' },
            { label: 'Wrong Tries', value: prog?.wrong_attempts || 0, color: prog?.wrong_attempts === 0 ? 'var(--accent)' : 'var(--danger)' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/hub"><button className="btn-primary" style={{ padding: '12px 32px' }}>NEXT ROOM →</button></Link>
          <Link href="/leaderboard"><button className="btn-ghost" style={{ padding: '12px 32px' }}>VIEW LEADERBOARD</button></Link>
        </div>
      </motion.div>
    </div>
  );
}
