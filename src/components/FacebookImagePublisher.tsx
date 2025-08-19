import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Share2, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Facebook,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useFacebook } from "@/contexts/FacebookContext";

interface PublishingStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

interface FacebookImagePublisherProps {
  imageUrl: string;
  imageStyle: string;
  textContent?: string;
  interactiveQuestions?: string[];
  onPublishComplete?: () => void;
}

export const FacebookImagePublisher: React.FC<FacebookImagePublisherProps> = ({
  imageUrl,
  imageStyle,
  textContent = '',
  interactiveQuestions = [],
  onPublishComplete
}) => {
  const { selectedPage, isConnected } = useFacebook();
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingSteps, setPublishingSteps] = useState<PublishingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [customText, setCustomText] = useState(textContent);
  
  const initializeSteps = (): PublishingStep[] => {
    const steps: PublishingStep[] = [
      {
        id: 'upload-image',
        title: 'رفع الصورة إلى فيسبوك',
        status: 'pending'
      },
      {
        id: 'publish-post',
        title: 'نشر المنشور مع الصورة والمحتوى',
        status: 'pending'
      }
    ];

    // إضافة خطوات للأسئلة التفاعلية
    interactiveQuestions.forEach((_, index) => {
      steps.push({
        id: `comment-${index}`,
        title: `إضافة التعليق التفاعلي ${index + 1}`,
        status: 'pending'
      });
    });

    return steps;
  };

  const updateStepStatus = (stepId: string, status: 'running' | 'completed' | 'error', error?: string) => {
    setPublishingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, error }
        : step
    ));
  };

  const downloadImageFromUrl = async (url: string): Promise<File> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`فشل في تحميل الصورة: ${response.status}`);
      }
      
      const blob = await response.blob();
      const filename = `generated-image-${Date.now()}.jpg`;
      return new File([blob], filename, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      console.error('خطأ في تحميل الصورة:', error);
      throw new Error('فشل في تحميل الصورة من الرابط');
    }
  };

  const uploadImageToFacebook = async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('source', imageFile);
    formData.append('access_token', selectedPage!.access_token);
    formData.append('published', 'false'); // Upload as unpublished photo

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${selectedPage!.id}/photos`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل في رفع الصورة');
    }

    const data = await response.json();
    return data.id;
  };

  const publishMainPost = async (photoId: string): Promise<string> => {
    const postParams = new URLSearchParams();
    postParams.append('message', customText);
    postParams.append('access_token', selectedPage!.access_token);
    postParams.append('attached_media', JSON.stringify([{ media_fbid: photoId }]));

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${selectedPage!.id}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postParams.toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل في نشر المنشور');
    }

    const data = await response.json();
    return data.id;
  };

  const addCommentToPost = async (postId: string, comment: string): Promise<void> => {
    const commentParams = new URLSearchParams();
    commentParams.append('message', comment);
    commentParams.append('access_token', selectedPage!.access_token);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${postId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: commentParams.toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل في إضافة التعليق');
    }
  };

  const handlePublish = async () => {
    if (!isConnected || !selectedPage) {
      toast.error('يرجى الاتصال بفيسبوك واختيار صفحة أولاً');
      return;
    }

    if (!customText.trim()) {
      toast.error('يرجى إدخال نص المنشور');
      return;
    }

    setIsPublishing(true);
    const steps = initializeSteps();
    setPublishingSteps(steps);
    setCurrentStep(0);

    try {
      // الخطوة 1: رفع الصورة
      updateStepStatus('upload-image', 'running');
      setCurrentStep(0);
      
      console.log('🔄 بدء رفع الصورة إلى فيسبوك...');
      const imageFile = await downloadImageFromUrl(imageUrl);
      const photoId = await uploadImageToFacebook(imageFile);
      
      updateStepStatus('upload-image', 'completed');
      console.log('✅ تم رفع الصورة بنجاح، ID:', photoId);

      // الخطوة 2: نشر المنشور
      updateStepStatus('publish-post', 'running');
      setCurrentStep(1);
      
      console.log('🔄 بدء نشر المنشور...');
      const postId = await publishMainPost(photoId);
      
      updateStepStatus('publish-post', 'completed');
      console.log('✅ تم نشر المنشور بنجاح، ID:', postId);

      // الخطوة 3+: إضافة التعليقات التفاعلية
      for (let i = 0; i < interactiveQuestions.length; i++) {
        const stepId = `comment-${i}`;
        updateStepStatus(stepId, 'running');
        setCurrentStep(2 + i);
        
        console.log(`🔄 إضافة التعليق التفاعلي ${i + 1}...`);
        await addCommentToPost(postId, interactiveQuestions[i]);
        
        updateStepStatus(stepId, 'completed');
        console.log(`✅ تم إضافة التعليق التفاعلي ${i + 1}`);
        
        // تأخير قصير بين التعليقات
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`🎉 تم النشر بنجاح! تم إضافة ${interactiveQuestions.length} تعليق تفاعلي`);
      
      if (onPublishComplete) {
        onPublishComplete();
      }
      
      // إغلاق الحوار بعد 3 ثواني
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);

    } catch (error) {
      console.error('❌ خطأ في عملية النشر:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في النشر';
      
      // تحديث حالة الخطوة الحالية إلى خطأ
      if (publishingSteps[currentStep]) {
        updateStepStatus(publishingSteps[currentStep].id, 'error', errorMessage);
      }
      
      toast.error(`❌ فشل في النشر: ${errorMessage}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const getStepStatusIcon = (step: PublishingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-slate-300" />;
    }
  };

  const completedSteps = publishingSteps.filter(step => step.status === 'completed').length;
  const totalSteps = publishingSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!isConnected || !selectedPage}
        >
          <Share2 className="h-4 w-4 mr-2" />
          نشر على فيسبوك
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Facebook className="h-6 w-6 text-blue-600" />
            نشر الصورة مع المحتوى والأسئلة التفاعلية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* معاينة الصورة */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">الصورة المولدة - {imageStyle}</Label>
            <div className="relative">
              <img
                src={imageUrl}
                alt={`صورة بنمط ${imageStyle}`}
                className="w-full h-40 object-cover rounded-lg border"
              />
              <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                {imageStyle}
              </Badge>
            </div>
          </div>

          {/* نص المنشور */}
          <div className="space-y-2">
            <Label htmlFor="postText" className="text-sm font-semibold">نص المنشور</Label>
            <Textarea
              id="postText"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="اكتب نص المنشور هنا..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* الأسئلة التفاعلية */}
          {interactiveQuestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                الأسئلة التفاعلية ({interactiveQuestions.length})
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {interactiveQuestions.map((question, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">سؤال {index + 1}:</span>
                    </div>
                    <p className="mt-1 pr-5">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* شريط التقدم أثناء النشر */}
          {isPublishing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">تقدم النشر</span>
                <Badge variant="secondary">
                  {completedSteps} / {totalSteps}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              {/* خطوات النشر */}
              <div className="space-y-2">
                {publishingSteps.map((step, index) => (
                  <Card key={step.id} className={`transition-all ${
                    step.status === 'running' ? 'ring-2 ring-blue-400' : ''
                  }`}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                          {index + 1}
                        </div>
                        {getStepStatusIcon(step)}
                        <div className="flex-1">
                          <span className="text-sm font-medium">{step.title}</span>
                          {step.error && (
                            <p className="text-xs text-red-500 mt-1">{step.error}</p>
                          )}
                          {step.status === 'running' && (
                            <p className="text-xs text-blue-600 mt-1">جاري التنفيذ...</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !isConnected || !selectedPage || !customText.trim()}
              className="flex-1"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري النشر...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  نشر الآن
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPublishing}
            >
              إغلاق
            </Button>
          </div>

          {/* تحذير الاتصال */}
          {(!isConnected || !selectedPage) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  يرجى الاتصال بفيسبوك واختيار صفحة من تبويب "إدارة فيسبوك" أولاً
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};