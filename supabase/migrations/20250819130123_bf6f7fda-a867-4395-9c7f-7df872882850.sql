-- دالة لإدارة الاعتمادات بكفاءة
CREATE OR REPLACE FUNCTION public.manage_user_credits(
  p_user_id uuid,
  p_action text,
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
$function$;