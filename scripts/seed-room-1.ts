import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const htmlIslandPuzzles = [
  {
    puzzle_number: 1,
    title: 'The Foundation',
    description: 'Every document needs a root. Add the opening and closing <html> tags.',
    story_context: 'Ghost: "Without a root, you are just static in the wind. Contain yourself."',
    broken_code: '<!-- Add tags here -->\n<head></head>\n<body></body>',
    correct_solution: '<html>\n<head></head>\n<body></body>\n</html>',
    validation_type: 'contains_check',
    validation_value: '<html>',
    language: 'html',
    difficulty: 1,
    hint_1: 'Use the <html> tag.',
    hint_2: 'Don\'t forget to close it with </html>.',
    hint_3: 'Wrap everything in <html>...</html>',
    order_index: 1,
    xp_reward: 30
  },
  {
    puzzle_number: 2,
    title: 'The Identity',
    description: 'A ship needs a name. Add a <title> tag inside the <head> with the text "HTML Island".',
    story_context: 'Ghost: "If you don\'t know who you are, the mainframe will decide for you."',
    broken_code: '<html>\n  <head>\n    <!-- Add title here -->\n  </head>\n</html>',
    correct_solution: '<html>\n  <head>\n    <title>HTML Island</title>\n  </head>\n</html>',
    validation_type: 'contains_check',
    validation_value: '<title>HTML Island</title>',
    language: 'html',
    difficulty: 1,
    hint_1: 'Place <title> inside <head>.',
    hint_2: 'The text must be "HTML Island".',
    hint_3: '<title>HTML Island</title>',
    order_index: 2,
    xp_reward: 30
  },
  {
    puzzle_number: 3,
    title: 'The Body Politic',
    description: 'Add the <body> tags after the <head>. Content goes there.',
    story_context: 'Ghost: "A head without a body is just a ghost. Like me. You want better."',
    broken_code: '<html>\n  <head></head>\n  <!-- Add body here -->\n</html>',
    correct_solution: '<html>\n  <head></head>\n  <body></body>\n</html>',
    validation_type: 'contains_check',
    validation_value: '<body>',
    language: 'html',
    difficulty: 1,
    hint_1: 'Use the <body> tag.',
    hint_2: 'It comes after </head>.',
    hint_3: '<body></body>',
    order_index: 3,
    xp_reward: 30
  },
  {
    puzzle_number: 4,
    title: 'The Header',
    description: 'Add an <h1> tag inside the body with the text "Welcome to the Island".',
    story_context: 'Ghost: "Make it loud. Make it clear. You are here."',
    broken_code: '<body>\n  <!-- Add H1 here -->\n</body>',
    correct_solution: '<body>\n  <h1>Welcome to the Island</h1>\n</body>',
    validation_type: 'contains_check',
    validation_value: '<h1>Welcome to the Island</h1>',
    language: 'html',
    difficulty: 2,
    hint_1: 'Use <h1>.',
    hint_2: 'Case matters for the text.',
    hint_3: '<h1>Welcome to the Island</h1>',
    order_index: 4,
    xp_reward: 50
  },
  {
    puzzle_number: 5,
    title: 'The Bridge',
    description: 'Add an anchor tag <a> that links to "/escape" with the text "CLICK TO RUN".',
    story_context: 'Ghost: "The exit is a link. But where does it lead? Only one way to find out."',
    broken_code: '<body>\n  <h1>Island</h1>\n  <!-- Add link here -->\n</body>',
    correct_solution: '<body>\n  <h1>Island</h1>\n  <a href="/escape">CLICK TO RUN</a>\n</body>',
    validation_type: 'contains_check',
    validation_value: 'href="/escape"',
    language: 'html',
    difficulty: 2,
    hint_1: 'Use <a href="...">.',
    hint_2: 'The path is "/escape".',
    hint_3: '<a href="/escape">CLICK TO RUN</a>',
    order_index: 5,
    xp_reward: 50
  },
  {
    puzzle_number: 6,
    title: 'The Eye',
    description: 'Add an <img> tag with src="portal.png" and alt="Portal".',
    story_context: 'Ghost: "Visualizing the exit is 90% of the escape."',
    broken_code: '<body>\n  <!-- Add image here -->\n</body>',
    correct_solution: '<body>\n  <img src="portal.png" alt="Portal" />\n</body>',
    validation_type: 'contains_check',
    validation_value: 'src="portal.png"',
    language: 'html',
    difficulty: 3,
    hint_1: 'Use <img>.',
    hint_2: 'Set src and alt.',
    hint_3: '<img src="portal.png" alt="Portal" />',
    order_index: 6,
    xp_reward: 75
  },
  {
    puzzle_number: 7,
    title: 'The List',
    description: 'Create an unordered list (ul) with 2 items: "Food" and "Water".',
    story_context: 'Ghost: "Inventory check. Don\'t forget the basics."',
    broken_code: '<body>\n  <!-- Add list here -->\n</body>',
    correct_solution: '<body>\n  <ul>\n    <li>Food</li>\n    <li>Water</li>\n  </ul>\n</body>',
    validation_type: 'contains_check',
    validation_value: '<li>Food</li>',
    language: 'html',
    difficulty: 3,
    hint_1: 'Use <ul> and <li>.',
    hint_2: 'Add two items.',
    hint_3: '<ul><li>Food</li><li>Water</li></ul>',
    order_index: 7,
    xp_reward: 75
  },
  {
    puzzle_number: 8,
    title: 'The Input',
    description: 'Add a text input with the placeholder "Enter Code".',
    story_context: 'Ghost: "The system needs a key. Give it what it wants."',
    broken_code: '<body>\n  <!-- Add input here -->\n</body>',
    correct_solution: '<body>\n  <input type="text" placeholder="Enter Code" />\n</body>',
    validation_type: 'contains_check',
    validation_value: 'placeholder="Enter Code"',
    language: 'html',
    difficulty: 4,
    hint_1: 'Use <input>.',
    hint_2: 'Set the placeholder attribute.',
    hint_3: 'placeholder="Enter Code"',
    order_index: 8,
    xp_reward: 100
  },
  {
    puzzle_number: 9,
    title: 'The Data Grid',
    description: 'Create a table with one row (tr) and one cell (td) containing "LOCKED".',
    story_context: 'Ghost: "Structure the chaos. Tabulate the fear."',
    broken_code: '<body>\n  <!-- Add table here -->\n</body>',
    correct_solution: '<body>\n  <table>\n    <tr>\n      <td>LOCKED</td>\n    </tr>\n  </table>\n</body>',
    validation_type: 'contains_check',
    validation_value: '<td>LOCKED</td>',
    language: 'html',
    difficulty: 4,
    hint_1: 'Use <table>, <tr>, <td>.',
    hint_2: 'One row, one cell.',
    hint_3: '<table><tr><td>LOCKED</td></tr></table>',
    order_index: 9,
    xp_reward: 100
  },
  {
    puzzle_number: 10,
    title: 'The Semantic Seal',
    description: 'Wrap your footer in a <footer> tag with the text "END OF LINE".',
    story_context: 'Ghost: "This is it. The end of the island. Seal the document and move on."',
    broken_code: '<body>\n  <!-- Add footer here -->\n</body>',
    correct_solution: '<body>\n  <footer>END OF LINE</footer>\n</body>',
    validation_type: 'contains_check',
    validation_value: '<footer>END OF LINE</footer>',
    language: 'html',
    difficulty: 5,
    hint_1: 'Use <footer>.',
    hint_2: 'Text is "END OF LINE".',
    hint_3: '<footer>END OF LINE</footer>',
    order_index: 10,
    xp_reward: 200
  }
];

async function seed() {
  console.log('Seeding 10 PUZZLES for HTML Island...');
  
  // Get room ID
  const { data: room } = await supabase.from('rooms').select('id').eq('slug', 'html-island').single();
  if (!room) {
    console.error('HTML Island room not found!');
    return;
  }

  // Clear existing puzzles for this room to avoid conflicts
  await supabase.from('puzzles').delete().eq('room_id', room.id);

  for (const puzzle of htmlIslandPuzzles) {
    const { error } = await supabase.from('puzzles').insert({
      ...puzzle,
      room_id: room.id
    });
    if (error) console.error(`Error: ${error.message}`);
    else console.log(`Seeded: ${puzzle.title}`);
  }
  console.log('Done!');
}

seed();
