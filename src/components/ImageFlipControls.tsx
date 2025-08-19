import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from "lucide-react";

interface ImageFlipControlsProps {
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotateImage?: (rotation: number) => void;
  onReset: () => void;
  isFlippedHorizontal: boolean;
  isFlippedVertical: boolean;
  imageRotation?: number;
}

export const ImageFlipControls = ({
  onFlipHorizontal,
  onFlipVertical,
  onRotateImage,
  onReset,
  isFlippedHorizontal,
  isFlippedVertical,
  imageRotation = 0
}: ImageFlipControlsProps) => {
  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2 z-30 bg-background/90 backdrop-blur-md rounded-lg p-3 shadow-lg border">
      {/* أزرار القلب والتدوير */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant={isFlippedHorizontal ? "default" : "outline"}
          onClick={onFlipHorizontal}
          title="قلب الصورة أفقياً"
          className="h-8 w-8 p-0"
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant={isFlippedVertical ? "default" : "outline"}
          onClick={onFlipVertical}
          title="قلب الصورة عمودياً"
          className="h-8 w-8 p-0"
        >
          <FlipVertical className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          title="إعادة تعيين الاتجاه"
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* سلايدر التدوير */}
      {onRotateImage && (
        <div className="bg-muted/50 rounded-md p-2">
          <div className="flex items-center gap-2 min-w-[180px]">
            <RotateCw className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[imageRotation]}
              onValueChange={(value) => onRotateImage(value[0])}
              max={360}
              min={0}
              step={5}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[30px] text-center font-mono">
              {Math.round(imageRotation)}°
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-center mt-1">
            تدوير الصورة
          </div>
        </div>
      )}
    </div>
  );
};