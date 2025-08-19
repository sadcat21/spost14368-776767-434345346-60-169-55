import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { SidebarLogoSettings } from '@/components/SidebarLogoCustomizer';
import { useGeneratedContent } from '@/contexts/GeneratedContentContext';

interface LivePreviewData {
  text: string;
  imageUrl: string;
  textSettings?: any;
  colorSettings?: any;
  layoutSettings?: any;
  sidebarLogoSettings?: SidebarLogoSettings;
  logoSettings?: any;
}

interface LivePreviewContextType {
  previewData: LivePreviewData;
  updatePreviewData: (data: Partial<LivePreviewData>) => void;
}

const LivePreviewContext = createContext<LivePreviewContextType | undefined>(undefined);

export const LivePreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [previewData, setPreviewData] = useState<LivePreviewData>({
    text: '',
    imageUrl: '',
    textSettings: {},
    colorSettings: {},
    layoutSettings: {}
  });

  const updatePreviewData = (data: Partial<LivePreviewData>) => {
    console.log('LivePreviewContext - updatePreviewData called with:', data);
    console.log('LivePreviewContext - previous previewData:', previewData);
    setPreviewData(prev => {
      const newData = { ...prev, ...data };
      console.log('LivePreviewContext - new previewData:', newData);
      return newData;
    });
  };

  return (
    <LivePreviewContext.Provider value={{ previewData, updatePreviewData }}>
      {children}
    </LivePreviewContext.Provider>
  );
};

export const useLivePreview = () => {
  const context = useContext(LivePreviewContext);
  if (context === undefined) {
    throw new Error('useLivePreview must be used within a LivePreviewProvider');
  }
  return context;
};

// Hook جديد يدمج البيانات من كلا الـ contexts
export const useMergedPreviewData = () => {
  const { previewData, updatePreviewData } = useLivePreview();
  const { generatedContent, hasContent } = useGeneratedContent();
  
  // دمج البيانات مع إعطاء الأولوية لـ LivePreviewContext
  const finalText = previewData.text || generatedContent?.longText || generatedContent?.shortText || '';
  const finalImageUrl = previewData.imageUrl || generatedContent?.imageUrl || generatedContent?.uploadedImageUrl || '';
  
  // تحسين منطق hasContent - فحص شامل للمحتوى
  const hasAnyContent = Boolean(
    finalText?.trim() || 
    finalImageUrl?.trim() || 
    hasContent ||
    Object.keys(previewData.textSettings || {}).length > 0 ||
    Object.keys(previewData.colorSettings || {}).length > 0 ||
    Object.keys(previewData.layoutSettings || {}).length > 0 ||
    previewData.sidebarLogoSettings?.logoUrl ||
    previewData.logoSettings?.logoUrl
  );
  
  const mergedData = {
    text: finalText,
    imageUrl: finalImageUrl,
    textSettings: previewData.textSettings || {},
    colorSettings: previewData.colorSettings || {},
    layoutSettings: previewData.layoutSettings || {},
    sidebarLogoSettings: previewData.sidebarLogoSettings,
    logoSettings: previewData.logoSettings,
    hasContent: hasAnyContent
  };
  
  console.log('useMergedPreviewData - previewData:', previewData);
  console.log('useMergedPreviewData - generatedContent:', generatedContent);
  console.log('useMergedPreviewData - mergedData:', mergedData);
  
  return {
    previewData: mergedData,
    updatePreviewData,
    hasContent: mergedData.hasContent
  };
};