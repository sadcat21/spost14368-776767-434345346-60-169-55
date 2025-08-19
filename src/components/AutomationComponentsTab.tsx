import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Copy, 
  Bot, 
  Cog, 
  BarChart3, 
  Play,
  Settings,
  Database,
  Eye,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';

const AutomationComponentsTab = () => {
  // مكونات تبويبة الأوتوماشن
  const automationComponents = [
    {
      id: "automation-button",
      name: "AutomationButton",
      description: "زر تشغيل الأوتوماشن الرئيسي",
      type: "زر تفاعلي",
      icon: Play,
      category: "تشغيل",
      filePath: "src/components/AutomationButton.tsx",
      dependencies: ["AutomationProgressDialog", "useAutomationEngine"],
      features: ["تشغيل الأوتوماشن", "إيقاف مؤقت", "استئناف", "إلغاء"]
    },
    {
      id: "automation-progress-dialog",
      name: "AutomationProgressDialog", 
      description: "نافذة عرض تقدم عملية الأوتوماشن",
      type: "نافذة حوارية",
      icon: BarChart3,
      category: "مراقبة",
      filePath: "src/components/AutomationProgressDialog.tsx",
      dependencies: ["Dialog", "Progress", "Button"],
      features: ["عرض التقدم", "حالة الخطوات", "تحكم في العملية"]
    },
    {
      id: "enhanced-automation-engine",
      name: "EnhancedAutomationEngine",
      description: "محرك الأوتوماشن المحسن والمتطور",
      type: "محرك معالجة",
      icon: Cog,
      category: "معالجة",
      filePath: "src/components/EnhancedAutomationEngine.tsx",
      dependencies: ["useAutomationEngine", "AutomationProgressDialog", "EnhancedAutomationResultsDisplay"],
      features: ["أوتوماشن متقدم", "معالجة ذكية", "نتائج محسنة", "تكامل AI"]
    },
    {
      id: "enhanced-automation-results-display",
      name: "EnhancedAutomationResultsDisplay",
      description: "عرض نتائج الأوتوماشن المحسن",
      type: "عرض نتائج",
      icon: Eye,
      category: "عرض",
      filePath: "src/components/EnhancedAutomationResultsDisplay.tsx",
      dependencies: ["Card", "Badge", "Button"],
      features: ["عرض النتائج", "تحليل البيانات", "تصدير النتائج"]
    },
    {
      id: "smart-automation-engine",
      name: "SmartAutomationEngine",
      description: "محرك الأوتوماشن الذكي بالذكاء الاصطناعي",
      type: "محرك ذكي",
      icon: Bot,
      category: "AI",
      filePath: "src/components/SmartAutomationEngine.tsx",
      dependencies: ["useAutomationEngine", "GeminiAPI", "AutomationProgressDialog"],
      features: ["ذكاء اصطناعي", "تحليل تلقائي", "اقتراحات ذكية", "تحسين تلقائي"]
    },
    {
      id: "use-automation-engine",
      name: "useAutomationEngine",
      description: "Hook لإدارة محرك الأوتوماشن",
      type: "React Hook",
      icon: Settings,
      category: "إدارة",
      filePath: "src/hooks/useAutomationEngine.ts",
      dependencies: ["useState", "useCallback", "useEffect"],
      features: ["إدارة الحالة", "تشغيل العمليات", "مراقبة التقدم", "معالجة الأخطاء"]
    }
  ];

  const handleCopyComponentInfo = (component: any) => {
    const infoText = `رمزه في الكود: ${component.id}
المكون: ${component.name}
الوصف: ${component.description}
النوع: ${component.type}
الأيقونة: ${component.icon.name || component.icon.displayName || "Icon"}
التصنيف: ${component.category}
مكان الكود: ${component.filePath}
التبعيات: ${component.dependencies.join(', ')}
الميزات: ${component.features.join(', ')}`;

    navigator.clipboard.writeText(infoText);
    toast.success(`تم نسخ معلومات ${component.name} بنجاح`);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center justify-center gap-2">
              <Zap className="h-6 w-6" />
              ⚡ مكونات تبويبة الأوتوماشن
            </CardTitle>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent mt-2"></div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {automationComponents.map((component, index) => (
              <motion.div
                key={component.id}
                className="p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-purple-200 dark:border-purple-700 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <component.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {component.name}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                        >
                          {component.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {component.description}
                      </p>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                        <p><strong>النوع:</strong> {component.type}</p>
                        <p><strong>المسار:</strong> {component.filePath}</p>
                        <p><strong>التبعيات:</strong> {component.dependencies.join(', ')}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {component.features.map((feature, featureIndex) => (
                          <Badge 
                            key={featureIndex}
                            variant="outline" 
                            className="text-xs border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleCopyComponentInfo(component)}
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    نسخ
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {/* معلومات إضافية */}
            <motion.div
              className="mt-6 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h4 className="font-semibold text-violet-800 dark:text-violet-200">
                  📊 إحصائيات التبويبة
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-violet-700 dark:text-violet-300">{automationComponents.length}</p>
                  <p className="text-violet-600 dark:text-violet-400">مكون كلي</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-violet-700 dark:text-violet-300">
                    {automationComponents.filter(c => c.type.includes('محرك')).length}
                  </p>
                  <p className="text-violet-600 dark:text-violet-400">محرك معالجة</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-violet-700 dark:text-violet-300">
                    {automationComponents.filter(c => c.category === 'AI').length}
                  </p>
                  <p className="text-violet-600 dark:text-violet-400">مكون ذكي</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-violet-700 dark:text-violet-300">1</p>
                  <p className="text-violet-600 dark:text-violet-400">React Hook</p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AutomationComponentsTab;