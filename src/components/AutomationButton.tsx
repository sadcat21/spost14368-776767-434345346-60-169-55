import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bot, 
  Zap, 
  Sparkles, 
  Settings, 
  Brain, 
  Star,
  Wand2,
  Target,
  PlayCircle,
  Timer,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { AutomationProgressDialog } from "./AutomationProgressDialog";
import { PromptGeneratorTabDialog } from "./PromptGeneratorTabDialog";
import { useAutomationEngine } from "@/hooks/useAutomationEngine";

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

const contentTypes = [
  { value: "daily-tip", label: "نصيحة يومية" },
  { value: "scientific-fact", label: "معلومة علمية" },
  { value: "myth-correction", label: "تصحيح مفهوم شائع" },
  { value: "inspiring-quote", label: "اقتباس ملهم" },
  { value: "interactive-question", label: "سؤال تفاعلي" },
  { value: "product-benefits", label: "فوائد منتج / خدمة" },
  { value: "custom", label: "مخصص" }
];

const imageStyles = [
  { value: "professional", label: "احترافي" },
  { value: "modern", label: "عصري" },
  { value: "traditional", label: "تقليدي" },
  { value: "artistic", label: "فني" },
  { value: "minimalist", label: "بسيط" },
  { value: "colorful", label: "ملون" }
];

const languages = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "ar-en", label: "عربي - إنجليزي" }
];

interface AutomationButtonProps {
  className?: string;
}

