'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MatrixRain } from '@/components/effects/MatrixRain';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';
import { ProfileEditModal } from './ProfileEditModal';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (data) {
        const userWithStats = data as User;
        
        // Fetch real-time unique counts
        const [
          { data: solvedPuzzles },
          { count: uniqueRooms }
        ] = await Promise.all([
          supabase.from('puzzle_attempts').select('puzzle_id').eq('user_id', authUser.id).eq('is_correct', true),
          supabase.from('room_progress').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id).eq('status', 'completed')
        ]);

        const uniquePuzzleCount = new Set((solvedPuzzles || []).map(p => p.puzzle_id)).size;

        setUser({
          ...userWithStats,
          total_puzzles_solved: uniquePuzzleCount,
          total_rooms_completed: uniqueRooms || 0
        });
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse-neon" style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>LOADING PROFILE...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixRain />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid var(--border)', background: 'rgba(10,10,15,0.9)' }}>
        <Link href="/hub" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: '0.8rem' }}>
          ← BACK TO HUB
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setIsEditModalOpen(true)} className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>EDIT PROFILE</button>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>LOGOUT</button>
        </div>
      </nav>

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        padding: '120px 40px 60px', 
        maxWidth: 1200, 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="glass" 
          style={{ 
            width: '100%',
            borderRadius: 24, 
            padding: 60, 
            border: '1px solid var(--accent)', 
            boxShadow: '0 0 60px var(--accent-dim)',
            background: 'rgba(10,10,15,0.8)'
          }}
        >
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Avatar / Level Ring */}
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-dim)' }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 48 }}>{user.personality_type?.includes('NINJA') ? '🥷' : '💻'}</div>
                )}
              </div>
              <div className="badge badge-success" style={{ 
                position: 'absolute', 
                bottom: -5, 
                right: -5, 
                zIndex: 10, 
                padding: '4px 10px',
                fontSize: '0.7rem',
                boxShadow: '0 0 15px var(--accent-dim)',
                border: '1px solid var(--accent)'
              }}>
                LVL {user.level || 1}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>{user.display_name || user.username}</h1>
              <div style={{ color: 'var(--accent-2)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: 20 }}>
                {user.personality_type ? user.personality_type.replace(/_/g, ' ') : 'UNCLASSIFIED DEVELOPER'}
              </div>
              
              <div className="xp-bar" style={{ width: '100%', maxWidth: 400 }}>
                <div className="xp-fill" style={{ width: `${((user.xp || 0) % 1000) / 10}%` }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>{user.xp || 0} TOTAL XP · {1000 - ((user.xp || 0) % 1000)} XP TO NEXT LEVEL</div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '40px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { label: 'ROOMS CLEARED', value: user.total_rooms_completed || 0 },
              { label: 'PUZZLES SOLVED', value: user.total_puzzles_solved || 0 },
              { label: 'WRONG ATTEMPTS', value: user.total_wrong_attempts || 0 },
              { label: 'HINTS USED', value: user.total_hints_used || 0 },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{stat.label}</div>
              </div>
            ))}
          </div>

        </motion.div>
      </div>

      <ProfileEditModal 
        user={user} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
