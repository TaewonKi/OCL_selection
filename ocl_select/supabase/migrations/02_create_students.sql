-- Create students table
create table students (
  student_id text primary key,
  name text not null,
  surname text not null,
  class text,
  class_no text,
  city_id uuid references cities(id),
  created_at timestamptz default now()
);

-- Create index on city_id for faster counting queries
create index idx_students_city_id on students(city_id);
