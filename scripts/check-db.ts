import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: rooms } = await supabase.from('rooms').select('name, slug, id');
  console.log('Rooms:', rooms);
  
  const { data: puzzles } = await supabase.from('puzzles').select('title, room_id');
  console.log('Total Puzzles:', puzzles?.length);
  puzzles?.forEach(p => console.log(`- ${p.title} (Room ID: ${p.room_id})`));
}

check();
