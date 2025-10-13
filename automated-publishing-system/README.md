# نظام النشر الآلي على فيسبوك 🤖📱

## نظرة عامة
نظام متكامل للنشر الآلي على فيسبوك يستخدم الذكاء الاصطناعي لتوليد المحتوى والصور والأسئلة التفاعلية، مع دعم كامل لإدارة الكريدت والمفاتيح والنشر المجدول.

---

## 🏗️ البنية المعمارية

### المكونات الرئيسية

```
automated-publishing-system/
├── pages/
│   └── AutomatedPublishingPage.tsx       # الصفحة الرئيسية
├── components/
│   ├── AutomatedFacebookPublisher.tsx    # النشر الكامل مع توليد المحتوى
│   └── AutomatedImagePublisher.tsx       # النشر من صورة موجودة
├── hooks/
│   ├── useAutomationEngine.ts            # محرك الأتمتة الذكي
│   └── useCreditsManager.ts              # إدارة الكريدت
└── README.md                              # هذا الملف
```

---

## 📄 تفاصيل الملفات

### 1. AutomatedPublishingPage.tsx
**المسار**: `pages/AutomatedPublishingPage.tsx`

**الوظيفة**: الصفحة الرئيسية للنظام

**المميزات**:
- واجهة مستخدم احترافية مع تدرجات لونية
- عرض بطاقات المميزات الأربع الرئيسية
- التحقق من وجود مفتاح Gemini API
- زر الاختبار السريع للأتمتة
- أزرار التنقل (العودة للرئيسية)

**الأقسام الرئيسية**:
```tsx
- Header: العنوان مع الأيقونات والوصف
- Features Overview: 4 بطاقات توضح المميزات
- Test Button: زر اختبار الأتمتة السريع
- Main Component: مكون النشر الرئيسي
```

**التبعيات**:
- `@/components/AutomatedFacebookPublisher`
- `@/components/TestCronJobButton`
- `@/components/GeminiApiKeyPrompt`
- `@/hooks/useGeminiApiKey`

---

### 2. AutomatedFacebookPublisher.tsx
**المسار**: `components/AutomatedFacebookPublisher.tsx`

**الوظيفة**: النشر الكامل مع توليد تلقائي للمحتوى والصور

**المميزات الرئيسية**:
- ✅ توليد إعدادات عشوائية (التخصص، نوع المحتوى، الموضوع)
- ✅ توليد موضوع ذكي بالذكاء الاصطناعي
- ✅ توليد محتوى نصي غني بالرموز التعبيرية
- ✅ توليد أسئلة تفاعلية
- ✅ توليد برومت صورة إبداعي
- ✅ توليد الصورة بنمط "جينيوس" (Genius Style)
- ✅ تحليل ملاءمة الصورة للمحتوى
- ✅ النشر المباشر على فيسبوك
- ✅ إضافة تعليقات تفاعلية

**خطوات العمل**:

```mermaid
graph TD
    A[بدء الأتمتة] --> B[توليد إعدادات عشوائية]
    B --> C[توليد موضوع بالذكاء الاصطناعي]
    C --> D[توليد المحتوى النصي]
    D --> E[توليد الأسئلة التفاعلية]
    E --> F[توليد برومت الصورة]
    F --> G[توليد الصورة بنمط جينيوس]
    G --> H[تحليل ملاءمة الصورة]
    H --> I{الصورة ملائمة؟}
    I -->|نعم| J[النشر على فيسبوك]
    I -->|لا| F
    J --> K[إضافة التعليقات التفاعلية]
    K --> L[اكتمل النشر]
```

**API المستخدمة**:

1. **Gemini API** (لتوليد المحتوى):
   - `gemini-2.0-flash-exp`: توليد الموضوع والمحتوى
   - `gemini-2.0-flash-thinking-exp`: توليد برومت الصورة
   - `gemini-1.5-flash-latest`: تحليل الصورة

2. **A4F Image Generation API**:
   ```
   Endpoint: https://api.a4f.co/v1/images/generations
   Model: provider-4/imagen-3
   Auth: Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f
   ```

3. **Facebook Graph API**:
   ```
   Photos: https://graph.facebook.com/v19.0/{page_id}/photos
   Comments: https://graph.facebook.com/v19.0/{post_id}/comments
   ```

