
import { useState } from "react";
import { geminiApiManager } from "../utils/geminiApiManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Image as ImageIcon, Brain, Sparkles, Download, Settings, Wand2, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { PromptEditor } from "./PromptEditor";

interface InfographicResult {
  title: string;
  imageUrl: string;
  source: string;
  analysis?: string;
  suggestedContent?: string;
}

interface InfographicAnalyzerProps {
  onUseTemplate: (content: string, imageUrl: string) => void;
}

export const InfographicAnalyzer = ({ onUseTemplate }: InfographicAnalyzerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<InfographicResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // Image generation states
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSource, setImageSource] = useState<"search" | "unsplash" | "imgn">("imgn");
  const [promptSource, setPromptSource] = useState<"auto" | "manual" | "edit" | "advanced">("auto");
  const [manualPrompt, setManualPrompt] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [a4fApiKey, setA4fApiKey] = useState("ddc-a4f-d18769825db54bb0a03e087f28dda67f");
  const [inputText, setInputText] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  
  // Advanced prompt generation states
  const [topic, setTopic] = useState("");
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isAnalyzingPrompt, setIsAnalyzingPrompt] = useState(false);
  const [variables, setVariables] = useState<any[]>([]);
  const [generatedAdvancedPrompt, setGeneratedAdvancedPrompt] = useState("");
  const [isGeneratingAdvancedPrompt, setIsGeneratingAdvancedPrompt] = useState(false);

  // Hardcoded Serper API key
  const SERPER_API_KEY = "02fe518aebb4a34ae0f208075fca9bab881ba360";

  const searchInfographics = async () => {
    if (!searchQuery.trim()) {
      toast.error("يرجى إدخال كلمة البحث");
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `${searchQuery} infographic انفوجرافيك`,
          num: 10,
          gl: 'ae',
          hl: 'ar'
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في البحث');
      }

      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        const infographics: InfographicResult[] = data.images.map((img: any) => ({
          title: img.title || 'إنفوجرافيك',
          imageUrl: img.imageUrl,
          source: img.source || 'غير محدد'
        }));
        
        setResults(infographics);
        toast.success(`تم العثور على ${infographics.length} نتيجة`);
      } else {
        toast.error("لم يتم العثور على نتائج");
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching infographics:", error);
      toast.error("حدث خطأ في البحث");
    } finally {
      setIsSearching(false);
    }
  };

  const getUnsplashTemplates = async () => {
    setIsLoadingTemplates(true);
    
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=infographic+template&per_page=12&orientation=portrait`,
        {
          headers: {
            "Authorization": "Client-ID GQpnQ_IPJLtfjkXuevz_tG2csrucFhKkeo0TkK3AZ5Q"
          }
        }
      );

      if (!response.ok) {
        throw new Error('فشل في جلب القوالب');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const templates: InfographicResult[] = data.results.map((img: any) => ({
          title: img.alt_description || 'قالب إنفوجرافيك',
          imageUrl: img.urls.regular,
          source: 'Unsplash'
        }));
        
        setResults(templates);
        toast.success(`تم جلب ${templates.length} قالب من Unsplash`);
      } else {
        toast.error("لم يتم العثور على قوالب");
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching Unsplash templates:", error);
      toast.error("حدث خطأ في جلب القوالب");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const analyzeInfographic = async (result: InfographicResult, index: number) => {
    setIsAnalyzing(result.imageUrl);
    
    try {
      // تحليل الصورة باستخدام Gemini Vision
      const analysisResponse = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: "حلل هذا الإنفوجرافيك واستخرج محتواه الرئيسي. اكتب ملخصاً عن الموضوع والمعلومات المهمة المعروضة. ثم اقترح محتوى جديداً مشابهاً يمكن استخدامه في منشور على وسائل التواصل الاجتماعي باللغة العربية."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: await getImageAsBase64(result.imageUrl)
                  }
                }
              ]
            }]
          })
        }
      );

      const analysisData = await analysisResponse.json();
      const analysis = analysisData.candidates[0].content.parts[0].text;

      // توليد محتوى مقترح بناءً على التحليل
      const contentResponse = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `بناءً على هذا التحليل للإنفوجرافيك: "${analysis}"
                
                أنشئ محتوى جديداً جذاباً للشبكات الاجتماعية باللغة العربية يحتوي على:
                - عنوان رئيسي قوي
                - نقاط مهمة من المعلومات
                - دعوة للتفاعل
                - هاشتاجات مناسبة
                - رموز تعبيرية
                
                يجب أن يكون المحتوى قابلاً للمشاركة ولا يتجاوز 250 كلمة.`
              }]
            }]
          })
        }
      );

      const contentData = await contentResponse.json();
      const suggestedContent = contentData.candidates[0].content.parts[0].text;

      // تحديث النتيجة بالتحليل والمحتوى المقترح
      const updatedResults = [...results];
      updatedResults[index] = {
        ...result,
        analysis,
        suggestedContent
      };
      setResults(updatedResults);

      toast.success("تم تحليل الإنفوجرافيك بنجاح!");
    } catch (error) {
      console.error("Error analyzing infographic:", error);
      toast.error("حدث خطأ في تحليل الإنفوجرافيك");
    } finally {
      setIsAnalyzing(null);
    }
  };

  const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // إزالة البادئة data:image/...;base64,
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  };

  const generatePromptFromText = async (text: string): Promise<string> => {
    try {
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `حلل هذا النص واستخرج الأفكار الرئيسية لإنشاء برومت لتوليد صورة إنفوجرافيك مناسب:

النص: "${text}"

أنشئ برومت للذكاء الاصطناعي لتوليد إنفوجرافيك باللغة الإنجليزية يحتوي على:
- التصميم والألوان المناسبة
- العناصر البصرية
- الرسوم البيانية إذا كانت مناسبة
- النمط العربي أو الشرق أوسطي إذا كان مناسباً

اكتب برومت واضح ومحدد لا يتجاوز 200 كلمة باللغة الإنجليزية فقط.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating prompt:", error);
      throw error;
    }
  };

  // وظائف توليد البرومت المتقدم
  const generateTopicPrompt = async () => {
    if (!topic.trim()) {
      toast.error("يرجى إدخال الموضوع");
      return;
    }

    setIsGeneratingTopic(true);

    try {
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `أنشئ برومت تصميم احترافي لموضوع: "${topic}"

المطلوب إنشاء برومت مفصل لتوليد صورة تصميم احترافي يناسب هذا الموضوع مع التأكيد على:

القيود الصارمة والإجبارية:
- عدم استخدام الشعارات نهائياً
- عدم وجود أي نصوص في الصورة
- تجنب العلامات التجارية بشكل كامل  
- بدون تصميم موكأب أو محاكيات

المتطلبات التصميمية:
- تصميم احترافي عالي الجودة
- ألوان متناسقة وجذابة
- إضاءة طبيعية ومتوازنة
- تكوين بصري متوازن
- مساحة فارغة مناسبة لإضافة النص لاحقاً
- فواصل وتدرجات لونية ناعمة
- عمق بصري وأبعاد ثلاثية

اكتب البرومت بالعربية مع التفاصيل الدقيقة للتصميم المطلوب.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const generatedTopicPrompt = data.candidates[0].content.parts[0].text;
      
      // تحليل البرومت المولد تلقائياً
      await analyzeGeneratedPrompt(generatedTopicPrompt);
      
      toast.success("تم توليد برومت التصميم وتحليله بنجاح!");
    } catch (error) {
      console.error("Error generating topic prompt:", error);
      toast.error("حدث خطأ في توليد برومت التصميم");
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const analyzeGeneratedPrompt = async (promptText: string) => {
    setIsAnalyzingPrompt(true);

    try {
      // استخدام نظام تحليل متقدم للبرومت
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `حلل هذا البرومت للذكاء الاصطناعي واستخرج جميع المتغيرات القابلة للتخصيص:

البرومت: "${promptText}"

قم بتحليل البرومت وتحديد المتغيرات التالية:
1. نوع الصورة (مثال: portrait, landscape, infographic)
2. الألوان الرئيسية
3. النمط الفني (مثال: realistic, cartoon, abstract)
4. العناصر البصرية
5. جودة الصورة
6. الخلفية
7. الإضاءة
8. أي متغيرات أخرى يمكن تخصيصها

لكل متغير، قدم:
- اسم المتغير بالإنجليزية
- اسم المتغير بالعربية
- القيمة الحالية من البرومت
- 5-7 خيارات بديلة بالعربية

قدم النتيجة بصيغة JSON:
{
  "variables": [
    {
      "name": "image_type",
      "arabicName": "نوع الصورة",
      "value": "القيمة الحالية",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4", "خيار 5", "مخصص"],
      "type": "select"
    }
  ]
}`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      
      // استخراج JSON من النص
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        
        // إضافة المتغيرات الثابتة للمساحات الفارغة والفواصل
        const defaultSpaceVariables = [
          {
            name: "empty_space_layout",
            arabicName: "تخطيط المساحة الفارغة",
            value: "مساحة فارغة على اليمين للنص العربي",
            options: [
              "مساحة فارغة على اليمين للنص العربي",
              "مساحة فارغة على اليسار للنص الإنجليزي", 
              "مساحة فارغة في الأعلى",
              "مساحة فارغة في الأسفل",
              "مساحة فارغة في المنتصف",
              "بدون مساحة فارغة",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "separator_style",
            arabicName: "نمط الفاصل",
            value: "موجات منحنية ناعمة",
            options: [
              "موجات منحنية ناعمة",
              "موجات حادة متعرجة",
              "منحنيات عضوية طبيعية",
              "خطوط مستقيمة قطرية",
              "أشكال سائلة متدفقة",
              "دوائر وأشكال هندسية",
              "تدرج لوني بدون حدود",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "background_division",
            arabicName: "تقسيم الخلفية",
            value: "قسمين بفاصل منحني",
            options: [
              "قسمين بفاصل منحني",
              "ثلاثة أقسام متدرجة",
              "تدرج قطري",
              "شكل دائري مركزي",
              "أشكال عضوية متداخلة",
              "طبقات شفافة متراكبة",
              "خلفية موحدة",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "visual_elements",
            arabicName: "العناصر البصرية",
            value: [
              "بدون شعارات أو نصوص أو علامات تجارية",
              "تجنب تصميم الموكأب",
              "إضاءة طبيعية ناعمة",
              "أشكال هندسية منحنية"
            ],
            options: [
              "شخص يقف في الخلفية",
              "يرتدي ملابس رسمية",
              "بدون شعارات أو نصوص أو علامات تجارية",
              "تجنب تصميم الموكأب",
              "طبقة شفافة خضراء ناعمة",
              "أشكال هندسية منحنية",
              "إضاءة طبيعية ناعمة",
              "ظلال واقعية",
              "عمق بصري متدرج",
              "تباين لوني متوازن"
            ],
            type: 'multiselect'
          },
          {
            name: "visual_effects",
            arabicName: "التأثيرات البصرية",
            value: [
              "ضبابية خلفية ناعمة",
              "تدرجات لونية ثلاثية الأبعاد",
              "ظلال منحنية ناعمة"
            ],
            options: [
              "ضبابية خلفية ناعمة",
              "توهج داخلي للعناصر",
              "انعكاسات ضوئية دقيقة",
              "تدرجات لونية ثلاثية الأبعاد",
              "ظلال منحنية ناعمة",
              "شفافية متدرجة للطبقات",
              "تأثيرات جسيمات دقيقة",
              "انتقالات لونية سائلة",
              "عمق بصري متعدد المستويات",
              "إضاءة سينمائية محترفة"
            ],
            type: 'multiselect'
          }
        ];
        
        // دمج المتغيرات المحللة مع المتغيرات الثابتة
        const allVariables = [...(analysisResult.variables || []), ...defaultSpaceVariables];
        setVariables(allVariables);
        toast.success("تم تحليل البرومت بنجاح!");
      } else {
        // في حالة فشل التحليل، استخدم متغيرات أساسية
        const basicVariables = [
          {
            name: "image_style",
            arabicName: "نمط الصورة",
            value: "واقعي احترافي",
            options: ["واقعي احترافي", "فني مجرد", "رسومي كرتوني", "مصغر", "ثلاثي الأبعاد", "مخصص"],
            type: 'select'
          },
          {
            name: "color_scheme",
            arabicName: "نظام الألوان",
            value: "ألوان دافئة",
            options: ["ألوان دافئة", "ألوان باردة", "أحادي اللون", "متباين", "ألوان طبيعية", "مخصص"],
            type: 'select'
          },
          {
            name: "layout_style",
            arabicName: "نمط التخطيط",
            value: "قسمين بفاصل منحني",
            options: ["قسمين بفاصل منحني", "ثلاثة أقسام متدرجة", "تدرج قطري", "شكل دائري مركزي", "مخصص"],
            type: 'select'
          }
        ];
        setVariables(basicVariables);
        toast.success("تم تحليل البرومت بنجاح!");
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      toast.error("حدث خطأ في تحليل البرومت");
    } finally {
      setIsAnalyzingPrompt(false);
    }
  };

  const generateAdvancedPrompt = async () => {
    if (variables.length === 0) {
      toast.error("يرجى توليد وتحليل البرومت أولاً");
      return;
    }

    setIsGeneratingAdvancedPrompt(true);

    try {
      const variablesText = variables.map(v => {
        const value = Array.isArray(v.value) ? v.value.join(', ') : v.value;
        return `${v.arabicName}: ${value}`;
      }).join('\n');
      
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `بناءً على موضوع "${topic}" وهذه المتغيرات المحددة، أنشئ برومت محترف بالإنجليزية لتوليد الصور:

المتغيرات:
${variablesText}

أنشئ برومت جديد باللغة الإنجليزية يدمج جميع المتغيرات المحددة ويكون:
- واضح ومحدد جداً في وصف التأثيرات البصرية
- مُحسَّن لتوليد صور عالية الجودة
- يتضمن القيود الصارمة: NO LOGOS, NO TEXT, NO BRANDING, NO MOCKUPS
- لا يتجاوز 300 كلمة

اكتب البرومت الإنجليزي فقط بدون أي شرح إضافي.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const prompt = data.candidates[0].content.parts[0].text;
      setGeneratedAdvancedPrompt(prompt);
      setImagePrompt(prompt);
      toast.success("تم توليد البرومت المتقدم بنجاح!");
    } catch (error) {
      console.error("Error generating advanced prompt:", error);
      toast.error("حدث خطأ في توليد البرومت المتقدم");
    } finally {
      setIsGeneratingAdvancedPrompt(false);
    }
  };

  const generateImageWithImgn = async () => {
    if (promptSource === "auto" && !inputText.trim()) {
      toast.error("يرجى إدخال النص لتوليد البرومت تلقائياً");
      return;
    }
    
    if (promptSource === "manual" && !manualPrompt.trim()) {
      toast.error("يرجى إدخال البرومت يدوياً");
      return;
    }

    if (promptSource === "edit" && !editPrompt.trim()) {
      toast.error("يرجى توليد البرومت من محرر البرومت أولاً");
      return;
    }

    if (promptSource === "advanced" && !generatedAdvancedPrompt.trim()) {
      toast.error("يرجى توليد البرومت المتقدم أولاً");
      return;
    }

    setIsGeneratingImage(true);

    try {
      let finalPrompt = "";
      
      if (promptSource === "auto") {
        toast.success("جاري توليد البرومت من النص...");
        const generatedPrompt = await generatePromptFromText(inputText);
        finalPrompt = `Beautiful, high-quality, realistic image without any text, graphics, charts, or written elements. Only visual content that represents: ${generatedPrompt}`;
        setImagePrompt(finalPrompt);
      } else if (promptSource === "manual") {
        finalPrompt = `Beautiful, high-quality, realistic image without any text, graphics, charts, or written elements. Only visual content that represents: ${manualPrompt}`;
      } else if (promptSource === "edit") {
        finalPrompt = editPrompt;
      } else if (promptSource === "advanced") {
        finalPrompt = generatedAdvancedPrompt;
      }

      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${a4fApiKey}`
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: finalPrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        setShowApiKeyDialog(true);
        toast.error("انتهت صلاحية مفتاح API. يرجى إدخال مفتاح جديد.");
        return;
      }

      if (result && result.data && result.data.length > 0 && result.data[0].url) {
        const generatedImage: InfographicResult = {
          title: "صورة مولدة بواسطة imgn",
          imageUrl: result.data[0].url,
          source: "ImgN AI",
          suggestedContent: inputText || editPrompt || "محتوى مولد بواسطة الذكاء الاصطناعي"
        };

        setResults([generatedImage, ...results]);
        toast.success("تم توليد الصورة بنجاح!");
      } else {
        toast.error("فشل في توليد الصورة. يرجى المحاولة مرة أخرى.");
        console.error('API response:', result);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("حدث خطأ في توليد الصورة");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateImageWithCustomPrompt = async (customPrompt: string) => {
    setIsGeneratingImage(true);

    try {
      const response = await fetch('https://api.a4f.co/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${a4fApiKey}`
        },
        body: JSON.stringify({
          model: 'provider-4/imagen-3',
          prompt: customPrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        setShowApiKeyDialog(true);
        toast.error("انتهت صلاحية مفتاح API. يرجى إدخال مفتاح جديد.");
        return;
      }

      if (result && result.data && result.data.length > 0 && result.data[0].url) {
        const generatedImage: InfographicResult = {
          title: "صورة مولدة بواسطة محرر البرومت",
          imageUrl: result.data[0].url,
          source: "ImgN AI - Prompt Editor",
          suggestedContent: "محتوى مولد بواسطة محرر البرومت المتقدم"
        };

        setResults(prevResults => {
          const newResults = [generatedImage, ...prevResults];
          // اختيار الصورة المولدة تلقائياً للمعاينة
          setTimeout(() => {
            analyzeInfographic(generatedImage, 0);
          }, 1000);
          return newResults;
        });
        toast.success("تم توليد الصورة بنجاح من محرر البرومت!");
      } else {
        toast.error("فشل في توليد الصورة. يرجى المحاولة مرة أخرى.");
        console.error('API response:', result);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("حدث خطأ في توليد الصورة");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSourceChange = (value: "search" | "unsplash" | "imgn") => {
    setImageSource(value);
    if (value !== "imgn") {
      setResults([]);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Search className="h-5 w-5" />
          محلل الإنفوجرافيك الذكي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* خيارات مصدر الصور */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">اختر مصدر الصور:</Label>
          <RadioGroup
            value={imageSource}
            onValueChange={handleSourceChange}
            className="grid grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/20">
              <RadioGroupItem value="search" id="search" />
              <Label htmlFor="search" className="flex items-center gap-2 cursor-pointer">
                <Search className="h-4 w-4" />
                بحث Google
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/20">
              <RadioGroupItem value="unsplash" id="unsplash" />
              <Label htmlFor="unsplash" className="flex items-center gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                Unsplash
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/20">
              <RadioGroupItem value="imgn" id="imgn" />
              <Label htmlFor="imgn" className="flex items-center gap-2 cursor-pointer">
                <Wand2 className="h-4 w-4" />
                ImgN AI
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* أدوات البحث والقوالب */}
        {imageSource === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ابحث عن إنفوجرافيك (مثل: صحة، تعليم، تكنولوجيا)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchInfographics()}
                className="flex-1"
              />
              <Button 
                onClick={searchInfographics}
                disabled={isSearching}
                className="bg-gradient-primary"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    بحث...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    بحث
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {imageSource === "unsplash" && (
          <div className="flex justify-center">
            <Button 
              onClick={getUnsplashTemplates}
              disabled={isLoadingTemplates}
              variant="outline"
              className="bg-accent hover:bg-accent/90"
            >
              {isLoadingTemplates ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  جلب قوالب من Unsplash
                </>
              )}
            </Button>
          </div>
        )}

        {/* خيارات توليد الصور بـ ImgN */}
        {imageSource === "imgn" && (
          <div className="space-y-4 border rounded-lg p-4 bg-accent/10">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                توليد صورة بالذكاء الاصطناعي
              </Label>
              <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    إعداد API
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إعداد مفتاح A4F API</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="apiKey">مفتاح API:</Label>
                      <Input
                        id="apiKey"
                        value={a4fApiKey}
                        onChange={(e) => setA4fApiKey(e.target.value)}
                        placeholder="أدخل مفتاح A4F API"
                      />
                    </div>
                    <Button 
                      onClick={() => setShowApiKeyDialog(false)}
                      className="w-full"
                    >
                      حفظ
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <RadioGroup
              value={promptSource}
              onValueChange={(value: "auto" | "manual" | "edit" | "advanced") => setPromptSource(value)}
              className="grid grid-cols-4 gap-2"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="text-sm">توليد تلقائي</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="text-sm">إدخال يدوي</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="edit" id="edit" />
                <Label htmlFor="edit" className="text-sm">محرر البرومت</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="text-sm">توليد متقدم</Label>
              </div>
            </RadioGroup>

            {promptSource === "auto" ? (
              <div className="space-y-2">
                <Label htmlFor="inputText">النص لتحليله:</Label>
                <Textarea
                  id="inputText"
                  placeholder="أدخل النص الذي تريد تحويله إلى إنفوجرافيك..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                />
                {imagePrompt && (
                  <div className="mt-2">
                    <Label className="text-sm text-muted-foreground">البرومت المولد:</Label>
                    <Textarea
                      value={imagePrompt}
                      readOnly
                      rows={3}
                      className="text-sm bg-muted"
                    />
                  </div>
                )}
              </div>
            ) : promptSource === "manual" ? (
              <div className="space-y-2">
                <Label htmlFor="manualPrompt">البرومت اليدوي (بالإنجليزية):</Label>
                <Textarea
                  id="manualPrompt"
                  placeholder="Enter your custom prompt in English..."
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  rows={4}
                />
              </div>
            ) : promptSource === "advanced" ? (
              <div className="space-y-6">
                <Card className="shadow-lg border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Brain className="h-5 w-5" />
                      نظام التوليد المتقدم للبرومت
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    
                    {/* إدخال الموضوع */}
                    <div className="space-y-3">
                      <Label htmlFor="topic" className="text-base font-semibold">موضوع التصميم:</Label>
                      <Input
                        id="topic"
                        placeholder="أدخل موضوع التصميم (مثل: أسرار التجارة الإلكترونية، التطوير الشخصي، التكنولوجيا)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="text-lg p-4"
                      />
                      
                      <Button
                        onClick={generateTopicPrompt}
                        disabled={isGeneratingTopic || !topic.trim()}
                        className="w-full bg-gradient-primary hover:opacity-90 text-lg py-3"
                        size="lg"
                      >
                        {isGeneratingTopic ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            جاري توليد برومت التصميم...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-5 w-5" />
                            توليد برومت التصميم بواسطة Gemini
                          </>
                        )}
                      </Button>
                    </div>

                    {/* متغيرات البرومت */}
                    {variables.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-semibold text-primary">متغيرات البرومت القابلة للتخصيص:</Label>
                          <Button
                            onClick={() => {
                              // اختيار عشوائي للمتغيرات
                              const updatedVariables = variables.map(variable => {
                                if (variable.type === 'multiselect') {
                                  const randomCount = Math.floor(Math.random() * 3) + 2; // 2-4 خيارات
                                  const shuffled = [...variable.options].sort(() => 0.5 - Math.random());
                                  return { ...variable, value: shuffled.slice(0, randomCount) };
                                } else {
                                  const randomOption = variable.options[Math.floor(Math.random() * variable.options.length)];
                                  return { ...variable, value: randomOption };
                                }
                              });
                              setVariables(updatedVariables);
                              toast.success("تم تطبيق اختيارات عشوائية!");
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Shuffle className="h-4 w-4" />
                            اختيار عشوائي
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                          {variables.map((variable, index) => (
                            <Card key={index} className="p-4 border-accent/30">
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-primary">
                                  {variable.arabicName}
                                </Label>
                                
                                {variable.type === 'select' ? (
                                  <Select
                                    value={variable.value as string}
                                    onValueChange={(value) => {
                                      const updatedVariables = [...variables];
                                      updatedVariables[index].value = value;
                                      setVariables(updatedVariables);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {variable.options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : variable.type === 'multiselect' ? (
                                  <div className="grid grid-cols-2 gap-2">
                                    {variable.options.map((option) => (
                                      <div key={option} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${index}-${option}`}
                                          checked={Array.isArray(variable.value) && variable.value.includes(option)}
                                          onCheckedChange={(checked) => {
                                            const currentValues = Array.isArray(variable.value) ? variable.value : [];
                                            const updatedVariables = [...variables];
                                            
                                            if (checked) {
                                              updatedVariables[index].value = [...currentValues, option];
                                            } else {
                                              updatedVariables[index].value = currentValues.filter(val => val !== option);
                                            }
                                            setVariables(updatedVariables);
                                          }}
                                        />
                                        <Label htmlFor={`${index}-${option}`} className="text-sm">
                                          {option}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <Input
                                    value={variable.value as string}
                                    onChange={(e) => {
                                      const updatedVariables = [...variables];
                                      updatedVariables[index].value = e.target.value;
                                      setVariables(updatedVariables);
                                    }}
                                    placeholder="أدخل قيمة مخصصة"
                                  />
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* أزرار التوليد */}
                        <div className="flex gap-3">
                          <Button
                            onClick={generateAdvancedPrompt}
                            disabled={isGeneratingAdvancedPrompt}
                            className="flex-1 bg-gradient-primary hover:opacity-90"
                            size="lg"
                          >
                            {isGeneratingAdvancedPrompt ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                جاري توليد البرومت...
                              </>
                            ) : (
                              <>
                                <Wand2 className="mr-2 h-5 w-5" />
                                توليد البرومت بالإنجليزية
                              </>
                            )}
                          </Button>
                          
                          {generatedAdvancedPrompt && (
                            <Button
                              onClick={() => {
                                setEditPrompt(generatedAdvancedPrompt);
                                setImagePrompt(generatedAdvancedPrompt);
                                generateImageWithImgn();
                              }}
                              disabled={isGeneratingImage}
                              className="flex-1 bg-accent hover:bg-accent/80"
                              size="lg"
                            >
                              {isGeneratingImage ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  جاري توليد الصورة...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="mr-2 h-5 w-5" />
                                  توليد الصورة
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* عرض البرومت المولد */}
                        {generatedAdvancedPrompt && (
                          <Card className="mt-4 p-4 bg-accent/10 border-accent/30">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-primary">البرومت المتقدم المولد:</Label>
                              <Textarea
                                value={generatedAdvancedPrompt}
                                onChange={(e) => {
                                  setGeneratedAdvancedPrompt(e.target.value);
                                  setImagePrompt(e.target.value);
                                }}
                                rows={4}
                                className="text-sm font-mono"
                                placeholder="سيظهر البرومت المولد هنا..."
                              />
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatedAdvancedPrompt);
                                    toast.success("تم نسخ البرومت!");
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  نسخ البرومت
                                </Button>
                                <Button
                                  onClick={() => {
                                    // onGeneratePrompt(generatedAdvancedPrompt);
                                    navigator.clipboard.writeText(generatedAdvancedPrompt);
                                    toast.success("تم نسخ البرومت!");
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  تصدير البرومت
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <PromptEditor
                onGeneratePrompt={(prompt) => {
                  setEditPrompt(prompt);
                  setImagePrompt(prompt);
                }}
                onGenerateImage={(prompt) => {
                  setEditPrompt(prompt);
                  setImagePrompt(prompt);
                  generateImageWithCustomPrompt(prompt);
                }}
              />
            )}

            {promptSource !== "edit" && (
              <Button 
                onClick={generateImageWithImgn}
                disabled={isGeneratingImage}
                className="w-full bg-gradient-primary"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    توليد الصورة
                  </>
                )}
              </Button>
            )}
            
            {/* عرض البرومت المولد للمراجعة */}
            {imagePrompt && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                <Label className="text-sm font-medium text-muted-foreground">البرومت المولد:</Label>
                <p className="text-sm mt-1 text-foreground break-words">{imagePrompt}</p>
              </div>
            )}
          </div>
        )}

        {/* نتائج البحث */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">نتائج الإنفوجرافيك</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <Card key={index} className="border border-muted">
                  <CardContent className="p-4 space-y-3">
                    <div className="relative">
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-full h-32 object-cover rounded-lg"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          size="sm"
                          onClick={() => analyzeInfographic(result, index)}
                          disabled={isAnalyzing === result.imageUrl}
                          className="bg-white/20 backdrop-blur-sm"
                        >
                          {isAnalyzing === result.imageUrl ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              جاري التحليل...
                            </>
                          ) : (
                            <>
                              <Brain className="mr-2 h-4 w-4" />
                              تحليل
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
                      <p className="text-xs text-muted-foreground">{result.source}</p>
                    </div>

                    {result.analysis && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">التحليل:</Label>
                        <Textarea
                          value={result.analysis}
                          readOnly
                          rows={3}
                          className="text-xs resize-none"
                        />
                      </div>
                    )}

                     {result.suggestedContent && (
                       <div className="space-y-2">
                         <Label className="text-xs font-medium">المحتوى المقترح:</Label>
                         <Textarea
                           value={result.suggestedContent}
                           readOnly
                           rows={4}
                           className="text-xs resize-none"
                         />
                         <div className="flex gap-2">
                           <Button
                             size="sm"
                             onClick={() => onUseTemplate(result.suggestedContent, result.imageUrl)}
                             className="flex-1 bg-accent hover:bg-accent/90"
                           >
                             <Sparkles className="mr-2 h-4 w-4" />
                             استخدام المحتوى والصورة
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               const link = document.createElement('a');
                               link.href = result.imageUrl;
                               link.download = `generated-image-${Date.now()}.jpg`;
                               link.target = '_blank';
                               document.body.appendChild(link);
                               link.click();
                               document.body.removeChild(link);
                               toast.success("تم بدء تحميل الصورة");
                             }}
                           >
                             <Download className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     )}
                     
                     {/* إضافة زر لاستخدام الصورة حتى بدون محتوى مقترح */}
                     {!result.suggestedContent && (
                       <div className="flex gap-2">
                         <Button
                           size="sm"
                           onClick={() => onUseTemplate(inputText || "محتوى مولد بواسطة الذكاء الاصطناعي", result.imageUrl)}
                           className="flex-1 bg-accent hover:bg-accent/90"
                         >
                           <ImageIcon className="mr-2 h-4 w-4" />
                           استخدام الصورة
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => {
                             const link = document.createElement('a');
                             link.href = result.imageUrl;
                             link.download = `generated-image-${Date.now()}.jpg`;
                             link.target = '_blank';
                             document.body.appendChild(link);
                             link.click();
                             document.body.removeChild(link);
                             toast.success("تم بدء تحميل الصورة");
                           }}
                         >
                           <Download className="h-4 w-4" />
                         </Button>
                       </div>
                     )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
