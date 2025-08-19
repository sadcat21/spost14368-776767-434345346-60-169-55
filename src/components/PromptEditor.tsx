import { useState } from "react";
import { geminiApiManager } from "../utils/geminiApiManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Brain, Wand2, Image, Shuffle } from "lucide-react";
import { toast } from "sonner";

interface PromptVariable {
  name: string;
  arabicName: string;
  value: string | string[];
  options: string[];
  type: 'select' | 'custom' | 'multiselect';
}

interface PromptEditorProps {
  onGeneratePrompt: (prompt: string) => void;
  onGenerateImage: (prompt: string) => void;
}

export const PromptEditor = ({ onGeneratePrompt, onGenerateImage }: PromptEditorProps) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [variablesModified, setVariablesModified] = useState(false);

  const generatePromptFromTopic = async () => {
    if (!topicInput.trim()) {
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
                text: `أنشئ برومت تصميم احترافي مفصل لموضوع: "${topicInput}"

المطلوب إنشاء برومت باللغة العربية مفصل لتوليد صورة تصميم احترافي يناسب هذا الموضوع مع التأكيد على:

القيود الصارمة والإجبارية:
- عدم استخدام الشعارات نهائياً
- عدم وجود أي نصوص في الصورة
- تجنب العلامات التجارية بشكل كامل  
- بدون تصميم موكأب أو محاكيات

المتطلبات التصميمية:
- تصميم احترافي عالي الجودة
- ألوان متناسقة وجذابة تناسب الموضوع
- إضاءة طبيعية ومتوازنة
- تكوين بصري متوازن ومتناسق
- مساحة فارغة مناسبة لإضافة النص لاحقاً
- فواصل وتدرجات لونية ناعمة
- عمق بصري وأبعاد ثلاثية
- عناصر بصرية تتناسب مع طبيعة الموضوع

التركيز على:
- الجودة والاحترافية
- التوازن والتناسق
- الألوان المتدرجة والناعمة
- المساحات الفارغة للنص
- التأثيرات البصرية الجذابة

اكتب البرومت بالعربية مع التفاصيل الدقيقة والواضحة للتصميم المطلوب، ليكون مناسباً للتحليل واستخراج المتغيرات منه.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const generatedTopicPrompt = data.candidates[0].content.parts[0].text;
      
      // لصق البرومت المولد في حقل إدخال البرومت
      setInputPrompt(generatedTopicPrompt);
      
      toast.success("تم توليد البرومت ولصقه في حقل التحليل!");
      
    } catch (error) {
      console.error("Error generating topic prompt:", error);
      toast.error("حدث خطأ في توليد البرومت");
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const analyzePrompt = async () => {
    if (!inputPrompt.trim()) {
      toast.error("يرجى إدخال البرومت للتحليل");
      return;
    }

    setIsAnalyzing(true);

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
                text: `حلل هذا البرومت للذكاء الاصطناعي واستخرج جميع المتغيرات القابلة للتخصيص:

البرومت: "${inputPrompt}"

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
        const defaultSpaceVariables: PromptVariable[] = [
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
            value: [],
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
            value: [],
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
            arabicName: "قيود التصميم",
            value: [],
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
        
        // تحديث القيم الافتراضية بناءً على البرومت المحلل
        const updatedSpaceVariables = defaultSpaceVariables.map(spaceVar => {
          const matchingAnalyzedVar = analysisResult.variables?.find((analyzedVar: any) => 
            analyzedVar.name === spaceVar.name || 
            analyzedVar.arabicName === spaceVar.arabicName
          );
          
          if (matchingAnalyzedVar) {
            return {
              ...spaceVar,
              value: matchingAnalyzedVar.value
            };
          }
          return spaceVar;
        });
        
        // دمج المتغيرات المحللة مع المتغيرات الثابتة
        const allVariables = [...(analysisResult.variables || []), ...updatedSpaceVariables];
        setVariables(allVariables);
        setVariablesModified(false); // إعادة تعيين حالة التعديل
        toast.success("تم تحليل البرومت بنجاح!");
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
    updatedVariables[index].value = newValue;
    setVariables(updatedVariables);
    // إذا كان البرومت مولداً، تعيين أن المتغيرات تم تعديلها
    if (generatedPrompt) {
      setVariablesModified(true);
    }
  };

  const handleMultiSelectChange = (index: number, option: string, checked: boolean) => {
    const updatedVariables = [...variables];
    const currentValues = Array.isArray(updatedVariables[index].value) 
      ? updatedVariables[index].value as string[]
      : [];
    
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
      toast.error("يرجى تحليل البرومت أولاً");
      return;
    }

    setIsGeneratingPrompt(true);

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
                text: `بناءً على هذه المتغيرات المحددة، أنشئ برومت محترف بالإنجليزية لتوليد الصور:

المتغيرات:
${variablesText}

البرومت الأصلي: "${inputPrompt}"

أنشئ برومت جديد باللغة الإنجليزية يدمج جميع المتغيرات المحددة ويكون:
- واضح ومحدد جداً في وصف التأثيرات البصرية
- مُحسَّن لتوليد صور عالية الجودة مع تأكيد واضح على الفواصل والتدرجات
- يتضمن تفاصيل تقنية دقيقة للتأثيرات البصرية (الفواصل الحادة، التدرجات، الانتقالات)
- يؤكد بشدة على وضوح التأثيرات البصرية والفواصل
- لا يتجاوز 300 كلمة

تأكد من التأكيد على:
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
      setVariablesModified(false); // إعادة تعيين حالة التعديل بعد توليد برومت جديد
      onGeneratePrompt(prompt);
      toast.success("تم توليد البرومت الإنجليزي بنجاح!");
    } catch (error) {
      console.error("Error generating English prompt:", error);
      toast.error("حدث خطأ في توليد البرومت");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImage = () => {
    if (!generatedPrompt) {
      toast.error("يرجى توليد البرومت الإنجليزي أولاً");
      return;
    }
    setIsGeneratingImage(true);
    onGenerateImage(generatedPrompt);
    // سيتم إيقاف التحميل من المكون الأب
    setTimeout(() => setIsGeneratingImage(false), 1000);
  };

  const randomizeVariables = () => {
    const updatedVariables = variables.map(variable => {
      if (variable.type === 'multiselect') {
        // للمتغيرات متعددة الاختيار، اختر 2-4 خيارات عشوائياً
        const availableOptions = variable.options.filter(opt => opt !== "مخصص");
        const numToSelect = Math.floor(Math.random() * 3) + 2; // 2-4 خيارات
        const shuffled = [...availableOptions].sort(() => Math.random() - 0.5);
        return {
          ...variable,
          value: shuffled.slice(0, Math.min(numToSelect, availableOptions.length))
        };
      } else {
        // للمتغيرات العادية
        const availableOptions = variable.options.filter(opt => opt !== "مخصص");
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
      {/* توليد برومت من موضوع */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Wand2 className="h-5 w-5" />
            توليد برومت تلقائي من موضوع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topicInput">أدخل الموضوع:</Label>
            <Input
              id="topicInput"
              placeholder="مثال: التغذية الصحية، ريادة الأعمال، الطب الصيني..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          
          <Button 
            onClick={generatePromptFromTopic}
            disabled={isGeneratingTopic}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGeneratingTopic ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري توليد البرومت...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                توليد برومت احترافي
              </>
            )}
          </Button>
          
          <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            💡 سيتم توليد برومت احترافي ولصقه تلقائياً في حقل التحليل أدناه
          </div>
        </CardContent>
      </Card>

      {/* إدخال البرومت */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            تحليل وتعديل البرومت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promptInput">البرومت للتحليل:</Label>
            <Textarea
              id="promptInput"
              placeholder="الصق أو اكتب البرومت هنا للتحليل..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              rows={6}
              className="min-h-[150px]"
            />
          </div>
          
          <Button 
            onClick={analyzePrompt}
            disabled={isAnalyzing}
            className="w-full bg-gradient-primary"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تحليل البرومت...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                تحليل البرومت
              </>
            )}
          </Button>
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
                 <div className="space-y-2">
                   {variable.type === 'multiselect' ? (
                     // واجهة للمتغيرات متعددة الاختيار
                     <div className="space-y-2">
                       <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                         {variable.options.map((option, optIndex) => (
                           <div key={optIndex} className="flex items-center space-x-2 space-x-reverse">
                             <Checkbox
                               id={`${index}-${optIndex}`}
                               checked={Array.isArray(variable.value) && variable.value.includes(option)}
                               onCheckedChange={(checked) => 
                                 handleMultiSelectChange(index, option, checked as boolean)
                               }
                             />
                             <Label 
                               htmlFor={`${index}-${optIndex}`}
                               className="text-sm cursor-pointer"
                             >
                               {option}
                             </Label>
                           </div>
                         ))}
                       </div>
                       {Array.isArray(variable.value) && variable.value.length > 0 && (
                         <div className="text-sm text-muted-foreground">
                           مختار: {variable.value.join(', ')}
                         </div>
                       )}
                     </div>
                   ) : (
                     // واجهة للمتغيرات العادية
                     <>
                       <Select
                         value={typeof variable.value === 'string' ? variable.value : ""}
                         onValueChange={(value) => {
                           if (value === "مخصص") {
                             // تحويل إلى نوع custom
                             const updated = [...variables];
                             updated[index].type = 'custom';
                             updated[index].value = "";
                             setVariables(updated);
                           } else {
                             handleVariableChange(index, value);
                           }
                         }}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="اختر قيمة" />
                         </SelectTrigger>
                         <SelectContent className="bg-background border z-50">
                           {variable.options.map((option, optIndex) => (
                             <SelectItem key={optIndex} value={option}>
                               {option}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       
                       {variable.type === 'custom' && (
                         <Input
                           placeholder="اكتب القيمة المخصصة..."
                           value={typeof variable.value === 'string' ? variable.value : ""}
                           onChange={(e) => handleVariableChange(index, e.target.value)}
                         />
                       )}
                     </>
                   )}
                 </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* أزرار العمل */}
      {variables.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={generateEnglishPrompt}
                disabled={isGeneratingPrompt}
                className={variablesModified 
                  ? "bg-gradient-to-r from-red-800 to-red-600 hover:from-red-900 hover:to-red-700 text-white" 
                  : "bg-muted hover:bg-muted/90 text-foreground"
                }
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    توليد البرومت بالإنجليزي
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !generatedPrompt}
                className="bg-gradient-primary"
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
          </CardContent>
        </Card>
      )}

      {/* عرض البرومت المولد */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>البرومت المولد (إنجليزي)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedPrompt}
              readOnly
              rows={8}
              className="bg-muted"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};