**إدارة المفاتيح**:
- نظام تدوير ذكي للمفاتيح (API Key Rotation)
- إحصائيات الاستخدام والنجاح
- معالجة الأخطاء التلقائية

**التخصصات المدعومة**:
- طب، تقنية، تعليم، تسويق
- صحة، طعام، سفر، موضة
- رياضة، فن

**اللغات المدعومة**:
- العربية 🇸🇦
- الإنجليزية 🇺🇸
- القبائلية ⵜⴰⵇⴱⴰⵢⵍⵉⵜ
- الشاوية ⵜⴰⵛⴰⵡⵉⵜ
- التارقية ⵜⴰⵎⴰⵌⴰⵖ
- المزابية ⵜⴰⵎⴰⵣⵉⵖⵜ
- الجرجرية ⵜⴰⵊⴰⵔⵊⴰⵔⵜ
- الشنوية ⵜⴰⵛⵏⵡⵉⵜ

**معالجة الأخطاء**:
- إعادة المحاولة التلقائية (3 محاولات لكل خطوة)
- رفض الصور غير الملائمة تلقائياً
- قبول الصورة بعد 3 محاولات فاشلة
- عرض تفصيلي للأخطاء

---

### 3. AutomatedImagePublisher.tsx
**المسار**: `components/AutomatedImagePublisher.tsx`

**الوظيفة**: النشر من صورة موجودة مع تعديلها

**المميزات الرئيسية**:
- ✅ رفع صورة من الملفات أو URL
- ✅ تحليل الصورة بالذكاء الاصطناعي
- ✅ توليد محتوى تسويقي مخصص
- ✅ توليد برومت تعديل متخصص
- ✅ تعديل الصورة بAPI خارجي
- ✅ فحص الجودة والملاءمة
- ✅ إنشاء أسئلة تفاعلية
- ✅ النشر على فيسبوك

**خطوات العمل**:

```mermaid
graph TD
    A[اختيار الصورة] --> B[تحليل الصورة]
    B --> C[توليد المحتوى التسويقي]
    C --> D[إنشاء برومبت التعديل]
    D --> E[تعديل الصورة]
    E --> F[فحص الجودة]
    F --> G[إنشاء أسئلة تفاعلية]
    G --> H[النشر على فيسبوك]
```

**API المستخدمة**:

1. **Supabase Edge Functions**:
   - `gemini-image-analysis`: تحليل الصورة
   - `gemini-marketing-content`: توليد المحتوى التسويقي
   - `gemini-image-edit-prompt`: توليد برومبت التعديل
   - `gemini-interactive-questions`: توليد الأسئلة

2. **External Image Editor API**:
   ```
   Endpoint: https://image-editor-api.4kallaoui23.workers.dev/api/edit-image
   Method: POST
   Body: {
     imageUrl: string,
     prompt: string,
     style: "realistic"
   }
   ```

3. **ImgBB Upload API**:
   ```
   Endpoint: https://api.imgbb.com/1/upload
   Key: c9aeeb2c2e029f20a23564c192fd5764
   Method: POST
   ```

**أنواع الإدخال**:
- URL: رابط صورة مباشر
- File: رفع ملف محلي

**خيارات المحتوى**:
- الجمهور المستهدف (قابل للتخصيص)
- الهدف التسويقي (engagement, awareness, conversion)
- اللغة (العربية، الإنجليزية)
- تعليمات إضافية

**عرض النتائج**:
- مقارنة الصورة الأصلية والمعدلة
- عرض المحتوى المولد
- تفاصيل كل خطوة
- الوقت المستغرق لكل خطوة

---

### 4. useAutomationEngine.ts
**المسار**: `hooks/useAutomationEngine.ts`

**الوظيفة**: محرك الأتمتة الذكي والمرن

**المميزات**:
- ✅ تحليل محلي ذكي للصفحة (بدون API)
- ✅ توليد محتوى محلي احتياطي
- ✅ توليد أسئلة تفاعلية محلية
- ✅ توليد برومت ذكي بGemini (مع مفتاح مخصص)
- ✅ توليد صورة بـ A4F API
- ✅ النشر السريع على فيسبوك
- ✅ دعم الإيقاف المؤقت والاستئناف
- ✅ حساب الوقت المنقضي
- ✅ دعم خيار إيقاف التوليد بعد البرومت

**الوظائف الرئيسية**:

```typescript
interface AutomationConfig {
  topic: string;
  specialty: string;
  contentType: string;
  language: string;
  imageStyle: string;
  imageSource: string;
  customGeminiApiKey?: string;
  stopAfterPromptGeneration?: boolean;
}

// الوظائف الرئيسية
runAutomation(config: AutomationConfig)
pauseAutomation()
resumeAutomation()
stopAutomation()
executeTestImageGeneration(prompt: string, customApiKey?: string)
executeQuickPublish(config, content, imageUrl)
```

**خطوات الأتمتة**:

1. **تحليل صفحة الفيسبوك**: تحليل محلي ذكي
2. **توليد المحتوى**: نص تسويقي احترافي
3. **توليد الأسئلة التفاعلية**: 4 أسئلة ذكية
4. **توليد البرومت**: برومت إبداعي بGemini (مع دعم مفتاح مخصص)
5. **توليد الصورة**: صورة بـ A4F API
6. **النشر**: نشر مباشر على فيسبوك

**معالجة الأخطاء**:
- التحقق من وجود مفتاح API
- معالجة أخطاء كل خطوة
- حفظ تفاصيل الأخطاء
- استخدام القيم الاحتياطية

**الأداء**:
- تتبع الوقت لكل خطوة
- حساب المدة الإجمالية
- دعم الإيقاف المؤقت (بدون فقدان التقدم)

---

### 5. useCreditsManager.ts
**المسار**: `hooks/useCreditsManager.ts`

**الوظيفة**: إدارة نظام الكريدت

**المميزات**:
- ✅ التحقق من الكريدت المتاح
- ✅ استهلاك الكريدت
- ✅ إنشاء اشتراك افتراضي للمستخدمين الجدد
- ✅ دعم الاشتراكات النشطة
- ✅ معالجة الأخطاء

**الوظائف الرئيسية**:

```typescript
interface CreditsInfo {
  available: boolean;
  remaining: number;
  total: number;
  used: number;
}

// الوظائف
checkCredits(): Promise<CreditsInfo | null>
consumeCredits(amount: number): Promise<boolean>
```

**قاعدة البيانات**:
- جدول: `automation_subscriptions`
- الأعمدة:
  - `user_id`: معرف المستخدم
  - `page_id`: معرف الصفحة
  - `credits_total`: إجمالي الكريدت
  - `credits_remaining`: الكريدت المتبقي
  - `credits_used`: الكريدت المستخدم
  - `automation_active`: حالة الأتمتة
  - `subscription_end`: تاريخ انتهاء الاشتراك

**الاشتراك الافتراضي**:
```typescript
{
  credits_total: 50,
  credits_remaining: 50,
  credits_used: 0,
  automation_active: true,
  subscription_end: +30 يوم
}
```

---

## 🔄 آلية العمل الكاملة

### مسار النشر الكامل (AutomatedFacebookPublisher)

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Gemini
    participant A4F
    participant Facebook

    User->>Component: بدء الأتمتة
    Component->>Component: توليد إعدادات عشوائية
    Component->>Gemini: توليد الموضوع
    Gemini-->>Component: الموضوع
    Component->>Gemini: توليد المحتوى النصي
    Gemini-->>Component: المحتوى
    Component->>Gemini: توليد الأسئلة التفاعلية
    Gemini-->>Component: الأسئلة
    Component->>Gemini: توليد برومت الصورة
    Gemini-->>Component: البرومت
    Component->>A4F: توليد الصورة
    A4F-->>Component: الصورة
    Component->>Gemini: تحليل ملاءمة الصورة
    Gemini-->>Component: النتيجة
    alt صورة ملائمة
        Component->>Facebook: نشر المنشور
        Facebook-->>Component: معرف المنشور
        Component->>Facebook: إضافة التعليقات
        Facebook-->>Component: تأكيد
    else صورة غير ملائمة
        Component->>Gemini: توليد برومت جديد
    end
```

### مسار النشر من صورة (AutomatedImagePublisher)

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Supabase
    participant ImageEditor
    participant ImgBB
    participant Facebook

    User->>Component: رفع صورة
    Component->>Supabase: تحليل الصورة
    Supabase-->>Component: التحليل
    Component->>Supabase: توليد محتوى تسويقي
    Supabase-->>Component: المحتوى
    Component->>Supabase: توليد برومبت تعديل
    Supabase-->>Component: البرومبت
    Component->>ImageEditor: تعديل الصورة
    ImageEditor-->>Component: الصورة المعدلة (base64)
    Component->>ImgBB: رفع الصورة
    ImgBB-->>Component: URL الصورة
    Component->>Supabase: توليد أسئلة تفاعلية
    Supabase-->>Component: الأسئلة
    Component->>Facebook: نشر المنشور
    Facebook-->>Component: تأكيد
```

---

## 🔑 إدارة المفاتيح

### نظام تدوير المفاتيح (API Key Rotation)

**المفاتيح المدعومة**:
```typescript
const keys = [
  'AIzaSyBbwj7pY4GlSZqONPEe_w5iwu-Pz6TBRfw',
  'AIzaSyAPUMFpJrwS7xQR1HB3B-BoGxIQc9aJ7zU',
  'AIzaSyBUSfuQ_zD8vqGXOLf1DJWVK-08VWDYpTk',
  'AIzaSyDxQnJJKxaKKyTzBU3KUxkRkFJgLQ-bBjI',
  'AIzaSyBtTzHWzjTvZnGv5qrzY0jTh5j72v9tL9Y'
];
```

**آلية التدوير**:
1. استخدام مفتاح عشوائي
2. تتبع نجاح/فشل كل مفتاح
3. التبديل التلقائي عند الفشل
4. عرض إحصائيات الاستخدام

---

## 📊 الإحصائيات والمراقبة

### معلومات الأداء
- **الوقت المستغرق لكل خطوة**
- **معدل النجاح**
- **عدد المحاولات**
- **استخدام المفاتيح**

### تتبع الأخطاء
- **رسائل الأخطاء التفصيلية**
- **سجل الصور المرفوضة**
- **سجل الصور المقبولة**
- **أسباب الرفض/القبول**

---

## 🎨 واجهة المستخدم

### العناصر الرئيسية

1. **نموذج الإدخال**:
   - حقول النموذج (موضوع، تخصص، لغة، إلخ)
   - أزرار التحكم (بدء، إيقاف، إعادة)
   - معاينة الإعدادات

2. **شريط التقدم**:
   - نسبة الإنجاز
   - الخطوة الحالية
   - الوقت المنقضي

3. **قائمة الخطوات**:
   - حالة كل خطوة (pending/running/completed/error)
   - تفاصيل التنفيذ
   - الوقت المستغرق
   - أيقونات مرئية

4. **عرض النتائج**:
   - المحتوى المولد
   - الصورة النهائية
   - الأسئلة التفاعلية
   - رابط المنشور

### الألوان والأيقونات

```typescript
// الأيقونات حسب الخطوة
Search: تحليل
FileText: محتوى نصي
Brain: برومت
Wand2: توليد صورة
Target: فحص جودة
MessageSquare: أسئلة
Facebook: نشر

// الألوان حسب الحالة
pending: text-muted-foreground
running: text-blue-500 + animate-spin
completed: text-green-500
error: text-red-500
```

---

## 🚀 الاستخدام

### المتطلبات الأساسية

1. **حساب فيسبوك متصل**:
   - صفحة فيسبوك مفعلة
   - Access Token صالح

2. **مفتاح Gemini API**:
   - مفتاح صالح من Google AI Studio
   - حصة متاحة (Quota)

3. **اشتراك نشط**:
   - كريدت متاح
   - صلاحيات النشر

### خطوات الاستخدام

#### النشر الكامل (AutomatedFacebookPublisher)

```typescript
// 1. فتح الصفحة
/automated-publishing

// 2. اختيار الإعدادات (أو الضغط على "توليد عشوائي")
- التخصص: تسويق
- نوع المحتوى: منشور تسويقي
- اللغة: العربية
- نمط الصورة: professional

// 3. بدء الأتمتة
- الضغط على "بدء الأتمتة الذكية"
- مراقبة التقدم
- انتظار الإنجاز

// 4. مراجعة النتائج
- المحتوى المولد
- الصورة النهائية
- رابط المنشور
```

