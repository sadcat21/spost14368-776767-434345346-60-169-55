import { useState } from "react";
import { geminiApiManager } from "../utils/geminiApiManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Brain, Wand2, Image, Shuffle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OptionGroup {
  label: string;
  options: string[];
}

interface PromptVariable {
  name: string;
  arabicName: string;
  value: string | string[];
  options: string[] | OptionGroup[];
  type: 'select' | 'custom' | 'multiselect' | 'grouped-select';
}

interface AutoPromptGeneratorProps {
  onGeneratePrompt: (prompt: string) => void;
  onGenerateImage: (prompt: string) => void;
}

export const AutoPromptGenerator = ({ onGeneratePrompt, onGenerateImage }: AutoPromptGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [variablesModified, setVariablesModified] = useState(false);
  const [autoGenerateImages, setAutoGenerateImages] = useState(false); // إيقاف التوليد التلقائي للصور

  // قيود التصميم الافتراضية والصارمة
  const STRICT_DESIGN_CONSTRAINTS = [
    "عدم استخدام الشعارات",
    "عدم وجود نصوص في الصورة", 
    "تجنب العلامات التجارية",
    "بدون تصميم موكأب"
  ];

  const generateTopicPrompt = async () => {
    if (!topic.trim()) {
      toast.error("يرجى إدخال الموضوع");
      return;
    }

    setIsGeneratingTopic(true);

    try {
      const response = await fetch(
        geminiApiManager.getApiUrl(),
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
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        geminiApiManager.getApiUrl(),
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
        
        // إضافة المتغيرات الثابتة مع القيود الصارمة
        const defaultVariables: PromptVariable[] = [
          {
            name: "image_type",
            arabicName: "نوع الصورة",
            value: "منظر طبيعي",
            options: [
              {
                label: "خيارات متصلة بمعلومات السياق",
                options: [
                  "إنفوجرافيك",
                  "صورة شخصية",
                  "لقطة مقربة",
                  "صورة داخلية"
                ]
              },
              {
                label: "خيارات عامة",
                options: [
                  "منظر طبيعي",
                  "منظر جوي",
                  "صورة خارجية",
                  "مخصص"
                ]
              }
            ],
            type: 'grouped-select'
          },
          {
            name: "main_colors",
            arabicName: "الألوان الرئيسية",
            value: "ألوان الباستيل",
            options: [
              "ألوان الباستيل",
              "ألوان زاهية",
              "ألوان ترابية",
              "ألوان محايدة",
              "ألوان دافئة",
              "ألوان باردة",
              "أحادي اللون",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "artistic_style",
            arabicName: "النمط الفني",
            value: "تجريدي",
            options: [
              "تجريدي",
              "واقعي",
              "كرتوني",
              "مينيمالي",
              "فنتازيا",
              "كلاسيكي",
              "عصري",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "visual_elements",
            arabicName: "العناصر البصرية",
            value: "أشياء من صنع الإنسان (مباني، سيارات، أثاث)",
            options: [
              "أشياء من صنع الإنسان (مباني، سيارات، أثاث)",
              "عناصر طبيعية (أشجار، جبال، بحار)",
              "حيوانات ونباتات",
              "أشخاص وشخصيات",
              "أشكال هندسية",
              "تأثيرات بصرية",
              "خطوط وأنماط",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "image_quality",
            arabicName: "جودة الصورة",
            value: "منخفضة",
            options: [
              "منخفضة",
              "متوسطة",
              "عالية",
              "فائقة الجودة",
              "احترافية",
              "سينمائية",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "background_style",
            arabicName: "الخلفية",
            value: "خلفية مزخرفة",
            options: [
              "خلفية مزخرفة",
              "خلفية بسيطة",
              "خلفية متدرجة",
              "خلفية شفافة",
              "خلفية نسيجية",
              "خلفية طبيعية",
              "خلفية هندسية",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "lighting_style",
            arabicName: "الإضاءة",
            value: "إضاءة قاسية",
            options: [
              "إضاءة قاسية",
              "إضاءة ناعمة",
              "إضاءة طبيعية",
              "إضاءة اصطناعية",
              "إضاءة دراماتيكية",
              "إضاءة خافتة",
              "إضاءة ساطعة",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "depth_of_field",
            arabicName: "عمق المجال",
            value: "عمق مجال ضيق",
            options: [
              "عمق مجال ضيق",
              "عمق مجال واسع",
              "تركيز انتقائي",
              "كل شيء في البؤرة",
              "ضبابية الخلفية",
              "تركيز مقدمة",
              "عمق متدرج",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "separator_visibility",
            arabicName: "نمط الفاصل",
            value: "غير مرئي",
            options: [
              "غير مرئي",
              "واضح ومحدد",
              "ناعم ومتدرج",
              "هندسي حاد",
              "عضوي منحني",
              "متعرج وديناميكي",
              "مخصص"
            ],
            type: 'select'
          },
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
            name: "color_transition",
            arabicName: "انتقال الألوان",
            value: "تدرج ناعم بين الألوان",
            options: [
              "تدرج ناعم بين الألوان",
              "انتقال حاد بين الألوان",
              "تداخل شفاف للألوان",
              "ألوان متباينة بحدود واضحة",
              "تدرج إشعاعي من المركز",
              "ألوان متجانسة",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "text_space_size",
            arabicName: "حجم مساحة النص",
            value: "40% من الصورة",
            options: [
              "30% من الصورة",
              "40% من الصورة", 
              "50% من الصورة",
              "60% من الصورة",
              "70% من الصورة",
              "مساحة صغيرة",
              "مخصص"
            ],
            type: 'select'
          },
          {
            name: "visual_composition",
            arabicName: "تركيب المنطقة البصرية",
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
          },
          {
            name: "design_constraints",
            arabicName: "قيود التصميم (إجبارية)",
            value: STRICT_DESIGN_CONSTRAINTS, // القيود الصارمة مفعلة افتراضياً
            options: [
              "عدم استخدام الشعارات",
              "عدم وجود نصوص في الصورة",
              "تجنب العلامات التجارية",
              "بدون تصميم موكأب",
              "عدم استخدام ألوان صارخة",
              "تجنب التفاصيل المعقدة",
              "بساطة في التكوين",
              "تناسق في التوزيع",
              "وضوح في العناصر الأساسية",
              "تجانس في الإضاءة"
            ],
            type: 'multiselect'
          }
        ];
        
        // دمج المتغيرات المحللة مع المتغيرات الثابتة
        const allVariables = [...(analysisResult.variables || []), ...defaultVariables];
        setVariables(allVariables);
        setVariablesModified(false);
      } else {
        toast.error("فشل في تحليل البرومت");
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      toast.error("حدث خطأ في تحليل البرومت");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVariableChange = (index: number, newValue: string | string[]) => {
    const updatedVariables = [...variables];
    
    // منع إزالة القيود الصارمة
    if (updatedVariables[index].name === 'design_constraints') {
      const currentValues = Array.isArray(newValue) ? newValue : [newValue];
      const missingConstraints = STRICT_DESIGN_CONSTRAINTS.filter(
        constraint => !currentValues.includes(constraint)
      );
      
      if (missingConstraints.length > 0) {
        toast.error("لا يمكن إزالة القيود الصارمة للتصميم");
        return;
      }
    }
    
    updatedVariables[index].value = newValue;
    setVariables(updatedVariables);
    
    if (generatedPrompt) {
      setVariablesModified(true);
    }
  };

  const handleMultiSelectChange = (index: number, option: string, checked: boolean) => {
    const updatedVariables = [...variables];
    const currentValues = Array.isArray(updatedVariables[index].value) 
      ? updatedVariables[index].value as string[]
      : [];
    
    // منع إزالة القيود الصارمة
    if (updatedVariables[index].name === 'design_constraints' && 
        STRICT_DESIGN_CONSTRAINTS.includes(option) && !checked) {
      toast.error("لا يمكن إزالة هذا القيد الصارم");
      return;
    }
    
    if (checked) {
      updatedVariables[index].value = [...currentValues, option];
    } else {
      updatedVariables[index].value = currentValues.filter(val => val !== option);
    }
    
    setVariables(updatedVariables);
    if (generatedPrompt) {
      setVariablesModified(true);
    }
  };

  const generateEnglishPrompt = async () => {
    if (variables.length === 0) {
      toast.error("يرجى توليد وتحليل البرومت أولاً");
      return;
    }

    setIsGeneratingPrompt(true);

    try {
      const variablesText = variables.map(v => {
        const value = Array.isArray(v.value) ? v.value.join(', ') : v.value;
        return `${v.arabicName}: ${value}`;
      }).join('\n');
      
      const response = await fetch(
        geminiApiManager.getApiUrl(),
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
- مُحسَّن لتوليد صور عالية الجودة مع تأكيد واضح على الفواصل والتدرجات
- يتضمن تفاصيل تقنية دقيقة للتأثيرات البصرية (الفواصل الحادة، التدرجات، الانتقالات)
- يؤكد بشدة على وضوح التأثيرات البصرية والفواصل
- يتضمن القيود الصارمة: NO LOGOS, NO TEXT, NO BRANDING, NO MOCKUPS
- لا يتجاوز 300 كلمة

تأكد من التأكيد الصارم على:
- "strictly no logos, text, branding, or mockups"
- إذا كان نمط الفاصل "موجات حادة متعرجة": اكتب "sharp, jagged, zigzag waves with distinct edges and angular cuts"
- إذا كان انتقال الألوان "انتقال حاد": اكتب "abrupt, sharp color transitions with clear boundaries"
- إذا كان تقسيم الخلفية معين: اكتب وصف دقيق للتقسيم

اكتب البرومت الإنجليزي فقط بدون أي شرح إضافي.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const prompt = data.candidates[0].content.parts[0].text;
      setGeneratedPrompt(prompt);
      setVariablesModified(false);
      onGeneratePrompt(prompt);
      toast.success("تم توليد البرومت الإنجليزي بنجاح!");
      
      // التوليد التلقائي للصورة إذا كان مفعل
      if (autoGenerateImages) {
        setTimeout(() => {
          handleGenerateImage();
        }, 1000); // تأخير قصير لإظهار البرومت أولاً
      }
    } catch (error) {
      console.error("Error generating English prompt:", error);
      toast.error("حدث خطأ في توليد البرومت");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedPrompt) {
      toast.error("يرجى توليد البرومت الإنجليزي أولاً");
      return;
    }
    setIsGeneratingImage(true);
    
    try {
      // استخدام نفس منطق توليد الصور المستخدم في ContentGenerator
      await onGenerateImage(generatedPrompt);
      toast.success("تم توليد الصورة بنجاح!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("حدث خطأ في توليد الصورة");
    } finally {
      setTimeout(() => setIsGeneratingImage(false), 2000);
    }
  };

  const randomizeVariables = () => {
    const updatedVariables = variables.map(variable => {
      // حماية قيود التصميم الصارمة من العشوائية
      if (variable.name === 'design_constraints') {
        return {
          ...variable,
          value: [...STRICT_DESIGN_CONSTRAINTS, ...(variable.options as string[]).filter(
            opt => !STRICT_DESIGN_CONSTRAINTS.includes(opt) && Math.random() > 0.5
          )]
        };
      }
      
      if (variable.type === 'multiselect') {
        const availableOptions = (variable.options as string[]).filter(opt => opt !== "مخصص");
        const numToSelect = Math.floor(Math.random() * 3) + 2;
        const shuffled = [...availableOptions].sort(() => Math.random() - 0.5);
        return {
          ...variable,
          value: shuffled.slice(0, Math.min(numToSelect, availableOptions.length))
        };
      } else if (variable.type === 'grouped-select') {
        // جمع جميع الخيارات من المجموعات
        const allOptions = (variable.options as OptionGroup[]).flatMap(group => group.options);
        const availableOptions = allOptions.filter(opt => opt !== "مخصص");
        if (availableOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableOptions.length);
          return {
            ...variable,
            value: availableOptions[randomIndex]
          };
        }
      } else {
        const availableOptions = (variable.options as string[]).filter(opt => opt !== "مخصص");
        if (availableOptions.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableOptions.length);
          return {
            ...variable,
            value: availableOptions[randomIndex]
          };
        }
      }
      return variable;
    });
    setVariables(updatedVariables);
    toast.success("تم اختيار قيم عشوائية للمتغيرات!");
  };

  return (
    <div className="space-y-6">
      {/* إدخال الموضوع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            توليد برومت التصميم من الموضوع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topicInput">أدخل الموضوع:</Label>
            <Input
              id="topicInput"
              placeholder="مثال: أسرار التجارة الإلكترونية، التنمية الذاتية، التسويق الرقمي..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-right"
            />
          </div>
          
          <Button 
            onClick={generateTopicPrompt}
            disabled={isGeneratingTopic || isAnalyzing}
            className="w-full bg-gradient-primary"
          >
            {isGeneratingTopic || isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGeneratingTopic ? "جاري توليد برومت التصميم..." : "جاري تحليل البرومت..."}
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                توليد برومت التصميم
              </>
            )}
          </Button>

            {/* خيار التوليد التلقائي للصور */}
          <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg border">
            <Checkbox
              id="autoGenerateImages"
              checked={autoGenerateImages}
              onCheckedChange={(checked) => setAutoGenerateImages(checked as boolean)}
            />
            <Label 
              htmlFor="autoGenerateImages"
              className="text-sm font-medium cursor-pointer flex-1"
            >
              التوليد التلقائي للصور بعد إنشاء البرومتات
            </Label>
          </div>

          {/* عرض القيود الصارمة */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-destructive">القيود الصارمة المفعلة:</h4>
            <ul className="text-sm space-y-1">
              {STRICT_DESIGN_CONSTRAINTS.map((constraint, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-destructive rounded-full"></span>
                  {constraint}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* جدول المتغيرات */}
      {variables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              متغيرات البرومت
              <Button
                onClick={randomizeVariables}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Shuffle className="h-4 w-4" />
                اختيار عشوائي
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {variables.map((variable, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <Label className="font-medium">{variable.arabicName}</Label>
                
                {variable.type === 'multiselect' ? (
                  <div className="space-y-2">
                     {(variable.options as string[]).map((option, optionIndex) => {
                       const isStrictConstraint = variable.name === 'design_constraints' && 
                                                 STRICT_DESIGN_CONSTRAINTS.includes(option);
                       const isChecked = Array.isArray(variable.value) && 
                                        variable.value.includes(option);
                       
                       return (
                         <div key={optionIndex} className="flex items-center space-x-2">
                           <Checkbox
                             id={`${variable.name}-${optionIndex}`}
                             checked={isChecked}
                             disabled={isStrictConstraint} // منع إلغاء القيود الصارمة
                             onCheckedChange={(checked) => 
                               handleMultiSelectChange(index, option, checked as boolean)
                             }
                           />
                           <Label 
                             htmlFor={`${variable.name}-${optionIndex}`}
                             className={`text-sm ${isStrictConstraint ? 'text-destructive font-semibold' : ''}`}
                           >
                             {option}
                             {isStrictConstraint && " (إجباري)"}
                           </Label>
                         </div>
                       );
                     })}
                  </div>
                ) : variable.type === 'grouped-select' ? (
                  <Select 
                    value={Array.isArray(variable.value) ? variable.value[0] : variable.value} 
                    onValueChange={(value) => handleVariableChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(variable.options as OptionGroup[]).map((group, groupIndex) => (
                        <div key={groupIndex}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                            {group.label}
                          </div>
                          {group.options.map((option, optionIndex) => (
                            <SelectItem key={`${groupIndex}-${optionIndex}`} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select 
                    value={Array.isArray(variable.value) ? variable.value[0] : variable.value} 
                    onValueChange={(value) => handleVariableChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(variable.options as string[]).map((option, optionIndex) => (
                        <SelectItem key={optionIndex} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* توليد البرومت الإنجليزي وتوليد الصورة */}
      {variables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توليد البرومت والصورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={generateEnglishPrompt}
                disabled={isGeneratingPrompt}
                className="flex-1"
                variant="outline"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    توليد البرومت بالإنجليزية
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGenerateImage}
                disabled={!generatedPrompt || isGeneratingImage}
                className="flex-1 bg-gradient-primary"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري توليد الصورة...
                  </>
                ) : (
                  <>
                    <Image className="mr-2 h-4 w-4" />
                    توليد الصورة
                  </>
                )}
              </Button>
            </div>

            {/* عرض البرومت المولد */}
            {generatedPrompt && (
              <div className="space-y-2">
                <Label>البرومت الإنجليزي المولد:</Label>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  rows={6}
                  className="text-left"
                  dir="ltr"
                />
                {variablesModified && (
                  <p className="text-sm text-amber-600">
                    تم تعديل المتغيرات. قم بتوليد برومت جديد لتطبيق التغييرات.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};