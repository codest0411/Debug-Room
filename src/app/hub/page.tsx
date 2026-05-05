import { createClient } from '@/lib/supabase/server';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { HubClient } from './HubClient';

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
      supabase.from('users').select('xp, level, username').eq('id', authUser.id).single(),
      supabase.from('room_progress').select('*').eq('user_id', authUser.id),
    ]);
    userData = userRes.data;
    progressData = progressRes.data || [];
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
