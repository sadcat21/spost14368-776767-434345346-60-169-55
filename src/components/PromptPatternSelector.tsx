import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { geminiApiManager } from "@/utils/geminiApiManager";
import { toast } from "sonner";
import { 
  Zap, 
  Wand2, 
  Sparkles, 
  Play, 
  Layers,
  Image as ImageIcon,
  Type,
  Palette,
  Layout,
  CheckCircle,
  Settings
} from "lucide-react";

export interface PromptPattern {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  example: string;
  features: string[];
  active: boolean;
}

interface PromptPatternSelectorProps {
  selectedPattern?: string;
  topic?: string;
  onPatternSelect: (patternId: string) => void;
  onTopicChange: (topic: string) => void;
  onGenerate: (pattern: string, topic: string) => void;
  isGenerating?: boolean;
}

const patterns: PromptPattern[] = [
  {
    id: "pattern1",
    name: "النمط الحالي - جينيوس",
    description: "النمط الحالي المستخدم في محرك جينيوس الإبداعي",
    icon: <Sparkles className="h-5 w-5" />,
    example: "توليد محتوى إبداعي متكامل مع تصميم حر ومتنوع",
    features: ["تصميم حر", "محتوى متنوع", "مرونة عالية", "إبداع مفتوح"],
    active: false
  },
  {
    id: "pattern2", 
    name: "النمط المتقدم - التقسيم الذكي",
    description: "تصميم 4:3 أفقي ذكي مع تقسيم عمودي متداخل بالذكاء الاصطناعي",
    icon: <Layout className="h-5 w-5" />,
    example: "توليد ذكي للبرومت: تدرج لوني مخصص + صورة سياقية احترافية",
    features: ["توليد ذكي بالAI", "تقسيم متداخل", "ألوان مخصصة", "صور سياقية"],
    active: true
  },
  {
    id: "pattern3",
    name: "النمط الاحترافي - القوالب الثابتة", 
    description: "قوالب تصميم احترافية ثابتة مع هوية بصرية موحدة",
    icon: <Type className="h-5 w-5" />,
    example: "قوالب احترافية ثابتة مع ألوان وخطوط موحدة",
    features: ["قوالب ثابتة", "هوية موحدة", "احترافية عالية", "اتساق بصري"],
    active: false
  }
];

export const PromptPatternSelector: React.FC<PromptPatternSelectorProps> = ({
  selectedPattern = "pattern1",
  topic = "",
  onPatternSelect,
  onTopicChange,
  onGenerate,
  isGenerating = false
}) => {
  const [localTopic, setLocalTopic] = useState(topic);
  const [isTopicValid, setIsTopicValid] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // دالة تحديد العناصر البصرية حسب التخصص
  const getTopicVisualElements = (topic: string): string => {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('طب') || topicLower.includes('صح') || topicLower.includes('medical') || topicLower.includes('health')) {
      return "medical equipment, stethoscope, anatomical diagrams, microscope imagery, health charts, medical technology, scientific instruments, laboratory elements";
    } else if (topicLower.includes('تقني') || topicLower.includes('حاسوب') || topicLower.includes('technology') || topicLower.includes('computer') || topicLower.includes('برمج')) {
      return "computer screens, data visualization, circuit boards, coding interfaces, network diagrams, servers, digital graphics, technology devices";
    } else if (topicLower.includes('طعام') || topicLower.includes('طبخ') || topicLower.includes('food') || topicLower.includes('cooking') || topicLower.includes('مطبخ')) {
      return "fresh ingredients, cooking utensils, colorful spices, artistic food arrangements, kitchen equipment, culinary presentations, food styling";
    } else if (topicLower.includes('تعليم') || topicLower.includes('دراس') || topicLower.includes('education') || topicLower.includes('learning') || topicLower.includes('مدرس')) {
      return "books, educational charts, classroom elements, learning materials, academic symbols, graduation caps, knowledge visualization";
    } else if (topicLower.includes('رياض') || topicLower.includes('sport') || topicLower.includes('fitness') || topicLower.includes('تمارين')) {
      return "sports equipment, athletic gear, fitness elements, gym equipment, sports balls, running tracks, training accessories";
    } else if (topicLower.includes('مال') || topicLower.includes('استثمار') || topicLower.includes('finance') || topicLower.includes('business') || topicLower.includes('تجار')) {
      return "financial charts, business graphs, money symbols, investment imagery, corporate elements, data analytics, economic indicators";
    } else if (topicLower.includes('فن') || topicLower.includes('تصميم') || topicLower.includes('art') || topicLower.includes('design') || topicLower.includes('إبداع')) {
      return "artistic tools, paint brushes, color palettes, creative elements, design materials, artistic compositions, creative workspace";
    } else if (topicLower.includes('سفر') || topicLower.includes('سياح') || topicLower.includes('travel') || topicLower.includes('tourism') || topicLower.includes('رحل')) {
      return "travel accessories, maps, luggage, passport elements, destination imagery, transportation, adventure gear";
    } else {
      return "modern abstract elements, geometric shapes, creative patterns, stylized icons, contemporary graphics, artistic interpretations";
    }
  };

  // دالة تحديد الألوان حسب التخصص
  const getTopicColors = (topic: string): string => {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('طب') || topicLower.includes('صح') || topicLower.includes('medical') || topicLower.includes('health')) {
      return "medical blue (#0077BE), clean white (#FFFFFF), sterile silver (#C0C0C0), health green (#00A651)";
    } else if (topicLower.includes('تقني') || topicLower.includes('حاسوب') || topicLower.includes('technology') || topicLower.includes('computer')) {
      return "tech blue (#0066CC), digital cyan (#00CCFF), modern gray (#6C757D), innovation purple (#6F42C1)";
    } else if (topicLower.includes('طعام') || topicLower.includes('طبخ') || topicLower.includes('food') || topicLower.includes('cooking')) {
      return "warm orange (#FF6B35), fresh green (#28A745), rich red (#DC3545), golden yellow (#FFC107)";
    } else if (topicLower.includes('تعليم') || topicLower.includes('دراس') || topicLower.includes('education') || topicLower.includes('learning')) {
      return "academic blue (#0056B3), knowledge purple (#663399), wisdom gold (#FFD700), scholarly green (#228B22)";
    } else if (topicLower.includes('رياض') || topicLower.includes('sport') || topicLower.includes('fitness')) {
      return "energy red (#E74C3C), active orange (#FF8C00), power blue (#3498DB), dynamic green (#2ECC71)";
    } else if (topicLower.includes('مال') || topicLower.includes('استثمار') || topicLower.includes('finance') || topicLower.includes('business')) {
      return "professional navy (#1E3A8A), success green (#10B981), premium gold (#F59E0B), trust blue (#3B82F6)";
    } else if (topicLower.includes('فن') || topicLower.includes('تصميم') || topicLower.includes('art') || topicLower.includes('design')) {
      return "creative purple (#8B5CF6), artistic pink (#EC4899), vibrant yellow (#F59E0B), expressive teal (#14B8A6)";
    } else if (topicLower.includes('سفر') || topicLower.includes('سياح') || topicLower.includes('travel') || topicLower.includes('tourism')) {
      return "adventure blue (#0EA5E9), sunset orange (#FB923C), nature green (#22C55E), sky cyan (#06B6D4)";
    } else {
      return "modern teal (#14B8A6), contemporary purple (#8B5CF6), elegant blue (#3B82F6), sophisticated gray (#6B7280)";
    }
  };

  // دالة توليد البرومت الذكي باستخدام Gemini API
  const generateSmartPrompt = async (topic: string): Promise<string> => {
    const visualElements = getTopicVisualElements(topic);
    const colorScheme = getTopicColors(topic);
    
    const promptTemplate = `Create a professional 4:3 horizontal social media post with a sophisticated blended layout and seamless visual flow.

Left Visual Region (Strategic Background Foundation):
– Apply a sophisticated gradient background using the following color scheme: ${colorScheme}
– Keep this side visually clean with no text, icons, or branding
– Use smooth gradient transitions that represent the essence and mood of "${topic}"
– CRITICAL: The left section's background must seamlessly flow into the right side as a visual foundation

Right Visual Region (${topic} Concept Illustration):
– The background gradient from the left side continues into the right section as a foundation
– Include specific visual elements: ${visualElements}
– Apply these elements in a creative, artistic, and professional manner
– Use realistic photography style with dramatic lighting and composition
– Integrate the visual elements naturally into the scene
– Show these elements in action or in their natural environment
– Apply subtle depth of field to create visual hierarchy
– Ensure all elements are clearly visible and professionally presented

Visual Continuity Requirements:
– The left gradient must flow seamlessly into the right section
– Maintain continuous color harmony throughout the composition
– Create smooth transitions that support the right-side visual elements
– Balance sophisticated background design with clear, impactful visual content

Specific Visual Details for "${topic}":
– Ensure all visual elements are relevant and recognizable for the topic
– Use high-quality, realistic representations
– Apply professional lighting that enhances the subject matter
– Include environmental context that supports the topic
– Show elements from multiple angles or perspectives when appropriate

Design Requirements:
– No text, no logos, no mockups, no UI elements
– Rounded corners for modern aesthetic
– Professional quality with artistic innovation
– 4:3 aspect ratio optimized for social media
– Balance between structured background and creative visual content
– Maintain visual clarity and impact

Color Harmony:
– Primary colors: ${colorScheme}
– Ensure gradient flows naturally from left to right
– Use color temperature that matches the topic's mood
– Apply consistent lighting throughout the composition`;

    try {
      // إضافة التشديد المطلوب للـ prompt مع التركيز على الأوصاف البصرية الدقيقة
      const enhancedPromptTemplate = `Write a prompt in a simple and understandable format for an AI image generation model (Imagen). Follow these critical guidelines:

• Use precise visual descriptions (like "3 people", "office", "bar chart", "tablet")
• Avoid analytical words (like "emotion", "aesthetic", "focus on essence")
• Start with a simple comprehensive description (like: "A modern office scene showing a marketing team...")
• Use clear command language (Avoid "should", use "show", "include", "use")
• Minimize complex conditions and make the model focus on what to generate, not how to think about it
• Keep the prompt concise but include all necessary visual details
• Always start with a general description of the image
• Describe the image as if you are seeing it in front of you
• Translate any specialized terminology or subject matter to English before generating the image

Based on these requirements, generate a visual prompt for the following concept (translate any Arabic terms to English):

${promptTemplate}`;

      const response = await geminiApiManager.makeRequest(
        geminiApiManager.getApiUrl(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: enhancedPromptTemplate }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('لم يتم تلقي رد من Gemini');
      }

      return text;
    } catch (error) {
      console.error('Error generating smart prompt:', error);
      toast.error("حدث خطأ في توليد البرومت الذكي");
      return "";
    }
  };

  const handleTopicChange = (value: string) => {
    setLocalTopic(value);
    setIsTopicValid(value.trim().length > 0);
    onTopicChange(value);
  };

  const handlePatternSelect = (patternId: string) => {
    onPatternSelect(patternId);
  };

  const handleGenerate = async () => {
    if (!isTopicValid) {
      return;
    }

    // إذا كان النمط المتقدم مختار، قم بتوليد البرومت الذكي أولاً
    if (selectedPattern === "pattern2" && localTopic.trim()) {
      setIsGeneratingPrompt(true);
      try {
        const smartPrompt = await generateSmartPrompt(localTopic);
        if (smartPrompt) {
          setGeneratedPrompt(smartPrompt);
          toast.success("تم توليد البرومت الذكي بنجاح!");
        }
      } catch (error) {
        console.error('Error generating prompt:', error);
      } finally {
        setIsGeneratingPrompt(false);
      }
    }

    onGenerate(selectedPattern, localTopic);
  };

  const getPatternDetails = (patternId: string) => {
    switch (patternId) {
      case "pattern2":
        return {
          prompt: generatedPrompt || `Create a 4:3 horizontal social media post using a blended layout with no hard split. The image and background sections must visually overlap softly for a seamless transition.

Left Visual Region (Background Focus):
– Apply a solid deep gradient background using emotionally resonant colors related to the concept of "${localTopic}".
– Keep this side visually clean with no text, icons, or branding.
– This side represents strategy, creativity, and vision through abstract color and mood.

Right Visual Region (${localTopic} Concept Illustration):
– Use a high-quality, professional image that visually communicates the essence of ${localTopic}.
– The subject should appear in a realistic environment, naturally lit.
– Apply a soft background blur to add depth.
– Overlay a transparent gradient that matches the color scheme of the left side.
– Integrate a smooth inward curve (arc or semi-circle) on the left edge to blend both sections.

General Design Rules:
– No text, no logos, no mockups.
– Rounded corners, minimalistic layout, soft lighting.
– Maintain a gentle visual blend between left and right.
– Composition and color palette should evoke the emotional foundation of "${localTopic}".`,
          colorScheme: "متدرج حسب الموضوع",
          imageType: "ذكي حسب السياق",
          layout: "تقسيم عمودي ذكي"
        };
      case "pattern3":
        return {
          prompt: `Professional template design for "${localTopic}" with consistent brand identity`,
          colorScheme: "ألوان ثابتة احترافية",
          imageType: "قوالب جاهزة",
          layout: "قالب ثابت"
        };
      default:
        return {
          prompt: `Current Genius engine pattern for "${localTopic}"`,
          colorScheme: "متنوع حسب الإبداع",
          imageType: "حر ومتنوع",
          layout: "مرن وإبداعي"
        };
    }
  };

  const selectedPatternData = patterns.find(p => p.id === selectedPattern);
  const patternDetails = getPatternDetails(selectedPattern);

  return (
    <div className="space-y-6">
      {/* رأس قسم اختيار النمط */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-primary">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            زر تفعيل الاختيار الذكي
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              جديد
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            اختر نمط توليد البرومت المناسب لاحتياجاتك من الأنماط المتاحة أدناه
          </p>

          {/* حقل إدخال الموضوع */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="topic" className="text-sm font-medium">
              اختيار موضوع عشوائي
            </Label>
            <div className="relative">
              <Input
                id="topic"
                placeholder="أدخل الموضوع الذي تريد إنشاء محتوى حوله..."
                value={localTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="pr-10"
              />
              {isTopicValid && (
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          <Separator />
        </CardContent>
      </Card>

      {/* اختيار نمط الصورة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <ImageIcon className="h-5 w-5" />
            اختيار نمط الصورة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  selectedPattern === pattern.id
                    ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => handlePatternSelect(pattern.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    selectedPattern === pattern.id 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {pattern.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{pattern.name}</h3>
                      {selectedPattern === pattern.id && (
                        <Badge className="bg-green-500 text-white">مختار</Badge>
                      )}
                      {pattern.active && (
                        <Badge variant="secondary">موصى به</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3">
                      {pattern.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pattern.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        <strong>مثال:</strong> {pattern.example}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل النمط المختار */}
      {selectedPatternData && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Settings className="h-5 w-5" />
              تفاصيل النمط المختار: {selectedPatternData.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">نظام الألوان</h4>
                  <p className="text-sm">{patternDetails.colorScheme}</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">نوع الصورة</h4>
                  <p className="text-sm">{patternDetails.imageType}</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">تخطيط التصميم</h4>
                  <p className="text-sm">{patternDetails.layout}</p>
                </div>
              </div>
              
              {selectedPattern === "pattern2" && localTopic && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    معاينة البرومت المتولد:
                    {generatedPrompt && (
                      <Badge className="bg-green-500 text-white text-xs">
                        ذكي
                      </Badge>
                    )}
                  </h4>
                  <Textarea
                    value={patternDetails.prompt}
                    readOnly
                    className="text-xs bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-700"
                    rows={8}
                  />
                  {!generatedPrompt && (
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                      💡 عند الضغط على "توليد المحتوى الذكي" سيتم توليد برومت مخصص ومتقدم باستخدام الذكاء الاصطناعي
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* زر التوليد */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <Button
            onClick={handleGenerate}
            disabled={!isTopicValid || isGenerating || isGeneratingPrompt}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            {(isGenerating || isGeneratingPrompt) ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                {isGeneratingPrompt ? "جاري توليد البرومت الذكي..." : "جاري التوليد..."}
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-3" />
                {selectedPattern === "pattern2" ? "توليد المحتوى الذكي" : "توليد المحتوى"}
              </>
            )}
          </Button>
          
          {!isTopicValid && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              يرجى إدخال موضوع صالح لبدء التوليد
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};