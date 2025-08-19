import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Brain,
  Monitor,
  Layout,
  BarChart3,
  Activity,
  Gauge,
  Sparkles,
  Layers,
  Star,
  Bot,
  Search,
  Edit,
  Palette,
  Image,
  Type,
  Eye,
  Wand2,
  Settings,
  Target,
  Globe,
  Users,
  TrendingUp,
  MessageSquare,
  Send,
  Download,
  ChevronDown,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface AIDashboardElement {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  codeId: string;
  component: string;
  description?: string;
  category: string;
  subCategory?: string;
}

const AIDashboardElementsCopy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  
  const aiDashboardElements: AIDashboardElement[] = [
    // المكونات الأساسية للوحة الذكاء الاصطناعي
    {
      id: "ai-dashboard",
      label: "لوحة التحكم بالذكاء الاصطناعي",
      icon: Brain,
      codeId: "AIDashboard",
      component: "AIDashboard",
      description: "لوحة التحكم الرئيسية بالذكاء الاصطناعي مع جميع الأدوات والميزات",
      category: "اللوحة الرئيسية",
      subCategory: "المكون الأساسي"
    },
    
    // العقد والشبكات (Network Nodes)
    {
      id: "social-platforms-nodes",
      label: "عقد منصات التواصل الاجتماعي",
      icon: Globe,
      codeId: "socialPlatforms",
      component: "Array of Social Platform Nodes",
      description: "شبكة من 8 عقد لمنصات التواصل الاجتماعي مع تحديد المواقع الشعاعية",
      category: "الشبكة والعقد",
      subCategory: "منصات التواصل"
    },
    {
      id: "ai-intelligence-nodes",
      label: "عقد الذكاء الاصطناعي",
      icon: Brain,
      codeId: "aiIntelligenceNodes",
      component: "AI Intelligence Network",
      description: "شبكة من 6 عقد ذكية للذكاء الاصطناعي مع تحليلات متقدمة",
      category: "الشبكة والعقد",
      subCategory: "عقد الذكاء"
    },
    {
      id: "central-hub-node",
      label: "العقدة المركزية",
      icon: Target,
      codeId: "centralHub",
      component: "Central Intelligence Hub",
      description: "العقدة المركزية القابلة للتبديل بين وسائل التواصل والذكاء الاصطناعي",
      category: "الشبكة والعقد",
      subCategory: "المحور المركزي"
    },
    {
      id: "data-flow-nodes",
      label: "عقد تدفق البيانات",
      icon: Activity,
      codeId: "dataFlowVisualization",
      component: "Smart Data Flow Nodes",
      description: "30 عقدة متحركة لتمثيل تدفق البيانات الذكية بين المنصات",
      category: "الشبكة والعقد",
      subCategory: "تدفق البيانات"
    },
    
    // البطاقات والواجهات (Cards & Interfaces)
    {
      id: "facebook-card",
      label: "بطاقة فيسبوك",
      icon: Facebook,
      codeId: "FacebookCard",
      component: "FacebookCard",
      description: "بطاقة تفاعلية لعرض بيانات فيسبوك مع إحصائيات مفصلة",
      category: "البطاقات التفاعلية",
      subCategory: "منصات اجتماعية"
    },
    {
      id: "platform-metrics-card",
      label: "بطاقة مقاييس المنصات",
      icon: BarChart3,
      codeId: "platformMetrics",
      component: "Platform Metrics Display",
      description: "بطاقات لعرض مقاييس كل منصة (الزوار، المتابعين، التفاعل)",
      category: "البطاقات التفاعلية",
      subCategory: "الإحصائيات"
    },
    {
      id: "ai-insights-card",
      label: "بطاقة رؤى الذكاء الاصطناعي",
      icon: Eye,
      codeId: "aiInsights",
      component: "AI Insights Card",
      description: "بطاقة تعرض رؤى الذكاء الاصطناعي (الوصول، التفاعل، النمو، الأتمتة)",
      category: "البطاقات التفاعلية",
      subCategory: "رؤى ذكية"
    },
    {
      id: "status-indicators-card",
      label: "بطاقة مؤشرات الحالة",
      icon: Gauge,
      codeId: "statusIndicators",
      component: "Status Indicators",
      description: "مؤشرات ملونة لحالة كل منصة (نشط، معالجة، غير نشط، ذكي)",
      category: "البطاقات التفاعلية",
      subCategory: "مؤشرات الحالة"
    },
    
    // التأثيرات البصرية (Visual Effects)
    {
      id: "neural-background",
      label: "خلفية الشبكة العصبية",
      icon: Activity,
      codeId: "NeuralBackground",
      component: "NeuralBackground",
      description: "خلفية متحركة للشبكة العصبية مع تأثيرات بصرية متقدمة",
      category: "التأثيرات البصرية",
      subCategory: "الخلفيات"
    },
    {
      id: "pulse-animations",
      label: "تأثيرات النبض",
      icon: Sparkles,
      codeId: "pulseEffects",
      component: "Pulse Animation System",
      description: "تأثيرات نبض متحركة للعقد النشطة مع ظلال ملونة",
      category: "التأثيرات البصرية",
      subCategory: "الحركة"
    },
    {
      id: "glow-effects",
      label: "تأثيرات التوهج",
      icon: Star,
      codeId: "glowEffects",
      component: "Glow Effect System",
      description: "تأثيرات توهج ديناميكية للعناصر النشطة والمحددة",
      category: "التأثيرات البصرية",
      subCategory: "الإضاءة"
    },
    {
      id: "connection-lines",
      label: "خطوط الاتصال",
      icon: Layers,
      codeId: "connectionLines",
      component: "Dynamic Connection Lines",
      description: "خطوط اتصال متحركة بين العقد مع تأثيرات التدرج",
      category: "التأثيرات البصرية",
      subCategory: "الاتصالات"
    },
    
    // أدوات التحكم والتفاعل (Controls & Interactions)
    {
      id: "play-pause-controls",
      label: "أدوات التشغيل والإيقاف",
      icon: Play,
      codeId: "animationControls",
      component: "Animation Control Buttons",
      description: "أزرار التحكم في تشغيل وإيقاف الحركات والتأثيرات",
      category: "أدوات التحكم",
      subCategory: "التحكم بالحركة"
    },
    {
      id: "platform-selector",
      label: "محدد المنصات",
      icon: Settings,
      codeId: "platformSelector",
      component: "Platform Selection System",
      description: "نظام اختيار المنصات مع تحديث الحالة التفاعلية",
      category: "أدوات التحكم",
      subCategory: "الاختيار"
    },
    {
      id: "hover-detection",
      label: "كشف التمرير",
      icon: Eye,
      codeId: "hoverDetection",
      component: "Hover Detection System",
      description: "نظام كشف التمرير للعقد مع ردود فعل بصرية",
      category: "أدوات التحكم",
      subCategory: "التفاعل"
    },
    {
      id: "central-icon-toggle",
      label: "تبديل الأيقونة المركزية",
      icon: RefreshCw,
      codeId: "centralIconToggle",
      component: "Central Icon Toggle",
      description: "نظام تبديل الأيقونة المركزية بين وضع التواصل والذكاء الاصطناعي",
      category: "أدوات التحكم",
      subCategory: "التبديل"
    },
    
    // المكونات الذكية (Smart Components)
    {
      id: "ai-header",
      label: "رأس الذكاء الاصطناعي",
      icon: Monitor,
      codeId: "AIHeader",
      component: "AIHeader",
      description: "شريط الرأس للذكاء الاصطناعي مع أدوات التحكم العلوية",
      category: "المكونات الذكية",
      subCategory: "واجهة المستخدم"
    },
    {
      id: "ai-sidebar",
      label: "الشريط الجانبي للذكاء الاصطناعي",
      icon: Layout,
      codeId: "AISidebar",
      component: "AISidebar",
      description: "الشريط الجانبي لإدارة الذكاء الاصطناعي والتنقل بين الصفحات",
      category: "المكونات الذكية",
      subCategory: "التنقل"
    },
    {
      id: "ai-analytics",
      label: "تحليلات الذكاء الاصطناعي",
      icon: BarChart3,
      codeId: "AIAnalytics",
      component: "AIAnalytics",
      description: "تحليلات وإحصائيات شاملة للذكاء الاصطناعي",
      category: "المكونات الذكية",
      subCategory: "التحليلات"
    },
    
    // أدوات جيميني (Gemini Tools)
    {
      id: "gemini-api-status",
      label: "حالة API جيميني",
      icon: Gauge,
      codeId: "GeminiApiStatus",
      component: "GeminiApiStatus",
      description: "عرض حالة واتصال API جيميني مع مؤشرات الأداء",
      category: "أدوات جيميني",
      subCategory: "مراقبة API"
    },
    {
      id: "gemini-smart-suggestions",
      label: "اقتراحات جيميني الذكية",
      icon: Sparkles,
      codeId: "GeminiSmartSuggestions",
      component: "GeminiSmartSuggestions",
      description: "الاقتراحات الذكية من جيميني لتحسين المحتوى",
      category: "أدوات جيميني",
      subCategory: "الاقتراحات"
    },
    {
      id: "gemini-layer-suggestions",
      label: "اقتراحات طبقات جيميني",
      icon: Layers,
      codeId: "GeminiLayerSuggestions",
      component: "GeminiLayerSuggestions",
      description: "اقتراحات الطبقات من جيميني لتحسين التصميم",
      category: "أدوات جيميني",
      subCategory: "إدارة الطبقات"
    },
    {
      id: "gemini-review-manager",
      label: "مدير مراجعات جيميني",
      icon: Star,
      codeId: "GeminiReviewManager",
      component: "GeminiReviewManager",
      description: "مدير المراجعات والتقييمات من جيميني للمحتوى",
      category: "أدوات جيميني",
      subCategory: "المراجعة"
    },
    
    // أدوات توليد المحتوى (Content Generation)
    {
      id: "auto-prompt-generator",
      label: "مولد النصوص التلقائي",
      icon: Bot,
      codeId: "AutoPromptGenerator",
      component: "AutoPromptGenerator",
      description: "مولد النصوص التلقائي بالذكاء الاصطناعي للمحتوى المخصص",
      category: "توليد المحتوى",
      subCategory: "النصوص التلقائية"
    },
    {
      id: "prompt-analyzer",
      label: "محلل النصوص",
      icon: Search,
      codeId: "PromptAnalyzer",
      component: "PromptAnalyzer",
      description: "محلل النصوص والأوامر بالذكاء الاصطناعي مع تحليل شامل",
      category: "توليد المحتوى",
      subCategory: "تحليل النصوص"
    },
    {
      id: "prompt-editor",
      label: "محرر النصوص الذكي",
      icon: Edit,
      codeId: "PromptEditor",
      component: "PromptEditor",
      description: "محرر النصوص المدعوم بالذكاء الاصطناعي مع اقتراحات تلقائية",
      category: "توليد المحتوى",
      subCategory: "التحرير الذكي"
    },
    {
      id: "design-prompt-generator",
      label: "مولد نصوص التصميم",
      icon: Palette,
      codeId: "DesignPromptGenerator",
      component: "DesignPromptGenerator",
      description: "مولد نصوص التصميم بالذكاء الاصطناعي للإبداعات البصرية",
      category: "توليد المحتوى",
      subCategory: "التصميم الذكي"
    },
    
    // معالجة الصور والبيانات (Image & Data Processing)
    {
      id: "context-image-type-generator",
      label: "مولد نوع الصورة حسب السياق",
      icon: Image,
      codeId: "ContextImageTypeGenerator",
      component: "ContextImageTypeGenerator",
      description: "مولد نوع الصورة المناسب حسب السياق والمحتوى",
      category: "معالجة البيانات",
      subCategory: "معالجة الصور"
    },
    {
      id: "infographic-analyzer",
      label: "محلل الرسوم البيانية",
      icon: BarChart3,
      codeId: "InfographicAnalyzer",
      component: "InfographicAnalyzer",
      description: "محلل الرسوم البيانية والمعلومات المرئية بالذكاء الاصطناعي",
      category: "معالجة البيانات",
      subCategory: "تحليل البيانات"
    },
    {
      id: "text-extractor",
      label: "مستخرج النصوص من الصور",
      icon: Type,
      codeId: "TextExtractor",
      component: "TextExtractor",
      description: "مستخرج النصوص من الصور باستخدام تقنيات الذكاء الاصطناعي",
      category: "معالجة البيانات",
      subCategory: "استخراج النصوص"
    },
    
    // العناصر التفاعلية المتقدمة (Advanced Interactive Elements)
    {
      id: "toast-notification-system",
      label: "نظام إشعارات التوست",
      icon: MessageSquare,
      codeId: "toastSystem",
      component: "Toast Notification System",
      description: "نظام إشعارات متقدم لعرض حالة العمليات والتحديثات",
      category: "العناصر التفاعلية",
      subCategory: "الإشعارات"
    },
    {
      id: "motion-animation-system",
      label: "نظام حركة فريمر",
      icon: Play,
      codeId: "framerMotion",
      component: "Framer Motion Animation System",
      description: "نظام حركة متقدم باستخدام Framer Motion للتأثيرات البصرية",
      category: "العناصر التفاعلية",
      subCategory: "الحركة والتأثيرات"
    },
    {
      id: "facebook-context-integration",
      label: "تكامل سياق فيسبوك",
      icon: Facebook,
      codeId: "facebookContext",
      component: "Facebook Context Integration",
      description: "تكامل مع سياق فيسبوك لجلب البيانات والإحصائيات",
      category: "العناصر التفاعلية",
      subCategory: "التكامل"
    }
  ];

  const categories = ['الكل', ...Array.from(new Set(aiDashboardElements.map(el => el.category)))];

  const filteredElements = useMemo(() => {
    return aiDashboardElements.filter(element => {
      const matchesSearch = element.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          element.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          element.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || element.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const groupedElements = useMemo(() => {
    const grouped: Record<string, AIDashboardElement[]> = {};
    filteredElements.forEach(element => {
      if (!grouped[element.category]) {
        grouped[element.category] = [];
      }
      grouped[element.category].push(element);
    });
    return grouped;
  }, [filteredElements]);

  const copyToClipboard = (codeId: string, component: string, label: string) => {
    const codeTemplate = `// مكون ${label} - لوحة الذكاء الاصطناعي
import { ${component} } from "@/components/${component}";

// استخدام المكون
<${component} 
  // إضافة الخصائص المطلوبة هنا
  // يمكن إضافة accessToken، copySettings، أو خصائص أخرى حسب المكون
/>

// معرف المكون: ${codeId}
// الفئة: عناصر الذكاء الاصطناعي
// الوصف: ${label}`;

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            عناصر لوحة الذكاء الاصطناعي
          </h2>
          <Badge variant="secondary" className="text-sm">
            {filteredElements.length} عنصر ذكي
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في عناصر الذكاء الاصطناعي..."
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
                    <Brain className="h-5 w-5 text-primary" />
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
                        <Card className="h-full hover:shadow-md transition-shadow border-primary/20">
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
                                    className="h-7 text-xs bg-primary hover:bg-primary/90"
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
                <Card className="h-full hover:shadow-lg transition-all border-primary/20">
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
                        className="w-full h-8 text-xs bg-primary hover:bg-primary/90"
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
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">لم يتم العثور على عناصر ذكاء اصطناعي</h3>
          <p className="text-muted-foreground">
            جرب تعديل مصطلح البحث أو اختيار فئة مختلفة
          </p>
        </div>
      )}
    </div>
  );
};

export default AIDashboardElementsCopy;