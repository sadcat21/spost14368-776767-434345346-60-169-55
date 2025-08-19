import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Info, FileCode, Bot } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  filePath: string;
  props?: string[];
  dependencies?: string[];
  codeSnippet?: string;
  usage?: string;
}

interface SectionInfo {
  id: string;
  name: string;
  description: string;
  components: ComponentInfo[];
}

const ComponentsInfoTab = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      toast.success("تم نسخ المعلومات بنجاح");
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      toast.error("فشل في نسخ المعلومات");
    }
  };

interface TabInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  category: string;
  codeLocation: string;
  usage: string;
  codeSnippet?: string;
}

const tabsData: TabInfo[] = [
  {
    id: "components-info",
    name: "دليل المكونات",
    description: "معلومات شاملة عن جميع مكونات التطبيق مع أمثلة الأكواد",
    type: "تبويب رئيسي",
    icon: "FileCode",
    category: "دليل",
    codeLocation: "AISidebar.tsx",
    usage: "لعرض معلومات شاملة عن جميع مكونات التطبيق مع إمكانية نسخ الأكواد",
    codeSnippet: `<Button\n  variant={selectedPage === "components-info" ? "secondary" : "ghost"}\n  className="w-full justify-start text-right"\n  onClick={() => onPageChange("components-info")}\n>\n  <FileCode className="ml-2 h-4 w-4" />\n  دليل المكونات\n</Button>`
  },
  {
    id: "dashboard",
    name: "لوحة التحكم الذكية", 
    description: "الصفحة الرئيسية مع إحصائيات الذكاء الاصطناعي والتحليلات",
    type: "تبويب رئيسي",
    icon: "LayoutDashboard",
    category: "إدارة",
    codeLocation: "AISidebar.tsx",
    usage: "الصفحة الرئيسية لعرض إحصائيات الاستخدام وحالة النظام",
    codeSnippet: `<Button\n  variant={selectedPage === "dashboard" ? "secondary" : "ghost"}\n  className="w-full justify-start text-right"\n  onClick={() => onPageChange("dashboard")}\n>\n  <LayoutDashboard className="ml-2 h-4 w-4" />\n  لوحة التحكم\n</Button>`
  },
  {
    id: "content-creation",
    name: "إنشاء المحتوى",
    description: "أدوات إنشاء وتحرير المحتوى البصري والنصي",
    type: "تبويب رئيسي", 
    icon: "PenTool",
    category: "إبداع",
    codeLocation: "AISidebar.tsx",
    usage: "لإنشاء وتحرير المحتوى باستخدام أدوات التصميم المتطورة",
    codeSnippet: `<Button\n  variant={selectedPage === "content-creation" ? "secondary" : "ghost"}\n  className="w-full justify-start text-right"\n  onClick={() => onPageChange("content-creation")}\n>\n  <PenTool className="ml-2 h-4 w-4" />\n  إنشاء المحتوى\n</Button>`
  },
  {
    id: "ai-tools",
    name: "أدوات الذكاء الاصطناعي",
    description: "مجموعة شاملة من أدوات الذكاء الاصطناعي المتطورة",
    type: "قائمة منسدلة",
    icon: "Bot",
    category: "ذكاء اصطناعي",
    codeLocation: "AISidebar.tsx", 
    usage: "للوصول إلى جميع أدوات الذكاء الاصطناعي والأتمتة",
    codeSnippet: `<Collapsible open={aiToolsOpen} onOpenChange={setAiToolsOpen}>\n  <CollapsibleTrigger asChild>\n    <Button variant="ghost" className="w-full justify-start text-right">\n      <Bot className="ml-2 h-4 w-4" />\n      أدوات الذكاء الاصطناعي\n      <ChevronDown className="mr-auto h-4 w-4" />\n    </Button>\n  </CollapsibleTrigger>\n</Collapsible>`
  },
  {
    id: "analyzer",
    name: "محلل الشعارات",
    description: "تحليل ذكي للشعارات والصور باستخدام الذكاء الاصطناعي", 
    type: "تبويب فرعي",
    icon: "Zap",
    category: "تحليل",
    codeLocation: "AISidebar.tsx",
    usage: "لتحليل الشعارات والحصول على اقتراحات التحسين",
    codeSnippet: `<Button\n  variant={selectedPage === "analyzer" ? "secondary" : "ghost"}\n  className="w-full justify-start text-right pl-8"\n  onClick={() => onPageChange("analyzer")}\n>\n  <Zap className="ml-2 h-4 w-4" />\n  محلل الشعارات\n</Button>`
  },
  {
    id: "smart-content",
    name: "المحتوى الذكي",
    description: "إنشاء محتوى ذكي باستخدام خوارزميات التعلم الآلي",
    type: "تبويب فرعي",
    icon: "Sparkles", 
    category: "إبداع",
    codeLocation: "AISidebar.tsx",
    usage: "لإنشاء محتوى ذكي ومخصص باستخدام الذكاء الاصطناعي",
    codeSnippet: `<Button\n  variant={selectedPage === "smart-content" ? "secondary" : "ghost"}\n  className="w-full justify-start text-right pl-8"\n  onClick={() => onPageChange("smart-content")}\n>\n  <Sparkles className="ml-2 h-4 w-4" />\n  المحتوى الذكي\n</Button>`
  },
  {
    id: "publishing",
    name: "النشر والمشاركة",
    description: "نشر المحتوى على منصات التواصل الاجتماعي",
    type: "تبويب رئيسي",
    icon: "Share2",
    category: "نشر",
    codeLocation: "AISidebar.tsx",
    usage: "لنشر المحتوى على فيسبوك ومنصات التواصل الأخرى",
    codeSnippet: `<Button\n  variant={selectedPage === "publishing" ? "secondary" : "ghost"}\n  className="w-full justify-start text-right"\n  onClick={() => onPageChange("publishing")}\n>\n  <Share2 className="ml-2 h-4 w-4" />\n  النشر والمشاركة\n</Button>`
  },
  {
    id: "management",
    name: "أدوات الإدارة", 
    description: "إدارة التصميمات والتحكم في الإعدادات المتقدمة",
    type: "قائمة منسدلة",
    icon: "Settings",
    category: "إدارة",
    codeLocation: "AISidebar.tsx",
    usage: "للوصول إلى جميع أدوات الإدارة والتحكم",
    codeSnippet: `<Collapsible open={managementOpen} onOpenChange={setManagementOpen}>\n  <CollapsibleTrigger asChild>\n    <Button variant="ghost" className="w-full justify-start text-right">\n      <Settings className="ml-2 h-4 w-4" />\n      أدوات الإدارة\n      <ChevronDown className="mr-auto h-4 w-4" />\n    </Button>\n  </CollapsibleTrigger>\n</Collapsible>`
  },
  {
    id: "automation-progress-dialog",
    name: "نافذة تقدم الأوتوماشن",
    description: "نافذة لعرض تقدم عمليات الأوتوماشن",
    type: "مكون أوتوماشن",
    icon: "Bot",
    category: "حوار",
    codeLocation: "src/components/AutomationProgressDialog.tsx",
    usage: "لعرض حالة تقدم المعالجة",
    codeSnippet: `import { AutomationProgressDialog } from '@/components/AutomationProgressDialog';

const steps = [
  {
    id: 'step1',
    title: 'تحليل المحتوى',
    description: 'جاري تحليل المحتوى المرفوع',
    icon: <Brain className="h-5 w-5" />,
    status: 'completed' as const
  }
];

<AutomationProgressDialog
  isOpen={true}
  onClose={() => {}}
  steps={steps}
  currentStep={0}
  isRunning={true}
/>`
  }
];

