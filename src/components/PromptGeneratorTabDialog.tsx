import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Settings, Type, Palette, Layout, Sparkles, Zap, Brain, Wand2, Star } from "lucide-react";

interface TabSelectionOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

interface PromptGeneratorTabDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTabsSelected: (selectedTabs: string[]) => void;
}

const AVAILABLE_TABS: TabSelectionOption[] = [
  {
    id: "main",
    title: "خيارات رئيسية",
    description: "تحكم في الخصائص الأساسية للصورة والتصميم",
    icon: <Brain className="h-5 w-5" />,
    color: "from-blue-500 via-purple-500 to-cyan-500",
    features: [
      "خصائص الصورة الأساسية",
      "الألوان والنمط الفني",
      "الإضاءة والبصريات",
      "الخلفية والعناصر",
      "تخطيط المساحة",
      "التأثيرات البصرية"
    ]
  },
  {
    id: "textual",
    title: "خيارات نصية",
    description: "تخصيص العناصر النصية والتفاصيل المرئية",
    icon: <Wand2 className="h-5 w-5" />,
    color: "from-purple-500 via-pink-500 to-orange-500",
    features: [
      "ألوان الأقسام",
      "الرموز والأيقونات",
      "تأثيرات الإضاءة",
      "الفواصل البصرية",
      "تأثيرات البوكه",
      "الأساليب النصية"
    ]
  }
];

export const PromptGeneratorTabDialog: React.FC<PromptGeneratorTabDialogProps> = ({
  isOpen,
  onClose,
  onTabsSelected
}) => {
  const [selectedTabs, setSelectedTabs] = React.useState<string[]>([]);

  const toggleTabSelection = (tabId: string) => {
    setSelectedTabs(prev => 
      prev.includes(tabId) 
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const handleConfirm = () => {
    if (selectedTabs.length === 0) {
      // إذا لم يتم اختيار أي تبويب، اختر الجميع افتراضياً
      onTabsSelected(AVAILABLE_TABS.map(tab => tab.id));
    } else {
      onTabsSelected(selectedTabs);
    }
    onClose();
  };

  const selectAllTabs = () => {
    setSelectedTabs(AVAILABLE_TABS.map(tab => tab.id));
  };

  const clearSelection = () => {
    setSelectedTabs([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
        
        <DialogHeader className="text-center relative z-10 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-3 rounded-full">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-2">
            <Zap className="h-7 w-7 text-purple-600 animate-pulse" />
            مولد برومت التصميم المفصل
            <Star className="h-7 w-7 text-cyan-600 animate-pulse" />
          </DialogTitle>
          
          <div className="bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <p className="text-muted-foreground font-medium">
              🤖 اختر التبويبات التي تريد الاعتماد على خياراتها لتوليد المحتوى بالذكاء الاصطناعي
            </p>
          </div>
        </DialogHeader>

        {/* أزرار التحكم السريع */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 relative z-10">
          <Button
            onClick={selectAllTabs}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-300 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Layout className="h-4 w-4 mr-2 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent font-semibold">اختيار الكل</span>
          </Button>
          <Button
            onClick={clearSelection}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-300 hover:border-slate-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Zap className="h-4 w-4 mr-2 text-slate-600" />
            إلغاء التحديد
          </Button>
        </div>

        {/* خيارات التبويبات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {AVAILABLE_TABS.map((tab) => (
            <Card 
              key={tab.id}
              className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group relative overflow-hidden ${
                selectedTabs.includes(tab.id)
                  ? `ring-2 ring-purple-400 shadow-xl bg-gradient-to-br ${tab.color}/10 border-transparent`
                  : 'hover:shadow-xl border-border bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'
              }`}
              onClick={() => toggleTabSelection(tab.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br ${tab.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                      {tab.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{tab.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium">{tab.description}</p>
                    </div>
                  </div>
                  {selectedTabs.includes(tab.id) && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-sm animate-pulse"></div>
                      <Badge className="relative bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg border-0 px-3 py-1">
                        ✨ مختار
                      </Badge>
                    </div>
                  )}
                </div>

                {/* قائمة الميزات */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    الميزات المشمولة:
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {tab.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-700/30 hover:from-slate-100 dark:hover:from-slate-600/50 transition-all duration-200">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tab.color} shadow-sm`}></div>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mt-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-purple-100/30 dark:from-blue-800/20 dark:to-purple-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm flex-1">
              <p className="font-bold mb-3 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                ملاحظات ذكية:
              </p>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-2 flex-shrink-0"></div>
                  <span>🎯 يمكنك اختيار تبويب واحد أو أكثر حسب احتياجاتك التصميمية</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0"></div>
                  <span>🤖 إذا لم تختر أي تبويب، سيتم استخدام جميع التبويبات للحصول على برومت شامل</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 mt-2 flex-shrink-0"></div>
                  <span>⚡ كلما زاد عدد التبويبات المختارة، كان البرومت أكثر تفصيلاً ودقة</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-cyan-500 mt-2 flex-shrink-0"></div>
                  <span>🔄 يمكنك تغيير الاختيار في أي وقت وإعادة توليد البرومت بسهولة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* أزرار التأكيد */}
        <div className="flex gap-4 justify-center mt-8 relative z-10">
          <Button 
            onClick={onClose}
            variant="outline"
            className="px-8 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-slate-300 hover:border-slate-400 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <span className="font-semibold">إلغاء</span>
          </Button>
          <Button 
            onClick={handleConfirm}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Wand2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-bold">🚀 توليد البرومت الذكي</span>
            {selectedTabs.length > 0 && (
              <div className="relative ml-2">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-sm animate-pulse"></div>
                <Badge className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-2 py-1 shadow-lg">
                  {selectedTabs.length}
                </Badge>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};