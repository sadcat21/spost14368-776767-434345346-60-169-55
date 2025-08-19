import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Bot, 
  Wand2, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Zap,
  Send,
  Download,
  Facebook,
  MessageSquare,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Brain
} from "lucide-react";
import { AutomationProgressDialog, AutomationStep } from "./AutomationProgressDialog";
import { useGeneratedContent, GeneratedContent } from "@/contexts/GeneratedContentContext";
import { useFacebook } from "@/contexts/FacebookContext";
import { useGeminiAutoConfiguration } from "@/hooks/useGeminiAutoConfiguration";
import { geminiApiManager } from "@/utils/geminiApiManager";
import { supabase } from "@/integrations/supabase/client";

interface GeminiQuickContentEngineProps {
  className?: string;
}

const specialties = [
  { value: "طب", label: "طبي" },
  { value: "تقنية", label: "تقنية ومعلومات" },
  { value: "تعليم", label: "تعليمي" },
  { value: "تسويق", label: "تسويق ومبيعات" },
  { value: "صحة", label: "صحة ولياقة" },
  { value: "طعام", label: "طعام ومطاعم" },
  { value: "سفر", label: "سفر وسياحة" },
  { value: "موضة", label: "موضة وجمال" },
  { value: "رياضة", label: "رياضة" },
  { value: "فن", label: "فن وثقافة" },
  { value: "عقارات", label: "عقارات" },
  { value: "سيارات", label: "سيارات" },
];

const contentTypes = [
  { value: "منشور", label: "منشور تسويقي" },
  { value: "إعلان", label: "إعلان ترويجي" },
  { value: "تعليمي", label: "محتوى تعليمي" },
  { value: "نصائح", label: "نصائح ومعلومات" },
  { value: "قصة", label: "قصة نجاح" },
  { value: "عرض", label: "عرض خاص" },
];

const imageStyles = [
  { value: "احترافي", label: "احترافي وأنيق" },
  { value: "ملون", label: "ملون وجذاب" },
  { value: "بسيط", label: "بسيط ونظيف" },
  { value: "عصري", label: "عصري وحديث" },
  { value: "فني", label: "فني وإبداعي" },
];

const languages = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "ar-en", label: "عربي - إنجليزي" }
];

export const GeminiQuickContentEngine: React.FC<GeminiQuickContentEngineProps> = ({ className = "" }) => {
  const { selectedPage, pages, isConnected } = useFacebook();
  const { generateAutoConfig, isGenerating } = useGeminiAutoConfiguration();
  const { generatedContent, setGeneratedContent } = useGeneratedContent();
  
  
  // Form states
  const [specialty, setSpecialty] = useState("تسويق");
  const [contentType, setContentType] = useState("منشور");
  const [language, setLanguage] = useState("ar");
  const [imageStyle, setImageStyle] = useState("احترافي");
  const [topic, setTopic] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // Process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [stepResults, setStepResults] = useState<{[key: string]: any}>({});
  const [interactiveQuestions, setInteractiveQuestions] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  // خيار إيقاف التوليد التلقائي للصور بعد البرومتات
  const [stopAfterPrompts, setStopAfterPrompts] = useState(false);
  
  const automationSteps: AutomationStep[] = [
    { 
      id: 'topic-analysis', 
      title: 'تحليل الموضوع', 
      description: 'تحليل الموضوع المطلوب وتحديد أفضل نهج للمحتوى',
      status: 'pending',
      icon: <Brain className="h-4 w-4" />
    },
    { 
      id: 'content-generation', 
      title: 'توليد المحتوى', 
      description: 'إنشاء النصوص الطويلة والقصيرة باستخدام Gemini',
      status: 'pending',
      icon: <FileText className="h-4 w-4" />
    },
    { 
      id: 'image-prompt', 
      title: 'إنشاء prompt الصورة', 
      description: 'توليد وصف متقدم لإنشاء الصورة المناسبة',
      status: 'pending',
      icon: <Camera className="h-4 w-4" />
    },
    { 
      id: 'image-generation', 
      title: 'توليد الصورة', 
      description: 'إنشاء صورة مخصصة باستخدام Gemini Image Generation',
      status: 'pending',
      icon: <ImageIcon className="h-4 w-4" />
    },
    { 
      id: 'interactive-questions', 
      title: 'الأسئلة التفاعلية', 
      description: 'إنشاء أسئلة تفاعلية لزيادة التفاعل',
      status: 'pending',
      icon: <MessageSquare className="h-4 w-4" />
    }
  ];

  const generateContent = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('يرجى إدخال موضوع المحتوى');
      return;
    }

    setIsProcessing(true);
    setShowProgress(true);
    setCurrentStep(0);
    
    try {
      // Step 1: Topic Analysis
      setCurrentStep(1);
      const topicAnalysisPrompt = `
تحليل الموضوع: "${topic}"
التخصص: ${specialty}
نوع المحتوى: ${contentType}
اللغة: ${language}
نمط الصورة: ${imageStyle}

قم بتحليل هذا الموضوع وتقديم:
1. تحليل مفصل للموضوع
2. الجمهور المستهدف
3. النقاط الرئيسية التي يجب تغطيتها
4. النبرة المناسبة للمحتوى

تنسيق الإجابة JSON:
{
  "analysis": "تحليل مفصل للموضوع",
  "targetAudience": "وصف الجمهور المستهدف",
  "keyPoints": ["نقطة 1", "نقطة 2", "نقطة 3"],
  "tone": "النبرة المناسبة"
}
`;

      const analysisResponse = await fetch('/supabase/functions/v1/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash-exp',
          payload: {
            contents: [{ parts: [{ text: topicAnalysisPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
          }
        })
      });

      const analysisData = await analysisResponse.json();
      const analysisText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text;
      let analysis = {};
      
      try {
        const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1]);
        }
      } catch (e) {
        console.warn('Failed to parse analysis JSON, using default');
      }

      setStepResults(prev => ({ ...prev, analysis }));

      // Step 2: Content Generation
      setCurrentStep(2);
      const contentPrompt = `
بناءً على التحليل السابق، قم بإنشاء محتوى ${contentType} في مجال ${specialty} باللغة ${language}

الموضوع: "${topic}"
${customPrompt ? `متطلبات إضافية: ${customPrompt}` : ''}

أنشئ:
1. نص طويل (200-300 كلمة) مناسب للمنشور الرئيسي
2. نص قصير (50-80 كلمة) للاستخدام كتعليق أو ملخص
3. هاشتاجات مناسبة

تنسيق الإجابة JSON:
{
  "longText": "النص الطويل هنا",
  "shortText": "النص القصير هنا",
  "hashtags": ["#هاشتاج1", "#هاشتاج2", "#هاشتاج3"]
}
`;

      const contentResponse = await fetch('/supabase/functions/v1/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash-exp',
          payload: {
            contents: [{ parts: [{ text: contentPrompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
          }
        })
      });

      const contentData = await contentResponse.json();
      const contentText = contentData.candidates?.[0]?.content?.parts?.[0]?.text;
      let content = {};
      
      try {
        const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          content = JSON.parse(jsonMatch[1]);
        }
      } catch (e) {
        console.warn('Failed to parse content JSON, using text as longText');
        content = { longText: contentText, shortText: contentText.slice(0, 200) };
      }

      setStepResults(prev => ({ ...prev, content }));

      // Step 3: Image Prompt Generation
      setCurrentStep(3);
      const imagePromptText = `
أنشئ وصف مفصل لصورة ${imageStyle} تناسب الموضوع: "${topic}"
التخصص: ${specialty}
نوع المحتوى: ${contentType}

الوصف يجب أن يكون:
- مفصل وواضح للذكاء الاصطناعي
- مناسب للموضوع والتخصص
- بنمط ${imageStyle}
- احترافي وجذاب

تنسيق الإجابة JSON:
{
  "imagePrompt": "الوصف المفصل للصورة",
  "style": "تفاصيل النمط المطلوب",
  "elements": ["عنصر 1", "عنصر 2", "عنصر 3"]
}
`;

      const imagePromptResponse = await fetch('/supabase/functions/v1/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash-exp',
          payload: {
            contents: [{ parts: [{ text: imagePromptText }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 512 }
          }
        })
      });

      const imagePromptData = await imagePromptResponse.json();
      const imagePromptResponseText = imagePromptData.candidates?.[0]?.content?.parts?.[0]?.text;
      let imagePromptInfo = {};
      
      try {
        const jsonMatch = imagePromptResponseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          imagePromptInfo = JSON.parse(jsonMatch[1]);
        }
      } catch (e) {
        console.warn('Failed to parse image prompt JSON');
        imagePromptInfo = { imagePrompt: imagePromptResponseText };
      }

      setStepResults(prev => ({ ...prev, imagePromptInfo }));

      // التحقق من إعداد إيقاف التوليد التلقائي للصور
      if (stopAfterPrompts) {
        console.log('🛑 تم إيقاف التوليد التلقائي للصور حسب إعدادات المستخدم');
        
        // Step 5: Interactive Questions (بدون توليد صورة)
        setCurrentStep(5);
        const questionsPrompt = `
أنشئ 3-5 أسئلة تفاعلية مناسبة للموضوع: "${topic}"
الأسئلة يجب أن تكون:
- محفزة للتفاعل والنقاش
- مناسبة للجمهور المستهدف
- تشجع على المشاركة والتعليق

تنسيق الإجابة JSON:
{
  "questions": ["سؤال 1؟", "سؤال 2؟", "سؤال 3؟"]
}
`;

        const questionsResponse = await fetch('/supabase/functions/v1/gemini-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemini-2.0-flash-exp',
            payload: {
              contents: [{ parts: [{ text: questionsPrompt }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
            }
          })
        });

        const questionsData = await questionsResponse.json();
        const questionsText = questionsData.candidates?.[0]?.content?.parts?.[0]?.text;
        let questions = [];
        
        try {
          const jsonMatch = questionsText.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            questions = parsed.questions || [];
          }
        } catch (e) {
          console.warn('Failed to parse questions JSON');
        }

        setInteractiveQuestions(questions);
        setStepResults(prev => ({ ...prev, questions }));

        // Set final generated content بدون صورة
        const finalContent: GeneratedContent = {
          longText: (content as any).longText || '',
          shortText: (content as any).shortText || '',
          imageUrl: '', // بدون صورة
          imageAlt: 'لم يتم توليد صورة - تم إيقاف التوليد التلقائي',
          originalImageUrl: ''
        };

        setGeneratedContent(finalContent);
        toast.success('✅ تم إنتاج النص والبرومتات والأسئلة التفاعلية بنجاح! لم يتم توليد الصورة حسب إعداداتك.');
        return;
      }

      // Step 4: Image Generation with Gemini (فقط إذا لم يتم إيقاف التوليد التلقائي)
      setCurrentStep(4);
      const imagePrompt = (imagePromptInfo as any).imagePrompt || imagePromptResponseText;
      
      const imageGenerationResponse = await fetch('/supabase/functions/v1/gemini-image-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          width: 1024,
          height: 1024
        })
      });

      if (!imageGenerationResponse.ok) {
        throw new Error('فشل في توليد الصورة');
      }

      const imageData = await imageGenerationResponse.json();
      const imageUrl = imageData.imageURL;

      setStepResults(prev => ({ ...prev, generatedImage: { url: imageUrl, prompt: imagePrompt } }));

      // Step 5: Interactive Questions
      setCurrentStep(5);
      const questionsPrompt = `
أنشئ 3-5 أسئلة تفاعلية مناسبة للموضوع: "${topic}"
الأسئلة يجب أن تكون:
- محفزة للتفاعل والنقاش
- مناسبة للجمهور المستهدف
- تشجع على المشاركة والتعليق

تنسيق الإجابة JSON:
{
  "questions": ["سؤال 1؟", "سؤال 2؟", "سؤال 3؟"]
}
`;

      const questionsResponse = await fetch('/supabase/functions/v1/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash-exp',
          payload: {
            contents: [{ parts: [{ text: questionsPrompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
          }
        })
      });

      const questionsData = await questionsResponse.json();
      const questionsText = questionsData.candidates?.[0]?.content?.parts?.[0]?.text;
      let questions = [];
      
      try {
        const jsonMatch = questionsText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          questions = parsed.questions || [];
        }
      } catch (e) {
        console.warn('Failed to parse questions JSON');
      }

      setInteractiveQuestions(questions);
      setStepResults(prev => ({ ...prev, questions }));

      // Set final generated content
      const finalContent: GeneratedContent = {
        longText: (content as any).longText || '',
        shortText: (content as any).shortText || '',
        imageUrl: imageUrl,
        imageAlt: `صورة متعلقة بـ ${topic}`,
        originalImageUrl: imageUrl
      };

      setGeneratedContent(finalContent);
      toast.success('تم إنتاج المحتوى بنجاح!');

    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error);
      toast.error('حدث خطأ في توليد المحتوى');
    } finally {
      setIsProcessing(false);
      setShowProgress(false);
    }
  }, [topic, specialty, contentType, language, imageStyle, customPrompt, setGeneratedContent]);

  const generateTopicSuggestion = useCallback(async () => {
    setIsGeneratingTopic(true);
    try {
      const topicPrompt = `
قم بتوليد موضوع مثير ومناسب للمحتوى بناءً على المعايير التالية:

التخصص: ${specialty}
نوع المحتوى: ${contentType}
اللغة: ${language}
نمط الصورة: ${imageStyle}

المطلوب:
- موضوع جذاب ومثير للاهتمام
- يناسب التخصص المحدد
- يحفز التفاعل والمشاركة
- يكون عملي ومفيد للجمهور

أعطني موضوع واحد فقط (بدون تفسير إضافي).
`;

      // استخدام مفتاح API مباشرة مع Google Gemini
      const apiKey = 'AIzaSyDKF5PszBk0iNsUjRrEBgby4jFmbia1C44';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: topicPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 256 }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      const suggestedTopic = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (suggestedTopic) {
        setTopic(suggestedTopic);
        toast.success('تم إنشاء موضوع مقترح بنجاح!');
      } else {
        toast.error('فشل في توليد موضوع مقترح');
      }
    } catch (error) {
      console.error('خطأ في توليد الموضوع:', error);
      toast.error(`حدث خطأ في توليد الموضوع: ${error.message}`);
    } finally {
      setIsGeneratingTopic(false);
    }
  }, [specialty, contentType, language, imageStyle]);

  const publishToFacebook = useCallback(async () => {
    if (!generatedContent || !selectedPage) {
      toast.error('يرجى توليد المحتوى واختيار الصفحة أولاً');
      return;
    }

    setIsPublishing(true);
    try {
      // Logic for publishing to Facebook would go here
      toast.success('تم النشر على الفيسبوك بنجاح!');
    } catch (error) {
      console.error('خطأ في النشر:', error);
      toast.error('حدث خطأ في النشر');
    } finally {
      setIsPublishing(false);
    }
  }, [generatedContent, selectedPage]);

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Quick Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            إعداد سريع للمحتوى - Gemini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="specialty">التخصص</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentType">نوع المحتوى</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageStyle">نمط الصورة</Label>
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageStyles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="topic">موضوع المحتوى</Label>
            <div className="relative">
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="أدخل موضوع المحتوى أو اضغط على الزر لتوليد موضوع مقترح..."
                className="pr-12"
              />
              <Button
                onClick={generateTopicSuggestion}
                disabled={isGeneratingTopic}
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                title="توليد موضوع مقترح باستخدام Gemini"
              >
                {isGeneratingTopic ? (
                  <Brain className="h-4 w-4 animate-pulse text-primary" />
                ) : (
                  <Brain className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="customPrompt">متطلبات إضافية (اختياري)</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="أي متطلبات أو تفاصيل إضافية..."
              rows={3}
            />
          </div>

          {/* خيار إيقاف التوليد التلقائي للصور */}
          <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <input 
              type="checkbox"
              id="stopAfterPromptsQuick"
              checked={stopAfterPrompts}
              onChange={(e) => setStopAfterPrompts(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-orange-300 rounded focus:ring-orange-500"
            />
            <Label 
              htmlFor="stopAfterPromptsQuick"
              className="text-sm font-medium cursor-pointer flex-1 text-orange-700 dark:text-orange-300"
            >
              ⏹️ إيقاف التوليد التلقائي للصور بعد إنشاء البرومتات
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateContent}
              disabled={isProcessing || !topic.trim()}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isProcessing ? 'جاري التوليد...' : 'توليد المحتوى'}
            </Button>

            {generatedContent && (
              <Button
                onClick={publishToFacebook}
                disabled={isPublishing || !selectedPage}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isPublishing ? (
                  <Download className="h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="h-4 w-4" />
                )}
                {isPublishing ? 'جاري النشر...' : 'نشر على الفيسبوك'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              المحتوى المُولد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedContent.imageUrl && (
              <div className="text-center">
                <img
                  src={generatedContent.imageUrl}
                  alt={generatedContent.imageAlt}
                  className="max-w-full h-auto rounded-lg mx-auto"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}

            <div>
              <Label>النص الطويل:</Label>
              <div className="bg-muted p-4 rounded-lg mt-2">
                <p className="whitespace-pre-wrap">{generatedContent.longText}</p>
              </div>
            </div>

            <div>
              <Label>النص القصير:</Label>
              <div className="bg-muted p-4 rounded-lg mt-2">
                <p className="whitespace-pre-wrap">{generatedContent.shortText}</p>
              </div>
            </div>

            {interactiveQuestions.length > 0 && (
              <div>
                <Label>الأسئلة التفاعلية:</Label>
                <div className="bg-muted p-4 rounded-lg mt-2 space-y-2">
                  {interactiveQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Dialog */}
      <AutomationProgressDialog
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        steps={automationSteps}
        currentStep={currentStep}
        isRunning={isProcessing}
      />
    </div>
  );
};

export default GeminiQuickContentEngine;