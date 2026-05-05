import { createClient } from '@/lib/supabase/server';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { HubClient } from './HubClient';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true });

export default async function HubPage() {
  const supabase = await createClient();

  // Load rooms and user progress in parallel on the server
  const [
    { data: rooms },
    { data: { user: authUser } }
  ] = await Promise.all([
    supabase.from('rooms').select('*').order('room_number'),
    supabase.auth.getUser()
  ]);

  let userData = null;
  let progressData = [];

  if (authUser) {
    const [userRes, progressRes] = await Promise.all([
      supabase.from('users').select('xp, level, username, total_rooms_completed').eq('id', authUser.id).single(),
      supabase.from('room_progress').select('*').eq('user_id', authUser.id),
    ]);
    userData = userRes.data;
    progressData = progressRes.data || [];

    // Auto-sync rooms completed count if mismatch found
    const actualCompleted = progressData.filter(p => 
      p.status === 'completed' || 
      p.status === 'perfect' || 
      (p.puzzles_solved >= p.puzzles_total && p.puzzles_total > 0)
    ).length;
    if (userData && userData.total_rooms_completed !== actualCompleted) {
      await supabase.from('users').update({ 
        total_rooms_completed: actualCompleted,
        last_active_at: new Date().toISOString()
      }).eq('id', authUser.id);
      userData.total_rooms_completed = actualCompleted;
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <MatrixRain />
      <HubClient 
        initialRooms={rooms || []} 
        initialProgress={progressData} 
        initialUser={userData} 
      />
    </div>
  );
}
