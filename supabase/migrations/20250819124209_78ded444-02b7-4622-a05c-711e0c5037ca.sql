-- دالة للحصول على إحصائيات المستخدم الشاملة
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(p_user_id uuid)
RETURNS TABLE(
  total_pages integer,
  active_subscriptions integer,
  total_events integer,
  total_credits integer,
  used_credits integer,
  webhook_success_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  return query
  select 
    count(distinct fp.id)::integer as total_pages,
    count(distinct case when asub.automation_active = true and asub.subscription_end > now() then asub.id end)::integer as active_subscriptions,
    count(distinct pe.id)::integer as total_events,
    coalesce(sum(distinct asub.credits_total), 0)::integer as total_credits,
    coalesce(sum(distinct asub.credits_used), 0)::integer as used_credits,
    case 
      when count(pe.id) > 0 then 
        round((count(case when pe.status = 'success' then 1 end)::numeric / count(pe.id)::numeric) * 100, 2)
      else 0
    end as webhook_success_rate
  from public.facebook_pages fp
  left join public.automation_subscriptions asub on fp.user_id = asub.user_id
  left join public.page_events pe on fp.page_id = pe.page_id
  where fp.user_id = p_user_id;
end;
$function$