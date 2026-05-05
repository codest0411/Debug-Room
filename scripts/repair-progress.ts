import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function repair() {
  console.log('Starting Repair Sequence...');

  // 1. Update rooms table total_puzzles based on actual puzzle count
  const { data: rooms } = await supabase.from('rooms').select('id, name');
  
  for (const room of rooms || []) {
    const { count } = await supabase.from('puzzles').select('*', { count: 'exact', head: true }).eq('room_id', room.id);
    const total = count || 0;
    console.log(`Room: ${room.name} has ${total} puzzles.`);
    await supabase.from('rooms').update({ total_puzzles: total }).eq('id', room.id);

    // 2. Sync room_progress table for all users in this room
    if (total > 0) {
        const { data: progress } = await supabase.from('room_progress').select('id, puzzles_solved, status').eq('room_id', room.id);
        for (const p of progress || []) {
            const cappedSolved = Math.min(p.puzzles_solved, total);
            const isCompleted = cappedSolved >= total;
            
            await supabase.from('room_progress').update({ 
                puzzles_total: total,
                puzzles_solved: cappedSolved,
                status: isCompleted ? 'completed' : p.status
            }).eq('id', p.id);
        }
    }
  }

  console.log('Repair Complete!');
}

repair();
