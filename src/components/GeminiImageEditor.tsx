import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeminiImageEditorProps {
  imageUrl: string;
  onEditComplete: (editedImageUrl: string) => void;
  onError: (error: string) => void;
}

const imageStyles = [
  { value: 'realistic', label: 'واقعية' },
  { value: 'cartoon', label: 'كرتونية' },
  { value: 'professional', label: 'احترافية' },
  { value: 'artistic', label: 'فنية' },
  { value: 'modern', label: 'عصرية' },
  { value: 'vintage', label: 'كلاسيكية' }
];

export const GeminiImageEditor: React.FC<GeminiImageEditorProps> = ({
  imageUrl,
  onEditComplete,
  onError
}) => {
  const [prompt, setPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('professional');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // ترجمة النص العربي إلى الإنجليزية
  const translateToEnglish = async (arabicText: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          contents: [{
            parts: [{
              text: `Translate this Arabic text to English for image editing: "${arabicText}". Only return the English translation.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200
          }
        }
      });

      if (error) throw error;
      
      const translatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || arabicText;
      console.log('🔄 ترجمة النص:', { original: arabicText, translated: translatedText });
      return translatedText;
    } catch (error) {
      console.warn('⚠️ فشل في الترجمة، استخدام النص الأصلي:', error);
      return arabicText;
    }
  };

  // تعديل الصورة باستخدام Gemini
  const editImage = async () => {
    if (!prompt.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال وصف التعديل المطلوب', variant: 'destructive' });
      return;
    }

    setIsEditing(true);
    
    try {
      // ترجمة النص إلى الإنجليزية
      const englishPrompt = await translateToEnglish(prompt);
      
      // إنشاء prompt محسن مع النمط
      const enhancedPrompt = `Edit this image: ${englishPrompt}. Style: ${imageStyle}. Make it professional and high quality.`;
      
      console.log('🎨 بدء تعديل الصورة باستخدام Gemini...');
      
      // تحميل الصورة وتحويلها إلى base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // إزالة data:image/...;base64,
        };
        reader.readAsDataURL(blob);
      });

      // استدعاء خدمة تعديل الصور
      const { data: editResult, error: editError } = await supabase.functions.invoke('gemini-image-editing', {
        body: {
          imageData: base64,
          mimeType: blob.type,
          prompt: enhancedPrompt,
          temperature: 0.8
        }
      });

      if (editError) {
        console.error('❌ خطأ في تعديل الصورة:', editError);
        
        // في حالة الفشل، استخدم الصورة الأصلية
        onEditComplete(imageUrl);
        toast({ 
          title: 'تنبيه', 
          description: 'تم تخطي تعديل الصورة - سيتم استخدام الصورة الأصلية',
          variant: 'default'
        });
        return;
      }

      if (editResult?.editedImage) {
        console.log('✅ تم تعديل الصورة بنجاح');
        onEditComplete(editResult.editedImage);
        toast({ title: 'نجح', description: 'تم تعديل الصورة بنجاح!', variant: 'default' });
      } else {
        console.warn('⚠️ لم يتم إرجاع صورة معدلة، استخدام الصورة الأصلية');
        onEditComplete(imageUrl);
        toast({ 
          title: 'تنبيه', 
          description: 'تم استخدام الصورة الأصلية',
          variant: 'default'
        });
      }
      
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
    setImageStyle('professional');
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