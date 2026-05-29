-- Lisan AI Supabase schema. Run this in the Supabase SQL editor.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  native_language text default 'Arabic',
  target_language text default 'English',
  skill_level text default 'Beginner',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  level text default 'Beginner',
  order_index integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  definition text not null,
  example_sentence text,
  pronunciation text,
  created_at timestamptz default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  category text,
  percent_complete numeric not null default 0,
  xp_points integer default 0,
  updated_at timestamptz default now()
);

create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  updated_at timestamptz default now()
);

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_text text not null,
  translated_text text not null,
  source_language text,
  target_language text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.vocabulary enable row level security;
alter table public.quizzes enable row level security;
alter table public.chat_history enable row level security;
alter table public.progress enable row level security;
alter table public.streaks enable row level security;
alter table public.translations enable row level security;

create policy "users are private" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles are private" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "lessons are private" on public.lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vocabulary is private" on public.vocabulary for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quizzes are private" on public.quizzes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chat history is private" on public.chat_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress is private" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "streaks are private" on public.streaks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "translations are private" on public.translations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
