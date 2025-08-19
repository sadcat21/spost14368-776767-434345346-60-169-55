import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onVideoUploaded?: (videoUrl: string) => void;
  onImageUploaded?: (imageUrl: string) => void;
  className?: string;
  acceptImages?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoUploaded,
  onImageUploaded,
  className = "",
  acceptImages = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imgbbImageUrl, setImgbbImageUrl] = useState<string>("");
  const [uploadedFileType, setUploadedFileType] = useState<'video' | 'image' | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // وظيفة تشغيل النشر التلقائي على فيسبوك للصور
  const triggerAutoFacebookPostForImage = (imageUrl: string) => {
    try {
      // التحقق من حالة الاتصال بفيسبوك
      const fbToken = localStorage.getItem("facebook_user_token");
      const fbPages = localStorage.getItem("facebook_pages");
      const selectedPageId = localStorage.getItem("facebook_selected_page");
      
      if (!fbToken || !fbPages || !selectedPageId) {
        console.log("فيسبوك غير متصل، لا يمكن النشر التلقائي");
        return;
      }

      // إنشاء حدث مخصص لتشغيل النشر التلقائي مع الصورة
      const autoPostEvent = new CustomEvent('autoFacebookPost', {
        detail: {
          imageUrl: imageUrl,
          autoPost: true,
          postText: "🖼️ تم رفع صورة جديدة بنجاح!\n\n#صورة_جديدة #محتوى_رقمي"
        }
      });
      
      window.dispatchEvent(autoPostEvent);
      console.log("تم تشغيل النشر التلقائي للصورة على فيسبوك");
      
    } catch (error) {
      console.error("خطأ في تشغيل النشر التلقائي للصورة:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // استخدام الصورة محلياً إذا كانت صورة
      if (file.type.startsWith('image/')) {
        handleLocalImageUpload(file);
      } else if (file.type.startsWith('video/')) {
        uploadVideo(file);
      }
    }
  };

  const handleLocalImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImageUrl(result);
      setUploadedFileType('image');
      onImageUploaded?.(result);
      toast.success('تم تحميل الصورة بنجاح!');
    };
    reader.readAsDataURL(file);
  };

  const uploadToImgbb = async (file: File) => {
    setIsUploading(true);
    setError("");
    setUploadProgress(0);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("يرجى اختيار ملف صورة صالح");
      setIsUploading(false);
      return;
    }

    // Validate file size (32MB limit for imgbb)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      setError("حجم الصورة كبير جداً. الحد الأقصى 32 ميجابايت");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", "6d207e02198a847aa98d0a2a901485a5"); // imgbb API key

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.data?.url) {
            setImgbbImageUrl(data.data.url);
            toast.success('تم رفع الصورة إلى imgbb بنجاح!');
            
            // حفظ المحتوى للنشر في فيسبوك دون فتح التبويبة
            setTimeout(() => {
              // إنشاء محتوى للصورة المرفوعة
              const imageContent = {
                longText: "🖼️ تم رفع صورة جديدة بنجاح!\n\n#صورة_جديدة #محتوى_رقمي",
                shortText: "صورة جديدة",
                imageUrl: data.data.url,
                imageAlt: "صورة مرفوعة",
                uploadedImageUrl: data.data.url
              };
              
              // حفظ المحتوى في Context - تم إزالة localStorage
              
              // إظهار إشعار تفاعلي
              toast.success("✅ تم إعداد الصورة للنشر في فيسبوك!", {
                duration: 4000,
                action: {
                  label: "اذهب إلى فيسبوك",
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent('navigateToFacebook', {
                      detail: imageContent
                    }));
                  }
                }
              });
            }, 1000);
          } else {
            throw new Error(data.error?.message || "خطأ في رفع الصورة");
          }
        } else {
          throw new Error(`خطأ في الخادم: ${xhr.status}`);
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError("فشل في الاتصال بخادم imgbb");
        setIsUploading(false);
      });

      xhr.open('POST', 'https://api.imgbb.com/1/upload');
      xhr.send(formData);

    } catch (error) {
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء الرفع");
      setIsUploading(false);
    }
  };

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    setError("");
    setUploadProgress(0);
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError("يرجى اختيار ملف فيديو صالح");
      setIsUploading(false);
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError("حجم الفيديو كبير جداً. الحد الأقصى 50 ميجابايت");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url) {
            setUploadedVideoUrl(data.secure_url);
            setUploadedFileType('video');
            onVideoUploaded?.(data.secure_url);
            toast.success('تم رفع الفيديو بنجاح!');
          } else {
            throw new Error(data.error?.message || "خطأ غير معروف");
          }
        } else {
          throw new Error(`خطأ في الخادم: ${xhr.status}`);
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError("فشل في الاتصال بالخادم");
        setIsUploading(false);
      });

      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dg3wnuvyo/video/upload');
      xhr.send(formData);

    } catch (error) {
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء الرفع");
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/') && acceptImages) {
        handleLocalImageUpload(file);
      } else if (file.type.startsWith('video/')) {
        uploadVideo(file);
      } else {
        toast.error(acceptImages ? 'يرجى إفلات ملف صورة أو فيديو صالح' : 'يرجى إفلات ملف فيديو صالح');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const copyToClipboard = async () => {
    try {
      const url = uploadedFileType === 'video' ? uploadedVideoUrl : uploadedImageUrl;
      await navigator.clipboard.writeText(url);
      toast.success(`تم نسخ رابط ${uploadedFileType === 'video' ? 'الفيديو' : 'الصورة'}!`);
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const copyImgbbLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(imgbbImageUrl);
      toast.success('تم نسخ رابط imgbb!');
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const resetUploader = () => {
    setUploadedVideoUrl("");
    setUploadedImageUrl("");
    setImgbbImageUrl("");
    setUploadedFileType(null);
    setError("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {acceptImages ? <ImageIcon className="h-5 w-5 text-primary" /> : <Video className="h-5 w-5 text-primary" />}
          {acceptImages ? 'رفع صورة أو فيديو' : 'رفع فيديو إلى Cloudinary'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!uploadedVideoUrl && !uploadedImageUrl ? (
          <>
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {acceptImages ? <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" /> : <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
              <p className="text-sm text-muted-foreground mb-2">
                {acceptImages ? 'اسحب الصورة أو الفيديو هنا أو انقر للاختيار' : 'اسحب الفيديو هنا أو انقر للاختيار'}
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptImages ? 'الصور: JPG, PNG, GIF • الفيديو: MP4, AVI, MOV (حد أقصى 50MB)' : 'الحد الأقصى: 50 ميجابايت • الصيغ المدعومة: MP4, AVI, MOV, WMV'}
              </p>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept={acceptImages ? "image/*,video/*" : "video/*"}
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>جاري الرفع...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                تم {uploadedFileType === 'video' ? 'رفع الفيديو' : 'تحميل الصورة'} بنجاح!
              </span>
            </div>

            {/* Media Preview */}
            <div className="space-y-3">
              {uploadedFileType === 'video' ? (
                <video
                  src={uploadedVideoUrl}
                  controls
                  className="w-full max-h-64 bg-muted rounded-lg"
                  poster=""
                >
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              ) : (
                <img
                  src={uploadedImageUrl}
                  alt="الصورة المرفوعة"
                  className="w-full max-h-64 object-contain bg-muted rounded-lg"
                />
              )}

              {/* Media URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {uploadedFileType === 'video' ? 'رابط الفيديو:' : 'رابط الصورة:'}
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-xs break-all text-muted-foreground">
                    {uploadedFileType === 'video' ? uploadedVideoUrl : uploadedImageUrl}
                  </code>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* ImgBB Upload Section for Images */}
              {uploadedFileType === 'image' && acceptImages && (
                <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      رفع إلى imgbb للمشاركة:
                    </span>
                    {!imgbbImageUrl && (
                      <Button
                        onClick={() => {
                          const fileInput = fileInputRef.current;
                          if (fileInput?.files?.[0]) {
                            uploadToImgbb(fileInput.files[0]);
                          }
                        }}
                        size="sm"
                        variant="outline"
                        disabled={isUploading}
                        className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        رفع إلى imgbb
                      </Button>
                    )}
                  </div>
                  
                  {imgbbImageUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <code className="flex-1 text-xs break-all text-muted-foreground">
                          {imgbbImageUrl}
                        </code>
                        <div className="flex gap-1">
                          <Button
                            onClick={copyImgbbLinkToClipboard}
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => window.open(imgbbImageUrl, '_blank')}
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {uploadedFileType === 'video' && (
                  <Button
                    onClick={() => window.open(uploadedVideoUrl, '_blank')}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    فتح الفيديو
                  </Button>
                )}
                
                <Button
                  onClick={resetUploader}
                  variant="outline"
                  size="sm"
                  className={uploadedFileType === 'video' ? "flex-1" : "w-full"}
                >
                  <X className="h-4 w-4 mr-2" />
                  {acceptImages ? 'رفع ملف آخر' : 'رفع فيديو آخر'}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUploader;