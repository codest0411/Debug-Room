'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemePanel } from '@/components/theme/ThemePanel';
import type { Room, RoomProgress } from '@/types';

const ROOM_COLORS: Record<number, string> = {
  1: '#FFB347', 2: '#00D9FF', 3: '#FFD700', 4: '#3178C6',
  5: '#61DAFB', 6: '#3776AB', 7: '#339933', 8: '#00758F',
  9: '#FF3B3B', 10: '#9D4EDD',
};

function DifficultyStars({ count, max = 6 }: { count: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < count ? '#FFD700' : 'var(--text-muted)', fontSize: '0.7rem' }}>★</span>
      ))}
    </div>
  );
}

function RoomCard({ room, progress, isNext, canAccess }: any) {
  const color = ROOM_COLORS[room.room_number] || 'var(--accent)';
  const isCompleted = progress?.status === 'completed' || progress?.status === 'perfect' || (progress && progress.puzzles_solved >= progress.puzzles_total && progress.puzzles_total > 0);
  const isInProgress = progress?.status === 'in_progress';
  const isLocked = !canAccess && !isCompleted && !isInProgress && room.room_number > 1;
  const completionPct = progress && progress.puzzles_total > 0 ? Math.round((progress.puzzles_solved / progress.puzzles_total) * 100) : 0;

  return (
    <motion.div
      whileHover={!isLocked ? { y: -6, scale: 1.02 } : {}}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isNext ? color : isCompleted ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked && !isNext ? 0.5 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        {isCompleted && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>✓ ESCAPED</span>}
        {isLocked && !isNext && <span className="badge badge-muted" style={{ fontSize: '0.6rem' }}>🔒 LOCKED</span>}
        {isNext && !isCompleted && <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>NEXT</span>}
      </div>
      <div style={{ fontSize: '0.65rem', color, fontFamily: 'var(--font-display)', marginBottom: 8 }}>ROOM {String(room.room_number).padStart(2, '0')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{room.language_icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{room.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{room.language}</div>
        </div>
      </div>
      <DifficultyStars count={room.difficulty} />
      {!isLocked && <Link href={`/room/${room.slug}`} style={{ position: 'absolute', inset: 0, borderRadius: 12 }} />}
    </motion.div>
  );
}

export function HubClient({ initialRooms, initialProgress, initialUser }: any) {
  const totalCompleted = initialProgress.filter((p: any) => p.status === 'completed' || p.status === 'perfect').length;
  const overallPct = initialRooms.length > 0 ? Math.round((totalCompleted / initialRooms.length) * 100) : 0;

  const nextRoom = initialRooms.find((r: any) => {
    const p = initialProgress.find((p: any) => p.room_id === r.id);
    return !p || p.status === 'unlocked' || p.status === 'in_progress';
  });

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '100px 40px 60px' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.9)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>{'>'} DEBUG_ROOM</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {initialUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="badge badge-success">LVL {initialUser.level || 1}</div>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                {initialUser.xp.toLocaleString()} XP
              </span>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="btn-ghost" style={{ fontSize: '0.75rem' }}>SIGN IN</button>
            </Link>
          )}
          <Link href="/profile"><button className="btn-ghost" style={{ fontSize: '0.75rem' }}>PROFILE</button></Link>
          <Link href="/leaderboard"><button className="btn-ghost" style={{ fontSize: '0.75rem' }}>LEADERBOARD</button></Link>
          <ThemePanel />
        </div>
      </nav>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: 8 }}>ESCAPE ROOM HUB</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 48 }}>10 broken environments. 60+ real puzzles. One way out.</p>

        <div className="room-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {initialRooms.map((room: any, i: number) => {
            const progress = initialProgress.find((p: any) => p.room_id === room.id);
            const isNext = nextRoom?.id === room.id;
            return <RoomCard key={room.id} room={room} progress={progress} isNext={isNext} canAccess={i === 0 || isNext} />;
          })}
        </div>

        {!initialUser && (
          <div style={{ textAlign: 'center', marginTop: 64, padding: 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, maxWidth: 500, margin: '64px auto 0' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Sign in to save progress</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>Track your progress, earn XP, and compete on the leaderboard.</p>
            <Link href="/auth/signup"><button className="btn-primary">CREATE ACCOUNT</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
