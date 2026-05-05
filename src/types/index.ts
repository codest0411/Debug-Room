// ============================================================
// CORE DATABASE TYPES — matching Supabase schema exactly
// ============================================================

export type UIDensity = 'compact' | 'comfortable' | 'spacious';
export type FontStyle = 'mono' | 'sans' | 'serif';
export type AccountStatus = 'active' | 'banned' | 'suspended' | 'deleted' | 'pending_verification';
export type AdminRole = 'super_admin' | 'content_admin' | 'support_admin' | 'analytics_admin';
export type RoomStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'perfect';
export type ValidationType = 'exact_match' | 'contains_check' | 'regex_match' | 'output_match';
export type PersonalityType =
  | 'THE_CAFFEINE_PHANTOM'
  | 'THE_DARK_MODE_PURIST'
  | 'THE_TAB_HOARDER'
  | 'THE_GHOST_DEBUGGER'
  | 'THE_COPY_PASTE_NINJA';

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  mobile_number: string | null;
  bio: string | null;
  email: string;
  xp: number;
  level: number;
  total_rooms_completed: number;
  total_puzzles_solved: number;
  total_hints_used: number;
  total_wrong_attempts: number;
  best_escape_time_seconds: number | null;
  is_admin: boolean;
  is_super_admin: boolean;
  admin_role: AdminRole | null;
  admin_granted_at: string | null;
  admin_revoked_at: string | null;
  ban_reason: string | null;
  ban_expires_at: string | null;
  personality_type: PersonalityType | null;
  personality_score: number | null;
  theme_preference: string;
  sound_enabled: boolean;
  animations_enabled: boolean;
  ui_density: UIDensity;
  font_style: FontStyle;
  account_status: AccountStatus;
  is_banned: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  language: string;
  language_icon: string;
  difficulty: number;
  difficulty_label: string;
  theme_color: string;
  environment_description: string;
  total_puzzles: number;
  unlock_requires_room_id: string | null;
  time_limit_seconds: number;
  xp_reward_completion: number;
  xp_reward_perfect: number;
  is_active: boolean;
  is_final_boss: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Puzzle {
  id: string;
  room_id: string;
  puzzle_number: number;
  title: string;
  description: string;
  story_context: string;
  broken_code: string;
  correct_solution: string;
  validation_type: ValidationType;
  validation_value: string;
  language: string;
  hint_1: string;
  hint_2: string;
  hint_3: string;
  xp_reward: number;
  xp_penalty_wrong: number;
  xp_penalty_hint: number;
  time_limit_seconds: number;
  difficulty: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'speed' | 'skill' | 'secret' | 'social';
  unlock_condition_type: string;
  unlock_condition_value: number;
  unlock_condition_room_id: string | null;
  xp_reward: number;
  is_secret: boolean;
  is_active: boolean;
  created_at: string;
}

export interface RoomProgress {
  id: string;
  user_id: string;
  room_id: string;
  status: RoomStatus;
  puzzles_solved: number;
  puzzles_total: number;
  wrong_attempts: number;
  hints_used: number;
  xp_earned: number;
  time_started_at: string | null;
  time_completed_at: string | null;
  time_taken_seconds: number | null;
  is_perfect: boolean;
  created_at: string;
  updated_at: string;
}

export interface PuzzleAttempt {
  id: string;
  user_id: string;
  puzzle_id: string;
  room_id: string;
  attempt_code: string;
  is_correct: boolean;
  hints_used_count: number;
  time_taken_seconds: number | null;
  xp_earned: number;
  attempt_number: number;
  attempted_at: string;
}

export interface HintUsage {
  id: string;
  user_id: string;
  puzzle_id: string;
  hint_number: 1 | 2 | 3;
  xp_deducted: number;
  used_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  xp_awarded: number;
  achievement?: Achievement;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_xp: number;
  rooms_completed: number;
  puzzles_solved: number;
  perfect_rooms: number;
  achievements_count: number;
  best_total_time_seconds: number | null;
  rank: number | null;
  weekly_xp: number;
  weekly_rank: number | null;
  last_updated_at: string;
  user?: Pick<User, 'username' | 'display_name' | 'avatar_url' | 'personality_type'>;
}

export interface RoomSession {
  id: string;
  user_id: string;
  room_id: string;
  session_token: string;
  current_puzzle_index: number;
  time_remaining_seconds: number;
  is_active: boolean;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  end_reason: 'completed' | 'timeout' | 'abandoned' | 'error' | null;
}

