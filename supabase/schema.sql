create table calls (
  id uuid default gen_random_uuid() primary key,
  contact_name text not null,
  company text,
  phone text,
  outcome text check (outcome in ('no_answer','voicemail','callback','interested','not_interested','closed','whatsapp')),
  notes text,
  follow_up_at timestamptz default null,
  called_at timestamptz default null,  -- null = imported but not yet called; set when call is logged
  outcome_updated_at timestamptz default null,  -- set when outcome changes from one value to another
  attempt_count int default 0,  -- 0 = not yet called, 1 = first call, 2+ = subsequent attempts
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_calls_created_at on calls(created_at);
create index idx_calls_called_at on calls(called_at);
create index idx_calls_follow_up_at on calls(follow_up_at);
create index idx_calls_duration on calls(duration_seconds);

-- Settings table (run this in Supabase Dashboard → SQL Editor)
create table settings (
  key text primary key,
  value text not null
);
insert into settings (key, value) values ('daily_goal', '50');

-- Achievements table (run this in Supabase Dashboard → SQL Editor)
create table achievements (
  key text primary key,
  unlocked_at timestamptz default now(),
  trigger_count int default 1
);
