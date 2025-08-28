import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeminiImageEditorProps {
  imageUrl: string;
  onEditComplete: (editedImageUrl: string) => void;
  onError: (error: string) => void;
}

const imageStyles = [
  { value: 'realistic', label: 'واقعية' },
  { value: 'cartoon', label: 'كرتونية' },
  { value: 'anime', label: 'أنيمي' },
  { value: 'oil-painting', label: 'رسم زيتي' },
  { value: 'watercolor', label: 'ألوان مائية' },
  { value: 'sketch', label: 'رسم تخطيطي' },
  { value: 'digital-art', label: 'فن رقمي' },
  { value: 'vintage', label: 'كلاسيكية' },
  { value: 'modern', label: 'عصرية' },
  { value: 'minimalist', label: 'مبسط' }
];

export const GeminiImageEditor: React.FC<GeminiImageEditorProps> = ({
  imageUrl,
  onEditComplete,
  onError
}) => {
  const [prompt, setPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // رفع الصورة إلى imgbb
  const uploadToImgBB = async (base64Data: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('key', 'c9aeeb2c2e029f20a23564c192fd5764');
      formData.append('image', base64Data);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error?.message || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      throw new Error('فشل في رفع الصورة إلى imgbb');
    }
  };

  // تعديل الصورة باستخدام API الخارجي
  const editImage = async () => {
    if (!prompt.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال وصف التعديل المطلوب', variant: 'destructive' });
      return;
    }

    setIsEditing(true);
    
    try {
      console.log('🎨 بدء تعديل الصورة باستخدام API الخارجي...');
      
      // استدعاء API تعديل الصور الخارجي
      const editResponse = await fetch('https://image-editor-api.4kallaoui23.workers.dev/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          prompt: prompt,
          style: imageStyle
        })
      });

      const editResult = await editResponse.json();

      if (!editResult.success) {
        throw new Error(editResult.error || 'فشل في تعديل الصورة');
      }

      // رفع الصورة المعدلة إلى imgbb
      console.log('📤 رفع الصورة المعدلة إلى imgbb...');
      const uploadedUrl = await uploadToImgBB(editResult.imageData);
      
      console.log('✅ تم تعديل ورفع الصورة بنجاح');
      onEditComplete(uploadedUrl);
      toast({ 
        title: 'نجح', 
        description: 'تم تعديل الصورة ورفعها بنجاح!', 
        variant: 'default' 
      });
      
    } catch (error) {
      console.error('❌ خطأ في تعديل الصورة:', error);
      onError(error instanceof Error ? error.message : 'حدث خطأ في تعديل الصورة');
      
      // في حالة الخطأ، استخدم الصورة الأصلية
      onEditComplete(imageUrl);
      toast({ 
        title: 'خطأ', 
        description: 'فشل في تعديل الصورة - سيتم استخدام الصورة الأصلية',
        variant: 'destructive'
      });
    } finally {
      setIsEditing(false);
    }
  };

  const resetEditor = () => {
    setPrompt('');
    setImageStyle('realistic');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          محرر الصور بالذكاء الاصطناعي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معاينة الصورة */}
        <div className="relative rounded-lg overflow-hidden border">
          <img
            src={imageUrl}
            alt="الصورة المختارة"
            className="w-full h-48 object-cover"
          />
        </div>

        {/* وصف التعديل */}
        <div className="space-y-2">
          <Label htmlFor="edit-prompt">وصف التعديل المطلوب</Label>
          <Textarea
            id="edit-prompt"
            placeholder="اكتب وصف التعديل المطلوب... مثال: اجعل الصورة أكثر إشراقاً وأضف تأثيرات احترافية"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            dir="rtl"
          />
        </div>

        {/* نمط الصورة */}
        <div className="space-y-2">
          <Label htmlFor="image-style">نمط الصورة</Label>
          <Select value={imageStyle} onValueChange={setImageStyle}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نمط الصورة" />
            </SelectTrigger>
            <SelectContent>
              {imageStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2">
          <Button
            onClick={editImage}
            disabled={isEditing || !prompt.trim()}
            className="flex-1"
          >
            {isEditing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التعديل...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                تعديل الصورة
              </>
            )}
          </Button>
          
          <Button
            onClick={resetEditor}
            variant="outline"
            disabled={isEditing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة تعيين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};