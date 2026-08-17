-- NeoBuild consolidated schema (idempotent — safe to re-run)
-- Auto-merged from init.sql + migrations/*.sql at save time. Do not edit migration files only.

-- NeoBuild: schema.sql
create extension if not exists pgcrypto;

create table if not exists profiles (id uuid primary key references auth.users(id) on delete cascade, name text default '', age integer, city text default '', country text default '', timezone text default 'UTC', family_size integer default 1, children integer default 0, diet text default 'non-vegetarian', egg_preference text default 'yes', allergies text[] default '{}', created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists account_codes (user_id uuid primary key references auth.users(id) on delete cascade, code text unique not null, created_at timestamptz default now());

create table if not exists tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text default '', due_date date not null, start_time time, end_time time, completed boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists routines (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, created_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists routine_tasks (id uuid primary key default gen_random_uuid(), routine_id uuid not null references routines(id) on delete cascade, title text not null, position integer not null, start_time time);

create table if not exists journal_entries (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, body text not null, mood text, entry_at timestamptz default now(), updated_at timestamptz default now());

create table if not exists meal_plans (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, week_start date not null, day_of_week integer not null, meal_type text not null, recipe_name text not null);

create table if not exists shopping_items (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, category text default 'Other', quantity text default '1', purchased boolean default false, week_start date not null);

create table if not exists user_settings (user_id uuid primary key references auth.users(id) on delete cascade, timezone text default 'UTC', theme text default 'golden', font text default 'system', task_reminders boolean default true, completion_reminders boolean default true);

create index if not exists tasks_user_date_idx on tasks(user_id,due_date);

alter table profiles enable row level security;

alter table tasks enable row level security;

alter table routines enable row level security;

alter table journal_entries enable row level security;

alter table meal_plans enable row level security;

alter table shopping_items enable row level security;

alter table user_settings enable row level security;

DROP POLICY IF EXISTS profiles_owner ON profiles;

DROP POLICY IF EXISTS tasks_owner ON tasks;

DROP POLICY IF EXISTS routines_owner ON routines;

DROP POLICY IF EXISTS journal_owner ON journal_entries;

DROP POLICY IF EXISTS meals_owner ON meal_plans;

DROP POLICY IF EXISTS shopping_owner ON shopping_items;

DROP POLICY IF EXISTS settings_owner ON user_settings;

-- NeoBuild: authenticated user ownership policies
-- NeoBuild: per-user RLS for "journal_entries" (auth.uid() = user_id).
DROP POLICY IF EXISTS "nb_auth_journal_entries_select" ON public."journal_entries";

DROP POLICY IF EXISTS "nb_auth_journal_entries_insert" ON public."journal_entries";

DROP POLICY IF EXISTS "nb_auth_journal_entries_update" ON public."journal_entries";

DROP POLICY IF EXISTS "nb_auth_journal_entries_delete" ON public."journal_entries";

-- NeoBuild: per-user RLS for "meal_plans" (auth.uid() = user_id).
DROP POLICY IF EXISTS "nb_auth_meal_plans_select" ON public."meal_plans";

DROP POLICY IF EXISTS "nb_auth_meal_plans_insert" ON public."meal_plans";

DROP POLICY IF EXISTS "nb_auth_meal_plans_update" ON public."meal_plans";

DROP POLICY IF EXISTS "nb_auth_meal_plans_delete" ON public."meal_plans";

-- NeoBuild: per-user RLS for "routines" (auth.uid() = user_id).
DROP POLICY IF EXISTS "nb_auth_routines_select" ON public."routines";

DROP POLICY IF EXISTS "nb_auth_routines_insert" ON public."routines";

DROP POLICY IF EXISTS "nb_auth_routines_update" ON public."routines";

DROP POLICY IF EXISTS "nb_auth_routines_delete" ON public."routines";

-- NeoBuild: per-user RLS for "shopping_items" (auth.uid() = user_id).
DROP POLICY IF EXISTS "nb_auth_shopping_items_select" ON public."shopping_items";

DROP POLICY IF EXISTS "nb_auth_shopping_items_insert" ON public."shopping_items";

DROP POLICY IF EXISTS "nb_auth_shopping_items_update" ON public."shopping_items";

DROP POLICY IF EXISTS "nb_auth_shopping_items_delete" ON public."shopping_items";

-- NeoBuild: per-user RLS for "tasks" (auth.uid() = user_id).
DROP POLICY IF EXISTS "nb_auth_tasks_select" ON public."tasks";

DROP POLICY IF EXISTS "nb_auth_tasks_insert" ON public."tasks";

DROP POLICY IF EXISTS "nb_auth_tasks_update" ON public."tasks";

DROP POLICY IF EXISTS "nb_auth_tasks_delete" ON public."tasks";

-- NeoBuild: per-user RLS for "user_settings" (auth.uid() = user_id).
DROP POLICY IF EXISTS "nb_auth_user_settings_select" ON public."user_settings";

DROP POLICY IF EXISTS "nb_auth_user_settings_insert" ON public."user_settings";

DROP POLICY IF EXISTS "nb_auth_user_settings_update" ON public."user_settings";

DROP POLICY IF EXISTS "nb_auth_user_settings_delete" ON public."user_settings";

CREATE POLICY profiles_owner ON profiles for all using (id = auth.uid()) with check (id = auth.uid());

CREATE POLICY tasks_owner ON tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());

CREATE POLICY routines_owner ON routines for all using (user_id = auth.uid()) with check (user_id = auth.uid());

CREATE POLICY journal_owner ON journal_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());

CREATE POLICY meals_owner ON meal_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());

CREATE POLICY shopping_owner ON shopping_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

CREATE POLICY settings_owner ON user_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

CREATE POLICY "nb_auth_journal_entries_select" ON public."journal_entries" FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_journal_entries_insert" ON public."journal_entries" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_journal_entries_update" ON public."journal_entries" FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_journal_entries_delete" ON public."journal_entries" FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_meal_plans_select" ON public."meal_plans" FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_meal_plans_insert" ON public."meal_plans" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_meal_plans_update" ON public."meal_plans" FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_meal_plans_delete" ON public."meal_plans" FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_routines_select" ON public."routines" FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_routines_insert" ON public."routines" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_routines_update" ON public."routines" FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_routines_delete" ON public."routines" FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_shopping_items_select" ON public."shopping_items" FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_shopping_items_insert" ON public."shopping_items" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_shopping_items_update" ON public."shopping_items" FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_shopping_items_delete" ON public."shopping_items" FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_tasks_select" ON public."tasks" FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_tasks_insert" ON public."tasks" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_tasks_update" ON public."tasks" FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_tasks_delete" ON public."tasks" FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_user_settings_select" ON public."user_settings" FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "nb_auth_user_settings_insert" ON public."user_settings" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_user_settings_update" ON public."user_settings" FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nb_auth_user_settings_delete" ON public."user_settings" FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NeoBuild: allow authenticated app users through PostgREST — RLS still enforces row ownership.
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."account_codes" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."journal_entries" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."meal_plans" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."profiles" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."routine_tasks" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."routines" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."shopping_items" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."tasks" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."user_settings" TO authenticated;
