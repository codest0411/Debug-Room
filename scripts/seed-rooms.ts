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
  { room_number: 5, slug: 'react-shipwreck', name: 'react-shipwreck', name: 'React Shipwreck', subtitle: 'Hooked on Survival', description: 'The ship is sinking. Re-render the components to save it.', language: 'React 18', language_icon: '⚛️', difficulty: 4, difficulty_label: 'Hard', theme_color: '#61DAFB', environment_description: 'The hooks are tangled. The state is inconsistent.', time_limit_seconds: 3000, order_index: 5 },
  { room_number: 6, slug: 'python-dungeon', name: 'Python Dungeon', subtitle: 'Indentation Insanity', description: 'The dungeon is full of snakes. Use indentation to survive.', language: 'Python 3', language_icon: '🐍', difficulty: 3, difficulty_label: 'Medium', theme_color: '#3776AB', environment_description: 'The whitespace is your only friend here.', time_limit_seconds: 2400, order_index: 6 },
  { room_number: 7, slug: 'node-js-harbor', name: 'Node.js Harbor', subtitle: 'Event Loop Lockdown', description: 'The harbor is blocked. Fix the events to clear the path.', language: 'Node.js', language_icon: '🚢', difficulty: 4, difficulty_label: 'Hard', theme_color: '#339933', environment_description: 'The event loop is spinning out of control.', time_limit_seconds: 3000, order_index: 7 },
  { room_number: 8, slug: 'database-depths', name: 'Database Depths', subtitle: 'Relational Ruins', description: 'The data is corrupted. Query the depths to find the truth.', language: 'SQL', language_icon: '🗄️', difficulty: 4, difficulty_label: 'Hard', theme_color: '#00758F', environment_description: 'The joins are missing. The primary key is gone.', time_limit_seconds: 3600, order_index: 8 },
  { room_number: 9, slug: 'algorithm-abyss', name: 'Algorithm Abyss', subtitle: 'Complexity Chaos', description: 'The abyss is deep. Find the most efficient path out.', language: 'DSA', language_icon: '🧮', difficulty: 5, difficulty_label: 'Extreme', theme_color: '#FF3B3B', environment_description: 'O(n^2) is not enough. You need O(log n).', time_limit_seconds: 3600, order_index: 9 },
  { room_number: 10, slug: 'the-mainframe', name: 'The Mainframe', subtitle: 'Root Access Final Battle', description: 'The final battle. Patch the entire system to escape.', language: 'Full Stack', language_icon: '💀', difficulty: 6, difficulty_label: 'Super-Admin', theme_color: '#9D4EDD', environment_description: 'This is it. The root of all evil.', time_limit_seconds: 4800, order_index: 10 },
];

