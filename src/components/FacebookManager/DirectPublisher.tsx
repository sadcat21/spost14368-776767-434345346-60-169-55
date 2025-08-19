import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, Clock, Eye, Calendar, Image, Upload, AlertTriangle, FileImage, Type, Edit2, Lock, LockOpen, Brain } from "lucide-react";
import { useGeneratedContent } from "@/contexts/GeneratedContentContext";
import { toast } from "sonner";
import { ScheduleHelper } from "./ScheduleHelper";
import { formatShortDateInArabic, formatDateInArabic } from "@/utils/dateUtils";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface DirectPublisherProps {
  selectedPage: FacebookPage;
  generatedContent?: {
    longText: string;
    shortText: string;
    imageUrl: string;
    imageAlt?: string;
    originalImageUrl?: string;
    uploadedImageUrl?: string;
    analyzerImageUrl?: string;
    isGenerating?: boolean;
  } | null;
}

export const DirectPublisher = ({ selectedPage, generatedContent }: DirectPublisherProps) => {
  const { updateUploadedImageUrl } = useGeneratedContent();
  
  const [postText, setPostText] = useState(generatedContent?.longText || "");
  const [postImage, setPostImage] = useState(generatedContent?.uploadedImageUrl || generatedContent?.imageUrl || "");
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [imageChoice, setImageChoice] = useState<'original' | 'generated' | 'uploaded' | 'analyzer'>('uploaded');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCountdown, setUploadCountdown] = useState(0);
  const [isWaitingForGeneration, setIsWaitingForGeneration] = useState(false);
  const [isTextLocked, setIsTextLocked] = useState(true); // New state for text editing control
  
  // استخدام useRef لتتبع الصورة المعالجة حالياً
  const lastProcessedImageRef = useRef<string>("");
  const isUploadingRef = useRef(false);
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generationCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // تنظيف المؤقتات عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (generationCheckIntervalRef.current) {
        clearInterval(generationCheckIntervalRef.current);
      }
    };
  }, []);

  // إضافة مستمع للأحداث المخصصة للنشر التلقائي
  useEffect(() => {
    const handleAutoPost = (event: any) => {
      const { detail } = event;
      if (detail?.autoPost) {
        console.log("تم استقبال طلب النشر التلقائي:", detail);
        
        // إعداد المحتوى للنشر
        if (detail.content) {
          const textToPost = detail.content.shortText || detail.content.longText || "";
          setPostText(textToPost);
          if (detail.content.currentImage || detail.content.uploadedImageUrl) {
            setPostImage(detail.content.currentImage || detail.content.uploadedImageUrl);
          }
        }
        
        if (detail.imageUrl) {
          setPostImage(detail.imageUrl);
        }
        
        if (detail.postText) {
          setPostText(detail.postText);
        }
        
        // تفعيل النشر التلقائي مع تأخير قصير
        setTimeout(() => {
          publishPost();
        }, 2000);
      }
    };

    window.addEventListener('autoFacebookPost', handleAutoPost);
    
    return () => {
      window.removeEventListener('autoFacebookPost', handleAutoPost);
    };
  }, [selectedPage]); // إضافة selectedPage كاعتماد

  // مستمع لتحديث الصورة المرفوعة فوراً
  useEffect(() => {
    const handleImageUploaded = (event: any) => {
      const { detail } = event;
      if (detail?.uploadedUrl) {
        console.log("تم استقبال رابط الصورة المرفوعة الجديد:", detail.uploadedUrl);
        
        // تحديث الصورة فوراً
        setPostImage(detail.uploadedUrl);
        
        // التبديل إلى الخيار "رابط مباشر" إذا طُلب ذلك
        if (detail.shouldSwitchToUploaded) {
          setImageChoice('uploaded');
          toast.success("🔄 تم تحديث الصورة تلقائياً بالرابط المباشر الجديد");
        }
      }
    };

    window.addEventListener('facebookImageUploaded', handleImageUploaded);

    return () => {
      window.removeEventListener('facebookImageUploaded', handleImageUploaded);
    };
  }, []);

  // تحديث المحتوى تلقائياً عند تغيير generatedContent
  useEffect(() => {
    if (generatedContent) {
      console.log('DirectPublisher: New content received:', {
        longText: generatedContent.longText,
        imageUrl: generatedContent.imageUrl,
        originalImageUrl: generatedContent.originalImageUrl,
        uploadedImageUrl: generatedContent.uploadedImageUrl,
        analyzerImageUrl: generatedContent.analyzerImageUrl,
        isGenerating: generatedContent.isGenerating,
        lastProcessedImage: lastProcessedImageRef.current
      });
      
      // تحديث النص فقط إذا كان مقفلاً (غير قابل للتعديل) أو إذا كان النص فارغاً
      if (isTextLocked || !postText.trim()) {
        setPostText(generatedContent.longText);
        toast.success("تم تحميل النص المُولد");
      }
      
      // التحقق من حالة التوليد
      if (generatedContent.isGenerating) {
        console.log('DirectPublisher: Generation in progress, waiting...');
        setIsWaitingForGeneration(true);
        return; // لا نقوم بأي شيء أثناء التوليد
      }
      
      // إذا كان التوليد مكتمل، إيقاف حالة الانتظار
      if (isWaitingForGeneration && !generatedContent.isGenerating) {
        console.log('DirectPublisher: Generation completed, proceeding with image processing');
        setIsWaitingForGeneration(false);
      }
      
      // التحقق من وجود صورة جديدة (فقط إذا لم يكن التوليد قيد التنفيذ)
      const currentImageUrl = generatedContent.imageUrl;
      const hasNewImage = currentImageUrl && currentImageUrl !== lastProcessedImageRef.current;
      
      console.log('DirectPublisher: Image check:', {
        currentImageUrl,
        lastProcessedImage: lastProcessedImageRef.current,
        hasNewImage,
        isUploadingCurrent: isUploadingRef.current,
        isGenerating: generatedContent.isGenerating
      });
      
      if (hasNewImage && !isUploadingRef.current && !generatedContent.isGenerating) {
        console.log('DirectPublisher: Processing new image:', currentImageUrl);
        
        // تحديث المرجع فوراً لمنع المعالجة المتكررة
        lastProcessedImageRef.current = currentImageUrl;
        
         // إذا كان هناك صورة مرفوعة مسبقاً، استخدمها فوراً
         if (generatedContent.uploadedImageUrl) {
           console.log('DirectPublisher: Using existing uploaded image:', generatedContent.uploadedImageUrl);
           setPostImage(generatedContent.uploadedImageUrl);
           setImageChoice('uploaded');
           toast.success("✅ تم تحديث الصورة بالرابط المباشر الجديد");
         } 
         // إذا لم تكن هناك صورة مرفوعة وهناك صورة مولدة جديدة، ارفعها تلقائياً مع تأخير
         else {
           console.log('DirectPublisher: Scheduling auto-upload for new generated image');
           scheduleAutoUpload(currentImageUrl);
         }
       } else if (generatedContent.uploadedImageUrl && !hasNewImage) {
         // إذا لم تكن هناك صورة جديدة لكن هناك صورة مرفوعة، استخدمها فوراً
         console.log('DirectPublisher: Using existing uploaded image without new generation');
         setPostImage(generatedContent.uploadedImageUrl);
         setImageChoice('uploaded');
         toast.success("✅ تم تحديث الصورة بالرابط المباشر");
       } else if (currentImageUrl && !generatedContent.uploadedImageUrl && !generatedContent.isGenerating) {
        // إذا كانت هناك صورة مولدة لكن لا توجد صورة مرفوعة
        console.log('DirectPublisher: Using generated image directly');
        setPostImage(currentImageUrl);
        setImageChoice('generated');
        toast.success("تم تحميل الصورة المُولدة");
      }
    }
  }, [generatedContent, isTextLocked]);

  // مراقبة خاصة لتحديث uploadedImageUrl
  useEffect(() => {
    if (generatedContent?.uploadedImageUrl && generatedContent.uploadedImageUrl !== postImage) {
      console.log('DirectPublisher: uploadedImageUrl changed, updating immediately:', generatedContent.uploadedImageUrl);
      setPostImage(generatedContent.uploadedImageUrl);
      setImageChoice('uploaded');
      toast.success("🔄 تم تحديث الرابط المباشر تلقائياً");
    }
  }, [generatedContent?.uploadedImageUrl]);

  // جدولة الرفع التلقائي مع فاصل زمني (فقط إذا لم يكن التوليد قيد التنفيذ)
  const scheduleAutoUpload = (imageUrl: string) => {
    // التحقق مرة أخرى من أن التوليد مكتمل
    if (generatedContent?.isGenerating) {
      console.log('DirectPublisher: Cannot schedule upload, generation still in progress');
      return;
    }

    // إلغاء أي مؤقت سابق
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // بدء العد التنازلي (3 ثوانٍ)
    const UPLOAD_DELAY = 3000; // 3 ثوانٍ
    const COUNTDOWN_DURATION = UPLOAD_DELAY / 1000;
    
    setUploadCountdown(COUNTDOWN_DURATION);
    
    // تحديث العداد كل ثانية
    countdownIntervalRef.current = setInterval(() => {
      setUploadCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // جدولة الرفع التلقائي
    uploadTimeoutRef.current = setTimeout(() => {
      setUploadCountdown(0);
      // تحقق مرة أخيرة من أن التوليد مكتمل قبل الرفع
      if (!generatedContent?.isGenerating) {
        uploadImageAutomatically(imageUrl);
      } else {
        console.log('DirectPublisher: Upload cancelled, generation detected during countdown');
        toast.info("تم إلغاء الرفع التلقائي - جاري التوليد");
      }
    }, UPLOAD_DELAY);

    toast.info(`سيتم رفع الصورة تلقائياً خلال ${COUNTDOWN_DURATION} ثوانٍ...`);
  };

  const uploadImageAutomatically = async (imageUrl: string) => {
    if (isUploadingRef.current) {
      console.log('DirectPublisher: Upload already in progress, skipping');
      return;
    }

    // تحقق نهائي من حالة التوليد
    if (generatedContent?.isGenerating) {
      console.log('DirectPublisher: Cannot upload, generation still in progress');
      toast.error("لا يمكن رفع الصورة أثناء التوليد");
      return;
    }

    isUploadingRef.current = true;
    setIsUploading(true);
    console.log('DirectPublisher: Starting automatic upload for:', imageUrl);

    try {
      // تحويل الصورة إلى blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('فشل في تحميل الصورة');
      }
      
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob);

      // رفع الصورة إلى imgbb
      const uploadResponse = await fetch('https://api.imgbb.com/1/upload?key=c9aeeb2c2e029f20a23564c192fd5764', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        const uploadedUrl = uploadResult.data.url;
        console.log('DirectPublisher: Image uploaded successfully:', uploadedUrl, 'for original:', imageUrl);
        
        // التأكد من أن هذه الصورة لا تزال الصورة الحالية المطلوب رفعها
        if (lastProcessedImageRef.current === imageUrl) {
          setPostImage(uploadedUrl);
          setImageChoice('uploaded');
          
          // تحديث المحتوى في Context
          updateUploadedImageUrl(uploadedUrl);
          console.log('DirectPublisher: Updated context with uploaded image URL');
          
          toast.success("تم رفع الصورة تلقائياً بنجاح!");
          console.log('DirectPublisher: Successfully set uploaded image as current');
        } else {
          console.log('DirectPublisher: Image was changed during upload, ignoring result');
        }
      } else {
        throw new Error('فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('DirectPublisher: Auto upload error:', error);
      toast.error("فشل في الرفع التلقائي للصورة");
      
      // في حالة فشل الرفع، استخدم الصورة المولدة مباشرة إذا كانت لا تزال الحالية
      if (lastProcessedImageRef.current === imageUrl) {
        setPostImage(imageUrl);
        setImageChoice('generated');
      }
    } finally {
      isUploadingRef.current = false;
      setIsUploading(false);
    }
  };

  const cancelAutoUpload = () => {
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setUploadCountdown(0);
    toast.info("تم إلغاء الرفع التلقائي");
  };

  const handleImageChoiceChange = (choice: string) => {
    console.log('Image choice changed to:', choice);
    console.log('Available images:', {
      original: generatedContent?.originalImageUrl,
      generated: generatedContent?.imageUrl,
      uploaded: generatedContent?.uploadedImageUrl
    });
    
    if (choice === 'original' && generatedContent?.originalImageUrl) {
      setImageChoice('original');
      setPostImage(generatedContent.originalImageUrl);
      console.log('Set to original image:', generatedContent.originalImageUrl);
    } else if (choice === 'generated' && generatedContent?.imageUrl) {
      setImageChoice('generated');
      setPostImage(generatedContent.imageUrl);
      console.log('Set to generated image:', generatedContent.imageUrl);
    } else if (choice === 'uploaded' && generatedContent?.uploadedImageUrl) {
      setImageChoice('uploaded');
      setPostImage(generatedContent.uploadedImageUrl);
      console.log('Set to uploaded image:', generatedContent.uploadedImageUrl);
    }
  };

  const toggleTextLock = () => {
    setIsTextLocked(!isTextLocked);
    if (!isTextLocked && generatedContent) {
      // إذا تم قفل النص، استعد النص المولد
      setPostText(generatedContent.longText);
      toast.info("تم قفل النص - سيتم تحديثه تلقائياً مع المحتوى المولد");
    } else {
      toast.info("تم إلغاء قفل النص - يمكنك تعديله الآن");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (Facebook limit is 25MB for photos)
      if (file.size > 25 * 1024 * 1024) {
        toast.error("حجم الملف كبير جداً. الحد الأقصى 25 ميجابايت");
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("نوع الملف غير مدعوم. استخدم JPEG, PNG, GIF أو WebP");
        return;
      }
      
      setSelectedFile(file);
      setUploadMethod('file');
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPostImage(previewUrl);
    }
  };

  const uploadImageToFacebook = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('source', file);
    formData.append('published', 'false'); // Upload as unpublished first
    formData.append('access_token', selectedPage.access_token);

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`,
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.id; // Return the photo ID
  };

  const downloadImageFromUrl = async (imageUrl: string): Promise<File> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('فشل في تحميل الصورة');
      }
      
      const blob = await response.blob();
      const filename = `generated-image-${Date.now()}.jpg`;
      return new File([blob], filename, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw new Error('فشل في تحميل الصورة من الرابط');
    }
  };

  const validateScheduledTime = (timeString: string): boolean => {
    console.log('🕐 Validating scheduled time:', timeString);
    
    // التحقق من وجود قيمة
    if (!timeString || timeString.trim() === '') {
      toast.error("يرجى تحديد تاريخ ووقت النشر المجدول");
      return false;
    }
    
    const scheduledDate = new Date(timeString);
    const now = new Date();
    
    // التحقق من أن التاريخ صحيح وليس Invalid Date
    if (isNaN(scheduledDate.getTime())) {
      toast.error("تنسيق التاريخ والوقت غير صحيح. يرجى استخدام تنسيق صحيح (YYYY-MM-DDTHH:MM)");
      console.error('❌ Invalid date format:', timeString);
      return false;
    }
    
    // التحقق من أن التاريخ ليس في الماضي
    if (scheduledDate < now) {
      toast.error("لا يمكن جدولة منشور في الماضي. يرجى اختيار تاريخ ووقت مستقبلي");
      console.log('❌ Scheduled time is in the past:', {
        scheduled: scheduledDate.toISOString(),
        now: now.toISOString()
      });
      return false;
    }
    
    // التحقق من أن التاريخ بعد 10 دقائق على الأقل من الآن (متطلب فيسبوك)
    const minTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    if (scheduledDate < minTime) {
      const remainingMinutes = Math.ceil((minTime.getTime() - now.getTime()) / (60 * 1000));
      toast.error(`يجب أن يكون موعد النشر بعد ${remainingMinutes} دقيقة على الأقل من الآن (متطلب فيسبوك)`);
      console.log('❌ Scheduled time too soon:', {
        scheduled: scheduledDate.toISOString(),
        minRequired: minTime.toISOString(),
        remainingMinutes
      });
      return false;
    }
    
    // التحقق من أن التاريخ ليس بعيداً جداً (Facebook limit: 75 days)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 75);
    if (scheduledDate > maxDate) {
      toast.error("لا يمكن جدولة المنشور لأكثر من 75 يوماً في المستقبل (حد فيسبوك الأقصى)");
      console.log('❌ Scheduled time too far in future:', {
        scheduled: scheduledDate.toISOString(),
        maxAllowed: maxDate.toISOString()
      });
      return false;
    }
    
    // التحقق من أن Unix timestamp سيكون صحيحاً ومعقولاً
    const unixTimestamp = Math.floor(scheduledDate.getTime() / 1000);
    const currentUnixTime = Math.floor(now.getTime() / 1000);
    
    if (unixTimestamp <= 0 || isNaN(unixTimestamp)) {
      toast.error("خطأ في تحويل التاريخ إلى Unix timestamp. يرجى التحقق من التنسيق");
      console.error('❌ Invalid Unix timestamp:', unixTimestamp, 'for date:', scheduledDate);
      return false;
    }
    
    // التحقق من أن Unix timestamp معقول (ليس أقل من الوقت الحالي)
    if (unixTimestamp <= currentUnixTime) {
      toast.error("خطأ في Unix timestamp - الوقت المحسوب في الماضي");
      console.error('❌ Unix timestamp in past:', {
        calculated: unixTimestamp,
        current: currentUnixTime,
        diff: unixTimestamp - currentUnixTime
      });
      return false;
    }
    
    // التحقق من أن Unix timestamp ضمن النطاق المعقول (ليس كبير جداً أو سالب)
    const minUnixTime = currentUnixTime + (10 * 60); // على الأقل 10 دقائق من الآن
    const maxUnixTime = currentUnixTime + (75 * 24 * 60 * 60); // لا أكثر من 75 يوم
    
    if (unixTimestamp < minUnixTime || unixTimestamp > maxUnixTime) {
      toast.error("Unix timestamp خارج النطاق المسموح (10 دقائق - 75 يوم)");
      console.error('❌ Unix timestamp out of range:', {
        timestamp: unixTimestamp,
        min: minUnixTime,
        max: maxUnixTime
      });
      return false;
    }
    
    console.log('✅ Scheduled time validation passed:', {
      originalTime: timeString,
      parsedDate: scheduledDate.toISOString(),
      unixTimestamp: unixTimestamp,
      formattedDate: scheduledDate.toLocaleString('en-US'),
      timeUntilScheduled: `${Math.ceil((unixTimestamp - currentUnixTime) / 60)} دقيقة`,
      isInCorrectFormat: true
    });
    
    return true;
  };

  // دالة للتحقق من صلاحية التوكن قبل النشر
  const validateTokenBeforePublish = async (): Promise<boolean> => {
    try {
      console.log('🔑 Checking token validity before publishing...');
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${selectedPage.access_token}&fields=id,name`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('❌ Token validation failed:', data.error);
        
        if (data.error.code === 190) {
          toast.error("التوكن منتهي الصلاحية أو غير صحيح. يرجى إعادة الاتصال بفيسبوك");
        } else {
          toast.error(`خطأ في التوكن: ${data.error.message}`);
        }
        return false;
      }

      // التحقق من صلاحيات النشر
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/permissions?access_token=${selectedPage.access_token}`
      );

      if (permissionsResponse.ok) {
        const permsData = await permissionsResponse.json();
        console.log('🔐 Current permissions:', permsData.data);
      }

      console.log('✅ Token is valid and ready for publishing');
      return true;
      
    } catch (error) {
      console.error('❌ Token validation error:', error);
      toast.error("فشل في التحقق من صلاحية التوكن: " + (error as Error).message);
      return false;
    }
  };

  const publishPost = async () => {
    if (!postText.trim()) {
      toast.error("يرجى إدخال نص المنشور");
      return;
    }

    // التحقق من صحة التوقيت المجدول
    if (isScheduled) {
      if (!validateScheduledTime(scheduledTime)) {
        return;
      }
    }

    setPublishing(true);
    
    // التحقق من صلاحية التوكن قبل النشر
    const isTokenValid = await validateTokenBeforePublish();
    if (!isTokenValid) {
      setPublishing(false);
      return;
    }
    
    try {
      let photoId: string | null = null;

      // Handle image upload if there's an image
      if (postImage) {
        let imageFile: File | null = null;

        if (uploadMethod === 'file' && selectedFile) {
          imageFile = selectedFile;
        } else if (uploadMethod === 'url' && postImage) {
          // التحقق من أن الصورة من Pixabay أو A4F وهي جزء من Context
          const isPixabayImage = postImage.includes('pixabay.com') || 
                                (generatedContent?.imageUrl === postImage && postImage.includes('pixabay.com'));
          const isA4FImage = postImage.includes('api.a4f.co/v1/images/serve/') || 
                            postImage.includes('a4f.co');
          
          if (isPixabayImage) {
            // استخدام رابط Pixabay مباشرة دون رفع
            console.log('استخدام صورة Pixabay مباشرة:', postImage);
            toast.info("استخدام صورة Pixabay مباشرة...");
            // لا نحتاج لرفع الصورة، سنستخدم الرابط مباشرة
          } else if (isA4FImage) {
            // استخدام رابط A4F مباشرة دون رفع أو تحويل
            console.log('استخدام صورة A4F مباشرة:', postImage);
            toast.info("استخدام صورة A4F المولدة مباشرة...");
            // لا نحتاج لرفع الصورة، سنستخدم الرابط مباشرة
          } else {
            // Download image from URL and convert to File for other images
            imageFile = await downloadImageFromUrl(postImage);
          }
        }

        if (imageFile) {
          toast.info("جاري رفع الصورة...");
          photoId = await uploadImageToFacebook(imageFile);
        }
      }

      // Prepare post data - Use URLSearchParams instead of FormData for better compatibility
      const postParams = new URLSearchParams();
      
      // تحقق من وجود النص قبل الإرسال
      if (!postText.trim()) {
        throw new Error("النص مطلوب لإنشاء المنشور");
      }
      
      // تحقق من صحة access token
      if (!selectedPage.access_token || selectedPage.access_token.trim() === '') {
        throw new Error("access token غير صحيح أو مفقود");
      }
      
      // تحقق من طول النص (Facebook limit is around 63,206 characters)
      if (postText.trim().length > 63000) {
        throw new Error("النص طويل جداً. الحد الأقصى حوالي 63,000 حرف");
      }
      
      postParams.append('message', postText.trim());
      postParams.append('access_token', selectedPage.access_token);

      // Add photo if uploaded
      if (photoId) {
        postParams.append('attached_media', JSON.stringify([{ media_fbid: photoId }]));
      } else if (postImage) {
        // في حالة وجود صورة من Pixabay أو A4F، استخدم الرابط مباشرة
        const isPixabayImage = postImage.includes('pixabay.com') || 
                              (generatedContent?.imageUrl === postImage && postImage.includes('pixabay.com'));
        const isA4FImage = postImage.includes('api.a4f.co/v1/images/serve/') || 
                          postImage.includes('a4f.co');
        
        if (isPixabayImage) {
          console.log('إضافة صورة Pixabay مباشرة للمنشور:', postImage);
          // استخدام picture parameter للصور الخارجية
          postParams.append('picture', postImage);
          toast.info("استخدام صورة Pixabay مباشرة في المنشور");
        } else if (isA4FImage) {
          console.log('إضافة صورة A4F مباشرة للمنشور:', postImage);
          // استخدام picture parameter للصور المولدة من A4F
          postParams.append('picture', postImage);
          toast.info("استخدام صورة A4F المولدة مباشرة في المنشور");
        }
      }

      // Add scheduled time if enabled
      if (isScheduled && scheduledTime) {
        const scheduledDate = new Date(scheduledTime);
        const unixTimestamp = Math.floor(scheduledDate.getTime() / 1000);
        const currentUnixTime = Math.floor(Date.now() / 1000);
        
        // تحقق إضافي قبل الإرسال للتأكد من صحة Unix timestamp
        if (unixTimestamp <= 0 || isNaN(unixTimestamp)) {
          throw new Error("خطأ في تحويل التاريخ المجدول إلى Unix timestamp");
        }
        
        // تحقق إضافي من أن الوقت لا يزال في المستقبل (في حال تأخر المستخدم)
        if (unixTimestamp <= currentUnixTime) {
          throw new Error("الوقت المجدول أصبح في الماضي. يرجى تحديث التوقيت");
        }
        
        // تحقق من أن الوقت لا يزال بعد 10 دقائق على الأقل
        const minAllowedTime = currentUnixTime + (10 * 60);
        if (unixTimestamp < minAllowedTime) {
          const remainingMinutes = Math.ceil((minAllowedTime - currentUnixTime) / 60);
          throw new Error(`الوقت المجدول قريب جداً. يجب أن يكون بعد ${remainingMinutes} دقيقة على الأقل`);
        }
        
        console.log('📅 Scheduling post with Unix timestamp:', {
          timestamp: unixTimestamp,
          readable: scheduledDate.toLocaleString('en-US'),
          minutesFromNow: Math.ceil((unixTimestamp - currentUnixTime) / 60),
          isValidFormat: true
        });
        
        // تأكد من أن published=false للجدولة
        postParams.append('published', 'false');
        postParams.append('scheduled_publish_time', unixTimestamp.toString());
        
        // إضافة تحذير إذا كان الوقت قريب من الحد الأدنى (أقل من 15 دقيقة)
        const warningThreshold = currentUnixTime + (15 * 60);
        if (unixTimestamp < warningThreshold) {
          const minutesUntil = Math.ceil((unixTimestamp - currentUnixTime) / 60);
          toast.info(`تحذير: الوقت المجدول قريب (${minutesUntil} دقيقة). تأكد من صحة التوقيت`);
        }
        
      } else {
        // للنشر المباشر، تأكد من أن published = true
        postParams.append('published', 'true');
      }

      // تسجيل البيانات المرسلة للتشخيص مع التأكد من وجود المعاملات المطلوبة
      const paramsObject = Object.fromEntries(postParams.entries());
      console.log('📤 Sending post data to Facebook:', {
        pageId: selectedPage.id,
        hasMessage: !!postText && postText.trim().length > 0,
        messageLength: postText.trim().length,
        messagePreview: postText.trim().substring(0, 100) + '...',
        hasPhoto: !!photoId,
        photoId: photoId,
        isScheduled: isScheduled,
        scheduledTime: isScheduled ? scheduledTime : null,
        requiredParams: {
          message: paramsObject.message ? 'موجود' : 'غير موجود',
          access_token: paramsObject.access_token ? 'موجود' : 'غير موجود',
          published: paramsObject.published || 'غير محدد',
          scheduled_publish_time: paramsObject.scheduled_publish_time || 'غير محدد'
        },
        allParams: paramsObject
      });

      // تحقق نهائي من أن المعاملات المطلوبة موجودة
      if (!paramsObject.message || paramsObject.message.trim() === '') {
        throw new Error("المعامل 'message' مطلوب ولا يمكن أن يكون فارغاً");
      }
      
      if (!paramsObject.access_token) {
        throw new Error("المعامل 'access_token' مطلوب");
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: postParams.toString()
        }
      );

      const result = await response.json();

      // تسجيل الاستجابة للتشخيص
      console.log('📥 Facebook API Response:', {
        success: !result.error,
        result: result,
        status: response.status,
        statusText: response.statusText
      });

      if (result.error) {
        console.error('Facebook API Error:', result.error);
        
        // Handle specific errors with detailed messages
        if (result.error.code === 100) {
          if (result.error.message && result.error.message.includes('Requires one of the params')) {
            toast.error("خطأ في المعاملات المرسلة. تأكد من وجود نص في المنشور وصحة البيانات");
          } else if (result.error.message && result.error.message.includes('Invalid parameter')) {
            toast.error("معامل غير صحيح - تحقق من النص والصورة والوقت المجدول");
          } else if (result.error.error_subcode === 1501234) {
            toast.error("خطأ في الوقت المجدول. تأكد من أن الوقت صحيح ويتوافق مع المنطقة الزمنية للصفحة");
          } else if (result.error.message.includes('scheduled_publish_time')) {
            toast.error("خطأ في توقيت الجدولة. يجب أن يكون الوقت بعد 10 دقائق على الأقل من الآن");
          } else if (result.error.message.includes('message')) {
            toast.error("خطأ في نص المنشور - تحقق من المحتوى وتجنب الروابط المشبوهة");
          } else if (result.error.message.includes('attached_media')) {
            toast.error("خطأ في الصورة المرفقة - تحقق من صحة الصورة أو احذفها وأعد المحاولة");
          } else {
            toast.error("خطأ في المعاملات المرسلة: " + result.error.message);
          }
        } else if (result.error.code === 190) {
          toast.error("التوكن منتهي الصلاحية أو غير صحيح");
        } else if (result.error.code === 200) {
          toast.error("صلاحيات غير كافية. تحقق من أن التوكن يحتوي على الصلاحيات المطلوبة");
        } else if (result.error.code === 368) {
          toast.error("المحتوى مرفوض من فيسبوك - قد يحتوي على روابط غير مسموحة أو محتوى مخالف");
        } else if (result.error.code === 1) {
          toast.error("خطأ عام - تحقق من الاتصال بالإنترنت وحاول مرة أخرى");
        } else {
          toast.error(`خطأ في النشر (${result.error.code}): ${result.error.message}`);
        }
        
        throw new Error(result.error.message);
      }

      const message = isScheduled ? "تم جدولة المنشور بنجاح!" : "تم نشر المنشور بنجاح!";
      toast.success(message);

      // Save to history
      const history = JSON.parse(localStorage.getItem("facebook_posts_history") || "[]");
      history.push({
        id: result.id,
        text: postText,
        image: postImage,
        hasImage: !!photoId,
        imageChoice,
        page: selectedPage.name,
        isScheduled,
        scheduledTime,
        publishedAt: new Date().toISOString()
      });
      localStorage.setItem("facebook_posts_history", JSON.stringify(history));

      // Reset form
      if (!generatedContent) {
        setPostText("");
        setPostImage("");
      }
      setSelectedFile(null);
      setIsScheduled(false);
      setScheduledTime("");

    } catch (error) {
      console.error("Publishing error:", error);
      
      // تسجيل تفصيلي للأخطاء للتشخيص
      const errorLog = {
        timestamp: new Date().toISOString(),
        pageId: selectedPage.id,
        pageName: selectedPage.name,
        isScheduled,
        scheduledTime,
        hasImage: !!postImage,
        error: (error as Error).message,
        stack: (error as Error).stack
      };
      
      // حفظ سجل الأخطاء في localStorage للمراجعة
      const errorLogs = JSON.parse(localStorage.getItem("facebook_error_logs") || "[]");
      errorLogs.push(errorLog);
      // احتفظ بآخر 50 خطأ فقط
      if (errorLogs.length > 50) {
        errorLogs.splice(0, errorLogs.length - 50);
      }
      localStorage.setItem("facebook_error_logs", JSON.stringify(errorLogs));

      toast.error("فشل في النشر: " + (error as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Check if multiple images are available for choice
  const hasMultipleImages = (generatedContent?.originalImageUrl && generatedContent?.imageUrl) || 
                           generatedContent?.uploadedImageUrl || (imageChoice === 'uploaded' && postImage);
  const hasUploadedImage = !!generatedContent?.uploadedImageUrl || (imageChoice === 'uploaded' && postImage && postImage.includes('ibb.co'));
  const hasAnalyzerImage = !!generatedContent?.analyzerImageUrl;
  const hasOriginalAndGenerated = generatedContent?.originalImageUrl && generatedContent?.imageUrl;
  
  console.log('Image availability check:', {
    hasMultipleImages,
    hasUploadedImage,
    hasOriginalAndGenerated,
    originalImageUrl: generatedContent?.originalImageUrl,
    imageUrl: generatedContent?.imageUrl,
    uploadedImageUrl: generatedContent?.uploadedImageUrl,
    analyzerImageUrl: generatedContent?.analyzerImageUrl,
    currentPostImage: postImage,
    currentImageChoice: imageChoice,
    isUploading,
    uploadCountdown,
    isWaitingForGeneration,
    isGenerating: generatedContent?.isGenerating,
    lastProcessedImage: lastProcessedImageRef.current
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Send className="h-5 w-5" />
            النشر المباشر إلى {selectedPage.name}
            {isWaitingForGeneration && (
              <div className="flex items-center gap-2 text-orange-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span className="text-sm">انتظار اكتمال التوليد...</span>
              </div>
            )}
            {uploadCountdown > 0 && !isWaitingForGeneration && (
              <div className="flex items-center gap-2 text-orange-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">رفع تلقائي خلال {uploadCountdown}ث</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelAutoUpload}
                  className="text-xs px-2 py-1 h-auto"
                >
                  إلغاء
                </Button>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center gap-2 text-blue-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">جاري الرفع التلقائي...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Post Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  نص المنشور
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTextLock}
                    className={`flex items-center gap-1 ${isTextLocked ? 'text-orange-600' : 'text-green-600'}`}
                    title={isTextLocked ? "إلغاء قفل النص للتعديل" : "قفل النص مع المحتوى المولد"}
                  >
                    {isTextLocked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                    {isTextLocked ? "قفل النص" : "تعديل حر"}
                  </Button>
                </div>
              </div>
              
              <Textarea
                placeholder="اكتب محتوى المنشور هنا..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={6}
                className="resize-none"
                disabled={isTextLocked}
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  عدد الأحرف: {postText.length}
                </p>
                {isTextLocked && (
                  <p className="text-xs text-orange-600">
                    النص مقفل - سيتم تحديثه تلقائياً مع المحتوى المولد
                  </p>
                )}
              </div>
            </div>

            {/* Generation Waiting Status */}
            {isWaitingForGeneration && (
              <Alert className="border-orange-200 bg-orange-50">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <AlertDescription className="text-orange-700">
                  انتظار اكتمال توليد المحتوى... سيتم رفع الصورة تلقائياً بعد الانتهاء.
                </AlertDescription>
              </Alert>
            )}

            {/* Auto Upload Status */}
            {uploadCountdown > 0 && !isWaitingForGeneration && (
              <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-700">
                  <div className="flex items-center justify-between">
                    <span>سيتم رفع الصورة تلقائياً خلال {uploadCountdown} ثانية...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelAutoUpload}
                      className="text-xs"
                    >
                      إلغاء الرفع التلقائي
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Image Choice Section - Show if multiple images are available */}
            {hasMultipleImages && !isWaitingForGeneration && (
              <Card className="border-2 border-primary/20 bg-blue-50/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium text-primary">اختيار نوع الصورة المراد نشرها</Label>
                  </div>
                  
                   <RadioGroup 
                    value={imageChoice} 
                    onValueChange={handleImageChoiceChange}
                    className="space-y-3"
                  >
                    {hasAnalyzerImage && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="analyzer" id="analyzer" />
                        <Label htmlFor="analyzer" className="flex items-center gap-2 cursor-pointer">
                          <Brain className="h-4 w-4" />
                          <span className="font-medium text-blue-600">الصورة من المحلل الذكي - مُوصى به</span>
                        </Label>
                      </div>
                    )}

                    {hasUploadedImage && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="uploaded" id="uploaded" />
                        <Label htmlFor="uploaded" className="flex items-center gap-2 cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <span className="font-medium text-green-600">الصورة المرفوعة (رابط مباشر) - مُوصى به</span>
                        </Label>
                      </div>
                    )}
                    
                    {hasOriginalAndGenerated && generatedContent?.originalImageUrl && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="original" id="original" />
                        <Label htmlFor="original" className="flex items-center gap-2 cursor-pointer">
                          <FileImage className="h-4 w-4" />
                          الصورة الأساسية (الصورة الأصلية بدون نص)
                        </Label>
                      </div>
                    )}
                    
                    {generatedContent?.imageUrl && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="generated" id="generated" />
                        <Label htmlFor="generated" className="flex items-center gap-2 cursor-pointer">
                          <Type className="h-4 w-4" />
                          الصورة المولدة (الصورة مع النص المكتوب عليها)
                        </Label>
                      </div>
                    )}
                  </RadioGroup>

                  {/* Image Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">معاينة الصورة المختارة:</Label>
                    <div className="relative w-full max-w-xs">
                      {postImage && (
                        <img 
                          src={postImage} 
                          alt="معاينة الصورة المختارة" 
                          className="w-full rounded-lg border shadow-sm"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {imageChoice === 'analyzer' ? 'محلل ذكي' :
                         imageChoice === 'uploaded' ? 'مرفوعة' : 
                         imageChoice === 'original' ? 'أساسية' : 'مولدة'}
                      </div>
                    </div>
                  </div>
                  
                  {hasAnalyzerImage && imageChoice === 'analyzer' && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      🧠 تم اختيار الصورة من المحلل الذكي - هذه الصورة تم توليدها أو تحليلها بواسطة الذكاء الاصطناعي
                    </div>
                  )}

                  {hasUploadedImage && imageChoice === 'uploaded' && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      ✅ يُنصح باستخدام الصورة المرفوعة لضمان الاستقرار والسرعة في النشر
                    </div>
                  )}

                  {generatedContent?.imageUrl && generatedContent.imageUrl.includes('a4f.co') && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      🚀 <strong>استخدام الرابط المباشر من A4F:</strong> يتم استخدام الرابط المباشر للصورة المولدة من A4F دون الحاجة لرفع أو تحويل، مما يوفر سرعة أعلى وجودة أفضل في النشر.
                    </div>
                  )}

                  {isUploading && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        جاري رفع الصورة المولدة الجديدة تلقائياً...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Regular Image Upload Section - Only show if no generated content or limited images */}
            {!hasMultipleImages && !isWaitingForGeneration && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    إضافة صورة
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={uploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('url')}
                    >
                      رابط
                    </Button>
                    <Button
                      variant={uploadMethod === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('file')}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      رفع ملف
                    </Button>
                  </div>
                </div>

                {uploadMethod === 'url' ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={postImage}
                      onChange={(e) => setPostImage(e.target.value)}
                    />
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p>سيتم تحميل الصورة من الرابط ورفعها مباشرة إلى فيسبوك لضمان الظهور الصحيح</p>
                          <p className="text-xs text-blue-600">💡 <strong>ملاحظة:</strong> الصور المولدة من A4F تستخدم الرابط المباشر دون الحاجة لرفع إضافي</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      يدعم: JPEG, PNG, GIF, WebP - حد أقصى: 25 ميجابايت
                    </p>
                  </div>
                )}

                {postImage && !hasMultipleImages && (
                  <div className="relative">
                    <img 
                      src={postImage} 
                      alt="معاينة الصورة" 
                      className="w-full max-w-md rounded-lg border"
                      onError={() => toast.error("رابط الصورة غير صحيح")}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPostImage("");
                        setSelectedFile(null);
                      }}
                    >
                      إزالة
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scheduling Options */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label>جدولة النشر</Label>
              </div>
              <Switch
                checked={isScheduled}
                onCheckedChange={setIsScheduled}
              />
            </div>

            {isScheduled && (
              <div className="space-y-4">
                <Label>تاريخ ووقت النشر المجدول</Label>
                <div className="space-y-2">
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date(new Date().getTime() + 5 * 60000).toISOString().slice(0, 16)} // 5 minutes from now
                    max={new Date(new Date().getTime() + 75 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)} // 75 days from now
                  />
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="space-y-2">
                        <p><strong>متطلبات الجدولة:</strong></p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>الوقت يجب أن يكون بعد 10 دقائق على الأقل من الآن</li>
                          <li>لا يمكن الجدولة لأكثر من 75 يوماً في المستقبل</li>
                          <li>استخدم توكن الصفحة (Page Access Token) وليس توكن المستخدم</li>
                          <li>تأكد من ضبط المنطقة الزمنية الصحيحة لصفحتك على فيسبوك</li>
                          <li>الصلاحيات المطلوبة: pages_manage_posts, pages_read_engagement, pages_manage_metadata</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  {scheduledTime && (
                    <div className="text-sm p-2 bg-muted rounded-lg">
                      <strong>سيتم النشر في:</strong> {formatDateInArabic(scheduledTime, true)}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Schedule Helper - Show when scheduling is enabled */}
            {isScheduled && scheduledTime && (
              <ScheduleHelper 
                scheduledTime={scheduledTime}
                isScheduled={isScheduled}
              />
            )}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "إخفاء المعاينة" : "معاينة المنشور"}
              </Button>
            </div>

            {showPreview && (
              <Card className="border-2 border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                        {selectedPage.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedPage.name}</p>
                        <p className="text-xs">
                          {isScheduled ? `مجدول للنشر في ${formatShortDateInArabic(scheduledTime)}` : "الآن"}
                        </p>
                      </div>
                    </div>
                    
                    {postText && (
                      <p className="text-sm whitespace-pre-wrap">{postText}</p>
                    )}
                    
                    {postImage && (
                      <div className="space-y-2">
                        <img 
                          src={postImage} 
                          alt="معاينة" 
                          className="w-full max-w-sm rounded border"
                        />
                        {hasMultipleImages && (
                          <p className="text-xs text-muted-foreground">
                            نوع الصورة: {
                              imageChoice === 'analyzer' ? 'الصورة من المحلل الذكي' :
                              imageChoice === 'uploaded' ? 'الصورة المرفوعة (رابط مباشر)' :
                              imageChoice === 'original' ? 'الصورة الأساسية (بدون نص)' :
                              'الصورة المولدة (مع النص)'
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={publishPost}
              disabled={publishing || !postText.trim() || isUploading || isWaitingForGeneration}
              className="flex-1"
            >
              {publishing ? (
                "جاري النشر..."
              ) : isScheduled ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  جدولة المنشور
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  نشر الآن
                </>
              )}
            </Button>
          </div>

          {generatedContent && (
            <Alert>
              <Image className="h-4 w-4" />
              <AlertDescription>
                تم تحميل المحتوى المولد تلقائياً. 
                {isWaitingForGeneration 
                  ? " انتظار اكتمال التوليد... سيتم رفع الصورة تلقائياً بعد الانتهاء."
                  : uploadCountdown > 0 
                    ? ` سيتم رفع الصورة تلقائياً خلال ${uploadCountdown} ثانية. يمكنك إلغاء العملية إذا رغبت.`
                    : isUploading 
                      ? " جاري رفع الصورة الجديدة تلقائياً..."
                      : hasMultipleImages 
                        ? " يمكنك اختيار نوع الصورة المراد نشرها."
                        : " سيتم رفع الصورة مباشرة إلى فيسبوك لضمان الظهور الصحيح."
                }
                {!isTextLocked && " يمكنك تعديل النص بحرية أو قفله للتحديث التلقائي."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
