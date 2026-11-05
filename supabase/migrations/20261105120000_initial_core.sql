-- SULY AI: Core Schema & Row Level Security (Phase 2 Foundation)
-- Local development only. Not applied to any remote or hosted database.

-- 1. Helper function for automated updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 3. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_projects_id_user unique (id, user_id)
);

create index if not exists idx_projects_user_id on public.projects(user_id);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create trigger tr_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- 4. Conversations Table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_conversations_id_user unique (id, user_id),
  constraint fk_conversations_project_user foreign key (project_id, user_id)
    references public.projects(id, user_id) on delete set null
);

create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_project_id on public.conversations(project_id);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.user_id = auth.uid()
      )
    )
  );

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      project_id is null
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

create trigger tr_conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- 5. Messages Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now(),
  constraint fk_messages_conversation_user foreign key (conversation_id, user_id)
    references public.conversations(id, user_id) on delete cascade
);

create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_user_id on public.messages(user_id);

alter table public.messages enable row level security;

create policy "Users can view own messages within own conversations"
  on public.messages for select
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can insert own messages within own conversations"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can update own messages within own conversations"
  on public.messages for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can delete own messages within own conversations"
  on public.messages for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- 6. Agent Tasks Table (Metadata and lifecycle only, no agent execution)
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid,
  task_type text not null,
  status text not null check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_summary text,
  result_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_agent_tasks_conversation_user foreign key (conversation_id, user_id)
    references public.conversations(id, user_id) on delete cascade
);

create index if not exists idx_agent_tasks_user_id on public.agent_tasks(user_id);
create index if not exists idx_agent_tasks_conversation_id on public.agent_tasks(conversation_id);
create index if not exists idx_agent_tasks_status on public.agent_tasks(status);

alter table public.agent_tasks enable row level security;

create policy "Users can view own tasks"
  on public.agent_tasks for select
  using (
    auth.uid() = user_id
    and (
      conversation_id is null
      or exists (
        select 1 from public.conversations c
        where c.id = agent_tasks.conversation_id and c.user_id = auth.uid()
      )
    )
  );

create policy "Users can insert own tasks"
  on public.agent_tasks for insert
  with check (
    auth.uid() = user_id
    and (
      conversation_id is null
      or exists (
        select 1 from public.conversations c
        where c.id = conversation_id and c.user_id = auth.uid()
      )
    )
  );

create policy "Users can update own tasks"
  on public.agent_tasks for update
  using (
    auth.uid() = user_id
    and (
      conversation_id is null
      or exists (
        select 1 from public.conversations c
        where c.id = agent_tasks.conversation_id and c.user_id = auth.uid()
      )
    )
  )
  with check (
    auth.uid() = user_id
    and (
      conversation_id is null
      or exists (
        select 1 from public.conversations c
        where c.id = conversation_id and c.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete own tasks"
  on public.agent_tasks for delete
  using (
    auth.uid() = user_id
    and (
      conversation_id is null
      or exists (
        select 1 from public.conversations c
        where c.id = agent_tasks.conversation_id and c.user_id = auth.uid()
      )
    )
  );

create trigger tr_agent_tasks_updated_at
  before update on public.agent_tasks
  for each row execute function public.handle_updated_at();
