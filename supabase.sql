create table if not exists public.artcard_progress (
  id bigint generated always as identity primary key,
  session_id text not null,
  milestone int not null,
  questions_answered int not null,
  first_try_correct int not null,
  accuracy numeric generated always as (
    first_try_correct::numeric / nullif(questions_answered, 0)
  ) stored,
  created_at timestamptz not null default now()
);

alter table public.artcard_progress enable row level security;

drop policy if exists "Anyone can submit artcard progress" on public.artcard_progress;

create policy "Anyone can submit artcard progress"
on public.artcard_progress
for insert
to anon
with check (
  milestone in (5, 10, 20, 30, 40, 50, 60, 70, 80, 100)
  and questions_answered = milestone
  and first_try_correct >= 0
  and first_try_correct <= questions_answered
  and length(session_id) between 8 and 80
);

create index if not exists artcard_progress_milestone_score_idx
on public.artcard_progress (milestone, first_try_correct);

create or replace function public.artcard_percentile(
  p_milestone int,
  p_first_try_correct int
)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select greatest(
    1,
    least(
      100,
      100 - round(
        100.0 * count(*) filter (
          where first_try_correct <= p_first_try_correct
        ) / greatest(count(*), 1)
      )::int
    )
  )
  from public.artcard_progress
  where milestone = p_milestone;
$$;

grant execute on function public.artcard_percentile(int, int) to anon;
