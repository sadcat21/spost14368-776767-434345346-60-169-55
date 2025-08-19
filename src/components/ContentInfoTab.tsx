import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Hash, 
  AlignLeft, 
  Tag, 
  Star, 
  Clock,
  Smartphone,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ContentInfoTab = () => {
  const contentInfo = {
    element: "المحتوى",
    id: "content-creation", 
    description: "إنشاء وتحرير المحتوى",
    type: "تبويب رئيسي",
    category: "محتوى",
    timestamp: "الجمعة 1 أوت 2025 في 16:30",
    platform: "DIAGNO PAG"
  };

  const handleCopyInfo = () => {
    const infoText = `رمزه في الكود: ContentInfoTab
المكون: ContentInfoTab`;

    navigator.clipboard.writeText(infoText);
    toast.success("تم نسخ معلومات العنصر بنجاح");
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              📋 معلومات العنصر
            </CardTitle>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent mt-2"></div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Element Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">🏷️ العنصر</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{contentInfo.element}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">🆔 المعرف</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{contentInfo.id}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AlignLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">📝 الوصف</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{contentInfo.description}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">🔖 النوع</p>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                    {contentInfo.type}
                  </Badge>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">🏆 التصنيف</p>
                  <Badge variant="default" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    {contentInfo.category}
                  </Badge>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200 dark:border-blue-700"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">⏰ الوقت</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{contentInfo.timestamp}</p>
                </div>
              </motion.div>
            </div>

            {/* Platform Info */}
            <motion.div
              className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">📱 تم النسخ من منصة</p>
                  <p className="font-bold text-cyan-800 dark:text-cyan-200">{contentInfo.platform}</p>
                </div>
              </div>
            </motion.div>

            {/* Copy Button */}
            <motion.div
              className="flex justify-center pt-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleCopyInfo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                نسخ معلومات العنصر
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContentInfoTab;