import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Layers,
  Upload,
  Download,
  Zap,
  Brain,
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Send,
  MessageCircle,
  Facebook,
  Shapes,
  Type,
  Bot,
  Trees,
  FileEdit,
  Eye,
  Sparkles,
  Monitor,
  Palette,
  MousePointer,
  Move,
  Sliders,
  ChevronDown,
  Maximize,
  Square,
  Circle,
  Triangle,
  Star,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Search,
  RefreshCw,
  Save,
  Trash,
  Plus,
  Minus,
  Play,
  Pause,
  Volume2,
  Mic,
  Camera,
  Scissors,
  Clipboard,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Grid,
  List,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Bell,
  Heart,
  ThumbsUp,
  Share,
  Bookmark,
  Flag,
  Shield,
  Lock,
  Unlock,
  Key,
  Building,
  Building2,
  Briefcase,
  HardHat,
  Stethoscope,
  GraduationCap,
  BookOpen,
  Book,
  PenTool,
  Pencil,
  Eraser,
  Ruler,
  Paperclip,
  Pin,
  Timer,
  AlarmClock,
  TreePine,
  Apple,
  Cherry,
  Grape,
  Pizza,
  Coffee,
  Cookie,
  IceCream,
  Gift,
  ShoppingCart,
  CreditCard,
  Calculator,
  PieChart,
  LineChart,
  Activity,
  Gauge,
  Award,
  Trophy,
  Medal,
  Crown,
  Diamond,
  Gem,
  Coins,
  DollarSign,
  Euro,
  PoundSterling,
  Percent,
  Infinity,
  AtSign,
  Info,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  XCircle,
  PlusCircle,
  MinusCircle,
  PlayCircle,
  StopCircle,
  PauseCircle,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Headphones,
  Speaker,
  Radio,
  Tv,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  Gamepad2,
  Keyboard,
  Mouse,
  Printer,
  HardDrive,
  Cpu,
  Router,
  Server,
  CloudDownload,
  CloudUpload,
  Cloud,
  Archive,
  Package,
  Box,
  Container,
  Truck,
  Car,
  Bike,
  Bus,
  Train,
  Plane,
  Ship,
  Rocket,
  Satellite,
  Globe2,
  Map,
  Navigation,
  Compass,
  Route,
  Factory,
  Store,
  Hospital,
  School,
  Church,
  Hotel,
  ShoppingBag,
  Weight,
  Dumbbell,
  Gamepad,
  Puzzle,
  Glasses,
  Shirt,
  Backpack,
  Luggage,
  Bandage,
  Pill,
  Syringe,
  HeartPulse,
  Bone,
  Ear,
  Hand,
  Baby,
  Users2,
  Earth,
  Sun,
  Moon,
  Telescope,
  Microscope,
  Atom,
  Dna,
  Beaker,
  TestTube,
  Magnet,
  Droplets,
  Flame,
  Film,
  Frame,
  Brush,
  Pen,
  Inbox,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layout,
  Pipette,
  Contrast,
  Package2,
  Boxes,
  Grid3x3,
  Columns,
  Rows,
  Table,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Menu,
  Sidebar,
  Text,
  Quote,
  Code,
  Terminal,
  Touchpad,
  ZoomIn,
  ZoomOut,
  Focus,
  Airplay,
  Cast,
  Share2,
  Unlink,
  Anchor,
  Tag,
  Tags,
  ThumbsDown,
  CheckSquare,
  Hexagon,
  Octagon,
  Pentagon,
  Strikethrough,
  Superscript,
  Subscript,
  AlignJustify,
  Indent,
  Outdent,
  RotateCcw,
  Scale,
  Edit,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ContentElement {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  codeId: string;
  component: string;
  description?: string;
  category: string;
  subCategory?: string;
}

