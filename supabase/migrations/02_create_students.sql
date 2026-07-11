-- Create students table
create table students (
  student_id text primary key,
  name text not null,
  surname text not null,
  class text,
  class_no text,
  trip_id uuid references trips(id),
  created_at timestamptz default now()
);

-- Create index on trip_id for faster counting queries
create index idx_students_trip_id on students(trip_id);
