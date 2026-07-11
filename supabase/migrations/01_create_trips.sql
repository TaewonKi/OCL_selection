-- Create trips table
create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quota int not null,
  stops jsonb not null default '[]'::jsonb
);
