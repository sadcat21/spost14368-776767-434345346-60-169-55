import { useState, useRef, useEffect } from "react";
import { geminiApiManager } from "../utils/geminiApiManager";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, Download, Copy, RefreshCw, Save, FileText, Image, Video, Layers, Upload, Eye, EyeOff, Shuffle, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import { ContentCanvas, TextSettings, ColorSettings } from "./ContentCanvas";
import type { LogoSettings } from "./LogoCustomizer";
import { ShapeController } from "./ShapeController";
import { TextCustomizer } from "./TextCustomizer";
import { LogoCustomizer } from "./LogoCustomizer";
import { FrameSettings } from "./FrameCustomizer";
import { UnifiedCustomizer } from "./UnifiedCustomizer";
import { ShapeMarginSettings } from "./ShapeMarginController";
import { TextDistributionSettings } from "./TextDistributionController";
import { ShapePositionSettings } from "./ShapePositionController";
import { TextPositionSettings } from "./TextPositionController";
import { InfographicAnalyzer } from "./InfographicAnalyzer";

import { ResetControls } from "./ResetControls";
import { FacebookManager } from "./FacebookManager";
import { TextExtractor } from "./TextExtractor";
import type { ShapeInversionSettings } from "./ShapeInversionController";
import type { AdvancedShapeSettings } from "./AdvancedShapeController";
import type { SpaceLayoutSettings } from "./SpaceLayoutController";
import type { BackgroundEffectsSettings } from "./BackgroundEffectsController";
import type { EnhancedTextSettings } from "./EnhancedTextController";
import type { AdvancedBlendingSettings } from "./AdvancedBlendingController";
import type { AdvancedTransparencySettings } from "./AdvancedTransparencyController";
import { VideoPreviewSection } from "./VideoPreviewSection";
import { AdminTabsManager } from "./AdminTabsManager";
import { VideoUploader } from "./VideoUploader";
import { PreviewControls } from "./PreviewControls";
import type { LayerEffect } from "./LayerEffectsSelector";
import { usePersistedLayerEffect } from "../hooks/usePersistedLayerEffect";
import { GeminiLayerSuggestions } from "./GeminiLayerSuggestions";
import { DesignPromptGenerator } from "./DesignPromptGenerator";
import { AutomationButton } from "./AutomationButton";
import { InteractiveCanvas } from "./InteractiveCanvas";
import { Move } from "lucide-react";

interface MediaData {
  url: string;
  alt: string;
  isVideo?: boolean;
  videoPageUrl?: string;
  videoThumbnail?: string;
  videoTags?: string;
  videoDuration?: number;
  videoViews?: number;
}
import { ImageControlSettings } from "./ImageController";
// import { removeBackground, loadImage } from "@/utils/backgroundRemover"; // Disabled background removal

const specialties = [
  { value: "chinese-traditional-tools", label: "أدوات الطب الصيني التقليدي" },
  { value: "chinese-medicine", label: "الطب الصيني" },
  { value: "entrepreneurship", label: "ريادة الأعمال" },
  { value: "self-development", label: "التنمية الذاتية" },
  { value: "nutrition", label: "التغذية" },
  { value: "fitness", label: "اللياقة البدنية" },
  { value: "psychology", label: "علم النفس" },
  { value: "technology", label: "التكنولوجيا" },
  { value: "marketing", label: "التسويق" },
  { value: "finance", label: "المالية" },
  { value: "education", label: "التعليم" }
];

const imageSources = [
  { value: "unsplash", label: "Unsplash" },
  { value: "pixabay", label: "Pixabay" },
  { value: "upload", label: "رفع من الجهاز" }
];

const pixabayContentTypes = [
  { value: "photo", label: "صور" },
  { value: "illustration", label: "رسوم توضيحية" },
  { value: "vector", label: "رسوم متجهة" },
  { value: "video", label: "فيديو" }
];

const imageDimensions = [
  { value: "square", label: "مربع (1:1)", width: 1080, height: 1080 },
  { value: "vertical", label: "عمودي (4:5)", width: 1080, height: 1350 },
  { value: "horizontal", label: "أفقي (16:9)", width: 1920, height: 1080 }
];

const languages = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "ar-en", label: "عربي - إنجليزي" }
];

const getImageStylesBySpecialty = (specialtyValue: string, contentType?: string) => {
  // أنماط محددة بناءً على نوع المحتوى
  const contentSpecificStyles: { [key: string]: { [contentKey: string]: Array<{ value: string; label: string }> } } = {
    "chinese-traditional-tools": {
      "cupping-tools": [
        { value: "cupping-pump", label: "مضخة الحجامة" },
        { value: "silicone-cupping-cups", label: "كؤوس الحجامة السيليكون" },
        { value: "glass-cupping-cups", label: "كؤوس الحجامة الزجاجية" },
        { value: "professional-cupping-set", label: "طقم الحجامة الاحترافي" },
        { value: "fire-cupping-tools", label: "أدوات الحجامة النارية" }
      ],
      "acupuncture-needles": [
        { value: "sterile-acupuncture-needles", label: "إبر الوخز المعقمة" },
        { value: "golden-acupuncture-needles", label: "إبر الوخز الذهبية" },
        { value: "silver-acupuncture-needles", label: "إبر الوخز الفضية" },
        { value: "acupuncture-needle-guide", label: "دليل إبر الوخز" },
        { value: "electroacupuncture-device", label: "جهاز الوخز الكهربائي" }
      ],
      "gua-sha-tools": [
        { value: "jade-gua-sha", label: "أداة جوا شا اليشم" },
        { value: "rose-quartz-gua-sha", label: "أداة جوا شا الكوارتز الوردي" },
        { value: "stainless-steel-gua-sha", label: "أداة جوا شا الستانلس ستيل" },
        { value: "horn-gua-sha", label: "أداة جوا شا القرن" },
        { value: "wooden-gua-sha", label: "أداة جوا شا الخشبية" }
      ]
    }
  };

  // إذا كان هناك أنماط محددة لنوع المحتوى، استخدمها
  if (contentType && contentSpecificStyles[specialtyValue] && contentSpecificStyles[specialtyValue][contentType]) {
    return contentSpecificStyles[specialtyValue][contentType];
  }

  // وإلا استخدم الأنماط العامة
  const specialtyStyles: { [key: string]: Array<{ value: string; label: string }> } = {
    "chinese-traditional-tools": [
      { value: "cupping-tools", label: "أدوات الحجامة" },
      { value: "acupuncture-needles", label: "أدوات الإبر الصينية" },
      { value: "tuina-massage-tools", label: "أدوات تدليك التوينا" },
      { value: "qigong-tools", label: "أدوات تشي كونغ" },
      { value: "herbal-scales", label: "موازين الأعشاب التقليدية" },
      { value: "traditional-diagnosis-tools", label: "أدوات التشخيص التقليدي" },
      { value: "wooden-therapy-tools", label: "أدوات العلاج الخشبية" },
      { value: "jade-stones", label: "أحجار اليشم العلاجية" },
      { value: "moxibustion-tools", label: "أدوات العلاج بالكي" },
      { value: "gua-sha-tools", label: "أدوات جوا شا" }
    ],
    "chinese-medicine": [
      { value: "traditional-medicine", label: "طب تقليدي" },
      { value: "herbs-natural", label: "أعشاب طبيعية" },
      { value: "wellness-zen", label: "سكينة وصحة" },
      { value: "acupuncture", label: "وخز بالإبر" },
      { value: "meditation", label: "تأمل وهدوء" }
    ],
    "entrepreneurship": [
      { value: "business-growth", label: "نمو الأعمال" },
      { value: "startup-office", label: "مكتب ناشئ" },
      { value: "leadership", label: "قيادة" },
      { value: "networking", label: "شبكات تواصل" },
      { value: "innovation", label: "ابتكار" }
    ],
    "self-development": [
      { value: "personal-growth", label: "نمو شخصي" },
      { value: "motivation", label: "تحفيز" },
      { value: "success-achievement", label: "نجاح وإنجاز" },
      { value: "reading-learning", label: "قراءة وتعلم" },
      { value: "mindfulness", label: "وعي ذاتي" }
    ],
    "nutrition": [
      { value: "healthy-food", label: "طعام صحي" },
      { value: "fruits-vegetables", label: "فواكه وخضروات" },
      { value: "cooking-kitchen", label: "طبخ ومطبخ" },
      { value: "diet-nutrition", label: "حمية وتغذية" },
      { value: "organic-natural", label: "عضوي وطبيعي" }
    ],
    "fitness": [
      { value: "gym-workout", label: "صالة رياضية" },
      { value: "running-cardio", label: "جري وكارديو" },
      { value: "yoga-pilates", label: "يوغا وبيلاتس" },
      { value: "sports-activity", label: "رياضة ونشاط" },
      { value: "strength-training", label: "تدريب قوة" }
    ]
  };

  return specialtyStyles[specialtyValue] || [
    { value: "abstract", label: "خلفيات مجردة" },
    { value: "professional", label: "احترافي" },
    { value: "modern", label: "عصري" }
  ];
};

const getContentTypesBySpecialty = (specialtyValue: string) => {
  const specialtyContentTypes: { [key: string]: Array<{ value: string; label: string }> } = {
    "chinese-traditional-tools": [
      { value: "cupping-tools", label: "أدوات الحجامة" },
      { value: "acupuncture-needles", label: "أدوات الإبر الصينية" },
      { value: "tuina-massage-tools", label: "أدوات تدليك التوينا" },
      { value: "qigong-tools", label: "أدوات تشي كونغ" },
      { value: "herbal-scales", label: "موازين الأعشاب التقليدية" },
      { value: "traditional-diagnosis-tools", label: "أدوات التشخيص التقليدي" },
      { value: "wooden-therapy-tools", label: "أدوات العلاج الخشبية" },
      { value: "jade-stones", label: "أحجار اليشم العلاجية" },
      { value: "moxibustion-tools", label: "أدوات العلاج بالكي" },
      { value: "gua-sha-tools", label: "أدوات جوا شا" },
      { value: "custom", label: "مخصص" }
    ],
    "chinese-medicine": [
      { value: "daily-tip", label: "نصيحة طبية يومية" },
      { value: "herbal-remedy", label: "وصفة عشبية" },
      { value: "acupuncture-info", label: "معلومة عن الوخز" },
      { value: "wellness-quote", label: "اقتباس صحي" },
      { value: "patient-testimonial", label: "شهادة مريض" },
      { value: "custom", label: "مخصص" }
    ],
    "entrepreneurship": [
      { value: "business-tip", label: "نصيحة تجارية" },
      { value: "success-story", label: "قصة نجاح" },
      { value: "startup-advice", label: "نصيحة للشركات الناشئة" },
      { value: "leadership-quote", label: "اقتباس قيادي" },
      { value: "market-insight", label: "نظرة على السوق" },
      { value: "custom", label: "مخصص" }
    ],
    "self-development": [
      { value: "motivation-quote", label: "اقتباس تحفيزي" },
      { value: "personal-growth-tip", label: "نصيحة نمو شخصي" },
      { value: "habit-formation", label: "تكوين العادات" },
      { value: "goal-setting", label: "تحديد الأهداف" },
      { value: "mindset-shift", label: "تغيير العقلية" },
      { value: "custom", label: "مخصص" }
    ],
    "nutrition": [
      { value: "healthy-recipe", label: "وصفة صحية" },
      { value: "nutrition-fact", label: "حقيقة غذائية" },
      { value: "diet-tip", label: "نصيحة حمية" },
      { value: "supplement-info", label: "معلومة عن المكملات" },
      { value: "meal-plan", label: "خطة وجبات" },
      { value: "custom", label: "مخصص" }
    ],
    "fitness": [
      { value: "workout-tip", label: "نصيحة تمرين" },
      { value: "exercise-demo", label: "شرح تمرين" },
      { value: "fitness-motivation", label: "تحفيز رياضي" },
      { value: "recovery-advice", label: "نصيحة استشفاء" },
      { value: "equipment-review", label: "مراجعة معدات" },
      { value: "custom", label: "مخصص" }
    ],
    "psychology": [
      { value: "mental-health-tip", label: "نصيحة صحة نفسية" },
      { value: "psychology-fact", label: "حقيقة نفسية" },
      { value: "coping-strategy", label: "استراتيجية تأقلم" },
      { value: "relationship-advice", label: "نصيحة علاقات" },
      { value: "stress-management", label: "إدارة الضغط" },
      { value: "custom", label: "مخصص" }
    ],
    "technology": [
      { value: "tech-news", label: "أخبار تقنية" },
      { value: "coding-tip", label: "نصيحة برمجة" },
      { value: "ai-insight", label: "نظرة على الذكاء الاصطناعي" },
      { value: "gadget-review", label: "مراجعة جهاز" },
      { value: "tech-trend", label: "اتجاه تقني" },
      { value: "custom", label: "مخصص" }
    ],
    "marketing": [
      { value: "marketing-tip", label: "نصيحة تسويقية" },
      { value: "social-media-strategy", label: "استراتيجية وسائل التواصل" },
      { value: "brand-story", label: "قصة علامة تجارية" },
      { value: "campaign-analysis", label: "تحليل حملة" },
      { value: "customer-insight", label: "نظرة على العملاء" },
      { value: "custom", label: "مخصص" }
    ],
    "finance": [
      { value: "investment-tip", label: "نصيحة استثمارية" },
      { value: "financial-planning", label: "تنظيم مالي" },
      { value: "market-analysis", label: "تحليل السوق" },
      { value: "saving-strategy", label: "استراتيجية ادخار" },
      { value: "economic-news", label: "أخبار اقتصادية" },
      { value: "custom", label: "مخصص" }
    ],
    "education": [
      { value: "learning-tip", label: "نصيحة تعليمية" },
      { value: "study-strategy", label: "استراتيجية دراسة" },
      { value: "educational-fact", label: "حقيقة تعليمية" },
      { value: "career-guidance", label: "توجيه مهني" },
      { value: "skill-development", label: "تطوير المهارات" },
      { value: "custom", label: "مخصص" }
    ]
  };

  return specialtyContentTypes[specialtyValue] || [
    { value: "daily-tip", label: "نصيحة يومية" },
    { value: "scientific-fact", label: "معلومة علمية" },
    { value: "myth-correction", label: "تصحيح مفهوم شائع" },
    { value: "inspiring-quote", label: "اقتباس ملهم" },
    { value: "interactive-question", label: "سؤال تفاعلي" },
    { value: "product-benefits", label: "فوائد منتج / خدمة" },
    { value: "custom", label: "مخصص" }
  ];
};

