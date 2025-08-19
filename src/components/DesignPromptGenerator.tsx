import React, { useState, useEffect } from 'react';
import { geminiApiManager } from "../utils/geminiApiManager";
import { ContextImageTypeGenerator } from './ContextImageTypeGenerator';
import { PromptGeneratorTabDialog } from './PromptGeneratorTabDialog';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Wand2, Copy, Download, RefreshCw, Languages, Image, Square, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SpaceLayoutController, SpaceLayoutSettings } from "./SpaceLayoutController";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface DesignPromptGeneratorProps {
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  language?: string;
  onImageGenerated?: (imageUrl: string, imageAlt: string) => void;
}

interface DesignVariables {
  // خصائص الصورة الأساسية
  imageType: string;
  imageQuality: string;
  
  // الألوان والنمط
  mainColors: string;
  artisticStyle: string;
  
  // الإضاءة والبصريات
  lighting: string;
  depthOfField: string;
  softGlow: string;
  
  // الخلفية والعناصر
  background: string;
  visualElements: string;
  
  // تخطيط المساحة
  layoutType: string;
  separatorStyle: string;
  backgroundDivision: string;
  colorTransition: string;
  textAreaSize: number;
  
  // تركيب المنطقة البصرية
  composition: string;
  clothingStyle: string;
  
  // التأثيرات البصرية
  visualEffects: string;
  
  // قيود التصميم
  designConstraints: string;

  // المتغيرات الجديدة المتقدمة
  atmosphericEffect?: string;
  advancedArtisticStyle?: string;
  advancedLighting?: string;
  overlayTexture?: string;
  
  // إعدادات تخطيط المساحة المتقدمة
  spaceLayoutSettings?: SpaceLayoutSettings;
  
  // إعدادات الشفافية للخلفية البيضاء
  backgroundOpacity?: number;
  elementsOpacity?: number;
}

// خيارات نصية مستخرجة من الكود المرفق
interface TextualOptions {
  leftColor: string;
  icons: string;
  lightingEffect: string;
  divider: string;
  rightColor: string;
  bokeh: string;
  style: string;
}

const DESIGN_OPTIONS = {
  // خيارات نوع الصورة - سيتم توليدها ديناميكياً بناءً على السياق
  imageTypeContext: [], // سيتم ملؤها ديناميكياً
  
  // خيارات نوع الصورة - عامة غير متصلة بالسياق
  imageTypeGeneral: [
    "منظر طبيعي",
    "منظر جوي",
    "صورة خارجية",
    "صورة تجريدية",
    "خلفية هندسية",
    "نمط فني حر",
    "تكوين بصري",
    "مناظر عامة"
  ],
  imageQuality: [
    "عالية الجودة",
    "فائقة الجودة",
    "دقة 4K",
    "دقة HD",
    "جودة احترافية",
    "جودة استوديو"
  ],
  
  // الألوان والنمط (توسيع 10+ خيارات)
  mainColors: [
    "ألوان ترابية وباستيل",
    "ألوان دافئة (أحمر، برتقالي، أصفر)",
    "ألوان باردة (أزرق، أخضر، بنفسجي)",
    "ألوان أحادية (درجات الرمادي)",
    "ألوان طبيعية (أخضر، بني، أزرق سماوي)",
    "ألوان معدنية (ذهبي، فضي، برونزي)",
    "ألوان نيون مشرقة",
    "ألوان كلاسيكية",
    "ألوان متدرجة",
    "ألوان غروب ساحرة (برتقالي، ذهبي، وردي)",
    "ألوان محيطية عميقة (أزرق عميق، تركوازي، زمردي)",
    "ألوان خريفية فاخرة (عنابي، ذهبي محروق، برتقالي داكن)",
    "ألوان ملكية راقية (بنفسجي ملكي، ذهبي، أسود)",
    "ألوان شفقية حالمة (وردي فاتح، بنفسجي ناعم، أزرق سماوي)"
  ],
  artisticStyle: [
    "احترافي راقي",
    "واقعي",
    "تجريدي", 
    "فن رقمي",
    "رسم مائي",
    "فن سينمائي",
    "فن كلاسيكي",
    "فن معاصر",
    "فن بساطة",
    "فن هندسي",
    "ألوان مائية انطباعية",
    "زيتي كلاسيكي فاخر",
    "رقمي معاصر متطور",
    "سريالي حالم",
    "بوب آرت عصري"
  ],
  
  // الإضاءة والبصريات (توسيع 10+ خيارات)
  lighting: [
    "إضاءة طبيعية ناعمة",
    "إضاءة سينمائية",
    "إضاءة جانبية",
    "إضاءة خلفية",
    "إضاءة خافتة",
    "إضاءة ساطعة",
    "إضاءة ذهبية",
    "إضاءة درامية",
    "إضاءة متدرجة",
    "إضاءة محيطة دافئة",
    "إضاءة موجهة احترافية",
    "إضاءة استوديو متطورة",
    "إضاءة غروب رومانسية",
    "إضاءة نيون عصرية",
    "إضاءة شمعية ساحرة"
  ],
  depthOfField: [
    "عمق مجال ضيق",
    "عمق مجال واسع",
    "عمق مجال متوسط",
    "لا يوجد تأثير عمق مجال",
    "عمق مجال متدرج"
  ],
  softGlow: [
    "توهج ناعم حول العناصر",
    "لا يوجد توهج",
    "توهج قوي",
    "توهج خفيف",
    "توهج ديناميكي",
    "توهج ذهبي",
    "توهج ملون"
  ],
  
  // الخلفية والعناصر (توسيع 10+ خيارات)
  background: [
    "خلفية ضبابية ناعمة",
    "خلفية بيضاء بسيطة",
    "خلفية طبيعية",
    "خلفية مجردة",
    "خلفية بنسيج",
    "خلفية متدرجة",
    "خلفية هندسية",
    "خلفية عضوية",
    "تدرج متطور (تأثيرات جوية، أنماط هندسية، تأثيرات جوية)",
    "أنماط هندسية متطورة",
    "تأثيرات جوية سينمائية",
    "ملامس طبيعية فاخرة",
    "خلفيات معمارية أنيقة",
    "أنماط فنية تجريدية"
  ],
  visualElements: [
    "عناصر متعلقة بالموضوع",
    "أشكال هندسية",
    "عناصر طبيعية",
    "رموز مجردة",
    "خطوط انسيابية",
    "نماذج ثلاثية الأبعاد",
    "عناصر معمارية",
    "عناصر فنية"
  ],
  
  // تخطيط المساحة (توسيع 14+ نوع كما وعدت)
  layoutType: [
    "مساحة فارغة على اليمين للنص العربي",
    "مساحة فارغة على اليسار للنص الإنجليزي",
    "مساحة فارغة في الأعلى",
    "مساحة فارغة في الأسفل",
    "مساحة فارغة في الوسط",
    "تخطيط مثلثي أنيق",
    "تخطيط معيني متطور",
    "تخطيط سداسي هندسي",
    "تخطيط نجمي مبتكر",
    "تخطيط على شكل قلب",
    "تخطيط بيضاوي عضوي",
    "تخطيط حلزوني ديناميكي",
    "تخطيط شبكي متوازن",
    "تخطيط موجي انسيابي"
  ],
  separatorStyle: [
    "موجات منحنية ناعمة",
    "خطوط مستقيمة",
    "أشكال هندسية",
    "تدرج لوني",
    "حواف ناعمة",
    "فواصل مجردة"
  ],
  backgroundDivision: [
    "قسمين بفاصل منحني",
    "ثلاثة أقسام متساوية",
    "تقسيم قطري",
    "تقسيم دائري",
    "تقسيم هندسي",
    "تقسيم طبيعي"
  ],
  colorTransition: [
    "تدرج ناعم بين الألوان",
    "انتقال حاد",
    "انتقال متموج",
    "انتقال دائري",
    "انتقال خطي",
    "انتقال عشوائي"
  ],
  
  // تركيب المنطقة البصرية
  composition: [
    "شخص يقف في الخلفية",
    "عناصر متوازنة",
    "تركيز مركزي",
    "تركيب ثلثي",
    "تركيب متماثل",
    "تركيب ديناميكي"
  ],
  clothingStyle: [
    "ملابس رسمية",
    "ملابس كاجوال",
    "ملابس احترافية",
    "ملابس عصرية",
    "ملابس كلاسيكية"
  ],
  
  // التأثيرات البصرية (توسيع 10+ خيارات)
  visualEffects: [
    "ضبابية خلفية ناعمة، توهج داخلي، انعكاسات ضوئية",
    "تدرجات لونية ثلاثية الأبعاد",
    "ظلال منحنية ناعمة",
    "شفافية متدرجة للطبقات",
    "تأثيرات جسيمات دقيقة",
    "انتقالات لونية سائلة",
    "عمق بصري متعدد المستويات",
    "إضاءة سينمائية محترفة",
    "انعكاسات مائية",
    "تأثيرات ضوئية متحركة",
    "ضباب سينمائي حالم",
    "سحب طبيعية متحركة",
    "شفق قطبي ساحر",
    "انعكاسات زجاجية أنيقة",
    "تأثيرات بخار ناعمة"
  ],

  // التأثيرات الجوية الجديدة (10 خيارات)
  atmosphericEffects: [
    "ضباب سينمائي حالم",
    "سحب طبيعية متحركة",
    "شفق قطبي ساحر",
    "ندى صباحي منعش",
    "ضباب ذهبي دافئ",
    "سحب عاصفية دراماتيكية",
    "بخار ناعم متصاعد",
    "رذاذ مائي متلألئ",
    "هواء متموج حراري",
    "جو غامض ليلي"
  ],

  // الأساليب الفنية الجديدة (10 خيارات)
  advancedArtisticStyles: [
    "ألوان مائية انطباعية",
    "زيتي كلاسيكي فاخر",
    "رقمي معاصر متطور",
    "سريالي حالم",
    "بوب آرت عصري",
    "مينيماليست أنيق",
    "باروكي فخم",
    "فوتوريليزم مستقبلي",
    "آرت نوفو زخرفي",
    "تكعيبي هندسي"
  ],

  // أنواع الإضاءة المتقدمة (10 خيارات)
  advancedLighting: [
    "إضاءة محيطة دافئة",
    "إضاءة موجهة احترافية",
    "إضاءة استوديو متطورة",
    "إضاءة غروب رومانسية",
    "إضاءة نيون عصرية",
    "إضاءة شمعية ساحرة",
    "إضاءة قمرية غامضة",
    "إضاءة ليد باردة",
    "إضاءة تنجستن دافئة",
    "إضاءة ليزر متطورة"
  ],

  // ملامس التراكب المتقدمة (10 خيارات)
  overlayTextures: [
    "رخام فخم أنيق",
    "جلد أصيل فاخر",
    "زجاج أنيق شفاف",
    "معدن مصقول براق",
    "خشب طبيعي دافئ",
    "حرير ناعم لامع",
    "قطيفة مخملية فخمة",
    "كريستال متلألئ",
    "ورق مقوى عتيق",
    "ألياف كربونية عصرية"
  ],
  
  // قيود التصميم
  designConstraints: [
    "بدون شعارات أو نصوص أو علامات تجارية",
    "عدم استخدام ألوان صارخة",
    "تجنب التفاصيل المعقدة",
    "بساطة في التكوين",
    "تناسق في التوزيع",
    "وضوح في العناصر الأساسية",
    "تجانس في الإضاءة"
  ]
};

export const DesignPromptGenerator: React.FC<DesignPromptGeneratorProps> = ({
  specialty = "",
  contentType = "",
  imageStyle = "",
  language = "ar",
  onImageGenerated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [editablePrompt, setEditablePrompt] = useState("");
  const [translatedPrompt, setTranslatedPrompt] = useState("");
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedImageBBUrl, setGeneratedImageBBUrl] = useState("");
  const [imageTypeMode, setImageTypeMode] = useState<'context' | 'general'>('context'); // خاص بمعلومات السياق افتراضياً
  const [contextImageTypes, setContextImageTypes] = useState<string[]>(['إنفوجرافيك تفاعلي', 'صورة شخصية احترافية']); // خيارات افتراضية
  const [isGeneratingImageTypes, setIsGeneratingImageTypes] = useState(false);

  // تحديث نوع الصورة عند تغيير الوضع
  useEffect(() => {
    const defaultOptions = imageTypeMode === 'context' ? contextImageTypes : DESIGN_OPTIONS.imageTypeGeneral;
    if (defaultOptions.length > 0) {
      setDesignVariables(prev => ({...prev, imageType: defaultOptions[0]}));
    }
  }, [imageTypeMode, contextImageTypes]);
  const [whiteSpaceEnabled, setWhiteSpaceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("main");
  const [isTabDialogOpen, setIsTabDialogOpen] = useState(false);
  const [selectedTabsForGeneration, setSelectedTabsForGeneration] = useState<string[]>(['main', 'textual']);
  const [textualOptions, setTextualOptions] = useState<TextualOptions>({
    leftColor: "ذهبي برتقالي دافئ",
    icons: "رموز مالية: أكياس مال، أسهم صاعدة، محفظة، عملات، إيصالات، رموز $ £",
    lightingEffect: "ضوء قوي من الأعلى يمين، وميض عدسة، مؤثرات جسيمية",
    divider: "خط موجي عمودي على شكل S",
    rightColor: "أوف وايت/كريمي ضبابي ناعم",
    bokeh: "تأثير بوكه، وميض عدسة بنفس الموضع",
    style: "احترافي، حديث، إيجابي، مزيج بين الواقعية والتصميم"
  });

  const [textualOptionsLists, setTextualOptionsLists] = useState({
    leftColorOptions: [
      "ذهبي برتقالي دافئ",
      "أزرق عميق مع لمعان فضي",
      "أخضر زمردي فاخر",
      "بنفسجي ملكي راقي",
      "أحمر عنابي أنيق",
      "تدرج غروب (برتقالي-وردي)",
      "تدرج محيطي (أزرق-تركوازي)",
      "تدرج خريفي (عنابي-ذهبي)",
      "تدرج ملكي (بنفسجي-ذهبي)",
      "تدرج شفقي (وردي-بنفسجي)"
    ],
    iconsOptions: [
      "رموز مالية: أكياس مال، أسهم صاعدة، محفظة، عملات، إيصالات، رموز $ £",
      "رموز تقنية: شاشات، دوائر رقمية، شبكات، كود، روبوتات",
      "رموز طبية: قلب، صليب، كبسولات، سماعة، DNA",
      "رموز تعليمية: كتب، مصباح، تخرج، قلم، لوح",
      "رموز تجارية: مبنى، مصافحة، مؤتمرات، عقود، نمو",
      "رموز طبيعية: أوراق، شجر، ماء، شمس، جبال",
      "رموز فنية: فرشاة، لوحة، نوتات موسيقية، كاميرا",
      "رموز رياضية: كرة، ميداليات، كأس، علم، ملعب",
      "رموز سفر: طائرة، حقيبة، بوصلة، خريطة، جواز",
      "رموز طعام: شوكة، طبق، كوب، فاكهة، خضروات"
    ],
    lightingEffectOptions: [
      "ضوء قوي من الأعلى يمين، وميض عدسة، مؤثرات جسيمية",
      "إضاءة ناعمة منتشرة مع توهج ذهبي",
      "إضاءة دراماتيكية بظلال قوية",
      "إضاءة طبيعية من النافذة مع أشعة شمس",
      "إضاءة نيون ملونة مع انعكاسات",
      "إضاءة شمعية دافئة مع توهج برتقالي",
      "إضاءة استوديو احترافية متوازنة",
      "إضاءة قمرية فضية باردة",
      "إضاءة غروب ذهبية رومانسية",
      "إضاءة ليزر متقطعة مع ألوان زاهية"
    ],
    dividerOptions: [
      "خط موجي عمودي على شكل S",
      "خط مستقيم بسيط وأنيق",
      "خط منحني ناعم كالنهر",
      "تدرج لوني يذوب تدريجياً",
      "خط مسنن هندسي حديث",
      "شكل دائري أو بيضاوي",
      "خط متقطع بنقاط متفاوتة",
      "شكل مثلثي أو معيني",
      "خط حلزوني ديناميكي",
      "تداخل هندسي معقد"
    ],
    rightColorOptions: [
      "أوف وايت/كريمي ضبابي ناعم",
      "أبيض نقي مع لمحة فضية",
      "رمادي فاتح مع توهج لؤلؤي",
      "بيج دافئ مع نعومة حريرية",
      "أزرق فاتح كالسحاب",
      "وردي باستيل حالم",
      "أصفر كريمي مشمس",
      "أخضر نعناعي منعش",
      "بنفسجي فاتح راقي",
      "تدرج أبيض مع ألوان قوس قزح"
    ],
    bokehOptions: [
      "تأثير بوكه، وميض عدسة بنفس الموضع",
      "دوائر ضوئية ناعمة متناثرة",
      "نجوم متلألئة صغيرة",
      "فقاعات ضوئية شفافة",
      "شرائط ضوئية منحنية",
      "رذاذ ضوئي متطاير",
      "انعكاسات مائية متموجة",
      "جسيمات ذهبية عائمة",
      "ومضات برق خاطفة",
      "أمطار ضوئية متساقطة"
    ],
    styleOptions: [
      "احترافي، حديث، إيجابي، مزيج بين الواقعية والتصميم",
      "أنيق، مينيماليست، راقي، بساطة عصرية",
      "دافئ، ودود، مرحب، طابع إنساني",
      "ديناميكي، حيوي، مفعم بالطاقة والحركة",
      "هادئ، مريح، مطمئن، مثل السبا",
      "فخم، ملكي، راقي، كالقصور",
      "عصري، تقني، مستقبلي، كالخيال العلمي",
      "طبيعي، عضوي، بيئي، كالغابات",
      "فني، إبداعي، ملهم، كالمعارض",
      "تقليدي، كلاسيكي، عريق، كالتراث"
    ]
  });
  const [designVariables, setDesignVariables] = useState<DesignVariables>({
    // خصائص الصورة الأساسية
    imageType: "إنفوجرافيك تفاعلي", // خاص بمعلومات السياق
    imageQuality: "عالية الجودة",
    
    // الألوان والنمط
    mainColors: "ألوان ترابية وباستيل",
    artisticStyle: "احترافي راقي",
    
    // الإضاءة والبصريات
    lighting: "إضاءة طبيعية ناعمة",
    depthOfField: "عمق مجال ضيق",
    softGlow: "توهج ناعم حول العناصر",
    
    // الخلفية والعناصر
    background: "خلفية ضبابية ناعمة",
    visualElements: "عناصر متعلقة بالموضوع",
    
    // تخطيط المساحة
    layoutType: "مساحة فارغة على اليمين للنص العربي",
    separatorStyle: "موجات منحنية ناعمة",
    backgroundDivision: "قسمين بفاصل منحني",
    colorTransition: "تدرج ناعم بين الألوان",
    textAreaSize: 40,
    
    // تركيب المنطقة البصرية
    composition: "شخص يقف في الخلفية",
    clothingStyle: "ملابس رسمية",
    
    // التأثيرات البصرية
    visualEffects: "ضبابية خلفية ناعمة، توهج داخلي، انعكاسات ضوئية",
    
    // قيود التصميم
    designConstraints: "بدون شعارات أو نصوص أو علامات تجارية",
    
    // المتغيرات الجديدة المتقدمة
    atmosphericEffect: "ضباب سينمائي حالم",
    advancedArtisticStyle: "ألوان مائية انطباعية",
    advancedLighting: "إضاءة محيطة دافئة",
    overlayTexture: "رخام فخم أنيق",
    
    // إعدادات تخطيط المساحة المتقدمة
    spaceLayoutSettings: {
      layoutPattern: 'half-split',
      textPosition: 'right',
      imagePosition: 'left',
      divisionStyle: 'curved',
      spacingRatio: 50
    }
  });

  const [whiteBackgroundSettings, setWhiteBackgroundSettings] = useState({
    backgroundOpacity: 60,
    elementsOpacity: 60
  });

  // تشغيل توليد الخيارات المتقدمة تلقائياً عند فتح النافذة
  useEffect(() => {
    if (isOpen && !hasAutoGenerated && (specialty || contentType || imageStyle)) {
      generateAdvancedOptions();
      setHasAutoGenerated(true);
    }
    // إعادة تعيين الحالة عند إغلاق النافذة
    if (!isOpen) {
      setHasAutoGenerated(false);
    }
  }, [isOpen, specialty, contentType, imageStyle, hasAutoGenerated]);

  const generateTextualOptionsFromContext = async () => {
    try {
      const contextPrompt = `بناءً على السياق التالي:
- التخصص: ${specialty || 'عام'}
- نوع المحتوى: ${contentType || 'محتوى تعليمي'}
- نمط الصورة: ${imageStyle || 'احترافي'}

قم بتوليد خيارات مخصصة للخيارات النصية التالية مناسبة للسياق:

أريد 3-5 خيارات لكل فئة:
- ألوان الجهة اليسرى (خلفية فوتوغرافية)
- رموز وعناصر رسومية مناسبة للموضوع
- تأثيرات إضاءة ووهج
- أشكال الفواصل والخطوط
- ألوان الجهة اليمنى (خلفية ضبابية)
- تأثيرات بصرية (بوكه وغيرها)
- الطابع العام للتصميم

قدم الإجابة بصيغة JSON:
{
  "leftColorOptions": ["خيار1", "خيار2", ...],
  "iconsOptions": ["خيار1", "خيار2", ...],
  "lightingEffectOptions": ["خيار1", "خيار2", ...],
  "dividerOptions": ["خيار1", "خيار2", ...],
  "rightColorOptions": ["خيار1", "خيار2", ...],
  "bokehOptions": ["خيار1", "خيار2", ...],
  "styleOptions": ["خيار1", "خيار2", ...],
  "contextDefaults": {
    "leftColor": "قيمة مناسبة للسياق",
    "icons": "رموز مناسبة للسياق",
    "lightingEffect": "إضاءة مناسبة للسياق",
    "divider": "فاصل مناسب للسياق",
    "rightColor": "لون خلفية مناسب للسياق",
    "bokeh": "تأثير مناسب للسياق",
    "style": "طابع مناسب للسياق"
  }
}`;

      const response = await geminiApiManager.makeRequest('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedText) {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            // تطبيق القيم الافتراضية والخيارات المولدة للخيارات النصية
            if (result.contextDefaults) {
              setTextualOptions(prev => ({
                ...prev,
                ...result.contextDefaults
              }));
            }
            
            // تطبيق قوائم الخيارات المولدة
            if (result.leftColorOptions) setTextualOptionsLists(prev => ({...prev, leftColorOptions: result.leftColorOptions}));
            if (result.iconsOptions) setTextualOptionsLists(prev => ({...prev, iconsOptions: result.iconsOptions}));
            if (result.lightingEffectOptions) setTextualOptionsLists(prev => ({...prev, lightingEffectOptions: result.lightingEffectOptions}));
            if (result.dividerOptions) setTextualOptionsLists(prev => ({...prev, dividerOptions: result.dividerOptions}));
            if (result.rightColorOptions) setTextualOptionsLists(prev => ({...prev, rightColorOptions: result.rightColorOptions}));
            if (result.bokehOptions) setTextualOptionsLists(prev => ({...prev, bokehOptions: result.bokehOptions}));
            if (result.styleOptions) setTextualOptionsLists(prev => ({...prev, styleOptions: result.styleOptions}));
          }
        }
      }
    } catch (error) {
      console.error('Error generating textual options:', error);
    }
  };

  const generateAdvancedOptions = async () => {
    setIsGenerating(true);
    try {
      const contextPrompt = `بناءً على السياق التالي:
- التخصص: ${specialty || 'عام'}
- نوع المحتوى: ${contentType || 'محتوى تعليمي'}
- نمط الصورة: ${imageStyle || 'احترافي'}

قم بتوليد خيارات موسعة ومتنوعة لكل فئة من فئات التصميم التالية، مع اختيار قيم افتراضية مناسبة للسياق:

أريد 5-8 خيارات إضافية لكل فئة تناسب السياق المحدد:
- أنواع الصور المناسبة
- ألوان رئيسية متنوعة
- أنماط فنية مختلفة
- عناصر بصرية مناسبة
- أنواع خلفيات
- أنواع إضاءة
- تأثيرات بصرية متقدمة

قدم الإجابة بصيغة JSON مع الخيارات الجديدة والقيم الافتراضية المقترحة:
{
  "newOptions": {
    "imageType": ["خيار1", "خيار2", ...],
    "mainColors": ["خيار1", "خيار2", ...],
    "artisticStyle": ["خيار1", "خيار2", ...],
    "visualElements": ["خيار1", "خيار2", ...],
    "background": ["خيار1", "خيار2", ...],
    "lighting": ["خيار1", "خيار2", ...],
    "visualEffects": ["خيار1", "خيار2", ...]
  },
  "randomDefaults": {
    "imageType": "قيمة مقترحة",
    "imageQuality": "قيمة مقترحة",
    "mainColors": "قيمة مقترحة",
    "artisticStyle": "قيمة مقترحة",
    "lighting": "قيمة مقترحة",
    "depthOfField": "قيمة مقترحة",
    "softGlow": "قيمة مقترحة",
    "background": "قيمة مقترحة",
    "visualElements": "قيمة مقترحة",
    "layoutType": "قيمة مقترحة",
    "separatorStyle": "قيمة مقترحة",
    "backgroundDivision": "قيمة مقترحة",
    "colorTransition": "قيمة مقترحة",
    "textAreaSize": رقم بين 20-60,
    "composition": "قيمة مقترحة",
    "clothingStyle": "قيمة مقترحة",
    "visualEffects": "قيمة مقترحة",
    "designConstraints": "قيمة مقترحة"
  }
}`;

      const response = await geminiApiManager.makeRequest('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            // إضافة الخيارات الجديدة للقوائم الموجودة
            if (result.newOptions) {
              Object.keys(result.newOptions).forEach(key => {
                if (DESIGN_OPTIONS[key] && Array.isArray(result.newOptions[key])) {
                  DESIGN_OPTIONS[key] = [...new Set([...DESIGN_OPTIONS[key], ...result.newOptions[key]])];
                }
              });
            }

            // تطبيق القيم الافتراضية العشوائية
            if (result.randomDefaults) {
              setDesignVariables(prev => ({
                ...prev,
                ...result.randomDefaults
              }));
            }

            // توليد خيارات نصية مخصصة للتبويبة الثانية
            await generateTextualOptionsFromContext();

            toast.success("تم توليد خيارات موسعة وقيم افتراضية مناسبة للسياق!");
          } else {
            throw new Error("لم يتم الحصول على تنسيق JSON صحيح");
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          toast.error("حدث خطأ في تحليل النتائج المولدة");
        }
      } else {
        throw new Error("لم يتم الحصول على نتيجة صحيحة");
      }
    } catch (error) {
      console.error('Error generating advanced options:', error);
      toast.error("حدث خطأ في توليد الخيارات المتقدمة");
    } finally {
      setIsGenerating(false);
    }
  };

  const randomizeSelections = () => {
    const getRandomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];
    
    setDesignVariables({
      imageType: getRandomItem(imageTypeMode === 'context' ? DESIGN_OPTIONS.imageTypeContext : DESIGN_OPTIONS.imageTypeGeneral),
      imageQuality: getRandomItem(DESIGN_OPTIONS.imageQuality),
      mainColors: getRandomItem(DESIGN_OPTIONS.mainColors),
      artisticStyle: getRandomItem(DESIGN_OPTIONS.artisticStyle),
      lighting: getRandomItem(DESIGN_OPTIONS.lighting),
      depthOfField: getRandomItem(DESIGN_OPTIONS.depthOfField),
      softGlow: getRandomItem(DESIGN_OPTIONS.softGlow),
      background: getRandomItem(DESIGN_OPTIONS.background),
      visualElements: getRandomItem(DESIGN_OPTIONS.visualElements),
      layoutType: getRandomItem(DESIGN_OPTIONS.layoutType),
      separatorStyle: getRandomItem(DESIGN_OPTIONS.separatorStyle),
      backgroundDivision: getRandomItem(DESIGN_OPTIONS.backgroundDivision),
      colorTransition: getRandomItem(DESIGN_OPTIONS.colorTransition),
      textAreaSize: Math.floor(Math.random() * 5) * 10 + 20, // 20, 30, 40, 50, 60
      composition: getRandomItem(DESIGN_OPTIONS.composition),
      clothingStyle: getRandomItem(DESIGN_OPTIONS.clothingStyle),
      visualEffects: getRandomItem(DESIGN_OPTIONS.visualEffects),
      designConstraints: getRandomItem(DESIGN_OPTIONS.designConstraints),
      // المتغيرات الجديدة المتقدمة
      atmosphericEffect: getRandomItem(DESIGN_OPTIONS.atmosphericEffects),
      advancedArtisticStyle: getRandomItem(DESIGN_OPTIONS.advancedArtisticStyles),
      advancedLighting: getRandomItem(DESIGN_OPTIONS.advancedLighting),
      overlayTexture: getRandomItem(DESIGN_OPTIONS.overlayTextures)
    });
    
    // اختيار عشوائي للخيارات النصية أيضاً
    setTextualOptions({
      leftColor: getRandomItem(textualOptionsLists.leftColorOptions),
      icons: getRandomItem(textualOptionsLists.iconsOptions),
      lightingEffect: getRandomItem(textualOptionsLists.lightingEffectOptions),
      divider: getRandomItem(textualOptionsLists.dividerOptions),
      rightColor: getRandomItem(textualOptionsLists.rightColorOptions),
      bokeh: getRandomItem(textualOptionsLists.bokehOptions),
      style: getRandomItem(textualOptionsLists.styleOptions)
    });
    
    toast.success("تم اختيار قيم عشوائية للتصميم والخيارات النصية!");
  };

  // دالة لتحديث إعدادات تخطيط المساحة
  const handleSpaceLayoutUpdate = (settings: SpaceLayoutSettings) => {
    setDesignVariables(prev => ({
      ...prev,
      spaceLayoutSettings: settings
    }));
  };

  // دالة معالجة اختيار التبويبات وتوليد البرومت
  const handleTabsSelected = async (selectedTabs: string[]) => {
    setSelectedTabsForGeneration(selectedTabs);
    
    // تحديد نوع البرومت بناءً على التبويبات المختارة
    if (selectedTabs.includes('main') && selectedTabs.includes('textual')) {
      // توليد برومت شامل (الخيارات الرئيسية + النصية)
      await generateCombinedPrompt();
    } else if (selectedTabs.includes('main')) {
      // توليد برومت الخيارات الرئيسية فقط
      await generateDesignPrompt();
    } else if (selectedTabs.includes('textual')) {
      // توليد برومت نصي فقط
      await generateTextualPrompt();
    } else {
      // افتراضي: توليد شامل
      await generateCombinedPrompt();
    }
  };

  const generateCombinedPrompt = async () => {
    setIsGenerating(true);
    try {
      // توليد برومت يجمع بين الخيارات الرئيسية والنصية
      const mainPromptContent = await buildMainPromptContent();
      const textualPromptContent = await buildTextualPromptContent();
      
      const combinedPrompt = `${mainPromptContent}\n\nالتفاصيل النصية الإضافية:\n${textualPromptContent}`;
      
      setGeneratedPrompt(combinedPrompt);
      setEditablePrompt(combinedPrompt);
      setHasAutoGenerated(true);
      toast.success("تم توليد البرومت الشامل بنجاح!");
    } catch (error) {
      console.error('Error generating combined prompt:', error);
      toast.error("حدث خطأ في توليد البرومت الشامل");
    } finally {
      setIsGenerating(false);
    }
  };

  const buildMainPromptContent = async () => {
    // استخراج منطق توليد البرومت الرئيسي من generateDesignPrompt
    return buildDesignPromptContent();
  };

  const buildTextualPromptContent = async () => {
    // استخراج منطق توليد البرومت النصي من generateTextualPrompt
    return buildTextualOptionsContent();
  };

  const buildDesignPromptContent = () => {
    const whiteSpaceContent = whiteSpaceEnabled ? 
      `\n\nمساحة بيضاء نقية: يجب استبدال المساحة المخصصة للصورة بمساحة بيضاء نقية دون المساس بالمساحة المخصصة للنص وتأثيراتها البصرية. تطبيق شفافية ${designVariables.backgroundOpacity || 60}% على الخلفية و${designVariables.elementsOpacity || 60}% على العناصر البصرية.` : '';

    return `أنشئ برومت تصميم احترافي مفصل لموضوع: "${specialty || 'عام'} - ${contentType || 'محتوى تعليمي'}"

المطلوب إنشاء برومت باللغة العربية مفصل لتوليد صورة تصميم احترافي يناسب هذا الموضوع مع التأكيد على:

القيود الصارمة والإجبارية:
- عدم استخدام الشعارات نهائياً
- عدم وضع أي نصوص أو كتابات في الصورة
- عدم استخدام أرقام أو حروف في التصميم
- بدون علامات تجارية أو رموز تجارية
- التركيز على العناصر البصرية البحتة فقط

خصائص الصورة الأساسية:
- نوع الصورة: ${designVariables.imageType}
- جودة الصورة: ${designVariables.imageQuality}

الألوان والنمط:
- الألوان الرئيسية: ${designVariables.mainColors}
- النمط الفني: ${designVariables.artisticStyle}

الإضاءة والبصريات:
- نوع الإضاءة: ${designVariables.lighting}
- عمق المجال: ${designVariables.depthOfField}
- التوهج الناعم: ${designVariables.softGlow}

الخلفية والعناصر:
- نوع الخلفية: ${designVariables.background}
- العناصر البصرية: ${designVariables.visualElements}

تخطيط المساحة:
- نوع التخطيط: ${designVariables.layoutType}
- نمط الفاصل: ${designVariables.separatorStyle}
- تقسيم الخلفية: ${designVariables.backgroundDivision}
- انتقال الألوان: ${designVariables.colorTransition}
- حجم منطقة النص: ${designVariables.textAreaSize}%

تركيب المنطقة البصرية:
- التركيب العام: ${designVariables.composition}
- نمط الملابس: ${designVariables.clothingStyle}

التأثيرات البصرية:
- التأثيرات المطلوبة: ${designVariables.visualEffects}

التأثيرات المتقدمة:
${designVariables.atmosphericEffect ? `- التأثير الجوي: ${designVariables.atmosphericEffect}` : ''}
${designVariables.advancedArtisticStyle ? `- النمط الفني المتقدم: ${designVariables.advancedArtisticStyle}` : ''}
${designVariables.advancedLighting ? `- الإضاءة المتقدمة: ${designVariables.advancedLighting}` : ''}
${designVariables.overlayTexture ? `- ملمس التراكب: ${designVariables.overlayTexture}` : ''}

${designVariables.spaceLayoutSettings ? `
إعدادات تخطيط المساحة المتقدمة:
- نمط التخطيط: ${designVariables.spaceLayoutSettings.layoutPattern}
- موقع النص: ${designVariables.spaceLayoutSettings.textPosition}
- موقع الصورة: ${designVariables.spaceLayoutSettings.imagePosition}
- نمط التقسيم: ${designVariables.spaceLayoutSettings.divisionStyle}
- نسبة المساحة: ${designVariables.spaceLayoutSettings.spacingRatio}%
` : ''}

قيود التصميم:
- ${designVariables.designConstraints}${whiteSpaceContent}

اللغة المطلوبة للبرومت: ${language === "ar" ? "العربية" : "الإنجليزية"}

يرجى إنشاء برومت مفصل وواضح لتوليد هذا التصميم.`;
  };

  const buildTextualOptionsContent = () => {
    return `التفاصيل النصية المتقدمة:

ألوان الأقسام:
- الجانب الأيسر: ${textualOptions.leftColor}
- الجانب الأيمن: ${textualOptions.rightColor}

العناصر البصرية:
- الرموز والأيقونات: ${textualOptions.icons}

التأثيرات الضوئية:
- تأثيرات الإضاءة: ${textualOptions.lightingEffect}
- تأثير البوكه: ${textualOptions.bokeh}

التصميم العام:
- الفاصل البصري: ${textualOptions.divider}
- النمط العام: ${textualOptions.style}`;
  };

  const generateDesignPrompt = async () => {
    setIsGenerating(true);
    try {
      // بناء برومت مفصل بناءً على المتغيرات
      const promptContent = `أنشئ برومت تصميم احترافي مفصل لموضوع: "${specialty || 'عام'} - ${contentType || 'محتوى تعليمي'}"

المطلوب إنشاء برومت باللغة العربية مفصل لتوليد صورة تصميم احترافي يناسب هذا الموضوع مع التأكيد على:

القيود الصارمة والإجبارية:
- عدم استخدام الشعارات نهائياً
- عدم وجود أي نصوص في الصورة
- تجنب العلامات التجارية بشكل كامل  
- بدون تصميم موكأب أو محاكيات

${!whiteSpaceEnabled ? `
المتطلبات التصميمية:
- نوع الصورة: ${designVariables.imageType}
- الألوان الرئيسية: ${designVariables.mainColors}
- النمط الفني: ${designVariables.artisticStyle}
- العناصر البصرية: ${designVariables.visualElements}
- جودة الصورة: ${designVariables.imageQuality}
- الخلفية: ${designVariables.background}
- الإضاءة: ${designVariables.lighting}
- عمق المجال: ${designVariables.depthOfField}
- توهج ناعم: ${designVariables.softGlow}
` : `
المتطلبات التصميمية (مع مساحة بيضاء للصورة):
- الألوان الرئيسية: ${designVariables.mainColors}
- النمط الفني: ${designVariables.artisticStyle}
- العناصر البصرية: ${designVariables.visualElements}
- جودة الصورة: ${designVariables.imageQuality}
- الإضاءة: ${designVariables.lighting}
- عمق المجال: ${designVariables.depthOfField}
- توهج ناعم: ${designVariables.softGlow}
`}

⚠️ تخطيط وتقسيم مساحة الصورة (إلزامي - يجب التنفيذ بدقة مطلقة):
- نمط التخطيط المحدد: ${designVariables.spaceLayoutSettings?.layoutPattern || 'half-split'}
- موضع النص: ${designVariables.spaceLayoutSettings?.textPosition || 'right'}
- موضع الصورة: ${designVariables.spaceLayoutSettings?.imagePosition || 'left'}  
- نمط الخط الفاصل: ${designVariables.spaceLayoutSettings?.divisionStyle || 'curved'}
- نسبة تقسيم المساحة: ${designVariables.spaceLayoutSettings?.spacingRatio || 50}%

تفاصيل تنفيذ التخطيط (صارم):
- يجب تطبيق نمط التخطيط المحدد بدقة تامة دون أي انحراف
- موضع النص والصورة يجب أن يكون كما هو محدد تماماً
- نسبة التقسيم يجب أن تكون مضبوطة بدقة
- نمط الخط الفاصل يجب أن يكون واضحاً ومميزاً
- لا يُسمح بتغيير أو تعديل هذه الإعدادات نهائياً

تركيب المنطقة البصرية:
- ${designVariables.composition}
- ${designVariables.clothingStyle}
- بدون شعارات أو نصوص أو علامات تجارية
- تجنب تصميم الموكأب
- إضاءة طبيعية ناعمة
- ظلال واقعية
- عمق بصري متدرج
- تباين لوني متوازن

التأثيرات البصرية:
- ${designVariables.visualEffects}
- تدرجات لونية ثلاثية الأبعاد
- ظلال منحنية ناعمة
- شفافية متدرجة للطبقات
- تأثيرات جسيمات دقيقة
- انتقالات لونية سائلة
- عمق بصري متعدد المستويات
- إضاءة سينمائية محترافة

التأثيرات المتقدمة الجديدة:
- التأثير الجوي: ${designVariables.atmosphericEffect || 'ضباب سينمائي حالم'}
- النمط الفني المتطور: ${designVariables.advancedArtisticStyle || 'ألوان مائية انطباعية'}
- الإضاءة المتقدمة: ${designVariables.advancedLighting || 'إضاءة محيطة دافئة'}
- نسيج التراكب: ${designVariables.overlayTexture || 'رخام فخم أنيق'}

${whiteSpaceEnabled ? `
متطلبات استبدال المساحة المخصصة للصورة بمساحة بيضاء:
* يجب استبدال المساحة المخصصة للصورة بمساحة بيضاء نقية (#FFFFFF) تماماً دون المساس بالمساحة المخصصة للنص.
* المساحة المخصصة للنص يجب أن تبقى كما هي مع جميع تأثيراتها البصرية والألوان والتصميم.
* يجب أن تكون المساحة البيضاء المستبدلة نظيفة تماماً بدون أي عناصر تصميمية أو تأثيرات أو ألوان.
* الحدود بين المساحة المخصصة للنص والمساحة البيضاء المستبدلة يجب أن تكون حادة وواضحة بدون تدرج.
* لا يجب تطبيق أي تأثيرات بصرية أو إضاءة أو ظلال على المساحة البيضاء المستبدلة.

إعدادات الشفافية للخلفية البيضاء:
* شفافية الخلفية: ${designVariables.backgroundOpacity || 60}% (أقصى حد 60%)
* شفافية العناصر البصرية: ${designVariables.elementsOpacity || 60}% (أقصى حد 60%)
* يجب تطبيق هذه المستويات من الشفافية على الخلفية والعناصر لضمان ظهور المساحة البيضاء بوضوح.
` : ''}

قيود التصميم:
- ${designVariables.designConstraints}
- عدم استخدام ألوان صارخة
- تجنب التفاصيل المعقدة
- بساطة في التكوين
- تناسق في التوزيع
- وضوح في العناصر الأساسية
- تجانس في الإضاءة
${whiteSpaceEnabled ? '- فصل واضح وحاد بين المناطق دون تدرج\n- حدود محددة وقاطعة بين العناصر' : ''}

التركيز على:
- الجودة والاحترافية
- التوازن والتناسق
- الألوان المتدرجة والناعمة
- المساحات الفارغة للنص
- التأثيرات البصرية الجذابة
${whiteSpaceEnabled ? '- حدود حادة وواضحة بين المناطق المختلفة\n- فصل تام بين المساحة البيضاء والعناصر التصميمية' : ''}

اكتب البرومت بالعربية مع التفاصيل الدقيقة والواضحة للتصميم المطلوب، ليكون مناسباً للتحليل واستخراج المتغيرات منه.`;

      const response = await geminiApiManager.makeRequest('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptContent
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setGeneratedPrompt(generatedText);
        setEditablePrompt(generatedText);
        toast.success("تم توليد برومت التصميم بنجاح!");
        
        // ترجمة تلقائية للبرومت بعد التأكد من اكتمال التوليد
        setTimeout(() => {
          if (generatedText && generatedText.trim()) {
            translatePrompt();
          }
        }, 2000);
      } else {
        throw new Error("لم يتم الحصول على نتيجة صحيحة");
      }
    } catch (error) {
      console.error('Error generating design prompt:', error);
      toast.error("حدث خطأ في توليد برومت التصميم");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTextualPrompt = () => {
    const prompt = `A sophisticated financial concept image with a split-screen design, divided by a clean, vertical ${textualOptions.divider}.

The left side features a warm, ${textualOptions.leftColor}, photorealistic background with ${textualOptions.lightingEffect}. Overlaid are semi-transparent white financial icons and doodles: ${textualOptions.icons}.

The right side is a clean, out-of-focus space in ${textualOptions.rightColor} with ${textualOptions.bokeh}.

Overall style: ${textualOptions.style}.`;

    setGeneratedPrompt(prompt);
    setEditablePrompt(prompt);
    toast.success("تم توليد برومت التصميم النصي بنجاح!");
    
    // ترجمة تلقائية للبرومت بعد التأكد من اكتمال التوليد
    setTimeout(() => {
      if (prompt && prompt.trim()) {
        translatePrompt();
      }
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("تم نسخ البرومت!");
  };

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-prompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تحميل البرومت!");
  };

  const translatePrompt = async () => {
    if (!editablePrompt) {
      toast.error("يرجى توليد البرومت أولاً");
      return;
    }

    setIsTranslating(true);
    try {
      const response = await geminiApiManager.makeRequest('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please translate the following Arabic design prompt to English, maintaining all technical details and specifications. Include STRICT enforcement of space layout settings:\n\n${editablePrompt}\n\nAdditional Space Layout Details:\n- Layout Pattern: ${designVariables.spaceLayoutSettings?.layoutPattern || 'half-split'}\n- Text Position: ${designVariables.spaceLayoutSettings?.textPosition || 'right'}\n- Image Position: ${designVariables.spaceLayoutSettings?.imagePosition || 'left'}\n- Division Style: ${designVariables.spaceLayoutSettings?.divisionStyle || 'curved'}\n- Spacing Ratio: ${designVariables.spaceLayoutSettings?.spacingRatio || 50}%\n\nIMPORTANT: Apply these layout settings with absolute precision and enforce them strictly in the final design.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (translatedText) {
        setTranslatedPrompt(translatedText);
        toast.success("تم ترجمة البرومت إلى الإنجليزية!");
      } else {
        throw new Error("لم يتم الحصول على ترجمة صحيحة");
      }
    } catch (error) {
      console.error('Error translating prompt:', error);
      toast.error("حدث خطأ في ترجمة البرومت");
    } finally {
      setIsTranslating(false);
    }
  };

  const generateImageFromPrompt = async () => {
    const promptToUse = translatedPrompt || generatedPrompt;
    if (!promptToUse) {
      toast.error("يرجى توليد البرومت أولاً");
      return;
    }

    setIsGeneratingImage(true);
    try {
      toast.info("جاري توليد الصورة باستخدام الذكاء الاصطناعي...");
      
      // توليد الصورة باستخدام نفس API المستخدم في ContentGenerator
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f`
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: promptToUse,
          n: 1,
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        throw new Error(`خطأ في توليد الصورة: ${response.status}`);
      }

      const data = await response.json();
      const a4fDirectUrl = data.data[0].url;

      console.log("تم الحصول على رابط A4F المباشر:", a4fDirectUrl);

      // حفظ رابط الصورة في الحالة - استخدام الرابط المباشر من A4F
      setGeneratedImageUrl(a4fDirectUrl);
      setGeneratedImageBBUrl(a4fDirectUrl); // استخدام نفس الرابط

      // إرسال بيانات الصورة إلى المكون الرئيسي بالرابط المباشر
      if (onImageGenerated) {
        onImageGenerated(a4fDirectUrl, "صورة مولدة من برومت التصميم المفصل");
      }

      toast.success("تم توليد الصورة ورفعها إلى ImgBB بنجاح!");
    } catch (error) {
      console.error("Error generating image from prompt:", error);
      toast.error("حدث خطأ في توليد الصورة من البرومت");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 hover:bg-purple-50"
          size="lg"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          توليد برومت تصميم مفصل
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* هيدر ثابت */}
        <div className="sticky top-0 z-10 bg-background border-b shadow-sm p-4">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              مولد برومت التصميم المفصل
            </DialogTitle>
          </DialogHeader>

          {/* أزرار التحكم - أيقونات فقط */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <Button 
              onClick={generateAdvancedOptions} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              size="sm"
              title="توليد خيارات متقدمة"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
            
            <Button 
              onClick={randomizeSelections} 
              variant="outline"
              className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:bg-orange-100"
              size="sm"
              title="اختيار عشوائي"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* زر تفعيل الخلفية البيضاء */}
            <Button
              onClick={() => setWhiteSpaceEnabled(!whiteSpaceEnabled)}
              variant={whiteSpaceEnabled ? "default" : "outline"}
              className={whiteSpaceEnabled ? "bg-green-500 hover:bg-green-600" : "border-green-200"}
              size="sm"
              title="استبدال المساحة المخصصة للصورة بمساحة بيضاء"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => setIsTabDialogOpen(true)}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="sm"
              title="توليد البرومت"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </Button>

            {generatedPrompt && (
              <>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="border-blue-200"
                  title="نسخ البرومت"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={downloadPrompt}
                  variant="outline"
                  size="sm"
                  className="border-blue-200"
                  title="تحميل البرومت"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button 
                  onClick={translatePrompt}
                  disabled={isTranslating}
                  variant="outline"
                  size="sm"
                  className="border-green-200"
                  title="ترجمة للإنجليزية"
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Languages className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  onClick={generateImageFromPrompt}
                  disabled={isGeneratingImage}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  size="sm"
                  title="توليد الصورة"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* المحتوى القابل للسكرول */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* ملاحظة توضيحية للخلفية البيضاء */}
          {whiteSpaceEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <strong>ملاحظة:</strong> سيتم استبدال المساحة المخصصة للصورة بمساحة بيضاء نقية دون المساس بالمساحة المخصصة للنص وتأثيراتها البصرية. 
                سيتم تطبيق شفافية {designVariables.backgroundOpacity || 60}% على الخلفية و{designVariables.elementsOpacity || 60}% على العناصر البصرية.
              </div>
            </div>
          )}

          {/* معلومات السياق */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50">
            <CardHeader>
              <CardTitle className="text-sm text-blue-800">معلومات السياق</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs text-blue-600">التخصص</Label>
                <div className="font-medium text-blue-900">{specialty || "غير محدد"}</div>
              </div>
              <div>
                <Label className="text-xs text-blue-600">نوع المحتوى</Label>
                <div className="font-medium text-blue-900">{contentType || "غير محدد"}</div>
              </div>
              <div>
                <Label className="text-xs text-blue-600">نمط الصورة</Label>
                <div className="font-medium text-blue-900">{imageStyle || "غير محدد"}</div>
              </div>
              <div>
                <Label className="text-xs text-blue-600">اللغة</Label>
                <div className="font-medium text-blue-900">{language === "ar" ? "العربية" : language}</div>
              </div>
            </CardContent>
          </Card>

          {/* متغيرات التصميم */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">خيارات رئيسية</TabsTrigger>
              <TabsTrigger value="textual">خيارات نصية</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
            {/* خصائص الصورة الأساسية */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-sm text-green-800 flex items-center justify-between">
                  خصائص الصورة الأساسية
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {imageTypeMode === 'context' ? 'متصل بمعلومات السياق' : 'عام غير متصل بالسياق'}
                    </span>
                    {imageTypeMode === 'context' && (
                      <ContextImageTypeGenerator
                        topic={specialty || "عام"}
                        prompt={`${contentType || 'محتوى تعليمي'} - ${imageStyle || 'احترافي'}`}
                        specialty={specialty}
                        contentType={contentType}
                        imageStyle={imageStyle}
                        onImageTypesGenerated={setContextImageTypes}
                        disabled={false}
                      />
                    )}
                    <Button
                      variant={imageTypeMode === 'context' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageTypeMode(imageTypeMode === 'context' ? 'general' : 'context')}
                      className="text-xs px-2 py-1"
                    >
                      {imageTypeMode === 'context' ? '🎯 خاص' : '🌍 عام'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الصورة</Label>
                    <Select 
                      value={designVariables.imageType} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, imageType: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                       <SelectContent>
                         {(imageTypeMode === 'context' ? contextImageTypes : DESIGN_OPTIONS.imageTypeGeneral).map((option) => (
                           <SelectItem key={option} value={option}>{option}</SelectItem>
                         ))}
                       </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>جودة الصورة</Label>
                    <Select 
                      value={designVariables.imageQuality} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, imageQuality: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.imageQuality.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الألوان والنمط */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
              <CardHeader>
                <CardTitle className="text-sm text-purple-800">الألوان والنمط</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الألوان الرئيسية</Label>
                    <Select 
                      value={designVariables.mainColors} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, mainColors: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.mainColors.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>النمط الفني</Label>
                    <Select 
                      value={designVariables.artisticStyle} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, artisticStyle: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.artisticStyle.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الإضاءة والبصريات */}
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="text-sm text-amber-800">الإضاءة والبصريات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الإضاءة</Label>
                    <Select 
                      value={designVariables.lighting} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, lighting: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.lighting.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>عمق المجال</Label>
                    <Select 
                      value={designVariables.depthOfField} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, depthOfField: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.depthOfField.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>توهج ناعم</Label>
                    <Select 
                      value={designVariables.softGlow} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, softGlow: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.softGlow.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الخلفية والعناصر */}
            <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-sm text-teal-800">الخلفية والعناصر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الخلفية</Label>
                      <Select 
                        value={designVariables.background} 
                        onValueChange={(value) => setDesignVariables(prev => ({...prev, background: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DESIGN_OPTIONS.background.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>العناصر البصرية</Label>
                      <Select 
                        value={designVariables.visualElements} 
                        onValueChange={(value) => setDesignVariables(prev => ({...prev, visualElements: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DESIGN_OPTIONS.visualElements.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* إعدادات الشفافية عند تفعيل الخلفية البيضاء */}
                  {whiteSpaceEnabled && (
                    <div className="border-t pt-4">
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-teal-700">إعدادات الشفافية للخلفية البيضاء</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          تحكم في شفافية الخلفية والعناصر عند استبدال المساحة المخصصة للصورة بخلفية بيضاء
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">شفافية الخلفية</Label>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {designVariables.backgroundOpacity}%
                            </span>
                          </div>
                          <Slider
                            value={[designVariables.backgroundOpacity || 60]}
                            onValueChange={([value]) => setDesignVariables(prev => ({...prev, backgroundOpacity: value}))}
                            max={60}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            تحديد شفافية الخلفية (أقصى حد 60%)
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">شفافية العناصر</Label>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {designVariables.elementsOpacity}%
                            </span>
                          </div>
                          <Slider
                            value={[designVariables.elementsOpacity || 60]}
                            onValueChange={([value]) => setDesignVariables(prev => ({...prev, elementsOpacity: value}))}
                            max={60}
                            min={10}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            تحديد شفافية العناصر البصرية (أقصى حد 60%)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* تخطيط المساحة المتقدم */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-sm text-purple-800">تخطيط وتقسيم المساحة</CardTitle>
              </CardHeader>
              <CardContent>
                <SpaceLayoutController 
                  onUpdate={(settings) => {
                    console.log('تحديث إعدادات تخطيط المساحة:', settings);
                    setDesignVariables(prev => ({
                      ...prev, 
                      spaceLayoutSettings: settings,
                      // تحديث المتغيرات القديمة للتوافق العكسي
                      layoutType: `${settings.layoutPattern} - النص ${settings.textPosition} والصورة ${settings.imagePosition}`,
                      separatorStyle: settings.divisionStyle,
                      textAreaSize: settings.spacingRatio
                    }));
                  }}
                />
              </CardContent>
            </Card>

            {/* تركيب المنطقة البصرية */}
            <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-sm text-indigo-800">تركيب المنطقة البصرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التركيب</Label>
                    <Select 
                      value={designVariables.composition} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, composition: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.composition.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>نمط الملابس</Label>
                    <Select 
                      value={designVariables.clothingStyle} 
                      onValueChange={(value) => setDesignVariables(prev => ({...prev, clothingStyle: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_OPTIONS.clothingStyle.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* التأثيرات البصرية */}
            <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <CardHeader>
                <CardTitle className="text-sm text-emerald-800">التأثيرات البصرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>التأثيرات البصرية</Label>
                  <Select 
                    value={designVariables.visualEffects} 
                    onValueChange={(value) => setDesignVariables(prev => ({...prev, visualEffects: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_OPTIONS.visualEffects.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* قيود التصميم */}
            <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-slate-800">قيود التصميم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>قيود التصميم</Label>
                  <Select 
                    value={designVariables.designConstraints} 
                    onValueChange={(value) => setDesignVariables(prev => ({...prev, designConstraints: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_OPTIONS.designConstraints.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* الأقسام المتقدمة الجديدة - 10+ خيارات لكل قسم */}
            
            {/* التأثيرات الجوية المتقدمة */}
            <Card className="border-sky-300 bg-gradient-to-r from-sky-100 to-blue-100">
              <CardHeader>
                <CardTitle className="text-sm text-sky-800 flex items-center gap-2">
                  ✨ التأثيرات الجوية المتقدمة (10 خيارات)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>التأثير الجوي</Label>
                  <Select 
                    value={designVariables.atmosphericEffect || "ضباب سينمائي حالم"} 
                    onValueChange={(value) => setDesignVariables(prev => ({...prev, atmosphericEffect: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_OPTIONS.atmosphericEffects.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* الأساليب الفنية المتقدمة */}
            <Card className="border-violet-300 bg-gradient-to-r from-violet-100 to-purple-100">
              <CardHeader>
                <CardTitle className="text-sm text-violet-800 flex items-center gap-2">
                  🎨 الأساليب الفنية المتقدمة (10 خيارات)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>النمط الفني المتطور</Label>
                  <Select 
                    value={designVariables.advancedArtisticStyle || "ألوان مائية انطباعية"} 
                    onValueChange={(value) => setDesignVariables(prev => ({...prev, advancedArtisticStyle: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_OPTIONS.advancedArtisticStyles.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* أنواع الإضاءة المتقدمة */}
            <Card className="border-orange-300 bg-gradient-to-r from-orange-100 to-yellow-100">
              <CardHeader>
                <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
                  💡 أنواع الإضاءة المتقدمة (10 خيارات)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>نوع الإضاءة المتطور</Label>
                  <Select 
                    value={designVariables.advancedLighting || "إضاءة محيطة دافئة"} 
                    onValueChange={(value) => setDesignVariables(prev => ({...prev, advancedLighting: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_OPTIONS.advancedLighting.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* ملامس التراكب المتقدمة */}
            <Card className="border-emerald-300 bg-gradient-to-r from-emerald-100 to-teal-100">
              <CardHeader>
                <CardTitle className="text-sm text-emerald-800 flex items-center gap-2">
                  🎯 ملامس التراكب المتقدمة (10 خيارات)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>نسيج التراكب</Label>
                  <Select 
                    value={designVariables.overlayTexture || "رخام فخم أنيق"} 
                    onValueChange={(value) => setDesignVariables(prev => ({...prev, overlayTexture: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGN_OPTIONS.overlayTextures.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* إعدادات تخطيط وتقسيم مساحة الصورة */}
            <SpaceLayoutController 
              onUpdate={handleSpaceLayoutUpdate}
            />
            </TabsContent>

            <TabsContent value="textual" className="space-y-4">
              {/* الخيارات النصية */}
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="text-sm text-orange-800">خيارات نصية مخصصة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>لون الجهة اليسرى (خلفية فوتوغرافية)</Label>
                      <Select 
                        value={textualOptions.leftColor} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, leftColor: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.leftColorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>العناصر الرسومية على الجهة اليسرى</Label>
                      <Select 
                        value={textualOptions.icons} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, icons: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.iconsOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>تأثير الإضاءة والوهج</Label>
                      <Select 
                        value={textualOptions.lightingEffect} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, lightingEffect: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.lightingEffectOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الشكل الفاصل (الخط المتموج)</Label>
                      <Select 
                        value={textualOptions.divider} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, divider: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.dividerOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>لون الجهة اليمنى (خلفية ضبابية)</Label>
                      <Select 
                        value={textualOptions.rightColor} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, rightColor: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.rightColorOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>التأثيرات على الجهة اليمنى</Label>
                      <Select 
                        value={textualOptions.bokeh} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, bokeh: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.bokehOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الطابع العام</Label>
                      <Select 
                        value={textualOptions.style} 
                        onValueChange={(value) => setTextualOptions(prev => ({...prev, style: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textualOptionsLists.styleOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

            {/* النتيجة المولدة - قابلة للتعديل */}
            {generatedPrompt && (
              <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    برومت التصميم العربي (قابل للتعديل)
                  </CardTitle>
                  <p className="text-xs text-blue-600">
                    يمكنك تعديل البرومت العربي هنا قبل ترجمته وتوليد الصورة
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editablePrompt}
                    onChange={(e) => setEditablePrompt(e.target.value)}
                    className="min-h-[200px] font-mono text-sm border-blue-200 focus:border-blue-400"
                    placeholder="سيظهر البرومت المولد هنا للتعديل..."
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(editablePrompt);
                        toast.success("تم نسخ البرومت!");
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-200"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([editablePrompt], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `arabic-design-prompt-${Date.now()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast.success("تم تحميل البرومت!");
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-200"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* عرض الترجمة الإنجليزية */}
            {translatedPrompt && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    البرومت المترجم للإنجليزية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={translatedPrompt}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="سيظهر البرومت المترجم هنا..."
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedPrompt);
                        toast.success("تم نسخ البرومت المترجم!");
                      }}
                      variant="outline"
                      size="sm"
                      className="border-green-200"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([translatedPrompt], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `translated-design-prompt-${Date.now()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast.success("تم تحميل البرومت المترجم!");
                      }}
                      variant="outline"
                      size="sm"
                      className="border-green-200"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* عرض الصورة المولدة */}
            {generatedImageBBUrl && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    الصورة المولدة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* عرض الصورة */}
                  <div className="relative rounded-lg overflow-hidden border-2 border-green-200">
                    <img 
                      src={generatedImageBBUrl} 
                      alt="صورة مولدة من برومت التصميم المفصل"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  
                  {/* رابط ImgBB */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">رابط ImgBB</Label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={generatedImageBBUrl} 
                        readOnly 
                        className="flex-1 px-3 py-2 text-sm border border-green-200 rounded-md bg-green-50 font-mono"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedImageBBUrl);
                          toast.success("تم نسخ رابط الصورة!");
                        }}
                        variant="outline"
                        size="sm"
                        className="border-green-200"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => window.open(generatedImageBBUrl, '_blank')}
                        variant="outline"
                        size="sm"
                        className="border-green-200"
                      >
                        فتح في نافذة جديدة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </DialogContent>
      
      {/* نافذة اختيار التبويبات */}
      <PromptGeneratorTabDialog
        isOpen={isTabDialogOpen}
        onClose={() => setIsTabDialogOpen(false)}
        onTabsSelected={handleTabsSelected}
      />
    </Dialog>
  );
};

export default DesignPromptGenerator;
