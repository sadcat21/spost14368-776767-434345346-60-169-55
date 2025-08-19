import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle, Heart, MessageCircle, HelpCircle, Star, Frown, Phone, Info } from "lucide-react";
import { toast } from "sonner";

interface CommentClassifierProps {
  commentText: string;
  authorName?: string;
  geminiApiKey?: string;
}

interface Classification {
  type: string;
  confidence: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const CommentClassifier = ({ commentText, authorName, geminiApiKey }: CommentClassifierProps) => {
  const [classification, setClassification] = useState<Classification | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const defaultApiKey = localStorage.getItem("gemini-api-key");
  const apiKey = geminiApiKey || defaultApiKey;

  const classifyComment = async () => {
    if (!commentText.trim()) {
      toast.error("لا يوجد تعليق للتصنيف");
      return;
    }

    if (!apiKey) {
      toast.error("يرجى إدخال مفتاح Gemini API في إعدادات توليد المحتوى");
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `أنت نظام ذكي لتصنيف التعليقات على منشورات فيسبوك. قم بتحليل التعليق التالي وتصنيفه:

التعليق: "${commentText}"
المعلق: ${authorName || "غير محدد"}

قم بتصنيف التعليق إلى واحدة من الفئات التالية:
1. داعم - تعليق إيجابي يدعم المحتوى أو يشكر أو يمدح
2. استفسار - سؤال عام أو طلب معلومات عامة
3. طلب تفاصيل - طلب تفاصيل محددة مثل السعر، المدة، الحجم، التوقيت، الألوان، المواصفات
4. طلب تواصل - طلب معلومات التواصل مثل العنوان، الهاتف، البريد الإلكتروني، الموقع
5. شكوى - تعليق سلبي أو شكوى أو انتقاد
6. سبام - تعليق مكرر أو غير مناسب أو إعلان غير مرغوب
7. طلب خدمة - طلب مباشر لخدمة أو منتج
8. مناقشة - تعليق يفتح نقاش أو يضيف معلومة مفيدة
9. غير مفهوم - تعليق غير واضح أو بلغة أخرى

أريد منك الرد في صيغة JSON بهذا الشكل فقط:
{
  "type": "نوع التصنيف",
  "confidence": رقم من 0 إلى 100,
  "description": "وصف مختصر للتصنيف"
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 200,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تصنيف التعليق');
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      try {
        // محاولة استخراج JSON من النص
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          // تحديد الأيقونة واللون حسب نوع التصنيف
          let icon = <MessageCircle className="h-4 w-4" />;
          let color = "bg-gray-500";
          
          if (result.type.includes("داعم")) {
            icon = <Heart className="h-4 w-4" />;
            color = "bg-green-500";
          } else if (result.type.includes("استفسار")) {
            icon = <HelpCircle className="h-4 w-4" />;
            color = "bg-blue-500";
          } else if (result.type.includes("طلب تفاصيل")) {
            icon = <Info className="h-4 w-4" />;
            color = "bg-cyan-500";
          } else if (result.type.includes("طلب تواصل")) {
            icon = <Phone className="h-4 w-4" />;
            color = "bg-indigo-500";
          } else if (result.type.includes("شكوى")) {
            icon = <Frown className="h-4 w-4" />;
            color = "bg-red-500";
          } else if (result.type.includes("سبام")) {
            icon = <AlertTriangle className="h-4 w-4" />;
            color = "bg-orange-500";
          } else if (result.type.includes("طلب خدمة")) {
            icon = <Star className="h-4 w-4" />;
            color = "bg-purple-500";
          } else if (result.type.includes("مناقشة")) {
            icon = <MessageCircle className="h-4 w-4" />;
            color = "bg-teal-500";
          }
          
          const classificationResult = {
            type: result.type,
            confidence: result.confidence,
            description: result.description,
            icon,
            color
          };
          
          setClassification(classificationResult);
          
          // إخفاء التعليق تلقائياً إذا كان شكوى أو مهاجم
          if (result.type.includes("شكوى") || result.type.includes("مهاجم")) {
            window.dispatchEvent(new CustomEvent('hideComment', { 
              detail: { commentId: commentText.substring(0, 10) } 
            }));
          }
          
          toast.success("تم تصنيف التعليق بنجاح!");
        } else {
          throw new Error("فشل في تحليل النتيجة");
        }
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        // خطة احتياطية - تصنيف أساسي
        const basicClassification = getBasicClassification(commentText);
        setClassification(basicClassification);
        
        // إخفاء التعليق تلقائياً إذا كان شكوى أو مهاجم
        if (basicClassification.type.includes("شكوى") || basicClassification.type.includes("مهاجم")) {
          window.dispatchEvent(new CustomEvent('hideComment', { 
            detail: { commentId: commentText.substring(0, 10) } 
          }));
        }
        
        toast.success("تم التصنيف باستخدام النظام الأساسي");
      }

    } catch (error) {
      console.error("Classification error:", error);
      const basicClassification = getBasicClassification(commentText);
      setClassification(basicClassification);
      
      // إخفاء التعليق تلقائياً إذا كان شكوى أو مهاجم
      if (basicClassification.type.includes("شكوى") || basicClassification.type.includes("مهاجم")) {
        window.dispatchEvent(new CustomEvent('hideComment', { 
          detail: { commentId: commentText.substring(0, 10) } 
        }));
      }
      
      toast.error("تعذر الاتصال بـ Gemini AI، تم استخدام التصنيف الأساسي");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getBasicClassification = (text: string): Classification => {
    const lowerText = text.toLowerCase();
    
    // فحص الكلمات السلبية والهجومية أولاً (أولوية عالية)
    const negativeWords = ["قذر", "قذرة", "سيء", "سيئة", "وسخ", "وسخة", "فاشل", "فاشلة", "غبي", "غبية", 
                          "احتيال", "نصب", "كذب", "كاذب", "كراهية", "أكرهكم", "بطال", "بطالة", "زفت", 
                          "تافه", "سخيف", "محتال", "نصاب", "لا أنصح", "مش كويس", "خراب"];
    
    const hasNegativeWords = negativeWords.some(word => lowerText.includes(word));
    
    if (hasNegativeWords) {
      return {
        type: "شكوى",
        confidence: 90,
        description: "تعليق سلبي أو شكوى",
        icon: <Frown className="h-4 w-4" />,
        color: "bg-red-500"
      };
    }
    
    // فحص الكلمات الإيجابية والداعمة
    const positiveWords = ["شكرا", "ممتاز", "رائع", "جميل", "حلو", "بارك الله", "مشكور", "احسنت", 
                          "جيد", "عظيم", "مبدع", "استمر", "موفق", "الله يعطيك العافية", "جزاك الله خير"];
    
    const hasPositiveWords = positiveWords.some(word => lowerText.includes(word));
    
    if (hasPositiveWords) {
      return {
        type: "داعم",
        confidence: 85,
        description: "تعليق إيجابي داعم",
        icon: <Heart className="h-4 w-4" />,
        color: "bg-green-500"
      };
    }
    
    // فحص طلبات التفاصيل (بدون كلمات سلبية)
    const detailsWords = ["سعر", "كم", "مدة", "حجم", "مواصفات", "تفاصيل", "مقاس", "لون", "ألوان", 
                         "خامة", "جودة", "ضمان", "توصيل", "شحن", "متوفر", "وقت"];
    
    const hasDetailsWords = detailsWords.some(word => lowerText.includes(word));
    
    if (hasDetailsWords) {
      return {
        type: "طلب تفاصيل",
        confidence: 80,
        description: "طلب تفاصيل محددة",
        icon: <Info className="h-4 w-4" />,
        color: "bg-cyan-500"
      };
    }
    
    // فحص طلبات التواصل
    const contactWords = ["رقم", "هاتف", "عنوان", "إيميل", "بريد", "موقع", "تواصل", "واتساب", 
                         "انستقرام", "فيسبوك", "محل", "فرع"];
    
    const hasContactWords = contactWords.some(word => lowerText.includes(word));
    
    if (hasContactWords) {
      return {
        type: "طلب تواصل",
        confidence: 85,
        description: "طلب معلومات التواصل",
        icon: <Phone className="h-4 w-4" />,
        color: "bg-indigo-500"
      };
    }
    
    // فحص الأسئلة والاستفسارات
    const questionWords = ["كيف", "ماذا", "متى", "أين", "لماذا", "هل", "؟"];
    
    const hasQuestionWords = questionWords.some(word => lowerText.includes(word));
    
    if (hasQuestionWords) {
      return {
        type: "استفسار",
        confidence: 75,
        description: "سؤال أو استفسار عام",
        icon: <HelpCircle className="h-4 w-4" />,
        color: "bg-blue-500"
      };
    }
    
    // فحص طلبات الخدمة
    const serviceWords = ["أريد", "أطلب", "عايز", "بدي", "محتاج", "ممكن", "اشتري", "أشتري", "اطلب"];
    
    const hasServiceWords = serviceWords.some(word => lowerText.includes(word));
    
    if (hasServiceWords) {
      return {
        type: "طلب خدمة",
        confidence: 80,
        description: "طلب خدمة أو منتج",
        icon: <Star className="h-4 w-4" />,
        color: "bg-purple-500"
      };
    }
    
    // التصنيف الافتراضي
    return {
      type: "مناقشة",
      confidence: 60,
      description: "تعليق عام",
      icon: <MessageCircle className="h-4 w-4" />,
      color: "bg-gray-500"
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={classifyComment}
          disabled={isAnalyzing}
          size="sm"
          variant="outline"
          className="flex items-center gap-1 text-xs"
        >
          <Brain className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? "جاري التصنيف..." : "تصنيف ذكي"}
        </Button>
      </div>

      {classification && (
        <Card className="border-l-4 border-l-primary/60">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${classification.color} text-white flex items-center gap-1`}>
                {classification.icon}
                {classification.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                دقة: {classification.confidence}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {classification.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};