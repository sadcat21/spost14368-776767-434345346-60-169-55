import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles, 
  Image, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Zap,
  Brain,
  Wand2,
  Star,
  Clock,
  Play,
  Pause,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Copy,
  Download,
  FileText,
  ImageIcon,
  Code
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface AutomationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'error';
  duration?: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  result?: {
    type: 'text' | 'image' | 'json' | 'html';
    content: string;
    metadata?: Record<string, any>;
    preview?: string;
  };
}

interface AutomationProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  steps: AutomationStep[];
  currentStep: number;
  isRunning: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  totalDuration?: number;
  elapsedTime?: number;
}

export const AutomationProgressDialog: React.FC<AutomationProgressDialogProps> = ({
  isOpen,
  onClose,
  steps,
  currentStep,
  isRunning,
  onPause,
  onResume,
  onCancel,
  totalDuration = 0,
  elapsedTime = 0
}) => {
  const [localElapsedTime, setLocalElapsedTime] = useState(elapsedTime);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setLocalElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  useEffect(() => {
    setLocalElapsedTime(elapsedTime);
  }, [elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepStatusIcon = (step: AutomationStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    } else if (step.status === 'running') {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />;
    }
  };

  const getStepStatusColor = (step: AutomationStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50';
      case 'running':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 ring-2 ring-blue-400';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50';
    }
  };

  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const toggleResultExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedResults(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('تم نسخ النتيجة إلى الحافظة!');
    });
  };

  const downloadResult = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل النتيجة بنجاح!');
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      case 'json':
        return <Code className="h-4 w-4 text-purple-600" />;
      case 'html':
        return <Code className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
        
        <DialogHeader className="text-center relative z-10 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-3 rounded-full">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-3 mb-2">
            <Zap className="h-7 w-7 text-purple-600 animate-pulse" />
            تنفيذ الأوتوماشن الذكي
            <Star className="h-7 w-7 text-cyan-600 animate-pulse" />
          </DialogTitle>
          
          <div className="bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <p className="text-muted-foreground font-medium">
              🤖 يتم تنفيذ جميع الخطوات تلقائياً بواسطة الذكاء الاصطناعي
            </p>
          </div>
        </DialogHeader>

        {/* شريط التقدم الإجمالي */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                التقدم الإجمالي
              </span>
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                {completedSteps} / {totalSteps}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(localElapsedTime)}</span>
              {totalDuration > 0 && (
                <span className="text-slate-400">/ {formatTime(totalDuration)}</span>
              )}
            </div>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {Math.round(progressPercentage)}%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3 justify-center mb-6 relative z-10">
          {isRunning ? (
            <Button
              onClick={onPause}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 hover:border-orange-400"
            >
              <Pause className="h-4 w-4 mr-2 text-orange-600" />
              إيقاف مؤقت
            </Button>
          ) : (
            <Button
              onClick={onResume}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-300 hover:border-emerald-400"
            >
              <Play className="h-4 w-4 mr-2 text-emerald-600" />
              استئناف
            </Button>
          )}
          
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-300 hover:border-slate-400"
          >
            <X className="h-4 w-4 mr-2 text-slate-600" />
            إلغاء
          </Button>
        </div>

        {/* قائمة الخطوات */}
        <div className="space-y-4 relative z-10">
          {steps.map((step, index) => (
            <Card 
              key={step.id}
              className={`transition-all duration-500 ${getStepStatusColor(step)} ${
                step.status === 'running' ? 'shadow-xl scale-[1.02]' : 'hover:shadow-lg'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* رقم الخطوة والأيقونة */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.status === 'completed' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                        : step.status === 'error'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        : step.status === 'running'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white animate-pulse'
                        : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`p-2 rounded-lg ${
                      step.status === 'completed' 
                        ? 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30'
                        : step.status === 'error'
                        ? 'bg-gradient-to-br from-red-100 to-red-100 dark:from-red-900/30 dark:to-red-900/30'
                        : step.status === 'running'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30'
                        : 'bg-gradient-to-br from-slate-100 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/50'
                    }`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* محتوى الخطوة */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                        {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStepStatusIcon(step, index)}
                        {step.status === 'completed' && step.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {formatTime(step.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-2">
                      {step.description}
                    </p>

                    {step.status === 'error' && step.error && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          ❌ {step.error}
                        </p>
                      </div>
                    )}

                    {step.status === 'running' && (
                      <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>جاري التنفيذ...</span>
                        </div>
                      </div>
                    )}

                    {/* عرض النتائج للخطوات المكتملة */}
                    {step.status === 'completed' && step.result && (
                      <div className="mt-3">
                        <Collapsible>
                          <CollapsibleTrigger
                            onClick={() => toggleResultExpanded(step.id)}
                            className="w-full bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/40 dark:hover:to-green-900/40 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getResultTypeIcon(step.result.type)}
                                <span className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">
                                  عرض النتيجة
                                </span>
                                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                  {step.result.type.toUpperCase()}
                                </Badge>
                              </div>
                              {expandedResults.has(step.id) ? (
                                <ChevronUp className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="mt-2">
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 space-y-3">
                              
                              {/* معاينة النتيجة */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    المعاينة
                                  </h4>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(step.result!.content)}
                                      className="h-8 px-2"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadResult(
                                        step.result!.content,
                                        `result-${step.id}.${step.result!.type === 'json' ? 'json' : 'txt'}`,
                                        step.result!.type === 'json' ? 'application/json' : 'text/plain'
                                      )}
                                      className="h-8 px-2"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                 
                                {step.result.type === 'image' ? (
                                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <img 
                                      src={step.result.content} 
                                      alt="نتيجة الخطوة"
                                      className="max-w-full h-auto rounded-lg shadow-sm max-h-48 mx-auto"
                                    />
                                    <div className="mt-2 text-center">
                                      <a 
                                        href={step.result.content} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                                      >
                                        فتح الصورة في نافذة جديدة
                                      </a>
                                    </div>
                                  </div>
                                ) : step.result.type === 'html' ? (
                                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                    <div 
                                      dangerouslySetInnerHTML={{ __html: step.result.preview || step.result.content }}
                                      className="prose dark:prose-invert max-w-none text-sm"
                                    />
                                  </div>
                                ) : (
                                  <Textarea
                                    readOnly
                                    value={step.result.preview || step.result.content}
                                    className="min-h-[120px] bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-sm font-mono"
                                    dir={step.result.content?.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr'}
                                  />
                                )}
                              </div>

                              {/* معلومات إضافية */}
                              {step.result.metadata && Object.keys(step.result.metadata).length > 0 && (
                                <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                                  <h5 className="font-medium text-slate-600 dark:text-slate-300 text-sm mb-2">
                                    معلومات إضافية:
                                  </h5>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(step.result.metadata).map(([key, value]) => (
                                      <div key={key} className="bg-slate-100 dark:bg-slate-600 rounded px-2 py-1">
                                        <span className="font-medium text-slate-600 dark:text-slate-300">{key}:</span>{' '}
                                        <span className="text-slate-500 dark:text-slate-400">
                                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mt-6 overflow-hidden group">
          <div className="flex items-start gap-3 relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="text-sm flex-1">
              <p className="font-bold mb-2 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                ملاحظات:
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                <li>• العملية تتم بشكل تلقائي دون تدخل</li>
                <li>• يمكنك إيقاف أو استئناف العملية في أي وقت</li>
                <li>• سيتم حفظ النتائج تلقائياً عند الانتهاء</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};