-- =============================================================================
-- StudyHub — FULL RESET + Fresh Schema
-- Paste this entire file into Supabase SQL Editor and click Run.
-- It drops everything first, then rebuilds cleanly.
-- =============================================================================


-- ── Step 1: Drop all existing tables (cascade removes FKs & policies) ─────────
drop table if exists public.ai_chats       cascade;
drop table if exists public.quiz_results   cascade;
drop table if exists public.study_sessions cascade;
drop table if exists public.flashcards     cascade;
drop table if exists public.notes          cascade;
drop table if exists public.lessons        cascade;
drop table if exists public.subjects       cascade;
drop table if exists public.users          cascade;

-- Drop existing functions
drop function if exists public.handle_updated_at()              cascade;
drop function if exists public.handle_new_user()                cascade;
drop function if exists public.increment_study_minutes(uuid, integer) cascade;
drop function if exists public.seed_default_subjects(uuid)      cascade;

-- Drop existing triggers on auth.users
drop trigger if exists on_auth_user_created on auth.users;

-- ── Step 2: Extensions ────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- =============================================================================
-- TABLE 1: USERS
-- =============================================================================
create table public.users (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  full_name           text        not null default '',
  email               text        not null default '',
  avatar_url          text,
  grade               text,
  streak              integer     not null default 0,
  last_active         date,
  total_study_minutes integer     not null default 0,
  fcm_token           text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-bump updated_at
create function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Auto-create profile on auth sign-up
create function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- TABLE 2: SUBJECTS
-- =============================================================================
create table public.subjects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  name        text        not null,
  icon        text        not null default 'book',
  color_hex   text        not null default '#2563EB',
  chapters    integer     not null default 0,
  progress    integer     not null default 0 check (progress between 0 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index subjects_user_id_idx on public.subjects (user_id);

create trigger subjects_updated_at
  before update on public.subjects
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- TABLE 3: LESSONS
-- =============================================================================
create table public.lessons (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.users(id) on delete cascade,
  subject_id    uuid        references public.subjects(id) on delete set null,
  title         text        not null,
  module        text,
  thumbnail_url text,
  video_url     text,
  duration_sec  integer,
  is_completed  boolean     not null default false,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index lessons_user_id_idx    on public.lessons (user_id);
create index lessons_subject_id_idx on public.lessons (subject_id);

create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- TABLE 4: NOTES
-- =============================================================================
create table public.notes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  subject_id  uuid        references public.subjects(id) on delete set null,
  title       text        not null default 'Untitled Note',
  content     text        not null default '',
  tags        text[]      default '{}',
  is_pinned   boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index notes_user_id_idx    on public.notes (user_id);
create index notes_subject_id_idx on public.notes (subject_id);

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- TABLE 5: FLASHCARDS
-- =============================================================================
create table public.flashcards (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references public.users(id) on delete cascade,
  subject_id     uuid        references public.subjects(id) on delete set null,
  deck_name      text        not null default 'My Deck',
  front          text        not null,
  back           text        not null,
  difficulty     text        default 'medium' check (difficulty in ('easy','medium','hard')),
  times_reviewed integer     not null default 0,
  next_review_at timestamptz default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index flashcards_user_id_idx     on public.flashcards (user_id);
create index flashcards_subject_id_idx  on public.flashcards (subject_id);
create index flashcards_next_review_idx on public.flashcards (next_review_at);

create trigger flashcards_updated_at
  before update on public.flashcards
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- TABLE 6: STUDY SESSIONS  (Pomodoro timer)
-- =============================================================================
create table public.study_sessions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users(id) on delete cascade,
  subject_id   uuid        references public.subjects(id) on delete set null,
  session_type text        default 'focus' check (session_type in ('focus','short_break','long_break')),
  duration_min integer     not null,
  actual_min   integer,
  completed    boolean     not null default false,
  notes        text,
  started_at   timestamptz not null default now(),
  ended_at     timestamptz
);

create index study_sessions_user_id_idx    on public.study_sessions (user_id);
create index study_sessions_started_at_idx on public.study_sessions (started_at);


-- =============================================================================
-- TABLE 7: QUIZ RESULTS
-- =============================================================================
create table public.quiz_results (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users(id) on delete cascade,
  subject_id      uuid        references public.subjects(id) on delete set null,
  quiz_title      text,
  total_questions integer     not null,
  correct_answers integer     not null,
  score_pct       numeric(5,2) generated always as (
                    (correct_answers::numeric / nullif(total_questions,0)) * 100
                  ) stored,
  time_taken_sec  integer,
  answers         jsonb       default '[]',
  taken_at        timestamptz not null default now()
);

create index quiz_results_user_id_idx    on public.quiz_results (user_id);
create index quiz_results_subject_id_idx on public.quiz_results (subject_id);


-- =============================================================================
-- TABLE 8: AI CHATS
-- =============================================================================
create table public.ai_chats (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users(id) on delete cascade,
  role       text        not null check (role in ('user','assistant')),
  message    text        not null,
  created_at timestamptz not null default now()
);

create index ai_chats_user_created_idx on public.ai_chats (user_id, created_at);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.users          enable row level security;
alter table public.subjects       enable row level security;
alter table public.lessons        enable row level security;
alter table public.notes          enable row level security;
alter table public.flashcards     enable row level security;
alter table public.study_sessions enable row level security;
alter table public.quiz_results   enable row level security;
alter table public.ai_chats       enable row level security;

-- users: can only read/update own row
create policy "users_select" on public.users for select using (auth.uid() = id);
create policy "users_update" on public.users for update using (auth.uid() = id);
create policy "users_insert" on public.users for insert with check (auth.uid() = id);

-- everything else: full access to own rows
create policy "subjects_all"       on public.subjects       for all using (auth.uid() = user_id);
create policy "lessons_all"        on public.lessons        for all using (auth.uid() = user_id);
create policy "notes_all"          on public.notes          for all using (auth.uid() = user_id);
create policy "flashcards_all"     on public.flashcards     for all using (auth.uid() = user_id);
create policy "study_sessions_all" on public.study_sessions for all using (auth.uid() = user_id);
create policy "quiz_results_all"   on public.quiz_results   for all using (auth.uid() = user_id);
create policy "ai_chats_all"       on public.ai_chats       for all using (auth.uid() = user_id);


-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Called by studyService.endSession to avoid race conditions
create function public.increment_study_minutes(p_user_id uuid, p_minutes integer)
returns void language plpgsql security definer as $$
begin
  update public.users
  set total_study_minutes = total_study_minutes + p_minutes
  where id = p_user_id;
end;
$$;

-- Called by authService.signUp to seed default subjects
create function public.seed_default_subjects(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.subjects (user_id, name, icon, color_hex, chapters) values
    (p_user_id, 'Physics',     'science',    '#3b82f6', 12),
    (p_user_id, 'Chemistry',   'experiment', '#10b981', 15),
    (p_user_id, 'Mathematics', 'functions',  '#f97316', 10),
    (p_user_id, 'Biology',     'psychology', '#ec4899',  8);
end;
$$;


-- =============================================================================
-- REALTIME  (must run last — enables live subscriptions for all tables)
-- =============================================================================
drop publication if exists supabase_realtime;
create publication supabase_realtime for table
  public.users,
  public.subjects,
  public.lessons,
  public.notes,
  public.flashcards,
  public.study_sessions,
  public.quiz_results,
  public.ai_chats;
