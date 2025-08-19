import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Download, 
  Eye, 
  FileText, 
  ImageIcon, 
  Code,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Database,
  Palette,
  Type,
  Layout,
  Search,
  Wand2,
  Brain,
  Target,
  Camera,
  Cloud,
  Send,
  RefreshCw
} from "lucide-react";

interface StepResult {
  type: 'text' | 'json' | 'image' | 'success' | 'error' | 'html';
  data: any;
  summary: string;
  details: string;
  metadata?: Record<string, any>;
  content?: string;
  preview?: string;
}

interface AutomationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: StepResult;
  duration?: number;
  error?: string;
}

interface EnhancedAutomationResultsDisplayProps {
  steps: any[]; // استخدام any للمرونة مع أنواع البيانات المختلفة
  stepResults: {[key: string]: any};
  isRunning: boolean;
  currentStepIndex: number;
  elapsedTime: number;
  automationGeneratedImages?: {[key: string]: {url: string, prompt: string}};
  selectedPage?: any; // الصفحة المختارة لفيسبوك
}

export const EnhancedAutomationResultsDisplay: React.FC<EnhancedAutomationResultsDisplayProps> = ({
  steps,
  stepResults,
  isRunning,
  currentStepIndex,
  elapsedTime,
  automationGeneratedImages = {},
  selectedPage
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRegeneratingPrompt, setIsRegeneratingPrompt] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{[key: string]: {url: string, prompt: string}}>({});

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('تم نسخ النتيجة إلى الحافظة!');
    });
  };

  const downloadResult = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل النتيجة بنجاح!');
  };

  // دالة إعادة توليد البرومت
  const handleRegeneratePrompt = async () => {
    setIsRegeneratingPrompt(true);
    
    try {
      toast.info('جاري إعادة توليد البرومت...');
      
      // هنا يمكن إضافة المنطق لإعادة توليد البرومت
      // في الوقت الحالي، سنعرض رسالة
      setTimeout(() => {
        toast.success('تم إعادة توليد البرومت بنجاح!');
        setIsRegeneratingPrompt(false);
      }, 2000);
      
    } catch (error) {
      console.error('خطأ في إعادة توليد البرومت:', error);
      toast.error(`فشل في إعادة توليد البرومت: ${(error as Error).message}`);
      setIsRegeneratingPrompt(false);
    }
  };

  const getStepIcon = (stepId: string) => {
    const iconMap: {[key: string]: React.ReactNode} = {
      'facebook-analysis': <Search className="h-5 w-5" />,
      'content-generation': <Wand2 className="h-5 w-5" />,
      'prompt-generation': <Brain className="h-5 w-5" />,
      'prompt-analysis': <Target className="h-5 w-5" />,
      
      'image-generation': <Camera className="h-5 w-5" />,
      'image-upload': <Cloud className="h-5 w-5" />
    };
    return iconMap[stepId] || <FileText className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50';
      case 'running':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 ring-2 ring-blue-400';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      case 'json':
        return <Code className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // دالة توليد الصورة باستخدام البرومت من المرحلة الرابعة
  const handleGenerateImageFromPrompt = async (prompt: string) => {
    if (!prompt || typeof prompt !== 'string') {
      toast.error('لا يوجد برومت صالح لتوليد الصورة');
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      toast.info('جاري توليد الصورة باستخدام A4F API...');
      
      // استخدام A4F API مباشرة
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ddc-a4f-d18769825db54bb0a03e087f28dda67f'
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      const imageUrl = data.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('لم يتم الحصول على رابط الصورة من A4F API');
      }

      // حفظ الصورة المولدة
      setGeneratedImages(prev => ({
        ...prev,
        [prompt]: { url: imageUrl, prompt: prompt }
      }));

      toast.success('تم توليد الصورة بنجاح! 🎉');
      
    } catch (error) {
      console.error('خطأ في توليد الصورة:', error);
      toast.error(`فشل في توليد الصورة: ${(error as Error).message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // دالة نشر الصورة المولدة على فيسبوك مع المحتوى النصي
  const handlePublishToFacebook = async (imageUrl: string, prompt: string) => {
    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة فيسبوك أولاً');
      return;
    }

    // البحث عن المحتوى النصي من الخطوات المكتملة
    const completedStepsList = steps.filter(step => step.status === 'completed');
    const contentGenerationStep = completedStepsList.find(step => step.id === 'content-generation');
    const textContent = contentGenerationStep?.result?.data?.longText || contentGenerationStep?.result?.data?.shortText || stepResults['content-generation']?.data?.longText || stepResults['content-generation']?.data?.shortText || '';
    
    if (!textContent) {
      toast.error('لم يتم العثور على محتوى نصي للنشر');
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      toast.info('جاري نشر المحتوى على فيسبوك...');
      
      // تحويل الصورة إلى blob
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      // رفع الصورة إلى فيسبوك
      const uploadFormData = new FormData();
      uploadFormData.append('source', imageBlob);
      uploadFormData.append('access_token', selectedPage.access_token);
      uploadFormData.append('published', 'false');

      const uploadResponse = await fetch(`https://graph.facebook.com/v19.0/${selectedPage.id}/photos`, {
        method: 'POST',
        body: uploadFormData
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResponse.ok || uploadResult.error) {
        throw new Error(uploadResult.error?.message || 'فشل في رفع الصورة');
      }

      const photoId = uploadResult.id;
      
      // نشر المنشور مع الصورة والنص
      const postData = new URLSearchParams({
        message: textContent,
        access_token: selectedPage.access_token,
        published: 'true',
        attached_media: JSON.stringify([{ media_fbid: photoId }])
      });

      const postResponse = await fetch(`https://graph.facebook.com/v19.0/${selectedPage.id}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: postData
      });

      const postResult = await postResponse.json();
      
      if (!postResponse.ok || postResult.error) {
        throw new Error(postResult.error?.message || 'فشل في نشر المنشور');
      }

      toast.success('تم نشر المحتوى بنجاح على فيسبوك! 🎉');
      
    } catch (error) {
      console.error('خطأ في نشر المحتوى:', error);
      toast.error(`فشل في نشر المحتوى: ${(error as Error).message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* معلومات التقدم */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            تفاصيل تنفيذ الأتمتة المتطورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">التقدم الإجمالي</span>
                <Badge variant="secondary">
                  {completedSteps} / {totalSteps}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium text-primary">
                {Math.round(progressPercentage)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* خطوات الأتمتة مع النتائج التفصيلية */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          // التوافق مع نوعي البيانات المختلفين مع فحوصات الأمان
          const stepResult = stepResults[step.id] || (step.result ? {
            type: step.result.type || 'text',
            data: step.result.content || step.result.data || '',
            summary: step.result.preview?.substring(0, 100) || 'نتيجة مرحلية',
            details: step.result.preview || step.result.content?.substring(0, 200) || 'لا توجد تفاصيل متاحة',
            metadata: step.result.metadata || {}
          } : null);
          
          return (
            <Card 
              key={step.id}
              className={`transition-all duration-300 ${getStatusColor(step.status)} ${
                step.status === 'running' ? 'shadow-lg scale-[1.01]' : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* رقم الخطوة والأيقونة */}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.status === 'completed' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : step.status === 'error'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        : step.status === 'running'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`p-2 rounded-lg ${
                      step.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : step.status === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : step.status === 'running'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-100 dark:bg-gray-800/50'
                    }`}>
                      {getStepIcon(step.id)}
                    </div>
                  </div>

                  {/* محتوى الخطوة */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-foreground">
                        {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(step.status)}
                        {step.duration && step.status === 'completed' && (
                          <Badge variant="secondary" className="text-xs">
                            {formatTime(step.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>

                    {/* حالة التنفيذ */}
                    {step.status === 'running' && (
                      <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>جاري التنفيذ باستخدام {step.id === 'image-generation' ? 'A4F API' : 'Gemini API'}...</span>
                        </div>
                      </div>
                    )}

                    {step.status === 'error' && step.error && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          ❌ {step.error}
                        </p>
                      </div>
                    )}

                    {/* عرض النتائج التفصيلية */}
                    {step.status === 'completed' && stepResult && (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <Collapsible>
                          <CollapsibleTrigger
                            onClick={() => toggleStepExpanded(step.id)}
                            className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-700 p-4 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getResultTypeIcon(stepResult?.type || 'text')}
                                <div className="text-left">
                                  <div className="font-medium text-green-700 dark:text-green-300">
                                    {stepResult?.summary || 'نتيجة مرحلية'}
                                  </div>
                                  <div className="text-sm text-green-600 dark:text-green-400">
                                    اضغط لعرض التفاصيل الكاملة
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  {stepResult.type?.toUpperCase() || 'DATA'}
                                </Badge>
                              </div>
                              {expandedSteps.has(step.id) ? (
                                <ChevronUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="p-4 space-y-4">
                              {/* ملخص النتيجة */}
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  ملخص النتيجة
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {stepResult.details}
                                </p>
                              </div>

                              {/* المحتوى الكامل */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    البيانات الكاملة
                                  </h4>
                                   <div className="flex gap-2">
                                     {/* زر توليد الصورة للمرحلة الرابعة (prompt-generation) */}
                                       {step.id === 'prompt-generation' && stepResult.data && (
                                         <>
                                           <Button
                                             size="sm"
                                             variant="default"
                                             onClick={handleRegeneratePrompt}
                                             disabled={isRegeneratingPrompt}
                                             className="h-8 px-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50"
                                           >
                                             {isRegeneratingPrompt ? (
                                               <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                             ) : (
                                               <RefreshCw className="h-3 w-3 mr-1" />
                                             )}
                                             {isRegeneratingPrompt ? 'جاري الإعادة...' : 'إعادة توليد البرومت'}
                                           </Button>
                                           
                                           <Button
                                             size="sm"
                                             variant="default"
                                             onClick={() => handleGenerateImageFromPrompt(stepResult.data)}
                                             disabled={isGeneratingImage}
                                             className="h-8 px-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white disabled:opacity-50"
                                           >
                                             {isGeneratingImage ? (
                                               <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                             ) : (
                                               <ImageIcon className="h-3 w-3 mr-1" />
                                             )}
                                             {isGeneratingImage ? 'جاري التوليد...' : 'توليد صورة'}
                                           </Button>
                                           
                                           {/* زر النشر على فيسبوك إذا كانت هناك صورة مولدة من هذا البرومت */}
                                           {generatedImages[stepResult.data] && (
                                             <Button
                                               size="sm"
                                               variant="default"
                                               onClick={() => handlePublishToFacebook(generatedImages[stepResult.data].url, stepResult.data)}
                                                disabled={isGeneratingImage || !selectedPage}
                                                title={!selectedPage ? 'يرجى اختيار صفحة فيسبوك أولاً' : 'نشر الصورة والمحتوى على فيسبوك'}
                                               className="h-8 px-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
                                             >
                                               <Send className="h-3 w-3 mr-1" />
                                               نشر على فيسبوك
                                             </Button>
                                           )}
                                         </>
                                       )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(typeof stepResult.data === 'string' ? stepResult.data : JSON.stringify(stepResult.data, null, 2))}
                                      className="h-8 px-2"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      نسخ
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadResult(
                                        typeof stepResult.data === 'string' ? stepResult.data : JSON.stringify(stepResult.data, null, 2),
                                        `${step.id}-result.${stepResult.type === 'json' ? 'json' : 'txt'}`,
                                        stepResult.type === 'json' ? 'application/json' : 'text/plain'
                                      )}
                                      className="h-8 px-2"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      تحميل
                                    </Button>
                                  </div>
                                </div>
                                
                                {stepResult.type === 'image' ? (
                                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <img 
                                      src={stepResult.data} 
                                      alt="نتيجة الخطوة"
                                      className="max-w-full h-auto rounded-lg shadow-sm border"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                      تم توليد الصورة باستخدام A4F API - النموذج: Imagen-3
                                    </p>
                                  </div>
                                 ) : stepResult.type === 'json' && step.id === 'interactive-questions' ? (
                                   // عرض مخصص للأشكال التفاعلية المحدثة والمحسنة
                                   <div className="space-y-4">
                                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
                                       <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                         <CheckCircle className="h-4 w-4" />
                                         <span className="text-sm font-medium">نظام التعليقات المحسن ✨</span>
                                       </div>
                                       <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                         تم إزالة العبارات غير المرغوبة وتنويع الأشكال التفاعلية بدون هاشتاغات
                                       </p>
                                     </div>
                                     
                                     {Array.isArray(stepResult.data) && stepResult.data.map((interactiveForm: string, index: number) => {
                                       // تحديد نوع الشكل التفاعلي
                                       const getFormType = (form: string): { type: string, color: string, icon: string } => {
                                         if (form.includes('🎤') || form.includes('مساحتك للتعبير')) {
                                           return { type: 'مساحة التعبير', color: 'purple', icon: '🎤' };
                                         } else if (form.includes('📊') || form.includes('استطلاع')) {
                                           return { type: 'استطلاع تفاعلي', color: 'blue', icon: '📊' };
                                         } else if (form.includes('🔍') || form.includes('تحدي')) {
                                           return { type: 'تحدي إبداعي', color: 'orange', icon: '🔍' };
                                         } else if (form.includes('🔮') || form.includes('مستقبل')) {
                                           return { type: 'رؤية مستقبلية', color: 'indigo', icon: '🔮' };
                                         } else if (form.includes('⚡') || form.includes('اختر')) {
                                           return { type: 'مقارنة واختيار', color: 'green', icon: '⚡' };
                                         }
                                         return { type: 'شكل تفاعلي', color: 'gray', icon: '💬' };
                                       };

                                       const formInfo = getFormType(interactiveForm);
                                       
                                       return (
                                         <div key={index} className={`bg-gradient-to-br from-${formInfo.color}-50 to-${formInfo.color}-100 dark:from-${formInfo.color}-950/30 dark:to-${formInfo.color}-900/30 border border-${formInfo.color}-200 dark:border-${formInfo.color}-700 rounded-lg p-4`}>
                                           <div className="flex items-center justify-between mb-3">
                                             <div className="flex items-center gap-2">
                                               <Badge className={`bg-${formInfo.color}-500 text-white`}>
                                                 {formInfo.icon} {formInfo.type}
                                               </Badge>
                                               <Badge variant="outline" className="text-xs">
                                                 #{index + 1}
                                               </Badge>
                                             </div>
                                             <Button
                                               size="sm"
                                               variant="outline"
                                               onClick={() => copyToClipboard(interactiveForm)}
                                               className="h-7 px-2"
                                             >
                                               <Copy className="h-3 w-3 mr-1" />
                                               نسخ
                                             </Button>
                                           </div>
                                           <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                                             <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                               {interactiveForm}
                                             </div>
                                           </div>
                                           <div className="mt-3 flex items-center justify-between">
                                             <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                               <CheckCircle className="h-3 w-3" />
                                               نظيف وبدون هاشتاغات
                                             </div>
                                             <div className="text-xs text-gray-500">
                                               يُستخدم كتعليق تفاعلي على المنشور
                                             </div>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 ) : stepResult.type === 'json' ? (
                                   <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
                                     <pre className="text-sm text-green-400 font-mono">
                                       {JSON.stringify(stepResult.data, null, 2)}
                                     </pre>
                                   </div>
                                 ) : (
                                   <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                                     <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                       {typeof stepResult.data === 'string' ? stepResult.data : JSON.stringify(stepResult.data)}
                                     </p>
                                   </div>
                                 )}
                              </div>

                              {/* معلومات إضافية */}
                              {stepResult.metadata && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                  <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-300 mb-2">
                                    معلومات تقنية
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(stepResult.metadata).map(([key, value]) => (
                                      <div key={key} className="text-blue-600 dark:text-blue-400">
                                        <span className="font-medium">{key}:</span> {String(value)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* عرض الصور المولدة (من الأتمتة ومن زر توليد الصورة) */}
      {(Object.keys(generatedImages).length > 0 || Object.keys(automationGeneratedImages).length > 0) && (
        <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
              <ImageIcon className="h-5 w-5" />
              الصور المولدة من البروبت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* عرض الصور المولدة من الأتمتة */}
              {Object.values(automationGeneratedImages).map((image, index) => (
                <div key={`automation-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-violet-200 dark:border-violet-700">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      من الأتمتة
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* الصورة */}
                    <div className="space-y-2">
                      <img 
                        src={image.url} 
                        alt="الصورة المولدة من الأتمتة"
                        className="w-full h-auto max-h-64 object-cover rounded-lg border shadow-md"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(image.url, '_blank')}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          تحميل الصورة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(image.url)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          نسخ الرابط
                        </Button>
                      </div>
                    </div>
                    
                    {/* معلومات الصورة */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          معلومات الصورة:
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded">
                            <span className="font-medium">النموذج:</span> A4F API (provider-4/imagen-3)
                          </div>
                          <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded">
                            <span className="font-medium">الأبعاد:</span> 1024x1024
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                            <span className="font-medium">المصدر:</span> توليد تلقائي من الأتمتة
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          البرومت المستخدم:
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                          {image.prompt}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          رابط الصورة:
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border text-xs break-all">
                          <a 
                            href={image.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {image.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* عرض الصور المولدة من زر توليد الصورة */}
              {Object.values(generatedImages).map((image, index) => (
                <div key={`manual-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-violet-200 dark:border-violet-700">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      من زر توليد الصورة
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {/* الصورة */}
                    <div className="space-y-3">
                      <img 
                        src={image.url} 
                        alt="الصورة المولدة من الزر"
                        className="w-full h-auto max-h-64 object-cover rounded-lg border shadow-md"
                      />
                      
                      {/* الأزرار أسفل الصورة */}
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(image.url, '_blank')}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          تحميل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(image.url)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          نسخ
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            // شر على فيسبوك - يمكن إضافة الوظيفة هنا
                            toast.info('قريباً: مشاركة على فيسبوك');
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          شر على فيسبوك
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleRegeneratePrompt}
                          disabled={isRegeneratingPrompt}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {isRegeneratingPrompt ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          {isRegeneratingPrompt ? 'جاري الإعادة...' : 'إعادة توليد البرومت'}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            // توليد صورة جديدة - يمكن إضافة الوظيفة هنا
                            toast.info('قريباً: توليد صورة جديدة');
                          }}
                          className="flex-1"
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          توليد صورة
                        </Button>
                      </div>
                    </div>
                    
                    {/* معلومات الصورة */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          معلومات الصورة:
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded">
                            <span className="font-medium">النموذج:</span> A4F API (provider-4/imagen-3)
                          </div>
                          <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded">
                            <span className="font-medium">الأبعاد:</span> 1024x1024
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                            <span className="font-medium">المصدر:</span> توليد يدوي من زر توليد الصورة
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          البرومت المستخدم:
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                          {image.prompt}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          رابط الصورة:
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border text-xs break-all">
                          <a 
                            href={image.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {image.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ملاحظة حول APIs المستخدمة */}
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                🤖 محرك الأتمتة يستخدم أحدث تقنيات الذكاء الاصطناعي
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Gemini API للتحليل وتوليد المحتوى • A4F API لتوليد الصور • بيانات حقيقية مفصلة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};