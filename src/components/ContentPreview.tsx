import React, { useState } from 'react';
import { 
  Eye, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  Share2,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  Settings,
  Move
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartPreview } from '@/hooks/useSmartPreview';
import { useMergedPreviewData, useLivePreview } from '@/contexts/LivePreviewContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoWithFrame } from '@/components/LogoWithFrame';
import { InteractiveCanvas } from '@/components/InteractiveCanvas';
import type { SidebarLogoSettings } from '@/components/SidebarLogoCustomizer';
import { formatDateInArabic } from "@/utils/dateUtils";

interface ContentPreviewProps {
  className?: string;
  showDeviceToggle?: boolean;
  showTools?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  title?: string;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  className,
  showDeviceToggle = true,
  showTools = true,
  compact = false,
  autoRefresh = true,
  title = "معاينة المحتوى"
}) => {
  const { previewData } = useMergedPreviewData();
  const { updatePreviewData } = useLivePreview();
  const { data: smartData, refresh, isRefreshing } = useSmartPreview({
    autoRefresh,
    refreshInterval: 2000,
    fallbackText: "قم بإنتاج محتوى لرؤية المعاينة",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'static' | 'interactive'>('static');

  // حالة المحتوى
  const contentStatus = {
    hasText: Boolean(smartData.text && smartData.text.trim()),
    hasImage: Boolean(smartData.imageUrl && smartData.imageUrl.trim()),
    hasLogo: Boolean(smartData.logoSettings?.logoUrl || smartData.sidebarLogoSettings?.logoUrl),
    isActive: smartData.hasContent,
    source: smartData.contentSource
  };

  // التحقق من وجود تحكم مخصص في الموضع
  const hasCustomLogoPosition = smartData.logoSettings?.useCustomLogoPosition;
  const hasCustomWatermarkPosition = smartData.logoSettings?.showWatermark && smartData.logoSettings?.useCustomWatermarkPosition;
  const isInteractive = hasCustomLogoPosition || hasCustomWatermarkPosition;

  // سجلات تشخيصية
  console.log('ContentPreview - Interactive check:', {
    hasCustomLogoPosition,
    hasCustomWatermarkPosition,
    isInteractive,
    logoSettings: smartData.logoSettings,
    hasImage: contentStatus.hasImage,
    imageUrl: smartData.imageUrl
  });

  // دالة تحديد موضع الشعار أو العلامة المائية
  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const currentLogoSettings = smartData.logoSettings || {};
    
    let updatedSettings = { ...currentLogoSettings };
    
    // تحديث موضع الشعار إذا كان مفعلاً
    if (hasCustomLogoPosition) {
      updatedSettings = {
        ...updatedSettings,
        customLogoX: Math.round(x),
        customLogoY: Math.round(y)
      };
    }
    
    // تحديث موضع العلامة المائية إذا كان مفعلاً
    if (hasCustomWatermarkPosition) {
      updatedSettings = {
        ...updatedSettings,
        customWatermarkX: Math.round(x),
        customWatermarkY: Math.round(y)
      };
    }
    
    // تحديث البيانات
    updatePreviewData({
      logoSettings: updatedSettings
    });
  };

  // أنماط الجهاز
  const getDeviceStyles = () => {
    if (compact) return "w-full h-48";
    
    switch (activeDevice) {
      case 'mobile':
        return 'w-80 h-96 max-w-full';
      case 'tablet':
        return 'w-96 h-[500px] max-w-full';
      default:
        return 'w-full h-80';
    }
  };

  // معلومات الحالة
  const getStatusInfo = () => {
    if (contentStatus.isActive) {
      return {
        color: 'bg-green-500',
        text: 'نشط',
        description: 'المحتوى جاهز للعرض'
      };
    } else if (isRefreshing) {
      return {
        color: 'bg-yellow-500 animate-pulse',
        text: 'يحدث',
        description: 'جاري البحث عن المحتوى'
      };
    } else {
      return {
        color: 'bg-gray-400',
        text: 'انتظار',
        description: 'في انتظار المحتوى'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={cn(
      "relative transition-all duration-300",
      isExpanded ? "fixed inset-4 z-50 shadow-2xl" : "",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
          
          {/* مؤشر الحالة */}
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
            <Badge variant={contentStatus.isActive ? "default" : "secondary"} className="text-xs">
              {statusInfo.text}
            </Badge>
          </div>

          {/* مؤشر المصدر */}
          {contentStatus.source !== 'fallback' && (
            <Zap className="h-4 w-4 text-green-500" />
          )}
        </div>

        {/* أدوات التحكم */}
        {showTools && (
          <div className="flex items-center gap-2">
            {/* زر التحديث */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>

            {/* زر التوسيع */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? 
                <Minimize2 className="h-4 w-4" /> : 
                <Maximize2 className="h-4 w-4" />
              }
            </Button>
          </div>
        )}
      </div>

      {/* أشرطة المعلومات السريعة */}
      {!compact && (
        <div className="flex items-center justify-between px-4 py-2 bg-background/50 border-b text-xs text-muted-foreground">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", contentStatus.hasText ? "bg-green-500" : "bg-gray-300")} />
              نص
            </span>
            <span className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", contentStatus.hasImage ? "bg-green-500" : "bg-gray-300")} />
              صورة
            </span>
            <span className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", contentStatus.hasLogo ? "bg-green-500" : "bg-gray-300")} />
              لوغو
            </span>
          </div>
          <div className="text-xs">
            المصدر: <span className="font-medium">{contentStatus.source}</span>
          </div>
        </div>
      )}

      {/* تبويبات الأجهزة ووضع العرض */}
      {showDeviceToggle && !compact && (
        <div className="px-4 pt-3 space-y-3">
          {/* تبديل وضع العرض */}
          <div className="flex items-center justify-center">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="static" className="flex items-center gap-1 text-xs py-1">
                  <Eye className="h-3 w-3" />
                  معاينة عادية
                </TabsTrigger>
                <TabsTrigger value="interactive" className="flex items-center gap-1 text-xs py-1">
                  <Move className="h-3 w-3" />
                  محرر تفاعلي
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* تبويبات الأجهزة (فقط للعرض العادي) */}
          {viewMode === 'static' && (
            <Tabs value={activeDevice} onValueChange={(value) => setActiveDevice(value as any)}>
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="desktop" className="flex items-center gap-1 text-xs py-1">
                  <Monitor className="h-3 w-3" />
                  <span className="hidden sm:inline">سطح المكتب</span>
                </TabsTrigger>
                <TabsTrigger value="tablet" className="flex items-center gap-1 text-xs py-1">
                  <Tablet className="h-3 w-3" />
                  <span className="hidden sm:inline">تابلت</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-1 text-xs py-1">
                  <Smartphone className="h-3 w-3" />
                  <span className="hidden sm:inline">موبايل</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      )}

      {/* منطقة المعاينة */}
      <div className="p-4">
        {/* زر تبديل سريع للمحرر التفاعلي */}
        {!compact && contentStatus.isActive && (
          <div className="mb-4 flex items-center justify-center">
            <Button
              variant={viewMode === 'interactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'interactive' ? 'static' : 'interactive')}
              className="flex items-center gap-2"
            >
              <Move className="h-4 w-4" />
              {viewMode === 'interactive' ? 'العودة للمعاينة العادية' : '🚀 تفعيل المحرر التفاعلي - اسحب وأفلت!'}
            </Button>
          </div>
        )}

        {viewMode === 'interactive' && !compact ? (
          /* المحرر التفاعلي - يظهر فقط في المولد القديم */
          <div className="text-center p-4 text-muted-foreground">
            <Move className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>المحرر التفاعلي متوفر في تبويب "المولد القديم"</p>
          </div>
        ) : (
          /* المعاينة العادية */
          <div className={cn(
            "mx-auto border border-border/50 rounded-lg overflow-hidden bg-background",
            getDeviceStyles()
          )}>
            {/* شريط عنوان الجهاز */}
            {!compact && (
              <div className="bg-muted/50 px-3 py-1 text-xs text-muted-foreground border-b flex items-center justify-between">
                <span>معاينة {activeDevice}</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
              </div>
            )}

            {/* المحتوى */}
            <div className={cn(
              "p-4 overflow-auto",
              compact ? "h-full" : "h-[calc(100%-2rem)]"
            )}>
              {contentStatus.isActive ? (
                <div className="space-y-4 h-full">
                  {/* منطقة المعاينة التفاعلية */}
                  <div className="space-y-2">
                    {/* رسالة توضيحية للميزة التفاعلية */}
                    {isInteractive && !compact && (
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-2 text-xs text-primary">
                        💡 انقر على المنطقة أدناه لتحديد موضع {hasCustomLogoPosition && hasCustomWatermarkPosition ? 'الشعار والعلامة المائية' : hasCustomLogoPosition ? 'الشعار' : 'العلامة المائية'} تفاعلياً
                      </div>
                    )}
                    
                    <div 
                      className={cn(
                        "relative rounded-lg overflow-hidden border-2 border-dashed border-border/50",
                        isInteractive ? "cursor-crosshair hover:ring-2 hover:ring-primary/50 hover:border-primary/50 transition-all" : "",
                        !contentStatus.hasImage ? "min-h-32 bg-muted/30" : ""
                      )}
                      onClick={handleImageClick}
                    >
                      {/* الصورة إذا كانت موجودة */}
                      {contentStatus.hasImage ? (
                        <img 
                          src={smartData.imageUrl} 
                          alt="معاينة المحتوى"
                          className={cn(
                            "w-full object-cover",
                            compact ? "h-20" : "h-32"
                          )}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        /* منطقة بديلة للتفاعل عند عدم وجود صورة */
                        <div className={cn(
                          "flex items-center justify-center text-muted-foreground",
                          compact ? "h-20" : "h-32"
                        )}>
                          <div className="text-center space-y-1">
                            <div className="text-2xl">🖼️</div>
                            <div className="text-xs">
                              {isInteractive ? 'انقر لتحديد موضع الشعار' : 'منطقة الصورة'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* خطوط مساعدة عند التفاعل */}
                      {isInteractive && !compact && (
                        <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity pointer-events-none">
                          <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/60" />
                          <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/60" />
                          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary/60" />
                          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary/60" />
                        </div>
                      )}
                      
                      {/* عرض اللوغو */}
                      {contentStatus.hasLogo && (
                        <LogoWithFrame 
                          logoSettings={(smartData.logoSettings || smartData.sidebarLogoSettings) as SidebarLogoSettings}
                          className="shadow-lg"
                        />
                      )}
                    </div>
                  </div>

                  {/* النص */}
                  {contentStatus.hasText && (
                    <div className="space-y-2">
                      {!compact && (
                        <div className="text-xs text-muted-foreground">النص المولد:</div>
                      )}
                      <div className={cn(
                        "leading-relaxed p-3 bg-muted/30 rounded-lg border-r-2 border-primary/50",
                        compact ? "text-xs" : "text-sm"
                      )}>
                        {compact ? 
                          smartData.text?.slice(0, 100) + (smartData.text?.length > 100 ? '...' : '') :
                          smartData.text?.slice(0, 300) + (smartData.text?.length > 300 ? '...' : '')
                        }
                      </div>
                    </div>
                  )}

                  {/* الإحصائيات */}
                  {!compact && (
                    <div className="pt-4 border-t border-border/30">
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>الأحرف: {smartData.text?.length || 0}</div>
                        <div>آخر تحديث: {formatDateInArabic(new Date(smartData.lastUpdate), true)}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* حالة عدم وجود محتوى */
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Eye className={cn(
                      "mx-auto opacity-50",
                      compact ? "h-6 w-6" : "h-12 w-12",
                      isRefreshing && "animate-pulse"
                    )} />
                    <p className={cn(compact ? "text-xs" : "text-sm")}>
                      {statusInfo.description}
                    </p>
                    {!compact && (
                      <p className="text-xs opacity-75">
                        قم بإنتاج محتوى أو تحديث الإعدادات
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* معلومات إضافية للنسخة المكبرة */}
      {isExpanded && (
        <div className="absolute bottom-4 right-4 left-4">
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>📊 البيانات: نص ({contentStatus.hasText ? '✓' : '✗'}), صورة ({contentStatus.hasImage ? '✓' : '✗'}), لوغو ({contentStatus.hasLogo ? '✓' : '✗'})</div>
              <div>🔄 التحديث التلقائي: {autoRefresh ? 'مفعل' : 'معطل'}</div>
              <div>📱 الجهاز: {activeDevice}</div>
              <div>⚡ الحالة: {statusInfo.description}</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ContentPreview;