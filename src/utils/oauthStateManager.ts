/**
 * OAuth State Manager - إدارة حالة OAuth بشكل آمن
 * يمنع إعادة استخدام authorization codes ويحسن الأمان
 */

interface OAuthState {
  state: string;
  timestamp: number;
  provider: 'facebook' | 'google';
  used: boolean;
}

const OAUTH_STATE_KEY = 'oauth_states';
const STATE_EXPIRY_TIME = 30 * 60 * 1000; // 30 دقيقة (زيادة المدة لتجنب انتهاء الصلاحية)

export class OAuthStateManager {
  /**
   * إنشاء state جديد لـ OAuth
   */
  static generateState(provider: 'facebook' | 'google'): string {
    const state = crypto.randomUUID();
    const oauthState: OAuthState = {
      state,
      timestamp: Date.now(),
      provider,
      used: false
    };

    // حفظ الـ state في localStorage
    const existingStates = this.getStoredStates();
    existingStates[state] = oauthState;
    localStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(existingStates));

    return state;
  }

  /**
   * التحقق من صحة الـ state والتأكد من عدم استخدامه مسبقاً
   */
  static validateAndConsumeState(state: string, provider: 'facebook' | 'google'): boolean {
    const existingStates = this.getStoredStates();
    const oauthState = existingStates[state];

    // التحقق من وجود الـ state
    if (!oauthState) {
      console.error('OAuth State not found:', state);
      return false;
    }

    // التحقق من المزود
    if (oauthState.provider !== provider) {
      console.error('OAuth State provider mismatch:', { expected: provider, actual: oauthState.provider });
      return false;
    }

    // التحقق من عدم الاستخدام المسبق
    if (oauthState.used) {
      console.error('OAuth State already used:', state);
      return false;
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() - oauthState.timestamp > STATE_EXPIRY_TIME) {
      console.error('OAuth State expired:', state);
      delete existingStates[state];
      localStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(existingStates));
      return false;
    }

    // تعليم الـ state كمستخدم
    oauthState.used = true;
    existingStates[state] = oauthState;
    localStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(existingStates));

    return true;
  }

  /**
   * تنظيف الـ states المنتهية الصلاحية
   */
  static cleanupExpiredStates(): void {
    const existingStates = this.getStoredStates();
    const now = Date.now();
    let hasChanges = false;

    Object.keys(existingStates).forEach(key => {
      const state = existingStates[key];
      if (now - state.timestamp > STATE_EXPIRY_TIME || state.used) {
        delete existingStates[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(existingStates));
    }
  }

  /**
   * إزالة state محدد بعد الاستخدام الناجح
   */
  static removeState(state: string): void {
    const existingStates = this.getStoredStates();
    delete existingStates[state];
    localStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(existingStates));
  }

  /**
   * جلب جميع الـ states المخزنة
   */
  private static getStoredStates(): Record<string, OAuthState> {
    try {
      const stored = localStorage.getItem(OAUTH_STATE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error parsing stored OAuth states:', error);
      return {};
    }
  }

  /**
   * مسح جميع الـ states (للتنظيف الكامل)
   */
  static clearAllStates(): void {
    localStorage.removeItem(OAUTH_STATE_KEY);
  }
}

/**
 * منع إعادة استخدام authorization codes من خلال تتبع الكودات المستخدمة
 */
interface UsedAuthCode {
  code: string;
  timestamp: number;
  provider: 'facebook' | 'google';
}

const USED_CODES_KEY = 'used_auth_codes';
const CODE_TRACKING_TIME = 60 * 60 * 1000; // ساعة واحدة

export class AuthCodeTracker {
  /**
   * التحقق من عدم استخدام authorization code مسبقاً
   */
  static isCodeUsed(code: string, provider: 'facebook' | 'google'): boolean {
    const usedCodes = this.getUsedCodes();
    return usedCodes.some(usedCode => 
      usedCode.code === code && 
      usedCode.provider === provider &&
      Date.now() - usedCode.timestamp < CODE_TRACKING_TIME
    );
  }

  /**
   * تعليم authorization code كمستخدم
   */
  static markCodeAsUsed(code: string, provider: 'facebook' | 'google'): void {
    const usedCodes = this.getUsedCodes();
    const newUsedCode: UsedAuthCode = {
      code,
      timestamp: Date.now(),
      provider
    };

    usedCodes.push(newUsedCode);
    
    // تنظيف الكودات القديمة
    const filteredCodes = usedCodes.filter(usedCode => 
      Date.now() - usedCode.timestamp < CODE_TRACKING_TIME
    );

    localStorage.setItem(USED_CODES_KEY, JSON.stringify(filteredCodes));
  }

  /**
   * جلب الكودات المستخدمة
   */
  private static getUsedCodes(): UsedAuthCode[] {
    try {
      const stored = localStorage.getItem(USED_CODES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error parsing used auth codes:', error);
      return [];
    }
  }

  /**
   * مسح جميع الكودات المتتبعة
   */
  static clearUsedCodes(): void {
    localStorage.removeItem(USED_CODES_KEY);
  }
}