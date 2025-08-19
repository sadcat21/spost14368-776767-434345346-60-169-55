/**
 * مدير دوران مفاتيح API مع إعادة المحاولة التلقائية
 * API Key Rotation Manager with Automatic Retry
 */

interface ApiKeyRotationConfig {
  retryDelay?: number; // التأخير بين المحاولات بالميلي ثانية
  maxRetries?: number; // الحد الأقصى لعدد المحاولات
  errorCodes?: number[]; // أكواد الأخطاء التي تستدعي تبديل المفتاح
}

interface RequestConfig {
  url: string;
  options?: RequestInit;
  apiKeyParam?: string; // اسم معامل API key في URL (مثل 'key')
  apiKeyHeader?: string; // اسم header لـ API key (مثل 'Authorization')
}

export class ApiKeyRotationManager {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private config: Required<ApiKeyRotationConfig>;

  constructor(
    apiKeys: string[], 
    config: ApiKeyRotationConfig = {}
  ) {
    this.apiKeys = [...apiKeys]; // نسخة من المصفوفة
    this.config = {
      retryDelay: config.retryDelay || 500,
      maxRetries: config.maxRetries || apiKeys.length,
      errorCodes: config.errorCodes || [429, 503, 500, 502, 504]
    };
  }

  /**
   * الحصول على المفتاح الحالي
   */
  getCurrentKey(): string {
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * نقل المفتاح الحالي إلى نهاية المصفوفة والانتقال للتالي
   */
  private rotateToNextKey(): void {
    // نقل المفتاح الحالي إلى نهاية المصفوفة
    const currentKey = this.apiKeys.splice(this.currentKeyIndex, 1)[0];
    this.apiKeys.push(currentKey);
    
    // إذا كنا في النهاية، ارجع للبداية
    if (this.currentKeyIndex >= this.apiKeys.length) {
      this.currentKeyIndex = 0;
    }
    
    console.log(`🔄 تم تبديل المفتاح إلى: ${this.getCurrentKey().substring(0, 20)}...`);
  }

  /**
   * تنفيذ طلب مع إعادة المحاولة التلقائية
   */
  async makeRequest(requestConfig: RequestConfig): Promise<Response> {
    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.config.maxRetries) {
      try {
        const currentKey = this.getCurrentKey();
        const response = await this.executeRequest(requestConfig, currentKey);

        // إذا كانت الاستجابة ناجحة، أرجعها
        if (response.ok) {
          console.log(`✅ نجح الطلب باستخدام المفتاح: ${currentKey.substring(0, 20)}...`);
          return response;
        }

        // إذا كان كود الخطأ يستدعي تبديل المفتاح
        if (this.config.errorCodes.includes(response.status)) {
          console.log(`❌ خطأ ${response.status} - سيتم تبديل المفتاح`);
          
          // تأخير قبل تبديل المفتاح
          if (attempts < this.config.maxRetries - 1) {
            await this.delay(this.config.retryDelay);
            this.rotateToNextKey();
          }
        } else {
          // خطأ لا يستدعي تبديل المفتاح
          console.log(`❌ خطأ ${response.status} - لا يستدعي تبديل المفتاح`);
          return response;
        }

      } catch (error) {
        console.error(`💥 خطأ في الشبكة:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // تأخير قبل إعادة المحاولة
        if (attempts < this.config.maxRetries - 1) {
          await this.delay(this.config.retryDelay);
          this.rotateToNextKey();
        }
      }

      attempts++;
    }

    // إذا فشلت جميع المحاولات
    throw new Error(
      `فشل في تنفيذ الطلب بعد ${attempts} محاولات. آخر خطأ: ${lastError?.message || 'غير معروف'}`
    );
  }

  /**
   * تنفيذ الطلب الفعلي مع المفتاح المحدد
   */
  private async executeRequest(requestConfig: RequestConfig, apiKey: string): Promise<Response> {
    let { url, options = {} } = requestConfig;

    // إضافة API key إلى URL إذا تم تحديد معامل
    if (requestConfig.apiKeyParam) {
      const urlObj = new URL(url);
      urlObj.searchParams.set(requestConfig.apiKeyParam, apiKey);
      url = urlObj.toString();
    }

    // إضافة API key إلى headers إذا تم تحديد header
    if (requestConfig.apiKeyHeader) {
      options.headers = {
        ...options.headers,
        [requestConfig.apiKeyHeader]: apiKey
      };
    }

    return fetch(url, options);
  }

  /**
   * تأخير بالميلي ثانية
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * إعادة تعيين المؤشر إلى البداية
   */
  resetToFirstKey(): void {
    this.currentKeyIndex = 0;
    console.log(`🔄 تم إعادة تعيين المؤشر إلى المفتاح الأول`);
  }

  /**
   * الحصول على إحصائيات المفاتيح
   */
  getStats() {
    return {
      totalKeys: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex,
      currentKey: this.getCurrentKey().substring(0, 20) + '...',
      keysOrder: this.apiKeys.map(key => key.substring(0, 20) + '...')
    };
  }
}

// مثال للاستخدام مع Gemini API
export const createGeminiKeyManager = () => {
  const apiKeys = [
    "AIzaSyCoE0wSdHRAVvjU6Dllx6XmxMAMG409sSk",
    "AIzaSyDqGwN1PbfdH1lMPd_PM-h-nUlbVvDT-1U",
    "AIzaSyAHMJKhRgLbgOLXhUHWdea6hhsn1cuuW6U",
    "AIzaSyDL4YJrqxqsvvi_kGg0q0GdrEQbOKCt_oI",
    "AIzaSyCl1LfzT-uRryPFF4nujkvjBVHCXalyzgY",
    "AIzaSyCGLL88zVZjJtzod4Z-ONvFXKZiGVM3Wm4",
    "AIzaSyBrlikXYs8kgzvzZmc69R3waQdcOGI08qI",
    "AIzaSyCdU4U-dW8Tfe9763CO0AL1u2WLFj0zNu8",
    "AIzaSyCjlGbUV5K7PhZvJY7Mmehx7PH-juxmxn0",
    "AIzaSyCmZivJpY6e9WJQRc80NH1P0fHcjJNZy80",
    "AIzaSyB-pMGCSj9yzjsM1hN24CmzsKWHBS0rNJ8",
    "AIzaSyBDiCnl8l17wkFmrl3dV56dKm16DQElaC0",
    "AIzaSyDJcPPoJKtwltBAB5TzskaN0hUIIi3nszU",
    "AIzaSyA-uzh4RA0Sb4k1NmNqE_fpIX2YHvBy-KI",
    "AIzaSyAchPA9UJhTVrivthVY7eQtAm5udJ8ilxA",
    "AIzaSyDxRdDIYa9KSQwP2BJFA1bvshe3_OWKPRs",
    "AIzaSyDnFbX3IOQiCRncMMMD5PcCiaDzV1DGqBM",
    "AIzaSyDNgCnIo5yoU7RTIh7jyDmXQBk60Iirw5U",
    "AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44",
    "AIzaSyCHIHwj3i_WM3HXpI8XwAodrBBMPj5SbXQ",
    // المفاتيح الجديدة المضافة
    "AIzaSyBZok28uf_cZsCknA3N7yUcYtDmznRvUG0",
    "AIzaSyD51vrO0vj4-WKANNgbzrbJPh7nPnPhsMM",
    "AIzaSyCLqikA8e0gJ-4gTLH4QG8uaBT4hPW6HSU",
    "AIzaSyD5JsmtJdOFOxn0zY6HYYwy95VmzGUmNt8",
    "AIzaSyAujZ8JJXkOkMyZ373RfcTZVjmFCuiM40k",
    "AIzaSyAy2Ks8NBoVCtZ6vFwNpsdnYEDSZ-o1jq0",
    "AIzaSyDFu3ZVPw2mJtkelci3carHUO0MKJgmHPY",
    "AIzaSyD9XuFuht-FoLRBUGidQgqG3mnm546rJYs",
    // المفاتيح الجديدة المضافة حديثاً
    "AIzaSyDTSm9MoPs91UCWYYp7qy76qyUgzdh3VXc",
    "AIzaSyDxOpke9DTgOAnNBQtP7rGNKdytrkd-gic",
    // مفاتيح إضافية جديدة
    "AIzaSyCt1ZpRTlLKaHt-KJNTTnMXw0guEQxaCzE",
    "AIzaSyApe06sM6hxjIXWv-u1xLmEe9T49ylNPTI",
    "AIzaSyD-gvwPST_CP0eq2Ko_RxLpFrA8c_x5fgk",
    "AIzaSyBfMoI2j4e6cyVNtLU6obD2xSdBKsEUlTs",
    // مفاتيح جديدة مضافة
    "AIzaSyBQY7Cx8XdXkkqom_p6lquZStQruTKSjd4",
    "AIzaSyA4sHW6glV2wb48vxMQbFwjVMCwwAdRe1c",
    // المفاتيح الجديدة المضافة
    "AIzaSyArcW9zlcdsPTH1XIYHrYOylx6HRhm8NnI",
    "AIzaSyA5t9GAiOUjTOvxijKrn_vxeOQSMy8eeBA",
    "AIzaSyBExKGbK3BvqpfFKKmJLtl2rc95aLwTk5w",
    "AIzaSyAgJ2pAptikvr8eQOp0YoCdh9UjEN25y30",
    "AIzaSyA98CEjjkPE67yo01kISeu-1qgIiDb_AdE",
    "AIzaSyA8h0agTWehKe6HXGdsTnWy35vi5NGeNjg",
    "AIzaSyCrTjVaiJMSeqGuftBRO5tFtqd8yk2bq2g",
    "AIzaSyBnhsvLxvJWMad9bSixPVNTRyLQJTsszW4",
    "AIzaSyDOmH26pxAMSdsTCFUgo9cqExhZZfllwyo",
    "AIzaSyB0Rm5BvD1iirhChwg2uALtT7X5JADjRr4"
  ];

  return new ApiKeyRotationManager(apiKeys, {
    retryDelay: 500,
    maxRetries: apiKeys.length,
    errorCodes: [429, 503, 500, 502, 504, 400] // إضافة 400 للمفاتيح غير الصالحة
  });
};

// دالة مساعدة للاستخدام المباشر مع Gemini
export const makeGeminiRequest = async (
  model: string,
  payload: any,
  keyManager?: ApiKeyRotationManager
) => {
  const manager = keyManager || createGeminiKeyManager();
  
  return manager.makeRequest({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    apiKeyParam: 'key',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  });
};