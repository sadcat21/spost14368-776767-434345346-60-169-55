import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Image, Wand2, CheckCircle, RefreshCw, Info, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { GeminiSmartSuggestions } from "./GeminiSmartSuggestions";
import { supabase } from "@/integrations/supabase/client";

interface GeminiLayerSuggestionsProps {
  currentImage?: string;
  overlaySettings?: any; // إعدادات الطبقة العلوية الحالية
  onApplySuggestions?: (suggestions: any) => void;
  geminiApiKey?: string; // مفتاح Gemini من ContentGenerator
  contentSettings?: any; // إعدادات المحتوى المختارة
  // إضافات للاقتراحات الذكية
  logoSettings?: any;
  textPositionSettings?: any;
  onApplyGeminiOverlaySuggestions?: (suggestions: any) => void;
  onApplyGeminiLogoSuggestions?: (suggestions: any) => void;
  onApplyGeminiTextSuggestions?: (suggestions: any) => void;
}

interface LayerSuggestion {
  settings: {
    gradient_type: string;
    first_color: string;
    first_color_opacity: number;
    first_color_position: number;
    second_color: string;
    second_color_opacity: number;
    second_color_position: number;
    gradient_angle: number;
    center_x: number;
    center_y: number;
    gradient_size: number;
    use_sharp_stops: boolean;
    global_opacity: number;
    blend_mode: string;
  };
  explanation: string;
  textPlacement?: {
    position: string;
    color: string;
    fontSize: string;
  };
  logoPlacement?: {
    position: string;
    opacity: number;
    size: string;
  };
}

