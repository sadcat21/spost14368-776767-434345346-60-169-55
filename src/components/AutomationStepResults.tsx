import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  FileText, 
  Brain, 
  Wand2, 
  Target, 
  MessageSquare,
  Image as ImageIcon,
  Copy,
  Download,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface StepResultsProps {
  stepId: string;
  stepTitle: string;
  stepResults: {
    data?: any;
    preview?: string;
    summary?: string;
  };
}

export function AutomationStepResults({ stepId, stepTitle, stepResults }: StepResultsProps) {
  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'image_analysis': return <Eye className="h-4 w-4 text-green-600" />;
      case 'content_generation': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'edit_prompt': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'image_editing': return <Wand2 className="h-4 w-4 text-pink-600" />;
      case 'quality_check': return <Target className="h-4 w-4 text-orange-600" />;
      case 'interactive_questions': return <MessageSquare className="h-4 w-4 text-cyan-600" />;
      default: return <ImageIcon className="h-4 w-4 text-slate-600" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ المحتوى!');
  };

  const downloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم بدء تحميل الصورة!');
  };

  return (
    <Card className="mt-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStepIcon(stepId)}
          <span>نتيجة: {stepTitle}</span>
          <Badge variant="secondary" className="mr-auto text-xs">
            {stepResults.summary}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* نتائج تحليل الصورة */}
        {stepId === 'image_analysis' && stepResults.data && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">الفئة:</p>
                <Badge variant="outline">{stepResults.data.category}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">درجة الثقة:</p>
                <Badge className="bg-green-100 text-green-800">
                  {stepResults.data.confidence}%
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">الوصف:</p>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <p className="text-sm">{stepResults.data.description}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">الكلمات المفتاحية:</p>
              <div className="flex flex-wrap gap-1">
                {stepResults.data.keywords?.map((keyword: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {stepResults.preview && (
              <div className="space-y-2">
                <p className="text-sm font-medium">الصورة المحللة:</p>
                <div className="relative">
                  <img 
                    src={stepResults.preview} 
                    alt="الصورة المحللة" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadImage(stepResults.preview!, `analyzed-image-${Date.now()}.jpg`)}
                    className="absolute top-2 right-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* نتائج توليد المحتوى */}
        {stepId === 'content_generation' && stepResults.data && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">المحتوى التسويقي المولد:</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(stepResults.data.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border">
                <p className="text-sm leading-relaxed">{stepResults.data.content}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                عدد الأحرف: {stepResults.data.content?.length || 0}
              </div>
            </div>
          </div>
        )}

        {/* نتائج برومبت التعديل */}
        {stepId === 'edit_prompt' && stepResults.data && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">برومبت تعديل الصورة:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(stepResults.data.editPrompt)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border max-h-48 overflow-y-auto">
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                  {stepResults.data.editPrompt}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* نتائج تعديل الصورة */}
        {stepId === 'image_editing' && stepResults.preview && (
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">الصورة بعد التعديل:</p>
              <div className="relative">
                <img 
                  src={stepResults.preview} 
                  alt="الصورة المعدلة" 
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadImage(stepResults.preview!, `edited-image-${Date.now()}.jpg`)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(stepResults.preview!, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نتائج فحص الجودة */}
        {stepId === 'quality_check' && stepResults.data && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">درجة التطابق:</p>
                <Badge className={`${
                  stepResults.data.matchScore >= 80 
                    ? 'bg-green-100 text-green-800' 
                    : stepResults.data.matchScore >= 60 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stepResults.data.matchScore}%
                </Badge>
              </div>
              {stepResults.data.assessment && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">التقييم:</p>
                  <p className="text-xs text-muted-foreground">
                    {stepResults.data.assessment}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* نتائج الأسئلة التفاعلية */}
        {stepId === 'interactive_questions' && stepResults.data?.questions && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">الأسئلة التفاعلية:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(stepResults.data.questions.join('\n'))}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {stepResults.data.questions.map((question: string, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-3 border">
                    <p className="text-sm">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}