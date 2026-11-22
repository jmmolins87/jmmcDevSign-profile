create function private.record_denied_registration_decision(p_actor_id uuid, p_result text)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into private.audit_events (actor_id, action, result)
  values (
    p_actor_id,
    'decision-denied',
    case when p_result in ('invalid-input', 'forbidden', 'unavailable') then p_result else 'invalid-input' end
  );
$$;

create function public.record_denied_registration_decision(p_result text, p_actor_id uuid default null)
returns void
language sql
security invoker
set search_path = ''
as $$ select private.record_denied_registration_decision(p_actor_id, p_result); $$;

revoke execute on function private.record_denied_registration_decision(uuid, text),
  public.record_denied_registration_decision(text, uuid) from public, anon, authenticated, service_role;
grant execute on function private.record_denied_registration_decision(uuid, text),
  public.record_denied_registration_decision(text, uuid) to service_role;
