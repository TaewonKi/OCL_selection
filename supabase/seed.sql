-- Local dev/test data only. Runs on `supabase db reset`, never on `db push`.
-- Edit per year for local testing; set real production trips/quotas via the
-- Supabase dashboard table editor instead.
insert into trips (name, quota, stops) values
  ('Trip A', 40, '["Phuket", "Trang", "Panga"]'::jsonb),
  ('Trip B', 40, '["Chiang Mai", "Chiang Rai"]'::jsonb);