// ترجمة المصطلحات العربية إلى الإنجليزية للبحث عن الصور
const translateToEnglish = (arabicTerm: string): string => {
  const translations: { [key: string]: string } = {
    // أدوات الطب الصيني التقليدي - محسّنة
    "أدوات الحجامة": "cupping therapy tools professional medical equipment",
    "أدوات الإبر الصينية": "acupuncture needles traditional chinese medicine tools",
    "أدوات تدليك التوينا": "tuina massage therapy tools traditional chinese",
    "أدوات تشي كونغ": "qigong meditation equipment wellness tools",
    "موازين الأعشاب التقليدية": "traditional herbal medicine scales ancient chinese",
    "أدوات التشخيص التقليدي": "traditional chinese medicine diagnosis tools",
    "أدوات العلاج الخشبية": "wooden therapy tools traditional chinese medicine",
    "أحجار اليشم العلاجية": "jade healing stones traditional chinese therapy",
    "أدوات العلاج بالكي": "moxibustion therapy tools traditional chinese medicine",
    "أدوات جوا شا": "gua sha tools jade stone therapy traditional chinese",
    
    // مصطلحات محددة للحجامة
    "مضخة الحجامة": "cupping pump therapy equipment medical",
    "كؤوس الحجامة السيليكون": "silicone cupping cups therapy equipment",
    "كؤوس الحجامة الزجاجية": "glass cupping cups traditional therapy",
    "طقم الحجامة الاحترافي": "professional cupping set medical equipment",
    "أدوات الحجامة النارية": "fire cupping tools traditional therapy",
    
    // مصطلحات محددة للوخز
    "إبر الوخز المعقمة": "sterile acupuncture needles medical equipment",
    "إبر الوخز الذهبية": "golden acupuncture needles traditional chinese",
    "إبر الوخز الفضية": "silver acupuncture needles medical therapy",
    "دليل إبر الوخز": "acupuncture needle guide traditional medicine",
    "جهاز الوخز الكهربائي": "electroacupuncture device medical equipment",
    
    // مصطلحات محددة لجوا شا
    "أداة جوا شا اليشم": "jade gua sha tool traditional chinese therapy",
    "أداة جوا شا الكوارتز الوردي": "rose quartz gua sha tool healing stone",
    "أداة جوا شا الستانلس ستيل": "stainless steel gua sha tool modern therapy",
    "أداة جوا شا القرن": "horn gua sha tool traditional chinese medicine",
    "أداة جوا شا الخشبية": "wooden gua sha tool natural therapy",
    
    // أنماط الصور - محسّنة
    "طب تقليدي": "traditional medicine herbs chinese therapy",
    "أعشاب طبيعية": "natural herbs organic medicine healing plants",
    "سكينة وصحة": "wellness zen meditation peaceful health",
    "وخز بالإبر": "acupuncture traditional chinese medicine therapy",
    "تأمل وهدوء": "meditation calm mindfulness zen peaceful",
    "نمو الأعمال": "business growth success corporate development",
    "مكتب ناشئ": "startup office modern workspace entrepreneur",
    "قيادة": "leadership business management professional",
    "شبكات تواصل": "networking business professional connections",
    "ابتكار": "innovation technology creative business",
    "نمو شخصي": "personal growth self development motivation",
    "تحفيز": "motivation inspiration success achievement",
    "نجاح وإنجاز": "success achievement victory celebration",
    "قراءة وتعلم": "reading learning books education knowledge",
    "وعي ذاتي": "mindfulness self awareness meditation",
    "طعام صحي": "healthy food nutrition organic fresh",
    "فواكه وخضروات": "fruits vegetables fresh organic healthy",
    "طبخ ومطبخ": "cooking kitchen chef food preparation",
    "حمية وتغذية": "diet nutrition healthy eating wellness",
    "عضوي وطبيعي": "organic natural healthy food fresh",
    "صالة رياضية": "gym workout fitness equipment exercise",
    "جري وكارديو": "running cardio fitness exercise outdoor",
    "يوغا وبيلاتس": "yoga pilates meditation fitness wellness",
    "رياضة ونشاط": "sports activity fitness exercise healthy",
    "تدريب قوة": "strength training gym weights fitness",
    "صحة نفسية": "mental health wellness therapy counseling",
    "استشارة وعلاج": "counseling therapy mental health treatment",
    "دماغ وعقل": "brain mind psychology mental health",
    "رفاهية عاطفية": "emotional wellbeing mental health happiness",
    "علاقات": "relationships love family friendship connection",
    "تكنولوجيا رقمية": "digital technology computer modern innovation",
    "برمجة وكود": "programming code software development technology",
    "ذكاء اصطناعي": "artificial intelligence AI technology future",
    "أجهزة وتقنيات": "gadgets devices technology modern electronics",
    "ابتكار ومستقبل": "innovation future technology advancement",
    "تسويق رقمي": "digital marketing social media online business",
    "وسائل التواصل": "social media networking digital communication",
    "هوية تجارية": "branding identity logo design business",
    "إعلان وترويج": "advertising promotion marketing business",
    "تحليلات وبيانات": "analytics data charts business intelligence",
    "مال واستثمار": "money investment finance business wealth",
    "مصرفي ومالي": "banking financial money business economy",
    "عملة رقمية": "cryptocurrency digital currency bitcoin finance",
    "مخططات ورسوم": "charts graphs data visualization business",
    "اقتصاد وأعمال": "economy business finance market global",
    "فصل دراسي وتعلم": "classroom learning education students teaching",
    "كتب ومعرفة": "books knowledge reading education library",
    "طلاب وتدريس": "students teaching education classroom learning",
    "تعليم إلكتروني": "online education e-learning digital classroom",
    "تخرج وإنجاز": "graduation achievement education success celebration",
    "خلفيات مجردة": "abstract backgrounds modern minimalist design",
    "احترافي": "professional business modern clean corporate",
    "عصري": "modern contemporary style design"
  };

  // إذا لم يوجد ترجمة دقيقة، حاول تحسين البحث
  const translated = translations[arabicTerm];
  if (translated) {
    return translated;
  }
  
  // ترجمة تلقائية محسّنة للمصطلحات غير المعرّفة
  const enhancedTerm = arabicTerm
    .replace(/أدوات/, "tools equipment")
    .replace(/طبيعي/, "natural organic")
    .replace(/صحي/, "healthy wellness")
    .replace(/تقليدي/, "traditional authentic")
    .replace(/حديث/, "modern contemporary")
    .replace(/علاج/, "therapy treatment healing")
    .replace(/طب/, "medicine medical healthcare");
    
  return enhancedTerm !== arabicTerm ? enhancedTerm : arabicTerm;
};

