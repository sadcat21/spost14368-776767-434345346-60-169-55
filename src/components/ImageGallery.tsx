import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Clock, RotateCcw, Sparkles, Share2, Facebook } from "lucide-react";
import { FacebookImagePublisher } from "./FacebookImagePublisher";

interface GeneratedImageData {
  id: string;
  imageUrl: string;
  imageData: string;
  prompt: string;
  style: string;
  timestamp: number;
  mimeType: string;
}

interface ImageGalleryProps {
  images: GeneratedImageData[];
  onImageClick: (image: GeneratedImageData) => void;
  onDownload: (image: GeneratedImageData) => void;
  onRegenerate?: (prompt: string, style: string) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageClick,
  onDownload,
  onRegenerate
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-2 border-primary/30 bg-card shadow-2xl shadow-primary/20">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="relative">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              <div className="absolute inset-0 h-7 w-7 text-primary animate-ping opacity-75"></div>
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              معرض الصور المولدة
            </span>
            <span className="text-foreground">({images.length})</span>
          </h3>
          <Badge 
            className="border-2 border-primary bg-primary text-primary-foreground font-bold px-4 py-2 text-sm shadow-lg"
          >
            المجموع: {images.length} صورة
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className="group overflow-hidden border-2 border-primary/20 bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-40 object-cover transition-all duration-500 group-hover:scale-110"
                  onClick={() => onImageClick(image)}
                />
                
                {/* طبقة التداخل المحسنة */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-3 z-20">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(image);
                      }}
                      className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg border-2 border-primary-foreground/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(image);
                      }}
                      className="h-9 w-9 p-0 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg border-2 border-accent-foreground/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onRegenerate && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerate(image.prompt, image.style);
                        }}
                        className="h-9 w-9 p-0 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg border-2 border-secondary-foreground/20 animate-pulse"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* مؤشر الوقت المحسن */}
                <div className="absolute top-3 left-3 bg-background border-2 border-primary/30 rounded-lg px-3 py-1 flex items-center gap-2 text-sm font-medium text-foreground shadow-lg">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{formatTime(image.timestamp)}</span>
                </div>
              </div>

              <CardContent className="p-4 space-y-4 bg-card">
                <p className="text-sm text-foreground font-medium line-clamp-2 leading-relaxed bg-muted/30 p-3 rounded-lg border border-muted">
                  {image.prompt}
                </p>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      className="text-sm bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold px-3 py-1 shadow-md border border-primary/30"
                    >
                      {image.style}
                    </Badge>
                    {onRegenerate && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerate(image.prompt, image.style);
                        }}
                        className="h-8 px-3 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-lg border border-secondary/30"
                      >
                        <RotateCcw className="h-3 w-3 ml-1" />
                        إعادة توليد
                      </Button>
                    )}
                  </div>
                  
                  {/* زر النشر على فيسبوك */}
                  <FacebookImagePublisher
                    imageUrl={image.imageUrl}
                    imageStyle={image.style}
                    textContent={`صورة ${image.style} مولدة بالذكاء الاصطناعي\n\n${image.prompt.substring(0, 100)}${image.prompt.length > 100 ? '...' : ''}`}
                    onPublishComplete={() => {
                      console.log('تم النشر بنجاح للصورة:', image.id);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-20 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border-2 border-primary/20">
            <div className="relative inline-block mb-8">
              <Sparkles className="h-20 w-20 mx-auto text-primary animate-pulse" />
              <div className="absolute inset-0 h-20 w-20 mx-auto text-primary/50 animate-ping">
                <Sparkles className="h-20 w-20" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">لا توجد صور مولدة بعد</h3>
            <p className="text-lg mb-6 text-foreground/80 font-medium">ابدأ بتوليد الصور الرائعة لرؤيتها في هذا المعرض المذهل</p>
            <div className="flex justify-center">
              <Badge className="bg-primary text-primary-foreground text-lg px-6 py-3 font-bold shadow-xl border-2 border-primary-foreground/20">
                🎨 استخدم الذكاء الاصطناعي لتوليد صور مذهلة
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};