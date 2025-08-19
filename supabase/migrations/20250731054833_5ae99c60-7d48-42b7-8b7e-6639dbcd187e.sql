-- إضافة سياسة جديدة للسماح بالوصول العام للتوكنات الافتراضية
CREATE POLICY "Allow public access to default API keys" 
ON public.api_keys 
FOR SELECT 
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);