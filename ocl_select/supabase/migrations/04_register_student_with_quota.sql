-- Register student inside a single transaction and enforce per-city quotas
create or replace function register_student_with_quota(
  p_student_id text,
  p_name text,
  p_surname text,
  p_class text,
  p_class_no text,
  p_city_id uuid
)
returns jsonb
language plpgsql
as $$
declare
  v_quota int;
  v_current_count int;
begin
  -- Serialize registrations per city so concurrent requests cannot exceed the quota
  perform pg_advisory_xact_lock(hashtext(p_city_id::text));

  select quota
    into v_quota
    from cities
   where id = p_city_id
   for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error_code', 'INVALID_CITY',
      'message', 'Invalid city selected.'
    );
  end if;

  if exists (select 1 from students where student_id = p_student_id) then
    return jsonb_build_object(
      'success', false,
      'error_code', 'ALREADY_REGISTERED',
      'message', 'This student has already applied.'
    );
  end if;

  select count(*)
    into v_current_count
    from students
   where city_id = p_city_id;

  if v_current_count >= v_quota then
    return jsonb_build_object(
      'success', false,
      'error_code', 'QUOTA_FULL',
      'message', 'The selected city is full.'
    );
  end if;

  insert into students (student_id, name, surname, class, class_no, city_id)
  values (p_student_id, p_name, p_surname, p_class, p_class_no, p_city_id);

  return jsonb_build_object(
    'success', true,
    'message', 'Registered successfully.'
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'success', false,
      'error_code', 'ALREADY_REGISTERED',
      'message', 'This student has already applied.'
    );
end;
$$;