export interface PersonalityResult {
  id: string;
  user_id: string;
  q1_answer: string;
  q2_answer: string;
  q3_answer: string;
  q4_answer: string;
  q5_answer: string;
  q6_answer: string;
  q7_answer: string;
  q8_answer: string;
  q9_answer: string;
  q10_answer: string;
  personality_type: PersonalityType;
  personality_score: number;
  personality_description: string;
  taken_at: string;
  retaken_count: number;
}

// ============================================================
// GAME STATE TYPES
// ============================================================

export interface GameState {
  currentRoom: Room | null;
  currentPuzzleIndex: number;
  sessionToken: string | null;
  timeRemaining: number;
  hintsUsed: number;
  wrongAttempts: number;
  userCode: string;
  isSubmitting: boolean;
  showHint: 0 | 1 | 2 | 3;
}

export interface PersonalityQuestion {
  id: number;
  question: string;
  options: { label: string; value: string }[];
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 1,
    question: "What's your body count?",
    options: [
      { label: 'GitHub repos (triple digits)', value: 'repos' },
      { label: 'Stack Overflow answers', value: 'stackoverflow' },
      { label: "0, I'm new here", value: 'newbie' },
      { label: 'Classified', value: 'classified' },
    ],
  },
  {
    id: 2,
    question: 'Daily coffee intake?',
    options: [
      { label: '0 — Pure willpower', value: 'zero' },
      { label: '1–2 — Civilized', value: 'moderate' },
      { label: '3–5 — Committed', value: 'heavy' },
      { label: 'I AM coffee', value: 'is_coffee' },
    ],
  },
  {
    id: 3,
    question: 'Dark mode or...?',
    options: [
      { label: 'Dark Mode — obviously', value: 'dark' },
      { label: 'Light Mode — I enjoy pain', value: 'light' },
      { label: 'System default — chaos agent', value: 'system' },
      { label: 'Custom theme — I have opinions', value: 'custom' },
    ],
  },
  {
    id: 4,
    question: 'Browser tabs right now?',
    options: [
      { label: '<10 — Functional human', value: 'minimal' },
      { label: '10–30 — Productive chaos', value: 'moderate' },
      { label: '30–50 — Controlled disaster', value: 'heavy' },
      { label: 'My RAM screams daily', value: 'extreme' },
    ],
  },
  {
    id: 5,
    question: 'Stack Overflow copy-paste rate?',
    options: [
      { label: '0% — I write everything myself', value: 'zero' },
      { label: '25% — Occasionally inspired', value: 'light' },
      { label: '75% — Efficiently inspired', value: 'heavy' },
      { label: 'I wrote Stack Overflow', value: 'wrote_it' },
    ],
  },
  {
    id: 6,
    question: 'Last time you touched grass?',
    options: [
      { label: 'Today — I have a life', value: 'today' },
      { label: 'This week — somewhat healthy', value: 'week' },
      { label: "2020 — that was the year", value: '2020' },
      { label: 'What is grass?', value: 'unknown' },
    ],
  },
  {
    id: 7,
    question: 'Sleep schedule?',
    options: [
      { label: 'Before midnight — disciplined', value: 'early' },
      { label: 'After 2AM — typical', value: 'late' },
      { label: 'Sleep is a myth', value: 'myth' },
      { label: 'I run on caffeine and spite', value: 'caffeine' },
    ],
  },
  {
    id: 8,
    question: 'Times you restart before debugging?',
    options: [
      { label: '0 — I read the error message', value: 'zero' },
      { label: '1–3 — Reasonable', value: 'few' },
      { label: '5+ — Optimistic', value: 'many' },
      { label: 'Restart IS my debugger', value: 'restart' },
    ],
  },
  {
    id: 9,
    question: 'Relationship status?',
    options: [
      { label: 'Committed — to a person', value: 'person' },
      { label: 'Single — by choice', value: 'single' },
      { label: "It's complicated", value: 'complicated' },
      { label: 'Committed to code only', value: 'code' },
    ],
  },
  {
    id: 10,
    question: "How often: 'It works on my machine'?",
    options: [
      { label: 'Never — I use Docker', value: 'never' },
      { label: 'Sometimes — human', value: 'sometimes' },
      { label: 'My go-to defense', value: 'defense' },
      { label: 'Always — ship it anyway', value: 'always' },
    ],
  },
];

