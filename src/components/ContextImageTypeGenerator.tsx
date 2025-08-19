import React, { useState } from 'react';
import { geminiApiManager } from "../utils/geminiApiManager";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContextImageTypeGeneratorProps {
  topic: string;
  prompt: string;
  specialty?: string;
  contentType?: string;
  imageStyle?: string;
  onImageTypesGenerated: (imageTypes: string[]) => void;
  disabled?: boolean;
}

export const ContextImageTypeGenerator = ({ 
  topic, 
  prompt, 
  specialty,
  contentType,
  imageStyle,
  onImageTypesGenerated, 
  disabled 
}: ContextImageTypeGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContextImageTypes = async () => {
    if (!prompt || !topic) {
      toast.error("يرجى إدخال الموضوع والوصف أولاً");
      return;
    }

    setIsGenerating(true);
    
    try {
      // استخدام نفس منطق توليد الخيارات المتقدمة الموجود مسبقاً
      const contextInfo = [];
      if (specialty) contextInfo.push(`- التخصص: ${specialty}`);
      if (contentType) contextInfo.push(`- نوع المحتوى: ${contentType}`);
      if (imageStyle) contextInfo.push(`- نمط الصورة: ${imageStyle}`);
      if (topic) contextInfo.push(`- الموضوع: ${topic}`);
      if (prompt) contextInfo.push(`- الوصف: ${prompt}`);

      const response = await fetch(
        geminiApiManager.getApiUrl(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `بناءً على السياق التالي:
${contextInfo.join('\n')}

اقترح 8 أنواع مختلفة من الصور التي تناسب السياق والمحتوى المحدد:

أريد أنواع صور محددة ومناسبة للسياق مثل:
- إنفوجرافيك متخصص للموضوع
- صورة تعليمية تفاعلية
- مخطط بياني متخصص
- عرض تقديمي مرئي
- صورة تحليلية مفصلة
- رسم بياني إحصائي
- صورة مقارنة توضيحية
- تصميم معلوماتي متخصص

قدم الإجابة كقائمة JSON بسيطة:
{
  "imageTypes": ["نوع الصورة 1", "نوع الصورة 2", "نوع الصورة 3", "نوع الصورة 4", "نوع الصورة 5", "نوع الصورة 6", "نوع الصورة 7", "نوع الصورة 8"]
}`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          })
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            if (result.imageTypes && Array.isArray(result.imageTypes)) {
              onImageTypesGenerated(result.imageTypes);
              toast.success(`تم توليد ${result.imageTypes.length} خيار لنوع الصورة بناءً على السياق`);
            } else {
              toast.error("فشل في توليد خيارات مناسبة");
            }
          } else {
            toast.error("فشل في تحليل النتائج المولدة");
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          toast.error("حدث خطأ في تحليل النتائج المولدة");
        }
      } else {
        throw new Error("لم يتم الحصول على نتيجة صحيحة");
      }
    } catch (error) {
      console.error("Error generating context image types:", error);
      toast.error("حدث خطأ في توليد خيارات نوع الصورة");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateContextImageTypes}
      disabled={disabled || isGenerating || !prompt || !topic}
      className="text-xs px-2 py-1"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          توليد...
        </>
      ) : (
        '🔄 توليد خيارات'
      )}
    </Button>
  );
};