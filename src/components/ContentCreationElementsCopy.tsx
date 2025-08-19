import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Settings, 
  FileText, 
  Target, 
  Globe, 
  Image, 
  Video,
  Database,
  Wand2,
  Upload,
  Zap,
  Brain,
  Bot,
  Sparkles,
  Layers,
  Palette,
  Type,
  Shapes,
  Monitor,
  Sliders,
  Eye,
  Layout,
  Maximize,
  Search,
  Mic,
  Send,
  Download,
  ChevronDown,
  Brush,
  Frame,
  Grid3x3,
  PenTool,
  Gauge,
  Activity,
  Users,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Clipboard,
  Play,
  Pause,
  Volume2,
  Camera,
  Edit,
  Save,
  Trash,
  Plus,
  RefreshCw,
  Filter,
  Star,
  Heart,
  Share,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ContentCreationElement {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  codeId: string;
  component: string;
  description?: string;
  category: string;
  subCategory?: string;
}

const ContentCreationElementsCopy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  const contentCreationElements: ContentCreationElement[] = [
    // تبويبة لوحة التحكم بالذكاء الاصطناعي
    {
      id: "ai-dashboard",
      label: "لوحة التحكم بالذكاء الاصطناعي",
      icon: Brain,
      codeId: "AIDashboard",
      component: "AIDashboard",
      description: "لوحة التحكم الرئيسية بالذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "اللوحة الرئيسية"
    },
    {
      id: "ai-header",
      label: "رأس الذكاء الاصطناعي",
      icon: Monitor,
      codeId: "AIHeader",
      component: "AIHeader",
      description: "شريط الرأس للذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "عناصر التحكم"
    },
    {
      id: "ai-sidebar",
      label: "الشريط الجانبي للذكاء الاصطناعي",
      icon: Layout,
      codeId: "AISidebar",
      component: "AISidebar",
      description: "الشريط الجانبي لإدارة الذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "التنقل"
    },
    {
      id: "ai-analytics",
      label: "تحليلات الذكاء الاصطناعي",
      icon: BarChart3,
      codeId: "AIAnalytics",
      component: "AIAnalytics",
      description: "تحليلات وإحصائيات الذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "التحليلات"
    },
    {
      id: "neural-background",
      label: "خلفية الشبكة العصبية",
      icon: Activity,
      codeId: "NeuralBackground",
      component: "NeuralBackground",
      description: "خلفية متحركة للشبكة العصبية",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "التأثيرات البصرية"
    },
    {
      id: "gemini-api-status",
      label: "حالة API جيميني",
      icon: Gauge,
      codeId: "GeminiApiStatus",
      component: "GeminiApiStatus",
      description: "عرض حالة API جيميني",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "إدارة API"
    },
    {
      id: "gemini-smart-suggestions",
      label: "اقتراحات جيميني الذكية",
      icon: Sparkles,
      codeId: "GeminiSmartSuggestions",
      component: "GeminiSmartSuggestions",
      description: "الاقتراحات الذكية من جيميني",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "الاقتراحات الذكية"
    },
    {
      id: "gemini-layer-suggestions",
      label: "اقتراحات طبقات جيميني",
      icon: Layers,
      codeId: "GeminiLayerSuggestions",
      component: "GeminiLayerSuggestions",
      description: "اقتراحات الطبقات من جيميني",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "إدارة الطبقات"
    },
    {
      id: "gemini-review-manager",
      label: "مدير مراجعات جيميني",
      icon: Star,
      codeId: "GeminiReviewManager",
      component: "GeminiReviewManager",
      description: "مدير المراجعات والتقييمات من جيميني",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "إدارة المراجعات"
    },
    {
      id: "auto-prompt-generator",
      label: "مولد النصوص التلقائي",
      icon: Bot,
      codeId: "AutoPromptGenerator",
      component: "AutoPromptGenerator",
      description: "مولد النصوص التلقائي بالذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "توليد المحتوى"
    },
    {
      id: "prompt-analyzer",
      label: "محلل النصوص",
      icon: Search,
      codeId: "PromptAnalyzer",
      component: "PromptAnalyzer",
      description: "محلل النصوص والأوامر بالذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "تحليل النصوص"
    },
    {
      id: "prompt-editor",
      label: "محرر النصوص الذكي",
      icon: Edit,
      codeId: "PromptEditor",
      component: "PromptEditor",
      description: "محرر النصوص المدعوم بالذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "تحرير النصوص"
    },
    {
      id: "design-prompt-generator",
      label: "مولد نصوص التصميم",
      icon: Palette,
      codeId: "DesignPromptGenerator",
      component: "DesignPromptGenerator",
      description: "مولد نصوص التصميم بالذكاء الاصطناعي",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "تصميم ذكي"
    },
    {
      id: "context-image-type-generator",
      label: "مولد نوع الصورة حسب السياق",
      icon: Image,
      codeId: "ContextImageTypeGenerator",
      component: "ContextImageTypeGenerator",
      description: "مولد نوع الصورة حسب السياق",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "معالجة الصور"
    },
    {
      id: "infographic-analyzer",
      label: "محلل الرسوم البيانية",
      icon: BarChart3,
      codeId: "InfographicAnalyzer",
      component: "InfographicAnalyzer",
      description: "محلل الرسوم البيانية والمعلومات المرئية",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "تحليل البيانات"
    },
    {
      id: "text-extractor",
      label: "مستخرج النصوص",
      icon: Type,
      codeId: "TextExtractor",
      component: "TextExtractor",
      description: "مستخرج النصوص من الصور",
      category: "لوحة الذكاء الاصطناعي",
      subCategory: "استخراج النصوص"
    },
    // تبويبة إنشاء المحتوى
    {
      id: "content-generator",
      label: "مولد المحتوى",
      icon: Wand2,
      codeId: "ContentGenerator",
      component: "ContentGenerator",
      description: "المولد الرئيسي للمحتوى",
      category: "إنشاء المحتوى",
      subCategory: "المولد الأساسي"
    },
    {
      id: "content-canvas",
      label: "لوحة المحتوى",
      icon: Layout,
      codeId: "ContentCanvas",
      component: "ContentCanvas",
      description: "لوحة العمل الرئيسية لإنشاء المحتوى",
      category: "إنشاء المحتوى",
      subCategory: "لوحة العمل"
    },
    {
      id: "prompt-editor",
      label: "محرر النصوص والأوامر",
      icon: Edit,
      codeId: "PromptEditor",
      component: "PromptEditor",
      description: "تحرير النصوص والتوجيهات",
      category: "إنشاء المحتوى",
      subCategory: "التحرير"
    },
    {
      id: "global-content-canvas",
      label: "لوحة المحتوى العامة",
      icon: Grid3x3,
      codeId: "GlobalContentCanvas",
      component: "GlobalContentCanvas",
      description: "لوحة المحتوى الشاملة لجميع العناصر",
      category: "إنشاء المحتوى",
      subCategory: "لوحة شاملة"
    },

    // تبويبة إعدادات التصميم
    {
      id: "color-customizer",
      label: "مخصص الألوان",
      icon: Palette,
      codeId: "ColorCustomizer",
      component: "ColorCustomizer",
      description: "تخصيص ألوان التصميم",
      category: "إعدادات التصميم",
      subCategory: "الألوان"
    },
    {
      id: "background-controls",
      label: "التحكم في الخلفية والصور",
      icon: Image,
      codeId: "BackgroundAndImageController",
      component: "BackgroundAndImageController",
      description: "التحكم في الخلفيات والصور",
      category: "إعدادات التصميم",
      subCategory: "الخلفيات"
    },
    {
      id: "advanced-shape-controller",
      label: "التحكم المتقدم في الأشكال",
      icon: Shapes,
      codeId: "AdvancedShapeController",
      component: "AdvancedShapeController",
      description: "التحكم المتقدم في الأشكال والعناصر",
      category: "إعدادات التصميم",
      subCategory: "الأشكال"
    },
    {
      id: "background-effects-controller",
      label: "مؤثرات الخلفية",
      icon: Sparkles,
      codeId: "BackgroundEffectsController",
      component: "BackgroundEffectsController",
      description: "إضافة مؤثرات للخلفية",
      category: "إعدادات التصميم",
      subCategory: "المؤثرات"
    },
    {
      id: "shape-controller",
      label: "التحكم في الأشكال",
      icon: PenTool,
      codeId: "ShapeController",
      component: "ShapeController",
      description: "أدوات التحكم الأساسية في الأشكال",
      category: "إعدادات التصميم",
      subCategory: "أشكال أساسية"
    },
    {
      id: "image-controller",
      label: "التحكم في الصور",
      icon: Camera,
      codeId: "ImageController",
      component: "ImageController",
      description: "أدوات التحكم في الصور والمرئيات",
      category: "إعدادات التصميم",
      subCategory: "تحكم الصور"
    },

    // تبويبة النصوص
    {
      id: "text-customizer",
      label: "مخصص النصوص",
      icon: Type,
      codeId: "TextCustomizer",
      component: "TextCustomizer",
      description: "تخصيص النصوص والخطوط",
      category: "النصوص",
      subCategory: "تخصيص النصوص"
    },
    {
      id: "enhanced-text-controller",
      label: "التحكم المحسن في النصوص",
      icon: Type,
      codeId: "EnhancedTextController",
      component: "EnhancedTextController",
      description: "أدوات متقدمة للتحكم في النصوص",
      category: "النصوص",
      subCategory: "تحكم متقدم"
    },
    {
      id: "text-position-controller",
      label: "التحكم في موضع النص",
      icon: PenTool,
      codeId: "TextPositionController",
      component: "TextPositionController",
      description: "تحديد موضع ومكان النصوص",
      category: "النصوص",
      subCategory: "المواضع"
    },
    {
      id: "text-distribution-controller",
      label: "التحكم في توزيع النص",
      icon: Grid3x3,
      codeId: "TextDistributionController",
      component: "TextDistributionController",
      description: "توزيع النصوص في التصميم",
      category: "النصوص",
      subCategory: "التوزيع"
    },
    {
      id: "advanced-text-frame-controls",
      label: "التحكم المتقدم في إطارات النص",
      icon: Frame,
      codeId: "AdvancedTextFrameControls",
      component: "AdvancedTextFrameControls",
      description: "إعدادات متقدمة لإطارات النصوص",
      category: "النصوص",
      subCategory: "الإطارات"
    },
    {
      id: "unified-text-controller",
      label: "وحدة التحكم الموحدة في النص",
      icon: Sliders,
      codeId: "UnifiedTextController",
      component: "UnifiedTextController",
      description: "أداة شاملة للتحكم في النصوص",
      category: "النصوص",
      subCategory: "تحكم موحد"
    },
    {
      id: "enhanced-text-frame-controls",
      label: "التحكم المحسن في إطارات النص",
      icon: Frame,
      codeId: "EnhancedTextFrameControls",
      component: "EnhancedTextFrameControls",
      description: "أدوات محسنة لإطارات النصوص",
      category: "النصوص",
      subCategory: "إطارات محسنة"
    },

    // تبويبة الطبقات
    {
      id: "layer-effects-selector",
      label: "محدد تأثيرات الطبقات",
      icon: Layers,
      codeId: "LayerEffectsSelector",
      component: "LayerEffectsSelector",
      description: "اختيار تأثيرات الطبقات",
      category: "الطبقات",
      subCategory: "التأثيرات"
    },
    {
      id: "advanced-blending-controller",
      label: "التحكم المتقدم في المزج",
      icon: Brush,
      codeId: "AdvancedBlendingController",
      component: "AdvancedBlendingController",
      description: "أدوات متقدمة لمزج الطبقات",
      category: "الطبقات",
      subCategory: "المزج"
    },
    {
      id: "advanced-transparency-controller",
      label: "التحكم المتقدم في الشفافية",
      icon: Eye,
      codeId: "AdvancedTransparencyController",
      component: "AdvancedTransparencyController",
      description: "ضبط شفافية الطبقات",
      category: "الطبقات",
      subCategory: "الشفافية"
    },

    // تبويبة الطبقات المتراكبة
    {
      id: "overlay-controls-panel",
      label: "لوحة التحكم في الطبقات المتراكبة",
      icon: Layers,
      codeId: "OverlayControlsPanel",
      component: "OverlayControlsPanel",
      description: "التحكم في الطبقات المتراكبة",
      category: "الطبقات المتراكبة",
      subCategory: "لوحة التحكم"
    },
    {
      id: "overlay-gradient-controller",
      label: "التحكم في التدرجات المتراكبة",
      icon: Palette,
      codeId: "OverlayGradientController",
      component: "OverlayGradientController",
      description: "إضافة وتحرير التدرجات المتراكبة",
      category: "الطبقات المتراكبة",
      subCategory: "التدرجات"
    },
    {
      id: "overlay-template-gallery",
      label: "معرض قوالب الطبقات المتراكبة",
      icon: Grid3x3,
      codeId: "OverlayTemplateGallery",
      component: "OverlayTemplateGallery",
      description: "مجموعة قوالب جاهزة للطبقات المتراكبة",
      category: "الطبقات المتراكبة",
      subCategory: "المعرض"
    },
    {
      id: "enhanced-overlay-template-manager",
      label: "مدير القوالب المحسن للطبقات المتراكبة",
      icon: Settings,
      codeId: "EnhancedOverlayTemplateManager",
      component: "EnhancedOverlayTemplateManager",
      description: "إدارة متقدمة لقوالب الطبقات المتراكبة",
      category: "الطبقات المتراكبة",
      subCategory: "الإدارة"
    },
    {
      id: "overlay-template-saver",
      label: "حفظ قوالب الطبقات المتراكبة",
      icon: Save,
      codeId: "OverlayTemplateSaver",
      component: "OverlayTemplateSaver",
      description: "حفظ وإدارة قوالب الطبقات المخصصة",
      category: "الطبقات المتراكبة",
      subCategory: "الحفظ"
    },

    // تبويبة المعاينة
    {
      id: "content-preview",
      label: "معاينة المحتوى",
      icon: Monitor,
      codeId: "ContentPreview",
      component: "ContentPreview",
      description: "معاينة التصميم النهائي",
      category: "المعاينة",
      subCategory: "معاينة أساسية"
    },
    {
      id: "social-platform-preview",
      label: "معاينة المنصات الاجتماعية",
      icon: Share,
      codeId: "SocialPlatformPreview",
      component: "SocialPlatformPreview",
      description: "معاينة على منصات التواصل الاجتماعي",
      category: "المعاينة",
      subCategory: "معاينة اجتماعية"
    },
    {
      id: "preview-controls",
      label: "أدوات التحكم في المعاينة",
      icon: Eye,
      codeId: "PreviewControls",
      component: "PreviewControls",
      description: "التحكم في خيارات المعاينة",
      category: "المعاينة",
      subCategory: "أدوات التحكم"
    },
    {
      id: "preview-manager",
      label: "مدير المعاينة",
      icon: Settings,
      codeId: "PreviewManager",
      component: "PreviewManager",
      description: "إدارة إعدادات المعاينة",
      category: "المعاينة",
      subCategory: "الإدارة"
    },
    {
      id: "unified-preview-tabs",
      label: "تبويبات المعاينة الموحدة",
      icon: Monitor,
      codeId: "UnifiedPreviewTabs",
      component: "UnifiedPreviewTabs",
      description: "واجهة موحدة لتبويبات المعاينة",
      category: "المعاينة",
      subCategory: "تبويبات موحدة"
    },

    // تبويبة لوحة الإدارة
    {
      id: "management-controls",
      label: "أدوات الإدارة",
      icon: Settings,
      codeId: "ManagementControls",
      component: "ManagementControls",
      description: "أدوات إدارة التصميم",
      category: "لوحة الإدارة",
      subCategory: "أدوات أساسية"
    },
    {
      id: "reset-controls",
      label: "أدوات إعادة التعيين",
      icon: RefreshCw,
      codeId: "ResetControls",
      component: "ResetControls",
      description: "إعادة تعيين الإعدادات",
      category: "لوحة الإدارة",
      subCategory: "إعادة التعيين"
    },
    {
      id: "space-layout-controller",
      label: "التحكم في تخطيط المساحة",
      icon: Layout,
      codeId: "SpaceLayoutController",
      component: "SpaceLayoutController",
      description: "تنظيم وترتيب مساحة العمل",
      category: "لوحة الإدارة",
      subCategory: "التخطيط"
    },
    {
      id: "admin-tabs-manager",
      label: "مدير تبويبات الإدارة",
      icon: Settings,
      codeId: "AdminTabsManager",
      component: "AdminTabsManager",
      description: "إدارة وتنظيم تبويبات لوحة الإدارة",
      category: "لوحة الإدارة",
      subCategory: "إدارة التبويبات"
    },

    // تبويبة المحتوى الذكي
    {
      id: "auto-prompt-generator",
      label: "مولد التوجيهات التلقائي",
      icon: Bot,
      codeId: "AutoPromptGenerator",
      component: "AutoPromptGenerator",
      description: "توليد أوامر تلقائية ذكية",
      category: "المحتوى الذكي",
      subCategory: "التوليد التلقائي"
    },
    {
      id: "design-prompt-generator",
      label: "مولد أوامر التصميم",
      icon: Palette,
      codeId: "DesignPromptGenerator",
      component: "DesignPromptGenerator",
      description: "توليد أوامر مخصصة للتصميم",
      category: "المحتوى الذكي",
      subCategory: "أوامر التصميم"
    },
    {
      id: "context-image-generator",
      label: "مولد الصور السياقية",
      icon: Image,
      codeId: "ContextImageTypeGenerator",
      component: "ContextImageTypeGenerator",
      description: "توليد صور مناسبة للسياق",
      category: "المحتوى الذكي",
      subCategory: "الصور السياقية"
    },
    {
      id: "prompt-analyzer",
      label: "محلل التوجيهات",
      icon: Brain,
      codeId: "PromptAnalyzer",
      component: "PromptAnalyzer",
      description: "تحليل وتحسين التوجيهات",
      category: "المحتوى الذكي",
      subCategory: "التحليل"
    },

    // تبويبة ميزات الذكاء الاصطناعي
    {
      id: "gemini-smart-suggestions",
      label: "الاقتراحات الذكية",
      icon: Sparkles,
      codeId: "GeminiSmartSuggestions",
      component: "GeminiSmartSuggestions",
      description: "اقتراحات ذكية لتحسين التصميم",
      category: "ميزات الذكاء الاصطناعي",
      subCategory: "الاقتراحات"
    },
    {
      id: "gemini-layer-suggestions",
      label: "اقتراحات الطبقات",
      icon: Layers,
      codeId: "GeminiLayerSuggestions",
      component: "GeminiLayerSuggestions",
      description: "اقتراحات لتحسين ترتيب الطبقات",
      category: "ميزات الذكاء الاصطناعي",
      subCategory: "طبقات ذكية"
    },
    {
      id: "gemini-review-manager",
      label: "مدير المراجعة الذكية",
      icon: Eye,
      codeId: "GeminiReviewManager",
      component: "GeminiReviewManager",
      description: "مراجعة وتقييم ذكي للمحتوى",
      category: "ميزات الذكاء الاصطناعي",
      subCategory: "المراجعة"
    },
    {
      id: "text-extractor",
      label: "مستخرج النصوص من الصور",
      icon: Search,
      codeId: "TextExtractor",
      component: "TextExtractor",
      description: "استخراج النصوص من الصور تلقائياً",
      category: "ميزات الذكاء الاصطناعي",
      subCategory: "استخراج النصوص"
    },
    {
      id: "gemini-api-status",
      label: "حالة الذكاء الاصطناعي",
      icon: Activity,
      codeId: "GeminiApiStatus",
      component: "GeminiApiStatus",
      description: "مراقبة حالة خدمات الذكاء الاصطناعي",
      category: "ميزات الذكاء الاصطناعي",
      subCategory: "المراقبة"
    },

    // تبويبة المحلل
    {
      id: "infographic-analyzer",
      label: "محلل الإنفوجرافيك",
      icon: BarChart3,
      codeId: "InfographicAnalyzer",
      component: "InfographicAnalyzer",
      description: "تحليل ذكي للإنفوجرافيك",
      category: "المحلل",
      subCategory: "تحليل المحتوى"
    },

    // تبويبة الفيديو
    {
      id: "video-uploader",
      label: "رافع الفيديو",
      icon: Video,
      codeId: "VideoUploader",
      component: "VideoUploader",
      description: "رفع ومعالجة الفيديوهات",
      category: "الفيديو",
      subCategory: "رفع الفيديو"
    },
    {
      id: "video-player",
      label: "مشغل الفيديو",
      icon: Play,
      codeId: "VideoPlayer",
      component: "VideoPlayer",
      description: "تشغيل ومعاينة الفيديوهات",
      category: "الفيديو",
      subCategory: "تشغيل الفيديو"
    },
    {
      id: "video-background-text",
      label: "نص خلفية الفيديو",
      icon: Type,
      codeId: "VideoBackgroundText",
      component: "VideoBackgroundText",
      description: "إضافة نصوص على خلفية الفيديو",
      category: "الفيديو",
      subCategory: "نصوص الفيديو"
    },
    {
      id: "video-preview-section",
      label: "قسم معاينة الفيديو",
      icon: Eye,
      codeId: "VideoPreviewSection",
      component: "VideoPreviewSection",
      description: "معاينة وتحرير الفيديو",
      category: "الفيديو",
      subCategory: "معاينة الفيديو"
    },

    // عناصر إضافية
    {
      id: "template-library",
      label: "مكتبة القوالب",
      icon: Grid3x3,
      codeId: "TemplateLibrary",
      component: "TemplateLibrary",
      description: "مجموعة القوالب الجاهزة",
      category: "أدوات إضافية",
      subCategory: "القوالب"
    },
    {
      id: "logo-customizer",
      label: "مخصص الشعارات",
      icon: Star,
      codeId: "LogoCustomizer",
      component: "LogoCustomizer",
      description: "تخصيص وإدارة الشعارات",
      category: "أدوات إضافية",
      subCategory: "الشعارات"
    },
    {
      id: "frame-customizer",
      label: "مخصص الإطارات",
      icon: Frame,
      codeId: "FrameCustomizer",
      component: "FrameCustomizer",
      description: "تخصيص إطارات وحدود المحتوى",
      category: "أدوات إضافية",
      subCategory: "الإطارات"
    },
    {
      id: "unified-customizer",
      label: "المخصص الموحد",
      icon: Sliders,
      codeId: "UnifiedCustomizer",
      component: "UnifiedCustomizer",
      description: "أداة تخصيص شاملة لجميع العناصر",
      category: "أدوات إضافية",
      subCategory: "تخصيص شامل"
    }
  ];

  const categories = ['الكل', ...Array.from(new Set(contentCreationElements.map(el => el.category)))];

  const filteredElements = useMemo(() => {
    return contentCreationElements.filter(element => {
      const matchesSearch = element.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          element.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          element.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || element.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const groupedElements = useMemo(() => {
    const grouped: Record<string, ContentCreationElement[]> = {};
    filteredElements.forEach(element => {
      if (!grouped[element.category]) {
        grouped[element.category] = [];
      }
      grouped[element.category].push(element);
    });
    return grouped;
  }, [filteredElements]);

  const copyToClipboard = (codeId: string, component: string, label: string) => {
    const codeTemplate = `// مكون ${label}
import { ${component} } from "@/components/${component}";

// استخدام المكون
<${component} 
  // إضافة الخصائص المطلوبة هنا
/>

// معرف المكون: ${codeId}`;

    navigator.clipboard.writeText(codeTemplate).then(() => {
      toast.success(`تم نسخ كود ${label} بنجاح!`);
    }).catch(() => {
      toast.error('حدث خطأ في النسخ');
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">نسخ عناصر إنشاء المحتوى</h2>
          <Badge variant="secondary" className="text-sm">
            {filteredElements.length} عنصر
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في العناصر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="organized" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organized">منظم بالفئات</TabsTrigger>
          <TabsTrigger value="grid">شبكة العناصر</TabsTrigger>
        </TabsList>

        <TabsContent value="organized" className="space-y-6">
          {Object.entries(groupedElements).map(([category, elements]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    {category}
                    <Badge variant="outline">{elements.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {elements.map((element) => (
                      <motion.div
                        key={element.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <element.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 truncate">
                                  {element.label}
                                </h4>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                  {element.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => copyToClipboard(element.codeId, element.component, element.label)}
                                    className="h-7 text-xs"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    نسخ
                                  </Button>
                                  {element.subCategory && (
                                    <Badge variant="secondary" className="text-xs">
                                      {element.subCategory}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredElements.map((element) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                        <element.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          {element.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {element.description}
                        </p>
                        <Badge variant="outline" className="text-xs mb-2">
                          {element.category}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(element.codeId, element.component, element.label)}
                        className="w-full h-8 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        نسخ الكود
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredElements.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">لم يتم العثور على نتائج</h3>
          <p className="text-muted-foreground">
            جرب تعديل مصطلح البحث أو اختيار فئة مختلفة
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentCreationElementsCopy;