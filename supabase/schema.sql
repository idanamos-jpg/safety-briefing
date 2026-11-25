-- =====================================================================
--  תדריך בטיחות באתר — סכמת מסד נתונים (Supabase / Postgres)
--  להדביק ב-Supabase → SQL Editor → Run (פעם אחת)
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- טבלאות ----------

create table if not exists public.sites (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text not null check (length(trim(name)) between 2 and 120),
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.briefings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  site_id           uuid not null references public.sites(id) on delete cascade,
  briefing_date     date not null,
  briefing_time     time not null,
  foreman_name      text not null check (length(trim(foreman_name)) >= 2),
  topics            text[] not null default '{}',
  notes             text,
  recipients        text[] not null default '{}',
  status            text not null default 'open' check (status in ('open','closed')),
  manager_name      text,
  manager_signature text,
  closed_at         timestamptz,
  email_status      text check (email_status in ('sent','failed','not_configured','no_recipients')),
  email_error       text,
  created_at        timestamptz not null default now()
);
-- תדריכים מותאמים שנבחרו — נשמר עותק מלא (כולל תרגומים) ברגע יצירת התדריך, כך שעריכה בספרייה לא משנה תדריכי עבר
alter table public.briefings add column if not exists custom_topics jsonb not null default '[]'::jsonb;

create index if not exists briefings_owner_date on public.briefings(owner_id, briefing_date desc);
create index if not exists briefings_site_date  on public.briefings(site_id, briefing_date);

create table if not exists public.signatures (
  id          uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.briefings(id) on delete cascade,
  full_name   text not null check (length(trim(full_name)) between 2 and 80),
  contractor  text not null check (length(trim(contractor)) between 1 and 80),
  attended    boolean not null check (attended),
  photo       text not null check (photo like 'data:image/%' and length(photo) between 500 and 600000),
  signature   text not null check (signature like 'data:image/%' and length(signature) between 500 and 400000),
  method      text not null check (method in ('qr','manager')),
  signed_at   timestamptz not null default now()
);
-- אותו שם לא יכול לחתום פעמיים על אותו תדריך (ללא תלות ברווחים/אותיות גדולות)
create unique index if not exists signatures_unique_name
  on public.signatures (briefing_id, lower(regexp_replace(trim(full_name), '\s+', ' ', 'g')));

-- ספריית תדריכים אישית של המנהל (עברית + תרגומים)
create table if not exists public.custom_topics (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null check (length(trim(title)) between 2 and 200),
  content    jsonb not null check (content ? 'he' and length(content::text) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists custom_topics_owner on public.custom_topics(owner_id, title);

-- ---------- טריגרים (הגנות שחלות על כל דרכי החתימה) ----------

create or replace function public.briefings_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.sites s where s.id = new.site_id and s.owner_id = new.owner_id) then
    raise exception 'site_not_owned';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'open' then raise exception 'must_start_open'; end if;
    new.closed_at := null; new.manager_signature := null;
    return new;
  end if;

  if new.owner_id <> old.owner_id then raise exception 'owner_change'; end if;

  if old.status = 'closed' then
    -- אחרי סגירה מותר לעדכן רק את סטטוס המייל
    if (new.site_id, new.briefing_date, new.briefing_time, new.foreman_name, new.topics, new.custom_topics, new.notes,
        new.recipients, new.status, new.manager_name, new.manager_signature, new.closed_at)
       is distinct from
       (old.site_id, old.briefing_date, old.briefing_time, old.foreman_name, old.topics, old.custom_topics, old.notes,
        old.recipients, old.status, old.manager_name, old.manager_signature, old.closed_at) then
      raise exception 'briefing_closed';
    end if;
  elsif new.status = 'closed' then
    if coalesce(trim(new.manager_name), '') = '' or coalesce(length(new.manager_signature), 0) < 500 then
      raise exception 'manager_signature_required';
    end if;
    new.closed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists briefings_guard on public.briefings;
create trigger briefings_guard before insert or update on public.briefings
  for each row execute function public.briefings_guard();

create or replace function public.signatures_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare st text;
begin
  select status into st from public.briefings where id = new.briefing_id for update; -- נעילה מול סגירה במקביל
  if st is null then raise exception 'no_briefing'; end if;
  if st <> 'open' then raise exception 'briefing_closed'; end if;
  new.full_name  := regexp_replace(trim(new.full_name), '\s+', ' ', 'g');
  new.contractor := trim(new.contractor);
  new.signed_at  := now();   -- חותמת זמן של השרת, לא של הטלפון
  return new;
end $$;

drop trigger if exists signatures_guard on public.signatures;
create trigger signatures_guard before insert on public.signatures
  for each row execute function public.signatures_guard();

-- ---------- RLS: כל מנהל רואה רק את שלו ----------

alter table public.sites      enable row level security;
alter table public.briefings  enable row level security;
alter table public.signatures enable row level security;

drop policy if exists sites_select on public.sites;
drop policy if exists sites_update on public.sites;
drop policy if exists sites_delete on public.sites;
create policy sites_select on public.sites for select to authenticated using (owner_id = auth.uid());
create policy sites_update on public.sites for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy sites_delete on public.sites for delete to authenticated using (owner_id = auth.uid());

drop policy if exists briefings_select on public.briefings;
drop policy if exists briefings_insert on public.briefings;
drop policy if exists briefings_update on public.briefings;
drop policy if exists briefings_delete on public.briefings;
create policy briefings_select on public.briefings for select to authenticated using (owner_id = auth.uid());
create policy briefings_insert on public.briefings for insert to authenticated with check (owner_id = auth.uid());
create policy briefings_update on public.briefings for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy briefings_delete on public.briefings for delete to authenticated using (owner_id = auth.uid() and status = 'open');

drop policy if exists signatures_select on public.signatures;
drop policy if exists signatures_insert on public.signatures;
create policy signatures_select on public.signatures for select to authenticated
  using (exists (select 1 from public.briefings b where b.id = briefing_id and b.owner_id = auth.uid()));
create policy signatures_insert on public.signatures for insert to authenticated
  with check (method = 'manager' and exists (select 1 from public.briefings b where b.id = briefing_id and b.owner_id = auth.uid()));

alter table public.custom_topics enable row level security;
drop policy if exists custom_topics_all on public.custom_topics;
create policy custom_topics_all on public.custom_topics for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
revoke all on public.custom_topics from anon;

-- הרשאות: אנונימיים לא נוגעים בטבלאות בכלל; hash הסיסמה לא נחשף אף פעם
revoke all on public.sites, public.briefings, public.signatures from anon;
revoke all on public.sites from authenticated;
grant select (id, owner_id, name, created_at) on public.sites to authenticated;
grant update (name) on public.sites to authenticated;
grant delete on public.sites to authenticated;
revoke update, delete on public.signatures from authenticated;
-- פרויקטים חדשים ב-Supabase לא נותנים הרשאות אוטומטיות לטבלאות חדשות — לכן הרשאות מפורשות (RLS עדיין מגביל לבעלים בלבד)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.briefings     to authenticated;
grant select, insert                 on public.signatures    to authenticated;
grant select, insert, update, delete on public.custom_topics to authenticated;
revoke truncate, references, trigger on public.sites, public.briefings, public.signatures, public.custom_topics from anon, authenticated;

-- ---------- פונקציות למנהל ----------

create or replace function public.create_site(p_name text, p_password text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if length(coalesce(p_password, '')) < 4 then raise exception 'password_too_short'; end if;
  insert into public.sites(owner_id, name, password_hash)
  values (auth.uid(), trim(p_name), crypt(p_password, gen_salt('bf', 10)))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.set_site_password(p_site uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if length(coalesce(p_password, '')) < 4 then raise exception 'password_too_short'; end if;
  update public.sites set password_hash = crypt(p_password, gen_salt('bf', 10))
   where id = p_site and owner_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
end $$;

-- ---------- פונקציות לפועלים (ללא הרשמה; סיסמת אתר נבדקת בשרת בכל קריאה) ----------

create or replace function public._site_ok(p_site uuid, p_password text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare h text;
begin
  select password_hash into h from public.sites where id = p_site;
  if h is null or p_password is null or h <> crypt(p_password, h) then
    perform pg_sleep(0.4);  -- האטה מול ניחוש סיסמאות
    return false;
  end if;
  return true;
end $$;

create or replace function public.worker_get_briefing(p_site uuid, p_password text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_name text; b public.briefings%rowtype;
begin
  if not public._site_ok(p_site, p_password) then
    return jsonb_build_object('error', 'bad_password');
  end if;
  select name into v_name from public.sites where id = p_site;
  select * into b from public.briefings
   where site_id = p_site and briefing_date = (now() at time zone 'Asia/Jerusalem')::date
   order by (status = 'open') desc, briefing_time desc, created_at desc
   limit 1;
  if b.id is null then
    return jsonb_build_object('error', 'no_briefing', 'site_name', v_name);
  end if;
  return jsonb_build_object(
    'site_name', v_name,
    'briefing', jsonb_build_object(
      'id', b.id, 'date', b.briefing_date, 'time', to_char(b.briefing_time, 'HH24:MI'),
      'foreman', b.foreman_name, 'topics', to_jsonb(b.topics), 'custom_topics', b.custom_topics,
      'notes', b.notes, 'status', b.status));
end $$;

create or replace function public.worker_sign(
  p_site uuid, p_password text, p_briefing uuid,
  p_full_name text, p_contractor text, p_attended boolean, p_photo text, p_signature text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare b public.briefings%rowtype;
begin
  if not public._site_ok(p_site, p_password) then
    return jsonb_build_object('error', 'bad_password');
  end if;
  select * into b from public.briefings where id = p_briefing and site_id = p_site;
  if b.id is null or b.briefing_date <> (now() at time zone 'Asia/Jerusalem')::date then
    return jsonb_build_object('error', 'no_briefing');
  end if;
  if b.status <> 'open' then return jsonb_build_object('error', 'closed'); end if;
  if coalesce(p_attended, false) = false or coalesce(length(trim(p_full_name)), 0) < 2
     or coalesce(length(trim(p_contractor)), 0) < 1
     or coalesce(length(p_photo), 0) < 500 or coalesce(length(p_signature), 0) < 500 then
    return jsonb_build_object('error', 'invalid');
  end if;
  begin
    insert into public.signatures(briefing_id, full_name, contractor, attended, photo, signature, method)
    values (p_briefing, p_full_name, p_contractor, true, p_photo, p_signature, 'qr');
  exception
    when unique_violation then return jsonb_build_object('error', 'duplicate');
    when check_violation  then return jsonb_build_object('error', 'invalid');
    when raise_exception  then
      if sqlerrm = 'briefing_closed' then return jsonb_build_object('error', 'closed'); end if;
      raise;
  end;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public._site_ok(uuid, text) from public, anon, authenticated;
revoke all on function public.worker_get_briefing(uuid, text) from public;
revoke all on function public.worker_sign(uuid, text, uuid, text, text, boolean, text, text) from public;
revoke all on function public.create_site(text, text) from public, anon;
revoke all on function public.set_site_password(uuid, text) from public, anon;
grant execute on function public.worker_get_briefing(uuid, text) to anon, authenticated;
grant execute on function public.worker_sign(uuid, text, uuid, text, text, boolean, text, text) to anon, authenticated;
grant execute on function public.create_site(text, text) to authenticated;
grant execute on function public.set_site_password(uuid, text) to authenticated;