export const PERSONALITY_PROFILES: Record<
  PersonalityType,
  { title: string; description: string; badge: string; scoreRange: [number, number] }
> = {
  THE_CAFFEINE_PHANTOM: {
    title: 'THE CAFFEINE PHANTOM',
    description:
      'You exist in a permanent state of caffeinated hyper-focus. Your commit history runs at 3AM. Your debugging sessions are legendary. You are the void that stares back at production errors.',
    badge: '☕',
    scoreRange: [80, 100],
  },
  THE_DARK_MODE_PURIST: {
    title: 'THE DARK MODE PURIST',
    description:
      'Light mode is not just wrong — it is an act of aggression. You have dark-moded your refrigerator. Your monitor is a black hole of productivity. You are one with the darkness.',
    badge: '🌑',
    scoreRange: [60, 79],
  },
  THE_TAB_HOARDER: {
    title: 'THE TAB HOARDER',
    description:
      "RAM is just a suggestion. Each tab is a promise you haven't broken yet. You have tabs open from 2019. Your browser is a digital archaeological dig site.",
    badge: '📑',
    scoreRange: [40, 59],
  },
  THE_GHOST_DEBUGGER: {
    title: 'THE GHOST DEBUGGER',
    description:
      'console.log is your best friend, your therapist, your compass. You have never used a real debugger. You believe printf debugging is peak engineering philosophy.',
    badge: '👻',
    scoreRange: [20, 39],
  },
  THE_COPY_PASTE_NINJA: {
    title: 'THE COPY PASTE NINJA',
    description:
      'Stack Overflow built this. You are a master curator of solutions. Why reinvent the wheel when the internet exists? Your efficiency is unmatched. Your creativity is... selective.',
    badge: '🥷',
    scoreRange: [0, 19],
  },
};

// ============================================================
// ADMIN TYPES
// ============================================================

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_role: string;
  action_category: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  target_username: string | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  affected_rows: number;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failed' | 'partial';
  error_message: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  value_type: 'string' | 'integer' | 'boolean' | 'json' | 'color' | 'url';
  category: string;
  label: string;
  description: string;
  is_public: boolean;
  is_editable: boolean;
  last_updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger' | 'maintenance';
  is_active: boolean;
  is_dismissible: boolean;
  show_on_pages: string[];
  target_audience: 'all' | 'registered' | 'admins_only';
  starts_at: string;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_puzzle_id: string | null;
  report_type: 'bug_report' | 'puzzle_error' | 'cheating' | 'inappropriate_content' | 'technical_issue' | 'other';
  title: string;
  description: string;
  screenshot_url: string | null;
  status: 'open' | 'in_review' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PuzzleAnalytics {
  id: string;
  puzzle_id: string;
  room_id: string;
  total_attempts: number;
  total_solves: number;
  total_failures: number;
  solve_rate: number;
  average_attempts_to_solve: number;
  average_time_to_solve_seconds: number;
  total_hints_used: number;
  hint_1_used_count: number;
  hint_2_used_count: number;
  hint_3_used_count: number;
  fastest_solve_seconds: number | null;
  slowest_solve_seconds: number | null;
  last_updated_at: string;
  puzzle?: Puzzle;
  room?: Room;
}

export interface DashboardStats {
  total_users: number;
  active_users_last_24h: number;
  active_users_last_7d: number;
  new_users_last_7d: number;
  new_users_last_30d: number;
  total_puzzle_attempts_today: number;
  total_puzzles_solved_today: number;
  overall_solve_rate: number;
  total_xp_awarded_all_time: number;
  total_achievements_unlocked: number;
  rooms_completion_rates: { room_id: string; room_name: string; completion_rate: number }[];
  hardest_puzzles: { puzzle_id: string; title: string; room_name: string; solve_rate: number; total_attempts: number }[];
  easiest_puzzles: { puzzle_id: string; title: string; room_name: string; solve_rate: number; total_attempts: number }[];
  active_sessions_now: number;
  open_reports_count: number;
  critical_reports_count: number;
  banned_users_count: number;
  latest_signups: Partial<User>[];
  top_players: Partial<LeaderboardEntry & { username: string; avatar_url: string }>[];
  recent_audit_log: Partial<AdminAuditLog>[];
}
