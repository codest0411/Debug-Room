-- ============================================================
-- THE DEBUG ROOM — MAIN SCHEMA
-- Safe to run multiple times (idempotent)
-- ============================================================
SET check_function_bodies = false;

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP EXISTING POLICIES (idempotent cleanup)
-- ============================================================
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;



-- ============================================================
-- DROP EXISTING FUNCTIONS
-- ============================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_xp(INT,INT,INT,BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS public.complete_puzzle(UUID,UUID,INT,INT,INT,TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_and_unlock_achievements(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_rank(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.unlock_room_for_user(UUID,UUID) CASCADE;
DROP FUNCTION IF EXISTS public.start_room_session(UUID,UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_maintenance_mode() CASCADE;
DROP FUNCTION IF EXISTS public.setup_first_super_admin(TEXT) CASCADE;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 300),
  email TEXT UNIQUE NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
  total_rooms_completed INTEGER NOT NULL DEFAULT 0,
  total_puzzles_solved INTEGER NOT NULL DEFAULT 0,
  total_hints_used INTEGER NOT NULL DEFAULT 0,
  total_wrong_attempts INTEGER NOT NULL DEFAULT 0,
  best_escape_time_seconds INTEGER,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  admin_role TEXT CHECK (admin_role IN ('super_admin','content_admin','support_admin','analytics_admin')),
  admin_granted_at TIMESTAMPTZ,
  admin_granted_by UUID REFERENCES public.users(id),
  admin_revoked_at TIMESTAMPTZ,
  admin_revoked_by UUID REFERENCES public.users(id),
  personality_type TEXT,
  personality_score INTEGER CHECK (personality_score BETWEEN 0 AND 100),
  theme_preference TEXT NOT NULL DEFAULT 'dark_hacker',
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  animations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ui_density TEXT NOT NULL DEFAULT 'comfortable' CHECK (ui_density IN ('compact','comfortable','spacious')),
  font_style TEXT NOT NULL DEFAULT 'mono' CHECK (font_style IN ('mono','sans','serif')),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  banned_at TIMESTAMPTZ,
  banned_by UUID REFERENCES public.users(id),
  ban_reason TEXT,
  ban_expires_at TIMESTAMPTZ,
  account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active','banned','suspended','deleted','pending_verification')),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,20}$')
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number INTEGER UNIQUE NOT NULL CHECK (room_number BETWEEN 1 AND 10),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  language TEXT NOT NULL,
  language_icon TEXT NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 6),
  difficulty_label TEXT NOT NULL,
  theme_color TEXT NOT NULL,
  environment_description TEXT NOT NULL,
  total_puzzles INTEGER NOT NULL DEFAULT 0,
  unlock_requires_room_id UUID REFERENCES public.rooms(id),
  time_limit_seconds INTEGER NOT NULL DEFAULT 1800,
  xp_reward_completion INTEGER NOT NULL DEFAULT 200,
  xp_reward_perfect INTEGER NOT NULL DEFAULT 500,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_final_boss BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.puzzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  puzzle_number INTEGER NOT NULL CHECK (puzzle_number BETWEEN 1 AND 10),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story_context TEXT NOT NULL,
  broken_code TEXT NOT NULL,
  correct_solution TEXT NOT NULL,
  validation_type TEXT NOT NULL CHECK (validation_type IN ('exact_match','contains_check','regex_match','output_match')),
  validation_value TEXT NOT NULL,
  language TEXT NOT NULL,
  hint_1 TEXT NOT NULL,
  hint_2 TEXT NOT NULL,
  hint_3 TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  xp_penalty_wrong INTEGER NOT NULL DEFAULT 5,
  xp_penalty_hint INTEGER NOT NULL DEFAULT 25,
  time_limit_seconds INTEGER NOT NULL DEFAULT 300,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 6),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, puzzle_number)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('progress','speed','skill','secret','social')),
  unlock_condition_type TEXT NOT NULL CHECK (unlock_condition_type IN (
    'rooms_completed','puzzles_solved','xp_earned','hints_used_zero',
    'wrong_answers_zero','speed_under_seconds','specific_room_perfect',
    'all_rooms_complete','secret_code','total_wrong_under','login_streak'
  )),
  unlock_condition_value INTEGER NOT NULL DEFAULT 0,
  unlock_condition_room_id UUID REFERENCES public.rooms(id),
  xp_reward INTEGER NOT NULL DEFAULT 100,
  is_secret BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','unlocked','in_progress','completed','perfect')),
  puzzles_solved INTEGER NOT NULL DEFAULT 0,
  puzzles_total INTEGER NOT NULL DEFAULT 0,
  wrong_attempts INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  time_started_at TIMESTAMPTZ,
  time_completed_at TIMESTAMPTZ,
  time_taken_seconds INTEGER,
  is_perfect BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