export const GeminiLayerSuggestions: React.FC<GeminiLayerSuggestionsProps> = ({
  currentImage,
  overlaySettings,
  onApplySuggestions,
  geminiApiKey,
  contentSettings,
  logoSettings,
  textPositionSettings,
  onApplyGeminiOverlaySuggestions,
  onApplyGeminiLogoSuggestions,
  onApplyGeminiTextSuggestions
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<LayerSuggestion | null>(null);
  const [userDescription, setUserDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState<string>('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // تحويل الصورة إلى base64
  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  // تحليل الصورة واقتراح تصميم الطبقة العلوية
  const analyzeImageAndSuggestLayer = async () => {
    if (!currentImage) {
      toast.error('لا توجد صورة للتحليل');
      return;
    }

    if (!geminiApiKey) {
      toast.error('مفتاح Gemini غير متوفر. يرجى إدخال المفتاح في إعدادات توليد المحتوى');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // تحويل الصورة إلى base64
      const imageBase64 = await convertImageToBase64(currentImage);
      const imageMimeType = imageBase64.split(';')[0].split(':')[1];
      const imageData = imageBase64.split(',')[1];

      // الحصول على وصف المحتوى من الإعدادات
      const contentDescription = getContentDescription();

      // إعداد prompt محسّن
      const enhancedPrompt = `
      أنت خبير في تصميم الجرافيك وتحليل الصور. قم بتحليل الصورة المرفقة واقتراح أفضل تصميم للطبقة العلوية (overlay).

      السياق المطلوب: ${contentDescription}
      
      الإعدادات الحالية: ${overlaySettings ? JSON.stringify(overlaySettings, null, 2) : 'لا توجد إعدادات حالية'}

      يرجى تحليل الصورة وتقديم:
      
      1. تحليل شامل للصورة:
         - الألوان الرئيسية والثانوية
         - التركيب والعناصر الموجودة
         - المزاج العام والطابع
         - المناطق الفارغة المناسبة للنص
         - نقاط التركيز البصري

      2. اقتراح تدرج مناسب للطبقة العلوية:
         - نوع التدرج (خطي، دائري، مخروطي)
         - ألوان متناسقة مع الصورة
         - شفافية مناسبة
         - اتجاه وموضع التدرج

      3. اقتراحات النص واللوغو:
         - أفضل المواضع للنص
         - ألوان النص للحصول على أفضل تباين
         - حجم النص المناسب
         - موضع اللوغو الأمثل

      قدم النتيجة بصيغة JSON صحيحة:
      {
        "analysis": "تحليل مفصل شامل للصورة ومحتواها والألوان والتركيب",
        "settings": {
          "gradient_type": "linear",
          "first_color": "#000000",
          "first_color_opacity": 70,
          "first_color_position": 0,
          "second_color": "#ffffff",
          "second_color_opacity": 30,
          "second_color_position": 100,
          "gradient_angle": 135,
          "center_x": 50,
          "center_y": 50,
          "gradient_size": 100,
          "use_sharp_stops": false,
          "global_opacity": 60,
          "blend_mode": "normal"
        },
        "explanation": "تفسير مفصل لسبب اختيار هذه الإعدادات",
        "textPlacement": {
          "position": "وصف تفصيلي لأفضل مكان للنص مع المبررات",
          "color": "#ffffff",
          "fontSize": "large"
        },
        "logoPlacement": {
          "position": "وصف تفصيلي لأفضل مكان للوغو مع المبررات",
          "opacity": 80,
          "size": "medium"
        }
      }

      ملاحظات مهمة:
      - احرص على ترك مساحة كافية للنص واللوغو
      - تأكد من عدم حجب العناصر المهمة في الصورة
      - استخدم ألوان متناسقة مع لوحة ألوان الصورة
      - اهدف إلى تعزيز الصورة وليس طغيان الطبقة العلوية عليها
      - قدم تفسير واضح لكل اختيار
      `;

      // إرسال الطلب مباشرة إلى Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: enhancedPrompt
                },
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageData
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // محاولة استخراج JSON من النص
      let result;
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          
          // التأكد من وجود الحقول المطلوبة
          if (!result.analysis) {
            result.analysis = 'تم تحليل الصورة بنجاح';
          }
          if (!result.settings) {
            result.settings = {
              gradient_type: "linear",
              first_color: "#000000",
              first_color_opacity: 70,
              second_color: "#ffffff",
              second_color_opacity: 30,
              global_opacity: 60
            };
          }
          if (!result.explanation) {
            result.explanation = 'تم إنتاج إعدادات افتراضية مناسبة';
          }
          
        } else {
          result = { 
            analysis: generatedText,
            text: generatedText,
            settings: {
              gradient_type: "linear",
              first_color: "#000000",
              first_color_opacity: 70,
              second_color: "#ffffff", 
              second_color_opacity: 30,
              global_opacity: 60
            },
            explanation: 'تم إنتاج نتائج من التحليل النصي'
          };
        }
      } catch (e) {
        result = { 
          analysis: generatedText,
          text: generatedText,
          error: 'Failed to parse JSON response',
          settings: {
            gradient_type: "linear",
            first_color: "#000000",
            first_color_opacity: 70,
            second_color: "#ffffff",
            second_color_opacity: 30,
            global_opacity: 60
          }
        };
      }
      
      if (result.settings) {
        setSuggestions(result);
        setAnalysisResults(result.analysis || 'تم تحليل الصورة بنجاح');
        toast.success('تم تحليل الصورة وإنتاج الاقتراحات بنجاح!');
      } else {
        setAnalysisResults(result.analysis || result.text || 'تم الحصول على تحليل للصورة');
        toast.info('تم تحليل الصورة ولكن لم يتم إنتاج اقتراحات قابلة للتطبيق');
      }

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('حدث خطأ أثناء تحليل الصورة: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // الحصول على وصف المحتوى من الإعدادات
  const getContentDescription = () => {
    if (!contentSettings) {
      return userDescription || 'تصميم طبقة علوية مناسبة للصورة';
    }

    let description = '';
    
    if (contentSettings.specialty) {
      const specialtyLabel = specialties.find(s => s.value === contentSettings.specialty)?.label || contentSettings.specialty;
      description += `التخصص: ${specialtyLabel}. `;
    }
    
    if (contentSettings.contentType) {
      description += `نوع المحتوى: ${contentSettings.contentType}. `;
    }
    
    if (contentSettings.imageStyle) {
      description += `نمط الصورة: ${contentSettings.imageStyle}. `;
    }
    
    if (contentSettings.language) {
      const languageLabel = languages.find(l => l.value === contentSettings.language)?.label || contentSettings.language;
      description += `اللغة: ${languageLabel}. `;
    }

    if (userDescription) {
      description += `وصف إضافي: ${userDescription}`;
    }

    return description || 'تصميم طبقة علوية مناسبة للصورة';
  };

  // البيانات المرجعية للتخصصات واللغات
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

  const languages = [
    { value: "ar", label: "العربية" },
    { value: "en", label: "English" },
    { value: "ar-en", label: "عربي - إنجليزي" }
  ];

  // تطبيق اقتراحات الطبقة العلوية مع نفس صلاحيات معرض النماذج
  const applySuggestions = () => {
    if (suggestions && onApplySuggestions) {
      console.log('تطبيق اقتراحات Gemini للطبقة العلوية:', suggestions);
      
      // التأكد من وجود الإعدادات المطلوبة
      if (!suggestions.settings) {
        toast.error('لا توجد إعدادات للتطبيق في الاقتراحات');
        return;
      }
      
      // تطبيق الاقتراحات مباشرة (AdminTabsManager سيتولى المعالجة)
      onApplySuggestions(suggestions);
      toast.success('تم تطبيق اقتراحات الطبقة العلوية!');
    } else {
      console.error('لا توجد اقتراحات أو دالة التطبيق غير متوفرة');
      if (!suggestions) {
        toast.error('لا توجد اقتراحات لتطبيقها. يرجى تحليل الصورة أولاً.');
      } else {
        toast.error('خطأ في تطبيق الاقتراحات. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  // تطبيق اقتراحات الشعار
  const applyLogoSuggestions = () => {
    console.log('تطبيق اقتراحات الشعار:', suggestions?.logoPlacement);
    console.log('دالة التطبيق متوفرة:', !!onApplyGeminiLogoSuggestions);
    
    if (suggestions?.logoPlacement && onApplyGeminiLogoSuggestions) {
      // تحويل اقتراحات Gemini إلى إعدادات الشعار المناسبة
      const logoSuggestionSettings = {
        logoOpacity: suggestions.logoPlacement.opacity || 80,
        logoSize: suggestions.logoPlacement.size === 'small' ? 40 : 
                 suggestions.logoPlacement.size === 'medium' ? 60 : 
                 suggestions.logoPlacement.size === 'large' ? 80 : 60,
        // يمكن إضافة المزيد من الإعدادات هنا حسب اقتراحات Gemini
      };
      
      console.log('إعدادات الشعار المقترحة:', logoSuggestionSettings);
      onApplyGeminiLogoSuggestions(logoSuggestionSettings);
      toast.success('تم تطبيق اقتراحات موضع الشعار!');
    } else if (!suggestions?.logoPlacement) {
      console.log('لا توجد اقتراحات شعار في البيانات');
      toast.error('لا توجد اقتراحات للشعار. يرجى تحليل الصورة أولاً للحصول على اقتراحات الشعار.');
    } else if (!onApplyGeminiLogoSuggestions) {
      console.log('دالة تطبيق اقتراحات الشعار غير متوفرة');
      toast.error('خطأ: دالة تطبيق اقتراحات الشعار غير متوفرة');
    }
  };

  // تطبيق اقتراحات النص
  const applyTextSuggestions = () => {
    console.log('تطبيق اقتراحات النص:', suggestions?.textPlacement);
    console.log('دالة التطبيق متوفرة:', !!onApplyGeminiTextSuggestions);
    
    if (suggestions?.textPlacement && onApplyGeminiTextSuggestions) {
      // تحويل اقتراحات Gemini إلى إعدادات النص المناسبة
      const textSuggestionSettings = {
        useCustomTextPosition: true,
        // يمكن إضافة المزيد من الإعدادات هنا حسب اقتراحات Gemini
      };
      
      console.log('إعدادات النص المقترحة:', textSuggestionSettings);
      onApplyGeminiTextSuggestions(textSuggestionSettings);
      toast.success('تم تطبيق اقتراحات موضع النص!');
    } else if (!suggestions?.textPlacement) {
      console.log('لا توجد اقتراحات نص في البيانات');
      toast.error('لا توجد اقتراحات للنص. يرجى تحليل الصورة أولاً للحصول على اقتراحات النص.');
    } else if (!onApplyGeminiTextSuggestions) {
      console.log('دالة تطبيق اقتراحات النص غير متوفرة');
      toast.error('خطأ: دالة تطبيق اقتراحات النص غير متوفرة');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-right">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            طبقة Gemini الذكية
          </div>
          {suggestions && (
            <Button
              onClick={analyzeImageAndSuggestLayer}
              disabled={!currentImage || isAnalyzing}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              إعادة التوليد
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* وصف المحتوى المطلوب */}
        <div className="space-y-2">
          <Label htmlFor="description">وصف نوع المحتوى المطلوب</Label>
          <Textarea
            id="description"
            placeholder="صف نوع المحتوى الذي تريد تصميمه، مثل: منشور تحفيزي، إعلان منتج، محتوى تعليمي..."
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            className="text-right"
            rows={3}
          />
        </div>

        {/* معلومات الصورة الحالية */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Image className="h-4 w-4" />
          <span className="text-sm">
            {currentImage ? 'يوجد صورة جاهزة للتحليل' : 'لا توجد صورة للتحليل'}
          </span>
          {currentImage && (
            <Badge variant="outline" className="mr-auto">
              جاهز للتحليل
            </Badge>
          )}
        </div>

        {/* زر التحليل */}
        <Button 
          onClick={analyzeImageAndSuggestLayer}
          disabled={!currentImage || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري تحليل الصورة...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              تحليل الصورة واقتراح التصميم
            </>
          )}
        </Button>

        {/* نتائج التحليل */}
        {analysisResults && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-right">نتائج التحليل:</h4>
            <p className="text-sm text-muted-foreground text-right leading-relaxed">
              {analysisResults}
            </p>
          </div>
        )}

        {/* الاقتراحات */}
        {suggestions && (
          <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">اقتراحات Gemini</h4>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                جاهز للتطبيق
              </Badge>
            </div>
            
            {/* تفسير الاقتراحات */}
            <div className="p-3 bg-background rounded border text-right">
              <h5 className="font-medium mb-2">التفسير:</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {suggestions.explanation}
              </p>
            </div>

            {/* اقتراحات موضع النص واللوغو */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.textPlacement && (
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2 text-right">موضع النص:</h5>
                  <p className="text-sm text-muted-foreground text-right">
                    {suggestions.textPlacement.position}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {suggestions.textPlacement.color}
                    </Badge>
                    <Badge variant="outline">
                      {suggestions.textPlacement.fontSize}
                    </Badge>
                  </div>
                </div>
              )}
              
              {suggestions.logoPlacement && (
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2 text-right">موضع اللوغو:</h5>
                  <p className="text-sm text-muted-foreground text-right">
                    {suggestions.logoPlacement.position}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      شفافية: {suggestions.logoPlacement.opacity}%
                    </Badge>
                    <Badge variant="outline">
                      {suggestions.logoPlacement.size}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* أزرار تطبيق الاقتراحات المنفصلة */}
            <div className="space-y-3">
              {/* زر تطبيق اقتراحات الطبقة العلوية */}
              <Button 
                onClick={applySuggestions}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                تطبيق اقتراحات الطبقة العلوية
              </Button>
              
              {/* أزرار اقتراحات الشعار والنص */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.logoPlacement && (
                  <Button 
                    onClick={applyLogoSuggestions}
                    variant="outline"
                    size="sm"
                  >
                    تطبيق اقتراحات الشعار
                  </Button>
                )}
                
                {suggestions.textPlacement && (
                  <Button 
                    onClick={applyTextSuggestions}
                    variant="outline"
                    size="sm"
                  >
                    تطبيق اقتراحات النص
                  </Button>
                )}
              </div>
              
              {/* زر التفاصيل */}
              <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="default">
                    <Info className="h-4 w-4 mr-2" />
                    تفاصيل
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-right">تفاصيل اقتراحات Gemini الذكية</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 text-right">
                    {/* تحليل الصورة */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        تحليل الصورة
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysisResults || 'لا توجد نتائج تحليل متاحة'}
                      </p>
                    </div>
                    
                    {/* إعدادات الطبقة العلوية */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">إعدادات الطبقة العلوية المقترحة</h3>
                      <div className="text-xs bg-muted p-3 rounded font-mono text-left">
                        {JSON.stringify(suggestions?.settings, null, 2)}
                      </div>
                    </div>
                    
                    {/* تفسير الاقتراحات */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">التفسير والمبررات</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {suggestions?.explanation}
                      </p>
                    </div>
                    
                    {/* اقتراحات النص */}
                    {suggestions?.textPlacement && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">اقتراحات موضع النص</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestions.textPlacement.position}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">لون: {suggestions.textPlacement.color}</Badge>
                          <Badge variant="outline">حجم: {suggestions.textPlacement.fontSize}</Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* اقتراحات الشعار */}
                    {suggestions?.logoPlacement && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">اقتراحات موضع الشعار</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestions.logoPlacement.position}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">شفافية: {suggestions.logoPlacement.opacity}%</Badge>
                          <Badge variant="outline">حجم: {suggestions.logoPlacement.size}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* اقتراحات Gemini الذكية المتخصصة */}
        <GeminiSmartSuggestions
          currentImage={currentImage}
          geminiApiKey={geminiApiKey}
          logoSettings={logoSettings}
          textPositionSettings={textPositionSettings}
          overlaySettings={overlaySettings}
          onApplyOverlaySuggestions={onApplyGeminiOverlaySuggestions}
          onApplyLogoSuggestions={onApplyGeminiLogoSuggestions}
          onApplyTextSuggestions={onApplyGeminiTextSuggestions}
        />

        {/* معلومات إضافية */}
        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
          💡 يحلل Gemini الصورة ويقترح أفضل إعدادات للطبقة العلوية مع ترك مساحة مناسبة للنص واللوغو
        </div>

      </CardContent>
    </Card>
  );
};