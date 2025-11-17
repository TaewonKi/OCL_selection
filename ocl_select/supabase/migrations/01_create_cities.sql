-- Create cities table
create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quota int not null
);

-- Insert sample cities with quotas
insert into cities (name, quota) values
  ('Bangkok', 50),
  ('Chiang Mai', 40),
  ('Phuket', 35),
  ('Pattaya', 45);
