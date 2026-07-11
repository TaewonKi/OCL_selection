-- Optional: Row Level Security (RLS) Policies
-- Uncomment and run these if you want to add RLS protection

-- Enable RLS on trips table (read-only for public)
-- ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Trips are viewable by everyone"
--   ON trips FOR SELECT
--   USING (true);

-- Enable RLS on students table
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Students can view all registrations"
--   ON students FOR SELECT
--   USING (true);

-- CREATE POLICY "Only authenticated users can insert students"
--   ON students FOR INSERT
--   WITH CHECK (true);

-- Enable Realtime for students table
ALTER PUBLICATION supabase_realtime ADD TABLE students;
