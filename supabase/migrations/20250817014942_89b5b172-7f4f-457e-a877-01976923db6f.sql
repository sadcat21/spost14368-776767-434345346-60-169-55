-- تفعيل الأتمتة وتمديد الاشتراك للصفحات الموجودة
UPDATE automation_subscriptions 
SET 
  automation_active = true,
  subscription_end = now() + interval '30 days',
  credits_remaining = 100,
  updated_at = now()
WHERE custom_page_token IN (
  'b086cefe37b49ead09ceff449feda43c7f2aa86986741a9815708ef3ec80768b',
  '4f614575b56e9bb9c9724761857c9b204ef8ab313822bad009cb5b9b365c52b5'
);