-- Atomic registration: locks the trip row so concurrent requests for the
-- same trip serialize instead of racing past the quota check (TOCTOU fix).
create or replace function register_student(
  p_student_id text,
  p_name text,
  p_surname text,
  p_class text,
  p_class_no text,
  p_trip_id uuid
) returns jsonb
language plpgsql
as $$
declare
  v_quota int;
  v_count int;
begin
  select quota into v_quota
  from trips
  where id = p_trip_id
  for update;

  if v_quota is null then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_TRIP');
  end if;

  if exists (select 1 from students where student_id = p_student_id) then
    return jsonb_build_object('success', false, 'error_code', 'ALREADY_REGISTERED');
  end if;

  select count(*) into v_count
  from students
  where trip_id = p_trip_id;

  if v_count >= v_quota then
    return jsonb_build_object('success', false, 'error_code', 'QUOTA_FULL');
  end if;

  insert into students (student_id, name, surname, class, class_no, trip_id)
  values (p_student_id, p_name, p_surname, p_class, p_class_no, p_trip_id);

  return jsonb_build_object('success', true);
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error_code', 'ALREADY_REGISTERED');
end;
$$;
