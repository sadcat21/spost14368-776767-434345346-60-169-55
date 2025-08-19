import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Type,
  Palette,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoBackgroundTextProps {
  videoUrl?: string;
  initialText?: string;
  className?: string;
}

export const VideoBackgroundText: React.FC<VideoBackgroundTextProps> = ({
  videoUrl = "",
  initialText = "",
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [text, setText] = useState(initialText || "أضف نصك هنا");
  const [fontSize, setFontSize] = useState([48]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [backgroundOpacity, setBackgroundOpacity] = useState([0.5]);
  const [showText, setShowText] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // تحديث النص عندما يتغير النص الأولي
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleTextPositionChange = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setTextPosition({ x, y });
  };

  const downloadVideoWithText = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("الفيديو غير جاهز للتحميل");
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;

      if (ctx) {
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw background overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${backgroundOpacity[0]})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize[0]}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = (textPosition.x / 100) * canvas.width;
        const y = (textPosition.y / 100) * canvas.height;
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(text, x, y);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `video-with-text-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("تم تحميل الصورة بنجاح!");
          }
        }, 'image/png');
      }
    } catch (error) {
      toast.error("فشل في تحميل الصورة");
      console.error(error);
    }
  };

  if (!videoUrl) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-8 text-center">
          <Type className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">يرجى اختيار فيديو أولاً لإضافة النص عليه</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Type className="h-5 w-5 text-primary" />
          إضافة نص على الفيديو
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Video Preview with Text Overlay */}
        <div className="space-y-4">
          {/* Text Toggle Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => setShowText(!showText)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {showText ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {showText ? "إخفاء النص" : "إظهار النص"}
            </Button>
          </div>

          <div 
            className="relative bg-black rounded-lg overflow-hidden aspect-video cursor-crosshair"
            onClick={handleTextPositionChange}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              loop
              muted={isMuted}
              autoPlay={isPlaying}
              className="w-full h-full object-cover"
              onError={() => toast.error("فشل في تحميل الفيديو")}
            />
            
            {/* Background Overlay */}
            <div 
              className="absolute inset-0 bg-black transition-opacity"
              style={{ opacity: backgroundOpacity[0] }}
            />
            
            {/* Text Overlay */}
            {showText && (
              <div
                className="absolute pointer-events-none select-none transition-all duration-200"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: textColor,
                  fontSize: `${fontSize[0]}px`,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {text}
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Button
                onClick={handlePlayPause}
                size="sm"
                variant="secondary"
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={handleMuteToggle}
                size="sm"
                variant="secondary"
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            انقر على الفيديو لتحديد موقع النص
          </p>
        </div>

        {/* Text Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">النص:</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب النص الذي تريد إضافته..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">حجم الخط: {fontSize[0]}px</label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={16}
                max={100}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">شفافية الخلفية: {Math.round(backgroundOpacity[0] * 100)}%</label>
              <Slider
                value={backgroundOpacity}
                onValueChange={setBackgroundOpacity}
                min={0}
                max={0.8}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">لون النص:</label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={downloadVideoWithText}
            variant="default"
            className="flex-1 min-w-[200px]"
          >
            <Download className="h-4 w-4 mr-2" />
            تحميل إطار كصورة
          </Button>
        </div>

        {/* Hidden Canvas for Download */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};

export default VideoBackgroundText;