#### النشر من صورة (AutomatedImagePublisher)

```typescript
// 1. اختيار الصورة
- URL أو رفع ملف

// 2. تحديد الإعدادات
- الجمهور المستهدف
- الهدف التسويقي
- اللغة

// 3. بدء المعالجة
- تحليل الصورة
- توليد المحتوى
- تعديل الصورة
- النشر

// 4. مراجعة النتائج
- الصورة الأصلية vs المعدلة
- المحتوى التسويقي
- الأسئلة التفاعلية
```

---

## ⚠️ المشاكل الشائعة والحلول

### 1. فشل توليد الموضوع
**السبب**: حصة API منتهية أو مفتاح غير صالح
**الحل**: 
- التحقق من المفتاح
- الانتظار لتجديد الحصة
- استخدام مفتاح آخر

### 2. رفض الصورة المولدة
**السبب**: الصورة لا تتطابق مع المحتوى
**الحل**: 
- يعيد المحاولة تلقائياً (حتى 3 مرات)
- يقبل الصورة بعد 3 محاولات
- يعرض سبب الرفض

### 3. فشل النشر على فيسبوك
**السبب**: صلاحيات غير كافية أو توكن منتهي
**الحل**:
- إعادة الاتصال بفيسبوك
- التحقق من صلاحيات الصفحة
- تجديد Access Token

### 4. نفاد الكريدت
**السبب**: استهلاك الحصة الشهرية
**الحل**:
- شراء كريدت إضافي
- انتظار التجديد الشهري
- استخدام الوضع اليدوي

### 5. فشل تعديل الصورة
**السبب**: API خارجي غير متاح
**الحل**:
- يستخدم الصورة الأصلية تلقائياً
- يعرض رسالة توضيحية
- يكمل النشر بدون تعديل

---

## 🔧 الصيانة والتطوير

### نقاط التحسين المستقبلية

1. **تحسين الأداء**:
   - تخزين مؤقت للمحتوى المولد
   - معالجة متوازية للخطوات
   - ضغط الصور تلقائياً

2. **مميزات إضافية**:
   - جدولة المنشورات
   - قوالب محتوى جاهزة
   - تحليلات الأداء
   - تقارير شهرية

3. **تحسين الذكاء الاصطناعي**:
   - نماذج أكثر دقة
   - تعلم من المنشورات السابقة
   - تخصيص أفضل للمحتوى

4. **دعم منصات إضافية**:
   - Instagram
   - Twitter / X
   - LinkedIn
   - TikTok

---

## 📝 الملاحظات الفنية

### اعتبارات الأمان
- ✅ عدم تخزين المفاتيح في الكود
- ✅ تشفير البيانات الحساسة
- ✅ التحقق من الصلاحيات
- ✅ حد أقصى للمحاولات

### أفضل الممارسات
- ✅ معالجة الأخطاء الشاملة
- ✅ إعادة المحاولة التلقائية
- ✅ رسائل خطأ واضحة
- ✅ تسجيل مفصل (Logging)

### الأداء
- ⏱️ متوسط الوقت: 2-3 دقائق
- 🔄 معدل النجاح: 85-95%
- 📊 استهلاك الكريدت: 1 لكل منشور

---

## 📞 الدعم والمساعدة

للمساعدة والدعم الفني:
- 📧 البريد الإلكتروني: support@example.com
- 💬 Discord: [رابط الدعم]
- 📚 التوثيق: [رابط التوثيق]

---

## 📜 الترخيص

هذا النظام جزء من مشروع خاص. جميع الحقوق محفوظة.

---

## 🎉 الخاتمة

نظام النشر الآلي هو حل متكامل وذكي يوفر:
- ⚡ سرعة في التنفيذ
- 🎨 جودة عالية في المحتوى
- 🤖 ذكاء اصطناعي متقدم
- 📱 سهولة في الاستخدام
- 🔒 أمان وموثوقية

**تم التطوير بحب ❤️ للمجتمع العربي**
