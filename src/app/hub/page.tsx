'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';
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

function RoomCard({
  room,
  progress,
  isNext,
  canAccess,
}: {
  room: Room;
  progress: RoomProgress | undefined;
  isNext: boolean;
  canAccess: boolean;
}) {
  const color = ROOM_COLORS[room.room_number] || 'var(--accent)';
  const isCompleted = progress?.status === 'completed' || 
    progress?.status === 'perfect' || 
    (progress && progress.puzzles_solved >= progress.puzzles_total && progress.puzzles_total > 0);
  const isInProgress = progress?.status === 'in_progress';
  const isLocked = !canAccess && !isCompleted && !isInProgress && room.room_number > 1;
  const completionPct =
    progress && progress.puzzles_total > 0
      ? Math.round((progress.puzzles_solved / progress.puzzles_total) * 100)
      : 0;

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
        boxShadow: isNext
          ? `0 0 20px ${color}44`
          : isCompleted
          ? '0 0 15px rgba(0,255,136,0.2)'
          : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Status badge */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        {isCompleted && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>✓ ESCAPED</span>}
        {isLocked && !isNext && <span className="badge badge-muted" style={{ fontSize: '0.6rem' }}>🔒 LOCKED</span>}
        {isNext && !isCompleted && <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>NEXT</span>}
        {isInProgress && <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>IN PROGRESS</span>}
        {progress?.is_perfect && <span style={{ marginLeft: 4 }}>⭐</span>}
      </div>

      {/* Room number */}
      <div
        style={{
          fontSize: '0.65rem',
          color: color,
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.15em',
          marginBottom: 8,
        }}
      >
        ROOM {String(room.room_number).padStart(2, '0')}
      </div>

      {/* Icon + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{room.language_icon}</span>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
          }}>
            {room.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{room.language}</div>
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: 12 }}>
        <DifficultyStars count={room.difficulty} />
      </div>

      {/* Progress bar */}
      {(isInProgress || isCompleted) && progress && (
        <div>
          <div className="progress-bar" style={{ height: 3 }}>
            <div className="progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {progress.puzzles_solved}/{progress.puzzles_total || room.total_puzzles || 0} puzzles
            {progress.time_taken_seconds && (
              <> · {Math.floor(progress.time_taken_seconds / 60)}m {progress.time_taken_seconds % 60}s</>
            )}
          </div>
        </div>
      )}

      {/* Hover glow overlay */}
      {isNext && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${color}11, transparent)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Link overlay */}
      {!isLocked && (
        <Link
          href={`/room/${room.slug}`}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
          }}
          aria-label={`Enter ${room.name}`}
        />
      )}
    </motion.div>
  );
}

export default function HubPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [progress, setProgress] = useState<RoomProgress[]>([]);
  const [user, setUser] = useState<{ xp: number; level: number; username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Load rooms
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (roomData) setRooms(roomData);

      // Load user + progress if authenticated
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const [{ data: userData }, { data: progressData }] = await Promise.all([
          supabase.from('users').select('xp, level, username').eq('id', authUser.id).single(),
          supabase.from('room_progress').select('*').eq('user_id', authUser.id),
        ]);
        if (userData) setUser(userData);
        if (progressData) setProgress(progressData);
      }

      setIsLoading(false);
    }

    load();
  }, []);

  const totalCompleted = progress.filter(
    (p) => p.status === 'completed' || p.status === 'perfect'
  ).length;

  const overallPct = rooms.length > 0 ? Math.round((totalCompleted / rooms.length) * 100) : 0;

  // Find next room to play
  const nextRoom = rooms.find((r) => {
    const p = progress.find((p) => p.room_id === r.id);
    return !p || p.status === 'unlocked' || p.status === 'in_progress';
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixRain />

      {/* Navbar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 40px',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(10,10,15,0.9)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--accent)',
              letterSpacing: '0.1em',
            }}
          >
            {'>'} DEBUG_ROOM
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="badge badge-success">LVL {user.level}</div>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                {user.xp.toLocaleString()} XP
              </span>
            </div>
          )}
          <Link href="/profile">
            <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              PROFILE
            </button>
          </Link>
          <Link href="/leaderboard">
            <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              LEADERBOARD
            </button>
          </Link>
          <Link href="/achievements">
            <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              ACHIEVEMENTS
            </button>
          </Link>
          <ThemePanel />
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, padding: '100px 40px 60px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48, maxWidth: 1400, margin: '0 auto 48px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '2.5rem',
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                ESCAPE ROOM HUB
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                10 broken environments. 60+ real puzzles. One way out.
              </p>
            </div>

            {/* Overall progress */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '16px 24px',
                minWidth: 220,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  OVERALL PROGRESS
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                  {totalCompleted}/10
                </span>
              </div>
              <div className="progress-bar" style={{ height: 6, marginBottom: 8 }}>
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {overallPct}% ESCAPED
              </div>
            </div>
          </div>
        </motion.div>

        {/* Room Grid */}
        {isLoading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 20,
              maxWidth: 1400,
              margin: '0 auto',
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 180, borderRadius: 12 }}
              />
            ))}
          </div>
        ) : (
          <div
            className="room-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 20,
              maxWidth: 1400,
              margin: '0 auto',
            }}
          >
            {rooms.map((room, i) => {
              const roomProgress = progress.find((p) => p.room_id === room.id);
              const isNext = nextRoom?.id === room.id;
              
              const prevRoom = i > 0 ? rooms[i-1] : null;
              const prevProgress = prevRoom ? progress.find(p => p.room_id === prevRoom.id) : null;
              const isPrevCompleted = i === 0 || 
                (prevProgress?.status === 'completed' || 
                 prevProgress?.status === 'perfect' ||
                 (prevProgress && prevProgress.puzzles_solved >= prevProgress.puzzles_total && prevProgress.puzzles_total > 0));

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RoomCard 
                    room={room} 
                    progress={roomProgress} 
                    isNext={isNext} 
                    canAccess={isPrevCompleted || isNext}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Auth prompt if not logged in */}
        {!user && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              textAlign: 'center',
              marginTop: 48,
              padding: 32,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              maxWidth: 500,
              margin: '48px auto 0',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>
              Sign in to save progress
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
              Create a free account to track your progress, earn XP, and compete on the leaderboard.
            </p>
            <Link href="/auth/signup">
              <button className="btn-primary">CREATE ACCOUNT</button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