CREATE TABLE IF NOT EXISTS public.puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES public.puzzles(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  attempt_code TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  hints_used_count INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hint_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES public.puzzles(id) ON DELETE CASCADE,
  hint_number INTEGER NOT NULL CHECK (hint_number IN (1,2,3)),
  xp_deducted INTEGER NOT NULL DEFAULT 25,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, puzzle_id, hint_number)
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  xp_awarded INTEGER NOT NULL,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  rooms_completed INTEGER NOT NULL DEFAULT 0,
  puzzles_solved INTEGER NOT NULL DEFAULT 0,
  perfect_rooms INTEGER NOT NULL DEFAULT 0,
  achievements_count INTEGER NOT NULL DEFAULT 0,
  best_total_time_seconds INTEGER,
  rank INTEGER,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  weekly_rank INTEGER,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32),'hex'),
  current_puzzle_index INTEGER NOT NULL DEFAULT 0,
  time_remaining_seconds INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  end_reason TEXT CHECK (end_reason IN ('completed','timeout','abandoned','error'))
);

CREATE TABLE IF NOT EXISTS public.personality_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  q1_answer TEXT NOT NULL, q2_answer TEXT NOT NULL, q3_answer TEXT NOT NULL,
  q4_answer TEXT NOT NULL, q5_answer TEXT NOT NULL, q6_answer TEXT NOT NULL,
  q7_answer TEXT NOT NULL, q8_answer TEXT NOT NULL, q9_answer TEXT NOT NULL,
  q10_answer TEXT NOT NULL,
  personality_type TEXT NOT NULL,
  personality_score INTEGER NOT NULL CHECK (personality_score BETWEEN 0 AND 100),
  personality_description TEXT NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retaken_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('string','integer','boolean','json','color','url')),
  category TEXT NOT NULL CHECK (category IN ('game_config','xp_config','timer_config','ui_config','feature_flags','maintenance','email_config','social_config')),
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,
  last_updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info','warning','success','danger','maintenance')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_dismissible BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_pages TEXT[] NOT NULL DEFAULT ARRAY['all'],
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all','registered','admins_only')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id),
  reported_user_id UUID REFERENCES public.users(id),
  reported_puzzle_id UUID REFERENCES public.puzzles(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('bug_report','puzzle_error','cheating','inappropriate_content','technical_issue','other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','dismissed','escalated')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.puzzle_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  puzzle_id UUID UNIQUE NOT NULL REFERENCES public.puzzles(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  total_attempts INTEGER NOT NULL DEFAULT 0,
  total_solves INTEGER NOT NULL DEFAULT 0,
  total_failures INTEGER NOT NULL DEFAULT 0,
  solve_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  average_attempts_to_solve NUMERIC(5,2) NOT NULL DEFAULT 0,
  average_time_to_solve_seconds INTEGER NOT NULL DEFAULT 0,
  total_hints_used INTEGER NOT NULL DEFAULT 0,
  hint_1_used_count INTEGER NOT NULL DEFAULT 0,
  hint_2_used_count INTEGER NOT NULL DEFAULT 0,
  hint_3_used_count INTEGER NOT NULL DEFAULT 0,
  fastest_solve_seconds INTEGER,
  slowest_solve_seconds INTEGER,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_xp ON public.users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level DESC);
CREATE INDEX IF NOT EXISTS idx_users_banned ON public.users(is_banned) WHERE is_banned = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_admin ON public.users(is_admin) WHERE is_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(account_status);
CREATE INDEX IF NOT EXISTS idx_rooms_order ON public.rooms(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON public.rooms(slug);
CREATE INDEX IF NOT EXISTS idx_puzzles_room_id ON public.puzzles(room_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_order ON public.puzzles(room_id, order_index);
CREATE INDEX IF NOT EXISTS idx_room_progress_user ON public.room_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_room_progress_status ON public.room_progress(status);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_user ON public.puzzle_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_puzzle ON public.puzzle_attempts(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON public.leaderboard(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank ASC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly ON public.leaderboard(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_hint_usage_user_puzzle ON public.hint_usage(user_id, puzzle_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_room_sessions_user ON public.room_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_puzzle_analytics_solve ON public.puzzle_analytics(solve_rate ASC);
CREATE INDEX IF NOT EXISTS idx_puzzle_analytics_room ON public.puzzle_analytics(room_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON public.system_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.user_reports(status, priority);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.user_reports(reporter_id);
-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE((SELECT is_admin FROM public.users WHERE id = p_user_id), FALSE);
EXCEPTION WHEN OTHERS THEN RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE((SELECT is_super_admin FROM public.users WHERE id = p_user_id), FALSE);
EXCEPTION WHEN OTHERS THEN RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_maintenance_mode()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE((SELECT value = 'true' FROM public.system_settings WHERE key = 'maintenance_mode'), FALSE);
EXCEPTION WHEN OTHERS THEN RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_xp(
  base_xp INT, wrong_attempts INT, hints_used INT, is_perfect BOOLEAN
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  result INT;
  wrong_penalty INT := 5;
  hint_penalty INT := 25;
  perfect_bonus INT := 100;
BEGIN
  result := base_xp - (wrong_attempts * wrong_penalty) - (hints_used * hint_penalty);
  IF is_perfect THEN result := result + perfect_bonus; END IF;
  RETURN GREATEST(0, result);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_username TEXT;
  v_email TEXT;
BEGIN
  v_email := NEW.email;
  v_username := LOWER(REGEXP_REPLACE(SPLIT_PART(v_email, '@', 1), '[^a-z0-9_]', '_', 'g'));
  v_username := LEFT(v_username, 20);
  IF LENGTH(v_username) < 3 THEN v_username := v_username || '_dev'; END IF;
  -- Ensure unique username
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = v_username) LOOP
    v_username := LEFT(v_username, 17) || floor(random()*999)::text;
  END LOOP;

  INSERT INTO public.users (id, username, email)
  VALUES (NEW.id, v_username, v_email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.leaderboard (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user RECORD;
  v_achievement RECORD;
  v_unlocked TEXT[] := '{}';
  v_rooms_completed INT;
  v_puzzles_solved INT;
  v_hints_used INT;
  v_wrong INT;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  v_rooms_completed := v_user.total_rooms_completed;
  v_puzzles_solved := v_user.total_puzzles_solved;
  v_hints_used := v_user.total_hints_used;
  v_wrong := v_user.total_wrong_attempts;

  FOR v_achievement IN SELECT * FROM public.achievements WHERE is_active = TRUE LOOP
    IF EXISTS (SELECT 1 FROM public.user_achievements WHERE user_id = p_user_id AND achievement_id = v_achievement.id) THEN
      CONTINUE;
    END IF;

    DECLARE v_met BOOLEAN := FALSE;
    BEGIN
      CASE v_achievement.unlock_condition_type
        WHEN 'rooms_completed' THEN v_met := v_rooms_completed >= v_achievement.unlock_condition_value;
        WHEN 'puzzles_solved'  THEN v_met := v_puzzles_solved >= v_achievement.unlock_condition_value;
        WHEN 'xp_earned'       THEN v_met := v_user.xp >= v_achievement.unlock_condition_value;
        WHEN 'all_rooms_complete' THEN v_met := v_rooms_completed >= 10;
        WHEN 'specific_room_perfect' THEN
          v_met := EXISTS (SELECT 1 FROM public.room_progress WHERE user_id = p_user_id AND room_id = v_achievement.unlock_condition_room_id AND is_perfect = TRUE);
        ELSE v_met := FALSE;
      END CASE;

      IF v_met THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, xp_awarded)
        VALUES (p_user_id, v_achievement.id, v_achievement.xp_reward)
        ON CONFLICT DO NOTHING;

        UPDATE public.users SET xp = xp + v_achievement.xp_reward WHERE id = p_user_id;
        UPDATE public.leaderboard SET achievements_count = achievements_count + 1 WHERE user_id = p_user_id;
        v_unlocked := array_append(v_unlocked, v_achievement.slug);
      END IF;
    END;
  END LOOP;

  RETURN jsonb_build_object('unlocked', to_jsonb(v_unlocked));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_puzzle(
  p_user_id UUID, p_puzzle_id UUID, p_wrong_attempts INT,
  p_hints_used INT, p_time_taken_seconds INT, p_submitted_code TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_puzzle RECORD;
  v_xp_earned INT;
  v_user RECORD;
  v_new_level INT;
  v_level_up BOOLEAN := FALSE;
  v_achievements JSONB;
BEGIN
  SELECT * INTO v_puzzle FROM public.puzzles WHERE id = p_puzzle_id AND is_active = TRUE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'error', 'Puzzle not found'); END IF;

  IF EXISTS (SELECT 1 FROM public.puzzle_attempts WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id AND is_correct = TRUE) THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Already solved');
  END IF;

  v_xp_earned := public.calculate_xp(v_puzzle.xp_reward, p_wrong_attempts, p_hints_used, p_wrong_attempts = 0 AND p_hints_used = 0);

  INSERT INTO public.puzzle_attempts (user_id, puzzle_id, room_id, attempt_code, is_correct, hints_used_count, time_taken_seconds, xp_earned)
  VALUES (p_user_id, p_puzzle_id, v_puzzle.room_id, p_submitted_code, TRUE, p_hints_used, p_time_taken_seconds, v_xp_earned);

  UPDATE public.room_progress
  SET puzzles_solved = puzzles_solved + 1, xp_earned = xp_earned + v_xp_earned,
      hints_used = hints_used + p_hints_used, wrong_attempts = wrong_attempts + p_wrong_attempts,
      updated_at = NOW()
  WHERE user_id = p_user_id AND room_id = v_puzzle.room_id;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  v_new_level := LEAST(100, 1 + (v_user.xp + v_xp_earned) / 1000);
  v_level_up := v_new_level > v_user.level;

  UPDATE public.users
  SET xp = xp + v_xp_earned, level = v_new_level,
      total_puzzles_solved = total_puzzles_solved + 1, last_active_at = NOW(), updated_at = NOW()
  WHERE id = p_user_id;

  UPDATE public.leaderboard
  SET total_xp = total_xp + v_xp_earned, puzzles_solved = puzzles_solved + 1, last_updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update puzzle analytics
  UPDATE public.puzzle_analytics
  SET total_attempts = total_attempts + 1, total_solves = total_solves + 1,
      total_hints_used = total_hints_used + p_hints_used,
      solve_rate = ROUND(100.0 * (total_solves + 1) / GREATEST(total_attempts + 1, 1), 2),
      last_updated_at = NOW()
  WHERE puzzle_id = p_puzzle_id;

  v_achievements := public.check_and_unlock_achievements(p_user_id);

  RETURN jsonb_build_object(
    'success', TRUE, 'xp_earned', v_xp_earned,
    'new_total_xp', v_user.xp + v_xp_earned,
    'level_up', v_level_up, 'new_level', v_new_level,
    'achievements_unlocked', v_achievements->'unlocked'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id UUID)
RETURNS TABLE(rank INT, total_users INT, percentile NUMERIC) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.rank::INT,
    (SELECT COUNT(*)::INT FROM public.leaderboard),
    ROUND(100.0 * (1 - (l.rank::NUMERIC / GREATEST((SELECT COUNT(*) FROM public.leaderboard), 1))), 1)
  FROM public.leaderboard l WHERE l.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.leaderboard SET total_xp = NEW.xp,
    rooms_completed = NEW.total_rooms_completed, last_updated_at = NOW()
  WHERE user_id = NEW.id;

  WITH ranked AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) AS rn FROM public.leaderboard
  )
  UPDATE public.leaderboard l SET rank = r.rn FROM ranked r WHERE l.user_id = r.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.setup_first_super_admin(p_email TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE is_super_admin = TRUE) THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Super admin already exists');
  END IF;

  SELECT id INTO v_user_id FROM public.users WHERE email = p_email;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', FALSE, 'message', 'User not found'); END IF;

  UPDATE public.users SET is_admin = TRUE, is_super_admin = TRUE, admin_role = 'super_admin', admin_granted_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', TRUE, 'user_id', v_user_id, 'message', 'Super admin configured');
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_rooms_updated_at ON public.rooms;
DROP TRIGGER IF EXISTS set_puzzles_updated_at ON public.puzzles;
DROP TRIGGER IF EXISTS set_room_progress_updated_at ON public.room_progress;
DROP TRIGGER IF EXISTS update_leaderboard_trigger ON public.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_puzzles_updated_at BEFORE UPDATE ON public.puzzles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_room_progress_updated_at BEFORE UPDATE ON public.room_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_leaderboard_trigger
  AFTER UPDATE OF xp ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_leaderboard();

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hint_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- users
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- rooms (public read)
CREATE POLICY "rooms_select_all" ON public.rooms FOR SELECT USING (TRUE);
CREATE POLICY "rooms_admin_write" ON public.rooms FOR ALL USING (public.is_admin(auth.uid()));

-- puzzles (auth read, no correct_solution exposure via direct query)
CREATE POLICY "puzzles_select_auth" ON public.puzzles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "puzzles_admin_write" ON public.puzzles FOR ALL USING (public.is_admin(auth.uid()));

-- achievements
CREATE POLICY "achievements_select_all" ON public.achievements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "achievements_admin_write" ON public.achievements FOR ALL USING (public.is_admin(auth.uid()));

-- room_progress
CREATE POLICY "room_progress_select_own" ON public.room_progress FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "room_progress_insert_own" ON public.room_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "room_progress_update_own" ON public.room_progress FOR UPDATE USING (auth.uid() = user_id);

-- puzzle_attempts
CREATE POLICY "puzzle_attempts_select_own" ON public.puzzle_attempts FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "puzzle_attempts_insert_own" ON public.puzzle_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- hint_usage
CREATE POLICY "hint_usage_select_own" ON public.hint_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "hint_usage_insert_own" ON public.hint_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_achievements
CREATE POLICY "user_achievements_select_all" ON public.user_achievements FOR SELECT USING (auth.role() = 'authenticated');

-- leaderboard
CREATE POLICY "leaderboard_select_all" ON public.leaderboard FOR SELECT USING (auth.role() = 'authenticated');

-- room_sessions
CREATE POLICY "room_sessions_own" ON public.room_sessions FOR ALL USING (auth.uid() = user_id);

-- personality_results
CREATE POLICY "personality_select_own" ON public.personality_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "personality_insert_own" ON public.personality_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "personality_update_own" ON public.personality_results FOR UPDATE USING (auth.uid() = user_id);

-- admin_logs
CREATE POLICY "admin_logs_admin_only" ON public.admin_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "admin_logs_insert_admin" ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- system_settings
CREATE POLICY "settings_select_public" ON public.system_settings FOR SELECT USING (is_public = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "settings_update_super" ON public.system_settings FOR UPDATE USING (public.is_super_admin(auth.uid()));

-- announcements
CREATE POLICY "announcements_select" ON public.announcements FOR SELECT USING (is_active = TRUE AND (target_audience = 'all' OR (target_audience = 'registered' AND auth.role() = 'authenticated')));
CREATE POLICY "announcements_admin_write" ON public.announcements FOR ALL USING (public.is_admin(auth.uid()));

-- user_reports
CREATE POLICY "reports_select" ON public.user_reports FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin(auth.uid()));
CREATE POLICY "reports_insert" ON public.user_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "reports_update_admin" ON public.user_reports FOR UPDATE USING (public.is_admin(auth.uid()));

-- puzzle_analytics
CREATE POLICY "puzzle_analytics_admin" ON public.puzzle_analytics FOR SELECT USING (public.is_admin(auth.uid()));
