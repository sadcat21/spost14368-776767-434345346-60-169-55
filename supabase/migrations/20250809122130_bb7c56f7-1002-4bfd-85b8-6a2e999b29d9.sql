-- تحديث نظام الردود التلقائية للعمل مع جميع الصفحات النشطة
-- حذف القواعد الموجودة وإنشاء قواعد ديناميكية

-- حذف القواعد القديمة
DELETE FROM auto_replies;

-- إدراج قواعد الرد التلقائي لجميع الصفحات النشطة
INSERT INTO auto_replies (page_id, reply_message, trigger_keywords, reply_type, priority, is_active)
SELECT 
  page_id,
  'شكرًا لتواصلك معنا! 🌟 للمزيد من التفاصيل حول الأسعار، يُرجى مراسلتنا على الخاص 📩',
  ARRAY['سعر', 'تكلفة', 'كم', 'price', 'cost'],
  'comment',
  5,
  true
FROM facebook_pages WHERE is_active = true;

INSERT INTO auto_replies (page_id, reply_message, trigger_keywords, reply_type, priority, is_active)
SELECT 
  page_id,
  'بارك الله فيك! 🙏 نسأل الله أن يتقبل منا ومنكم صالح الأعمال. للاستفسار، لا تتردد في مراسلتنا 💬',
  ARRAY['الله', 'ربي', 'أمين', 'بارك', 'تقبل'],
  'comment',
  4,
  true
FROM facebook_pages WHERE is_active = true;

INSERT INTO auto_replies (page_id, reply_message, trigger_keywords, reply_type, priority, is_active)
SELECT 
  page_id,
  'مرحبًا بك! 👋 للمزيد من التفاصيل حول المواقع والمواعيد، يُرجى التواصل معنا على الخاص 📍',
  ARRAY['ولاية', 'أين', 'مكان', 'موقع', 'where'],
  'comment',
  4,
  true
FROM facebook_pages WHERE is_active = true;

INSERT INTO auto_replies (page_id, reply_message, trigger_keywords, reply_type, priority, is_active)
SELECT 
  page_id,
  'أهلاً وسهلاً! 🎓 للمزيد من التفاصيل حول الشهادات والاعتماد، يُرجى مراسلتنا على الخاص 📜',
  ARRAY['شهادة', 'معتمدة', 'معترف', 'اعتماد', 'certificate'],
  'comment',
  5,
  true
FROM facebook_pages WHERE is_active = true;

INSERT INTO auto_replies (page_id, reply_message, trigger_keywords, reply_type, priority, is_active)
SELECT 
  page_id,
  'شكرًا لك على اهتمامك! 🌟 للمزيد من المعلومات، يُرجى مراسلتنا على الخاص 💬',
  ARRAY['معلومات', 'تفاصيل', 'details', 'info'],
  'comment',
  3,
  true
FROM facebook_pages WHERE is_active = true;

-- إنشاء دالة لإضافة قواعد الرد التلقائي تلقائياً عند إضافة صفحة جديدة
CREATE OR REPLACE FUNCTION add_auto_replies_for_new_page()
RETURNS TRIGGER AS $$
BEGIN
  -- إضافة القواعد الافتراضية للصفحة الجديدة إذا كانت نشطة
  IF NEW.is_active = true THEN
    INSERT INTO auto_replies (page_id, reply_message, trigger_keywords, reply_type, priority, is_active) VALUES
    (NEW.page_id, 'شكرًا لتواصلك معنا! 🌟 للمزيد من التفاصيل حول الأسعار، يُرجى مراسلتنا على الخاص 📩', ARRAY['سعر', 'تكلفة', 'كم', 'price', 'cost'], 'comment', 5, true),
    (NEW.page_id, 'بارك الله فيك! 🙏 نسأل الله أن يتقبل منا ومنكم صالح الأعمال. للاستفسار، لا تتردد في مراسلتنا 💬', ARRAY['الله', 'ربي', 'أمين', 'بارك', 'تقبل'], 'comment', 4, true),
    (NEW.page_id, 'مرحبًا بك! 👋 للمزيد من التفاصيل حول المواقع والمواعيد، يُرجى التواصل معنا على الخاص 📍', ARRAY['ولاية', 'أين', 'مكان', 'موقع', 'where'], 'comment', 4, true),
    (NEW.page_id, 'أهلاً وسهلاً! 🎓 للمزيد من التفاصيل حول الشهادات والاعتماد، يُرجى مراسلتنا على الخاص 📜', ARRAY['شهادة', 'معتمدة', 'معترف', 'اعتماد', 'certificate'], 'comment', 5, true),
    (NEW.page_id, 'شكرًا لك على اهتمامك! 🌟 للمزيد من المعلومات، يُرجى مراسلتنا على الخاص 💬', ARRAY['معلومات', 'تفاصيل', 'details', 'info'], 'comment', 3, true);
  END IF;

  -- إزالة قواعد الصفحة إذا تم إلغاء تفعيلها
  IF OLD.is_active = true AND NEW.is_active = false THEN
    DELETE FROM auto_replies WHERE page_id = NEW.page_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لإضافة القواعد تلقائياً
DROP TRIGGER IF EXISTS trigger_add_auto_replies_for_new_page ON facebook_pages;
CREATE TRIGGER trigger_add_auto_replies_for_new_page
  AFTER INSERT OR UPDATE ON facebook_pages
  FOR EACH ROW
  EXECUTE FUNCTION add_auto_replies_for_new_page();