import React, { useEffect, useState, useCallback } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, Download, Eye, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSmartPreview } from '@/hooks/useSmartPreview';
import { useMergedPreviewData } from '@/contexts/LivePreviewContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface PreviewManagerProps {
  className?: string;
}

export const PreviewManager: React.FC<PreviewManagerProps> = ({ className }) => {
  const { previewData } = useMergedPreviewData();
  const { data: smartData, refresh, isRefreshing } = useSmartPreview({
    autoRefresh: true,
    refreshInterval: 2000,
  });
  
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // مؤشرات الحالة
  const statusIndicators = {
    hasText: Boolean(smartData.text && smartData.text.trim()),
    hasImage: Boolean(smartData.imageUrl && smartData.imageUrl.trim()),
    hasSettings: Boolean(Object.keys(smartData.textSettings || {}).length > 0),
    isActive: smartData.hasContent,
    source: smartData.contentSource
  };

  const getDeviceClasses = () => {
    switch (activeDevice) {
      case 'mobile':
        return 'w-[375px] h-[667px]';
      case 'tablet':
        return 'w-[768px] h-[1024px]';
      default:
        return 'w-full h-[500px]';
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      {/* Header مع أدوات التحكم */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">مدير المعاينة الذكي</h2>
          <Badge variant={statusIndicators.isActive ? "default" : "secondary"}>
            {statusIndicators.isActive ? "نشط" : "في الانتظار"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle للتحديث التلقائي */}
          <Button
            variant={autoRefreshEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          >
            <Settings className="h-4 w-4 mr-1" />
            تلقائي
          </Button>
          
          {/* زر التحديث اليدوي */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
            تحديث
          </Button>
        </div>
      </div>

      {/* مؤشرات الحالة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className={cn(
            "w-3 h-3 rounded-full",
            statusIndicators.hasText ? "bg-green-500" : "bg-gray-300"
          )} />
          <span className="text-sm">النص</span>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className={cn(
            "w-3 h-3 rounded-full",
            statusIndicators.hasImage ? "bg-green-500" : "bg-gray-300"
          )} />
          <span className="text-sm">الصورة</span>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className={cn(
            "w-3 h-3 rounded-full",
            statusIndicators.hasSettings ? "bg-green-500" : "bg-gray-300"
          )} />
          <span className="text-sm">الإعدادات</span>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            statusIndicators.source === 'generated' ? "bg-blue-500" :
            statusIndicators.source === 'preview' ? "bg-green-500" : "bg-yellow-500"
          )} />
          <span className="text-sm">{statusIndicators.source}</span>
        </div>
      </div>

      {/* تبويبات الأجهزة */}
      <Tabs value={activeDevice} onValueChange={(value) => setActiveDevice(value as any)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            سطح المكتب
          </TabsTrigger>
          <TabsTrigger value="tablet" className="flex items-center gap-2">
            <Tablet className="h-4 w-4" />
            تابلت
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            موبايل
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* منطقة المعاينة */}
      <div className="border border-border rounded-lg p-4 bg-background/50 overflow-auto">
        <div className={cn("mx-auto border border-border/50 rounded-lg overflow-hidden", getDeviceClasses())}>
          {/* Header */}
          <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b">
            معاينة {activeDevice} - المصدر: {smartData.contentSource}
          </div>
          
          {/* Content */}
          <div className="p-4 min-h-[200px] bg-background">
            {statusIndicators.isActive ? (
              <div className="space-y-4">
                {/* النص */}
                {statusIndicators.hasText && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">النص:</div>
                    <div className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">
                      {smartData.text?.slice(0, 200)}
                      {(smartData.text?.length || 0) > 200 && '...'}
                    </div>
                  </div>
                )}
                
                {/* الصورة */}
                {statusIndicators.hasImage && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">الصورة:</div>
                    <div className="relative rounded-lg overflow-hidden bg-muted/20">
                      <img 
                        src={smartData.imageUrl} 
                        alt="معاينة"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* الإحصائيات */}
                <div className="pt-4 border-t border-border/30">
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>الأحرف: {smartData.text?.length || 0}</div>
                    <div>آخر تحديث: {new Date(smartData.lastUpdate).toLocaleTimeString('ar')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                  <Eye className={cn("h-12 w-12 mx-auto opacity-50", isRefreshing && "animate-pulse")} />
                  <p className="text-sm">
                    {isRefreshing ? "جاري البحث عن المحتوى..." : "في انتظار المحتوى"}
                  </p>
                  <p className="text-xs opacity-75">
                    قم بإنتاج محتوى أو تحديث الإعدادات
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>📊 البيانات المتاحة: نص ({statusIndicators.hasText ? '✓' : '✗'}), صورة ({statusIndicators.hasImage ? '✓' : '✗'}), إعدادات ({statusIndicators.hasSettings ? '✓' : '✗'})</div>
          <div>🔄 التحديث التلقائي: {autoRefreshEnabled ? 'مفعل' : 'معطل'}</div>
          <div>📱 الجهاز: {activeDevice}</div>
        </div>
      </div>
    </Card>
  );
};

export default PreviewManager;