const sectionsData: SectionInfo[] = [
    {
      id: "main-tabs",
      name: "التبويبات الرئيسية",
      description: "معلومات عن جميع تبويبات التطبيق الرئيسية والفرعية",
      components: [
        {
          id: "ai-dashboard",
          name: "AIDashboard",
          description: "لوحة التحكم الرئيسية للذكاء الاصطناعي",
          filePath: "src/components/AIDashboard.tsx",
          props: ["accessToken", "copySettings"],
          dependencies: ["@/components/ui/card", "@/components/ui/button"],
          codeSnippet: `import AIDashboard from "@/components/AIDashboard";\n\n<AIDashboard accessToken={accessToken} copySettings={copySettings} />`,
          usage: "يستخدم كصفحة رئيسية لعرض إحصائيات الذكاء الاصطناعي والتحكم العام"
        },
        {
          id: "ai-header",
          name: "AIHeader",
          description: "شريط العنوان الذكي مع إعدادات النسخ",
          filePath: "src/components/AIHeader.tsx",
          props: ["copySettings", "onCopySettingsChange", "onLogoClick"],
          dependencies: ["@/components/ui/button", "@/components/ui/switch"],
          codeSnippet: `import AIHeader from "@/components/AIHeader";\n\n<AIHeader \n  copySettings={copySettings}\n  onCopySettingsChange={setCopySettings}\n  onLogoClick={() => setSelectedPage("dashboard")}\n/>`,
          usage: "شريط العنوان العلوي مع إعدادات التطبيق وأزرار التنقل"
        },
        {
          id: "ai-sidebar",
          name: "AISidebar",
          description: "الشريط الجانبي للتنقل بين الأقسام",
          filePath: "src/components/AISidebar.tsx",
          props: ["selectedPage", "onPageChange", "copySettings"],
          dependencies: ["@/components/ui/button", "@/components/ui/collapsible"],
          codeSnippet: `import AISidebar from "@/components/AISidebar";\n\n<AISidebar \n  selectedPage={selectedPage}\n  onPageChange={setSelectedPage}\n  copySettings={copySettings}\n/>`,
          usage: "التنقل الرئيسي بين أقسام التطبيق مع التبويبات المنسدلة"
        }
      ]
    },
    {
      id: "content-creation",
      name: "إنشاء المحتوى",
      description: "مكونات إنشاء وتحرير المحتوى",
      components: [
        {
          id: "content-generator",
          name: "ContentGenerator",
          description: "مولد المحتوى الأساسي",
          filePath: "src/components/ContentGenerator.tsx",
          props: [],
          dependencies: ["@/components/ui/card", "@/components/ui/input"],
          codeSnippet: `import { ContentGenerator } from "@/components/ContentGenerator";\n\n<ContentGenerator />`,
          usage: "لإنشاء المحتوى النصي والبصري باستخدام الذكاء الاصطناعي"
        },
        {
          id: "content-canvas",
          name: "ContentCanvas",
          description: "منطقة الرسم والتحرير",
          filePath: "src/components/ContentCanvas.tsx",
          props: ["logoSettings"],
          dependencies: ["fabric", "html2canvas"],
          codeSnippet: `import { ContentCanvas } from "@/components/ContentCanvas";\n\n<ContentCanvas logoSettings={logoSettings} />`,
          usage: "للتحرير البصري والرسم على الصور والنصوص"
        },
        {
          id: "logo-customizer",
          name: "LogoCustomizer",
          description: "محرر الشعارات",
          filePath: "src/components/LogoCustomizer.tsx",
          props: ["logoSettings", "onLogoSettingsChange"],
          dependencies: ["@/components/ui/slider", "@/components/ui/select"],
          codeSnippet: `import { LogoCustomizer } from "@/components/LogoCustomizer";\n\n<LogoCustomizer \n  logoSettings={logoSettings}\n  onLogoSettingsChange={setLogoSettings}\n/>`,
          usage: "لتخصيص وتحرير الشعارات والعلامات المائية"
        }
      ]
    },
    {
      id: "management-controls",
      name: "أدوات الإدارة",
      description: "مكونات إدارة التصميم والتحكم",
      components: [
        {
          id: "design-controls",
          name: "DesignControls",
          description: "أدوات التصميم والأشكال",
          filePath: "src/pages/DesignControlsPage.tsx",
          props: ["copySettings"],
          dependencies: ["@/components/ui/tabs", "@/components/ui/card"],
          codeSnippet: `import DesignControlsPage from "@/pages/DesignControlsPage";\n\n<DesignControlsPage copySettings={copySettings} />`,
          usage: "للتحكم في الأشكال والتخطيطات والمواضع"
        },
        {
          id: "text-controls",
          name: "TextControls",
          description: "أدوات التحكم في النص",
          filePath: "src/pages/TextControlsPage.tsx",
          props: ["copySettings"],
          dependencies: ["@/components/ui/slider", "@/components/ui/input"],
          codeSnippet: `import TextControlsPage from "@/pages/TextControlsPage";\n\n<TextControlsPage copySettings={copySettings} />`,
          usage: "للتحكم في النصوص والخطوط والشفافية"
        },
        {
          id: "overlay-controls",
          name: "OverlayControls",
          description: "أدوات طبقات الألوان",
          filePath: "src/pages/OverlayControlsPage.tsx",
          props: ["copySettings"],
          dependencies: ["@/components/ui/button", "@/components/ui/slider"],
          codeSnippet: `import OverlayControlsPage from "@/pages/OverlayControlsPage";\n\n<OverlayControlsPage copySettings={copySettings} />`,
          usage: "لإدارة الطبقات والألوان والحدود"
        }
      ]
    },
    {
      id: "facebook-integration",
      name: "تكامل فيسبوك",
      description: "مكونات التكامل مع فيسبوك",
      components: [
        {
          id: "facebook-content",
          name: "FacebookContent",
          description: "إدارة محتوى فيسبوك",
          filePath: "src/components/FacebookContent.tsx",
          props: ["copySettings"],
          dependencies: ["@/contexts/FacebookContext"],
          codeSnippet: `import { FacebookContent } from "@/components/FacebookContent";\n\n<FacebookContent copySettings={copySettings} />`,
          usage: "لإنشاء ونشر المحتوى على فيسبوك"
        },
        {
          id: "facebook-analytics",
          name: "FacebookAnalytics",
          description: "تحليلات فيسبوك",
          filePath: "src/components/FacebookAnalytics.tsx",
          props: ["copySettings"],
          dependencies: ["recharts"],
          codeSnippet: `import { FacebookAnalytics } from "@/components/FacebookAnalytics";\n\n<FacebookAnalytics copySettings={copySettings} />`,
          usage: "لعرض إحصائيات وتحليلات صفحات فيسبوك"
        },
        {
          id: "facebook-settings",
          name: "FacebookSettings",
          description: "إعدادات فيسبوك",
          filePath: "src/components/FacebookSettings.tsx",
          props: ["copySettings"],
          dependencies: ["@/hooks/useFacebookAuth"],
          codeSnippet: `import { FacebookSettings } from "@/components/FacebookSettings";\n\n<FacebookSettings copySettings={copySettings} />`,
          usage: "لإدارة الاتصال وإعدادات حسابات فيسبوك"
        }
      ]
    },
    {
      id: "ai-automation",
      name: "الأتمتة الذكية",
      description: "مكونات الذكاء الاصطناعي والأتمتة",
      components: [
        {
          id: "enhanced-automation-engine",
          name: "EnhancedAutomationEngine",
          description: "محرك الأتمتة المتطور",
          filePath: "src/components/EnhancedAutomationEngine.tsx",
          props: ["className"],
          dependencies: ["@/utils/geminiApiManager"],
          codeSnippet: `import { EnhancedAutomationEngine } from "@/components/EnhancedAutomationEngine";\n\n<EnhancedAutomationEngine className="w-full max-w-4xl" />`,
          usage: "للتوليد التلقائي للمحتوى والصور بالذكاء الاصطناعي"
        },
        {
          id: "smart-automation-engine",
          name: "SmartAutomationEngine",
          description: "محرك الأوتوميشن الذكي",
          filePath: "src/components/SmartAutomationEngine.tsx",
          props: ["currentImageUrl", "geminiApiKey", "onResultsReady"],
          dependencies: ["@/hooks/useAutomationEngine"],
          codeSnippet: `import { SmartAutomationEngine } from "@/components/SmartAutomationEngine";\n\n<SmartAutomationEngine\n  currentImageUrl={imageUrl}\n  geminiApiKey={apiKey}\n  onResultsReady={(results) => console.log(results)}\n/>`,
          usage: "أتمتة ذكية متقدمة مع تحليل الصور والنتائج التفاعلية"
        },
        {
          id: "gemini-logo-analyzer",
          name: "GeminiLogoAnalyzer",
          description: "محلل الشعارات بـ Gemini",
          filePath: "src/components/GeminiLogoAnalyzer.tsx",
          props: ["imageUrl", "onAnalysisComplete"],
          dependencies: ["@/utils/geminiApiManager"],
          codeSnippet: `import { GeminiLogoAnalyzer } from "@/components/GeminiLogoAnalyzer";\n\n<GeminiLogoAnalyzer\n  imageUrl={logoUrl}\n  onAnalysisComplete={(analysis) => setAnalysis(analysis)}\n/>`,
          usage: "لتحليل الشعارات والصور باستخدام Gemini AI"
        }
      ]
    },
    {
      id: "ui-components",
      name: "مكونات الواجهة",
      description: "مكونات واجهة المستخدم الأساسية",
      components: [
        {
          id: "button",
          name: "Button",
          description: "زر تفاعلي",
          filePath: "src/components/ui/button.tsx",
          props: ["variant", "size", "className", "children"],
          dependencies: ["class-variance-authority"],
          codeSnippet: `import { Button } from "@/components/ui/button";\n\n<Button variant="default" size="md">\n  نص الزر\n</Button>`,
          usage: "الزر الأساسي لجميع التفاعلات في التطبيق"
        },
        {
          id: "card",
          name: "Card",
          description: "بطاقة عرض",
          filePath: "src/components/ui/card.tsx",
          props: ["className", "children"],
          dependencies: ["@radix-ui/react-slot"],
          codeSnippet: `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";\n\n<Card>\n  <CardHeader>\n    <CardTitle>العنوان</CardTitle>\n  </CardHeader>\n  <CardContent>\n    المحتوى\n  </CardContent>\n</Card>`,
          usage: "لعرض المحتوى في بطاقات منظمة"
        },
        {
          id: "tabs",
          name: "Tabs",
          description: "تبويبات التنقل",
          filePath: "src/components/ui/tabs.tsx",
          props: ["defaultValue", "className", "children"],
          dependencies: ["@radix-ui/react-tabs"],
          codeSnippet: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\n\n<Tabs defaultValue="tab1">\n  <TabsList>\n    <TabsTrigger value="tab1">التبويب 1</TabsTrigger>\n    <TabsTrigger value="tab2">التبويب 2</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab1">محتوى التبويب 1</TabsContent>\n  <TabsContent value="tab2">محتوى التبويب 2</TabsContent>\n</Tabs>`,
          usage: "لتنظيم المحتوى في تبويبات قابلة للتنقل"
        }
      ]
    }
  ];

  const TabInfoCard = ({ tab }: { tab: TabInfo }) => {
    const cardId = `tab-${tab.id}`;
    
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-right">{tab.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{tab.description}</p>
            </div>
            <Badge variant="outline" className="ml-2">
              {tab.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">النوع:</span>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <span className="text-xs font-medium">{tab.type}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">الأيقونة:</span>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <code className="text-xs">{tab.icon}</code>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">مكان الكود:</span>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <code className="text-xs">{tab.codeLocation}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                  onClick={() => copyToClipboard(tab.codeLocation, `${cardId}-location`)}
                >
                  {copiedItem === `${cardId}-location` ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">الاستخدام:</span>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                {tab.usage}
              </p>
            </div>

            {tab.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">مثال الكود:</span>
                </div>
                <div className="bg-muted p-3 rounded-md relative">
                  <pre className="text-xs overflow-x-auto">
                    <code>{tab.codeSnippet}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 left-2 h-6 w-6 p-0"
                    onClick={() => copyToClipboard(tab.codeSnippet!, `${cardId}-code`)}
                  >
                    {copiedItem === `${cardId}-code` ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const fullInfo = `المكون: ${tab.name}
الوصف: ${tab.description}
النوع: ${tab.type}
الأيقونة: ${tab.icon}
التصنيف: ${tab.category}
مكان الكود: ${tab.codeLocation}
الاستخدام: ${tab.usage}

مثال الكود:
${tab.codeSnippet || 'غير متوفر'}`;
                
                copyToClipboard(fullInfo, `${cardId}-full`);
              }}
            >
              {copiedItem === `${cardId}-full` ? (
                <>
                  <Check className="h-4 w-4 ml-2 text-green-600" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 ml-2" />
                  نسخ جميع المعلومات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ComponentCard = ({ component, sectionId }: { component: ComponentInfo; sectionId: string }) => {
    const cardId = `${sectionId}-${component.id}`;
    
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-right">{component.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
            </div>
            <Badge variant="outline" className="ml-2">
              {sectionId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">مسار الملف:</span>
            </div>
            <div className="bg-muted p-2 rounded-md">
              <code className="text-xs">{component.filePath}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2"
                onClick={() => copyToClipboard(component.filePath, `${cardId}-path`)}
              >
                {copiedItem === `${cardId}-path` ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {component.props && component.props.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">الخصائص:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {component.props.map((prop) => (
                  <Badge key={prop} variant="secondary" className="text-xs">
                    {prop}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {component.usage && (
            <div className="space-y-2">
              <span className="text-sm font-medium">الاستخدام:</span>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                {component.usage}
              </p>
            </div>
          )}

          {component.codeSnippet && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">مثال الكود:</span>
              </div>
              <div className="bg-muted p-3 rounded-md relative">
                <pre className="text-xs overflow-x-auto">
                  <code>{component.codeSnippet}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 left-2 h-6 w-6 p-0"
                  onClick={() => copyToClipboard(component.codeSnippet!, `${cardId}-code`)}
                >
                  {copiedItem === `${cardId}-code` ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const fullInfo = `اسم المكون: ${component.name}
الوصف: ${component.description}
مسار الملف: ${component.filePath}
الخصائص: ${component.props?.join(', ') || 'لا يوجد'}
التبعيات: ${component.dependencies?.join(', ') || 'لا يوجد'}
الاستخدام: ${component.usage || 'غير محدد'}

مثال الكود:
${component.codeSnippet || 'غير متوفر'}`;
                
                copyToClipboard(fullInfo, `${cardId}-full`);
              }}
            >
              {copiedItem === `${cardId}-full` ? (
                <>
                  <Check className="h-4 w-4 ml-2 text-green-600" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 ml-2" />
                  نسخ جميع المعلومات
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          دليل مكونات التطبيق
        </h1>
        <p className="text-muted-foreground">
          معلومات شاملة عن جميع مكونات التطبيق مع أمثلة الأكواد وطرق الاستخدام
        </p>
      </div>

      <Tabs defaultValue="tabs-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <TabsTrigger value="tabs-info" className="text-xs">
            معلومات التبويبات
          </TabsTrigger>
          {sectionsData.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="text-xs">
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tabs-info" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">معلومات التبويبات</h2>
            <p className="text-muted-foreground">معلومات شاملة عن جميع تبويبات التطبيق الرئيسية والفرعية</p>
            <Badge variant="secondary">
              {tabsData.length} تبويب
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabsData.map((tab) => (
              <TabInfoCard key={tab.id} tab={tab} />
            ))}
          </div>
        </TabsContent>

        {sectionsData.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{section.name}</h2>
              <p className="text-muted-foreground">{section.description}</p>
              <Badge variant="secondary">
                {section.components.length} مكون
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.components.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  sectionId={section.id}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ComponentsInfoTab;