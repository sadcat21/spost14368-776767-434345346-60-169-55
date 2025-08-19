import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Text, Image as FabricImage, Rect, Circle } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Move, RotateCw, Type, Image as ImageIcon, Square, CircleIcon, Trash2, Download, Lock, Unlock, ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InteractiveCanvasProps {
  text?: string;
  imageUrl?: string;
  logoUrl?: string;
  watermarkUrl?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  text = 'نص تجريبي',
  imageUrl,
  logoUrl,
  watermarkUrl,
  width = 800,
  height = 600,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  // تهيئة Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      allowTouchScrolling: false,
    });

    setFabricCanvas(canvas);
    
    // إضافة مستمعات الأحداث
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0] || null;
      setActiveObject(obj);
      if (obj) {
        toast.success(`تم تحديد ${obj.type === 'text' ? 'النص' : 'العنصر'}`);
      }
    });
    
    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0] || null;
      setActiveObject(obj);
      if (obj) {
        toast.success(`تم تحديد ${obj.type === 'text' ? 'النص' : 'العنصر'}`);
      }
    });
    
    canvas.on('selection:cleared', () => {
      setActiveObject(null);
    });

    // إضافة أحداث الحركة
    canvas.on('object:moving', (e) => {
      console.log('العنصر يتحرك:', e.target?.type);
    });

    canvas.on('object:modified', (e) => {
      toast.success('تم تحريك/تعديل العنصر');
    });

    canvas.on('object:scaling', (e) => {
      console.log('العنصر يتم تغيير حجمه:', e.target?.type);
    });

    canvas.on('object:rotating', (e) => {
      console.log('العنصر يدور:', e.target?.type);
    });

    // إشعار جاهزية المحرر
    toast.success('المحرر التفاعلي جاهز! يمكنك الآن تحريك العناصر');

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  // إضافة المحتوى الأولي
  useEffect(() => {
    if (!fabricCanvas) return;

    // مسح المحتوى السابق
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';

    // إضافة صورة الخلفية
    if (imageUrl) {
      FabricImage.fromURL(imageUrl).then((img) => {
        img.set({
          left: 0,
          top: 0,
          scaleX: width / (img.width || 1),
          scaleY: height / (img.height || 1),
          selectable: false,
          evented: false,
        });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      });
    }

    // إضافة النص
    if (text && text.trim()) {
      const textObj = new Text(text, {
        left: 50,
        top: 50,
        fontFamily: 'Arial',
        fontSize: 24,
        fill: '#000000',
        fontWeight: 'bold',
        textAlign: 'right',
        direction: 'rtl',
        cornerStyle: 'circle',
        cornerColor: '#0066cc',
        cornerSize: 8,
        transparentCorners: false,
        borderColor: '#0066cc',
        borderScaleFactor: 2,
      });
      fabricCanvas.add(textObj);
    }

    // إضافة اللوغو
    if (logoUrl) {
      FabricImage.fromURL(logoUrl).then((img) => {
        img.set({
          left: width - 120,
          top: 20,
          scaleX: 0.3,
          scaleY: 0.3,
        });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      });
    }

    // إضافة العلامة المائية
    if (watermarkUrl) {
      FabricImage.fromURL(watermarkUrl).then((img) => {
        img.set({
          left: width - 150,
          top: height - 100,
          scaleX: 0.2,
          scaleY: 0.2,
          opacity: 0.7,
        });
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
      });
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, text, imageUrl, logoUrl, watermarkUrl, width, height]);

  // إضافة نص جديد
  const addText = () => {
    if (!fabricCanvas) return;
    
    const newText = new Text('نص جديد', {
      left: Math.random() * (width - 200) + 50,
      top: Math.random() * (height - 100) + 50,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#000000',
      textAlign: 'right',
      direction: 'rtl',
    });
    
    fabricCanvas.add(newText);
    fabricCanvas.setActiveObject(newText);
    fabricCanvas.renderAll();
    toast.success('تم إضافة نص جديد');
  };

  // إضافة شكل مربع
  const addRectangle = () => {
    if (!fabricCanvas) return;
    
    const rect = new Rect({
      left: Math.random() * (width - 100) + 50,
      top: Math.random() * (height - 100) + 50,
      fill: '#3B82F6',
      width: 100,
      height: 60,
      opacity: 0.8,
    });
    
    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
    toast.success('تم إضافة مربع');
  };

  // إضافة دائرة
  const addCircle = () => {
    if (!fabricCanvas) return;
    
    const circle = new Circle({
      left: Math.random() * (width - 100) + 50,
      top: Math.random() * (height - 100) + 50,
      fill: '#EF4444',
      radius: 40,
      opacity: 0.8,
    });
    
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
    fabricCanvas.renderAll();
    toast.success('تم إضافة دائرة');
  };

  // حذف العنصر المحدد
  const deleteSelected = () => {
    if (!fabricCanvas || !activeObject) return;
    
    fabricCanvas.remove(activeObject);
    fabricCanvas.renderAll();
    setActiveObject(null);
    toast.success('تم حذف العنصر');
  };

  // قفل/إلغاء قفل العناصر
  const toggleLock = () => {
    if (!fabricCanvas) return;
    
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    
    fabricCanvas.getObjects().forEach((obj) => {
      obj.set({
        selectable: !newLockState,
        evented: !newLockState,
      });
    });
    
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    toast.success(newLockState ? 'تم قفل العناصر' : 'تم إلغاء قفل العناصر');
  };

  // تصدير كصورة
  const exportAsImage = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = 'interactive-design.png';
    link.href = dataURL;
    link.click();
    toast.success('تم تصدير التصميم');
  };

  // دوران العنصر المحدد
  const rotateSelected = () => {
    if (!fabricCanvas || !activeObject) return;
    
    const currentAngle = activeObject.angle || 0;
    activeObject.set('angle', currentAngle + 15);
    fabricCanvas.renderAll();
  };

  // تحريك العنصر للأمام
  const bringForward = () => {
    if (!fabricCanvas || !activeObject) return;
    
    fabricCanvas.bringObjectForward(activeObject);
    fabricCanvas.renderAll();
    toast.success('تم تحريك العنصر للأمام');
  };

  // تحريك العنصر للخلف  
  const sendBackward = () => {
    if (!fabricCanvas || !activeObject) return;
    
    fabricCanvas.sendObjectBackwards(activeObject);
    fabricCanvas.renderAll();
    toast.success('تم تحريك العنصر للخلف');
  };

  // تحريك العنصر للمقدمة تماماً
  const bringToFront = () => {
    if (!fabricCanvas || !activeObject) return;
    
    fabricCanvas.bringObjectToFront(activeObject);
    fabricCanvas.renderAll();
    toast.success('تم تحريك العنصر للمقدمة');
  };

  // تحريك العنصر للخلف تماماً
  const sendToBack = () => {
    if (!fabricCanvas || !activeObject) return;
    
    fabricCanvas.sendObjectToBack(activeObject);
    fabricCanvas.renderAll();
    toast.success('تم تحريك العنصر للخلف تماماً');
  };

  // إعدادات محسنة للتفاعل مع العناصر
  const selectObjectUnder = () => {
    if (!fabricCanvas || !activeObject) return;
    
    const objects = fabricCanvas.getObjects();
    const currentIndex = objects.indexOf(activeObject);
    
    if (currentIndex > 0) {
      const objectBelow = objects[currentIndex - 1];
      fabricCanvas.setActiveObject(objectBelow);
      fabricCanvas.renderAll();
      toast.success('تم تحديد العنصر أسفل');
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Move className="h-5 w-5" />
          محرر تفاعلي - اسحب وأفلت العناصر
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* شريط الأدوات */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={addText}
            className="flex items-center gap-1"
          >
            <Type className="h-4 w-4" />
            نص
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={addRectangle}
            className="flex items-center gap-1"
          >
            <Square className="h-4 w-4" />
            مربع
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={addCircle}
            className="flex items-center gap-1"
          >
            <CircleIcon className="h-4 w-4" />
            دائرة
          </Button>
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={rotateSelected}
            disabled={!activeObject}
            className="flex items-center gap-1"
          >
            <RotateCw className="h-4 w-4" />
            دوران
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={deleteSelected}
            disabled={!activeObject}
            className="flex items-center gap-1 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLock}
            className={cn(
              "flex items-center gap-1",
              isLocked && "bg-yellow-500/10 border-yellow-500"
            )}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {isLocked ? 'مقفل' : 'مفتوح'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsImage}
            className="flex items-center gap-1 text-green-600"
          >
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>

        {/* شريط أدوات الطبقات */}
        {activeObject && (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-blue-50/50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-1 text-sm font-medium text-blue-700">
              <Layers className="h-4 w-4" />
              التحكم في الطبقات:
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={bringToFront}
              className="flex items-center gap-1"
            >
              <ArrowUp className="h-4 w-4" />
              للمقدمة
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={bringForward}
              className="flex items-center gap-1"
            >
              <ArrowUp className="h-3 w-3" />
              للأمام
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={sendBackward}
              className="flex items-center gap-1"
            >
              <ArrowDown className="h-3 w-3" />
              للخلف
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={sendToBack}
              className="flex items-center gap-1"
            >
              <ArrowDown className="h-4 w-4" />
              للخلف تماماً
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectObjectUnder}
              className="flex items-center gap-1"
            >
              <Layers className="h-4 w-4" />
              العنصر أسفل
            </Button>
          </div>
        )}

        {/* معلومات العنصر المحدد */}
        {activeObject && (
          <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
            <span className="font-medium">العنصر المحدد:</span> {activeObject.type}
            {activeObject.type === 'text' && (
              <span className="mr-2">النص: "{activeObject.text?.slice(0, 20)}..."</span>
            )}
          </div>
        )}

        {/* Canvas */}
        <div className="border border-border rounded-lg overflow-hidden bg-white">
          <canvas 
            ref={canvasRef}
            className="block max-w-full max-h-[600px]"
          />
        </div>

        {/* تعليمات الاستخدام */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">💡 كيفية الاستخدام:</div>
          <div>• انقر على أي عنصر لتحديده</div>
          <div>• اسحب العناصر لتحريكها</div>
          <div>• استخدم المقابض لتغيير الحجم</div>
          <div>• استخدم مقبض الدوران لتدوير العناصر</div>
          <div>• استخدم أزرار الأدوات لإضافة عناصر جديدة</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveCanvas;