-- HomeLink database schema
-- Run in Supabase SQL Editor. RLS policies keep each role scoped to its own data.

create type public.user_role as enum ('worker', 'household', 'broker');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.job_type as enum ('full_time', 'part_time', 'weekend', 'live_in', 'live_out');
create type public.application_status as enum ('submitted', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn');
create type public.placement_status as enum ('pending', 'active', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name text not null default '',
  phone text,
  avatar_path text,
  location text default 'Addis Ababa',
  skills text[] not null default '{}',
  experience_years integer,
  expected_salary numeric,
  availability text,
  experience_document_path text,
  guarantor_name text,
  guarantor_document_path text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  owner_name text not null,
  address text not null,
  phone text not null,
  license_number text not null,
  license_document_path text not null,
  verification_status public.verification_status not null default 'pending',
  average_rating numeric(2,1) default 0,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  broker_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null default '',
  skill text not null,
  location text not null,
  job_type public.job_type not null,
  salary numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'submitted',
  cover_message text not null default '',
  created_at timestamptz not null default now(),
  unique(job_id, worker_id)
);

create table public.saved_jobs (
  worker_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(worker_id, job_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  meeting_note text not null default '',
  status text not null default 'proposed',
  created_at timestamptz not null default now()
);

create table public.placements (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles(id),
  employer_id uuid not null references public.profiles(id),
  broker_id uuid references public.profiles(id),
  job_id uuid references public.jobs(id),
  status public.placement_status not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid not null references public.placements(id) on delete cascade,
  employer_id uuid not null references public.profiles(id),
  broker_id uuid references public.profiles(id),
  homelink_amount numeric not null default 0,
  broker_amount numeric not null default 0,
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  subject_id uuid not null references public.profiles(id),
  placement_id uuid references public.placements(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.messages enable row level security;
alter table public.interviews enable row level security;
alter table public.placements enable row level security;
alter table public.commissions enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are publicly readable" on public.profiles for select using (true);
create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "verified businesses are readable" on public.business_profiles for select using (verification_status = 'verified' or auth.uid() = id);
create policy "business owners manage business profile" on public.business_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "active jobs are readable" on public.jobs for select using (is_active = true or auth.uid() = employer_id or auth.uid() = broker_id);
create policy "employers and brokers manage jobs" on public.jobs for all using (auth.uid() = employer_id or auth.uid() = broker_id) with check (auth.uid() = employer_id or auth.uid() = broker_id);
create policy "workers manage own applications" on public.applications for all using (auth.uid() = worker_id or auth.uid() in (select employer_id from public.jobs where id = job_id) or auth.uid() in (select broker_id from public.jobs where id = job_id));
create policy "workers manage saved jobs" on public.saved_jobs for all using (auth.uid() = worker_id) with check (auth.uid() = worker_id);
create policy "participants manage messages" on public.messages for all using (auth.uid() = sender_id or auth.uid() = recipient_id) with check (auth.uid() = sender_id);
create policy "participants manage interviews" on public.interviews for all using (auth.uid() in (select worker_id from public.applications where id = application_id) or auth.uid() in (select j.employer_id from public.applications a join public.jobs j on j.id = a.job_id where a.id = application_id));
create policy "placement participants read placements" on public.placements for select using (auth.uid() in (worker_id, employer_id, broker_id));
create policy "employers and brokers manage placements" on public.placements for all using (auth.uid() in (employer_id, broker_id)) with check (auth.uid() in (employer_id, broker_id));
create policy "commission participants read records" on public.commissions for select using (auth.uid() in (employer_id, broker_id));
create policy "participants manage reviews" on public.reviews for all using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications for update using (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name, phone) values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'worker'), coalesce(new.raw_user_meta_data->>'full_name', ''), new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
