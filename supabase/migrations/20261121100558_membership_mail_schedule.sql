create extension if not exists supabase_vault with schema vault;
create extension if not exists pg_net with schema extensions;

create function private.request_membership_mail_processing()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  worker_url text;
  worker_secret text;
begin
  if not exists (
    select 1 from private.email_deliveries as delivery
    where delivery.status in ('pending', 'processing')
      and delivery.available_at <= statement_timestamp()
      and delivery.expires_at > statement_timestamp()
      and (delivery.lease_expires_at is null or delivery.lease_expires_at <= statement_timestamp())
  ) then
    return;
  end if;

  select decrypted_secret into worker_url
  from vault.decrypted_secrets where name = 'membership_mail_worker_url';
  select decrypted_secret into worker_secret
  from vault.decrypted_secrets where name = 'membership_mail_worker_secret';

  if worker_url is null or worker_secret is null then
    return;
  end if;

  perform net.http_post(
    url := worker_url,
    headers := jsonb_build_object('Authorization', 'Bearer ' || worker_secret, 'Content-Type', 'application/json'),
    timeout_milliseconds := 20000
  );
end;
$$;

revoke execute on function private.request_membership_mail_processing()
from public, anon, authenticated, service_role;

select cron.schedule('jmmc-process-membership-mail', '* * * * *',
  $$select private.request_membership_mail_processing();$$);
