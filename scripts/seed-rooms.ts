import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rooms = [
  { room_number: 1, slug: 'html-island', name: 'HTML Island', subtitle: 'Structure is Everything', description: 'The foundation of the web is crumbling. Fix the structure to escape.', language: 'HTML5', language_icon: '🏝️', difficulty: 1, difficulty_label: 'Easy', theme_color: '#FFB347', environment_description: 'You wake up on a beach of static. The tags are broken.', time_limit_seconds: 1800, order_index: 1 },
  { room_number: 2, slug: 'css-coral-reef', name: 'CSS Coral Reef', subtitle: 'Cascading Colors', description: 'The colors are fading. Restore the style of the reef.', language: 'CSS3', language_icon: '🪸', difficulty: 2, difficulty_label: 'Easy', theme_color: '#00D9FF', environment_description: 'The ocean is grey. The selectors are lost in the deep.', time_limit_seconds: 1800, order_index: 2 },
  { room_number: 3, slug: 'javascript-cave', name: 'JavaScript Cave', subtitle: 'Dynamic Depths', description: 'The cave is dark. Use logic to light the way.', language: 'JS ES6+', language_icon: '⚡', difficulty: 3, difficulty_label: 'Medium', theme_color: '#FFD700', environment_description: 'The script is hanging. The callback hell is real.', time_limit_seconds: 2400, order_index: 3 },
  { room_number: 4, slug: 'typescript-vault', name: 'TypeScript Vault', subtitle: 'Strictly Typed Security', description: 'The vault is locked with types. Find the right interface.', language: 'TypeScript', language_icon: '🔷', difficulty: 3, difficulty_label: 'Medium', theme_color: '#3178C6', environment_description: 'Strict mode is on. Any is forbidden.', time_limit_seconds: 2400, order_index: 4 },
  { room_number: 5, slug: 'react-shipwreck', name: 'React Shipwreck', subtitle: 'Hooked on Survival', description: 'The ship is sinking. Re-render the components to save it.', language: 'React 18', language_icon: '⚛️', difficulty: 4, difficulty_label: 'Hard', theme_color: '#61DAFB', environment_description: 'The hooks are tangled. The state is inconsistent.', time_limit_seconds: 3000, order_index: 5 },
  { room_number: 6, slug: 'python-dungeon', name: 'Python Dungeon', subtitle: 'Indentation Insanity', description: 'The dungeon is full of snakes. Use indentation to survive.', language: 'Python 3', language_icon: '🐍', difficulty: 3, difficulty_label: 'Medium', theme_color: '#3776AB', environment_description: 'The whitespace is your only friend here.', time_limit_seconds: 2400, order_index: 6 },
  { room_number: 7, slug: 'node-js-harbor', name: 'Node.js Harbor', subtitle: 'Event Loop Lockdown', description: 'The harbor is blocked. Fix the events to clear the path.', language: 'Node.js', language_icon: '🚢', difficulty: 4, difficulty_label: 'Hard', theme_color: '#339933', environment_description: 'The event loop is spinning out of control.', time_limit_seconds: 3000, order_index: 7 },
  { room_number: 8, slug: 'database-depths', name: 'Database Depths', subtitle: 'Relational Ruins', description: 'The data is corrupted. Query the depths to find the truth.', language: 'SQL', language_icon: '🗄️', difficulty: 4, difficulty_label: 'Hard', theme_color: '#00758F', environment_description: 'The joins are missing. The primary key is gone.', time_limit_seconds: 3600, order_index: 8 },
  { room_number: 9, slug: 'algorithm-abyss', name: 'Algorithm Abyss', subtitle: 'Complexity Chaos', description: 'The abyss is deep. Find the most efficient path out.', language: 'DSA', language_icon: '🧮', difficulty: 5, difficulty_label: 'Extreme', theme_color: '#FF3B3B', environment_description: 'O(n^2) is not enough. You need O(log n).', time_limit_seconds: 3600, order_index: 9 },
  { room_number: 10, slug: 'the-mainframe', name: 'The Mainframe', subtitle: 'Root Access Final Battle', description: 'The final battle. Patch the entire system to escape.', language: 'Full Stack', language_icon: '💀', difficulty: 6, difficulty_label: 'Super-Admin', theme_color: '#9D4EDD', environment_description: 'This is it. The root of all evil.', time_limit_seconds: 4800, order_index: 10 },
];

async function seed() {
  console.log('Seeding rooms...');
  for (const room of rooms) {
    const { error } = await supabase.from('rooms').upsert(room, { onConflict: 'slug' });
    if (error) console.error(`Error seeding room ${room.name}:`, error.message);
    else console.log(`Seeded room: ${room.name}`);
  }
  console.log('Done!');
}

seed();
