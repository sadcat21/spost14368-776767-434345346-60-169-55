import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface GeneratedContent {
  longText: string;
  shortText: string;
  imageUrl: string;
  imageAlt?: string;
  originalImageUrl?: string;
  uploadedImageUrl?: string;
  isVideo?: boolean;
  videoPageUrl?: string;
  videoThumbnail?: string;
  videoTags?: string;
  videoDuration?: number;
  videoViews?: number;
}

interface GeneratedContentContextType {
  generatedContent: GeneratedContent | null;
  setGeneratedContent: (content: GeneratedContent | null | ((prev: GeneratedContent | null) => GeneratedContent | null)) => void;
  updateUploadedImageUrl: (url: string) => void;
  clearGeneratedContent: () => void;
  hasContent: boolean;
}

const GeneratedContentContext = createContext<GeneratedContentContextType | undefined>(undefined);

export const useGeneratedContent = () => {
  const context = useContext(GeneratedContentContext);
  if (context === undefined) {
    throw new Error('useGeneratedContent must be used within a GeneratedContentProvider');
  }
  return context;
};

interface GeneratedContentProviderProps {
  children: ReactNode;
}

export const GeneratedContentProvider = ({ children }: GeneratedContentProviderProps) => {
  const [generatedContent, setGeneratedContentState] = useState<GeneratedContent | null>(null);

  // تحميل المحتوى من localStorage عند بدء التطبيق فقط (للحفاظ على البيانات عند إعادة التحميل)
  useEffect(() => {
    const savedContent = localStorage.getItem('facebook_generated_content');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setGeneratedContentState(parsedContent);
      } catch (error) {
        console.error('خطأ في تحليل المحتوى المُولد:', error);
        localStorage.removeItem('facebook_generated_content');
      }
    }
  }, []);

  // حفظ في localStorage عند تغيير المحتوى (للاحتفاظ بالبيانات عند إعادة التحميل)
  useEffect(() => {
    if (generatedContent) {
      localStorage.setItem('facebook_generated_content', JSON.stringify(generatedContent));
    } else {
      localStorage.removeItem('facebook_generated_content');
    }
  }, [generatedContent]);

  const setGeneratedContent = (content: GeneratedContent | null | ((prev: GeneratedContent | null) => GeneratedContent | null)) => {
    if (typeof content === 'function') {
      setGeneratedContentState(prev => content(prev));
    } else {
      setGeneratedContentState(content);
    }
  };

  const updateUploadedImageUrl = (url: string) => {
    if (generatedContent) {
      setGeneratedContentState({
        ...generatedContent,
        uploadedImageUrl: url
      });
    }
  };

  const clearGeneratedContent = () => {
    setGeneratedContentState(null);
  };

  const hasContent = generatedContent !== null && (
    !!generatedContent.longText || 
    !!generatedContent.shortText || 
    !!generatedContent.imageUrl ||
    !!generatedContent.uploadedImageUrl
  );

  return (
    <GeneratedContentContext.Provider 
      value={{
        generatedContent,
        setGeneratedContent,
        updateUploadedImageUrl,
        clearGeneratedContent,
        hasContent
      }}
    >
      {children}
    </GeneratedContentContext.Provider>
  );
};