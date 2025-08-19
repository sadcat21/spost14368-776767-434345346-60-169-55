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

-- دالة للتحقق من صحة إعدادات الأتمتة
CREATE OR REPLACE FUNCTION public.validate_automation_settings(
  p_posts_per_day integer,
  p_execution_times jsonb,
  p_content_type text
)
RETURNS TABLE(
  is_valid boolean,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  times_count integer;
  valid_content_types text[] := ARRAY['mixed', 'promotional', 'educational', 'entertainment'];
begin
  -- التحقق من عدد المنشورات في اليوم
  if p_posts_per_day < 1 or p_posts_per_day > 10 then
    return query select false, 'عدد المنشورات يجب أن يكون بين 1 و 10';
    return;
  end if;

  -- التحقق من أوقات التنفيذ
  select jsonb_array_length(p_execution_times) into times_count;
  if times_count != p_posts_per_day then
    return query select false, 'عدد أوقات التنفيذ يجب أن يساوي عدد المنشورات في اليوم';
    return;
  end if;

  -- التحقق من نوع المحتوى
  if not (p_content_type = ANY(valid_content_types)) then
    return query select false, 'نوع المحتوى غير صالح';
    return;
  end if;

  -- إذا وصلنا هنا، فالإعدادات صحيحة
  return query select true, 'الإعدادات صحيحة'::text;
end;
$function$

-- دالة للحصول على مقاييس أداء الصفحة
CREATE OR REPLACE FUNCTION public.get_page_performance_metrics(p_page_id text, p_days integer DEFAULT 7)
RETURNS TABLE(
  total_interactions integer,
  avg_response_time interval,
  engagement_rate numeric,
  peak_activity_hour integer,
  error_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  return query
  select 
    count(*)::integer as total_interactions,
    avg(pe.updated_at - pe.created_at) as avg_response_time,
    case 
      when count(*) > 0 then 
        round((count(case when pe.auto_replied = true then 1 end)::numeric / count(*)::numeric) * 100, 2)
      else 0
    end as engagement_rate,
    mode() within group (order by extract(hour from pe.created_at))::integer as peak_activity_hour,
    case 
      when count(*) > 0 then 
        round((count(case when pe.status = 'error' then 1 end)::numeric / count(*)::numeric) * 100, 2)
      else 0
    end as error_rate
  from public.page_events pe
  where pe.page_id = p_page_id
    and pe.created_at >= now() - (p_days || ' days')::interval;
end;
$function$

-- دالة لإدارة الاعتمادات بكفاءة
CREATE OR REPLACE FUNCTION public.manage_user_credits(
  p_user_id uuid,
  p_action text, -- 'add', 'deduct', 'reset'
  p_amount integer DEFAULT 0
)
RETURNS TABLE(
  success boolean,
  new_total integer,
  new_remaining integer,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  subscription_record record;
begin
  -- الحصول على سجل الاشتراك
  select * into subscription_record
  from public.automation_subscriptions
  where user_id = p_user_id
  limit 1;

  if not found then
    return query select false, 0, 0, 'لا يوجد اشتراك للمستخدم'::text;
    return;
  end if;

  case p_action
    when 'add' then
      update public.automation_subscriptions
      set 
        credits_total = credits_total + p_amount,
        credits_remaining = credits_remaining + p_amount,
        updated_at = now()
      where user_id = p_user_id
      returning credits_total, credits_remaining into subscription_record.credits_total, subscription_record.credits_remaining;
      
      return query select true, subscription_record.credits_total, subscription_record.credits_remaining, 'تم إضافة الاعتمادات بنجاح'::text;

    when 'deduct' then
      if subscription_record.credits_remaining < p_amount then
        return query select false, subscription_record.credits_total, subscription_record.credits_remaining, 'اعتمادات غير كافية'::text;
        return;
      end if;

      update public.automation_subscriptions
      set 
        credits_remaining = credits_remaining - p_amount,
        credits_used = credits_used + p_amount,
        updated_at = now()
      where user_id = p_user_id
      returning credits_total, credits_remaining into subscription_record.credits_total, subscription_record.credits_remaining;
      
      return query select true, subscription_record.credits_total, subscription_record.credits_remaining, 'تم خصم الاعتمادات بنجاح'::text;

    when 'reset' then
      update public.automation_subscriptions
      set 
        credits_remaining = credits_total,
        credits_used = 0,
        updated_at = now()
      where user_id = p_user_id
      returning credits_total, credits_remaining into subscription_record.credits_total, subscription_record.credits_remaining;
      
      return query select true, subscription_record.credits_total, subscription_record.credits_remaining, 'تم إعادة تعيين الاعتمادات بنجاح'::text;

    else
      return query select false, subscription_record.credits_total, subscription_record.credits_remaining, 'إجراء غير صالح'::text;
  end case;
end;
$function$

-- دالة للحصول على تقرير شامل للنشاط
CREATE OR REPLACE FUNCTION public.get_activity_report(p_user_id uuid, p_start_date date DEFAULT (now() - interval '30 days')::date, p_end_date date DEFAULT now()::date)
RETURNS TABLE(
  date_period date,
  total_events integer,
  successful_replies integer,
  failed_events integer,
  credits_used integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  return query
  select 
    pe.created_at::date as date_period,
    count(*)::integer as total_events,
    count(case when pe.auto_replied = true and pe.status = 'success' then 1 end)::integer as successful_replies,
    count(case when pe.status = 'error' then 1 end)::integer as failed_events,
    coalesce(sum(case when pe.auto_replied = true then 1 else 0 end), 0)::integer as credits_used
  from public.page_events pe
  join public.facebook_pages fp on pe.page_id = fp.page_id
  where fp.user_id = p_user_id
    and pe.created_at::date between p_start_date and p_end_date
  group by pe.created_at::date
  order by pe.created_at::date desc;
end;
$function$