const allPuzzles: Record<string, any[]> = {
  'html-island': [
    { puzzle_number: 1, title: 'The Missing Title', description: 'Add a <title> tag to the head.', story_context: 'Ghost: "Name your ship or sink with it."', broken_code: '<html>\n  <head>\n  </head>\n  <body>\n    <h1>Welcome</h1>\n  </body>\n</html>', correct_solution: '<html>\n  <head>\n    <title>HTML Island</title>\n  </head>\n  <body>\n    <h1>Welcome</h1>\n  </body>\n</html>', validation_type: 'contains_check', validation_value: '<title>HTML Island</title>', language: 'html', difficulty: 1, hint_1: 'Check the head.', hint_2: 'Use <title>.', hint_3: '<title>HTML Island</title>', order_index: 1, xp_reward: 50 },
    { puzzle_number: 2, title: 'Broken Link', description: 'Fix the href attribute.', story_context: 'Ghost: "The link is dead. Revive it."', broken_code: '<a >EXIT</a>', correct_solution: '<a href="/exit">EXIT</a>', validation_type: 'contains_check', validation_value: 'href="/exit"', language: 'html', difficulty: 1, hint_1: 'Use href.', hint_2: 'Target is "/exit".', hint_3: 'href="/exit"', order_index: 2, xp_reward: 50 },
  ],
  'css-coral-reef': [
    { puzzle_number: 1, title: 'Colorful Reef', description: 'Change the h1 color to cyan.', story_context: 'Ghost: "The reef is grey. Bring back the blue."', broken_code: 'h1 {\n  color: grey;\n}', correct_solution: 'h1 {\n  color: cyan;\n}', validation_type: 'contains_check', validation_value: 'color: cyan', language: 'css', difficulty: 2, hint_1: 'Use cyan.', hint_2: 'Set color property.', hint_3: 'color: cyan;', order_index: 1, xp_reward: 60 },
    { puzzle_number: 2, title: 'Flexbox Fish', description: 'Center the fish using display: flex.', story_context: 'Ghost: "The fish are scattered. Align them."', broken_code: '.ocean {\n}', correct_solution: '.ocean {\n  display: flex;\n  justify-content: center;\n}', validation_type: 'contains_check', validation_value: 'display: flex', language: 'css', difficulty: 2, hint_1: 'Use flex.', hint_2: 'Add justify-content.', hint_3: 'display: flex;', order_index: 2, xp_reward: 60 },
  ],
  'javascript-cave': [
    { puzzle_number: 1, title: 'Logical Light', description: 'Make the light turn on if power is true.', story_context: 'Ghost: "Darkness is a bug. Logic is the light."', broken_code: 'function toggle(power) {\n  return false;\n}', correct_solution: 'function toggle(power) {\n  return power === true;\n}', validation_type: 'contains_check', validation_value: 'return power', language: 'javascript', difficulty: 3, hint_1: 'Check power.', hint_2: 'Return the boolean.', hint_3: 'return power;', order_index: 1, xp_reward: 100 },
  ],
  'typescript-vault': [
    { puzzle_number: 1, title: 'Type Safe Key', description: 'Define the Key interface with a string id.', story_context: 'Ghost: "The vault only accepts strictly typed keys."', broken_code: 'interface Key {\n}', correct_solution: 'interface Key {\n  id: string;\n}', validation_type: 'contains_check', validation_value: 'id: string', language: 'typescript', difficulty: 3, hint_1: 'Add id.', hint_2: 'Type is string.', hint_3: 'id: string;', order_index: 1, xp_reward: 100 },
  ],
  'react-shipwreck': [
    { puzzle_number: 1, title: 'State of Emergency', description: 'Add a useState hook for health.', story_context: 'Ghost: "The ship\'s health is fluctuating. Track it."', broken_code: 'function Ship() {\n  return <div>Sinking</div>;\n}', correct_solution: 'function Ship() {\n  const [health, setHealth] = useState(100);\n  return <div>Health: {health}</div>;\n}', validation_type: 'contains_check', validation_value: 'useState', language: 'javascript', difficulty: 4, hint_1: 'Import useState.', hint_2: 'Initialize at 100.', hint_3: 'useState(100)', order_index: 1, xp_reward: 150 },
  ],
  'python-dungeon': [
    { puzzle_number: 1, title: 'Indented Path', description: 'Fix the indentation of the if block.', story_context: 'Ghost: "In this dungeon, spacing is survival."', broken_code: 'if True:\nprint("Safe")', correct_solution: 'if True:\n    print("Safe")', validation_type: 'exact_match', validation_value: 'if True:\n    print("Safe")', language: 'python', difficulty: 3, hint_1: 'Add 4 spaces.', hint_2: 'Indent the print.', hint_3: '    print', order_index: 1, xp_reward: 100 },
  ],
  'node-js-harbor': [
    { puzzle_number: 1, title: 'Async Arrival', description: 'Use async/await to fetch the ship data.', story_context: 'Ghost: "The harbor waits for no one. Be asynchronous."', broken_code: 'function getShip() {\n  return fetch("/ship");\n}', correct_solution: 'async function getShip() {\n  return await fetch("/ship");\n}', validation_type: 'contains_check', validation_value: 'async', language: 'javascript', difficulty: 4, hint_1: 'Add async.', hint_2: 'Add await.', hint_3: 'async function', order_index: 1, xp_reward: 150 },
  ],
  'database-depths': [
    { puzzle_number: 1, title: 'Primary Key Search', description: 'Select all columns where id is 7.', story_context: 'Ghost: "The database is deep. Query specifically."', broken_code: 'SELECT FROM users', correct_solution: 'SELECT * FROM users WHERE id = 7', validation_type: 'contains_check', validation_value: 'WHERE id = 7', language: 'sql', difficulty: 4, hint_1: 'Use WHERE.', hint_2: 'Check id = 7.', hint_3: 'WHERE id = 7', order_index: 1, xp_reward: 150 },
  ],
  'algorithm-abyss': [
    { puzzle_number: 1, title: 'Efficient Escape', description: 'Return true if n is even.', story_context: 'Ghost: "Efficiency is the only way out of the abyss."', broken_code: 'function isEven(n) {\n}', correct_solution: 'function isEven(n) {\n  return n % 2 === 0;\n}', validation_type: 'contains_check', validation_value: 'n % 2', language: 'javascript', difficulty: 5, hint_1: 'Use modulo.', hint_2: 'Check remainder.', hint_3: 'n % 2 === 0', order_index: 1, xp_reward: 200 },
  ],
  'the-mainframe': [
    { puzzle_number: 1, title: 'The Root Access', description: 'Combine all your knowledge to patch the kernel.', story_context: 'Ghost: "This is the end. Patch the root or be deleted."', broken_code: 'function patch() {\n}', correct_solution: 'function patch() {\n  return "KERNEL_PATCHED";\n}', validation_type: 'contains_check', validation_value: 'KERNEL_PATCHED', language: 'javascript', difficulty: 6, hint_1: 'Return the string.', hint_2: 'Value is KERNEL_PATCHED.', hint_3: '"KERNEL_PATCHED"', order_index: 1, xp_reward: 500 },
  ],
};

async function seed() {
  console.log('Seeding COMPLETE PRODUCTION data...');
  for (const room of rooms) {
    const { data, error } = await supabase.from('rooms').upsert(room, { onConflict: 'slug' }).select('id').single();
    if (error) {
      console.error(`Error seeding room ${room.name}:`, error.message);
    } else {
      console.log(`Seeded room: ${room.name}`);
      const puzzles = allPuzzles[room.slug];
      if (puzzles) {
        console.log(`Seeding ${puzzles.length} puzzles for ${room.name}...`);
        for (const puzzle of puzzles) {
          const { error: pError } = await supabase.from('puzzles').upsert({
            ...puzzle,
            room_id: data.id
          }, { onConflict: 'room_id,puzzle_number' });
          if (pError) console.error(`Error seeding puzzle ${puzzle.title}:`, pError.message);
          else console.log(`Seeded puzzle: ${puzzle.title}`);
        }
      }
    }
  }
  console.log('Done!');
}

seed();
