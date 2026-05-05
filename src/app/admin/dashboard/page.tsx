import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/layout/AdminShell';
import DashboardClient from '@/app/admin/dashboard/DashboardClient';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Fetch all stats on the server
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
    { data: roomProgressData },
    { count: totalPuzzlesSolved },
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
    supabase.from('room_progress').select('user_id, status, puzzles_solved, puzzles_total'),
    supabase.from('puzzle_attempts').select('*', { count: 'exact', head: true }).eq('is_correct', true),
  ]);

  const smartTotalRoomsCompleted = (roomProgressData || []).filter((p: any) => 
    p.status === 'completed' || 
    p.status === 'perfect' || 
    (p.puzzles_solved >= p.puzzles_total && p.puzzles_total > 0)
  ).length;

  const totalXP = (xpData || []).reduce((sum: number, u: { xp: number }) => sum + (u.xp || 0), 0);

  const stats = {
    totalUsers: totalUsers || 0,
    activeToday: activeToday || 0,
    newThisWeek: newThisWeek || 0,
    puzzlesToday: puzzlesToday || 0,
    solvedToday: solvedToday || 0,
    totalXP,
    activeSessions: activeSessions || 0,
    openReports: openReports || 0,
    totalRoomsCompleted: smartTotalRoomsCompleted,
    totalPuzzlesSolved: totalPuzzlesSolved || 0,
  };

  const formattedHardestPuzzles = (puzzleStats || []).map((p: any) => ({
    title: p.puzzle?.title || 'Unknown',
    room_id: p.puzzle?.room_id || '',
    solve_rate: p.solve_rate || 0,
    total_attempts: p.total_attempts || 0,
  }));

  return (
    <AdminShell>
      <DashboardClient 
        initialStats={stats} 
        initialRecentUsers={recent || []} 
        initialHardestPuzzles={formattedHardestPuzzles} 
      />
    </AdminShell>
  );
}
