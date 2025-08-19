-- إضافة policy للسماح بحفظ access token للمستخدم الافتراضي
CREATE POLICY "Allow default user access to Facebook tokens" ON public.api_keys
FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);