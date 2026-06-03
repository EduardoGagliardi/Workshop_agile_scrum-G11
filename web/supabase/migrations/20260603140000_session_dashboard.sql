-- Session dashboard: group chat, shared files (storage bucket sessions_files), host can remove participants.

create or replace function app_private.is_session_member(
  target_session_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sessions s
    where s.id = target_session_id
      and (
        s.host_id = target_user_id
        or exists (
          select 1
          from public.session_registrations sr
          where sr.session_id = target_session_id
            and sr.user_id = target_user_id
        )
      )
  );
$$;

grant execute on function app_private.is_session_member(uuid, uuid) to authenticated;

create table public.session_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  sender_user_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index session_messages_session_id_created_at_idx
  on public.session_messages(session_id, created_at asc);

create table public.session_files (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index session_files_session_id_idx on public.session_files(session_id);

alter table public.session_messages enable row level security;
alter table public.session_files enable row level security;

create policy "session_messages_select_members"
  on public.session_messages for select
  to authenticated
  using (app_private.is_session_member(session_id, (select auth.uid())));

create policy "session_messages_insert_members"
  on public.session_messages for insert
  to authenticated
  with check (
    sender_user_id = (select auth.uid())
    and app_private.is_session_member(session_id, (select auth.uid()))
  );

create policy "session_files_select_members"
  on public.session_files for select
  to authenticated
  using (app_private.is_session_member(session_id, (select auth.uid())));

create policy "session_files_insert_members"
  on public.session_files for insert
  to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and app_private.is_session_member(session_id, (select auth.uid()))
  );

create policy "session_files_delete_uploader_or_host"
  on public.session_files for delete
  to authenticated
  using (
    uploaded_by = (select auth.uid())
    or exists (
      select 1
      from public.sessions s
      where s.id = session_files.session_id
        and s.host_id = (select auth.uid())
    )
  );

create policy "session_registrations_delete_host"
  on public.session_registrations for delete
  to authenticated
  using (
    exists (
      select 1
      from public.sessions s
      where s.id = session_registrations.session_id
        and s.host_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sessions_files', 'sessions_files', false, 52428800, null)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit;

create policy "sessions_files_storage_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'sessions_files'
    and app_private.is_session_member(
      ((storage.foldername(name))[1])::uuid,
      (select auth.uid())
    )
  );

create policy "sessions_files_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'sessions_files'
    and app_private.is_session_member(
      ((storage.foldername(name))[1])::uuid,
      (select auth.uid())
    )
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create policy "sessions_files_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'sessions_files'
    and (
      (storage.foldername(name))[2] = (select auth.uid())::text
      or exists (
        select 1
        from public.sessions s
        where s.id = ((storage.foldername(name))[1])::uuid
          and s.host_id = (select auth.uid())
      )
    )
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'session_messages'
  ) then
    alter publication supabase_realtime add table public.session_messages;
  end if;
end $$;
