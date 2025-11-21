-- Add level column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS level TEXT;
