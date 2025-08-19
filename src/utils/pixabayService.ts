import { supabase } from '@/integrations/supabase/client';

export interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  views: number;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

/**
 * خدمة البحث في صور Pixabay كحل احتياطي
 */
export class PixabayService {
  private apiKey: string | null = null;

  constructor() {
    // سيتم تحميل المفتاح من Supabase
  }

  /**
   * تحميل مفتاح API من Supabase
   */
  private async loadApiKey(): Promise<string | null> {
    if (this.apiKey) {
      return this.apiKey;
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-pixabay-key');
      
      if (error) {
        console.error('خطأ في استدعاء Supabase function:', error);
        return null;
      }
      
      if (data?.hasKey && data?.apiKey) {
        this.apiKey = data.apiKey;
        return this.apiKey;
      }
      
      return null;
    } catch (error) {
      console.error('خطأ في تحميل مفتاح Pixabay:', error);
      return null;
    }
  }

  /**
   * البحث عن صورة مناسبة باستخدام كلمات مفتاحية إنجليزية
   */
  async searchImage(searchQuery: string): Promise<string | null> {
    try {
      // تحميل مفتاح API أولاً
      const apiKey = await this.loadApiKey();
      
      if (!apiKey) {
        console.warn('لا يوجد مفتاح Pixabay API متاح');
        return null;
      }

      // تنظيف النص للبحث
      const cleanQuery = this.cleanSearchQuery(searchQuery);
      
      if (!cleanQuery) {
        console.warn('لا يوجد نص صالح للبحث في Pixabay');
        return null;
      }

      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(cleanQuery)}&image_type=photo&orientation=all&category=backgrounds,business,computer,education,fashion,food,health,nature,people,places,science,sports,transportation,travel&min_width=800&min_height=600&per_page=20&safesearch=true`;

      console.log('البحث في Pixabay باستخدام الاستعلام:', cleanQuery);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data: PixabayResponse = await response.json();

      if (data.hits && data.hits.length > 0) {
        // اختيار صورة عشوائية من أفضل النتائج
        const randomIndex = Math.floor(Math.random() * Math.min(data.hits.length, 10));
        const selectedImage = data.hits[randomIndex];
        
        console.log('تم العثور على صورة مناسبة في Pixabay:', selectedImage.tags);
        
        return selectedImage.largeImageURL || selectedImage.webformatURL;
      }

      console.warn('لم يتم العثور على صور مناسبة في Pixabay');
      return null;

    } catch (error) {
      console.error('خطأ في البحث في Pixabay:', error);
      return null;
    }
  }

  /**
   * تنظيف النص لإنشاء استعلام بحث مناسب
   */
  private cleanSearchQuery(text: string): string {
    // إزالة الرموز الخاصة والحفاظ على الكلمات الإنجليزية فقط
    let cleanText = text
      .replace(/[^\w\s]/g, ' ') // إزالة الرموز الخاصة
      .replace(/\s+/g, ' ') // تحويل المسافات المتعددة إلى مسافة واحدة
      .trim()
      .toLowerCase();

    // استخراج الكلمات الإنجليزية فقط
    const englishWords = cleanText
      .split(' ')
      .filter(word => 
        word.length > 2 && 
        /^[a-z]+$/.test(word) && // كلمات إنجليزية فقط
        !this.isStopWord(word) // استبعاد الكلمات الشائعة
      );

    // أخذ أول 3-5 كلمات مهمة
    const finalQuery = englishWords.slice(0, 5).join(' ');
    
    return finalQuery || 'business professional';
  }

  /**
   * فحص الكلمات الشائعة التي يجب تجنبها
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'they', 'them', 'their', 'there',
      'image', 'photo', 'picture', 'professional', 'background'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * توليد كلمات بحث إنجليزية من الموضوع والتخصص
   */
  generateSearchQuery(topic: string, specialty: string): string {
    // ترجمة بعض المصطلحات العربية المهمة
    const translations: { [key: string]: string } = {
      'طب': 'medical healthcare',
      'تقنية': 'technology tech',
      'تعليم': 'education learning',
      'تسويق': 'marketing business',
      'صحة': 'health fitness',
      'طعام': 'food restaurant',
      'سفر': 'travel tourism',
      'موضة': 'fashion style',
      'رياضة': 'sports fitness',
      'فن': 'art culture',
      'عقارات': 'real estate property',
      'سيارات': 'cars automotive',
      'منشور': 'business social media',
      'إعلان': 'advertising marketing',
      'تعليمي': 'education training',
      'نصائح': 'tips advice',
      'قصة': 'story success',
      'عرض': 'offer promotion'
    };

    let searchTerms: string[] = [];

    // إضافة ترجمة التخصص
    if (translations[specialty]) {
      searchTerms.push(translations[specialty]);
    }

    // محاولة استخراج كلمات إنجليزية من الموضوع
    const englishWordsInTopic = topic
      .split(/\s+/)
      .filter(word => /^[a-zA-Z]+$/.test(word))
      .slice(0, 3);
    
    if (englishWordsInTopic.length > 0) {
      searchTerms.push(...englishWordsInTopic);
    }

    // إضافة كلمات عامة احترافية
    searchTerms.push('professional', 'business');

    return searchTerms.slice(0, 5).join(' ');
  }
}