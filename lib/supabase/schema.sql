-- =========================================================
-- NYRA AI — DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- =========================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  theme TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT 'blue',
  font_size TEXT DEFAULT 'normal',
  default_model TEXT DEFAULT 'qwen/qwen3.6-27b',
  voice_name TEXT,
  voice_rate NUMERIC DEFAULT 1,
  interests JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  preferred_response_style JSONB DEFAULT '[]'::jsonb,
  experience_level TEXT DEFAULT 'Comfortable',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Secure Profile Update Policy: ensures users cannot modify authorization fields
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- TRIGGER: PREVENT CLIENT PRIVILEGE ESCALATION ON PROFILES
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When role is changed in an authenticated client context (auth.uid() is not null)
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NOT NULL THEN
      -- Immutable role from client: force keep previous database role
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- 2. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT,
  title TEXT NOT NULL DEFAULT 'New Chat',
  pinned BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  branch_parent_id TEXT,
  branch_point_msg_id TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated ON public.conversations(user_id, updated_at DESC);

-- 3. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  image TEXT,
  images JSONB,
  pdf_name TEXT,
  pdf_pages INT,
  attachments JSONB,
  sources JSONB,
  suggested_follow_ups JSONB,
  model_id TEXT,
  timestamp BIGINT NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own messages"
  ON public.messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_convo_time ON public.messages(conversation_id, timestamp ASC);

-- 4. PROMPTS TABLE
CREATE TABLE IF NOT EXISTS public.prompts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  is_custom BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own prompts"
  ON public.prompts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prompts_user ON public.prompts(user_id, created_at DESC);

-- 5. USAGE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_requests INT NOT NULL DEFAULT 0,
  web_searches INT NOT NULL DEFAULT 0,
  image_requests INT NOT NULL DEFAULT 0,
  pdf_requests INT NOT NULL DEFAULT 0,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_date UNIQUE (user_id, date)
);

-- Enable RLS on usage_records
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage records"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage records"
  ON public.usage_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON public.usage_records(user_id, date);

-- 6. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  reminder_time TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  roadmap_day INT,
  roadmap_topic TEXT,
  learning_focus TEXT,
  chat_query TEXT,
  category TEXT DEFAULT 'General',
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id, created_at DESC);

-- 7. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.memories (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'preference' CHECK (category IN ('career', 'goal', 'preference', 'project', 'technical', 'personal')),
  reason TEXT,
  confidence NUMERIC DEFAULT 1.0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on memories
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own memories"
  ON public.memories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_memories_user ON public.memories(user_id, created_at DESC);

-- 8. ATOMIC INCREMENT RPC FUNCTION (Prevents Race Conditions & Enforces Limits)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_limit INT,
  p_increment INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_current INT := 0;
  v_record RECORD;
BEGIN
  -- Insert or get today's record
  INSERT INTO public.usage_records (user_id, date, ai_requests, web_searches, image_requests, pdf_requests)
  VALUES (p_user_id, v_today, 0, 0, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- Lock row for update to prevent concurrent race conditions
  SELECT * INTO v_record
  FROM public.usage_records
  WHERE user_id = p_user_id AND date = v_today
  FOR UPDATE;

  -- Get current feature usage
  IF p_feature = 'aiRequests' THEN
    v_current := v_record.ai_requests;
  ELSIF p_feature = 'webSearches' THEN
    v_current := v_record.web_searches;
  ELSIF p_feature = 'imageRequests' THEN
    v_current := v_record.image_requests;
  ELSIF p_feature = 'pdfRequests' THEN
    v_current := v_record.pdf_requests;
  ELSE
    RETURN jsonb_build_object('allowed', false, 'error', 'Invalid feature type');
  END IF;

  -- Check limit
  IF v_current + p_increment > p_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current', v_current,
      'limit', p_limit,
      'feature', p_feature
    );
  END IF;

  -- Increment atomically
  IF p_feature = 'aiRequests' THEN
    UPDATE public.usage_records
    SET ai_requests = ai_requests + p_increment, updated_at = now()
    WHERE user_id = p_user_id AND date = v_today;
  ELSIF p_feature = 'webSearches' THEN
    UPDATE public.usage_records
    SET web_searches = web_searches + p_increment, updated_at = now()
    WHERE user_id = p_user_id AND date = v_today;
  ELSIF p_feature = 'imageRequests' THEN
    UPDATE public.usage_records
    SET image_requests = image_requests + p_increment, updated_at = now()
    WHERE user_id = p_user_id AND date = v_today;
  ELSIF p_feature = 'pdfRequests' THEN
    UPDATE public.usage_records
    SET pdf_requests = pdf_requests + p_increment, updated_at = now()
    WHERE user_id = p_user_id AND date = v_today;
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'current', v_current + p_increment,
    'limit', p_limit,
    'feature', p_feature
  );
END;
$$;

-- 9. TRIGGER: AUTO-CONFIRM USER ON SIGNUP (No email verification required)
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  IF NEW.confirmed_at IS NULL THEN
    NEW.confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_user();

-- 10. TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT := 'user';
BEGIN
  IF LOWER(NEW.email) = 'pooja@gmail.com' THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = CASE WHEN LOWER(EXCLUDED.email) = 'pooja@gmail.com' THEN 'admin' ELSE profiles.role END,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. AUTH & AUDIT ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.auth_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'login', 'logout', 'google_login', 'failed_login', 'guest_started', 'guest_limit_reached')),
  provider TEXT DEFAULT 'email',
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on auth_activity
ALTER TABLE public.auth_activity ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view auth_activity"
  ON public.auth_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users / system can log activity events
CREATE POLICY "Users can insert activity logs"
  ON public.auth_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_auth_activity_time ON public.auth_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_activity_user ON public.auth_activity(user_id, created_at DESC);