export const ContentGenerator = () => {
  const [specialty, setSpecialty] = useState("");
  const [contentType, setContentType] = useState("");
  const [language, setLanguage] = useState("ar");
  const [imageStyle, setImageStyle] = useState("");
  const [imageDimension, setImageDimension] = useState("square");
  const [imageSource, setImageSource] = useState("pixabay");
  const [pixabayContentType, setPixabayContentType] = useState("photo");
  const [customPrompt, setCustomPrompt] = useState("");
  const [viewMode, setViewMode] = useState<'static' | 'interactive'>('static');
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return geminiApiManager.getCurrentKey();
  });

  // حفظ مفتاح Gemini في localStorage عند تغييره وعرض إحصائيات المفاتيح
  useEffect(() => {
    const stats = geminiApiManager.getKeyStats();
    console.log('إحصائيات مفاتيح Gemini API:', stats);
  }, [geminiApiKey]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  
  // استخدام Context بدلاً من localStorage المحلي
  const { 
    generatedContent, 
    setGeneratedContent, 
    updateUploadedImageUrl 
  } = useGeneratedContent();

  const [textSettings, setTextSettings] = useState<TextSettings>({
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0,
    fontFamily: 'Cairo',
    textColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.7)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2
  });
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    textColor: '#ffffff',
    backgroundColor: '#1a1a2e',
    overlayColor: 'rgba(0, 0, 0, 0.4)',
    overlayOpacity: 40,
    gradientType: 'none',
    gradientDirection: '135deg',
    gradientColors: ['#667eea', '#764ba2'],
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    useGradient: false,
    borderColor: '#e2e8f0',
    borderWidth: 0,
  });
  const [logoSettings, setLogoSettings] = useState<LogoSettings | undefined>(undefined);
  const [frameSettings, setFrameSettings] = useState<FrameSettings>({
    showFrame: false,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    opacity: 30,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    borderStyle: 'solid',
    textFrameEnabled: true,
    textFrameBackground: 'rgba(0, 0, 0, 0.4)',
    textFrameOpacity: 40,
    textFrameBorderColor: '#ffffff',
    textFrameBorderWidth: 1,
    textFrameBorderRadius: 8,
    textFramePadding: 15,
    textFrameShadowColor: 'rgba(0, 0, 0, 0.6)',
    textFrameShadowBlur: 8,
    textFrameShadowOffsetX: 0,
    textFrameShadowOffsetY: 2,
    textFrameBorderStyle: 'solid',
    textFrameBlur: 10,
    textFramePosition: 'center',
    textFrameWidth: 80,
    textFrameHeight: 60,
    textAlignment: 'center',
    customFrameWidth: 90,
    customFrameHeight: 70,
    // تدرج خلفية إطار النص
    textFrameGradientEnabled: false,
    textFrameGradientDirection: 45,
    textFrameGradientStart: '#000000',
    textFrameGradientEnd: '#333333',
    textFrameGradientStops: 2,
    textFrameGradientStartOpacity: 40,
    textFrameGradientEndOpacity: 20,
    textFrameGradientStartPosition: 0,
    textFrameGradientEndPosition: 100,
    textFrameGradientType: 'linear'
  });

  // تخزين واستعادة الإعدادات
  useEffect(() => {
    const savedSettings = {
      specialty: localStorage.getItem('contentGenerator_specialty') || '',
      contentType: localStorage.getItem('contentGenerator_contentType') || '',
      language: localStorage.getItem('contentGenerator_language') || 'ar',
      imageStyle: localStorage.getItem('contentGenerator_imageStyle') || '',
      imageDimension: localStorage.getItem('contentGenerator_imageDimension') || 'square',
      imageSource: localStorage.getItem('contentGenerator_imageSource') || 'pixabay',
      pixabayContentType: localStorage.getItem('contentGenerator_pixabayContentType') || 'photo',
      customPrompt: localStorage.getItem('contentGenerator_customPrompt') || '',
      textSettings: (() => {
        const data = localStorage.getItem('contentGenerator_textSettings');
        return JSON.parse(data && data !== "undefined" ? data : '{}');
      })(),
      colorSettings: (() => {
        const data = localStorage.getItem('contentGenerator_colorSettings');
        return JSON.parse(data && data !== "undefined" ? data : '{}');
      })(),
      logoSettings: (() => {
        const data = localStorage.getItem('contentGenerator_logoSettings');
        return JSON.parse(data && data !== "undefined" ? data : 'null');
      })(),
      frameSettings: (() => {
        const data = localStorage.getItem('contentGenerator_frameSettings');
        return JSON.parse(data && data !== "undefined" ? data : '{}');
      })(),
    };

    if (savedSettings.specialty) setSpecialty(savedSettings.specialty);
    if (savedSettings.contentType) setContentType(savedSettings.contentType);
    if (savedSettings.language) setLanguage(savedSettings.language);
    if (savedSettings.imageStyle) setImageStyle(savedSettings.imageStyle);
    if (savedSettings.imageDimension) setImageDimension(savedSettings.imageDimension);
    if (savedSettings.imageSource) setImageSource(savedSettings.imageSource);
    if (savedSettings.pixabayContentType) setPixabayContentType(savedSettings.pixabayContentType);
    if (savedSettings.customPrompt) setCustomPrompt(savedSettings.customPrompt);

    if (Object.keys(savedSettings.textSettings).length > 0) {
      setTextSettings(prev => ({ ...prev, ...savedSettings.textSettings }));
    }
    if (Object.keys(savedSettings.colorSettings).length > 0) {
      setColorSettings(prev => ({ ...prev, ...savedSettings.colorSettings }));
    }
    if (savedSettings.logoSettings) {
      setLogoSettings(savedSettings.logoSettings);
    }
    if (Object.keys(savedSettings.frameSettings).length > 0) {
      setFrameSettings(prev => ({ ...prev, ...savedSettings.frameSettings }));
    }
  }, []);

  // حفظ الإعدادات عند التغيير
  useEffect(() => {
    localStorage.setItem('contentGenerator_specialty', specialty);
  }, [specialty]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_contentType', contentType);
  }, [contentType]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_imageStyle', imageStyle);
  }, [imageStyle]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_imageDimension', imageDimension);
  }, [imageDimension]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_imageSource', imageSource);
  }, [imageSource]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_pixabayContentType', pixabayContentType);
  }, [pixabayContentType]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_customPrompt', customPrompt);
  }, [customPrompt]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_textSettings', JSON.stringify(textSettings));
  }, [textSettings]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_colorSettings', JSON.stringify(colorSettings));
  }, [colorSettings]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_logoSettings', JSON.stringify(logoSettings));
  }, [logoSettings]);

  useEffect(() => {
    localStorage.setItem('contentGenerator_frameSettings', JSON.stringify(frameSettings));
  }, [frameSettings]);

  // إعدادات الميزات المتقدمة
  const [shapeInversionSettings, setShapeInversionSettings] = useState<ShapeInversionSettings>({
    enabled: false,
    mode: 'normal',
    maskOpacity: 80,
    textPlacement: 'inside',
    maskBlur: 0,
    backgroundBlending: 'normal'
  });

  const [advancedShapeSettings, setAdvancedShapeSettings] = useState<AdvancedShapeSettings>({
    shapeType: 'rectangle',
    cornerRadius: 0,
    hasRoundedCorners: false,
    polygonSides: 6,
    polygonRotation: 0,
    curvatureStrength: 0,
    edgeSmoothness: 0,
    aspectRatio: 1,
    skewX: 0,
    skewY: 0
  });

  const [backgroundEffectsSettings, setBackgroundEffectsSettings] = useState<BackgroundEffectsSettings>({
    blurEnabled: false,
    blurAmount: 0,
    blurType: 'gaussian',
    lightingEnabled: false,
    lightingType: 'ambient',
    lightIntensity: 50,
    lightColor: '#ffffff',
    lightAngle: 45,
    lightDistance: 100,
    atmosphericEnabled: false,
    fogDensity: 0,
    fogColor: '#ffffff',
    particleCount: 0,
    particleType: 'dust',
    overlayEnabled: false,
    overlayTexture: 'noise',
    overlayIntensity: 20,
    overlayBlendMode: 'overlay',
    vignetteEnabled: false,
    vignetteIntensity: 30,
    vignetteSize: 70,
    vignetteColor: '#000000'
  });

  const [enhancedTextSettings, setEnhancedTextSettings] = useState<EnhancedTextSettings>({
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Cairo',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0,
    wordSpacing: 0,
    textColor: '#ffffff',
    shadowEnabled: true,
    shadowColor: 'rgba(0, 0, 0, 0.7)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    multiShadowEnabled: false,
    shadowLayers: [
      { color: 'rgba(0, 0, 0, 0.7)', blur: 4, offsetX: 2, offsetY: 2, spread: 0 },
      { color: 'rgba(255, 255, 255, 0.3)', blur: 8, offsetX: -1, offsetY: -1, spread: 1 }
    ],
    highContrastEnabled: false,
    contrastBackground: 'rgba(0, 0, 0, 0.8)',
    contrastBorderWidth: 2,
    contrastBorderColor: '#ffffff',
    textBackgroundEnabled: false,
    textBackgroundColor: 'rgba(0, 0, 0, 0.5)',
    textBackgroundOpacity: 50,
    textBackgroundPadding: 15,
    textBackgroundRadius: 8,
    textBackgroundGradient: false,
    textBackgroundGradientStart: '#000000',
    textBackgroundGradientEnd: '#333333',
    outlineEnabled: false,
    outlineColor: '#000000',
    outlineWidth: 1,
    outlineStyle: 'solid',
    outlineGradient: false,
    outlineGradientStart: '#000000',
    outlineGradientEnd: '#666666',
    textPosition: 'center',
    textRotation: 0,
    textSkew: 0,
    textScale: 100,
    textPerspective: 0,
    glowEnabled: false,
    glowColor: '#ffffff',
    glowIntensity: 20,
    innerGlowEnabled: false,
    innerGlowColor: '#ffffff',
    innerGlowIntensity: 10,
    gradientTextEnabled: false,
    gradientTextStart: '#667eea',
    gradientTextEnd: '#764ba2',
    gradientTextDirection: 45,
    gradientTextStops: 2,
    text3DEnabled: false,
    text3DDepth: 5,
    text3DColor: '#333333',
    text3DAngle: 45,
    reflectionEnabled: false,
    reflectionOpacity: 50,
    reflectionBlur: 2,
    reflectionDistance: 0,
    animationEnabled: false,
    animationType: 'none',
    animationDuration: 1000,
    animationDelay: 0,
    textOpacity: 100,
    blendMode: 'normal',
    fontSmoothing: true,
    fontOpticalSizing: false,
    fontVariationSettings: ''
  });

  const [imageControlSettings, setImageControlSettings] = useState<ImageControlSettings>({
    flipHorizontal: false,
    flipVertical: false,
    rotation: 0,
    positionX: 50,
    positionY: 50,
    scale: 100,
    cropEnabled: false,
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    opacity: 100,
    advancedOpacityEnabled: false,
    opacityShape: 'circle' as const,
    opacityCenter: 100,
    opacityEdge: 0,
    opacityCenterX: 50,
    opacityCenterY: 50,
    opacityRadiusX: 50,
    opacityRadiusY: 50,
    opacityFeatherAmount: 30,
    opacityGradientDirection: 0,
    opacityCustomPattern: 'radial',
    opacityInvert: false
  });

  const [advancedBlendingSettings, setAdvancedBlendingSettings] = useState<AdvancedBlendingSettings>({
    blendType: 'smooth',
    transitionWidth: 20,
    blendIntensity: 50,
    smoothingRadius: 10,
    gradientStops: 5,
    
    waveFrequency: 5,
    waveAmplitude: 15,
    waveOffset: 0,
    waveType: 'sine',
    waveDirection: 'horizontal',
    
    zigzagSegments: 8,
    zigzagHeight: 20,
    zigzagPattern: 'sharp',
    zigzagRandomness: 0,
    
    curveRadius: 50,
    curveDirection: 'inward',
    curveSmoothing: 80,
    curveAsymmetry: 0,
    
    organicComplexity: 5,
    organicVariation: 30,
    organicSeed: 1,
    organicFlowDirection: 'radial',
    
    spiralTurns: 3,
    spiralRadius: 40,
    spiralTightness: 50,
    spiralDirection: 'clockwise',
    
    diamondSize: 30,
    diamondRotation: 45,
    diamondDistortion: 0,
    
    hexagonSize: 25,
    hexagonOrientation: 'flat',
    hexagonSpacing: 20,
    
    bubbleCount: 12,
    bubbleSize: 20,
    bubbleVariation: 40,
    bubbleDistribution: 'random',
    
    lightningBranches: 5,
    lightningIntensity: 70,
    lightningChaos: 30,
    
    fabricPattern: 'weave',
    fabricDensity: 50,
    fabricRoughness: 25,
    
    applyToGradients: true,
    applyToOverlays: true,
    applyToBorders: false,
    applyToBackground: true,
    applyToTexts: false,
    applyToShapes: true,
    applyToShadows: false,
    
    layerBlendMode: 'overlay',
    layerOpacity: 80,
    layerMaskFeather: 15,
    
    enablePreview: true,
    realTimeUpdate: true,
    animationSpeed: 50,
    enableAnimation: false
  });

  const [advancedTransparencySettings, setAdvancedTransparencySettings] = useState<AdvancedTransparencySettings>({
    enabled: true,
    borderType: 'soft',
    borderWidth: 2,
    featherRadius: 10,
    gradientStops: 3,
    edgeHardness: 50,
    antiAliasing: true,
    blendMode: 'normal',
    opacity: 100,
    innerGlow: false,
    innerGlowColor: '#ffffff',
    innerGlowSize: 5,
    outerGlow: false,
    outerGlowColor: '#000000',
    outerGlowSize: 10,
    bevelEnabled: false,
    bevelDepth: 3,
    bevelSize: 5,
    bevelAngle: 45,
    shadowEnabled: false,
    shadowColor: '#000000',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 4,
    shadowSpread: 0
  });

  const [layoutType, setLayoutType] = useState<'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse'>('rectangle');
  const [triangleDirection, setTriangleDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const [shapeMarginSettings, setShapeMarginSettings] = useState<ShapeMarginSettings>({
    topMargin: 20,
    bottomMargin: 20,
    leftMargin: 20,
    rightMargin: 20,
    uniformMargin: true
  });

  const [spaceLayoutSettings, setSpaceLayoutSettings] = useState<SpaceLayoutSettings>({
    layoutPattern: 'half-split',
    textPosition: 'right',
    imagePosition: 'left',
    divisionStyle: 'curved',
    spacingRatio: 50
  });
  const [textDistributionSettings, setTextDistributionSettings] = useState<TextDistributionSettings>({
    horizontalPosition: 50,
    verticalPosition: 50,
    textAreaWidth: 80,
    textAreaHeight: 60,
    autoDistribution: true,
    distributionStrategy: 'optimal',
    innerPadding: 15,
    avoidEdges: true,
    edgeBuffer: 20,
    shapeAware: true,
    dynamicSizing: true,
  });

  const [shapePositionSettings, setShapePositionSettings] = useState<ShapePositionSettings>({
    positionX: 50,
    positionY: 50,
    shapeWidth: 80,
    shapeHeight: 80,
    rotation: 0,
  });

  const [textPositionSettings, setTextPositionSettings] = useState<TextPositionSettings>({
    useCustomTextPosition: false,
    customTextX: 50,
    customTextY: 50,
    textWidth: 80,
    textHeight: 40,
  });

  // حالة قلب الصورة
  const [isFlippedHorizontal, setIsFlippedHorizontal] = useState(false);
  const [isFlippedVertical, setIsFlippedVertical] = useState(false);

  // دوال قلب الصورة
  const handleFlipHorizontal = () => setIsFlippedHorizontal(!isFlippedHorizontal);
  const handleFlipVertical = () => setIsFlippedVertical(!isFlippedVertical);
  const handleResetFlip = () => {
    setIsFlippedHorizontal(false);
    setIsFlippedVertical(false);
  };

  // حفظ واستعادة الإعدادات
  useEffect(() => {
    const savedSettings = localStorage.getItem('contentGeneratorSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings && savedSettings !== "undefined" ? savedSettings : '{}');
        if (parsed.textSettings) setTextSettings(parsed.textSettings);
        if (parsed.colorSettings) setColorSettings(parsed.colorSettings);
        if (parsed.frameSettings) setFrameSettings(parsed.frameSettings);
        if (parsed.logoSettings) setLogoSettings(parsed.logoSettings);
        if (parsed.layoutType) setLayoutType(parsed.layoutType);
        if (parsed.triangleDirection) setTriangleDirection(parsed.triangleDirection);
      } catch (error) {
        console.log('خطأ في استعادة الإعدادات:', error);
      }
    }
  }, []);

  useEffect(() => {
    const settingsToSave = {
      textSettings,
      colorSettings,
      frameSettings,
      logoSettings,
      layoutType,
      triangleDirection,
      shapeMarginSettings,
      textDistributionSettings
    };
    localStorage.setItem('contentGeneratorSettings', JSON.stringify(settingsToSave));
  }, [textSettings, colorSettings, frameSettings, logoSettings, layoutType, triangleDirection, shapeMarginSettings, textDistributionSettings]);

  const [originalContent, setOriginalContent] = useState<{
    longText: string;
    shortText: string;
    imageUrl: string;
    imageAlt: string;
    originalImageUrl?: string;
    uploadedImageUrl?: string;
  } | null>(null);

  const [autoUploadEnabled, setAutoUploadEnabled] = useState(true);
  // const [removeBackgroundEnabled, setRemoveBackgroundEnabled] = useState(false); // Disabled background removal
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgbbImageUrl, setImgbbImageUrl] = useState<string>("");
  const [isUploadingToImgbb, setIsUploadingToImgbb] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // State for content preview visibility
  const [isContentPreviewVisible, setIsContentPreviewVisible] = useState(true);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [isBackgroundOnTop, setIsBackgroundOnTop] = useState(false);
  const [facebookPreviewVisible, setFacebookPreviewVisible] = useState(false);
  
  // استخدام hook لحفظ تأثيرات الطبقة مع تفعيل التأثير الافتراضي
  const { currentLayerEffect, updateLayerEffect } = usePersistedLayerEffect({
    enableDefaultOnFirstRun: true
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const smartAnalysisRef = useRef<(() => void) | null>(null);

  const isRTL = language === "ar" || language === "ar-en";

  // حفظ المحتوى في localStorage عند أي تغيير (بدون العرض التلقائي)
  useEffect(() => {
    if (generatedContent) {
      // دمج المحتوى الجديد مع المحتوى الموجود في localStorage للحفاظ على uploadedImageUrl
      const savedContent = localStorage.getItem('facebook_generated_content');
      let existingUploadedUrl = null;
      
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          existingUploadedUrl = parsedContent.uploadedImageUrl;
        } catch (error) {
          console.error('Error parsing existing content:', error);
        }
      }
      
      const contentToSave = {
        ...generatedContent,
        // الحفاظ على uploadedImageUrl إذا كان موجود ولم يتغير المحتوى الأساسي
        uploadedImageUrl: existingUploadedUrl && generatedContent.imageUrl === JSON.parse(savedContent || '{}').imageUrl 
          ? existingUploadedUrl 
          : generatedContent.uploadedImageUrl
      };
      
      localStorage.setItem('facebook_generated_content', JSON.stringify(contentToSave));
      console.log('تم حفظ المحتوى في localStorage:', contentToSave);
      
      // إرسال حدث مخصص لتحديث المكونات الأخرى
      window.dispatchEvent(new CustomEvent('facebookContentUpdated'));
      
      // إظهار إشعار بسيط عند حفظ المحتوى
      toast.success("✅ تم حفظ المحتوى - يمكنك العثور عليه في تبويبة فيسبوك", {
        duration: 3000
      });
    }
  }, [generatedContent]);

  // حفظ حالة المولد الكاملة للحفاظ على المحتوى عند التنقل بين التبويبات
  useEffect(() => {
    const state = {
      generatedContent,
      isContentPreviewVisible,
      textSettings,
      colorSettings,
      frameSettings,
      logoSettings,
      layoutType,
      specialty,
      contentType,
      imageDimension,
      language
    };
    
    localStorage.setItem("content_generator_state", JSON.stringify(state));
  }, [generatedContent, isContentPreviewVisible, textSettings, colorSettings, frameSettings, logoSettings, layoutType, specialty, contentType, imageDimension, language]);

  // تحميل حالة المولد عند التهيئة
  useEffect(() => {
    const saved = localStorage.getItem("content_generator_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // استرجاع إعدادات المعاينة
        if (parsed.isContentPreviewVisible !== undefined) {
          setIsContentPreviewVisible(parsed.isContentPreviewVisible);
        }
        
        // استرجاع الإعدادات الأخرى إذا كانت موجودة
        if (parsed.textSettings) setTextSettings(parsed.textSettings);
        if (parsed.colorSettings) setColorSettings(parsed.colorSettings);
        if (parsed.frameSettings) setFrameSettings(parsed.frameSettings);
        if (parsed.logoSettings) setLogoSettings(parsed.logoSettings);
        if (parsed.layoutType) setLayoutType(parsed.layoutType);
        if (parsed.specialty) setSpecialty(parsed.specialty);
        if (parsed.contentType) setContentType(parsed.contentType);
        if (parsed.imageDimension) setImageDimension(parsed.imageDimension);
        if (parsed.language) setLanguage(parsed.language);
        
        console.log("تم تحميل حالة المولد المحفوظة");
      } catch (error) {
        console.error("خطأ في تحميل حالة المولد:", error);
      }
    }
  }, []); // فقط عند التهيئة

  // إعادة إنشاء المعاينة تلقائياً عند تغيير الإعدادات المهمة
  useEffect(() => {
    if (generatedContent && autoUploadEnabled && uploadedImagePreview) {
      const debounceTimer = setTimeout(async () => {
        try {
          console.log('Auto-updating preview due to settings change...');
          const { blob, url: localUrl } = await createFinalImageFromCanvas();
          setUploadedImagePreview(localUrl);
          console.log('Preview updated successfully');
        } catch (error) {
          console.log('Preview update skipped due to error:', error);
        }
      }, 1000); // انتظار ثانية واحدة لتجنب التحديثات المتكررة

      return () => clearTimeout(debounceTimer);
    }
  }, [textSettings, colorSettings, frameSettings, logoSettings, layoutType, triangleDirection, shapeMarginSettings, textDistributionSettings, shapeInversionSettings, advancedShapeSettings, backgroundEffectsSettings, enhancedTextSettings, textPositionSettings, advancedBlendingSettings]);

  // Console.log لتتبع إعدادات النص
  console.log('ContentGenerator - إعدادات النص الحالية:', textSettings);
  console.log('ContentGenerator - إعدادات الألوان الحالية:', colorSettings);
  console.log('ContentGenerator - إعدادات الإطار الحالية:', frameSettings);

  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value);
    setImageStyle(""); // Reset image style when specialty changes
    setContentType(""); // Reset content type when specialty changes
  };

  // إنشاء وتحميل الصورة النهائية من المحتوى المعدل
  const createFinalImageFromCanvas = async (): Promise<{ blob: Blob; url: string }> => {
    // البحث عن العنصر الصحيح - ContentCanvas مباشرة
    const contentElement = document.querySelector('[data-content-canvas="true"]');
    
    if (!contentElement) {
      console.error('Content element not found. Available elements:', {
        dataContentCanvas: document.querySelector('[data-content-canvas="true"]'),
        contentCanvas: document.querySelector('.content-canvas')
      });
      throw new Error("لا يمكن العثور على المحتوى المولد - تأكد من وجود المحتوى أولاً");
    }

    console.log('Found content element:', contentElement);
    
    // التحقق من أن العنصر له أبعاد صحيحة ويحتوي على محتوى
    const element = contentElement as HTMLElement;
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      throw new Error('عنصر المحتوى فارغ أو غير مرئي - يرجى المحاولة مرة أخرى');
    }

    try {
      // إخفاء أزرار التحكم والعناصر غير المرغوب فيها قبل الالتقاط
      const controlElements = element.querySelectorAll('.absolute, button, [role="button"]');
      const originalStyles: { element: Element; display: string }[] = [];
      
      controlElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        originalStyles.push({ element: el, display: htmlEl.style.display });
        htmlEl.style.display = 'none';
      });

      // انتظار حتى يكتمل العرض
      await new Promise(resolve => setTimeout(resolve, 500));

      // استخدام html2canvas لتحويل العنصر إلى صورة مع إعدادات محسنة
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 3, // دقة عالية جداً للحصول على أفضل النتائج
        backgroundColor: null,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // تجاهل الأزرار والعناصر الإضافية
          return element.tagName === 'BUTTON' || 
                 element.hasAttribute('role') && element.getAttribute('role') === 'button' ||
                 element.classList.contains('absolute') ||
                 element.closest('.absolute') !== null;
        },
        onclone: (clonedDoc) => {
          // إزالة جميع أزرار التحكم من النسخة المستنسخة
          const buttonsInClone = clonedDoc.querySelectorAll('button, [role="button"], .absolute');
          buttonsInClone.forEach(btn => btn.remove());
        }
      });

      // استعادة الحالة الأصلية للعناصر
      originalStyles.forEach(({ element, display }) => {
        (element as HTMLElement).style.display = display;
      });

      console.log('Canvas created successfully:', {
        width: canvas.width,
        height: canvas.height
      });

      // تحويل الكانفاس إلى Blob مع أعلى جودة ممكنة
      const blob = await new Promise<Blob>((resolve, reject) => {
        // استخدام تنسيق PNG للحفاظ على الشفافية والجودة العالية
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('فشل في إنشاء الصورة'));
            }
          },
          'image/png' // PNG للحفاظ على أعلى جودة وتفاصيل
        );
      });

      // إنشاء URL للمعاينة المحلية
      const localUrl = URL.createObjectURL(blob);

      return { blob, url: localUrl };
    } catch (error) {
      console.error('Error creating image from canvas:', error);
      throw new Error('فشل في إنشاء الصورة من المحتوى');
    }
  };

  // Function to upload image to imgbb
  const uploadToImgbb = async (imageUrl: string): Promise<string> => {
    setIsUploadingToImgbb(true);
    try {
      // Convert image URL to blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append("image", blob);
      formData.append("key", "6d207e02198a847aa98d0a2a901485a5"); // imgbb API key

      // Upload to imgbb
      const uploadResponse = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || "فشل في رفع الصورة");
      }

      const imgbbUrl = result.data.url;
      setImgbbImageUrl(imgbbUrl);
      toast.success("تم رفع الصورة إلى imgbb بنجاح!");
      return imgbbUrl;
    } catch (error) {
      console.error('Error uploading to imgbb:', error);
      toast.error("فشل في رفع الصورة إلى imgbb");
      throw error;
    } finally {
      setIsUploadingToImgbb(false);
    }
  };

  // Function to copy imgbb link to clipboard
  const copyImgbbLinkToClipboard = () => {
    if (imgbbImageUrl) {
      navigator.clipboard.writeText(imgbbImageUrl);
      toast.success("تم نسخ رابط الصورة!");
    }
  };

  // Function to upload generated image content to hosting service
  const uploadGeneratedImageToHosting = async (): Promise<string> => {
    try {
      setIsUploading(true);
      
      // Clear previous upload URL to force new link generation
      setUploadedImageUrl(null);
      setUploadedImagePreview(null);

      // إنشاء الصورة من المحتوى المعدل
      const { blob, url: localUrl } = await createFinalImageFromCanvas();
      
      // عرض المعاينة المحلية فوراً
      setUploadedImagePreview(localUrl);
      console.log('Local preview URL created:', localUrl);

      // رفع الصورة إلى الخدمة
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
        };
        reader.readAsDataURL(blob);
      });

      // Upload to imgbb with timestamp to ensure unique URLs
      const timestamp = Date.now();
      const formData = new FormData();
      formData.append('image', base64);
      formData.append('name', `content_${timestamp}`); // Unique name for each upload
      formData.append('expiration', '600'); // 10 minutes expiration

      const response = await fetch('https://api.imgbb.com/1/upload?key=c9aeeb2c2e029f20a23564c192fd5764', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`فشل في الرفع: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const newUrl = data.data.url;
        // Ensure URL is fresh and updated
        setUploadedImageUrl(newUrl);
        setUploadedImagePreview(newUrl);
        return newUrl;
      } else {
        throw new Error(data.error?.message || 'فشل في رفع الصورة');
      }
      
    } catch (error) {
      console.error('Error uploading generated image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const buildPrompt = () => {
    const specialtyLabel = specialties.find(s => s.value === specialty)?.label || specialty;
    const contentTypeLabel = getContentTypesBySpecialty(specialty).find(c => c.value === contentType)?.label || contentType;
    
    let basePrompt = "";
    
    switch (language) {
      case "ar":
        basePrompt = `أنشئ محتوى ${contentTypeLabel} في مجال ${specialtyLabel}. يجب أن يكون المحتوى باللغة العربية، مفيد وجذاب للجمهور.`;
        break;
      case "en":
        basePrompt = `Create ${contentTypeLabel} content in the field of ${specialtyLabel}. The content should be in English, useful and engaging for the audience.`;
        break;
      case "ar-en":
        basePrompt = `أنشئ محتوى ${contentTypeLabel} في مجال ${specialtyLabel}. يجب أن يكون المحتوى باللغتين العربية والإنجليزية، مفيد وجذاب للجمهور. Create ${contentTypeLabel} content in the field of ${specialtyLabel} in both Arabic and English.`;
        break;
      default:
        basePrompt = `أنشئ محتوى ${contentTypeLabel} في مجال ${specialtyLabel}. يجب أن يكون المحتوى مفيد وجذاب للجمهور.`;
    }
    
    return basePrompt;
  };

  // Enhanced function to extract keywords from text for better image matching
  const extractKeywordsFromText = (text: string, specialty: string): string => {
    // Remove markdown formatting
    const cleanText = text.replace(/[#*>\-]/g, '').toLowerCase();
    
    // Arabic keyword extraction
    const arabicKeywords = [
      'طعام', 'صحة', 'رياضة', 'تمرين', 'طبيعة', 'نجاح', 'عمل', 'تجارة',
      'تعليم', 'كتاب', 'قراءة', 'تقنية', 'كمبيوتر', 'هاتف', 'سيارة',
      'منزل', 'عائلة', 'أطفال', 'حب', 'صداقة', 'سفر', 'مال', 'استثمار',
      'حجامة', 'علاج', 'طب', 'شفاء', 'أكواب', 'زجاجية', 'سيليكون'
    ];
    
    // English keyword extraction
    const englishKeywords = [
      'food', 'health', 'fitness', 'exercise', 'nature', 'success', 'business',
      'education', 'book', 'reading', 'technology', 'computer', 'phone', 'car',
      'home', 'family', 'children', 'love', 'friendship', 'travel', 'money', 'investment',
      'cupping', 'therapy', 'healing', 'medicine', 'cups', 'traditional', 'wellness'
    ];
    
    // Find matching keywords
    const foundKeywords = [...arabicKeywords, ...englishKeywords].filter(keyword => 
      cleanText.includes(keyword)
    );
    
    // If no specific keywords found, use specialty-based keywords
    if (foundKeywords.length === 0) {
      const specialtyKeywords = getSpecialtyKeywords(specialty);
      return specialtyKeywords.join(' ');
    }
    
    return foundKeywords.slice(0, 3).join(' '); // Use up to 3 keywords
  };

  const getSpecialtyKeywords = (specialty: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      "chinese-medicine": ["traditional medicine", "herbs", "acupuncture", "wellness", "zen", "cupping", "therapy", "healing"],
      "entrepreneurship": ["business", "startup", "leadership", "success", "innovation"],
      "self-development": ["growth", "motivation", "success", "reading", "mindfulness"],
      "nutrition": ["healthy food", "fruits", "vegetables", "cooking", "organic"],
      "fitness": ["gym", "workout", "running", "sports", "strength"],
      "psychology": ["mental health", "brain", "counseling", "emotions", "relationships"],
      "technology": ["digital", "computer", "programming", "AI", "innovation"],
      "marketing": ["digital marketing", "social media", "branding", "advertising", "analytics"],
      "finance": ["money", "investment", "banking", "cryptocurrency", "economy"],
      "education": ["learning", "books", "students", "classroom", "graduation"]
    };
    
    return keywordMap[specialty] || ["professional", "modern", "clean"];
  };

  // دالة للحصول على استعلام بديل أوسع عند عدم وجود نتائج
  const getFallbackSearchQuery = (specialty: string, contentType: string, originalQuery: string): string => {
    console.log("getFallbackSearchQuery - المدخلات:", { specialty, contentType, originalQuery });
    
    // خريطة المجالات إلى كلمات مفتاحية بديلة واسعة
    const specialtyFallbacks: { [key: string]: string[] } = {
      "chinese-medicine": ["traditional medicine", "herbs", "wellness", "health", "therapy", "healing"],
      "entrepreneurship": ["business", "office", "professional", "success", "teamwork"],
      "self-development": ["growth", "books", "learning", "motivation", "inspiration"],
      "nutrition": ["healthy food", "organic", "fresh food", "cooking", "diet"],
      "fitness": ["gym", "exercise", "sports", "health", "training"],
      "psychology": ["mental health", "counseling", "therapy", "wellness", "meditation"],
      "technology": ["computer", "digital", "innovation", "tech", "modern"],
      "marketing": ["business", "digital", "social media", "professional", "advertising"],
      "finance": ["money", "business", "investment", "professional", "economics"],
      "education": ["learning", "books", "study", "education", "knowledge"]
    };

    // خريطة أنواع المحتوى إلى كلمات مفتاحية
    const contentTypeFallbacks: { [key: string]: string[] } = {
      "social-post": ["social media", "communication", "sharing"],
      "article": ["writing", "document", "text", "information"],
      "infographic": ["charts", "data", "information", "graphics"],
      "quote": ["inspiration", "text", "motivation", "wisdom"],
      "tips": ["advice", "guidance", "help", "information"],
      "story": ["narrative", "storytelling", "communication"],
      "review": ["evaluation", "analysis", "opinion"],
      "tutorial": ["learning", "education", "instruction", "guide"]
    };

    // إذا كان المحتوى عن الحجامة، استخدم كلمات بديلة متعلقة
    if (originalQuery.includes('cupping') || originalQuery.includes('حجامة')) {
      return "cupping therapy traditional medicine healing wellness";
    }

    // بناء الاستعلام البديل
    const specialtyKeywords = specialtyFallbacks[specialty] || ["professional", "modern"];
    const contentKeywords = contentTypeFallbacks[contentType] || ["information"];
    
    // دمج الكلمات المفتاحية
    const fallbackKeywords = [...specialtyKeywords.slice(0, 2), ...contentKeywords.slice(0, 1)];
    
    return fallbackKeywords.join(' ');
  };

  const generateContent = async () => {
    if (!specialty || !contentType || !imageStyle) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    console.log("generateContent - البداية");
    setIsGenerating(true);

    try {
      // المرحلة 1: توليد المحتوى
      console.log("generateContent - بداية توليد النص");
      toast.info("🔄 جاري توليد المحتوى...", { duration: 3000 });
      
      const { longText, shortText } = await generateTexts();
      console.log("generateContent - تم توليد النص بنجاح");
      
      // Extract keywords from generated text for better image matching
      console.log("generateContent - بداية توليد الصورة");
      const contentKeywords = extractKeywordsFromText(longText, specialty);
      const enhancedImageStyle = `${imageStyle} ${contentKeywords}`;
      
      const imageData = imageSource === "pixabay" 
        ? await getPixabayImage(enhancedImageStyle) 
        : await getUnsplashImage(enhancedImageStyle);
      console.log("generateContent - تم توليد الصورة بنجاح", imageData);
      
      const newContent = {
        longText: longText,
        shortText: shortText,
        imageUrl: imageData.url,
        imageAlt: imageData.alt,
        originalImageUrl: imageData.url, // Store original image URL
        uploadedImageUrl: null, // Will be set after auto-upload if enabled
        isVideo: imageData.isVideo || false,
        videoPageUrl: imageData.videoPageUrl,
        videoThumbnail: imageData.videoThumbnail,
        videoTags: imageData.videoTags,
        videoDuration: imageData.videoDuration,
        videoViews: imageData.videoViews
      };

      setGeneratedContent(newContent);
      setOriginalContent(newContent); // Store original for reset

      const historyData = localStorage.getItem("generated-content-history");
      const history = JSON.parse(historyData && historyData !== "undefined" ? historyData : "[]");
      const currentImageStyles = getImageStylesBySpecialty(specialty);
      history.push({
        ...newContent,
        specialty: specialties.find(s => s.value === specialty)?.label || specialty,
        contentType: getContentTypesBySpecialty(specialty).find(c => c.value === contentType)?.label || contentType,
        imageStyle: currentImageStyles.find(s => s.value === imageStyle)?.label || imageStyle,
        imageSource,
        language,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("generated-content-history", JSON.stringify(history));

      toast.success("✅ تم توليد المحتوى بنجاح!");
      
      // تشغيل النشر التلقائي على فيسبوك
      setTimeout(() => {
        triggerAutoFacebookPost();
      }, 2000);
      
    } catch (error) {
      console.error("خطأ في توليد المحتوى - التفاصيل الكاملة:", error);
      toast.error("فشل في تحميل المنشورات: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
      
      // فاصل زمني للتأكد من انتهاء توليد المحتوى
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // المرحلة 2: تطبيق التحليل الذكي للنص والإطار
      if (generatedContent) {
        toast.info("🧠 جاري تطبيق التحليل الذكي للنص والإطار...", { duration: 4000 });
        
        try {
          // انتظار لضمان تحديث الواجهة
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // تشغيل التحليل الذكي إذا كان متاحاً
          if (smartAnalysisRef.current) {
            await smartAnalysisRef.current();
          }
          
          // انتظار إضافي للتأكد من انتهاء التحليل الذكي
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // المرحلة 3: رفع الصورة تلقائياً (بعد انتهاء التحليل)
          if (autoUploadEnabled) {
            toast.info("📤 جاري رفع الصورة تلقائياً...", { duration: 3000 });
            
            // انتظار إضافي للتأكد من تطبيق جميع الإعدادات
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const uploadedUrl = await uploadGeneratedImageToHosting();
            setUploadedImageUrl(uploadedUrl);
            setUploadedImagePreview(uploadedUrl); // Set preview for thumbnail
            
            // Update the generated content with uploaded URL
            setGeneratedContent(prev => prev ? { ...prev, uploadedImageUrl: uploadedUrl } : null);
            
            // إرسال إشارة فورية لتحديث DirectPublisher بالرابط الجديد
            window.dispatchEvent(new CustomEvent('facebookImageUploaded', {
              detail: { uploadedUrl, shouldSwitchToUploaded: true }
            }));
            
            toast.success("✅ تم رفع الصورة بنجاح! رابط مباشر جديد جاهز", {
              description: "🔄 تم إرسال الرابط تلقائياً لتبويبة فيسبوك - مُوصى به"
            });
          }
          
        } catch (error) {
          console.error('Smart analysis or auto-upload failed:', error);
          toast.error("فشل في التحليل الذكي أو الرفع التلقائي: " + (error as Error).message);
        }
      }
    }
  };

  // وظيفة تشغيل النشر التلقائي على فيسبوك
  const triggerAutoFacebookPost = () => {
    try {
      // التحقق من وجود المحتوى المطلوب
      if (!generatedContent.shortText && !generatedContent.longText) {
        console.log("لا يوجد محتوى نصي للنشر");
        return;
      }

      // التحقق من حالة الاتصال بفيسبوك
      const fbToken = localStorage.getItem("facebook_user_token");
      const fbPages = localStorage.getItem("facebook_pages");
      const selectedPageId = localStorage.getItem("facebook_selected_page");
      
      if (!fbToken || !fbPages || !selectedPageId) {
        console.log("فيسبوك غير متصل، لا يمكن النشر التلقائي");
        return;
      }

      // إنشاء حدث مخصص لتشغيل النشر التلقائي
      const autoPostEvent = new CustomEvent('autoFacebookPost', {
        detail: {
          content: generatedContent,
          autoPost: true
        }
      });
      
      window.dispatchEvent(autoPostEvent);
      console.log("تم تشغيل النشر التلقائي على فيسبوك");
      
    } catch (error) {
      console.error("خطأ في تشغيل النشر التلقائي:", error);
    }
  };

  const generateTexts = async () => {
    const prompt = contentType === "custom" 
      ? customPrompt 
      : buildPrompt();

    try {
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${prompt}

يرجى إنشاء نصين منفصلين:

1. النص الطويل: محتوى تفصيلي مفيد وجذاب للنشر مع الصورة على وسائل التواصل الاجتماعي. استخدم تنسيق Markdown مع العناوين (# ## ###) والاقتباسات (>) والقوائم (- أو *) والنصوص المميزة (**نص مميز**) لجعل المحتوى أكثر جاذبية.

2. النص القصير: ملخص مركز ومباشر للصورة فقط (أقل من 50 كلمة) يكون واضحاً وجذاباً للعين على الصورة.

تنسيق الإجابة:
[النص الطويل]
محتوى تفصيلي هنا...

[النص القصير]
ملخص قصير هنا...` }]
            }]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error("الخدمة محملة بشكل زائد. يرجى المحاولة مرة أخرى بعد قليل.");
        }
        throw new Error(`خطأ في الخدمة: ${errorData.error?.message || 'خطأ غير معروف'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("استجابة غير صالحة من الخدمة");
      }

      const fullResponse = data.candidates[0].content.parts[0].text;
      
      // Parse the response to extract both texts
      const longTextMatch = fullResponse.match(/\[النص الطويل\]([\s\S]*?)\[النص القصير\]/);
      const shortTextMatch = fullResponse.match(/\[النص القصير\]([\s\S]*?)$/);
      
      const longText = longTextMatch ? longTextMatch[1].trim() : fullResponse;
      const shortText = shortTextMatch ? shortTextMatch[1].trim() : fullResponse.substring(0, 200);
      
      return { longText, shortText };
    } catch (error) {
      console.error('Error in generateTexts:', error);
      throw error;
    }
  };

  // إضافة وظيفة البحث عبر Serper API
  const searchImageWithSerper = async (query: string): Promise<MediaData | null> => {
    try {
      console.log("searchImageWithSerper - البحث عن:", query);
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': '02fe518aebb4a34ae0f208075fca9bab881ba360',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: query,
          num: 10
        })
      });

      if (!response.ok) {
        console.error("Serper API error:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("Serper search results:", data);
      
      if (data.images && data.images.length > 0) {
        const randomImage = data.images[Math.floor(Math.random() * data.images.length)];
        return {
          url: randomImage.imageUrl,
          alt: randomImage.title || query,
          isVideo: false
        };
      }
      
      return null;
    } catch (error) {
      console.error("Serper search error:", error);
      return null;
    }
  };

  const handleUseTemplateFromAnalyzer = (content: string, imageUrl: string) => {
    const newContent = {
      longText: content,
      shortText: content, // النص الكامل بدلاً من الاقتطاع
      imageUrl: imageUrl,
      imageAlt: "صورة من المحلل الذكي",
      originalImageUrl: imageUrl,
      uploadedImageUrl: null,
      analyzerImageUrl: imageUrl // إضافة رابط الصورة من المحلل
    };
    setGeneratedContent(newContent);
    setOriginalContent(newContent);
    toast.success("تم تطبيق المحتوى من المحلل بنجاح!");
  };

  const getPixabayImage = async (enhancedImageStyle?: string): Promise<MediaData> => {
    console.log("getPixabayImage - البداية", { enhancedImageStyle, imageStyle, pixabayContentType });
    
    try {
      // استخدام خدمة Pixabay الجديدة
      const { PixabayService } = await import('@/utils/pixabayService');
      const pixabayService = new PixabayService();
      
      const originalQuery = enhancedImageStyle || imageStyle;
      const searchQuery = translateToEnglish(originalQuery);
      console.log("getPixabayImage - ترجمة البحث:", { originalQuery, searchQuery });
      
      // البحث عن صورة من Pixabay
      const imageUrl = await pixabayService.searchImage(searchQuery);
      
      if (imageUrl) {
        return {
          url: imageUrl,
          alt: searchQuery,
          isVideo: false
        };
      }
      
      // إذا فشل البحث، استخدام الطريقة القديمة كحل احتياطي
      console.log("getPixabayImage - فشل الخدمة الجديدة، استخدام الطريقة القديمة");
      return await getPixabayImageLegacy(enhancedImageStyle);
      
    } catch (error) {
      console.error("getPixabayImage - خطأ في الخدمة الجديدة:", error);
      return await getPixabayImageLegacy(enhancedImageStyle);
    }
  };

  const getPixabayImageLegacy = async (enhancedImageStyle?: string): Promise<MediaData> => {
    const originalQuery = enhancedImageStyle || imageStyle;
    const searchQuery = translateToEnglish(originalQuery);
    const orientation = imageDimension === "square" ? "all" : imageDimension === "vertical" ? "vertical" : "horizontal";
    const category = pixabayContentType === "photo" ? "" : `&category=${pixabayContentType}`;
    
    // الحصول على المفتاح من Supabase أو localStorage
    let apiKey = localStorage.getItem('pixabay_api_key');
    
    if (!apiKey) {
      try {
        const response = await fetch('/supabase/functions/v1/get-pixabay-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.hasKey) {
          apiKey = data.apiKey;
        }
      } catch (error) {
        console.error('خطأ في الحصول على مفتاح Pixabay:', error);
      }
    }
    
    if (!apiKey) {
      throw new Error('لا يوجد مفتاح Pixabay API');
    }
    
    if (pixabayContentType === "video") {
      console.log("getPixabayImage - طلب فيديو من Pixabay");
      const response = await fetch(
        `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&per_page=20`,
        { method: "GET" }
      );
      console.log("getPixabayImage - استجابة Pixabay فيديو", response.status);

      const data = await response.json();
      console.log("getPixabayImage - بيانات Pixabay فيديو", data);
      
      if (data.hits && data.hits.length > 0) {
        const randomVideo = data.hits[Math.floor(Math.random() * data.hits.length)];
        return {
          url: randomVideo.videos.medium.url || randomVideo.videos.small.url,
          alt: randomVideo.tags || searchQuery,
          isVideo: true,
          videoPageUrl: randomVideo.pageURL,
          videoThumbnail: randomVideo.videos.medium.thumbnail || randomVideo.videos.small.thumbnail,
          videoTags: randomVideo.tags,
          videoDuration: randomVideo.duration,
          videoViews: randomVideo.views
        };
      } else {
        // البحث باستخدام Serper كبديل
        const serperResult = await searchImageWithSerper(searchQuery);
        if (serperResult) {
          return serperResult;
        }
        return await getUnsplashImage(enhancedImageStyle);
      }
    } else {
      console.log("getPixabayImage - طلب صورة من Pixabay");
      const response = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&image_type=${pixabayContentType}&orientation=${orientation}&min_width=1080&per_page=20${category}`,
        { method: "GET" }
      );
      console.log("getPixabayImage - استجابة Pixabay صورة", response.status);

      const data = await response.json();
      console.log("getPixabayImage - بيانات Pixabay صورة", data);
      
      if (data.hits && data.hits.length > 0) {
        const randomImage = data.hits[Math.floor(Math.random() * data.hits.length)];
        return {
          url: randomImage.largeImageURL || randomImage.webformatURL,
          alt: randomImage.tags || searchQuery,
          isVideo: false
        };
      } else {
        console.log("getPixabayImage - لم توجد نتائج، البحث باستعلام أوسع");
        // إذا لم توجد نتائج، ابحث باستعلام أوسع حسب المحتوى
        const fallbackQuery = getFallbackSearchQuery(specialty, contentType, originalQuery);
        console.log("getPixabayImage - الاستعلام البديل:", fallbackQuery);
        
        const fallbackResponse = await fetch(
          `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(fallbackQuery)}&image_type=${pixabayContentType}&orientation=${orientation}&min_width=1080&per_page=20${category}`,
          { method: "GET" }
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.hits && fallbackData.hits.length > 0) {
            const randomImage = fallbackData.hits[Math.floor(Math.random() * fallbackData.hits.length)];
            return {
              url: randomImage.largeImageURL || randomImage.webformatURL,
              alt: randomImage.tags || fallbackQuery,
              isVideo: false
            };
          }
        }
        
        // البحث باستخدام Serper كبديل أخير
        const serperResult = await searchImageWithSerper(fallbackQuery);
        if (serperResult) {
          return serperResult;
        }
        return await getUnsplashImage(enhancedImageStyle);
      }
    }
  };

  const getUnsplashImage = async (enhancedImageStyle?: string): Promise<MediaData> => {
    console.log("getUnsplashImage - البداية", { enhancedImageStyle, imageStyle });
    const originalQuery = enhancedImageStyle || imageStyle;
    const searchQuery = translateToEnglish(originalQuery);
    console.log("getUnsplashImage - ترجمة البحث:", { originalQuery, searchQuery });
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=20&orientation=${imageDimension === "square" ? "squarish" : imageDimension === "vertical" ? "portrait" : "landscape"}`,
      {
        headers: {
          "Authorization": "Client-ID GQpnQ_IPJLtfjkXuevz_tG2csrucFhKkeo0TkK3AZ5Q"
        }
      }
    );
    console.log("getUnsplashImage - استجابة Unsplash", response.status);

    const data = await response.json();
    console.log("getUnsplashImage - بيانات Unsplash", data);
    if (data.results && data.results.length > 0) {
      const randomImage = data.results[Math.floor(Math.random() * data.results.length)];
      return {
        url: randomImage.urls.regular,
        alt: randomImage.alt_description || searchQuery,
        isVideo: false
      };
    }
    
    // البحث باستخدام Serper كبديل
    const serperResult = await searchImageWithSerper(searchQuery);
    if (serperResult) {
      return serperResult;
    }
    
    // Fallback with simpler search
    return await getUnsplashImageFallback();
  };

  const getUnsplashImageFallback = async (): Promise<MediaData> => {
    const originalFallbackQuery = getSpecialtyKeywords(specialty)[0] || "abstract";
    const fallbackQuery = translateToEnglish(originalFallbackQuery);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(fallbackQuery)}&per_page=10&orientation=${imageDimension === "square" ? "squarish" : imageDimension === "vertical" ? "portrait" : "landscape"}`,
      {
        headers: {
          "Authorization": "Client-ID GQpnQ_IPJLtfjkXuevz_tG2csrucFhKkeo0TkK3AZ5Q"
        }
      }
    );

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const randomImage = data.results[Math.floor(Math.random() * data.results.length)];
      return {
        url: randomImage.urls.regular,
        alt: randomImage.alt_description || fallbackQuery,
        isVideo: false
      };
    }
    
    // البحث باستخدام Serper كبديل أخير
    const serperResult = await searchImageWithSerper(fallbackQuery);
    if (serperResult) {
      return serperResult;
    }
    
    // صورة افتراضية إذا فشل كل شيء
    return {
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1080",
      alt: "default image",
      isVideo: false
    };
  };

  const resetImage = async () => {
    if (!specialty || !imageStyle) return;
    
    try {
      const imageData = imageSource === "pixabay" 
        ? await getPixabayImage() 
        : await getUnsplashImage();
      
      if (generatedContent) {
        setGeneratedContent({
          ...generatedContent,
          imageUrl: imageData.url,
          imageAlt: imageData.alt
          // Keep originalImageUrl unchanged for reset functionality
        });
      }
    } catch (error) {
      console.error("Error resetting image:", error);
      toast.error("حدث خطأ في إعادة تعيين الصورة");
    }
  };

  const resetText = () => {
    if (originalContent && generatedContent) {
      setGeneratedContent({
        ...generatedContent,
        longText: originalContent.longText,
        shortText: originalContent.shortText
      });
    }
  };

  const resetTextSettings = () => {
    setTextSettings(undefined);
  };

  const resetColorSettings = () => {
    setColorSettings(undefined);
  };

  const resetLogoSettings = () => {
    setLogoSettings(undefined);
  };

  const resetFrameSettings = () => {
    setFrameSettings(undefined);
  };

  const resetAll = () => {
    if (originalContent) {
      setGeneratedContent(originalContent);
    }
    setTextSettings(undefined);
    setColorSettings(undefined);
    setLogoSettings(undefined);
    setFrameSettings(undefined);
  };

  const copyToClipboard = () => {
    if (generatedContent?.longText) {
      navigator.clipboard.writeText(generatedContent.longText);
      toast.success("تم نسخ النص الطويل بنجاح!");
    }
  };

  const toggleLayerOrder = () => {
    setIsBackgroundOnTop(!isBackgroundOnTop);
    toast.success(isBackgroundOnTop ? "تم نقل الصورة إلى الأعلى" : "تم نقل الخلفية إلى الأعلى");
  };

  const saveAsTemplate = () => {
    if (!generatedContent || !specialty || !contentType) return;
    
    const templateName = prompt("أدخل اسم النموذج:");
    if (!templateName) return;

    const template = {
      name: templateName,
      specialty: specialties.find(s => s.value === specialty)?.label || specialty,
      contentType: getContentTypesBySpecialty(specialty).find(c => c.value === contentType)?.label || contentType,
      longText: generatedContent.longText,
      shortText: generatedContent.shortText,
      imageUrl: generatedContent.imageUrl
    };

    const templatesData = localStorage.getItem("social-content-templates");
    const savedTemplates = JSON.parse(templatesData && templatesData !== "undefined" ? templatesData : "[]");
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    savedTemplates.push(newTemplate);
    localStorage.setItem("social-content-templates", JSON.stringify(savedTemplates));
    toast.success("تم حفظ النموذج بنجاح!");
  };

  const loadTemplate = (template: any) => {
    const foundSpecialty = specialties.find(s => s.label === template.specialty);
    const foundContentType = getContentTypesBySpecialty(specialty).find(c => c.label === template.contentType);
    
    if (foundSpecialty) setSpecialty(foundSpecialty.value);
    if (foundContentType) setContentType(foundContentType.value);
    
    setGeneratedContent({
      longText: template.longText || template.text || "", // Backward compatibility
      shortText: template.shortText || template.text?.substring(0, 200) || "",
      imageUrl: template.imageUrl,
      imageAlt: template.imageAlt || "Template image",
      originalImageUrl: template.originalImageUrl || template.imageUrl
    });
  };

  const regenerateImage = async () => {
    if (!specialty || !imageStyle || !generatedContent) return;
    
    try {
      const contentKeywords = extractKeywordsFromText(generatedContent.longText, specialty);
      const enhancedImageStyle = `${imageStyle} ${contentKeywords}`;
      
      const imageData = imageSource === "pixabay" 
        ? await getPixabayImage(enhancedImageStyle) 
        : await getUnsplashImage(enhancedImageStyle);
      
      setGeneratedContent({
        ...generatedContent,
        imageUrl: imageData.url,
        imageAlt: imageData.alt
        // Keep originalImageUrl unchanged
      });
      
      // Auto-upload if enabled after regenerating
      if (autoUploadEnabled) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const uploadedUrl = await uploadGeneratedImageToHosting();
          setUploadedImageUrl(uploadedUrl);
          setUploadedImagePreview(uploadedUrl);
          toast.success("تم إعادة توليد الصورة ورفعها تلقائياً!");
        } catch (error) {
          console.error('Auto-upload after regeneration failed:', error);
          toast.error("تم إعادة توليد الصورة ولكن فشل الرفع التلقائي");
        }
      } else {
        toast.success("تم إعادة توليد الصورة بنجاح!");
      }
    } catch (error) {
      console.error("Error regenerating image:", error);
      toast.error("حدث خطأ في إعادة توليد الصورة");
    }
  };

  // دالة توليد الصور من البرومت
  const generateImageFromPrompt = async (prompt: string) => {
    try {
      toast.info("جاري توليد الصورة باستخدام الذكاء الاصطناعي...");
      
      // توليد الصورة باستخدام الذكاء الاصطناعي
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f`
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ في توليد الصورة: ${response.status}`);
      }

      const data = await response.json();
      const a4fDirectUrl = data.data[0].url;

      // استخدام الرابط المباشر من A4F بدلاً من رفعه إلى ImgBB
      console.log("تم الحصول على رابط A4F المباشر:", a4fDirectUrl);
      
      // تحديث المحتوى المولد بالرابط المباشر من A4F
      setGeneratedContent({
        longText: generatedContent?.longText || "",
        shortText: generatedContent?.shortText || "",
        imageUrl: a4fDirectUrl, // استخدام الرابط المباشر من A4F
        imageAlt: "صورة مولدة بالذكاء الاصطناعي",
        originalImageUrl: a4fDirectUrl,
        uploadedImageUrl: a4fDirectUrl // تعيين نفس الرابط للنشر المباشر
      });
      
      // إرسال إشارة فورية لتحديث DirectPublisher بالرابط المباشر
      window.dispatchEvent(new CustomEvent('facebookImageUploaded', {
        detail: { uploadedUrl: a4fDirectUrl, shouldSwitchToUploaded: true }
      }));
      
      toast.success("تم توليد الصورة بنجاح! سيتم استخدام الرابط المباشر من A4F للنشر.");
    } catch (error) {
      console.error("Error generating image from prompt:", error);
      toast.error("حدث خطأ في توليد الصورة من البرومت");
    }
  };

  // دالة استخراج كلمات مفتاحية قصيرة من البرومت
  const extractKeywordsFromPrompt = (prompt: string): string => {
    // استخراج الكلمات المفتاحية الأساسية من البرومت
    const keywords = [
      "e-commerce", "digital", "business", "modern", "professional", 
      "colorful", "gradient", "abstract", "technology", "creative"
    ];
    
    // اختيار كلمات مفتاحية قصيرة بناءً على المحتوى
    if (prompt.toLowerCase().includes("e-commerce")) {
      return "e-commerce business digital modern";
    }
    if (prompt.toLowerCase().includes("education")) {
      return "education digital learning modern";
    }
    if (prompt.toLowerCase().includes("marketing")) {
      return "marketing digital business creative";
    }
    
    // افتراضي
    return "business professional modern colorful";
  };

  // دالة معالجة البرومت المولد
  const handleGeneratedPrompt = (prompt: string) => {
    console.log("تم توليد البرومت:", prompt);
    // يمكن إضافة منطق إضافي هنا حسب الحاجة
  };

  const regenerateText = async () => {
    if (!specialty || !contentType) return;
    
    try {
      const { longText, shortText } = await generateTexts();
      if (generatedContent) {
        setGeneratedContent({
          ...generatedContent,
          longText: longText,
          shortText: shortText
        });
        
        // Auto-upload if enabled after regenerating text
        if (autoUploadEnabled) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const uploadedUrl = await uploadGeneratedImageToHosting();
            setUploadedImageUrl(uploadedUrl);
            setUploadedImagePreview(uploadedUrl);
            toast.success("تم إعادة توليد النص ورفع الصورة تلقائياً!");
          } catch (error) {
            console.error('Auto-upload after text regeneration failed:', error);
            toast.error("تم إعادة توليد النص ولكن فشل الرفع التلقائي");
          }
        } else {
          toast.success("تم إعادة توليد النص بنجاح!");
        }
      }
    } catch (error) {
      console.error("Error regenerating text:", error);
      toast.error("حدث خطأ في إعادة توليد النص");
    }
  };

  // Manual upload function
  const handleManualUpload = async () => {
    if (!generatedContent) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const uploadedUrl = await uploadGeneratedImageToHosting();
      setUploadedImageUrl(uploadedUrl);
      setUploadedImagePreview(uploadedUrl);
      
      // Update generated content with new uploaded URL
      setGeneratedContent(prev => prev ? { ...prev, uploadedImageUrl: uploadedUrl } : null);
      
      // إرسال إشارة فورية لتحديث DirectPublisher بالرابط الجديد
      window.dispatchEvent(new CustomEvent('facebookImageUploaded', {
        detail: { uploadedUrl, shouldSwitchToUploaded: true }
      }));
      
      toast.success("✅ تم إعادة رفع الصورة بنجاح!", {
        description: "🔗 تم إرسال الرابط المحدث تلقائياً لتبويبة فيسبوك"
      });
    } catch (error) {
      console.error('Manual upload failed:', error);
      toast.error("فشل في رفع الصورة: " + (error as Error).message);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">

        <div className="space-y-8">
          <div className={`grid gap-8 relative transition-all duration-300 ${
            isContentPreviewVisible ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}>
            {/* الجانب الأيسر - التبويبات والإعدادات */}
            <div className="overflow-y-auto max-h-screen">
              <div className="space-y-6 pr-4">
                 <Tabs defaultValue="content" className="w-full">
                   <TabsList className="grid w-full grid-cols-6">
                     <TabsTrigger value="content">المحتوى</TabsTrigger>
                     <TabsTrigger value="analyzer" className="text-red-600 hover:text-red-700 data-[state=active]:text-white data-[state=active]:bg-red-600">المحلل</TabsTrigger>
                     <TabsTrigger value="logo">الشعار الرئيسي</TabsTrigger>
                     <TabsTrigger value="video">فيديو</TabsTrigger>
                     <TabsTrigger value="admin">الإدارة</TabsTrigger>
                     <TabsTrigger value="facebook">فيسبوك</TabsTrigger>
                   </TabsList>
                
                <TabsContent value="content">
                  <Card className="shadow-elegant">
                     <CardHeader>
                       <CardTitle className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-primary">
                           <Sparkles className="h-5 w-5" />
                           إعدادات المحتوى
                         </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // إعدادات عشوائية للمحتوى
                              const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
                              const randomContentTypes = getContentTypesBySpecialty(randomSpecialty.value);
                              const randomContentType = randomContentTypes[Math.floor(Math.random() * randomContentTypes.length)];
                              const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
                              const randomImageStyles = getImageStylesBySpecialty(randomSpecialty.value, randomContentType.value);
                              const randomImageStyle = randomImageStyles[Math.floor(Math.random() * randomImageStyles.length)];
                              
                              handleSpecialtyChange(randomSpecialty.value);
                              setContentType(randomContentType.value);
                              setLanguage(randomLanguage.value);
                              setImageStyle(randomImageStyle.value);
                              
                              toast.success('تم تطبيق إعدادات عشوائية!');
                              
                              // التوليد التلقائي بعد تطبيق الإعدادات العشوائية
                              setTimeout(() => {
                                generateContent();
                              }, 500);
                            }}
                            title="إعدادات عشوائية للمحتوى مع التوليد التلقائي"
                          >
                            <Shuffle className="h-4 w-4" />
                          </Button>
                       </CardTitle>
                     </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>التخصص أو المجال</Label>
                          <Select value={specialty} onValueChange={handleSpecialtyChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التخصص" />
                            </SelectTrigger>
                            <SelectContent>
                              {specialties.map((spec) => (
                                <SelectItem key={spec.value} value={spec.value}>
                                  {spec.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>نوع المحتوى</Label>
                          <Select value={contentType} onValueChange={setContentType}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع المحتوى" />
                            </SelectTrigger>
                            <SelectContent>
                              {getContentTypesBySpecialty(specialty).map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>اللغة</Label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>نمط الصورة</Label>
                          <Select value={imageStyle} onValueChange={setImageStyle}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نمط الصورة" />
                            </SelectTrigger>
                            <SelectContent>
                              {getImageStylesBySpecialty(specialty, contentType).map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            مصدر الصور
                          </Label>
                          <Select value={imageSource} onValueChange={setImageSource}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {imageSources.map((source) => (
                                <SelectItem key={source.value} value={source.value}>
                                  {source.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {imageSource === "upload" && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              رفع صورة من الجهاز
                            </Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setUploadedImageUrl(url);
                                  toast.success("تم رفع الصورة بنجاح");
                                }
                              }}
                              className="cursor-pointer"
                            />
                            {uploadedImageUrl && (
                              <div className="mt-2">
                                <img 
                                  src={uploadedImageUrl} 
                                  alt="معاينة الصورة المرفوعة" 
                                  className="w-full h-32 object-cover rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {imageSource === "pixabay" && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Layers className="h-4 w-4" />
                              نوع المحتوى المرئي
                            </Label>
                            <Select value={pixabayContentType} onValueChange={setPixabayContentType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {pixabayContentTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>نوع النموذج</Label>
                          <Select value={layoutType} onValueChange={(value: 'rectangle' | 'triangle' | 'trapezoid') => setLayoutType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rectangle">الإطار النصي المستطيل</SelectItem>
                              <SelectItem value="triangle">نموذج المثلث</SelectItem>
                              <SelectItem value="trapezoid">نموذج الشبه منحرف</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>أبعاد الصورة</Label>
                          <Select value={imageDimension} onValueChange={setImageDimension}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {imageDimensions.map((dim) => (
                                <SelectItem key={dim.value} value={dim.value}>
                                  {dim.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {(layoutType === 'triangle' || layoutType === 'trapezoid') && (
                        <div className="space-y-2">
                          <Label>اتجاه الشكل</Label>
                          <Select value={triangleDirection} onValueChange={(value: 'up' | 'down' | 'left' | 'right') => setTriangleDirection(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="up">للأعلى ↑</SelectItem>
                              <SelectItem value="down">للأسفل ↓</SelectItem>
                              <SelectItem value="left">لليسار ←</SelectItem>
                              <SelectItem value="right">لليمين →</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {contentType === "custom" && (
                        <div className="space-y-2">
                          <Label>النص المخصص</Label>
                          <Textarea
                            placeholder="اكتب طلبك هنا..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <Button 
                          onClick={generateContent}
                          disabled={isGenerating}
                          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                          size="lg"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              جاري التوليد...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              توليد المحتوى
                            </>
                          )}
                        </Button>

                        {/* زر توليد برومت التصميم المفصل */}
                        <DesignPromptGenerator 
                          specialty={specialty}
                          contentType={contentType}
                          imageStyle={imageStyle}
                          language={language}
                          onImageGenerated={(imageUrl, imageAlt) => {
                            // تحديث المحتوى المولد بالصورة الجديدة
                            setGeneratedContent(prev => prev ? {
                              ...prev,
                              imageUrl: imageUrl,
                              imageAlt: imageAlt,
                              originalImageUrl: imageUrl
                            } : {
                              longText: "",
                              shortText: "",
                              imageUrl: imageUrl,
                              imageAlt: imageAlt,
                              originalImageUrl: imageUrl
                            });
                            
                            // إشعار المستخدم
                            toast.success("تم تحديث معاينة المحتوى بالصورة المولدة!");
                          }}
                        />

                        {/* IMGBB Link Section */}
                        {imgbbImageUrl && (
                          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                            <div className="text-xs text-muted-foreground text-center">رابط IMGBB</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs break-all text-muted-foreground bg-background p-2 rounded">
                                {imgbbImageUrl}
                              </code>
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(imgbbImageUrl);
                                  toast.success("تم نسخ رابط IMGBB!");
                                }}
                                size="sm"
                                variant="outline"
                                className="shrink-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => window.open(imgbbImageUrl, '_blank')}
                                size="sm"
                                variant="outline"
                                className="shrink-0"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Preview Button */}
                        {generatedContent && (
                          <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                className="w-full"
                                size="lg"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                معاينة الصورة
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                              <DialogHeader>
                                <DialogTitle className="text-right">معاينة الصورة المولدة</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col items-center gap-4 p-4">
                                {generatedContent.imageUrl && (
                                  <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg border">
                                    <img 
                                      src={generatedContent.imageUrl} 
                                      alt={generatedContent.imageAlt}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                 <div className="flex flex-col gap-4 w-full">
                                  {/* ImgBB Upload Section */}
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium mb-3 text-center">رفع إلى ImgBB</h4>
                                    <div className="flex gap-2 justify-center">
                                      <Button 
                                        onClick={() => {
                                          if (generatedContent?.imageUrl) {
                                            uploadToImgbb(generatedContent.imageUrl);
                                          }
                                        }}
                                        disabled={isUploadingToImgbb}
                                        variant="outline"
                                        size="sm"
                                      >
                                        {isUploadingToImgbb ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            جاري الرفع...
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            رفع
                                          </>
                                        )}
                                      </Button>
                                      {imgbbImageUrl && (
                                        <>
                                          <Button 
                                            onClick={copyImgbbLinkToClipboard}
                                            variant="outline"
                                            size="sm"
                                          >
                                            <Copy className="mr-2 h-4 w-4" />
                                            نسخ الرابط
                                          </Button>
                                          <Button 
                                            onClick={() => window.open(imgbbImageUrl, '_blank')}
                                            variant="outline"
                                            size="sm"
                                          >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            فتح
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                    {imgbbImageUrl && (
                                      <div className="mt-2 p-2 bg-background rounded text-xs break-all">
                                        {imgbbImageUrl}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Regular Action Buttons */}
                                  <div className="flex gap-3 w-full justify-center">
                                    <Button 
                                      onClick={() => setShowImagePreview(false)}
                                      variant="outline"
                                      size="lg"
                                    >
                                      إغلاق
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        if (generatedContent?.imageUrl) {
                                          const link = document.createElement('a');
                                          link.href = generatedContent.imageUrl;
                                          link.download = `generated-content-${Date.now()}.jpg`;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }
                                      }}
                                      variant="outline"
                                      size="lg"
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      تحميل الصورة
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        handleManualUpload();
                                        setShowImagePreview(false);
                                      }}
                                      disabled={isUploading}
                                      size="lg"
                                    >
                                      {isUploading ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          جاري الرفع...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="mr-2 h-4 w-4" />
                                          رفع الصورة الآن
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Manual Upload Button */}
                        {generatedContent && (
                          <Button 
                            onClick={handleManualUpload}
                            disabled={isUploading}
                            variant="default"
                            className="w-full"
                            size="lg"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الرفع...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                رفع الصورة مباشرة
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Auto Upload Section */}
                      <Card className="mt-6 border-2 border-dashed border-primary/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4 text-primary" />
                                <Label className="font-medium text-primary">رفع الصورة تلقائياً</Label>
                              </div>
                               <p className="text-sm text-muted-foreground">
                                 عند التفعيل، سيتم رفع الصورة المولدة تلقائياً والحصول على رابط مباشر جديد - مُوصى به
                               </p>
                            </div>
                            <Switch
                              checked={autoUploadEnabled}
                              onCheckedChange={setAutoUploadEnabled}
                            />
                          </div>

                          {/* Background Removal Option Removed */}
                          
                          {uploadedImageUrl && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-green-700 mb-3">
                                <Upload className="h-4 w-4" />
                                <span className="font-medium">تم الرفع بنجاح</span>
                              </div>
                              
                              {/* Image Preview Thumbnail */}
                              {uploadedImagePreview && (
                                <div className="mb-3">
                                  <Label className="text-sm text-green-600 mb-2 block">معاينة الصورة المعدلة:</Label>
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={uploadedImagePreview} 
                                      alt="Preview of edited content" 
                                      className="w-16 h-16 object-cover rounded-lg border border-green-200 shadow-sm"
                                      onLoad={() => console.log('Preview image loaded:', uploadedImagePreview)}
                                      onError={() => console.error('Preview image failed to load:', uploadedImagePreview)}
                                    />
                                    <div className="text-xs text-green-600">
                                      <p>✅ تم إنشاء الصورة النهائية مع النص والشعار</p>
                                      <p>📏 أبعاد: {imageDimensions.find(d => d.value === imageDimension)?.label}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <Label className="text-sm text-green-600">رابط الصورة المرفوعة:</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={uploadedImageUrl}
                                    readOnly
                                    className="text-xs bg-white"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(uploadedImageUrl);
                                      toast.success("تم نسخ الرابط!");
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={handleManualUpload}
                                     disabled={isUploading}
                                     title="إعادة رفع الصورة مع تحديث الرابط - مُوصى به"
                                   >
                                     {isUploading ? (
                                       <Loader2 className="h-3 w-3 animate-spin" />
                                     ) : (
                                       <RefreshCw className="h-3 w-3" />
                                     )}
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="default"
                                     onClick={async () => {
                                       try {
                                         toast.info("🔄 جاري تحميل الصورة المعدلة...");
                                         
                                         // إنشاء الصورة المعدلة مباشرة من المحتوى
                                         const { blob } = await createFinalImageFromCanvas();
                                         
                                         // تحميل الصورة إلى جهاز المستخدم
                                         const url = window.URL.createObjectURL(blob);
                                         const link = document.createElement('a');
                                         link.href = url;
                                         link.download = `content-with-text-${Date.now()}.png`;
                                         document.body.appendChild(link);
                                         link.click();
                                         document.body.removeChild(link);
                                         window.URL.revokeObjectURL(url);
                                         
                                         toast.success("✅ تم تحميل الصورة المعدلة بنجاح!");
                                       } catch (error) {
                                         console.error('Download error:', error);
                                         toast.error("خطأ في تحميل الصورة - يرجى المحاولة مرة أخرى");
                                       }
                                      }}
                                     title="تحميل الصورة مباشرة"
                                   >
                                     <Download className="h-3 w-3" />
                                   </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {isUploading && (
                            <div className="mt-4 flex items-center gap-2 text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">
                                جاري رفع الصورة...
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Video Preview Section */}
                      {generatedContent?.isVideo && (
                        <VideoPreviewSection
                          videoUrl={generatedContent.imageUrl}
                          videoThumbnail={generatedContent.videoThumbnail || ''}
                          videoPageUrl={generatedContent.videoPageUrl || ''}
                          videoTags={generatedContent.videoTags}
                          videoDuration={generatedContent.videoDuration}
                          videoViews={generatedContent.videoViews}
                          shortText={generatedContent.shortText}
                          isVisible={true}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                 
                 <TabsContent value="analyzer">
                   <InfographicAnalyzer onUseTemplate={handleUseTemplateFromAnalyzer} />
                 </TabsContent>
                  
                   <TabsContent value="logo">
                     <LogoCustomizer 
                       onUpdate={(settings: LogoSettings) => setLogoSettings(settings)} 
                       currentImageUrl={generatedContent?.imageUrl || generatedContent?.uploadedImageUrl}
                       geminiApiKey={geminiApiKey}
                       specialty={specialty}
                       contentType={contentType}
                       imageStyle={imageStyle}
                       language={language}
                     />
                   </TabsContent>

                 <TabsContent value="video">
                   <div className="space-y-4">
                     <VideoUploader 
                       onVideoUploaded={(videoUrl) => {
                         toast.success("تم رفع الفيديو بنجاح!");
                         console.log("Video uploaded:", videoUrl);
                       }}
                     />
                   </div>
                 </TabsContent>

                 <TabsContent value="admin">
                   <AdminTabsManager
                     colorSettings={colorSettings}
                     frameSettings={frameSettings}
                     textSettings={textSettings}
                     shapeMarginSettings={shapeMarginSettings}
                     textDistributionSettings={textDistributionSettings}
              shapeInversionSettings={shapeInversionSettings}
              advancedShapeSettings={advancedShapeSettings}
              spaceLayoutSettings={spaceLayoutSettings}
              backgroundEffectsSettings={backgroundEffectsSettings}
                     enhancedTextSettings={enhancedTextSettings}
                     textPositionSettings={textPositionSettings}
                     advancedBlendingSettings={advancedBlendingSettings}
                     imageControlSettings={imageControlSettings}
                     advancedTransparencySettings={advancedTransparencySettings}
                     currentLayerEffect={currentLayerEffect}
                     setColorSettings={setColorSettings}
                     setFrameSettings={setFrameSettings}
                     setTextSettings={setTextSettings}
                     setShapeMarginSettings={setShapeMarginSettings}
                     setTextDistributionSettings={setTextDistributionSettings}
              setShapeInversionSettings={setShapeInversionSettings}
              setAdvancedShapeSettings={setAdvancedShapeSettings}
              setSpaceLayoutSettings={setSpaceLayoutSettings}
              setBackgroundEffectsSettings={setBackgroundEffectsSettings}
                     setEnhancedTextSettings={setEnhancedTextSettings}
                     setTextPositionSettings={setTextPositionSettings}
                     setAdvancedBlendingSettings={setAdvancedBlendingSettings}
                     setImageControlSettings={setImageControlSettings}
                     setAdvancedTransparencySettings={setAdvancedTransparencySettings}
                     setCurrentLayerEffect={updateLayerEffect}
                     currentImageUrl={uploadedImagePreview || generatedContent?.imageUrl}
                     layoutType={layoutType}
                     triangleDirection={triangleDirection}
                     onLayoutChange={setLayoutType}
                     onDirectionChange={setTriangleDirection}
                     smartAnalysisRef={smartAnalysisRef}
                     language={language}
                     geminiApiKey={geminiApiKey}
                     specialty={specialty}
                     contentType={contentType}
                       imageStyle={imageStyle}
                        logoSettings={logoSettings}
                        setLogoSettings={setLogoSettings}
                        overlaySettings={colorSettings}
                        onGeneratePrompt={handleGeneratedPrompt}
                        onGenerateImage={generateImageFromPrompt}
                    />
                </TabsContent>

                 <TabsContent value="facebook">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-primary">إدارة فيسبوك</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFacebookPreviewVisible(!facebookPreviewVisible)}
                          >
                            {facebookPreviewVisible ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                إخفاء معاينة المحتوى
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                إظهار معاينة المحتوى
                              </>
                            )}
                          </Button>
                          
                        </div>
                      </div>
                     
                      <FacebookManager 
                        generatedContent={generatedContent} 
                        isCompactView={!facebookPreviewVisible}
                        isPreviewVisible={facebookPreviewVisible}
                      />
                   </div>
                 </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* الجانب الأيمن - معاينة المحتوى (ثابت) */}
            {isContentPreviewVisible && (
              <div className="lg:sticky lg:top-4 lg:h-screen lg:overflow-y-auto relative">
                {/* إطار أزرق ديناميكي */}
                <div className="absolute inset-0 rounded-lg animate-dynamic-blue-frame p-1 z-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 via-cyan-400/40 to-blue-500/30 animate-blue-glow rounded-lg"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-blue-600/20 via-blue-400/30 to-cyan-300/20 animate-pulse rounded-lg"></div>
                </div>
                <Card className="shadow-elegant h-fit relative z-10 border-4 border-blue-500 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-primary">معاينة المحتوى</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsContentPreviewVisible(false)}
                        title="إخفاء معاينة المحتوى"
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                </CardTitle>
               </CardHeader>
               <CardContent className="p-4">
                  {/* إعدادات المعاينة */}
                  {generatedContent && (
                    <div className="mb-4">
                      <PreviewControls
                        onCopyText={copyToClipboard}
                        onSaveTemplate={saveAsTemplate}
                        onRegenerateImage={regenerateImage}
                        onRegenerateText={regenerateText}
                        onToggleText={() => setIsTextVisible(!isTextVisible)}
                        onToggleLayerOrder={toggleLayerOrder}
                        isTextVisible={isTextVisible}
                        isBackgroundOnTop={isBackgroundOnTop}
                        canvasRef={canvasRef}
                      />
                    </div>
                  )}
                  
                  {generatedContent ? (
                    <div className="w-full space-y-4">
                      {/* تبويبات وضع العرض */}
                      <div className="flex justify-center">
                        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full max-w-md">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="static" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              معاينة عادية
                            </TabsTrigger>
                            <TabsTrigger value="interactive" className="flex items-center gap-2">
                              <Move className="h-4 w-4" />
                              محرر تفاعلي
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {viewMode === 'interactive' ? (
                        /* المحرر التفاعلي */
                        <div className="w-full flex justify-center">
                          <InteractiveCanvas
                            text={generatedContent.shortText}
                            imageUrl={imageSource === "upload" && uploadedImageUrl ? uploadedImageUrl : generatedContent.imageUrl}
                            logoUrl={logoSettings?.logoUrl}
                            watermarkUrl={logoSettings?.logoUrl}
                            width={700}
                            height={500}
                            className="w-full max-w-4xl"
                          />
                        </div>
                      ) : (
                        /* المعاينة العادية */
                        <div ref={canvasRef} className="w-full flex justify-center" style={{ overflow: 'visible' }}>
                          {layoutType === 'rectangle' ? (
                         <ContentCanvas
                           text={generatedContent?.shortText || "انقر 'إنشاء المحتوى' لبدء التوليد"}
                           imageUrl={imageSource === "upload" && uploadedImageUrl ? uploadedImageUrl : (generatedContent?.imageUrl || "")}
                          width={imageDimensions.find(d => d.value === imageDimension)!.width}
                         height={imageDimensions.find(d => d.value === imageDimension)!.height}
                         textSettings={textSettings}
                         colorSettings={colorSettings}
                         logoSettings={logoSettings}
                         frameSettings={frameSettings}
                         layoutType={layoutType}
                         triangleDirection={triangleDirection}
                         shapeMarginSettings={shapeMarginSettings}
                         textDistributionSettings={textDistributionSettings}
                         shapeInversionSettings={shapeInversionSettings}
                         advancedShapeSettings={advancedShapeSettings}
                         backgroundEffectsSettings={backgroundEffectsSettings}
                         enhancedTextSettings={enhancedTextSettings}
                         textPositionSettings={textPositionSettings}
                         advancedBlendingSettings={advancedBlendingSettings}
                         onRegenerateImage={regenerateImage}
                         onRegenerateText={regenerateText}
                          onSmartAnalysis={smartAnalysisRef.current}
                          language={language}
                          isVideo={generatedContent?.isVideo || false}
                          videoPageUrl={generatedContent?.videoPageUrl}
                          videoThumbnail={generatedContent?.videoThumbnail}
                          imageControlSettings={imageControlSettings}
                          isTextVisible={isTextVisible}
                          isBackgroundOnTop={isBackgroundOnTop}
                        />
                    ) : (
                       <ShapeController
                         text={isTextVisible ? generatedContent.shortText : ""}
                         imageUrl={generatedContent.imageUrl}
                         dimensions={imageDimensions.find(d => d.value === imageDimension)!}
                         textSettings={textSettings}
                         colorSettings={colorSettings}
                         logoSettings={logoSettings}
                         frameSettings={frameSettings}
                         layoutType={layoutType}
                         triangleDirection={triangleDirection}
                         shapeMarginSettings={shapeMarginSettings}
                         textDistributionSettings={textDistributionSettings}
                         shapeInversionSettings={shapeInversionSettings}
                         advancedShapeSettings={advancedShapeSettings}
                         backgroundEffectsSettings={backgroundEffectsSettings}
                         enhancedTextSettings={enhancedTextSettings}
                         advancedBlendingSettings={advancedBlendingSettings}
                         onRegenerateImage={regenerateImage}
                         onRegenerateText={regenerateText}
                         onSmartAnalysis={smartAnalysisRef.current}
                         language={language}
                         imageControlSettings={imageControlSettings}
                        />
                         )}
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed">
                     <div className="text-center p-4">
                       <div className="text-lg font-semibold mb-2">منطقة المعاينة</div>
                       <div className="text-sm">اختر التخصص ونوع المحتوى ثم انقر "إنشاء المحتوى" لرؤية النتيجة</div>
                     </div>
                   </div>
                )}

                {/* عرض النصوص المولدة */}
                {generatedContent && (
                  <div className="mt-6 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">النص القصير (للصورة)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm bg-green-50 p-3 rounded border border-green-200">
                          {generatedContent.shortText}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          عدد الكلمات: {generatedContent.shortText.split(' ').length}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">النص الطويل (للنشر مع الصورة)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200 max-h-40 overflow-y-auto">
                          <div className="whitespace-pre-wrap">{generatedContent.longText}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          عدد الكلمات: {generatedContent.longText.split(' ').length}
                        </p>
                      </CardContent>
                    </Card>

                  </div>
                )}
               </CardContent>
            </Card>
            </div>
            )}
            
            {/* زر إظهار معاينة المحتوى عند الإخفاء */}
            {!isContentPreviewVisible && (
              <div className="fixed top-4 right-4 z-50">
                <Button 
                  onClick={() => setIsContentPreviewVisible(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                  title="إظهار معاينة المحتوى"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  إظهار المعاينة
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
