import { useState, useEffect } from 'react';

const GEMINI_API_KEY_STORAGE = 'gemini-api-key';

export const useGeminiApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // تحميل المفتاح من localStorage عند التهيئة أو استخدام المفتاح الافتراضي
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);
      
      // إذا كان المفتاح المحفوظ هو المفتاح القديم المستنفد، استبدله بالجديد
      if (savedKey === 'AIzaSyAXyHKitdXVJQUWD7RTls-zF0fxfRYey00') {
        console.log('🔄 تم اكتشاف المفتاح القديم المستنفد، جاري تحديثه...');
        const newKey = 'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44';
        localStorage.setItem(GEMINI_API_KEY_STORAGE, newKey);
        setApiKey(newKey);
      } else if (savedKey) {
        setApiKey(savedKey);
      } else {
        // استخدام المفتاح الافتراضي الجديد
        const defaultKey = 'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44';
        setApiKey(defaultKey);
        localStorage.setItem(GEMINI_API_KEY_STORAGE, defaultKey);
      }
    } catch (error) {
      console.warn('خطأ في تحميل مفتاح API من localStorage:', error);
      // في حالة الخطأ، استخدم المفتاح الافتراضي الجديد
      const defaultKey = 'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44';
      setApiKey(defaultKey);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // حفظ المفتاح في localStorage
  const saveApiKey = (newKey: string) => {
    try {
      if (newKey.trim()) {
        localStorage.setItem(GEMINI_API_KEY_STORAGE, newKey.trim());
        setApiKey(newKey.trim());
      } else {
        localStorage.removeItem(GEMINI_API_KEY_STORAGE);
        setApiKey('');
      }
    } catch (error) {
      console.error('خطأ في حفظ مفتاح API:', error);
      throw new Error('فشل في حفظ مفتاح API');
    }
  };

  // حذف المفتاح
  const removeApiKey = () => {
    try {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
      setApiKey('');
    } catch (error) {
      console.error('خطأ في حذف مفتاح API:', error);
    }
  };

  // التحقق من وجود المفتاح
  const hasApiKey = () => {
    return apiKey.trim().length > 0;
  };

  return {
    apiKey,
    isLoaded,
    saveApiKey,
    removeApiKey,
    hasApiKey
  };
};