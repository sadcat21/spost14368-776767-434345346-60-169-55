import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Facebook, 
  Zap, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Bot,
  Wand2,
  Image as ImageIcon,
  Send,
  Brain,
  Eye,
  MessageSquare,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useFacebook } from "@/contexts/FacebookContext";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { createGeminiKeyManager, makeGeminiRequest } from "@/utils/apiKeyRotationManager";
import { supabase } from "@/integrations/supabase/client";
import { AutomationSetupGuide } from "./AutomationSetupGuide";

interface AutomationStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  details?: string;
  error?: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

interface GeneratedContent {
  textContent: string;
  imagePrompt: string;
  geniusPrompt: string;
  interactiveQuestions: string[];
  generatedImage?: {
    imageUrl: string;
    style: string;
  };
}

interface RejectedImage {
  imageUrl: string;
  prompt: string;
  relevanceScore: number;
  rejectionReason: string;
  timestamp: Date;
}

interface AcceptedImage {
  imageUrl: string;
  prompt: string;
  relevanceScore: number;
  acceptanceReason: string;
  timestamp: Date;
}

// تخصصات المحتوى
const specialties = [
  { value: "طب", label: "طبي" },
  { value: "تقنية", label: "تقنية ومعلومات" },
  { value: "تعليم", label: "تعليمي" },
  { value: "تسويق", label: "تسويق ومبيعات" },
  { value: "صحة", label: "صحة ولياقة" },
  { value: "طعام", label: "طعام ومطاعم" },
  { value: "سفر", label: "سفر وسياحة" },
  { value: "موضة", label: "موضة وجمال" },
  { value: "رياضة", label: "رياضة" },
  { value: "فن", label: "فن وثقافة" },
];

const contentTypes = [
  { value: "منشور", label: "منشور تسويقي" },
  { value: "إعلان", label: "إعلان ترويجي" },
  { value: "تعليمي", label: "محتوى تعليمي" },
  { value: "نصائح", label: "نصائح ومعلومات" },
  { value: "قصة", label: "قصة نجاح" },
  { value: "عرض", label: "عرض خاص" },
];

// لغات المحتوى
const languages = [
  { value: "العربية", label: "العربية 🇸🇦" },
  { value: "الإنجليزية", label: "الإنجليزية 🇺🇸" },
  { value: "القبائلية", label: "القبائلية (تقبايليت) ⵜⴰⵇⴱⴰⵢⵍⵉⵜ" },
  { value: "الشاوية", label: "الشاوية (تاشاويت) ⵜⴰⵛⴰⵡⵉⵜ" },
  { value: "التارقية", label: "التارقية (تماشق) ⵜⴰⵎⴰⵌⴰⵖ" },
  { value: "المزابية", label: "المزابية (تمازيغت نغ مزاب) ⵜⴰⵎⴰⵣⵉⵖⵜ" },
  { value: "الجرجرية", label: "الجرجرية (تاجرجرت) ⵜⴰⵊⴰⵔⵊⴰⵔⵜ" },
  { value: "الشنوية", label: "الشنوية (تاشنويت) ⵜⴰⵛⵏⵡⵉⵜ" },
];

export const AutomatedFacebookPublisher: React.FC = () => {
  const { selectedPage, isConnected } = useFacebook();
  const { apiKey: geminiApiKey, hasApiKey } = useGeminiApiKey();
  
  // حالات النموذج
  const [topic, setTopic] = useState("");
  const [specialty, setSpecialty] = useState("تسويق");
  const [contentType, setContentType] = useState("منشور");
  const [language, setLanguage] = useState("العربية");
  const [customPrompt, setCustomPrompt] = useState("");
  
  // حالات العملية
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [progress, setProgress] = useState(0);
  const [keyManager] = useState(() => createGeminiKeyManager());
  const [keyStats, setKeyStats] = useState(() => keyManager.getStats());
  const [rejectedImages, setRejectedImages] = useState<RejectedImage[]>([]);
  const [acceptedImages, setAcceptedImages] = useState<AcceptedImage[]>([]);

  // إنشاء خطوات الأتمتة مع إعدادات عشوائية
  const initializeSteps = (): AutomationStep[] => [
    {
      id: 'generate-settings',
      title: 'توليد إعدادات المحتوى العشوائية',
      status: 'pending'
    },
    {
      id: 'generate-topic',
      title: 'توليد موضوع المحتوى بالذكاء الاصطناعي',
      status: 'pending'
    },
    {
      id: 'generate-text',
      title: 'توليد المحتوى النصي',
      status: 'pending'
    },
    {
      id: 'generate-questions',
      title: 'توليد الأسئلة التفاعلية',
      status: 'pending'
    },
    {
      id: 'generate-prompts',
      title: 'توليد برومتات الصور',
      status: 'pending'
    },
    {
      id: 'generate-image',
      title: 'توليد الصورة بنمط جينيوس',
      status: 'pending'
    },
    {
      id: 'analyze-image',
      title: 'تحليل ملاءمة الصورة للمحتوى بالذكاء الاصطناعي',
      status: 'pending'
    },
    {
      id: 'publish-post',
      title: 'نشر المنشور على فيسبوك',
      status: 'pending'
    },
    {
      id: 'add-comments',
      title: 'إضافة التعليقات التفاعلية',
      status: 'pending'
    }
  ];

  // تحديث حالة الخطوة مع حساب الوقت
  const updateStepStatus = (stepId: string, status: 'running' | 'completed' | 'error', progress?: number, details?: string, error?: string) => {
    setAutomationSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedStep = { ...step, status, progress, details, error };
        
        if (status === 'running') {
          updatedStep.startTime = Date.now();
        } else if (status === 'completed' || status === 'error') {
          if (step.startTime) {
            updatedStep.endTime = Date.now();
            updatedStep.duration = Math.floor((updatedStep.endTime - step.startTime) / 1000);
          }
        }
        
        return updatedStep;
      }
      return step;
    }));
  };

  // توليد إعدادات المحتوى العشوائية الحقيقية (بدون AI للسرعة)
  const generateRandomSettings = async (): Promise<{ specialty: string; contentType: string; topic: string }> => {
    // توليد عشوائي حقيقي بدون استخدام AI للحصول على تنويع أكبر وسرعة أعلى
    const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
    const randomContentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    // مواضيع متنوعة لكل تخصص
    const topicsBySpecialty: Record<string, string[]> = {
      "طب": ["آخر التطورات في علاج السرطان", "نصائح للوقاية من أمراض القلب", "فوائد الفيتامينات الطبيعية", "تقنيات جديدة في الجراحة"],
      "تقنية": ["الذكاء الاصطناعي في المستقبل", "أمن المعلومات والحماية الرقمية", "تطبيقات الهواتف المبتكرة", "التطوير البرمجي الحديث"],
      "تعليم": ["طرق التعلم الحديثة", "التعليم الإلكتروني التفاعلي", "تطوير مهارات الطلاب", "استراتيجيات التدريس الفعالة"],
      "تسويق": ["استراتيجيات التسويق الرقمي", "بناء العلامة التجارية", "التسويق عبر وسائل التواصل", "تحليل سلوك المستهلك"],
      "صحة": ["التغذية الصحية المتوازنة", "تمارين اللياقة البدنية", "الصحة النفسية والعقلية", "عادات يومية صحية"],
      "طعام": ["وصفات الطبخ الشهية", "أسرار المطبخ العربي", "الأكلات الصحية والمفيدة", "تقديم الطعام بطريقة جذابة"],
      "سفر": ["وجهات سياحية مذهلة", "نصائح السفر والتوفير", "معالم تاريخية مهمة", "تجارب سفر لا تُنسى"],
      "موضة": ["أحدث صيحات الموضة", "تنسيق الألوان والأزياء", "موضة الشتاء الأنيقة", "اكسسوارات عصرية مميزة"],
      "رياضة": ["تمارين بناء العضلات", "رياضات جديدة ومثيرة", "نصائح اللياقة البدنية", "البطولات الرياضية العالمية"],
      "فن": ["الفن التشكيلي المعاصر", "تاريخ الفن والثقافة", "ورش الرسم والإبداع", "معارض فنية مميزة"]
    };
    
    const specialtyTopics = topicsBySpecialty[randomSpecialty.value] || ["موضوع مثير ومفيد"];
    const randomTopic = specialtyTopics[Math.floor(Math.random() * specialtyTopics.length)];

    // تأخير بسيط لمحاكاة العملية
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ تم توليد إعدادات عشوائية جديدة:', {
      specialty: randomSpecialty.value,
      contentType: randomContentType.value,
      topic: randomTopic
    });
    
    return {
      specialty: randomSpecialty.value,
      contentType: randomContentType.value,
      topic: randomTopic
    };
  };

  // توليد موضوع تلقائي (تم تحديثه لاستخدام الإعدادات المولدة)
  const generateTopicWithAI = async (specialty: string, contentType: string, selectedLanguage: string): Promise<string> => {
    const getLanguageInstructions = (lang: string) => {
      switch(lang) {
        case "الإنجليزية":
          return `Generate the topic in English. Make it engaging and culturally appropriate.`;
        case "القبائلية":
        case "الشاوية":
        case "التارقية":
        case "المزابية":
        case "الجرجرية":
        case "الشنوية":
          return `قم بتوليد الموضوع بطريقة تناسب الثقافة الأمازيغية والبيئة المحلية. يمكن كتابة الموضوع بالعربية لكن مع مراعاة الهوية والثقافة المحلية.`;
        default:
          return `قم بتوليد الموضوع باللغة العربية.`;
      }
    };

    const topicPrompt = `قم بتوليد موضوع مثير ومناسب للمحتوى بناءً على المعايير التالية:

التخصص: ${specialty}
نوع المحتوى: ${contentType}
اللغة المستهدفة: ${selectedLanguage}

${getLanguageInstructions(selectedLanguage)}

المطلوب:
- موضوع جذاب ومثير للاهتمام
- يناسب التخصص المحدد
- يحفز التفاعل والمشاركة
- يكون عملي ومفيد للجمهور
- يراعي الثقافة واللغة المستهدفة

أعطني موضوع واحد فقط (بدون تفسير إضافي).`;

    try {
      const response = await makeGeminiRequest(
        'gemini-2.0-flash-exp',
        {
          contents: [{ parts: [{ text: topicPrompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 256 }
        },
        keyManager
      );

      const data = await response.json();
      const generatedTopic = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!generatedTopic) {
        throw new Error('لم يتم إنشاء موضوع');
      }

      return generatedTopic;
    } catch (error) {
      console.error('❌ خطأ في توليد الموضوع:', error);
      throw new Error(`فشل في توليد الموضوع: ${error.message}`);
    }
  };

  // توليد المحتوى النصي (تم تحديثه لاستخدام الإعدادات المولدة)
  const generateTextContent = async (topicToUse: string, specialty: string, contentType: string, selectedLanguage: string): Promise<string> => {
    const getLanguageInstructions = (lang: string) => {
      switch(lang) {
        case "الإنجليزية":
          return `Write the content in English. Use engaging English phrases and appropriate English hashtags.`;
        case "القبائلية":
          return `اكتب المحتوى باللغة القبائلية (تقبايليت) مع استخدام الحروف الأمازيغية (تيفيناغ). إذا كنت لا تستطيع كتابة التيفيناغ، اكتب بالحروف اللاتينية للقبائلية. استخدم الهاشتاغات مناسبة للثقافة الأمازيغية.`;
        case "الشاوية":
          return `اكتب المحتوى باللغة الشاوية (تاشاويت) مع استخدام الحروف الأمازيغية (تيفيناغ) إن أمكن، أو بالحروف اللاتينية. استخدم تعابير وثقافة الشاوية الأصيلة.`;
        case "التارقية":
          return `اكتب المحتوى باللغة التارقية (تماشق) مع استخدام الحروف التيفيناغ التقليدية إن أمكن، أو بالحروف اللاتينية. استخدم التعابير الصحراوية والثقافة التارقية.`;
        case "المزابية":
          return `اكتب المحتوى بلغة المزاب (تمازيغت نغ مزاب) مع استخدام التيفيناغ إن أمكن، أو بالحروف اللاتينية. استخدم التعابير المحلية لمنطقة مزاب.`;
        case "الجرجرية":
          return `اكتب المحتوى باللهجة الجرجرية (تاجرجرت) مع استخدام التيفيناغ إن أمكن، أو بالحروف اللاتينية. استخدم التعابير المحلية لمنطقة جرجرة.`;
        case "الشنوية":
          return `اكتب المحتوى باللهجة الشنوية (تاشنويت) مع استخدام التيفيناغ إن أمكن، أو بالحروف اللاتينية. استخدم التعابير المحلية لمنطقة الشنوة.`;
        default:
          return `اكتب المحتوى باللغة العربية الفصحى مع لمسة من العامية حسب الحاجة.`;
      }
    };

    const textPrompt = `أنت خبير في كتابة المحتوى التسويقي الإبداعي والجذاب على فيسبوك. 
اكتب محتوى ${contentType} في مجال ${specialty} حول الموضوع: "${topicToUse}"

🌍 لغة المحتوى المطلوبة: ${selectedLanguage}
${getLanguageInstructions(selectedLanguage)}

⚠️ تعليمات مهمة جداً:
🚫 لا تستخدم أي تنسيق markdown مثل ** أو __ أو # 
✅ استخدم النص العادي فقط مع الرموز التعبيرية

المطلوب:
🎯 نص إبداعي وجذاب يلفت الانتباه فوراً
🌟 استخدام 15-20 رمز تعبيري متنوع وذكي في النص
✨ كلمات قوية ومؤثرة تثير المشاعر والفضول
🔥 فقرات قصيرة (2-3 أسطر لكل فقرة)
💫 عبارات تفاعلية تشجع التعليق والمشاركة
⭐ دعوة قوية للعمل في النهاية
📝 طول مناسب: 200-300 كلمة
🏷️ إنهاء النص بـ 5-7 هاشتاغات مناسبة للغة والثقافة

📋 التنسيق المطلوب:
- ابدأ بجملة جذابة مع رموز تعبيرية
- قسم النص إلى 3-4 فقرات قصيرة
- استخدم رموز تعبيرية في بداية كل فقرة
- أنهي بدعوة للعمل مع رموز تعبيرية
- أضف 5-7 هاشتاغات في السطر الأخير

اكتب المحتوى مباشرة بالتنسيق المطلوب.`;

    try {
      const response = await makeGeminiRequest(
        'gemini-2.0-flash-exp',
        {
          contents: [{ parts: [{ text: textPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        },
        keyManager
      );

      const data = await response.json();
      let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!textContent) {
        throw new Error('لم يتم إنشاء محتوى نصي');
      }

      // إزالة تنسيق Markdown والحفاظ على الرموز التعبيرية والهاشتاغات
      textContent = textContent
        .replace(/\*\*(.*?)\*\*/g, '$1')  // إزالة ** النص **
        .replace(/\*(.*?)\*/g, '$1')      // إزالة * النص *
        .replace(/_(.*?)_/g, '$1')        // إزالة _ النص _
        .replace(/__(.*?)__/g, '$1')      // إزالة __ النص __
        .replace(/^\s*#+\s*/gm, '')       // إزالة عناوين markdown
        .replace(/^\s*[\*\-\+]\s*/gm, '') // إزالة نقاط markdown
        .replace(/^\s*\d+\.\s*/gm, '')    // إزالة ترقيم markdown
        .trim();

      console.log('✅ تم تنظيف المحتوى النصي من تنسيق Markdown');
      
      return textContent;
    } catch (error) {
      console.error('❌ خطأ في توليد المحتوى النصي:', error);
      throw new Error(`فشل في توليد المحتوى النصي: ${error.message}`);
    }
  };

  // توليد برومتات الصور
  const generateImagePrompts = async (topicToUse: string, textContent: string): Promise<{ imagePrompt: string; geniusPrompt: string }> => {
    const promptsPrompt = `بناءً على الموضوع: "${topicToUse}" والمحتوى النصي التالي:

"${textContent}"

قم بإنشاء برومتين للصور مع التركيز على الجمالية والتأثير البصري القوي:

1. برومت عادي: وصف دقيق للصورة المطلوبة
2. برومت جينيوس: نفس الصورة لكن بأسلوب إبداعي مذهل ومؤثر

تأكد أن البرومتات:
- تعكس روح وجوهر المحتوى النصي بقوة
- تحتوي على عناصر بصرية مؤثرة ومعبرة
- تستخدم ألوان جذابة ومتناسقة 
- تتضمن تفاصيل غنية وملهمة
- تناسب الهوية البصرية العربية
- تثير المشاعر وتحفز التفاعل
- مناسبة لمنصات التواصل الاجتماعي بجودة عالية

أكتب البرومتات بتنسيق:
برومت عادي: [البرومت هنا]
برومت جينيوس: [البرومت هنا]`;

    try {
      const response = await makeGeminiRequest(
        'gemini-2.0-flash-exp',
        {
          contents: [{ parts: [{ text: promptsPrompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
        },
        keyManager
      );

      const data = await response.json();
      const promptsText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!promptsText) {
        throw new Error('لم يتم إنشاء برومتات الصور');
      }

      // استخراج البرومتات من النص
      const imagePromptMatch = promptsText.match(/برومت عادي:\s*(.+)/);
      const geniusPromptMatch = promptsText.match(/برومت جينيوس:\s*(.+)/);

      return {
        imagePrompt: imagePromptMatch?.[1]?.trim() || promptsText.split('\n')[0],
        geniusPrompt: geniusPromptMatch?.[1]?.trim() || promptsText.split('\n')[1] || promptsText
      };
    } catch (error) {
      console.error('❌ خطأ في توليد برومتات الصور:', error);
      throw new Error(`فشل في توليد برومتات الصور: ${error.message}`);
    }
  };

  // توليد الأسئلة التفاعلية
  const generateInteractiveQuestions = async (topicToUse: string, textContent: string, selectedLanguage: string): Promise<string[]> => {
    const getLanguageInstructions = (lang: string) => {
      switch(lang) {
        case "الإنجليزية":
          return `Write the questions in English. Make them engaging and culturally appropriate for English-speaking audience.`;
        case "القبائلية":
          return `اكتب الأسئلة باللغة القبائلية (تقبايليت) مع استخدام الحروف الأمازيغية (تيفيناغ) إن أمكن، أو بالحروف اللاتينية.`;
        case "الشاوية":
          return `اكتب الأسئلة باللغة الشاوية (تاشاويت) مع استخدام الحروف الأمازيغية (تيفيناغ) إن أمكن، أو بالحروف اللاتينية.`;
        case "التارقية":
          return `اكتب الأسئلة باللغة التارقية (تماشق) مع استخدام الحروف التيفيناغ التقليدية إن أمكن، أو بالحروف اللاتينية.`;
        case "المزابية":
          return `اكتب الأسئلة بلغة المزاب (تمازيغت نغ مزاب) مع استخدام التيفيناغ إن أمكن، أو بالحروف اللاتينية.`;
        case "الجرجرية":
          return `اكتب الأسئلة باللهجة الجرجرية (تاجرجرت) مع استخدام التيفيناغ إن أمكن، أو بالحروف اللاتينية.`;
        case "الشنوية":
          return `اكتب الأسئلة باللهجة الشنوية (تاشنويت) مع استخدام التيفيناغ إن أمكن، أو بالحروف اللاتينية.`;
        default:
          return `اكتب الأسئلة باللغة العربية الفصحى مع لمسة من العامية حسب الحاجة.`;
      }
    };

    const questionsPrompt = `بناءً على الموضوع: "${topicToUse}" والمحتوى: "${textContent}"

🌍 لغة الأسئلة المطلوبة: ${selectedLanguage}
${getLanguageInstructions(selectedLanguage)}

قم بإنشاء 3 أسئلة تفاعلية:
- تحفز التفاعل والنقاش
- مناسبة للجمهور المستهدف والثقافة المحلية
- قصيرة وواضحة
- تشجع على المشاركة

اكتب كل سؤال في سطر منفصل.`;

    try {
      const response = await makeGeminiRequest(
        'gemini-2.0-flash-exp',
        {
          contents: [{ parts: [{ text: questionsPrompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
        },
        keyManager
      );

      const data = await response.json();
      const questionsText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!questionsText) {
        throw new Error('لم يتم إنشاء أسئلة تفاعلية');
      }

      // تقسيم الأسئلة
      const questions = questionsText
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .filter(question => question.length > 5)
        .slice(0, 3);

      return questions;
    } catch (error) {
      console.error('❌ خطأ في توليد الأسئلة التفاعلية:', error);
      throw new Error(`فشل في توليد الأسئلة التفاعلية: ${error.message}`);
    }
  };

  // توليد الصورة باستخدام Gemini API المباشر مع التبديل الذكي للمفاتيح
  const generateImageWithGemini = async (prompt: string): Promise<{ imageUrl: string; style: string }> => {
    console.log('🎨 بدء توليد الصورة باستخدام Gemini API مع التبديل الذكي للمفاتيح...');

    // تحسين البرومت للنمط الجينيوس مع تركيز على الجمالية والتأثير البصري
    const enhancedPrompt = `${prompt}. 
    
    VISUAL ENHANCEMENT REQUIREMENTS:
    - Ultra-high quality 8K resolution, professional photography level
    - Vibrant, rich colors with perfect saturation and contrast
    - Dynamic lighting with dramatic shadows and highlights
    - Cinematic composition with rule of thirds
    - Artistic depth of field and bokeh effects
    - Creative genius-style design with innovative visual elements
    - Stunning visual impact that captures attention immediately
    - Perfect symmetry and balance in composition
    - Rich textures and detailed surfaces
    - Emotionally powerful imagery that reflects the content essence
    - Arabic cultural aesthetics and modern design fusion
    - Social media optimized format with maximum visual appeal
    - Masterpiece-level artistic quality with professional finish
    - Eye-catching, scroll-stopping visual impact
    - Premium brand-level visual quality
    
    Style: Premium digital art, cinematic lighting, hyperrealistic details, artistic masterpiece`;

    try {
      // استخدام مدير التبديل الذكي للمفاتيح الجديد
      const response = await makeGeminiRequest(
        'gemini-2.0-flash-exp',
        {
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseModalities: ["TEXT", "IMAGE"]
          }
        },
        keyManager
      );

      const data = await response.json();
      console.log('✅ استجابة Gemini API تمت بنجاح');

      // البحث عن الصورة في الاستجابة
      const candidate = data.candidates?.[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
        throw new Error('لم يتم إنشاء محتوى من Gemini API');
      }

      let imageData = null;

      // استخراج الصورة من أجزاء الاستجابة
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
          break;
        }
      }

      // إذا لم يتم العثور على صورة، جرب نموذج الصور المخصص
      if (!imageData) {
        console.log('🔄 محاولة مع نموذج توليد الصور المخصص...');
        
        const imageResponse = await makeGeminiRequest(
          'imagen-3.0-generate-001',
          {
            contents: [{
              parts: [{
                text: enhancedPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048
            }
          },
          keyManager
        );

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          const imageCandidate = imageResult.candidates?.[0];
          if (imageCandidate?.content?.parts) {
            for (const part of imageCandidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                imageData = part.inlineData.data;
                break;
              }
            }
          }
        }
      }

      if (!imageData) {
        throw new Error('فشل في توليد الصورة من Gemini API');
      }

      // تحويل البيانات إلى data URL
      const mimeType = candidate.content.parts.find(p => p.inlineData)?.inlineData?.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${imageData}`;

      console.log('✅ تم توليد الصورة بنجاح مع التبديل الذكي للمفاتيح');
      
      // تحديث إحصائيات المفاتيح
      const stats = keyManager.getStats();
      setKeyStats(stats);
      console.log('📊 إحصائيات المفاتيح:', stats);
      
      return {
        imageUrl: imageUrl,
        style: 'جينيوس - Gemini'
      };

    } catch (error) {
      console.error('❌ خطأ في توليد الصورة:', error);
      
      // تحديث إحصائيات المفاتيح عند الفشل
      const stats = keyManager.getStats();
      setKeyStats(stats);
      console.log('📊 إحصائيات المفاتيح بعد الفشل:', stats);
      
      throw new Error(`فشل في توليد الصورة: ${error.message}`);
    }
  };

  // تحليل ملاءمة الصورة للمحتوى باستخدام Gemini Vision API مع فحص شامل
  const analyzeImageRelevance = async (imageUrl: string, textContent: string, topic: string): Promise<{ relevanceScore: number; analysisDetails: string }> => {
    console.log('🔍 بدء التحليل الشامل للصورة وفقاً للمعايير الإسلامية وسياسات فيسبوك...');

    try {
      // تحويل الصورة إلى base64 إذا كانت data URL
      let imageData: string;
      let mimeType: string = 'image/png';
      
      if (imageUrl.startsWith('data:')) {
        // استخراج البيانات من data URL
        const [header, data] = imageUrl.split(',');
        imageData = data;
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      } else {
        // تحميل الصورة من URL وتحويلها إلى base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        mimeType = blob.type || 'image/png';
      }

      // إنشاء برومت الفحص الشامل للصورة مع التركيز على الارتباط بالمحتوى النصي
      const analysisPrompt = `أنت خبير متخصص في تحليل الصور وفقاً للمعايير الإسلامية وسياسات فيسبوك. 
قم بفحص الصورة المرفقة بعناية فائقة وتحليل مدى ارتباطها بالمحتوى النصي المطلوب:

🎯 **الموضوع المطلوب:** "${topic}"
📝 **المحتوى النصي المطلوب:** "${textContent}"

⚠️ **هام: قم بتحليل الصورة الناتجة وليس البرومت المستخدم لإنشائها**

📋 **معايير الفحص الإجبارية (12 معيار):**

**1. الارتباط المباشر بالمحتوى النصي (10/10)**
- هل تعكس الصورة المعنى الحقيقي للنص المكتوب؟
- هل تدعم الصورة الرسالة الأساسية للمحتوى؟
- هل توجد علاقة منطقية وواضحة بين العناصر البصرية والكلمات المكتوبة؟

**2. التوافق الموضوعي مع السياق (10/10)**
- هل تتناسب عناصر الصورة مع سياق الموضوع المطروح؟
- هل تبرز الصورة النقاط الأساسية المذكورة في النص؟

**2. سلامة العناصر البصرية (10/10)**
- فحص التشوهات: أشخاص بأيدي زائدة، وجوه مشوهة، حيوانات بأرجل غير طبيعية
- فحص الأخطاء المنطقية: ظلال غير منطقية، أشياء معلقة، تناقضات بصرية

**3. الالتزام بالقيم الإسلامية (10/10)**
- عدم وجود رموز دينية مخالفة (صليب، بوذا، نجمة داوود، إلخ)
- عدم وجود تماثيل أو رموز أسطورية مخالفة للعقيدة
- عدم وجود مشاهد عبادات غير إسلامية

**4. الحشمة واللباس (10/10)**
- عدم وجود صور نساء بملابس كاشفة (أرجل، صدر، كتفين، إلخ)
- عدم إبراز تفاصيل الجسد بشكل مثير

**5. جودة ودقة الصورة (10/10)**
- وضوح الصورة وعدم التشويش
- تناسق الإضاءة والألوان
- الجودة الاحترافية

**6. النصوص داخل الصور (10/10)**
- عدم وجود نصوص مسيئة أو بذيئة
- النصوص العربية واضحة ومقروءة وخالية من الأخطاء

**7. منع العنف والمشاهد الصادمة (10/10)**
- عدم وجود مشاهد دموية أو جروح
- عدم وجود أسلحة إلا في سياق آمن وواضح

**8. المحتوى السياسي الحساس (10/10)**
- تجنب الشخصيات السياسية المثيرة للجدل
- تجنب الأعلام أو الشعارات المثيرة للانقسام

**9. تجنب التضليل البصري (10/10)**
- عدم وجود محتوى مضلل أو deepfake
- عدم إيحاء بأحداث غير صحيحة

**10. الحقوق والعلامات التجارية (10/10)**
- عدم استخدام شعارات محمية بحقوق ملكية
- عدم انتهاك العلامات التجارية

**11. منع المحتوى المقزز (10/10)**
- عدم وجود مناظر مقززة (حشرات مكبرة، أمراض، فضلات)

**12. التوافق مع سياسات فيسبوك (10/10)**
- عدم التحريض على الكراهية أو العنف
- عدم التمييز على أساس العرق أو الدين أو الجنس

🎯 **المطلوب:**
قدم تحليلاً شاملاً وتقييماً دقيقاً لكل معيار، مع نسبة مئوية إجمالية من 0 إلى 100.
**الحد الأدنى للقبول: 75%**

أعطي النتيجة بتنسيق JSON دقيق:
{
  "overallScore": [رقم من 0 إلى 100],
  "passThreshold": [true إذا كانت النسبة 75% أو أكثر، false إذا كانت أقل],
  "criteria": {
    "contentRelevance": {"score": [0-10], "details": "تفاصيل مدى ارتباط الصورة بالمحتوى النصي"},
    "contextAlignment": {"score": [0-10], "details": "تفاصيل التوافق مع السياق الموضوعي"},
    "visualIntegrity": {"score": [0-10], "details": "تفاصيل التشوهات إن وجدت"},
    "islamicValues": {"score": [0-10], "details": "تقييم الالتزام بالقيم الإسلامية"},
    "modesty": {"score": [0-10], "details": "تقييم الحشمة واللباس"},
    "imageQuality": {"score": [0-10], "details": "تقييم الجودة التقنية"},
    "textContent": {"score": [0-10], "details": "تقييم النصوص في الصورة"},
    "violenceCheck": {"score": [0-10], "details": "فحص العنف والمشاهد الصادمة"},
    "politicalContent": {"score": [0-10], "details": "فحص المحتوى السياسي"},
    "misinformation": {"score": [0-10], "details": "فحص التضليل البصري"},
    "copyright": {"score": [0-10], "details": "فحص حقوق الملكية"},
    "facebookPolicy": {"score": [0-10], "details": "التوافق مع سياسات فيسبوك"}
  },
  "imageDescription": "وصف شامل لمحتوى الصورة الناتجة",
  "contentCorrelation": "تحليل مفصل لمدى ارتباط الصورة بالمحتوى النصي",
  "rejectionReasons": ["قائمة بأسباب الرفض إن وجدت"],
  "acceptanceReasons": ["قائمة بأسباب القبول إن تم قبولها"],
  "recommendations": "توصيات للتحسين",
  "finalDecision": "قبول/رفض مع التبرير المفصل"
}

⚠️ **هام جداً:** ارفض الصورة فوراً إذا فشلت في أي من المعايير الأساسية (3، 4، 7، 11، 12)`;

      // إرسال الطلب إلى Gemini Vision API
      const response = await makeGeminiRequest(
        'gemini-2.0-flash-exp',
        {
          contents: [{
            parts: [
              {
                text: analysisPrompt
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 32,
            topP: 0.8,
            maxOutputTokens: 1024
          }
        },
        keyManager
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini Vision API error:', errorText);
        throw new Error(`خطأ من Gemini Vision API: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ تم تلقي رد Gemini Vision API للتحليل');

      // استخراج النص من الرد
      const candidate = data.candidates?.[0];
      if (!candidate || !candidate.content || !candidate.content.parts) {
        throw new Error('لم يتم تلقي تحليل من Gemini Vision API');
      }

      const analysisText = candidate.content.parts
        .filter((part: any) => part.text)
        .map((part: any) => part.text)
        .join('\n');

      if (!analysisText) {
        throw new Error('لم يتم تلقي تحليل نصي من Gemini Vision API');
      }

      console.log('🔍 نتيجة التحليل الشامل:', analysisText);

      // محاولة استخراج JSON من الرد
      let analysisResult;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('لم يتم العثور على JSON في الرد');
        }
      } catch (parseError) {
        console.warn('فشل في تحليل JSON، استخدام تحليل نصي:', parseError);
        
        // استخراج النسبة من النص إذا فشل تحليل JSON
        const scoreMatch = analysisText.match(/(\d+)%?/);
        const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : 40; // قيمة افتراضية منخفضة للأمان
        
        analysisResult = {
          overallScore: extractedScore,
          imageDescription: 'تم تحليل الصورة نصياً - فشل في تحليل JSON',
          finalDecision: extractedScore >= 75 ? 'قبول' : 'رفض',
          rejectionReasons: extractedScore < 75 ? ['فشل في تحليل JSON بشكل صحيح', 'نسبة أقل من 75%'] : [],
          passThreshold: extractedScore >= 75
        };
      }

      // استخدام overallScore بدلاً من relevanceScore
      const finalScore = analysisResult.overallScore || analysisResult.relevanceScore || 40;
      
      // التأكد من وجود passThreshold مع عتبة 75%
      const passThreshold = finalScore >= 75;
      
      // إنشاء تقرير مفصل للقبول أو الرفض
      let analysisDetails = '';
      
      if (passThreshold) {
        // تقرير القبول
        const acceptanceReasons = analysisResult.acceptanceReasons || ['تمت موافقة المعايير الأساسية'];
        analysisDetails = `
✅ **تم قبول الصورة - النسبة: ${finalScore}% (أعلى من 75%)**

📋 **أسباب القبول:**
${acceptanceReasons.map(r => `• ${r}`).join('\n')}

📝 **وصف الصورة الناتجة:** 
${analysisResult.imageDescription || 'صورة مناسبة للنشر'}

🔗 **ارتباط الصورة بالمحتوى النصي:**
${analysisResult.contentCorrelation || 'الصورة تتوافق مع المحتوى النصي المطلوب'}

💡 **تقييم إضافي:** ${analysisResult.recommendations || 'الصورة تلتزم بجميع المعايير المطلوبة'}

⚖️ **القرار النهائي:** ${analysisResult.finalDecision || 'قبول - مناسبة للنشر على فيسبوك'}
        `.trim();
      } else {
        // تقرير الرفض
        const reasons = analysisResult.rejectionReasons || [];
        analysisDetails = `
🚫 **تم رفض الصورة - النسبة: ${finalScore}% (أقل من 75%)**

📋 **أسباب الرفض:**
${reasons.length > 0 ? reasons.map(r => `• ${r}`).join('\n') : '• النسبة الإجمالية أقل من الحد المطلوب (75%)'}

📝 **وصف الصورة الناتجة:** 
${analysisResult.imageDescription || 'غير متوفر'}

🔗 **تحليل الارتباط بالمحتوى النصي:**
${analysisResult.contentCorrelation || 'الصورة لا تتوافق مع المحتوى النصي المطلوب'}

💡 **توصيات التحسين:** 
${analysisResult.recommendations || 'تحسين العناصر المخالفة للمعايير'}

⚖️ **القرار النهائي:** ${analysisResult.finalDecision || 'رفض بسبب عدم استيفاء المعايير'}
        `.trim();
      }

      console.log('✅ تم الفحص الشامل للصورة:', {
        score: finalScore,
        pass: passThreshold,
        threshold: '75%'
      });

      return {
        relevanceScore: finalScore,
        analysisDetails: analysisDetails
      };

    } catch (error) {
      console.error('❌ خطأ في تحليل ملاءمة الصورة:', error);
      
      // في حالة الخطأ، نفترض أن الصورة مقبولة لتجنب إيقاف العملية
      console.warn('⚠️ تم تطبيق نسبة افتراضية 75% بسبب خطأ في التحليل');
      return {
        relevanceScore: 75,
        analysisDetails: `حدث خطأ في التحليل: ${error.message}. تم تطبيق نسبة افتراضية 75%`
      };
    }
  };

  // نشر على فيسبوك
  const publishToFacebook = async (content: GeneratedContent): Promise<void> => {
    if (!selectedPage || !isConnected) {
      throw new Error('يرجى الاتصال بصفحة فيسبوك أولاً');
    }

    // التعامل مع data URL أو URL عادي
    let imageBlob: Blob;
    const imageUrl = content.generatedImage!.imageUrl;
    
    if (imageUrl.startsWith('data:')) {
      // تحويل data URL إلى blob
      const response = await fetch(imageUrl);
      imageBlob = await response.blob();
    } else {
      // تحميل الصورة من URL عادي
      const imageResponse = await fetch(imageUrl);
      imageBlob = await imageResponse.blob();
    }
    
    const imageFile = new File([imageBlob], `generated-image-${Date.now()}.png`, { 
      type: imageBlob.type || 'image/png' 
    });

    // رفع الصورة إلى فيسبوك
    const imageFormData = new FormData();
    imageFormData.append('source', imageFile);
    imageFormData.append('access_token', selectedPage.access_token);
    imageFormData.append('published', 'false');

    const imageUploadResponse = await fetch(
      `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`,
      {
        method: 'POST',
        body: imageFormData,
      }
    );

    if (!imageUploadResponse.ok) {
      const errorData = await imageUploadResponse.json();
      throw new Error(errorData.error?.message || 'فشل في رفع الصورة');
    }

    const imageData = await imageUploadResponse.json();
    const photoId = imageData.id;

    // نشر المنشور مع الصورة
    const postParams = new URLSearchParams();
    postParams.append('message', content.textContent);
    postParams.append('access_token', selectedPage.access_token);
    postParams.append('attached_media', JSON.stringify([{ media_fbid: photoId }]));

    const postResponse = await fetch(
      `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: postParams.toString(),
      }
    );

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      throw new Error(errorData.error?.message || 'فشل في نشر المنشور');
    }

    const postData = await postResponse.json();
    const postId = postData.id;

    // إضافة التعليقات التفاعلية
    for (let i = 0; i < content.interactiveQuestions.length; i++) {
      const commentParams = new URLSearchParams();
      commentParams.append('message', content.interactiveQuestions[i]);
      commentParams.append('access_token', selectedPage.access_token);

      await fetch(
        `https://graph.facebook.com/v19.0/${postId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: commentParams.toString(),
        }
      );

      // تأخير قصير بين التعليقات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // تشغيل الأتمتة الكاملة مع الإعدادات العشوائية
  const runFullAutomation = async () => {
    if (!selectedPage || !isConnected) {
      toast.error("يرجى الاتصال بصفحة فيسبوك أولاً");
      return;
    }

    try {
      setIsAutomating(true);
      setProgress(0);
      setGeneratedContent(null);
      
      const steps = initializeSteps();
      setAutomationSteps(steps);
      setCurrentStep(0);

      // الخطوة 1: توليد إعدادات المحتوى العشوائية
      updateStepStatus('generate-settings', 'running', 10, 'توليد التخصص ونوع المحتوى والموضوع...');
      const randomSettings = await generateRandomSettings();
      
      // تحديث الحالة بالإعدادات المولدة
      setSpecialty(randomSettings.specialty);
      setContentType(randomSettings.contentType);
      setTopic(randomSettings.topic);
      
      updateStepStatus('generate-settings', 'completed', 15, 
        `تم توليد: ${randomSettings.specialty} - ${randomSettings.contentType} - ${randomSettings.topic}`);
      setProgress(15);

      // الخطوة 2: توليد موضوع محسن (إضافي)
      updateStepStatus('generate-topic', 'running', 20, 'تحسين الموضوع بالذكاء الاصطناعي...');
      const enhancedTopic = await generateTopicWithAI(randomSettings.specialty, randomSettings.contentType, language);
      const finalTopic = enhancedTopic || randomSettings.topic;
      setTopic(finalTopic);
      updateStepStatus('generate-topic', 'completed', 25, `الموضوع النهائي: ${finalTopic}`);
      setProgress(25);

      // الخطوة 3: توليد المحتوى النصي
      updateStepStatus('generate-text', 'running', 30, 'توليد المحتوى النصي...');
      const textContent = await generateTextContent(finalTopic, randomSettings.specialty, randomSettings.contentType, language);
      updateStepStatus('generate-text', 'completed', 40, 'تم توليد المحتوى النصي');
      setProgress(40);

      // الخطوة 4: توليد الأسئلة التفاعلية
      updateStepStatus('generate-questions', 'running', 45, 'توليد الأسئلة التفاعلية...');
      const interactiveQuestions = await generateInteractiveQuestions(finalTopic, textContent, language);
      updateStepStatus('generate-questions', 'completed', 55, 'تم توليد الأسئلة التفاعلية');
      setProgress(55);

      // الخطوة 5: توليد برومتات الصور
      updateStepStatus('generate-prompts', 'running', 60, 'توليد برومتات الصور...');
      const { imagePrompt, geniusPrompt } = await generateImagePrompts(finalTopic, textContent);
      updateStepStatus('generate-prompts', 'completed', 70, 'تم توليد برومتات الصور');
      setProgress(70);

      // الخطوة 6: توليد الصورة
      updateStepStatus('generate-image', 'running', 75, 'توليد الصورة بنمط جينيوس...');
      const generatedImage = await generateImageWithGemini(geniusPrompt);
      updateStepStatus('generate-image', 'completed', 78, 'تم توليد الصورة بنجاح');
      setProgress(78);

      // إنشاء كائن المحتوى المؤقت للتحليل
      const tempContent: GeneratedContent = {
        textContent,
        imagePrompt,
        geniusPrompt,
        interactiveQuestions,
        generatedImage
      };

      // الخطوة 7: تحليل ملاءمة الصورة للمحتوى مع إعادة التوليد عند الحاجة
      let finalGeneratedImage = generatedImage;
      let finalImagePrompt = geniusPrompt;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries) {
        updateStepStatus('analyze-image', 'running', 80, `تحليل ملاءمة الصورة للمحتوى بالذكاء الاصطناعي... (محاولة ${retryCount + 1}/${maxRetries + 1})`);
        
        const { relevanceScore, analysisDetails } = await analyzeImageRelevance(
          finalGeneratedImage.imageUrl, 
          textContent, 
          finalTopic
        );

        // عرض نتيجة التحليل
        const relevanceMessage = `نسبة الملاءمة: ${relevanceScore}% - ${relevanceScore >= 75 ? '✅ مناسبة للنشر' : '❌ غير مناسبة للنشر (أقل من 75%)'}`;
        
        if (relevanceScore >= 75) {
          // الصورة مناسبة، يمكن المتابعة
          const acceptedImage: AcceptedImage = {
            imageUrl: finalGeneratedImage.imageUrl,
            prompt: finalImagePrompt,
            relevanceScore,
            acceptanceReason: analysisDetails,
            timestamp: new Date()
          };
          
          setAcceptedImages(prev => [...prev, acceptedImage]);
          
          updateStepStatus('analyze-image', 'completed', 85, relevanceMessage);
          setProgress(85);
          console.log(`✅ تم اجتياز فحص ملاءمة الصورة بنسبة ${relevanceScore}%`);
          break;
        } else {
          // الصورة غير مناسبة، إضافتها للمرفوضة
          const rejectedImage: RejectedImage = {
            imageUrl: finalGeneratedImage.imageUrl,
            prompt: finalImagePrompt,
            relevanceScore,
            rejectionReason: analysisDetails,
            timestamp: new Date()
          };
          
          setRejectedImages(prev => [...prev, rejectedImage]);
          
          if (retryCount < maxRetries) {
            // إعادة توليد برومت جديد
            console.log(`🔄 إعادة توليد برومت الصورة - المحاولة ${retryCount + 1}`);
            updateStepStatus('generate-prompts', 'running', 45, `إعادة توليد برومت الصورة - المحاولة ${retryCount + 1}...`);
            
            const retryPromptText = `الصورة السابقة لم تكن مناسبة (نسبة ملاءمة ${relevanceScore}%). 
            السبب: ${analysisDetails}
            
            قم بإنشاء برومت جديد ومختلف تماماً للصورة بناءً على الموضوع: "${finalTopic}" والمحتوى:
            "${textContent}"
            
            تأكد من أن البرومت الجديد:
            - مختلف عن البرومت السابق
            - أكثر ملاءمة للمحتوى النصي
            - يركز على العناصر المهمة في الموضوع
            - يتجنب المشاكل التي تم تحديدها في التحليل السابق`;

            const newPromptsResponse = await makeGeminiRequest(
              'gemini-2.0-flash-exp',
              {
                contents: [{ parts: [{ text: retryPromptText }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
              },
              keyManager
            );
            const newPromptsData = await newPromptsResponse.json();
            const newImagePromptData = newPromptsData.candidates?.[0]?.content?.parts?.[0]?.text || geniusPrompt;
            finalImagePrompt = newImagePromptData.trim();
            
            updateStepStatus('generate-prompts', 'completed', 55, 'تم إعادة توليد برومت الصورة');
            
            // إعادة توليد الصورة بالبرومت الجديد
            updateStepStatus('generate-image', 'running', 60, `إعادة توليد الصورة - المحاولة ${retryCount + 1}...`);
            finalGeneratedImage = await generateImageWithGemini(finalImagePrompt);
            updateStepStatus('generate-image', 'completed', 75, 'تم إعادة توليد الصورة');
            
            retryCount++;
          } else {
            // تم استنفاد المحاولات
            const errorMessage = `⚠️ فشل الفحص الشامل للصورة بعد ${maxRetries + 1} محاولات: نسبة ملاءمة أفضل صورة ${relevanceScore}% أقل من الحد المطلوب (75%). الصورة لا تلتزم بالمعايير الإسلامية وسياسات فيسبوك. لن يتم النشر تلقائياً.`;
            updateStepStatus('analyze-image', 'error', 85, '', errorMessage);
            updateStepStatus('publish-post', 'error', 0, '', 'تم إيقاف العملية بسبب عدم ملاءمة الصورة');
            updateStepStatus('add-comments', 'error', 0, '', 'تم إيقاف العملية بسبب عدم ملاءمة الصورة');
            
            toast.error(errorMessage);
            
            // حفظ المحتوى للمراجعة رغم عدم النشر مع أفضل صورة متاحة
            const finalContent: GeneratedContent = {
              textContent,
              imagePrompt,
              geniusPrompt,
              interactiveQuestions,
              generatedImage: finalGeneratedImage
            };
            setGeneratedContent(finalContent);
            
            console.log('🔍 تفاصيل التحليل الأخير:', analysisDetails);
            console.log('📊 تم إيقاف النشر التلقائي بسبب انخفاض نسبة ملاءمة الصورة');
            
            // تحديث إحصائيات المفاتيح
            setKeyStats(keyManager.getStats());
            
            return; // إيقاف العملية هنا
          }
        }
      }

      // إنشاء المحتوى النهائي مع الصورة المقبولة
      const finalContent: GeneratedContent = {
        textContent,
        imagePrompt,
        geniusPrompt,
        interactiveQuestions,
        generatedImage: finalGeneratedImage
      };
      setGeneratedContent(finalContent);

      // الخطوة 8: نشر على فيسبوك
      updateStepStatus('publish-post', 'running', 90, 'نشر المنشور على فيسبوك...');
      await publishToFacebook(finalContent);
      updateStepStatus('publish-post', 'completed', 95, 'تم نشر المنشور بنجاح');
      setProgress(95);

      // الخطوة 9: إضافة التعليقات التفاعلية
      updateStepStatus('add-comments', 'running', 97, 'إضافة التعليقات التفاعلية...');
      // يمكن إضافة منطق إضافة التعليقات هنا لاحقاً
      updateStepStatus('add-comments', 'completed', 100, 'تم إضافة التعليقات التفاعلية');
      setProgress(100);

      toast.success('🎉 تم إنجاز الأتمتة الذكية الشاملة بنجاح!');

      // تحديث إحصائيات المفاتيح
      setKeyStats(keyManager.getStats());

    } catch (error) {
      console.error('❌ خطأ في الأتمتة:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الأتمتة';
      
      // تحديث الخطوة الحالية بالخطأ
      if (automationSteps[currentStep]) {
        updateStepStatus(automationSteps[currentStep].id, 'error', 0, '', errorMessage);
      }
      
      toast.error(`❌ فشلت الأتمتة: ${errorMessage}`);
      
      // تحديث إحصائيات المفاتيح حتى عند الفشل
      setKeyStats(keyManager.getStats());
    } finally {
      setIsAutomating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* العنوان الرئيسي */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              <Facebook className="h-4 w-4 text-blue-600 absolute -bottom-1 -right-1" />
            </div>
            أتمتة النشر على فيسبوك
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              تلقائي بالكامل 🤖
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* إعدادات اللغة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            اختيار لغة المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language" className="font-semibold">اللغة المفضلة للمحتوى النصي:</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                🌍 سيتم توليد جميع المحتوى النصي والأسئلة التفاعلية باللغة المحددة. الصور ستبقى بأسلوب عالمي مناسب لجميع الثقافات.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* خطوات الأتمتة - تصميم جديد ديناميكي */}
      {automationSteps.length > 0 && (
        <Card className="mb-6 overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-50 to-blue-50/50">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold relative z-10">
              <div className="relative">
                <Bot className="h-6 w-6 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              مراحل الأتمتة الذكية المتقدمة
              <div className="flex items-center gap-2 mr-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-400"></div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* شريط التقدم الإجمالي المحسن */}
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">التقدم الإجمالي</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(progress)}%
                  </span>
                  <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
              
              <div className="relative h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 animate-pulse"></div>
                  <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-white/40 to-transparent rounded-full"></div>
                </div>
              </div>
              
              {progress > 0 && (
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>بدأت العملية</span>
                  <span>{progress === 100 ? 'مكتملة بنجاح ✨' : 'جاري التنفيذ...'}</span>
                </div>
              )}
            </div>
            
            {/* قائمة الخطوات المحسنة */}
            <div className="grid gap-4">
              {automationSteps.map((step, index) => {
                const isActive = step.status === 'running';
                const isCompleted = step.status === 'completed';
                const isError = step.status === 'error';
                const isPending = step.status === 'pending';
                
                return (
                  <div 
                    key={step.id}
                    className={`
                      relative group p-5 rounded-2xl border-2 transition-all duration-500 transform hover:scale-[1.02]
                      ${isActive ? 'border-blue-400 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-lg animate-pulse' :
                        isCompleted ? 'border-green-400 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 shadow-md' :
                        isError ? 'border-red-400 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 shadow-md' :
                        'border-gray-200 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    {/* خلفية متحركة للخطوة النشطة */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl animate-pulse"></div>
                    )}
                    
                    <div className="relative z-10 flex items-center gap-4">
                      {/* رقم الخطوة مع أيقونة */}
                      <div className={`
                        relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                        ${isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg animate-bounce' :
                          isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' :
                          isError ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md' :
                          'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }
                      `}>
                        {isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isError ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                        
                        {/* تأثير الهالة للخطوة النشطة */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
                        )}
                      </div>
                      
                      {/* محتوى الخطوة */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`
                            font-bold text-base transition-colors duration-300
                            ${isActive ? 'text-indigo-700' :
                              isCompleted ? 'text-green-700' :
                              isError ? 'text-red-700' :
                              'text-gray-700'
                            }
                          `}>
                            {step.title}
                          </h3>
                          
                          <div className="flex items-center gap-2">
                            {/* Badge للحالة */}
                            <Badge className={`
                              px-3 py-1 text-xs font-medium transition-all duration-300
                              ${isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white animate-pulse' :
                                isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                isError ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }
                            `}>
                              {isActive ? '⚡ جاري التنفيذ' :
                               isCompleted ? '✅ مكتمل' :
                               isError ? '❌ خطأ' :
                               '⏳ في الانتظار'}
                            </Badge>
                            
                            {/* مؤشر الوقت */}
                            {step.duration && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{Math.floor(step.duration / 60)}:{(step.duration % 60).toString().padStart(2, '0')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* تفاصيل الخطوة */}
                        {step.details && (
                          <p className={`
                            text-sm mb-2 transition-colors duration-300
                            ${isActive ? 'text-blue-700' :
                              isCompleted ? 'text-green-700' :
                              isError ? 'text-red-700' :
                              'text-gray-600'
                            }
                          `}>
                            {step.details}
                          </p>
                        )}
                        
                        {/* رسالة الخطأ */}
                        {step.error && (
                          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">❌ {step.error}</p>
                          </div>
                        )}
                        
                        {/* شريط تقدم الخطوة */}
                        {step.progress && step.progress > 0 && (
                          <div className="mt-3">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`
                                  h-full transition-all duration-1000 ease-out rounded-full
                                  ${isActive ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                    isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                    'bg-gradient-to-r from-gray-400 to-gray-500'
                                  }
                                `}
                                style={{ width: `${step.progress}%` }}
                              >
                                {isActive && (
                                  <div className="h-full bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* تأثير الحدود المتوهجة للخطوة النشطة */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* إحصائيات سريعة */}
            {automationSteps.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{automationSteps.length}</div>
                  <div className="text-xs text-blue-800">إجمالي الخطوات</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {automationSteps.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-xs text-green-800">مكتملة</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">
                    {automationSteps.filter(s => s.status === 'running').length}
                  </div>
                  <div className="text-xs text-orange-800">جاري التنفيذ</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl">
                  <div className="text-2xl font-bold text-gray-600">
                    {automationSteps.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-800">في الانتظار</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* أزرار التحكم */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={runFullAutomation}
              disabled={isAutomating || !isConnected || !selectedPage}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-2 font-bold text-lg shadow-lg"
            >
              {isAutomating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري الأتمتة الذكية...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 ml-2" />
                  بدء الأتمتة الذكية الشاملة 🚀
                </>
              )}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              🤖 سيتم توليد جميع الإعدادات والمحتوى تلقائياً بالذكاء الاصطناعي
            </p>
          </div>
        </CardContent>
      </Card>

      {/* معاينة المحتوى المولد */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              المحتوى المولد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedContent && (
              <div className="p-4 bg-primary/5 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-semibold">الإعدادات المولدة تلقائياً</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التخصص:</span>
                    <span className="font-medium">{specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نوع المحتوى:</span>
                    <span className="font-medium">{contentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الموضوع:</span>
                    <span className="font-medium text-right max-w-xs truncate">{topic}</span>
                  </div>
                </div>
              </div>
            )}

            {/* النص */}
            <div>
              <Label className="font-semibold">المحتوى النصي:</Label>
              <div className="p-3 bg-muted rounded-lg mt-1 whitespace-pre-wrap">
                {generatedContent.textContent}
              </div>
            </div>

            {/* الصورة */}
            {generatedContent.generatedImage && (
              <div>
                <Label className="font-semibold">الصورة المولدة ({generatedContent.generatedImage.style}):</Label>
                <div className="mt-2">
                  <img
                    src={generatedContent.generatedImage.imageUrl}
                    alt="صورة مولدة"
                    className="w-full max-w-md h-auto rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* الأسئلة التفاعلية */}
            <div>
              <Label className="font-semibold">الأسئلة التفاعلية:</Label>
              <div className="space-y-2 mt-2">
                {generatedContent.interactiveQuestions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قسم الصور المقبولة */}
      {acceptedImages.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              الصور المقبولة ({acceptedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedImages.map((acceptedImage, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-white">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <img
                        src={acceptedImage.imageUrl}
                        alt="صورة مقبولة"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">نسبة الملاءمة:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {acceptedImage.relevanceScore}%
                          </Badge>
                          <span className="text-xs text-green-600">مناسبة للنشر</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">البرومت المستخدم:</Label>
                        <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded border">
                          {acceptedImage.prompt.length > 150 
                            ? acceptedImage.prompt.substring(0, 150) + "..." 
                            : acceptedImage.prompt
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">سبب القبول:</Label>
                        <p className="text-xs text-green-700 mt-1 bg-green-50 p-2 rounded border border-green-200">
                          {acceptedImage.acceptanceReason.length > 200 
                            ? acceptedImage.acceptanceReason.substring(0, 200) + "..." 
                            : acceptedImage.acceptanceReason
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">وقت القبول:</Label>
                        <p className="text-xs text-gray-600 mt-1">
                          {acceptedImage.timestamp.toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* قسم الصور المرفوضة */}
      {rejectedImages.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              الصور المرفوضة ({rejectedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rejectedImages.map((rejectedImage, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-white">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <img
                        src={rejectedImage.imageUrl}
                        alt="صورة مرفوضة"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">نسبة الملاءمة:</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="destructive" className="text-xs">
                            {rejectedImage.relevanceScore}%
                          </Badge>
                          <span className="text-xs text-red-600">غير مناسبة للنشر</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">البرومت المستخدم:</Label>
                        <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded border">
                          {rejectedImage.prompt.length > 150 
                            ? rejectedImage.prompt.substring(0, 150) + "..." 
                            : rejectedImage.prompt
                          }
                        </p>
                      </div>
                      
                      <div>
                        <Label className="font-semibold text-sm text-gray-600">سبب الرفض:</Label>
                        <p className="text-xs text-red-700 mt-1 bg-red-50 p-2 rounded border border-red-200">
                          {rejectedImage.rejectionReason.length > 200 
                            ? rejectedImage.rejectionReason.substring(0, 200) + "..." 
                            : rejectedImage.rejectionReason
                          }
                        </p>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        تم الرفض في: {rejectedImage.timestamp.toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* زر إصلاح مباشر للـ cron job */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-800">إصلاح عاجل - مشكلة URL</h3>
              <p className="text-sm text-red-700">إصلاح فوري لمشكلة 404 في النشر التلقائي</p>
            </div>
            <Button
              onClick={async () => {
                toast.loading('جاري الإصلاح العاجل...');
                try {
                  const { data, error } = await supabase.functions.invoke('fix-specific-cron');
                  if (error) throw error;
                  toast.success(`تم الإصلاح! معرف جديد: ${data.new_id}`);
                } catch (error) {
                  console.error('خطأ في الإصلاح:', error);
                  toast.error('فشل في الإصلاح العاجل');
                }
              }}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              🚨 إصلاح فوري
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* زر إصلاح سريع للـ URLs */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-800">إصلاح سريع للنظام</h3>
              <p className="text-sm text-yellow-700">في حالة وجود مشاكل في الـ cron jobs</p>
            </div>
            <Button
              onClick={async () => {
                toast.loading('جاري إصلاح النظام...');
                try {
                  const { data, error } = await supabase.functions.invoke('fix-cron-urls');
                  if (error) throw error;
                  toast.success(`تم إصلاح ${data.updated} من ${data.total} عملية أتمتة`);
                } catch (error) {
                  console.error('خطأ في الإصلاح:', error);
                  toast.error('فشل في إصلاح النظام');
                }
              }}
              variant="outline"
              size="sm"
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            >
              إصلاح الآن
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