const ContentElementsCopyButtons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const contentElements: ContentElement[] = [
    // إعدادات المحتوى الأساسية
    {
      id: "content-settings",
      label: "إعدادات المحتوى",
      icon: Settings,
      codeId: "ContentSettings",
      component: "ContentSettings",
      description: "التحكم في خصائص وإعدادات المحتوى الأساسية",
      category: "إعدادات أساسية"
    },
    {
      id: "content-type",
      label: "نوع المحتوى",
      icon: FileText,
      codeId: "ContentTypeSelector",
      component: "ContentTypeSelector",
      description: "اختيار نوع المحتوى المراد إنشاؤه (مقال، منشور، إعلان)",
      category: "إعدادات أساسية"
    },
    {
      id: "specialization",
      label: "التخصص أو المجال",
      icon: Target,
      codeId: "SpecializationSelector",
      component: "SpecializationSelector",
      description: "تحديد مجال التخصص أو الموضوع للمحتوى",
      category: "إعدادات أساسية"
    },
    {
      id: "language",
      label: "اللغة",
      icon: Globe,
      codeId: "LanguageSelector",
      component: "LanguageSelector",
      description: "اختيار لغة المحتوى (عربية، إنجليزية، فرنسية)",
      category: "إعدادات أساسية"
    },

    // إعدادات الصور والمرئيات
    {
      id: "image-style",
      label: "نمط الصورة",
      icon: Image,
      codeId: "ImageStyleSelector",
      component: "ImageStyleSelector",
      description: "تحديد نمط وشكل الصور (واقعي، كرتوني، فني)",
      category: "إعدادات المرئيات"
    },
    {
      id: "visual-content-type",
      label: "نوع المحتوى المرئي",
      icon: Video,
      codeId: "VisualContentTypeSelector",
      component: "VisualContentTypeSelector",
      description: "اختيار نوع المحتوى البصري (فيديو، صورة، انفوجرافيك)",
      category: "إعدادات المرئيات"
    },
    {
      id: "image-source",
      label: "مصدر الصور",
      icon: Database,
      codeId: "ImageSourceSelector",
      component: "ImageSourceSelector",
      description: "تحديد مصدر الصور (Pixabay، Unsplash، مخصص)",
      category: "إعدادات المرئيات"
    },
    {
      id: "image-dimensions",
      label: "أبعاد الصورة",
      icon: Maximize,
      codeId: "ImageDimensionsSelector",
      component: "ImageDimensionsSelector",
      description: "تحديد أبعاد ونسبة الصورة (مربعة، مستطيلة، بورتريه)",
      category: "إعدادات المرئيات"
    },

    // أزرار التحكم والعمليات
    {
      id: "generate-content",
      label: "توليد المحتوى",
      icon: Zap,
      codeId: "GenerateContentButton",
      component: "GenerateContentButton",
      description: "زر إنشاء وتوليد المحتوى بناءً على الإعدادات",
      category: "أزرار التحكم"
    },
    {
      id: "generate-design-proof",
      label: "توليد بروف تصميم معتدل",
      icon: Wand2,
      codeId: "GenerateDesignProofButton",
      component: "GenerateDesignProofButton",
      description: "زر إنشاء تصميم تجريبي ومعتدل للمحتوى",
      category: "أزرار التحكم"
    },
    {
      id: "upload-image",
      label: "رفع الصورة نهائياً",
      icon: Upload,
      codeId: "UploadImageButton",
      component: "UploadImageButton",
      description: "زر رفع وحفظ الصورة النهائية",
      category: "أزرار التحكم"
    },

    // تبويبات الواجهة الرئيسية
    {
      id: "dashboard-tab",
      label: "لوحة التحكم",
      icon: BarChart3,
      codeId: "DashboardTab",
      component: "DashboardTab",
      description: "تبويب لوحة التحكم الرئيسية والإحصائيات",
      category: "تبويبات رئيسية"
    },
    {
      id: "content-creation-tab",
      label: "المحتوى",
      icon: MessageSquare,
      codeId: "ContentCreationTab",
      component: "ContentCreationTab",
      description: "تبويب إنشاء وتحرير المحتوى",
      category: "تبويبات رئيسية"
    },
    {
      id: "management-tab",
      label: "الإدارة",
      icon: FileEdit,
      codeId: "ManagementTab",
      component: "ManagementTab",
      description: "تبويب الإعدادات والإدارة المتقدمة",
      category: "تبويبات رئيسية"
    },
    {
      id: "video-tab",
      label: "فيديو",
      icon: Video,
      codeId: "VideoTab",
      component: "VideoTab",
      description: "تبويب رفع ومعالجة الفيديو",
      category: "تبويبات رئيسية"
    },
    {
      id: "publishing-tab",
      label: "النشر",
      icon: Send,
      codeId: "PublishingTab",
      component: "PublishingTab",
      description: "تبويب النشر والجدولة على المنصات",
      category: "تبويبات رئيسية"
    },
    {
      id: "trees-tab",
      label: "الأشجار",
      icon: Trees,
      codeId: "TreesTab",
      component: "TreesTab",
      description: "تبويب إدارة الهياكل والتصنيفات",
      category: "تبويبات رئيسية"
    },

    // أدوات الذكاء الاصطناعي
    {
      id: "smart-content-tab",
      label: "المحتوى الذكي",
      icon: Bot,
      codeId: "SmartContentTab",
      component: "SmartContentTab",
      description: "محتوى مُولد بالذكاء الاصطناعي",
      category: "ذكاء اصطناعي"
    },
    {
      id: "ai-tools-tab",
      label: "الذكاء الاصطناعي",
      icon: Brain,
      codeId: "AIToolsTab",
      component: "AIToolsTab",
      description: "أدوات التحليل الذكي والاقتراحات",
      category: "ذكاء اصطناعي"
    },
    {
      id: "ai-enhancements",
      label: "تحسينات الذكاء الاصطناعي",
      icon: Sparkles,
      codeId: "AIEnhancementsPanel",
      component: "AIEnhancementsPanel",
      description: "أدوات تحسين المحتوى بالذكاء الاصطناعي",
      category: "ذكاء اصطناعي"
    },

    // تبويبات فيسبوك
    {
      id: "facebook-publishing",
      label: "نشر فيسبوك",
      icon: Send,
      codeId: "FacebookPublishingTab",
      component: "FacebookPublishingTab",
      description: "النشر والجدولة على فيسبوك",
      category: "فيسبوك"
    },
    {
      id: "facebook-interaction",
      label: "تفاعل فيسبوك",
      icon: MessageCircle,
      codeId: "FacebookInteractionTab",
      component: "FacebookInteractionTab",
      description: "إدارة التعليقات والرسائل على فيسبوك",
      category: "فيسبوك"
    },
    {
      id: "facebook-analytics",
      label: "تحليلات فيسبوك",
      icon: TrendingUp,
      codeId: "FacebookAnalyticsTab",
      component: "FacebookAnalyticsTab",
      description: "تحليلات وبيانات حقيقية من فيسبوك",
      category: "فيسبوك"
    },
    {
      id: "facebook-settings",
      label: "إعدادات فيسبوك",
      icon: Facebook,
      codeId: "FacebookSettingsTab",
      component: "FacebookSettingsTab",
      description: "إعدادات الاتصال والتفضيلات لفيسبوك",
      category: "فيسبوك"
    },

    // التحليلات والإحصائيات
    {
      id: "general-analytics",
      label: "التحليلات العامة",
      icon: Users,
      codeId: "GeneralAnalyticsTab",
      component: "GeneralAnalyticsTab",
      description: "تحليلات مدعومة بالذكاء الاصطناعي",
      category: "تحليلات"
    },

    // أدوات التصميم والتحرير
    {
      id: "layer-effects",
      label: "تأثيرات الطبقات",
      icon: Layers,
      codeId: "LayerEffectsController",
      component: "LayerEffectsController",
      description: "التحكم في تأثيرات وطبقات التصميم",
      category: "أدوات التصميم"
    },
    {
      id: "text-tools",
      label: "أدوات النص",
      icon: Type,
      codeId: "TextToolsPanel",
      component: "TextToolsPanel",
      description: "أدوات تحرير وتنسيق النصوص",
      category: "أدوات التصميم"
    },
    {
      id: "shape-tools",
      label: "أدوات الأشكال",
      icon: Shapes,
      codeId: "ShapeToolsPanel",
      component: "ShapeToolsPanel",
      description: "إضافة وتحرير الأشكال الهندسية",
      category: "أدوات التصميم"
    },
    {
      id: "color-tools",
      label: "أدوات الألوان",
      icon: Palette,
      codeId: "ColorToolsPanel",
      component: "ColorToolsPanel",
      description: "التحكم في الألوان والتدرجات",
      category: "أدوات التصميم"
    },

    // عناصر التحكم في المعاينة
    {
      id: "preview-controls",
      label: "عناصر التحكم في المعاينة",
      icon: Eye,
      codeId: "PreviewControlsPanel",
      component: "PreviewControlsPanel",
      description: "أدوات التحكم في عرض ومعاينة المحتوى",
      category: "معاينة وتحكم"
    },
    {
      id: "zoom-controls",
      label: "عناصر التحكم في التكبير",
      icon: ZoomIn,
      codeId: "ZoomControlsPanel",
      component: "ZoomControlsPanel",
      description: "أدوات التكبير والتصغير في المعاينة",
      category: "معاينة وتحكم"
    },
    {
      id: "navigation-controls",
      label: "عناصر التحكم في التنقل",
      icon: Navigation,
      codeId: "NavigationControlsPanel",
      component: "NavigationControlsPanel",
      description: "أدوات التنقل بين الصفحات والأقسام",
      category: "معاينة وتحكم"
    },

    // أدوات متقدمة
    {
      id: "export-tools",
      label: "أدوات التصدير",
      icon: Download,
      codeId: "ExportToolsPanel",
      component: "ExportToolsPanel",
      description: "تصدير المحتوى بصيغ مختلفة",
      category: "أدوات متقدمة"
    },
    {
      id: "import-tools",
      label: "أدوات الاستيراد",
      icon: Upload,
      codeId: "ImportToolsPanel",
      component: "ImportToolsPanel",
      description: "استيراد المحتوى من مصادر خارجية",
      category: "أدوات متقدمة"
    },
    {
      id: "backup-tools",
      label: "أدوات النسخ الاحتياطي",
      icon: Archive,
      codeId: "BackupToolsPanel",
      component: "BackupToolsPanel",
      description: "إنشاء وإدارة النسخ الاحتياطية",
      category: "أدوات متقدمة"
    },

    // إعدادات المستخدم
    {
      id: "user-preferences",
      label: "تفضيلات المستخدم",
      icon: User,
      codeId: "UserPreferencesPanel",
      component: "UserPreferencesPanel",
      description: "إعدادات وتفضيلات المستخدم الشخصية",
      category: "إعدادات المستخدم"
    },
    {
      id: "theme-settings",
      label: "إعدادات السمة",
      icon: Palette,
      codeId: "ThemeSettingsPanel",
      component: "ThemeSettingsPanel",
      description: "تخصيص المظهر والسمة",
      category: "إعدادات المستخدم"
    },
    {
      id: "language-settings",
      label: "إعدادات اللغة",
      icon: Globe,
      codeId: "LanguageSettingsPanel",
      component: "LanguageSettingsPanel",
      description: "تغيير لغة الواجهة والمحتوى",
      category: "إعدادات المستخدم"
    },

    // أدوات المساعدة والدعم
    {
      id: "help-center",
      label: "مركز المساعدة",
      icon: HelpCircle,
      codeId: "HelpCenterPanel",
      component: "HelpCenterPanel",
      description: "دليل المستخدم والمساعدة",
      category: "مساعدة ودعم"
    },
    {
      id: "tutorials",
      label: "دروس تعليمية",
      icon: BookOpen,
      codeId: "TutorialsPanel",
      component: "TutorialsPanel",
      description: "دروس تفاعلية لتعلم استخدام التطبيق",
      category: "مساعدة ودعم"
    },
    {
      id: "support-center",
      label: "مركز الدعم",
      icon: HeartPulse,
      codeId: "SupportCenterPanel",
      component: "SupportCenterPanel",
      description: "التواصل مع فريق الدعم الفني",
      category: "مساعدة ودعم"
    },

    // عناصر الأمان والخصوصية
    {
      id: "security-settings",
      label: "إعدادات الأمان",
      icon: Shield,
      codeId: "SecuritySettingsPanel",
      component: "SecuritySettingsPanel",
      description: "إدارة كلمات المرور والأمان",
      category: "أمان وخصوصية"
    },
    {
      id: "privacy-settings",
      label: "إعدادات الخصوصية",
      icon: Lock,
      codeId: "PrivacySettingsPanel",
      component: "PrivacySettingsPanel",
      description: "التحكم في مشاركة البيانات والخصوصية",
      category: "أمان وخصوصية"
    },

    // أدوات الإشعارات والتواصل
    {
      id: "notifications",
      label: "الإشعارات",
      icon: Bell,
      codeId: "NotificationsPanel",
      component: "NotificationsPanel",
      description: "إدارة وتخصيص الإشعارات",
      category: "إشعارات وتواصل"
    },
    {
      id: "messaging",
      label: "المراسلة",
      icon: Mail,
      codeId: "MessagingPanel",
      component: "MessagingPanel",
      description: "نظام المراسلة الداخلية",
      category: "إشعارات وتواصل"
    },

    // أدوات التقييم والتحسين
    {
      id: "performance-analytics",
      label: "تحليلات الأداء",
      icon: Activity,
      codeId: "PerformanceAnalyticsPanel",
      component: "PerformanceAnalyticsPanel",
      description: "قياس وتحليل أداء المحتوى",
      category: "تقييم وتحسين"
    },
    {
      id: "optimization-tools",
      label: "أدوات التحسين",
      icon: TrendingUp,
      codeId: "OptimizationToolsPanel",
      component: "OptimizationToolsPanel",
      description: "أدوات تحسين المحتوى والأداء",
      category: "تقييم وتحسين"
    },

    // التبويبات الظاهرة في الصورة
    {
      id: "analyzer-tab",
      label: "المحلل",
      icon: Search,
      codeId: "AnalyzerTab",
      component: "AnalyzerTab",
      description: "تبويب تحليل المحتوى والصور",
      category: "تبويبات فرعية"
    },

    // مكونات وأزرار AnalyzerTab
    {
      id: "infographic-analyzer",
      label: "محلل الإنفوجرافيك",
      icon: Brain,
      codeId: "InfographicAnalyzer",
      component: "InfographicAnalyzer",
      description: "مكون تحليل الإنفوجرافيك والصور",
      category: "مكونات AnalyzerTab"
    },
    {
      id: "search-infographics-button",
      label: "زر البحث عن الإنفوجرافيك",
      icon: Search,
      codeId: "searchInfographics",
      component: "searchInfographicsButton",
      description: "زر البحث في الإنفوجرافيك باستخدام Serper API",
      category: "أزرار AnalyzerTab"
    },
    {
      id: "unsplash-templates-button",
      label: "زر قوالب Unsplash",
      icon: Download,
      codeId: "getUnsplashTemplates",
      component: "getUnsplashTemplatesButton",
      description: "زر جلب قوالب الإنفوجرافيك من Unsplash",
      category: "أزرار AnalyzerTab"
    },
    {
      id: "analyze-infographic-button",
      label: "زر تحليل الإنفوجرافيك",
      icon: Brain,
      codeId: "analyzeInfographic",
      component: "analyzeInfographicButton",
      description: "زر تحليل الإنفوجرافيك باستخدام Gemini Vision",
      category: "أزرار AnalyzerTab"
    },
    {
      id: "generate-image-button",
      label: "زر توليد الصورة",
      icon: Wand2,
      codeId: "generateImageFromPrompt",
      component: "generateImageButton",
      description: "زر توليد صورة من النص باستخدام AI",
      category: "أزرار AnalyzerTab"
    },
    {
      id: "use-template-button",
      label: "زر استخدام القالب",
      icon: Copy,
      codeId: "onUseTemplate",
      component: "useTemplateButton",
      description: "زر استخدام القالب المحلل في المحتوى",
      category: "أزرار AnalyzerTab"
    },
    {
      id: "search-query-input",
      label: "مدخل البحث",
      icon: FileText,
      codeId: "searchQuery",
      component: "searchQueryInput",
      description: "حقل إدخال كلمات البحث للإنفوجرافيك",
      category: "عناصر إدخال AnalyzerTab"
    },
    {
      id: "image-prompt-input",
      label: "مدخل برومت الصورة",
      icon: Edit,
      codeId: "imagePrompt",
      component: "imagePromptInput",
      description: "حقل إدخال برومت توليد الصورة",
      category: "عناصر إدخال AnalyzerTab"
    },
    {
      id: "manual-prompt-input",
      label: "مدخل البرومت اليدوي",
      icon: PenTool,
      codeId: "manualPrompt",
      component: "manualPromptInput",
      description: "حقل إدخال البرومت اليدوي للصورة",
      category: "عناصر إدخال AnalyzerTab"
    },
    {
      id: "input-text-area",
      label: "منطقة النص",
      icon: Text,
      codeId: "inputText",
      component: "inputTextArea",
      description: "منطقة إدخال النص لتوليد البرومت",
      category: "عناصر إدخال AnalyzerTab"
    },
    {
      id: "topic-input",
      label: "مدخل الموضوع",
      icon: Target,
      codeId: "topic",
      component: "topicInput",
      description: "حقل إدخال موضوع التصميم المتقدم",
      category: "عناصر إدخال AnalyzerTab"
    },
    {
      id: "image-source-selector",
      label: "محدد مصدر الصورة",
      icon: Database,
      codeId: "imageSource",
      component: "imageSourceSelector",
      description: "اختيار مصدر توليد الصورة (search, unsplash, imgn)",
      category: "محددات AnalyzerTab"
    },
    {
      id: "prompt-source-selector",
      label: "محدد مصدر البرومت",
      icon: Settings,
      codeId: "promptSource",
      component: "promptSourceSelector",
      description: "اختيار مصدر البرومت (auto, manual, edit, advanced)",
      category: "محددات AnalyzerTab"
    },
    {
      id: "api-key-dialog",
      label: "حوار مفتاح API",
      icon: Key,
      codeId: "showApiKeyDialog",
      component: "apiKeyDialog",
      description: "حوار إدخال مفتاح API للخدمات الخارجية",
      category: "حوارات AnalyzerTab"
    },
    {
      id: "serper-api-integration",
      label: "تكامل Serper API",
      icon: Globe,
      codeId: "SERPER_API_KEY",
      component: "serperApiIntegration",
      description: "تكامل مع Serper API للبحث في الصور",
      category: "تكاملات AnalyzerTab"
    },
    {
      id: "unsplash-api-integration",
      label: "تكامل Unsplash API",
      icon: Image,
      codeId: "unsplashApiIntegration",
      component: "unsplashApiIntegration",
      description: "تكامل مع Unsplash API للحصول على القوالب",
      category: "تكاملات AnalyzerTab"
    },
    {
      id: "gemini-vision-integration",
      label: "تكامل Gemini Vision",
      icon: Eye,
      codeId: "geminiVisionIntegration",
      component: "geminiVisionIntegration",
      description: "تكامل مع Gemini Vision لتحليل الصور",
      category: "تكاملات AnalyzerTab"
    },
    {
      id: "prompt-editor-component",
      label: "محرر البرومت",
      icon: Code,
      codeId: "PromptEditor",
      component: "PromptEditor",
      description: "مكون محرر البرومت المتقدم",
      category: "مكونات AnalyzerTab"
    },
    {
      id: "infographic-results-grid",
      label: "شبكة نتائج الإنفوجرافيك",
      icon: Grid,
      codeId: "infographicResultsGrid",
      component: "infographicResultsGrid",
      description: "شبكة عرض نتائج البحث والتحليل",
      category: "عناصر العرض AnalyzerTab"
    },
    {
      id: "image-analysis-card",
      label: "بطاقة تحليل الصورة",
      icon: BarChart3,
      codeId: "imageAnalysisCard",
      component: "imageAnalysisCard",
      description: "بطاقة عرض تحليل الصورة والمحتوى المقترح",
      category: "عناصر العرض AnalyzerTab"
    },
    {
      id: "loading-states",
      label: "حالات التحميل",
      icon: Loader2,
      codeId: "loadingStates",
      component: "loadingStates",
      description: "حالات التحميل (البحث، التحليل، التوليد)",
      category: "حالات AnalyzerTab"
    },
    {
      id: "error-handling",
      label: "معالجة الأخطاء",
      icon: AlertTriangle,
      codeId: "errorHandling",
      component: "errorHandling",
      description: "معالجة الأخطاء وعرض الرسائل التوضيحية",
      category: "معالجة AnalyzerTab"
    },

    {
      id: "content-tab",
      label: "المحتوى",
      icon: FileText,
      codeId: "ContentTab",
      component: "ContentTab",
      description: "تبويب عرض وتحرير المحتوى",
      category: "تبويبات فرعية"
    },
    {
      id: "content-tab",
      label: "المحتوى",
      icon: FileText,
      codeId: "ContentTab",
      component: "ContentTab",
      description: "تبويب عرض وتحرير المحتوى",
      category: "تبويبات فرعية"
    },
    {
      id: "logo-tab",
      label: "الشعار",
      icon: Award,
      codeId: "LogoTab",
      component: "LogoTab",
      description: "تبويب إنشاء وتحرير الشعارات",
      category: "تبويبات فرعية"
    },
    {
      id: "poetry-tab",
      label: "الشعر",
      icon: Quote,
      codeId: "PoetryTab",
      component: "PoetryTab",
      description: "تبويب إنشاء وتحرير الشعر",
      category: "تبويبات فرعية"
    },

    // عناصر المعاينة
    {
      id: "content-preview",
      label: "معاينة المحتوى",
      icon: Monitor,
      codeId: "ContentPreview",
      component: "ContentPreview",
      description: "عنصر معاينة المحتوى المُولد",
      category: "عناصر المعاينة"
    },
    {
      id: "image-preview",
      label: "معاينة الصورة",
      icon: Image,
      codeId: "ImagePreview",
      component: "ImagePreview",
      description: "عنصر معاينة الصور والتصاميم",
      category: "عناصر المعاينة"
    },
    {
      id: "social-preview",
      label: "معاينة المنصات الاجتماعية",
      icon: Share2,
      codeId: "SocialPlatformPreview",
      component: "SocialPlatformPreview",
      description: "معاينة المحتوى على المنصات الاجتماعية",
      category: "عناصر المعاينة"
    },
    {
      id: "live-preview",
      label: "المعاينة المباشرة",
      icon: Eye,
      codeId: "LivePreview",
      component: "LivePreview",
      description: "معاينة مباشرة للتغييرات",
      category: "عناصر المعاينة"
    },
    {
      id: "preview-tabs",
      label: "تبويبات المعاينة",
      icon: Layout,
      codeId: "PreviewTabs",
      component: "PreviewTabs",
      description: "تبويبات متعددة للمعاينة",
      category: "عناصر المعاينة"
    },

    // أزرار تحكم المعاينة الموحدة
    {
      id: "unified-preview-controls",
      label: "عناصر تحكم المعاينة الموحدة",
      icon: Sliders,
      codeId: "UnifiedPreviewControls",
      component: "UnifiedPreviewControls",
      description: "عناصر تحكم شاملة للمعاينة",
      category: "تحكم متقدم"
    },
    {
      id: "canvas-controls",
      label: "عناصر تحكم اللوحة",
      icon: Frame,
      codeId: "CanvasControls",
      component: "CanvasControls",
      description: "أدوات التحكم في لوحة الرسم",
      category: "تحكم متقدم"
    },

    // نسخ العناصر
    {
      id: "copy-elements",
      label: "نسخ العناصر",
      icon: Copy,
      codeId: "CopyElementsPanel",
      component: "CopyElementsPanel",
      description: "أزرار نسخ معلومات جميع عناصر الواجهة",
      category: "أدوات النسخ"
    }
  ];

  const handleCopyElementInfo = (element: ContentElement) => {
    // أمثلة حقيقية من الكود
    const codeExamples = {
      'Settings': `import { Settings } from 'lucide-react';

// استخدام في المكون
<Settings className="h-4 w-4" />

// أو في زر الإعدادات
<Button variant="ghost">
  <Settings className="h-5 w-5 mr-2" />
  الإعدادات
</Button>`,
      
      'FileText': `import { FileText } from 'lucide-react';

// في بطاقة المحتوى
<div className="flex items-center gap-2">
  <FileText className="h-5 w-5 text-blue-600" />
  <span>نوع المحتوى</span>
</div>`,
      
      'Search': `import { Search } from 'lucide-react';

// في حقل البحث
<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
  <Input 
    className="pl-10" 
    placeholder="البحث..."
  />
</div>`,
      
      'Brain': `import { Brain } from 'lucide-react';

// في أدوات الذكاء الاصطناعي
<Card>
  <CardHeader>
    <Brain className="h-6 w-6 text-purple-600" />
    <CardTitle>تحليل ذكي</CardTitle>
  </CardHeader>
</Card>`,
      
      'Copy': `import { Copy } from 'lucide-react';

// زر النسخ مع التأثيرات
<Button 
  onClick={() => navigator.clipboard.writeText(text)}
  className="hover:bg-blue-50"
>
  <Copy className="h-4 w-4" />
</Button>`
    };

    const getCodeExample = (codeId: string) => {
      // البحث عن مثال مطابق أو مشابه
      if (codeExamples[codeId as keyof typeof codeExamples]) {
        return codeExamples[codeId as keyof typeof codeExamples];
      }
      
      // إنشاء مثال ديناميكي بناءً على النوع
      if (codeId.includes('Button')) {
        return `import { ${element.codeId} } from '@/components/ui/button';

// استخدام ${element.label}
<${element.codeId} 
  onClick={() => console.log('${element.label} clicked')}
  className="bg-primary text-white"
>
  ${element.label}
</${element.codeId}>`;
      }
      
      if (codeId.includes('Tab')) {
        return `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// تبويب ${element.label}
<TabsTrigger value="${element.id}">
  <${element.icon.name || 'Icon'} className="h-4 w-4 mr-2" />
  ${element.label}
</TabsTrigger>`;
      }
      
      if (codeId.includes('Panel') || codeId.includes('Controls')) {
        return `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ${element.label}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <${element.icon.name || 'Icon'} className="h-5 w-5" />
      ${element.label}
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* محتوى ${element.label} */}
  </CardContent>
</Card>`;
      }
      
      // مثال افتراضي
      return `import { ${element.codeId} } from '@/components/${element.component}';

// استخدام ${element.label}
<${element.codeId} 
  className="w-full"
  // خصائص إضافية حسب الحاجة
/>`;
    };

    const infoText = `🔧 رمزه في الكود: ${element.codeId}
📦 المكون: ${element.component}
📝 الوصف: ${element.description || 'غير محدد'}
🏷️ الفئة: ${element.category}

💻 مثال من الكود:
${getCodeExample(element.codeId)}

📋 استخدام سريع:
import { ${element.icon.name || 'Icon'} } from 'lucide-react';
<${element.icon.name || 'Icon'} className="h-4 w-4" />`;

    navigator.clipboard.writeText(infoText).then(() => {
      toast.success(`تم نسخ معلومات "${element.label}" مع مثال الكود بنجاح`);
    }).catch(() => {
      toast.error("فشل في نسخ المعلومات");
    });
  };

  // خوارزمية البحث الذكية مع الاقتراحات
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return {
        exactMatches: [],
        suggestions: [],
        allElements: contentElements
      };
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const exactMatches: ContentElement[] = [];
    const suggestions: ContentElement[] = [];

    contentElements.forEach(element => {
      const labelMatch = element.label.toLowerCase().includes(searchTermLower);
      const descriptionMatch = element.description?.toLowerCase().includes(searchTermLower);
      const categoryMatch = element.category.toLowerCase().includes(searchTermLower);
      const codeIdMatch = element.codeId.toLowerCase().includes(searchTermLower);

      if (labelMatch || descriptionMatch || categoryMatch || codeIdMatch) {
        if (labelMatch && element.label.toLowerCase() === searchTermLower) {
          exactMatches.unshift(element); // إضافة المطابقة التامة في المقدمة
        } else if (labelMatch) {
          exactMatches.push(element);
        } else {
          suggestions.push(element);
        }
      }
    });

    return {
      exactMatches,
      suggestions: suggestions.slice(0, 6), // أقصى 6 اقتراحات
      allElements: exactMatches.length > 0 || suggestions.length > 0 ? 
        [...exactMatches, ...suggestions.slice(0, 6)] : []
    };
  }, [searchTerm, contentElements]);

  const groupedElements = useMemo(() => {
    const elementsToGroup = searchTerm.trim() ? searchResults.allElements : contentElements;
    return elementsToGroup.reduce((acc, element) => {
      if (!acc[element.category]) {
        acc[element.category] = [];
      }
      acc[element.category].push(element);
      return acc;
    }, {} as Record<string, ContentElement[]>);
  }, [searchTerm, searchResults, contentElements]);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center justify-center gap-2">
              <Copy className="h-6 w-6" />
              📋 أزرار نسخ عناصر إنشاء المحتوى
            </CardTitle>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">
              جميع العناصر والأزرار والتبويبات الفرعية الخاصة بتبويبة إنشاء المحتوى
            </p>
            
            {/* شريط البحث الذكي */}
            <div className="relative mt-6 max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن العناصر (مثل: زر، تبويب، إعدادات، ذكاء اصطناعي...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
              />
            </div>
            
            {/* نتائج البحث */}
            {searchTerm.trim() && (
              <div className="mt-4 text-center">
                {searchResults.exactMatches.length > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 mx-1">
                    {searchResults.exactMatches.length} مطابقة دقيقة
                  </Badge>
                )}
                {searchResults.suggestions.length > 0 && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300 mx-1">
                    {searchResults.suggestions.length} اقتراح مشابه
                  </Badge>
                )}
                {searchResults.allElements.length === 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                    لا توجد نتائج للبحث
                  </Badge>
                )}
              </div>
            )}
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent mt-4"></div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {Object.entries(groupedElements).map(([category, elements], categoryIndex) => (
              <motion.div
                key={category}
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 text-sm font-semibold px-3 py-1">
                    {category}
                  </Badge>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent dark:from-purple-700"></div>
                  <Badge variant="secondary" className="text-xs">
                    {elements.length} عنصر
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {elements.map((element, index) => {
                    const IconComponent = element.icon;
                    return (
                      <motion.div
                        key={element.id}
                        className="group relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (categoryIndex * 0.1) + (index * 0.03) }}
                      >
                        <Card className="h-full border border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 text-sm">
                                  {element.label}
                                </h4>
                                {element.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                                    {element.description}
                                  </p>
                                )}
                                
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                      {element.codeId}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyElementInfo(element)}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                title={`نسخ معلومات ${element.label}`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
            
            {/* زر نسخ جميع العناصر */}
            <motion.div
              className="flex justify-center pt-8 border-t border-purple-200 dark:border-purple-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => {
                  const allElementsInfo = contentElements.map(element => 
                    `رمزه في الكود: ${element.codeId}\nالمكون: ${element.component}\nالوصف: ${element.description || 'غير محدد'}\nالفئة: ${element.category}`
                  ).join('\n\n---\n\n');
                  
                  navigator.clipboard.writeText(allElementsInfo).then(() => {
                    toast.success(`تم نسخ معلومات جميع العناصر (${contentElements.length} عنصر)`);
                  });
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Copy className="h-5 w-5 mr-2" />
                نسخ معلومات جميع العناصر ({contentElements.length})
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContentElementsCopyButtons;