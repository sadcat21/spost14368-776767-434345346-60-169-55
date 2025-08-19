import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface GeminiImageGenerationParams {
  imagePrompt: string;
  geniusPrompt?: string; // برومت النمط جينيوس
  collagePrompt?: string; // برومت تصميم الكولاج
  organicMaskPrompt?: string; // برومت القص العضوي
  socialBrandingPrompt?: string; // برومت العلامة التجارية الاجتماعية
  splitLayoutPrompt?: string; // برومت التصميم المقسوم
  geometricMaskingPrompt?: string; // برومت القص الهندسي
  minimalistFramePrompt?: string; // برومت الإطار البسيط
  gradientOverlayPrompt?: string; // برومت طبقة التدرج اللوني
  asymmetricalLayoutPrompt?: string; // برومت التصميم غير المتماثل
  duotoneDesignPrompt?: string; // برومت التصميم ثنائي اللون
  cutoutTypographyPrompt?: string; // برومت قص النصوص
  overlayPatternPrompt?: string; // برومت طبقة النقوش
  technicalNetworkPrompt?: string; // برومت الشبكة التقنية المتدرجة
  style?: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string;
  numberOfImages?: number;
  enableDivision?: boolean;
  numSections?: number;
  divisionType?: string;
  sectionDescriptions?: string[];
  separatorDescription?: string;
  generateBothStyles?: boolean; // توليد النمطين معاً
  generateAllStyles?: boolean; // توليد جميع الأنماط
}

interface GeneratedImageResult {
  imageUrl: string;
  imageData: string;
  description?: string;
  mimeType: string;
  style?: 'normal' | 'genius' | 'collage' | 'organic' | 'social' | 'splitLayout' | 'geometricMasking' | 'minimalistFrame' | 'gradientOverlay' | 'asymmetricalLayout' | 'duotoneDesign' | 'cutoutTypography' | 'overlayPattern' | 'technicalNetwork';
}

interface GeneratedImageWithEdit {
  originalImages: GeneratedImageResult[];
  geniusImages: GeneratedImageResult[];
  collageImages: GeneratedImageResult[];
  organicImages: GeneratedImageResult[];
  socialImages: GeneratedImageResult[];
  splitLayoutImages: GeneratedImageResult[];
  geometricMaskingImages: GeneratedImageResult[];
  minimalistFrameImages: GeneratedImageResult[];
  gradientOverlayImages: GeneratedImageResult[];
  asymmetricalLayoutImages: GeneratedImageResult[];
  duotoneDesignImages: GeneratedImageResult[];
  cutoutTypographyImages: GeneratedImageResult[];
  overlayPatternImages: GeneratedImageResult[];
  technicalNetworkImages: GeneratedImageResult[];
  editedImages: Array<{
    imageUrl: string;
    imageData: string;
    description?: string;
    mimeType: string;
    editPrompt: string;
  }>;
}

// Helper functions من النمط المرجعي
const imageStyles = [
  { value: 'realistic', label: 'واقعية' },
  { value: 'cartoon', label: 'كرتونية' },
  { value: 'anime', label: 'أنمي' },
  { value: 'oil-painting', label: 'رسم زيتي' },
  { value: 'watercolor', label: 'ألوان مائية' },
  { value: 'sketch', label: 'رسم تخطيطي' },
  { value: 'digital-art', label: 'فن رقمي' },
  { value: 'vintage', label: 'كلاسيكي' },
  { value: 'modern', label: 'عصري' },
  { value: 'minimalist', label: 'بسيط' },
  { value: '3d-render', label: 'رندر ثلاثي الأبعاد' },
  { value: 'photographic', label: 'فوتوغرافي' }
];

const getStyleText = (style: string): string => {
  const styleMap: { [key: string]: string } = {
    'realistic': 'Create a photorealistic image with natural lighting and high detail',
    'cartoon': 'Create in cartoon style with vibrant colors and simplified forms',
    'anime': 'Transform into anime/manga style with characteristic features',
    'oil-painting': 'Apply oil painting technique with visible brush strokes and artistic texture',
    'watercolor': 'Use watercolor painting style with soft edges and flowing colors',
    'sketch': 'Convert to pencil sketch style with fine lines and shading',
    'digital-art': 'Create as digital artwork with modern techniques and effects',
    'vintage': 'Apply vintage style with retro colors and classic atmosphere',
    'modern': 'Use modern contemporary style with clean lines and current aesthetics',
    'minimalist': 'Create in minimalist style with simple forms and clean composition',
    '3d-render': 'Create a 3D rendered image with realistic materials and lighting',
    'photographic': 'Create a high-quality photographic image with professional composition'
  };
  
  return styleMap[style] || styleMap['realistic'];
};

// ترجمة النص العربي للإنجليزية
const translatePrompt = async (arabicPrompt: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following Arabic text to English for image generation purposes. Only return the English translation without any additional text or explanation: "${arabicPrompt}"`
          }]
        }]
      })
    });

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || arabicPrompt;
    
    console.log('ترجمة النص:', { original: arabicPrompt, translated: translatedText });
    return translatedText;
  } catch (error) {
    console.error('خطأ في ترجمة النص:', error);
    return arabicPrompt;
  }
};

export const useGeminiContentImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageWithEdit | null>(null);
  const [error, setError] = useState<string | null>(null);

  // توليد متعدد الصور من البرومت - مع دعم جميع الأنماط الجديدة متتالياً
  // تعريف type صحيح للـ callback
  type ProgressCallback = (style: string, image: GeneratedImageResult) => void;
  
  const generateImageFromPrompt = useCallback(async (params: GeminiImageGenerationParams, onProgress?: ProgressCallback) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🎨 بدء توليد الصور من البرومت مع جميع الأنماط متتالياً...', params);
      
      // التحقق من وجود مفتاح API 
      const apiKey = params.apiKey?.trim();
      
      if (!apiKey) {
        throw new Error('⚠️ مفتاح Gemini API مطلوب! يرجى إدخال المفتاح في الحقل المخصص أولاً. النظام يعتمد حصرياً على المفتاح المدخل من قِبلك.');
      }
      
      console.log('🔑 استخدام مفتاح API الجديد:', apiKey.substring(0, 20) + '...');

      // دالة مساعدة لتوليد صورة واحدة
      const generateSingleImage = async (prompt: string, style: 'normal' | 'genius' | 'collage' | 'organic' | 'social' | 'splitLayout' | 'geometricMasking' | 'minimalistFrame' | 'gradientOverlay' | 'asymmetricalLayout' | 'duotoneDesign' | 'cutoutTypography' | 'overlayPattern' | 'technicalNetwork') => {
        const translatedPrompt = await translatePrompt(prompt, apiKey);
        const styleText = getStyleText(params.style || 'احترافي');
        
        let enhancedPrompt;
        switch (style) {
          case 'genius':
            enhancedPrompt = `${translatedPrompt}. Creative genius-style design with free artistic approach, innovative elements, vibrant colors, dynamic composition, artistic freedom, high quality, detailed, 4K resolution.`;
            break;
          case 'collage':
            enhancedPrompt = `${translatedPrompt}. Collage layout design with multiple image arrangement, creative composition, balanced element distribution, artistic frames and spacing, high quality, detailed composition.`;
            break;
          case 'organic':
            enhancedPrompt = `${translatedPrompt}. Organic shape masking with natural flowing curves, smooth organic boundaries, natural fluid shapes, artistic organic borders, high quality, detailed design.`;
            break;
          case 'social':
            enhancedPrompt = `${translatedPrompt}. Social media branding template optimized for Facebook, Instagram and Twitter, engaging visual elements, brand identity design, social sharing optimized, high quality, professional composition.`;
            break;
          case 'splitLayout':
            enhancedPrompt = `${translatedPrompt}. Split layout design with divided sections for image and text elements, vertical or horizontal division, balanced visual composition, clean organized design with clear separating lines, high quality, professional layout.`;
            break;
          case 'geometricMasking':
            enhancedPrompt = `${translatedPrompt}. Geometric masking with circles, squares, triangles and polygon shapes, modern contemporary visual effects, balanced geometric shape distribution in design, high quality, detailed geometric composition.`;
            break;
          case 'minimalistFrame':
            enhancedPrompt = `${translatedPrompt}. Minimalist frame design with clean borders and white space for text, simple elegant design alongside image for text content, smart use of white space, focus on simplicity and clarity, high quality, professional minimalist composition.`;
            break;
          case 'gradientOverlay':
            enhancedPrompt = `${translatedPrompt}. Gradient overlay design with semi-transparent color gradients over images, harmonious text integration with gradient, gradient colors matching image theme, smooth attractive visual effects, high quality, professional gradient composition.`;
            break;
          case 'asymmetricalLayout':
            enhancedPrompt = `${translatedPrompt}. Asymmetrical layout with intentionally unbalanced element distribution, creating dynamics and movement in design, modern visual contrast and balance, bold innovative attention-grabbing design, high quality, creative asymmetrical composition.`;
            break;
          case 'duotoneDesign':
            enhancedPrompt = `${translatedPrompt}. Duotone design with two-color image treatment and brand consistency, colors matching visual identity, modern attractive visual effects, focus on impactful color contrast, high quality, professional duotone composition.`;
            break;
          case 'cutoutTypography':
            enhancedPrompt = `${translatedPrompt}. Cutout typography with text as mask showing image inside letters, creative typography with image as text background, large clear letters filled with image, innovative eye-catching visual effects, high quality, creative typography composition.`;
            break;
          case 'overlayPattern':
            enhancedPrompt = `${translatedPrompt}. Overlay pattern design with transparent shapes and artistic elements over image, geometric or natural patterns adding artistic touch, transparent layers not obscuring main image, balance between pattern and original image, high quality, artistic pattern composition.`;
            break;
          case 'technicalNetwork':
            enhancedPrompt = `${translatedPrompt}. Technical network gradient background with digital grid lines, futuristic tech elements, circuit patterns, network connections, glowing nodes, cyberpunk aesthetic, modern technological design, high quality, detailed technical composition.`;
            break;
          default: // normal
            enhancedPrompt = `${translatedPrompt}. ${styleText}. High quality, detailed, professional composition.`;
        }

        console.log(`Enhanced ${style} prompt:`, enhancedPrompt);

        const directResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: enhancedPrompt
              }]
            }],
            generationConfig: {
              temperature: style === 'genius' ? 0.9 : (params.temperature || 0.7),
              topK: 40,
              topP: 0.95,
              maxOutputTokens: params.maxOutputTokens || 2048,
              responseModalities: ["TEXT", "IMAGE"]
            }
          }),
        });

        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          throw new Error(`خطأ من Gemini API: ${directResponse.status} - ${errorText}`);
        }

        const directData = await directResponse.json();
        const candidate = directData.candidates?.[0];
        
        if (candidate?.content?.parts) {
          let imageData = null;
          let textResponse = null;
          
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              imageData = part.inlineData.data;
            } else if (part.text) {
              textResponse = part.text;
            }
          }
          
          if (imageData) {
            const mimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
            const imageUrl = `data:${mimeType};base64,${imageData}`;
            
            return {
              imageUrl,
              imageData,
              description: textResponse,
              mimeType,
              style
            };
          } else {
            throw new Error('لم يتم إنشاء بيانات صورة من Gemini API');
          }
        } else {
          throw new Error('رد غير صحيح من Gemini API');
        }
      };

      // إنشاء مصفوفات الصور المختلفة
      const originalImages: GeneratedImageResult[] = [];
      const geniusImages: GeneratedImageResult[] = [];
      const collageImages: GeneratedImageResult[] = [];
      const organicImages: GeneratedImageResult[] = [];
      const socialImages: GeneratedImageResult[] = [];
      const splitLayoutImages: GeneratedImageResult[] = [];
      const geometricMaskingImages: GeneratedImageResult[] = [];
      const minimalistFrameImages: GeneratedImageResult[] = [];
      const gradientOverlayImages: GeneratedImageResult[] = [];
      const asymmetricalLayoutImages: GeneratedImageResult[] = [];
      const duotoneDesignImages: GeneratedImageResult[] = [];
      const cutoutTypographyImages: GeneratedImageResult[] = [];
      const overlayPatternImages: GeneratedImageResult[] = [];
      const technicalNetworkImages: GeneratedImageResult[] = [];

      // إنشاء النتيجة الأولية فارغة
      const resultImages: GeneratedImageWithEdit = {
        originalImages,
        geniusImages,
        collageImages,
        organicImages,
        socialImages,
        splitLayoutImages,
        geometricMaskingImages,
        minimalistFrameImages,
        gradientOverlayImages,
        asymmetricalLayoutImages,
        duotoneDesignImages,
        cutoutTypographyImages,
        overlayPatternImages,
        technicalNetworkImages,
        editedImages: []
      };

      setGeneratedImages(resultImages);

      // توليد الصورة العادية أولاً
      console.log('🎨 توليد الصورة بالنمط العادي...');
      toast.info('🎨 جاري توليد الصورة العادية...');
      
      try {
        const normalImage = await generateSingleImage(params.imagePrompt, 'normal');
        originalImages.push(normalImage);
        
        // تحديث النتائج فوراً وإرسال callback
        setGeneratedImages(prev => prev ? { ...prev, originalImages: [...originalImages] } : resultImages);
        onProgress?.('normal', normalImage);
        
        console.log('✅ تم إنشاء الصورة العادية بنجاح');
        toast.success('✅ تم إنشاء الصورة العادية بنجاح');
      } catch (error) {
        console.warn('⚠️ فشل في توليد الصورة العادية:', error);
        toast.error('⚠️ فشل في توليد الصورة العادية');
      }

      // توليد جميع الأنماط الجديدة متتالياً مع تحديث UI فوري
      const stylePrompts = [
        { prompt: params.geniusPrompt, style: 'genius' as const, array: geniusImages, name: 'جينيوس', nameEn: 'genius' },
        { prompt: params.collagePrompt, style: 'collage' as const, array: collageImages, name: 'كولاج', nameEn: 'collage' },
        { prompt: params.organicMaskPrompt, style: 'organic' as const, array: organicImages, name: 'قص عضوي', nameEn: 'organic' },
        { prompt: params.socialBrandingPrompt, style: 'social' as const, array: socialImages, name: 'علامة تجارية اجتماعية', nameEn: 'social' },
        { prompt: params.splitLayoutPrompt, style: 'splitLayout' as const, array: splitLayoutImages, name: 'تصميم مقسوم', nameEn: 'splitLayout' },
        { prompt: params.geometricMaskingPrompt, style: 'geometricMasking' as const, array: geometricMaskingImages, name: 'قص هندسي', nameEn: 'geometricMasking' },
        { prompt: params.minimalistFramePrompt, style: 'minimalistFrame' as const, array: minimalistFrameImages, name: 'إطار بسيط', nameEn: 'minimalistFrame' },
        { prompt: params.gradientOverlayPrompt, style: 'gradientOverlay' as const, array: gradientOverlayImages, name: 'طبقة تدرج لوني', nameEn: 'gradientOverlay' },
        { prompt: params.asymmetricalLayoutPrompt, style: 'asymmetricalLayout' as const, array: asymmetricalLayoutImages, name: 'تصميم غير متماثل', nameEn: 'asymmetricalLayout' },
        { prompt: params.duotoneDesignPrompt, style: 'duotoneDesign' as const, array: duotoneDesignImages, name: 'تصميم ثنائي اللون', nameEn: 'duotoneDesign' },
        { prompt: params.cutoutTypographyPrompt, style: 'cutoutTypography' as const, array: cutoutTypographyImages, name: 'قص النصوص', nameEn: 'cutoutTypography' },
        { prompt: params.overlayPatternPrompt, style: 'overlayPattern' as const, array: overlayPatternImages, name: 'طبقة النقوش', nameEn: 'overlayPattern' },
        { prompt: params.technicalNetworkPrompt, style: 'technicalNetwork' as const, array: technicalNetworkImages, name: 'شبكة تقنية متدرجة', nameEn: 'technicalNetwork' }
      ];

      for (const { prompt, style, array, name, nameEn } of stylePrompts) {
        if (prompt) {
          try {
            console.log(`🚀 توليد الصورة بنمط ${name}...`);
            toast.info(`🚀 جاري توليد صورة ${name}...`);
            
            const styleImage = await generateSingleImage(prompt, style);
            array.push(styleImage);
            
            // تحديث النتائج فوراً مع الصورة الجديدة
            setGeneratedImages(prev => {
              if (!prev) return resultImages;
              const updatedResult = { ...prev };
              updatedResult[`${nameEn}Images` as keyof GeneratedImageWithEdit] = [...array] as any;
              return updatedResult;
            });
            
            // إرسال callback للصورة الجديدة
            onProgress?.(style, styleImage);
            
            console.log(`✅ تم إنشاء صورة النمط ${name} بنجاح`);
            toast.success(`✅ تم إنشاء صورة ${name} بنجاح`);
            
          } catch (error) {
            console.warn(`⚠️ فشل في توليد صورة النمط ${name}:`, error);
            toast.error(`⚠️ فشل في توليد صورة ${name}`);
          }
        }
      }

      const totalImages = originalImages.length + geniusImages.length + collageImages.length + 
                         organicImages.length + socialImages.length + splitLayoutImages.length +
                         geometricMaskingImages.length + minimalistFrameImages.length + 
                         gradientOverlayImages.length + asymmetricalLayoutImages.length +
                         duotoneDesignImages.length + cutoutTypographyImages.length + overlayPatternImages.length + technicalNetworkImages.length;

      if (totalImages > 0) {
        setGeneratedImages({
          originalImages,
          geniusImages,
          collageImages,
          organicImages,
          socialImages,
          splitLayoutImages,
          geometricMaskingImages,
          minimalistFrameImages,
          gradientOverlayImages,
          asymmetricalLayoutImages,
          duotoneDesignImages,
          cutoutTypographyImages,
          overlayPatternImages,
          technicalNetworkImages,
          editedImages: []
        });
        
        toast.success(`تم إنشاء ${totalImages} صورة بجميع الأنماط بنجاح!`);
        return originalImages[0] || geniusImages[0]; // إرجاع أول صورة متوفرة
      } else {
        throw new Error('لم يتم إنشاء أي صور. يرجى تجربة وصف مختلف');
      }

    } catch (error) {
      console.error('❌ خطأ في توليد الصور:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في توليد الصور';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // دالة إعادة تعيين الصور
  const resetImages = useCallback(() => {
    if (generatedImages) {
      const allImageArrays = [
        generatedImages.originalImages,
        generatedImages.geniusImages,
        generatedImages.collageImages,
        generatedImages.organicImages,
        generatedImages.socialImages,
        generatedImages.splitLayoutImages,
        generatedImages.geometricMaskingImages,
        generatedImages.minimalistFrameImages,
        generatedImages.gradientOverlayImages,
        generatedImages.asymmetricalLayoutImages,
        generatedImages.duotoneDesignImages,
        generatedImages.cutoutTypographyImages,
        generatedImages.overlayPatternImages,
        generatedImages.technicalNetworkImages,
        generatedImages.editedImages
      ];

      allImageArrays.forEach(images => {
        images?.forEach(img => {
          if (img.imageUrl) {
            URL.revokeObjectURL(img.imageUrl);
          }
        });
      });
    }
    
    setGeneratedImages(null);
    setError(null);
  }, [generatedImages]);

  // دالة توليد صورة واحدة بنمط محدد
  const generateSingleStyleImage = useCallback(async (params: {
    imagePrompt: string;
    style: string;
    apiKey: string;
    styleType: 'collage' | 'organic' | 'social' | 'splitLayout' | 'geometricMasking' | 'minimalistFrame' | 'gradientOverlay' | 'asymmetricalLayout' | 'duotoneDesign' | 'cutoutTypography' | 'overlayPattern' | 'technicalNetwork';
  }) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const translatedPrompt = await translatePrompt(params.imagePrompt, params.apiKey);
      
      let enhancedPrompt;
      const styleType = params.styleType;
      
      switch (styleType) {
        case 'collage':
          enhancedPrompt = `${translatedPrompt}. Collage layout design with multiple image arrangement, creative composition, balanced element distribution, artistic frames and spacing, high quality, detailed composition.`;
          break;
        case 'organic':
          enhancedPrompt = `${translatedPrompt}. Organic shape masking with natural flowing curves, smooth organic boundaries, natural fluid shapes, artistic organic borders, high quality, detailed design.`;
          break;
        case 'social':
          enhancedPrompt = `${translatedPrompt}. Social media branding template optimized for Facebook, Instagram and Twitter, engaging visual elements, brand identity design, social sharing optimized, high quality, professional composition.`;
          break;
        case 'splitLayout':
          enhancedPrompt = `${translatedPrompt}. Split layout design with divided sections for image and text elements, vertical or horizontal division, balanced visual composition, clean organized design with clear separating lines, high quality, professional layout.`;
          break;
        case 'geometricMasking':
          enhancedPrompt = `${translatedPrompt}. Geometric masking with circles, squares, triangles and polygon shapes, modern contemporary visual effects, balanced geometric shape distribution in design, high quality, detailed geometric composition.`;
          break;
        case 'minimalistFrame':
          enhancedPrompt = `${translatedPrompt}. Minimalist frame design with clean borders and white space for text, simple elegant design alongside image for text content, smart use of white space, focus on simplicity and clarity, high quality, professional minimalist composition.`;
          break;
        case 'gradientOverlay':
          enhancedPrompt = `${translatedPrompt}. Gradient overlay design with semi-transparent color gradients over images, harmonious text integration with gradient, gradient colors matching image theme, smooth attractive visual effects, high quality, professional gradient composition.`;
          break;
        case 'asymmetricalLayout':
          enhancedPrompt = `${translatedPrompt}. Asymmetrical layout with intentionally unbalanced element distribution, creating dynamics and movement in design, modern visual contrast and balance, bold innovative attention-grabbing design, high quality, creative asymmetrical composition.`;
          break;
        case 'duotoneDesign':
          enhancedPrompt = `${translatedPrompt}. Duotone design with two-color image treatment and brand consistency, colors matching visual identity, modern attractive visual effects, focus on impactful color contrast, high quality, professional duotone composition.`;
          break;
        case 'cutoutTypography':
          enhancedPrompt = `${translatedPrompt}. Cutout typography with text as mask showing image inside letters, creative typography with image as text background, large clear letters filled with image, innovative eye-catching visual effects, high quality, creative typography composition.`;
          break;
        case 'overlayPattern':
          enhancedPrompt = `${translatedPrompt}. Overlay pattern design with transparent shapes and artistic elements over image, geometric or natural patterns adding artistic touch, transparent layers not obscuring main image, balance between pattern and original image, high quality, artistic pattern composition.`;
          break;
        case 'technicalNetwork':
          enhancedPrompt = `${translatedPrompt}. Technical network gradient background with digital grid lines, futuristic tech elements, circuit patterns, network connections, glowing nodes, cyberpunk aesthetic, modern technological design, high quality, detailed technical composition.`;
          break;
        default:
          enhancedPrompt = `${translatedPrompt}. High quality, detailed, professional composition.`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${params.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ من Gemini API: ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      
      if (candidate?.content?.parts) {
        let imageData = null;
        let textResponse = null;
        
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
          } else if (part.text) {
            textResponse = part.text;
          }
        }
        
        if (imageData) {
          const mimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${imageData}`;
          
          const result = {
            imageUrl,
            imageData,
            description: textResponse,
            mimeType,
            style: styleType
          };

          // إضافة للنتائج المناسبة
          if (generatedImages) {
            const updatedImages = { ...generatedImages };
            switch (styleType) {
              case 'collage':
                updatedImages.collageImages.push(result);
                break;
              case 'organic':
                updatedImages.organicImages.push(result);
                break;
              case 'social':
                updatedImages.socialImages.push(result);
                break;
              case 'splitLayout':
                updatedImages.splitLayoutImages.push(result);
                break;
              case 'geometricMasking':
                updatedImages.geometricMaskingImages.push(result);
                break;
              case 'minimalistFrame':
                updatedImages.minimalistFrameImages.push(result);
                break;
              case 'gradientOverlay':
                updatedImages.gradientOverlayImages.push(result);
                break;
              case 'asymmetricalLayout':
                updatedImages.asymmetricalLayoutImages.push(result);
                break;
              case 'duotoneDesign':
                updatedImages.duotoneDesignImages.push(result);
                break;
              case 'cutoutTypography':
                updatedImages.cutoutTypographyImages.push(result);
                break;
              case 'overlayPattern':
                updatedImages.overlayPatternImages.push(result);
                break;
              case 'technicalNetwork':
                updatedImages.technicalNetworkImages.push(result);
                break;
            }
            setGeneratedImages(updatedImages);
          }

          toast.success(`تم إنشاء صورة النمط ${styleType} بنجاح!`);
          return result;
        }
      }
      
      throw new Error('لم يتم إنشاء صورة');
      
    } catch (error) {
      console.error('❌ خطأ في توليد الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في توليد الصورة';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generatedImages]);

  // دالة تعديل الصورة
  const editGeneratedImage = useCallback(async (params: {
    imageData: string;
    mimeType: string;
    editPrompt: string;
    apiKey: string;
  }) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${params.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Edit this image: ${params.editPrompt}. Maintain the overall composition while applying the requested changes. High quality, detailed result.`
              },
              {
                inlineData: {
                  mimeType: params.mimeType,
                  data: params.imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ من Gemini API: ${response.status}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      
      if (candidate?.content?.parts) {
        let newImageData = null;
        let textResponse = null;
        
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            newImageData = part.inlineData.data;
          } else if (part.text) {
            textResponse = part.text;
          }
        }
        
        if (newImageData) {
          const newMimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
          const newImageUrl = `data:${newMimeType};base64,${newImageData}`;
          
          const editResult = {
            imageUrl: newImageUrl,
            imageData: newImageData,
            description: textResponse,
            mimeType: newMimeType,
            editPrompt: params.editPrompt
          };

          // إضافة للصور المعدلة
          if (generatedImages) {
            const updatedImages = {
              ...generatedImages,
              editedImages: [...generatedImages.editedImages, editResult]
            };
            setGeneratedImages(updatedImages);
          }

          toast.success('تم تعديل الصورة بنجاح!');
          return editResult;
        }
      }
      
      throw new Error('لم يتم إنشاء صورة معدلة');
      
    } catch (error) {
      console.error('❌ خطأ في تعديل الصورة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تعديل الصورة';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [generatedImages]);

  return {
    generateImageFromPrompt,
    generateSingleStyleImage,
    editGeneratedImage,
    resetImages,
    isGenerating,
    generatedImages,
    setGeneratedImages,
    error
  };
};