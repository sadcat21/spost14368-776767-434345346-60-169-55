import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMergedPreviewData } from '@/contexts/LivePreviewContext';
import { useGeneratedContent } from '@/contexts/GeneratedContentContext';

interface SmartPreviewOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  fallbackText?: string;
  fallbackImage?: string;
}

export const useSmartPreview = (options: SmartPreviewOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 2000,
    fallbackText = "معاينة المحتوى",
    fallbackImage = ""
  } = options;

  const { previewData, updatePreviewData, hasContent } = useMergedPreviewData();
  const { generatedContent } = useGeneratedContent();
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // آلية ذكية لاكتشاف تغييرات المحتوى
  const contentSignature = useMemo(() => {
    return JSON.stringify({
      text: previewData.text,
      image: previewData.imageUrl,
      generated: generatedContent ? {
        text: generatedContent.longText || generatedContent.shortText,
        image: generatedContent.imageUrl || generatedContent.uploadedImageUrl
      } : null,
      timestamp: lastRefresh
    });
  }, [previewData, generatedContent, lastRefresh]);

  // دالة الإنعاش الذكي
  const smartRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('useSmartPreview - Starting smart refresh...');
    
    try {
      // محاولة استرداد البيانات من المصادر المختلفة
      const refreshedData: any = {};
      
      // من GeneratedContent
      if (generatedContent) {
        if (generatedContent?.longText || generatedContent?.shortText) {
          refreshedData.text = generatedContent?.longText || generatedContent?.shortText;
        }
        if (generatedContent?.imageUrl || generatedContent?.uploadedImageUrl) {
          refreshedData.imageUrl = generatedContent?.imageUrl || generatedContent?.uploadedImageUrl;
        }
      }
      
      // من LocalStorage كحل احتياطي
      try {
        const storedPreview = localStorage.getItem('smart_preview_backup');
        if (storedPreview) {
          const parsed = JSON.parse(storedPreview);
          if (!refreshedData.text && parsed.text) {
            refreshedData.text = parsed.text;
          }
          if (!refreshedData.imageUrl && parsed.imageUrl) {
            refreshedData.imageUrl = parsed.imageUrl;
          }
        }
      } catch (e) {
        console.warn('Failed to parse stored preview data:', e);
      }
      
      // تطبيق التحديثات إذا وُجدت
      if (Object.keys(refreshedData).length > 0) {
        console.log('useSmartPreview - Applying refreshed data:', refreshedData);
        updatePreviewData(refreshedData);
        
        // حفظ نسخة احتياطية
        localStorage.setItem('smart_preview_backup', JSON.stringify({
          ...refreshedData,
          timestamp: Date.now()
        }));
      }
      
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Smart refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [generatedContent, updatePreviewData, isRefreshing]);

  // التحديث التلقائي الذكي
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // تحقق من وجود محتوى جديد
      if (generatedContent && (!previewData.text || !previewData.imageUrl)) {
        console.log('useSmartPreview - Auto refresh triggered by new content');
        smartRefresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, smartRefresh, generatedContent, previewData]);

  // بيانات ذكية مُحسَّنة للعرض
  const smartData = useMemo(() => {
    const finalText = previewData.text || 
                     generatedContent?.longText || 
                     generatedContent?.shortText || 
                     fallbackText;
                     
    const finalImage = previewData.imageUrl || 
                      generatedContent?.imageUrl || 
                      generatedContent?.uploadedImageUrl || 
                      fallbackImage;

    const hasRealContent = Boolean(
      (previewData.text && previewData.text !== fallbackText) ||
      (previewData.imageUrl && previewData.imageUrl !== fallbackImage) ||
      generatedContent?.longText ||
      generatedContent?.shortText ||
      generatedContent?.imageUrl ||
      generatedContent?.uploadedImageUrl
    );

    return {
      text: finalText,
      imageUrl: finalImage,
      hasContent: hasRealContent,
      isLoading: isRefreshing,
      textSettings: previewData.textSettings || {},
      colorSettings: previewData.colorSettings || {},
      layoutSettings: previewData.layoutSettings || {},
      sidebarLogoSettings: previewData.sidebarLogoSettings,
      logoSettings: previewData.logoSettings,
      contentSource: hasRealContent ? 
        (previewData.text || previewData.imageUrl ? 'preview' : 'generated') : 
        'fallback',
      lastUpdate: lastRefresh
    };
  }, [previewData, generatedContent, fallbackText, fallbackImage, isRefreshing, lastRefresh]);

  return {
    data: smartData,
    refresh: smartRefresh,
    isRefreshing,
    contentSignature,
    originalHasContent: hasContent
  };
};