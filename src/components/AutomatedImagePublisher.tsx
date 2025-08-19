import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Facebook, 
  Zap, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Bot,
  Wand2,
  Image as ImageIcon,
  Send,
  Brain,
  Eye,
  MessageSquare,
  Clock,
  Upload,
  Link,
  Camera,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Activity,
  Target,
  Search,
  FileText,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { useFacebook } from "@/contexts/FacebookContext";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { supabase } from "@/integrations/supabase/client";
import { AutomationSetupGuide } from "./AutomationSetupGuide";
import { AutomationStepResults } from "./AutomationStepResults";

interface AutomationStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  details?: string;
  error?: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

interface ImageAnalysis {
  description: string;
  category: string;
  keywords: string[];
  marketingAngle: string;
  confidence: number;
}

interface GeneratedImageContent {
  originalImage: string;
  editedImage?: string;
  textContent: string;
  editPrompt: string;
  interactiveQuestions: string[];
  imageAnalysis: ImageAnalysis;
  stepResults?: {
    [stepId: string]: {
      data?: any;
      preview?: string;
      summary?: string;
    };
  };
}

export function AutomatedImagePublisher() {
  const { selectedPage } = useFacebook();
  const { apiKey } = useGeminiApiKey();
  
  // Form states
  const [imageInput, setImageInput] = useState('https://superfood-plus.com/wp-content/uploads/2024/10/IMG_20241021_144336-430x460.jpg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [targetAudience, setTargetAudience] = useState('الشباب المهتم بالمكملات الغذائية');
  const [marketingGoal, setMarketingGoal] = useState('engagement');
  const [contentLanguage, setContentLanguage] = useState('arabic');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // Process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedImageContent | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const initializeSteps = (): AutomationStep[] => [
    { 
      id: 'image_analysis', 
      title: 'تحليل الصورة الأصلية', 
      status: 'pending',
      details: 'استخدام الذكاء الاصطناعي لفهم محتوى الصورة وتصنيفها' 
    },
    { 
      id: 'content_generation', 
      title: 'توليد المحتوى التسويقي', 
      status: 'pending',
      details: 'إنشاء نص تسويقي جذاب مناسب للجمهور المستهدف' 
    },
    { 
      id: 'edit_prompt', 
      title: 'إنشاء برومبت التعديل', 
      status: 'pending',
      details: 'توليد وصف مفصل لتعديل الصورة بأسلوب تسويقي احترافي' 
    },
    { 
      id: 'image_editing', 
      title: 'تعديل الصورة', 
      status: 'pending',
      details: 'تطبيق التعديلات التسويقية على الصورة باستخدام الذكاء الاصطناعي' 
    },
    { 
      id: 'quality_check', 
      title: 'فحص الجودة والملاءمة', 
      status: 'pending',
      details: 'التأكد من جودة النتيجة النهائية وملاءمتها للهدف التسويقي' 
    },
    { 
      id: 'interactive_questions', 
      title: 'إنشاء أسئلة تفاعلية', 
      status: 'pending',
      details: 'توليد أسئلة لزيادة التفاعل مع المنشور' 
    },
    { 
      id: 'facebook_publish', 
      title: 'النشر على فيسبوك', 
      status: 'pending',
      details: 'نشر المحتوى والصورة المعدلة على صفحة فيسبوك' 
    }
  ];

  const updateStep = (stepId: string, updates: Partial<AutomationStep>) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedStep = { ...step, ...updates };
        
        // حساب المدة إذا اكتملت الخطوة
        if (updates.status === 'completed' && step.startTime && updates.endTime) {
          updatedStep.duration = Math.floor((updates.endTime - step.startTime) / 1000);
        }
        
        return updatedStep;
      }
      return step;
    }));
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'image_analysis': return <Search className="h-4 w-4" />;
      case 'content_generation': return <FileText className="h-4 w-4" />;
      case 'edit_prompt': return <Brain className="h-4 w-4" />;
      case 'image_editing': return <Wand2 className="h-4 w-4" />;
      case 'quality_check': return <Target className="h-4 w-4" />;
      case 'interactive_questions': return <MessageSquare className="h-4 w-4" />;
      case 'facebook_publish': return <Facebook className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setImageInput(file.name);
      } else {
        toast.error('يرجى اختيار ملف صورة صحيح');
      }
    }
  };

  const validateInputs = (): boolean => {
    if (inputType === 'url' && !imageInput.trim()) {
      toast.error('يرجى إدخال رابط الصورة');
      return false;
    }
    if (inputType === 'file' && !imageFile) {
      toast.error('يرجى اختيار ملف الصورة');
      return false;
    }
    if (!targetAudience.trim()) {
      toast.error('يرجى تحديد الجمهور المستهدف');
      return false;
    }
    if (!selectedPage) {
      toast.error('يرجى اختيار صفحة فيسبوك للنشر عليها');
      return false;
    }
    return true;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processImageAutomation = async () => {
    if (!validateInputs()) return;

    setIsProcessing(true);
    setSteps(initializeSteps());
    setShowResults(false);
    setGeneratedContent(null);

    try {
      // Get image source
      let imageSource = '';
      if (inputType === 'url') {
        imageSource = imageInput;
      } else if (imageFile) {
        imageSource = await convertFileToBase64(imageFile);
      }

      // Step 1: Analyze image
      updateStep('image_analysis', { status: 'running', startTime: Date.now() });
      
      const analysisResponse = await supabase.functions.invoke('gemini-image-analysis', {
        body: {
          imageUrl: imageSource,
          analysisType: 'marketing',
          language: contentLanguage
        }
      });

      if (analysisResponse.error) throw new Error('فشل في تحليل الصورة');
      
      const imageAnalysis = analysisResponse.data as ImageAnalysis;
      
      // حفظ نتائج التحليل
      setGeneratedContent(prev => ({
        ...prev!,
        stepResults: {
          ...prev?.stepResults,
          image_analysis: {
            data: imageAnalysis,
            summary: `${imageAnalysis.category} - ${imageAnalysis.description}`,
            preview: imageSource
          }
        }
      }));
      
      updateStep('image_analysis', { 
        status: 'completed', 
        endTime: Date.now(),
        details: `✅ تم التحليل: ${imageAnalysis.category} (ثقة: ${imageAnalysis.confidence}%) - ${imageAnalysis.keywords.join(', ')}`
      });

      // Step 2: Generate marketing content
      updateStep('content_generation', { status: 'running', startTime: Date.now() });
      
      const contentResponse = await supabase.functions.invoke('gemini-marketing-content', {
        body: {
          imageAnalysis,
          targetAudience,
          marketingGoal,
          language: contentLanguage,
          customInstructions
        }
      });

      if (contentResponse.error) throw new Error('فشل في توليد المحتوى التسويقي');
      
      const textContent = contentResponse.data.content;
      
      // حفظ المحتوى المولد
      setGeneratedContent(prev => ({
        ...prev!,
        stepResults: {
          ...prev?.stepResults,
          content_generation: {
            data: { content: textContent },
            summary: `${textContent.slice(0, 100)}...`,
            preview: textContent
          }
        }
      }));
      
      updateStep('content_generation', { 
        status: 'completed', 
        endTime: Date.now(),
        details: `✅ تم توليد محتوى تسويقي (${textContent.length} حرف): "${textContent.slice(0, 80)}..."`
      });

      // Step 3: Generate edit prompt with Gemini Vision
      updateStep('edit_prompt', { 
        status: 'running', 
        startTime: Date.now(),
        details: 'جاري إنشاء برومبت تعديل متخصص باستخدام Gemini Vision... هذه العملية تتطلب تحليلاً دقيقاً وقد تستغرق دقيقة'
      });
      
      let editPrompt: string = '';
      let lastErrorMessage = '';
      const maxAttempts = 3;

      // تحويل الصورة إلى base64 إذا لزم الأمر
      let imageBase64Data = '';
      if (inputType === 'file' && imageFile) {
        const fileBase64 = await convertFileToBase64(imageFile);
        imageBase64Data = fileBase64.split(',')[1]; // إزالة data:image/...;base64,
      } else if (inputType === 'url') {
        try {
          const response = await fetch(imageSource);
          const blob = await response.blob();
          const buffer = await blob.arrayBuffer();
          imageBase64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        } catch (error) {
          console.warn('فشل في تحويل صورة URL إلى base64:', error);
        }
      }

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const requestBody: any = {
          imageAnalysis,
          textContent,
          marketingGoal,
          language: contentLanguage
        };

        // إضافة بيانات الصورة للتحليل البصري
        if (imageBase64Data) {
          requestBody.imageData = imageBase64Data;
        }

        const resp = await supabase.functions.invoke('gemini-image-edit-prompt', {
          body: requestBody
        });

        if (!resp.error) {
          editPrompt = resp.data.editPrompt;
          updateStep('edit_prompt', { 
            details: `تم إنشاء برومبت التعديل باستخدام Gemini Vision بنجاح` 
          });
          break;
        } else {
          lastErrorMessage = resp.error.message || resp.data?.error || 'خطأ غير معروف';
          updateStep('edit_prompt', { 
            details: `محاولة ${attempt}/${maxAttempts} فشلت: ${lastErrorMessage}` 
          });
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      if (!editPrompt) throw new Error(`فشل في إنشاء برومبت التعديل: ${lastErrorMessage}`);
      
      // حفظ برومبت التعديل
      setGeneratedContent(prev => ({
        ...prev!,
        stepResults: {
          ...prev?.stepResults,
          edit_prompt: {
            data: { editPrompt },
            summary: editPrompt.slice(0, 100) + '...',
            preview: editPrompt
          }
        }
      }));
      
      updateStep('edit_prompt', { 
        status: 'completed', 
        endTime: Date.now(),
        details: `✅ تم إنشاء برومبت تعديل متطور (${editPrompt.length} حرف)`
      });

      // Step 4: Edit image with fallback mechanism
      updateStep('image_editing', { status: 'running', startTime: Date.now() });
      
      let editedImage = imageSource; // Default to original image
      
      try {
        const editResponse = await supabase.functions.invoke('gemini-image-editing', {
          body: {
            originalImage: imageSource,
            editPrompt,
            style: 'marketing_professional'
          }
        });

        if (editResponse.error) {
          console.warn('Gemini image editing failed, using original image:', editResponse.error);
          editedImage = imageSource; // استخدام الصورة الأصلية
          updateStep('image_editing', { 
            status: 'completed', 
            endTime: Date.now(),
            details: `تم تخطي تعديل الصورة (غير متاح في هذه المنطقة) - سيتم استخدام الصورة الأصلية`
          });
        } else {
          editedImage = editResponse.data.editedImage || imageSource;
          const isFallback = editResponse.data.fallback;
          
          // حفظ نتيجة التعديل
          setGeneratedContent(prev => ({
            ...prev!,
            stepResults: {
              ...prev?.stepResults,
              image_editing: {
                data: editResponse.data,
                summary: isFallback ? 'تم استخدام الصورة الأصلية' : 'تم تعديل الصورة بنجاح',
                preview: editedImage
              }
            }
          }));
          
          updateStep('image_editing', { 
            status: 'completed', 
            endTime: Date.now(),
            details: isFallback 
              ? `⚠️ تم استخدام الصورة الأصلية (تعديل الصور غير متاح في هذه المنطقة)`
              : `✅ تم تعديل الصورة بنجاح - أنتجت صورة محسنة للتسويق`
          });
        }
      } catch (error) {
        console.warn('Image editing service unavailable, proceeding with original image:', error);
        updateStep('image_editing', { 
          status: 'completed', 
          endTime: Date.now(),
          details: `تم تخطي تعديل الصورة (الخدمة غير متاحة) - سيتم استخدام الصورة الأصلية`
        });
      }

      // Step 5: Quality check
      updateStep('quality_check', { status: 'running', startTime: Date.now() });
      
      const qualityResponse = await supabase.functions.invoke('gemini-content-quality-check', {
        body: {
          originalImage: imageSource,
          editedImage,
          textContent,
          imageAnalysis
        }
      });

      if (qualityResponse.error) throw new Error('فشل في فحص الجودة');
      
      // حفظ نتائج فحص الجودة
      setGeneratedContent(prev => ({
        ...prev!,
        stepResults: {
          ...prev?.stepResults,
          quality_check: {
            data: qualityResponse.data,
            summary: `جودة المطابقة: ${qualityResponse.data.matchScore}%`,
            preview: `التقييم: ${qualityResponse.data.assessment || 'غير متاح'}`
          }
        }
      }));
      
      updateStep('quality_check', { 
        status: 'completed', 
        endTime: Date.now(),
        details: `✅ اكتمل فحص الجودة - جودة المطابقة: ${qualityResponse.data.matchScore}%`
      });

      // Step 6: Generate interactive questions
      updateStep('interactive_questions', { status: 'running', startTime: Date.now() });
      
      const questionsResponse = await supabase.functions.invoke('gemini-interactive-questions', {
        body: {
          content: textContent,
          category: imageAnalysis.category,
          language: contentLanguage
        }
      });

      if (questionsResponse.error) throw new Error('فشل في إنشاء الأسئلة التفاعلية');
      
      const interactiveQuestions = questionsResponse.data.questions;
      
      // حفظ الأسئلة التفاعلية
      setGeneratedContent(prev => ({
        ...prev!,
        stepResults: {
          ...prev?.stepResults,
          interactive_questions: {
            data: { questions: interactiveQuestions },
            summary: `${interactiveQuestions.length} أسئلة تفاعلية`,
            preview: interactiveQuestions.slice(0, 2).join(' • ')
          }
        }
      }));
      
      updateStep('interactive_questions', { 
        status: 'completed', 
        endTime: Date.now(),
        details: `✅ تم إنشاء ${interactiveQuestions.length} سؤال تفاعلي لزيادة التفاعل`
      });

      // Step 7: Publish to Facebook
      updateStep('facebook_publish', { status: 'running', startTime: Date.now() });
      
      try {
        // التأكد من وجود صورة للنشر (أصلية أو معدلة)
        const imageToPublish = editedImage || imageSource;
        
        // Download image and convert to File
        const response = await fetch(imageToPublish);
        const blob = await response.blob();
        const imageFile = new File([blob], `edited-image-${Date.now()}.jpg`, { type: blob.type });
        
        // Upload image to Facebook
        const formData = new FormData();
        formData.append('source', imageFile);
        formData.append('access_token', selectedPage.access_token);
        formData.append('published', 'false');

        const uploadResponse = await fetch(
          `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error?.message || 'فشل في رفع الصورة');
        }

        const uploadData = await uploadResponse.json();
        const photoId = uploadData.id;

        // Publish post with image
        const postParams = new URLSearchParams();
        postParams.append('message', textContent);
        postParams.append('access_token', selectedPage.access_token);
        postParams.append('attached_media', JSON.stringify([{ media_fbid: photoId }]));

        const postResponse = await fetch(
          `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: postParams.toString(),
          }
        );

        if (!postResponse.ok) {
          const errorData = await postResponse.json();
          throw new Error(errorData.error?.message || 'فشل في نشر المنشور');
        }

        const postData = await postResponse.json();
        const postId = postData.id;

        // Add interactive comments
        for (const question of interactiveQuestions) {
          const commentParams = new URLSearchParams();
          commentParams.append('message', question);
          commentParams.append('access_token', selectedPage.access_token);

          await fetch(
            `https://graph.facebook.com/v19.0/${postId}/comments`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: commentParams.toString(),
            }
          );
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        updateStep('facebook_publish', { 
          status: 'completed', 
          endTime: Date.now(),
          details: `تم النشر بنجاح - معرف المنشور: ${postId}`
        });
        
      } catch (publishError) {
        console.error('Facebook publishing error:', publishError);
        throw new Error(publishError instanceof Error ? publishError.message : 'فشل في النشر على فيسبوك');
      }

      // Set final results
      setGeneratedContent({
        originalImage: imageSource,
        editedImage,
        textContent,
        editPrompt,
        interactiveQuestions,
        imageAnalysis
      });
      
      setShowResults(true);
      toast.success('تم إكمال عملية تعديل الصورة والنشر بنجاح!');

    } catch (error) {
      console.error('خطأ في معالجة الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      // Update current step with error
      const currentStep = steps.find(s => s.status === 'running');
      if (currentStep) {
        updateStep(currentStep.id, { 
          status: 'error', 
          error: errorMessage,
          endTime: Date.now()
        });
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPage) {
    return <AutomationSetupGuide 
      hasGeminiKey={!!apiKey} 
      hasFacebookConnection={!!selectedPage}
      hasGeminiImageGeneration={true}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-600" />
            إعدادات تعديل الصورة والنشر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Input Type */}
          <div className="space-y-2">
            <Label>طريقة إدخال الصورة</Label>
            <Select value={inputType} onValueChange={(value: 'url' | 'file') => setInputType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    رابط مباشر للصورة
                  </div>
                </SelectItem>
                <SelectItem value="file">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    رفع ملف صورة
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Input */}
          {inputType === 'url' ? (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">رابط الصورة</Label>
              <Input
                id="imageUrl"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="text-right"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="imageFile">اختيار الصورة</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-right"
              />
              {imageFile && (
                <p className="text-sm text-muted-foreground">
                  الملف المحدد: {imageFile.name}
                </p>
              )}
            </div>
          )}

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">الجمهور المستهدف</Label>
            <Input
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="مثال: الشباب المهتم بالتكنولوجيا"
              className="text-right"
            />
          </div>

          {/* Marketing Goal */}
          <div className="space-y-2">
            <Label>الهدف التسويقي</Label>
            <Select value={marketingGoal} onValueChange={setMarketingGoal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">زيادة التفاعل والمشاركة</SelectItem>
                <SelectItem value="awareness">زيادة الوعي بالعلامة التجارية</SelectItem>
                <SelectItem value="sales">تحفيز المبيعات</SelectItem>
                <SelectItem value="leads">جذب عملاء محتملين</SelectItem>
                <SelectItem value="community">بناء مجتمع متفاعل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Language */}
          <div className="space-y-2">
            <Label>لغة المحتوى</Label>
            <Select value={contentLanguage} onValueChange={setContentLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arabic">العربية</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="kabyle_tifinagh">Taqbaylit (ⵜⴰⵇⴱⴰⵢⵍⵉⵜ)</SelectItem>
                <SelectItem value="chaoui_tifinagh">Tacawit (ⵜⴰⵛⴰⵡⵉⵜ)</SelectItem>
                <SelectItem value="tuareg_tifinagh">Tamashek (ⵜⴰⵎⴰⵛⴻⵇ)</SelectItem>
                <SelectItem value="mozabit_tifinagh">Tumzabt (ⵜⵓⵎⵣⴰⴱⵜ)</SelectItem>
                <SelectItem value="chenoui_tifinagh">Tacenwit (ⵜⴰⵛⴻⵏⵡⵉⵜ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">تعليمات إضافية (اختياري)</Label>
            <Textarea
              id="instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="أي توجيهات خاصة لتعديل الصورة أو المحتوى..."
              className="text-right"
              rows={3}
            />
          </div>

          {/* Start Button */}
          <Button 
            onClick={processImageAutomation}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Sparkles className="ml-2 h-4 w-4" />
                بدء تعديل الصورة والنشر
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enhanced Progress Steps */}
      {steps.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  تقدم العمليات التلقائية
                </span>
              </CardTitle>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                {steps.filter(s => s.status === 'completed').length} / {steps.length}
              </Badge>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>التقدم الإجمالي</span>
                <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%</span>
              </div>
              <Progress 
                value={(steps.filter(s => s.status === 'completed').length / steps.length) * 100}
                className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <Card key={step.id} className={`transition-all duration-300 ${
                step.status === 'completed' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700'
                  : step.status === 'error'
                  ? 'bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 border-red-200 dark:border-red-700'
                  : step.status === 'running'
                  ? 'bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-700 shadow-lg scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.status === 'completed' 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                          : step.status === 'error'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                          : step.status === 'running'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className={`p-2 rounded-lg ${
                        step.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : step.status === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : step.status === 'running'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        {getStepIcon(step.id)}
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                          {step.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          {step.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                          {step.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {step.status === 'pending' && <Clock className="h-4 w-4 text-slate-400" />}
                          
                          {step.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {formatTime(step.duration)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Status Messages */}
                      {step.status === 'running' && (
                        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>
                              {step.id === 'edit_prompt' 
                                ? 'جاري إنشاء برومبت التعديل... قد يستغرق هذا بعض الوقت 🧠'
                                : step.id === 'image_editing'
                                ? 'جاري تعديل الصورة... معالجة بالذكاء الاصطناعي 🎨'
                                : step.id === 'image_analysis'
                                ? 'جاري تحليل الصورة وفهم محتواها... 👁️'
                                : 'جاري التنفيذ...'
                              }
                            </span>
                          </div>
                        </div>
                      )}

                      {step.error && (
                        <Alert className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{step.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Expandable Details */}
                      <Collapsible>
                        <CollapsibleTrigger
                          onClick={() => toggleStepExpansion(step.id)}
                          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg p-3 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                                عرض التفاصيل
                              </span>
                            </div>
                            {expandedSteps.has(step.id) ? (
                              <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="mt-2">
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                معلومات الخطوة
                              </h5>
                              {step.details && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(step.details || '');
                                    toast.success('تم نسخ التفاصيل!');
                                  }}
                                  className="h-7 px-2"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            {step.details && (
                              <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                  {step.details}
                                </p>
                              </div>
                            )}
                            
                            {/* عرض النتائج التفصيلية */}
                            {generatedContent?.stepResults?.[step.id] && step.status === 'completed' && (
                              <AutomationStepResults 
                                stepId={step.id}
                                stepTitle={step.title}
                                stepResults={generatedContent.stepResults[step.id]}
                              />
                            )}
                            
                            {step.startTime && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>وقت البداية: {new Date(step.startTime).toLocaleTimeString('ar-SA')}</p>
                                {step.endTime && (
                                  <p>وقت الانتهاء: {new Date(step.endTime).toLocaleTimeString('ar-SA')}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              نتائج تعديل الصورة والنشر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Images Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">الصورة الأصلية</h4>
                <img 
                  src={generatedContent.originalImage} 
                  alt="الصورة الأصلية"
                  className="w-full rounded-lg border"
                />
              </div>
              {generatedContent.editedImage && (
                <div className="space-y-2">
                  <h4 className="font-semibold">الصورة المعدلة</h4>
                  <img 
                    src={generatedContent.editedImage} 
                    alt="الصورة المعدلة"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Image Analysis */}
            <div className="space-y-2">
              <h4 className="font-semibold">تحليل الصورة</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>الوصف:</strong> {generatedContent.imageAnalysis.description}</p>
                <p><strong>التصنيف:</strong> {generatedContent.imageAnalysis.category}</p>
                <p><strong>الزاوية التسويقية:</strong> {generatedContent.imageAnalysis.marketingAngle}</p>
                <p><strong>الكلمات المفتاحية:</strong> {generatedContent.imageAnalysis.keywords.join('، ')}</p>
              </div>
            </div>

            {/* Generated Content */}
            <div className="space-y-2">
              <h4 className="font-semibold">المحتوى التسويقي المولد</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{generatedContent.textContent}</p>
              </div>
            </div>

            {/* Edit Prompt */}
            <div className="space-y-2">
              <h4 className="font-semibold">برومبت التعديل المستخدم</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{generatedContent.editPrompt}</p>
              </div>
            </div>

            {/* Interactive Questions */}
            <div className="space-y-2">
              <h4 className="font-semibold">الأسئلة التفاعلية</h4>
              <div className="space-y-2">
                {generatedContent.interactiveQuestions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}