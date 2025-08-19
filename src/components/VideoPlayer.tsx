import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, ExternalLink, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  videoPageUrl: string;
  videoTags?: string;
  alt?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  videoPageUrl,
  videoTags,
  alt,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handlePlayClick = () => {
    setShowVideo(true);
    setIsPlaying(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setShowVideo(false);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setShowVideo(false);
    setIsPlaying(false);
    setVideoError(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {!showVideo || videoError ? (
        // Thumbnail view with play button
        <div className="relative w-full h-full group">
          <img
            src={thumbnailUrl}
            alt={alt || "Video thumbnail"}
            className="w-full h-full object-cover"
            onError={() => console.error('Thumbnail failed to load')}
          />
          
          {/* Overlay with controls */}
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            
            {/* Play button in center */}
            <div className="flex-1 flex items-center justify-center">
              <Button
                onClick={handlePlayClick}
                size="lg"
                className="bg-white/90 hover:bg-white text-black rounded-full p-6 shadow-lg backdrop-blur-sm"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>

            {/* Bottom controls */}
            <div className="flex flex-col gap-2">
              {videoTags && (
                <div className="flex flex-wrap gap-1">
                  {videoTags.split(',').slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-white/80 text-black">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-end">
                <Button
                  onClick={handlePlayClick}
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Play className="h-4 w-4 mr-2" />
                  تشغيل الفيديو
                </Button>
                
                <Button
                  onClick={() => window.open(videoPageUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-black border-black/20"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  فتح الرابط
                </Button>
              </div>
            </div>
          </div>
          
          {/* Video error indicator */}
          {videoError && (
            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
              <div className="bg-white/90 p-4 rounded-lg text-center">
                <p className="text-sm text-red-600 mb-2">فشل في تحميل الفيديو</p>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Video player view
        <div className="relative w-full h-full">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
            onError={handleVideoError}
            onLoadStart={() => setVideoError(false)}
            poster={thumbnailUrl}
          >
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
          
          {/* Video overlay controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-black"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              عرض الصورة
            </Button>
            
            <Button
              onClick={() => window.open(videoPageUrl, '_blank')}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white text-black border-black/20"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Video link info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">رابط الفيديو الأصلي:</p>
              <p className="text-xs opacity-80 break-all">{videoPageUrl}</p>
              {videoTags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {videoTags.split(',').slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;