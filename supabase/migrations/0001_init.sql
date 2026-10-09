-- Knit · v1 · esquema base
-- Todas las tablas: id uuid generado en el cliente, user_id = auth.uid().
-- Borrado lógico (deleted_at) e updated_at ISO para la regla de última edición.

create table if not exists folders (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  parent_id  uuid references folders(id),
  name       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists notes (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  folder_id   uuid references folders(id),
  title       text not null default '',
  content     text not null default '',
  is_markdown boolean not null default true,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table if not exists tags (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Se añade id como PK para que el upsert por id sea uniforme en todas las tablas.
create table if not exists note_tags (
  id         uuid primary key,
  note_id    uuid not null references notes(id),
  tag_id     uuid not null references tags(id),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, note_id, tag_id)
);

create table if not exists tasks (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  note_id    uuid references notes(id),
  parent_id  uuid references tasks(id),
  title      text not null default '',
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists notes_user_updated_idx on notes (user_id, updated_at);
create index if not exists folders_user_updated_idx on folders (user_id, updated_at);
create index if not exists tags_user_updated_idx on tags (user_id, updated_at);
create index if not exists note_tags_user_updated_idx on note_tags (user_id, updated_at);
create index if not exists tasks_user_updated_idx on tasks (user_id, updated_at);

-- RLS obligatorio en TODAS las tablas: cada usuario solo ve y escribe sus filas.
alter table folders enable row level security;
alter table notes enable row level security;
alter table tags enable row level security;
alter table note_tags enable row level security;
alter table tasks enable row level security;

create policy "own rows" on folders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own rows" on notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own rows" on tags
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own rows" on note_tags
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own rows" on tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
