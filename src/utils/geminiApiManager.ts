// Gemini API client with intelligent key rotation and quota management

interface ApiKeyStats {
  key: string;
  isActive: boolean;
  failureCount: number;
  lastFailure?: Date;
  quotaResetTime?: Date;
}

export class GeminiApiManager {
  private static instance: GeminiApiManager;
  private apiKeys: ApiKeyStats[] = [];
  private currentKeyIndex = 0;
  private maxRetries = 3;

  private constructor() {
    this.initializeKeys();
  }

  public static getInstance(): GeminiApiManager {
    if (!GeminiApiManager.instance) {
      GeminiApiManager.instance = new GeminiApiManager();
    }
    return GeminiApiManager.instance;
  }

  // تهيئة المفاتيح الافتراضية والمخصصة
  private initializeKeys() {
    const defaultKeys = [
      'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44',
      'AIzaSyABcDefGhI1234567890JklMnOpQrStUvWx', // مفتاح احتياطي 1
      'AIzaSyCcDefGhI9876543210JklMnOpQrStUvXy', // مفتاح احتياطي 2
    ];

    this.apiKeys = defaultKeys.map(key => ({
      key,
      isActive: true,
      failureCount: 0
    }));

    console.log(`🔑 تم تهيئة ${this.apiKeys.length} مفاتيح API`);
  }

  // إضافة مفتاح مخصص من المستخدم
  public addUserKey(userKey: string) {
    if (userKey && userKey.trim() && !this.apiKeys.find(k => k.key === userKey.trim())) {
      this.apiKeys.unshift({
        key: userKey.trim(),
        isActive: true,
        failureCount: 0
      });
      this.currentKeyIndex = 0; // استخدم المفتاح الجديد أولاً
      console.log('🔑 تم إضافة مفتاح المستخدم وسيتم استخدامه كأولوية');
    }
  }

  // الحصول على المفتاح الحالي
  public getCurrentKey(): string {
    const activeKeys = this.apiKeys.filter(k => k.isActive);
    if (activeKeys.length === 0) {
      console.warn('⚠️ لا توجد مفاتيح فعالة، سيتم إعادة تعيين المفاتيح');
      this.resetAllFailedKeys();
      return this.apiKeys[0]?.key || '';
    }

    if (this.currentKeyIndex >= activeKeys.length) {
      this.currentKeyIndex = 0;
    }

    return activeKeys[this.currentKeyIndex]?.key || '';
  }

  // التحقق من خطأ الكوتا
  private isQuotaError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    const quotaKeywords = [
      'quota exceeded',
      'rate limit',
      'too many requests',
      'quota_exceeded',
      'resource_exhausted',
      '429'
    ];
    
    return quotaKeywords.some(keyword => errorMessage.includes(keyword));
  }

  // التبديل للمفتاح التالي
  private switchToNextKey(): boolean {
    const activeKeys = this.apiKeys.filter(k => k.isActive);
    
    if (activeKeys.length <= 1) {
      console.warn('⚠️ لا توجد مفاتيح بديلة متاحة');
      return false;
    }

    // تعطيل المفتاح الحالي مؤقتاً
    const currentKey = this.getCurrentKey();
    const keyStats = this.apiKeys.find(k => k.key === currentKey);
    if (keyStats) {
      keyStats.isActive = false;
      keyStats.failureCount++;
      keyStats.lastFailure = new Date();
      keyStats.quotaResetTime = new Date(Date.now() + 60 * 60 * 1000); // إعادة تجربة بعد ساعة
      console.log(`🔄 تم تعطيل المفتاح مؤقتاً: ${currentKey.substring(0, 20)}...`);
    }

    // الانتقال للمفتاح التالي
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    const newKey = this.getCurrentKey();
    console.log(`🔑 تم التبديل للمفتاح الجديد: ${newKey.substring(0, 20)}...`);
    
    return true;
  }

  // إعادة تفعيل المفاتيح المعطلة
  public resetAllFailedKeys(): void {
    const now = new Date();
    this.apiKeys.forEach(keyStats => {
      if (!keyStats.isActive && (!keyStats.quotaResetTime || now > keyStats.quotaResetTime)) {
        keyStats.isActive = true;
        keyStats.failureCount = 0;
        console.log(`✅ تم إعادة تفعيل المفتاح: ${keyStats.key.substring(0, 20)}...`);
      }
    });
  }

  // طلب HTTP مع إدارة ذكية للمفاتيح
  public async makeRequest(url: string, options: RequestInit, customApiKey?: string): Promise<Response> {
    // إضافة مفتاح المستخدم إذا تم توفيره
    if (customApiKey) {
      this.addUserKey(customApiKey);
    }

    let lastError: any;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        // إعادة تفعيل المفاتيح إذا انتهت فترة التعطيل
        this.resetAllFailedKeys();

        const currentKey = this.getCurrentKey();
        if (!currentKey) {
          throw new Error('لا توجد مفاتيح API متاحة');
        }

        console.log(`🚀 محاولة ${attempts + 1}/${this.maxRetries} باستخدام المفتاح: ${currentKey.substring(0, 20)}...`);

        // استخراج النموذج من URL
        const model = this.extractModelFromUrl(url) || 'gemini-2.0-flash-exp';
        
        // تحضير البيانات
        let payload: any = {};
        if (options?.body) {
          if (typeof options.body === 'string') {
            try { payload = JSON.parse(options.body); } catch { payload = {}; }
          } else {
            payload = options.body;
          }
        }

        // استدعاء Gemini API مباشرة
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
        
        const response = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log('✅ نجح الطلب');
          return response;
        }

        // التحقق من نوع الخطأ
        const errorText = await response.text();
        const error = { message: errorText, status: response.status };

        if (this.isQuotaError(error) && attempts < this.maxRetries - 1) {
          console.log('🔄 تم اكتشاف خطأ كوتا، جاري التبديل للمفتاح التالي...');
          
          if (this.switchToNextKey()) {
            attempts++;
            continue; // إعادة المحاولة مع المفتاح الجديد
          }
        }

        throw new Error(`خطأ في Gemini API: ${response.status} - ${errorText}`);

      } catch (error) {
        lastError = error;
        console.error(`❌ فشلت المحاولة ${attempts + 1}:`, error);

        if (this.isQuotaError(error) && attempts < this.maxRetries - 1) {
          if (this.switchToNextKey()) {
            attempts++;
            continue;
          }
        }

        attempts++;
        if (attempts >= this.maxRetries) {
          break;
        }
      }
    }

    console.error('💥 فشلت جميع المحاولات');
    throw lastError;
  }

  // استخراج اسم النموذج من URL
  private extractModelFromUrl(url: string): string | null {
    const match = url.match(/models\/([^:]+):generateContent/);
    return match ? match[1] : null;
  }

  // للتوافق مع الكود القديم
  public getApiUrl(): string {
    return 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  // الحصول على إحصائيات المفاتيح
  public getKeyStats(): { totalKeys: number; activeKeys: number; failedKeys: number; currentKey: string } {
    const activeKeys = this.apiKeys.filter(k => k.isActive);
    const failedKeys = this.apiKeys.filter(k => !k.isActive);
    
    return {
      totalKeys: this.apiKeys.length,
      activeKeys: activeKeys.length,
      failedKeys: failedKeys.length,
      currentKey: this.getCurrentKey().substring(0, 20) + '...'
    };
  }

  // إدارة خطأ الكوتا (للتوافق مع الكود القديم)
  public async handleQuotaError(): Promise<boolean> {
    return this.switchToNextKey();
  }
}

export const geminiApiManager = GeminiApiManager.getInstance();