export const AutomationButton: React.FC<AutomationButtonProps> = ({ className = "" }) => {
  // إشارة إلى أن هذا في وضع الذكاء الاصطناعي المتقدم ✨
  const handleAdvancedAIClick = () => {
    // فتح تبويبة الأوتوميشن الذكي
    const event = new CustomEvent('navigateToAutomation');
    window.dispatchEvent(event);
    toast.success(`🤖 تم فتح تبويبة الأوتوميشن الذكي - وضع الذكاء الاصطناعي المتقدم ✨`);
  };
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTabDialogOpen, setIsTabDialogOpen] = useState(false);
  const [config, setConfig] = useState({
    topic: '',
    specialty: specialties[0].value,
    contentType: contentTypes[0].value,
    language: languages[0].value,
    imageStyle: imageStyles[0].value,
    imageSource: 'unsplash',
    selectedTabs: [] as string[],
    customGeminiApiKey: '' // مفتاح API خاص لتوليد الصور
  });

  const {
    isRunning,
    isPaused,
    steps,
    currentStepIndex,
    elapsedTime,
    startAutomation,
    pauseAutomation,
    resumeAutomation,
    cancelAutomation
  } = useAutomationEngine();

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTabsSelected = (selectedTabs: string[]) => {
    setConfig(prev => ({ ...prev, selectedTabs }));
  };

  const handleStartAutomation = async () => {
    if (!config.topic.trim()) {
      toast.error('يرجى إدخال موضوع المحتوى');
      return;
    }

    if (!config.customGeminiApiKey?.trim()) {
      toast.error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح في الحقل المخصص أولاً. النظام يعتمد حصرياً على المفتاح المدخل من قِبلك.');
      return;
    }

    setIsConfigOpen(false);
    
    try {
      await startAutomation(config);
    } catch (error) {
      console.error('خطأ في بدء الأوتوماشن:', error);
      toast.error('فشل في بدء الأوتوماشن');
    }
  };

  const openTabDialog = () => {
    setIsTabDialogOpen(true);
  };

  return (
    <>
      {/* زر الوضع المتقدم للذكاء الاصطناعي المحسن ✨ */}
      <div className="relative w-full mb-6">
        {/* خلفية متحركة ذكية */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-45 from-violet-600/10 via-indigo-600/10 to-cyan-600/10 rounded-2xl animate-[spin_20s_linear_infinite]"></div>
        
        <Button
          onClick={handleAdvancedAIClick}
          className="w-full relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-2xl hover:shadow-[0_20px_40px_rgba(147,51,234,0.4)] transition-all duration-500 hover:scale-[1.02] group overflow-hidden border-0 text-white p-4 rounded-2xl"
        >
          {/* طبقة الضوء المتحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          
          {/* جسيمات الضوء */}
          <div className="absolute top-2 left-4 w-1 h-1 bg-white/80 rounded-full animate-ping"></div>
          <div className="absolute top-6 right-8 w-1 h-1 bg-cyan-300/80 rounded-full animate-ping animation-delay-500"></div>
          <div className="absolute bottom-3 left-1/3 w-1 h-1 bg-purple-300/80 rounded-full animate-ping animation-delay-1000"></div>
          
          <div className="relative flex items-center justify-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 text-yellow-300 drop-shadow-lg" />
              <div className="absolute inset-0 bg-yellow-400/50 rounded-full blur-md animate-pulse"></div>
            </div>
            <span className="font-bold text-lg tracking-wide drop-shadow-md">وضع الذكاء الاصطناعي المتقدم</span>
            <div className="relative">
              <Brain className="h-6 w-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 text-cyan-300 drop-shadow-lg" />
              <div className="absolute inset-0 bg-cyan-400/50 rounded-full blur-md animate-pulse animation-delay-300"></div>
            </div>
          </div>
          
          {/* خط النبض السفلي */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 via-white to-cyan-400 w-full opacity-60 animate-pulse"></div>
        </Button>
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogTrigger asChild>
          <div className={`relative group ${className}`}>
            {/* هالة ضوئية متحركة */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 animate-pulse transition-all duration-500"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 rounded-3xl blur-xl opacity-10 group-hover:opacity-30 animate-[spin_8s_linear_infinite] transition-all duration-500"></div>
            
            <Card className="cursor-pointer transition-all duration-500 hover:shadow-[0_25px_50px_rgba(147,51,234,0.3)] hover:scale-[1.02] group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50/80 via-blue-50/80 to-cyan-50/80 dark:from-purple-950/80 dark:via-blue-950/80 dark:to-cyan-950/80 backdrop-blur-sm rounded-3xl">
              {/* طبقات التأثير البصري */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-700"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* موجات ضوئية */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/60 rounded-full animate-ping"></div>
              <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-ping animation-delay-700"></div>
              <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-400/60 rounded-full animate-ping animation-delay-1000"></div>
              
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      {/* هالة الأيقونة */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur-2xl opacity-30 animate-pulse group-hover:opacity-60 transition-all duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-2xl animate-[spin_12s_linear_infinite]"></div>
                      
                      <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-4 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Bot className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                        
                        {/* جسيمات صغيرة حول الأيقونة */}
                        <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-cyan-300 rounded-full animate-ping animation-delay-500"></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300 drop-shadow-sm">
                        أوتوماشن ذكي
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300 font-medium">
                        توليد المحتوى والصور تلقائياً من موضوع واحد
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 px-3 py-1.5">
                        <Zap className="h-3 w-3 mr-1 animate-pulse" />
                        سريع
                      </Badge>
                      <div className="absolute inset-0 bg-green-400/30 rounded-full blur-md opacity-0 group-hover:opacity-50 animate-pulse"></div>
                    </div>
                    <div className="relative">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 px-3 py-1.5">
                        <Brain className="h-3 w-3 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                        ذكي
                      </Badge>
                      <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-md opacity-0 group-hover:opacity-50 animate-pulse animation-delay-300"></div>
                    </div>
                  </div>
                </div>

                {/* ميزات محسنة */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm group-hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <Target className="h-4 w-4 text-purple-500 group-hover:rotate-12 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-purple-400/40 rounded-full blur-sm opacity-0 group-hover:opacity-60 animate-pulse"></div>
                    </div>
                    <span className="text-muted-foreground font-medium">تحليل ذكي للمحتوى</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group-hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <Sparkles className="h-4 w-4 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-blue-400/40 rounded-full blur-sm opacity-0 group-hover:opacity-60 animate-pulse animation-delay-200"></div>
                    </div>
                    <span className="text-muted-foreground font-medium">توليد صور احترافية</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group-hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <Timer className="h-4 w-4 text-cyan-500 group-hover:rotate-12 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-cyan-400/40 rounded-full blur-sm opacity-0 group-hover:opacity-60 animate-pulse animation-delay-400"></div>
                    </div>
                    <span className="text-muted-foreground font-medium">تنفيذ بفواصل زمنية</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group-hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <Star className="h-4 w-4 text-purple-500 group-hover:rotate-12 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-purple-400/40 rounded-full blur-sm opacity-0 group-hover:opacity-60 animate-pulse animation-delay-600"></div>
                    </div>
                    <span className="text-muted-foreground font-medium">رفع تلقائي للصور</span>
                  </div>
                </div>

                {/* شريط الدعوة للعمل المحسن */}
                <div className="mt-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-4 bg-gradient-to-r from-purple-100/60 to-cyan-100/60 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-2xl border border-purple-200/60 dark:border-purple-700/60 group-hover:border-purple-300 dark:group-hover:border-purple-600 transition-all duration-500 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                            <Sparkles className="h-4 w-4 text-white animate-pulse" />
                          </div>
                          <div className="absolute inset-0 bg-purple-400/50 rounded-full blur-md animate-pulse"></div>
                        </div>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300 group-hover:scale-105 transition-transform duration-300">
                          🚀 ابدأ الآن وولّد محتوى احترافي في دقائق
                        </span>
                      </div>
                      <div className="relative">
                        <PlayCircle className="h-6 w-6 text-purple-600 animate-pulse group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                        <div className="absolute inset-0 bg-purple-400/40 rounded-full blur-sm opacity-0 group-hover:opacity-60 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
          
          <DialogHeader className="text-center relative z-10 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-3 rounded-full">
                  <Settings className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-2">
              <Zap className="h-7 w-7 text-purple-600 animate-pulse" />
              إعداد الأوتوماشن الذكي
              <Star className="h-7 w-7 text-cyan-600 animate-pulse" />
            </DialogTitle>
            
            <div className="bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
              <p className="text-muted-foreground font-medium">
                🤖 اختر إعدادات المحتوى ليقوم الذكاء الاصطناعي بتوليد كل شيء تلقائياً
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-6 relative z-10">
            {/* موضوع المحتوى */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                موضوع المحتوى *
              </Label>
              <Input
                id="topic"
                placeholder="مثال: فوائد الحجامة، نصائح التغذية، تطوير الذات..."
                value={config.topic}
                onChange={(e) => handleConfigChange('topic', e.target.value)}
                className="text-lg p-4 border-2 border-purple-200 focus:border-purple-400 dark:border-purple-700 dark:focus:border-purple-500 rounded-xl bg-white/50 dark:bg-slate-800/50"
              />
            </div>

            {/* الإعدادات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  التخصص
                </Label>
                <Select value={config.specialty} onValueChange={(value) => handleConfigChange('specialty', value)}>
                  <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400 dark:border-blue-700 dark:focus:border-blue-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-600" />
                  نوع المحتوى
                </Label>
                <Select value={config.contentType} onValueChange={(value) => handleConfigChange('contentType', value)}>
                  <SelectTrigger className="border-2 border-cyan-200 focus:border-cyan-400 dark:border-cyan-700 dark:focus:border-cyan-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  نمط الصورة
                </Label>
                <Select value={config.imageStyle} onValueChange={(value) => handleConfigChange('imageStyle', value)}>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400 dark:border-purple-700 dark:focus:border-purple-500 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  <Brain className="h-4 w-4 text-green-600" />
                  اللغة
                </Label>
                <Select value={config.language} onValueChange={(value) => handleConfigChange('language', value)}>
                  <SelectTrigger className="border-2 border-green-200 focus:border-green-400 dark:border-green-700 dark:focus:border-green-500 rounded-lg">
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
            </div>

            {/* إعدادات متقدمة */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إعدادات التوليد المتقدمة
                </h3>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  اختياري
                </Badge>
              </div>
              
              <Button
                onClick={openTabDialog}
                variant="outline"
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 hover:border-blue-400 hover:shadow-lg transition-all duration-300 mb-4"
              >
                <Brain className="h-4 w-4 mr-2 text-blue-600" />
                اختيار تبويبات التوليد ({config.selectedTabs.length > 0 ? config.selectedTabs.length : 'الكل'})
              </Button>
              
              {/* حقل مفتاح API خاص لتوليد الصور */}
              <div className="space-y-2">
                <Label htmlFor="automation-gemini-api-key" className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  مفتاح Gemini API خاص لتوليد الصور (اختياري - المرحلة الرابعة)
                </Label>
                <Input
                  id="automation-gemini-api-key"
                  type="password"
                  placeholder="أدخل مفتاح Gemini API الخاص بك..."
                  value={config.customGeminiApiKey}
                  onChange={(e) => handleConfigChange('customGeminiApiKey', e.target.value)}
                  className="bg-purple-50/50 border-purple-200 focus:border-purple-400 focus:ring-purple-200 dark:bg-purple-950/50 dark:border-purple-700"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                  سيتم استخدامه في المرحلة الرابعة (توليد البرومت) والخامسة (توليد الصورة) لتحسين جودة النتائج
                </p>
                {config.customGeminiApiKey && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    تم إدخال مفتاح API مخصص - سيتم استخدامه بالأولوية في المراحل الذكية
                  </div>
                )}
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                onClick={() => setIsConfigOpen(false)}
                variant="outline"
                className="px-8 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-slate-300 hover:border-slate-400"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleStartAutomation}
                disabled={!config.topic.trim() || !config.customGeminiApiKey?.trim()}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Bot className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold">🚀 بدء الأوتوماشن</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة اختيار التبويبات */}
      <PromptGeneratorTabDialog
        isOpen={isTabDialogOpen}
        onClose={() => setIsTabDialogOpen(false)}
        onTabsSelected={handleTabsSelected}
      />

      {/* نافذة تقدم الأوتوماشن */}
      <AutomationProgressDialog
        isOpen={isRunning || steps.length > 0}
        onClose={() => {
          if (!isRunning) {
            // يمكن إغلاق النافذة فقط عند انتهاء التنفيذ
          }
        }}
        steps={steps}
        currentStep={currentStepIndex}
        isRunning={isRunning}
        onPause={pauseAutomation}
        onResume={resumeAutomation}
        onCancel={cancelAutomation}
        elapsedTime={elapsedTime}
      />
    </>
  );
};