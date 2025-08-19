import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Download, 
  Copy, 
  Video,
  Eye,
  EyeOff,
  Clock,
  Tag,
  Upload,
  Type
} from 'lucide-react';
import { toast } from 'sonner';
import VideoUploader from './VideoUploader';
import VideoBackgroundText from './VideoBackgroundText';

interface VideoPreviewSectionProps {
  videoUrl: string;
  videoThumbnail: string;
  videoPageUrl: string;
  videoTags?: string;
  videoDuration?: number;
  videoViews?: number;
  isVisible: boolean;
  shortText?: string;
}

export const VideoPreviewSection: React.FC<VideoPreviewSectionProps> = ({
  videoUrl,
  videoThumbnail,
  videoPageUrl,
  videoTags,
  videoDuration,
  videoViews,
  isVisible,
  shortText
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullVideo, setShowFullVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showSection, setShowSection] = useState(isVisible);

  const toggleSectionVisibility = () => {
    setShowSection(!showSection);
  };

  const handleCopyVideoUrl = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      toast.success('تم نسخ رابط الفيديو بنجاح!');
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const handleCopyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(videoPageUrl);
      toast.success('تم نسخ رابط الصفحة بنجاح!');
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const handleDownloadVideo = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `pixabay-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('بدأ تحميل الفيديو...');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}م`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}ك`;
    }
    return views?.toString();
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            الفيديوهات
          </div>
          <Button
            onClick={toggleSectionVisibility}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {showSection ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSection ? 'إخفاء' : 'إظهار'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {showSection && (
        <CardContent className="space-y-4">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                معاينة Pixabay
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                رفع فيديو
              </TabsTrigger>
              <TabsTrigger value="text-overlay" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                نص على الفيديو
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4 mt-4">
              {/* Video Player Section */}
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                {!showFullVideo ? (
                  // Thumbnail View
                  <div className="relative w-full h-full group cursor-pointer" onClick={() => setShowFullVideo(true)}>
                    <img
                      src={videoThumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      onError={() => setVideoError(true)}
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </div>

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between text-white text-sm">
                        <div className="flex items-center gap-3">
                          {videoDuration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(videoDuration)}</span>
                            </div>
                          )}
                          {videoViews && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{formatViews(videoViews)} مشاهدة</span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFullVideo(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          تشغيل
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Video Player View
                  <div className="relative w-full h-full">
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                      onError={() => setVideoError(true)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      poster={videoThumbnail}
                    >
                      متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                    
                    <Button
                      onClick={() => setShowFullVideo(false)}
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      عرض الصورة المصغرة
                    </Button>
                  </div>
                )}

                {videoError && (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <div className="text-center p-4">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">فشل في تحميل الفيديو</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Tags */}
              {videoTags && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    العلامات:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {videoTags.split(',').slice(0, 8).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Links and Actions */}
              <div className="space-y-3">
                {/* Original Video URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    رابط الفيديو المباشر:
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-xs break-all text-muted-foreground">
                      {videoUrl}
                    </code>
                    <Button
                      onClick={handleCopyVideoUrl}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Pixabay Page URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    رابط صفحة Pixabay:
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-xs break-all text-muted-foreground">
                      {videoPageUrl}
                    </code>
                    <Button
                      onClick={handleCopyPageUrl}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={() => window.open(videoPageUrl, '_blank')}
                  variant="default"
                  size="sm"
                  className="flex-1 min-w-[120px]"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  فتح في Pixabay
                </Button>
                
                <Button
                  onClick={handleDownloadVideo}
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[120px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  تحميل الفيديو
                </Button>
                
                <Button
                  onClick={() => setShowFullVideo(!showFullVideo)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 min-w-[120px]"
                >
                  {showFullVideo ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      عرض الصورة المصغرة
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      تشغيل الفيديو
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4 mt-4">
              <VideoUploader 
                onVideoUploaded={(url) => {
                  toast.success('يمكنك الآن استخدام رابط الفيديو للنشر!');
                }}
              />
            </TabsContent>
            
            <TabsContent value="text-overlay" className="space-y-4 mt-4">
              <VideoBackgroundText 
                videoUrl={videoUrl} 
                initialText={shortText}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};

export default VideoPreviewSection;