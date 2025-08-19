
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Facebook, Linkedin, Twitter, Play, Copy, Edit2, Check, X, Type } from "lucide-react";
import { toast } from "sonner";

interface SocialPlatformPreviewProps {
  text: string;
  imageUrl?: string;
  originalImageUrl?: string;
  uploadedImageUrl?: string;
  onTextChange?: (newText: string) => void;
}

export const SocialPlatformPreview = ({ 
  text, 
  imageUrl, 
  originalImageUrl, 
  uploadedImageUrl,
  onTextChange 
}: SocialPlatformPreviewProps) => {
  const [selectedImageType, setSelectedImageType] = useState<'original' | 'generated' | 'uploaded'>('generated');
  const [editMode, setEditMode] = useState<{[key: string]: boolean}>({});
  const [tempUrls, setTempUrls] = useState<{[key: string]: string}>({});
  const [isEditingText, setIsEditingText] = useState(false);
  const [tempText, setTempText] = useState(text);
  
  // Determine which image to show based on selection
  const getDisplayImage = () => {
    if (selectedImageType === 'original' && originalImageUrl) {
      return originalImageUrl;
    } else if (selectedImageType === 'generated' && imageUrl) {
      return imageUrl;
    } else if (selectedImageType === 'uploaded' && uploadedImageUrl) {
      return uploadedImageUrl;
    }
    // Fallback to any available image
    return imageUrl || originalImageUrl || uploadedImageUrl;
  };

  const displayImage = getDisplayImage();
  const isVideo = displayImage && (displayImage.includes('.mp4') || displayImage.includes('.webm') || displayImage.includes('.mov') || displayImage.includes('video'));
  
  // Check if multiple images are available for choice
  const hasMultipleImages = Boolean(
    (originalImageUrl && imageUrl) || 
    (originalImageUrl && uploadedImageUrl) || 
    (imageUrl && uploadedImageUrl)
  );

  const platforms = [
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-social-instagram",
      textLimit: 2200,
      aspectRatio: "1:1",
      supportsVideo: true
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-social-facebook",
      textLimit: 63206,
      aspectRatio: "16:9",
      supportsVideo: true
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-social-linkedin",
      textLimit: 3000,
      aspectRatio: "4:5",
      supportsVideo: true
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      color: "bg-social-twitter",
      textLimit: 280,
      aspectRatio: "16:9",
      supportsVideo: true
    }
  ];

  const getTextStatus = (limit: number) => {
    const length = text.length;
    if (length <= limit) {
      return { status: "good", message: `${length}/${limit}` };
    } else {
      return { status: "exceeded", message: `تجاوز الحد المسموح بـ ${length - limit} حرف` };
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط!");
  };

  const startEdit = (type: string, currentUrl: string) => {
    setEditMode(prev => ({ ...prev, [type]: true }));
    setTempUrls(prev => ({ ...prev, [type]: currentUrl }));
  };

  const saveEdit = (type: string) => {
    setEditMode(prev => ({ ...prev, [type]: false }));
    toast.success("تم حفظ الرابط!");
  };

  const cancelEdit = (type: string) => {
    setEditMode(prev => ({ ...prev, [type]: false }));
    setTempUrls(prev => ({ ...prev, [type]: "" }));
  };

  const updateTempUrl = (type: string, url: string) => {
    setTempUrls(prev => ({ ...prev, [type]: url }));
  };

  const startTextEdit = () => {
    setIsEditingText(true);
    setTempText(text);
  };

  const saveTextEdit = () => {
    if (onTextChange) {
      onTextChange(tempText);
    }
    setIsEditingText(false);
    toast.success("تم حفظ النص!");
  };

  const cancelTextEdit = () => {
    setTempText(text);
    setIsEditingText(false);
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ النص!");
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="text-primary">معاينة المنصات الاجتماعية</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Editing Section */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              النص للنشر:
            </Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyText}
                title="نسخ النص"
              >
                <Copy className="h-3 w-3" />
              </Button>
              {!isEditingText && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startTextEdit}
                  title="تعديل النص"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {isEditingText ? (
            <div className="space-y-2">
              <Textarea
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                rows={6}
                className="resize-none"
                placeholder="اكتب النص هنا..."
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  عدد الأحرف: {tempText.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveTextEdit}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    حفظ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelTextEdit}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded text-sm max-h-32 overflow-y-auto">
                {text || "لا يوجد نص"}
              </div>
              <p className="text-sm text-muted-foreground">
                عدد الأحرف: {text.length}
              </p>
            </div>
          )}
        </div>

        {/* Image Selection */}
        {hasMultipleImages && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <Label className="text-sm font-medium">اختيار نوع الصورة للمعاينة:</Label>
            <RadioGroup
              value={selectedImageType}
              onValueChange={(value) => setSelectedImageType(value as 'original' | 'generated' | 'uploaded')}
              className="flex flex-wrap gap-4"
            >
              {originalImageUrl && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="original" id="original" />
                  <Label htmlFor="original" className="text-sm">
                    الصورة الأساسية (بدون نص)
                  </Label>
                </div>
              )}
              
              {imageUrl && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="generated" id="generated" />
                  <Label htmlFor="generated" className="text-sm">
                    الصورة المولدة (مع النص)
                  </Label>
                </div>
              )}
              
              {uploadedImageUrl && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="uploaded" id="uploaded" />
                  <Label htmlFor="uploaded" className="text-sm">
                    الصورة المرفوعة
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>
        )}

        {/* Image URLs Management */}
        {(originalImageUrl || imageUrl || uploadedImageUrl) && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
            <Label className="text-sm font-medium text-primary">روابط الصور المتاحة:</Label>
            
            {/* Original Image URL */}
            {originalImageUrl && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">الصورة الأساسية (بدون نص):</Label>
                <div className="flex items-center gap-2">
                  {editMode.original ? (
                    <>
                      <Input
                        value={tempUrls.original || originalImageUrl}
                        onChange={(e) => updateTempUrl('original', e.target.value)}
                        className="text-xs"
                        placeholder="أدخل رابط الصورة الأساسية"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveEdit('original')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit('original')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        value={originalImageUrl}
                        readOnly
                        className="text-xs bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrl(originalImageUrl)}
                        title="نسخ الرابط"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit('original', originalImageUrl)}
                        title="تعديل الرابط"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Generated Image URL */}
            {imageUrl && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">الصورة المولدة (مع النص):</Label>
                <div className="flex items-center gap-2">
                  {editMode.generated ? (
                    <>
                      <Input
                        value={tempUrls.generated || imageUrl}
                        onChange={(e) => updateTempUrl('generated', e.target.value)}
                        className="text-xs"
                        placeholder="أدخل رابط الصورة المولدة"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveEdit('generated')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit('generated')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        value={imageUrl}
                        readOnly
                        className="text-xs bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrl(imageUrl)}
                        title="نسخ الرابط"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit('generated', imageUrl)}
                        title="تعديل الرابط"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Image URL */}
            {uploadedImageUrl && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">الصورة المرفوعة:</Label>
                <div className="flex items-center gap-2">
                  {editMode.uploaded ? (
                    <>
                      <Input
                        value={tempUrls.uploaded || uploadedImageUrl}
                        onChange={(e) => updateTempUrl('uploaded', e.target.value)}
                        className="text-xs"
                        placeholder="أدخل رابط الصورة المرفوعة"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveEdit('uploaded')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit('uploaded')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        value={uploadedImageUrl}
                        readOnly
                        className="text-xs bg-muted"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyUrl(uploadedImageUrl)}
                        title="نسخ الرابط"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit('uploaded', uploadedImageUrl)}
                        title="تعديل الرابط"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platform Previews */}
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const textStatus = getTextStatus(platform.textLimit);
          
          return (
            <div key={platform.name} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{platform.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {platform.aspectRatio}
                  </Badge>
                  {isVideo && platform.supportsVideo && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      فيديو
                    </Badge>
                  )}
                </div>
                <Badge 
                  variant={textStatus.status === "good" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {textStatus.message}
                </Badge>
              </div>
              
              {displayImage && (
                <div className={`max-w-32 rounded-lg overflow-hidden border relative ${
                  platform.aspectRatio === '1:1' ? 'aspect-square' :
                  platform.aspectRatio === '4:5' ? 'aspect-[4/5]' :
                  platform.aspectRatio === '16:9' ? 'aspect-[16/9]' :
                  'aspect-square'
                }`}>
                  {isVideo ? (
                    <>
                      <video 
                        src={displayImage} 
                        className="w-full h-full object-cover"
                        muted
                        loop
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <img 
                      src={displayImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                {text.length > 100 ? `${text.substring(0, 100)}...` : text}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
