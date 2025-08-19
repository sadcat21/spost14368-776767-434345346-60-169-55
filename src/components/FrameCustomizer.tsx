import { useState } from "react";
import { geminiApiManager } from "../utils/geminiApiManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Frame, RotateCcw, Sparkles, Loader2, Type } from "lucide-react";
import { toast } from "sonner";
import { OverlayTemplateGallery } from "./OverlayTemplateGallery";

export interface FrameSettings {
  showFrame: boolean;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
  opacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  // Text frame specific settings
  textFrameEnabled: boolean;
  textFrameBackground: string;
  textFrameOpacity: number;
  textFrameBorderColor: string;
  textFrameBorderWidth: number;
  textFrameBorderRadius: number;
  textFramePadding: number;
  textFrameShadowColor: string;
  textFrameShadowBlur: number;
  textFrameShadowOffsetX: number;
  textFrameShadowOffsetY: number;
  textFrameBorderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  textFrameBlur: number;
  textFramePosition: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  textFrameWidth: number;
  textFrameHeight: number;
  textAlignment: 'left' | 'center' | 'right';
  customFrameWidth: number;
  customFrameHeight: number;
  // تدرج خلفية إطار النص
  textFrameGradientEnabled: boolean;
  textFrameGradientDirection: number;
  textFrameGradientStart: string;
  textFrameGradientEnd: string;
  textFrameGradientStops: number;
  textFrameGradientStartOpacity: number;
  textFrameGradientEndOpacity: number;
  textFrameGradientStartPosition: number;
  textFrameGradientEndPosition: number;
  textFrameGradientType: 'linear' | 'radial' | 'conic';
}

interface FrameCustomizationProps {
  onUpdate: (settings: FrameSettings) => void;
  currentImageUrl?: string;
}

const defaultSettings: FrameSettings = {
  showFrame: true,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderColor: '#ffffff',
  borderWidth: 2,
  borderRadius: 12,
  padding: 20,
  opacity: 30,
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowBlur: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 4,
  borderStyle: 'solid',
  textFrameEnabled: true,
  textFrameBackground: 'rgba(0, 0, 0, 0.4)',
  textFrameOpacity: 40,
  textFrameBorderColor: '#ffffff',
  textFrameBorderWidth: 1,
  textFrameBorderRadius: 8,
  textFramePadding: 15,
  textFrameShadowColor: 'rgba(0, 0, 0, 0.6)',
  textFrameShadowBlur: 8,
  textFrameShadowOffsetX: 0,
  textFrameShadowOffsetY: 2,
  textFrameBorderStyle: 'solid',
  textFrameBlur: 10,
  textFramePosition: 'center',
  textFrameWidth: 80,
  textFrameHeight: 60,
  textAlignment: 'center',
  customFrameWidth: 90,
  customFrameHeight: 70,
  // تدرج خلفية إطار النص
  textFrameGradientEnabled: false,
  textFrameGradientDirection: 45,
  textFrameGradientStart: '#000000',
  textFrameGradientEnd: '#333333',
  textFrameGradientStops: 2,
  textFrameGradientStartOpacity: 40,
  textFrameGradientEndOpacity: 20,
  textFrameGradientStartPosition: 0,
  textFrameGradientEndPosition: 100,
  textFrameGradientType: 'linear'
};

