-- دالة للحصول على نشاط الويب هوك الأخير
CREATE OR REPLACE FUNCTION public.get_recent_webhook_activity(p_page_id text, p_hours integer DEFAULT 24)
RETURNS TABLE(
  event_id uuid,
  event_type text,
  user_name text,
  content text,
  status text,
  created_at timestamp with time zone,
  auto_replied boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  return query
  select 
    pe.id,
    pe.event_type,
    pe.user_name,
    pe.content,
    pe.status,
    pe.created_at,
    pe.auto_replied
  from public.page_events pe
  where pe.page_id = p_page_id
    and pe.created_at >= now() - (p_hours || ' hours')::interval
  order by pe.created_at desc
  limit 50;
end;
$function$