export const FrameCustomizer = ({ onUpdate, currentImageUrl }: FrameCustomizationProps) => {
  const [settings, setSettings] = useState<FrameSettings>(defaultSettings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTemplateLoad = (templateSettings: FrameSettings) => {
    setSettings(templateSettings);
    onUpdate(templateSettings);
  };

  const updateSetting = <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    onUpdate(defaultSettings);
  };

  // تحويل صورة إلى base64 مع معالجة أفضل للأخطاء
  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      console.log('Converting image to base64:', imageUrl);
      
      // إنشاء عنصر صورة جديد
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // إنشاء canvas لتحويل الصورة
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('فشل في إنشاء context للـ canvas'));
              return;
            }
            
            // تعيين حجم الـ canvas
            canvas.width = img.width;
            canvas.height = img.height;
            
            // رسم الصورة على الـ canvas
            ctx.drawImage(img, 0, 0);
            
            // تحويل إلى base64
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = base64.split(',')[1];
            
            console.log('Successfully converted image to base64');
            resolve(base64Data);
          } catch (error) {
            console.error('Error in canvas conversion:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          console.error('Failed to load image:', imageUrl);
          reject(new Error('فشل في تحميل الصورة'));
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error in convertImageToBase64:', error);
      throw error;
    }
  };

  // استخراج JSON من النص مع معالجة محسنة
  const extractJsonFromText = (text: string) => {
    try {
      console.log('Extracting JSON from text:', text);
      
      // البحث عن JSON في النص
      const jsonMatches = text.match(/\{[\s\S]*?\}/g);
      
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            console.log('Successfully parsed JSON:', parsed);
            return parsed;
          } catch (parseError) {
            console.log('Failed to parse JSON match:', match);
            continue;
          }
        }
      }
      
      // إذا لم نجد JSON صحيح، نحاول تنظيف النص
      let cleanedText = text.trim();
      
      // إزالة أي نص قبل أول {
      const firstBrace = cleanedText.indexOf('{');
      if (firstBrace !== -1) {
        cleanedText = cleanedText.substring(firstBrace);
      }
      
      // إزالة أي نص بعد آخر }
      const lastBrace = cleanedText.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleanedText = cleanedText.substring(0, lastBrace + 1);
      }
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Failed to extract JSON:', error);
      throw new Error('فشل في استخراج البيانات من الاستجابة');
    }
  };

  const analyzeImageAndSuggestFrame = async () => {
    if (!currentImageUrl) {
      toast.error("لا توجد صورة لتحليلها");
      return;
    }

    setIsAnalyzing(true);
    console.log('Starting image analysis for:', currentImageUrl);
    
    try {
      // تحويل الصورة إلى base64
      let base64Data: string;
      try {
        base64Data = await convertImageToBase64(currentImageUrl);
      } catch (imageError) {
        console.error('Image conversion failed:', imageError);
        toast.error("فشل في تحويل الصورة للتحليل");
        return;
      }

      // اختيار نهج تحليل عشوائي
      const analysisApproaches = [
        "تحليل الألوان المهيمنة مع إعدادات النص",
        "تحليل التباين مع تأطير النص", 
        "تحليل المزاج مع تنسيق النص",
        "تحليل الألوان التكميلية للنص والإطار"
      ];
      
      const randomApproach = analysisApproaches[Math.floor(Math.random() * analysisApproaches.length)];
      
      // إعداد المعاملات
      const temperature = 0.7 + Math.random() * 0.3;
      
      console.log('Sending request to Gemini API...');
      
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `أنت خبير في تحليل الألوان وتصميم الإطارات. حلل هذه الصورة وقدم اقتراحات للألوان والإطارات.

قم بتطبيق نهج "${randomApproach}" على هذه الصورة.

يجب أن تكون الاستجابة JSON صحيح فقط بالتنسيق التالي:
{
  "dominantColors": ["لون1", "لون2", "لون3"],
  "colorAnalysis": "تحليل مفصل للألوان",
  "backgroundColor": "#000000",
  "borderColor": "#ffffff", 
  "borderWidth": ${Math.floor(Math.random() * 5) + 1},
  "borderRadius": ${Math.floor(Math.random() * 30) + 5},
  "padding": ${Math.floor(Math.random() * 20) + 15},
  "opacity": ${Math.floor(Math.random() * 30) + 10},
  "shadowColor": "#000000",
  "shadowBlur": ${Math.floor(Math.random() * 15) + 5},
  "shadowOffsetX": ${Math.floor(Math.random() * 11) - 5},
  "shadowOffsetY": ${Math.floor(Math.random() * 11) - 5},
  "borderStyle": "${['solid', 'dashed', 'dotted'][Math.floor(Math.random() * 3)]}",
  "textFrameEnabled": true,
  "textFrameBackground": "#000000",
  "textFrameOpacity": ${Math.floor(Math.random() * 30) + 10},
  "textFrameBorderColor": "#ffffff",
  "textFrameBorderWidth": ${Math.floor(Math.random() * 3) + 1},
  "textFrameBorderRadius": ${Math.floor(Math.random() * 20) + 5},
  "textFramePadding": ${Math.floor(Math.random() * 20) + 10},
  "textFrameShadowColor": "#000000",
  "textFrameShadowBlur": ${Math.floor(Math.random() * 10) + 3},
  "textFrameShadowOffsetX": ${Math.floor(Math.random() * 7) - 3},
  "textFrameShadowOffsetY": ${Math.floor(Math.random() * 7) - 3},
  "textFrameBorderStyle": "${['solid', 'dashed', 'dotted'][Math.floor(Math.random() * 3)]}",
  "textFrameBlur": ${Math.floor(Math.random() * 12) + 5},
   "textFramePosition": "${['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'][Math.floor(Math.random() * 9)]}",
   "textFrameWidth": ${Math.floor(Math.random() * 21) + 70},
   "textFrameHeight": ${Math.floor(Math.random() * 21) + 50},
   "textAlignment": "${['left', 'center', 'right'][Math.floor(Math.random() * 3)]}",
   "customFrameWidth": ${Math.floor(Math.random() * 31) + 70},
   "customFrameHeight": ${Math.floor(Math.random() * 31) + 60},
   "frameRationale": "شرح سبب اختيار هذه الإعدادات"
}

لا تضف أي نص خارج JSON.`
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: temperature,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from Gemini API:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('استجابة غير صحيحة من API');
      }

      const analysisText = data.candidates[0].content.parts[0].text;
      console.log('Analysis text:', analysisText);
      
      try {
        const analysis = extractJsonFromText(analysisText);
        
        // تطبيق الاقتراحات مع التحقق من القيم
        const newSettings: FrameSettings = {
          ...settings,
          backgroundColor: analysis.backgroundColor || '#000000',
          borderColor: analysis.borderColor || '#ffffff',
          borderWidth: Math.max(0, Math.min(10, analysis.borderWidth || 2)),
          borderRadius: Math.max(0, Math.min(50, analysis.borderRadius || 12)),
          padding: Math.max(10, Math.min(50, analysis.padding || 20)),
          opacity: Math.max(0, Math.min(50, analysis.opacity || 30)),
          shadowColor: analysis.shadowColor || 'rgba(0, 0, 0, 0.5)',
          shadowBlur: Math.max(0, Math.min(30, analysis.shadowBlur || 10)),
          shadowOffsetX: Math.max(-20, Math.min(20, analysis.shadowOffsetX || 0)),
          shadowOffsetY: Math.max(-20, Math.min(20, analysis.shadowOffsetY || 4)),
          borderStyle: analysis.borderStyle || 'solid',
          textFrameEnabled: analysis.textFrameEnabled ?? true,
          textFrameBackground: analysis.textFrameBackground || '#000000',
          textFrameOpacity: Math.max(0, Math.min(50, analysis.textFrameOpacity || 40)),
          textFrameBorderColor: analysis.textFrameBorderColor || '#ffffff',
          textFrameBorderWidth: Math.max(0, Math.min(5, analysis.textFrameBorderWidth || 1)),
          textFrameBorderRadius: Math.max(0, Math.min(30, analysis.textFrameBorderRadius || 8)),
          textFramePadding: Math.max(5, Math.min(40, analysis.textFramePadding || 15)),
          textFrameShadowColor: analysis.textFrameShadowColor || 'rgba(0, 0, 0, 0.6)',
          textFrameShadowBlur: Math.max(0, Math.min(20, analysis.textFrameShadowBlur || 8)),
          textFrameShadowOffsetX: Math.max(-15, Math.min(15, analysis.textFrameShadowOffsetX || 0)),
          textFrameShadowOffsetY: Math.max(-15, Math.min(15, analysis.textFrameShadowOffsetY || 2)),
          textFrameBorderStyle: analysis.textFrameBorderStyle || 'solid',
          textFrameBlur: Math.max(0, Math.min(20, analysis.textFrameBlur || 10)),
          textFramePosition: analysis.textFramePosition || 'center',
          textFrameWidth: Math.max(50, Math.min(100, analysis.textFrameWidth || 80)),
          textFrameHeight: Math.max(50, Math.min(100, analysis.textFrameHeight || 60)),
          textAlignment: analysis.textAlignment || 'center',
          customFrameWidth: Math.max(50, Math.min(100, analysis.customFrameWidth || 90)),
          customFrameHeight: Math.max(40, Math.min(90, analysis.customFrameHeight || 70))
        };
        
        setSettings(newSettings);
        onUpdate(newSettings);
        
        // عرض تفاصيل التحليل
        const analysisDetails = `
🎨 ${randomApproach}

🔍 الألوان المهيمنة: ${analysis.dominantColors?.join(', ') || 'تم التحليل بنجاح'}

📊 تحليل الألوان: ${analysis.colorAnalysis || 'تم التحليل بنجاح'}

🖼️ سبب الاختيار: ${analysis.frameRationale || 'تم اختيار الإعدادات بناءً على تحليل الصورة'}
        `;
        
        toast.success(analysisDetails, {
          duration: 8000,
        });
        
        console.log('Successfully applied new settings:', newSettings);
        
      } catch (parseError) {
        console.error("خطأ في تحليل النتائج:", parseError);
        toast.error("تم استلام الاستجابة لكن فشل في تحليلها. جاري المحاولة مرة أخرى...");
        
        // محاولة تطبيق إعدادات افتراضية محسنة
        const fallbackSettings = {
          ...settings,
          backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
          borderColor: '#ffffff',
          borderWidth: Math.floor(Math.random() * 5) + 1,
          borderRadius: Math.floor(Math.random() * 30) + 5,
          opacity: Math.floor(Math.random() * 30) + 10,
          textFrameEnabled: true,
          textFrameOpacity: Math.floor(Math.random() * 30) + 10
        };
        
        setSettings(fallbackSettings);
        onUpdate(fallbackSettings);
        toast.info("تم تطبيق إعدادات بديلة مُحسنة");
      }
    } catch (error) {
      console.error("خطأ في تحليل الصورة:", error);
      toast.error("فشل في تحليل الصورة: " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Frame className="h-5 w-5" />
          تخصيص الإطار
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Enable/Disable Frame */}
        <div className="flex items-center justify-between">
          <Label>إظهار الإطار</Label>
          <Switch
            checked={settings.showFrame}
            onCheckedChange={(value) => updateSetting("showFrame", value)}
          />
        </div>

        {settings.showFrame && (
          <>
            {/* Background Color */}
            <div className="space-y-2">
              <Label>لون الخلفية</Label>
              <Input
                type="color"
                value={settings.backgroundColor.includes("rgba") ? "#000000" : settings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Opacity - Limited to 50% */}
            <div className="space-y-2">
              <Label>شفافية الخلفية: {settings.opacity}%</Label>
              <Slider
                value={[settings.opacity]}
                onValueChange={([value]) => updateSetting("opacity", value)}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            {/* Border Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>لون الحدود</Label>
                <Input
                  type="color"
                  value={settings.borderColor}
                  onChange={(e) => updateSetting("borderColor", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>نمط الحدود</Label>
                <Select value={settings.borderStyle} onValueChange={(value: any) => updateSetting("borderStyle", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">مصمت</SelectItem>
                    <SelectItem value="dashed">متقطع</SelectItem>
                    <SelectItem value="dotted">نقطي</SelectItem>
                    <SelectItem value="double">مزدوج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Border Width */}
            <div className="space-y-2">
              <Label>سمك الحدود: {settings.borderWidth}px</Label>
              <Slider
                value={[settings.borderWidth]}
                onValueChange={([value]) => updateSetting("borderWidth", value)}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <Label>انحناء الزوايا: {settings.borderRadius}px</Label>
              <Slider
                value={[settings.borderRadius]}
                onValueChange={([value]) => updateSetting("borderRadius", value)}
                min={0}
                max={50}
                step={2}
                className="w-full"
              />
            </div>

            {/* Padding */}
            <div className="space-y-2">
              <Label>المسافة الداخلية: {settings.padding}px</Label>
              <Slider
                value={[settings.padding]}
                onValueChange={([value]) => updateSetting("padding", value)}
                min={10}
                max={50}
                step={2}
                className="w-full"
              />
            </div>

            {/* Shadow Settings */}
            <div className="space-y-4">
              <Label>إعدادات الظل</Label>
              
              <div className="space-y-2">
                <Label>لون الظل</Label>
                <Input
                  type="color"
                  value={settings.shadowColor.includes("rgba") ? "#000000" : settings.shadowColor}
                  onChange={(e) => updateSetting("shadowColor", e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>ضبابية الظل: {settings.shadowBlur}px</Label>
                <Slider
                  value={[settings.shadowBlur]}
                  onValueChange={([value]) => updateSetting("shadowBlur", value)}
                  min={0}
                  max={30}
                  step={2}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>إزاحة X: {settings.shadowOffsetX}px</Label>
                  <Slider
                    value={[settings.shadowOffsetX]}
                    onValueChange={([value]) => updateSetting("shadowOffsetX", value)}
                    min={-20}
                    max={20}
                    step={2}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>إزاحة Y: {settings.shadowOffsetY}px</Label>
                  <Slider
                    value={[settings.shadowOffsetY]}
                    onValueChange={([value]) => updateSetting("shadowOffsetY", value)}
                    min={-20}
                    max={20}
                    step={2}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Text Frame Settings */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    <div>
                      <CardTitle className="text-sm text-primary font-semibold">إعدادات تأطير النص</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">إعداد رئيسي فريد للإطار - يطبق إطار متخصص للنص فقط</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.textFrameEnabled}
                    onCheckedChange={(value) => updateSetting("textFrameEnabled", value)}
                  />
                </div>
              </CardHeader>
              
              {settings.textFrameEnabled && (
                <CardContent className="space-y-4">
                  
                  {/* Text Frame Position */}
                  <div className="space-y-2">
                    <Label>موقع إطار النص</Label>
                    <Select value={settings.textFramePosition} onValueChange={(value: any) => updateSetting("textFramePosition", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                       <SelectContent className="bg-background border shadow-lg z-50">
                         <SelectItem value="center">وسط</SelectItem>
                         <SelectItem value="top">أعلى</SelectItem>
                         <SelectItem value="bottom">أسفل</SelectItem>
                         <SelectItem value="left">يسار</SelectItem>
                         <SelectItem value="right">يمين</SelectItem>
                         <SelectItem value="top-left">أعلى يسار</SelectItem>
                         <SelectItem value="top-right">أعلى يمين</SelectItem>
                         <SelectItem value="bottom-left">أسفل يسار</SelectItem>
                         <SelectItem value="bottom-right">أسفل يمين</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>

                  {/* Text Frame Size */}
                  <div className="space-y-2">
                    <Label>عرض إطار النص: {settings.textFrameWidth}%</Label>
                    <Slider
                      value={[settings.textFrameWidth]}
                      onValueChange={([value]) => updateSetting("textFrameWidth", value)}
                      min={50}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                   </div>

                   {/* Text Frame Height */}
                   <div className="space-y-2">
                     <Label>ارتفاع إطار النص: {settings.textFrameHeight}%</Label>
                     <Slider
                       value={[settings.textFrameHeight]}
                       onValueChange={([value]) => updateSetting("textFrameHeight", value)}
                       min={30}
                       max={90}
                       step={5}
                       className="w-full"
                     />
                   </div>

                   {/* Text Alignment */}
                   <div className="space-y-2">
                     <Label>محاذاة النص</Label>
                     <Select value={settings.textAlignment} onValueChange={(value: any) => updateSetting("textAlignment", value)}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-background border shadow-lg z-50">
                         <SelectItem value="left">يسار</SelectItem>
                         <SelectItem value="center">وسط</SelectItem>
                         <SelectItem value="right">يمين</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   {/* Custom Frame Dimensions */}
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>عرض إطار مخصص: {settings.customFrameWidth}%</Label>
                       <Slider
                         value={[settings.customFrameWidth]}
                         onValueChange={([value]) => updateSetting("customFrameWidth", value)}
                         min={50}
                         max={100}
                         step={5}
                         className="w-full"
                       />
                     </div>
                     
                     <div className="space-y-2">
                       <Label>ارتفاع إطار مخصص: {settings.customFrameHeight}%</Label>
                       <Slider
                         value={[settings.customFrameHeight]}
                         onValueChange={([value]) => updateSetting("customFrameHeight", value)}
                         min={40}
                         max={90}
                         step={5}
                         className="w-full"
                       />
                      </div>
                    </div>

                  {/* Text Frame Background */}
                  <div className="space-y-2">
                    <Label>لون خلفية النص</Label>
                    <Input
                      type="color"
                      value={settings.textFrameBackground.includes("rgba") ? "#000000" : settings.textFrameBackground}
                      onChange={(e) => updateSetting("textFrameBackground", e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* Text Frame Opacity - Limited to 50% */}
                  <div className="space-y-2">
                    <Label>شفافية خلفية النص: {settings.textFrameOpacity}%</Label>
                    <Slider
                      value={[settings.textFrameOpacity]}
                      onValueChange={([value]) => updateSetting("textFrameOpacity", value)}
                      min={0}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Text Frame Border */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>لون حدود النص</Label>
                      <Input
                        type="color"
                        value={settings.textFrameBorderColor}
                        onChange={(e) => updateSetting("textFrameBorderColor", e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>نمط حدود النص</Label>
                      <Select value={settings.textFrameBorderStyle} onValueChange={(value: any) => updateSetting("textFrameBorderStyle", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">مصمت</SelectItem>
                          <SelectItem value="dashed">متقطع</SelectItem>
                          <SelectItem value="dotted">نقطي</SelectItem>
                          <SelectItem value="double">مزدوج</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Text Frame Border Width */}
                  <div className="space-y-2">
                    <Label>سمك حدود النص: {settings.textFrameBorderWidth}px</Label>
                    <Slider
                      value={[settings.textFrameBorderWidth]}
                      onValueChange={([value]) => updateSetting("textFrameBorderWidth", value)}
                      min={0}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Text Frame Border Radius */}
                  <div className="space-y-2">
                    <Label>انحناء زوايا النص: {settings.textFrameBorderRadius}px</Label>
                    <Slider
                      value={[settings.textFrameBorderRadius]}
                      onValueChange={([value]) => updateSetting("textFrameBorderRadius", value)}
                      min={0}
                      max={30}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  {/* Text Frame Padding */}
                  <div className="space-y-2">
                    <Label>المسافة الداخلية للنص: {settings.textFramePadding}px</Label>
                    <Slider
                      value={[settings.textFramePadding]}
                      onValueChange={([value]) => updateSetting("textFramePadding", value)}
                      min={5}
                      max={40}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  {/* Text Frame Blur */}
                  <div className="space-y-2">
                    <Label>ضبابية خلفية النص: {settings.textFrameBlur}px</Label>
                    <Slider
                      value={[settings.textFrameBlur]}
                      onValueChange={([value]) => updateSetting("textFrameBlur", value)}
                      min={0}
                      max={20}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  {/* Text Frame Shadow */}
                  <div className="space-y-4">
                    <Label>ظل إطار النص</Label>
                    
                    <div className="space-y-2">
                      <Label>لون ظل النص</Label>
                      <Input
                        type="color"
                        value={settings.textFrameShadowColor.includes("rgba") ? "#000000" : settings.textFrameShadowColor}
                        onChange={(e) => updateSetting("textFrameShadowColor", e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ضبابية ظل النص: {settings.textFrameShadowBlur}px</Label>
                      <Slider
                        value={[settings.textFrameShadowBlur]}
                        onValueChange={([value]) => updateSetting("textFrameShadowBlur", value)}
                        min={0}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>إزاحة X للظل: {settings.textFrameShadowOffsetX}px</Label>
                        <Slider
                          value={[settings.textFrameShadowOffsetX]}
                          onValueChange={([value]) => updateSetting("textFrameShadowOffsetX", value)}
                          min={-15}
                          max={15}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>إزاحة Y للظل: {settings.textFrameShadowOffsetY}px</Label>
                        <Slider
                          value={[settings.textFrameShadowOffsetY]}
                          onValueChange={([value]) => updateSetting("textFrameShadowOffsetY", value)}
                          min={-15}
                          max={15}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </>
        )}

        {/* AI Analysis Button */}
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Sparkles className="h-4 w-4" />
                تحليل ذكي للألوان واقتراح الإطار والنص
              </div>
              <p className="text-sm text-muted-foreground">
                يحلل الذكاء الاصطناعي ألوان الصورة الحالية ويقترح تنسيقات متكاملة للإطار الرئيسي وإطار النص بناءً على التحليل اللوني المتقدم
              </p>
              <Button 
                variant="default"
                onClick={analyzeImageAndSuggestFrame}
                disabled={!currentImageUrl || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري تحليل ألوان الصورة وإعداد التأطير...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    تحليل ذكي شامل للألوان والتأطير
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          إعادة تعيين الإعدادات
        </Button>

      </CardContent>
    </Card>
  );
};
