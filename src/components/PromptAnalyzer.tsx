import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Loader2, Lightbulb, Copy, RefreshCw, Brain, Sparkles, Zap, TrendingUp, Eye, CheckCircle, Star } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VariableOption {
  value: string;
  label: string;
  description: string;
}

interface Variable {
  name: string;
  type: string;
  description: string;
  options: VariableOption[];
}

interface AnalysisResult {
  variables: Variable[];
  suggestions: string[];
  enhanced_prompt: string;
}

const PromptAnalyzer = () => {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نص البرومت أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-analyzer', {
        body: { prompt }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      toast({
        title: "تم التحليل بنجاح",
        description: `تم استخراج ${data.variables?.length || 0} متغير من البرومت`
      });
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      toast({
        title: "خطأ في التحليل",
        description: "حدث خطأ أثناء تحليل البرومت",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة"
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      color: 'bg-primary/10 text-primary border-primary/20',
      shape: 'bg-secondary/10 text-secondary border-secondary/20',
      size: 'bg-accent/10 text-accent border-accent/20',
      position: 'bg-primary-glow/10 text-primary-glow border-primary-glow/20',
      font: 'bg-secondary/15 text-secondary border-secondary/25',
      style: 'bg-accent/15 text-accent border-accent/25',
      default: 'bg-muted/50 text-muted-foreground border-muted/30'
    };
    return colors[type] || colors.default;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      color: Sparkles,
      shape: Brain,
      size: TrendingUp,
      position: Eye,
      font: Zap,
      style: Star,
      default: CheckCircle
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="min-h-screen bg-neural-pattern relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-neural opacity-10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-secondary/10 rounded-full blur-xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-8 space-y-12">
        {/* Hero Header Section */}
        <div className="text-center space-y-8 py-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-30 rounded-full scale-150"></div>
            <div className="relative flex items-center justify-center gap-6">
              <div className="ai-node">
                <div className="relative">
                  <Brain className="h-16 w-16 text-primary animate-brain-pulse drop-shadow-2xl" />
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse-slow"></div>
                  <div className="absolute -inset-2 border border-primary/30 rounded-full animate-neural-glow"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-6xl font-black bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
                  محلل البرومت الذكي
                </h1>
                <div className="h-1.5 w-32 bg-gradient-primary mx-auto rounded-full shadow-glow"></div>
              </div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-xl text-muted-foreground leading-relaxed">
              قوة الذكاء الاصطناعي لتحليل وتحسين النصوص وتحويلها إلى محتوى احترافي
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>تحليل متقدم</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <span>نتائج فورية</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span>تحسين احترافي</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Input Section */}
        <Card className="relative glass-effect border-primary/30 shadow-glow overflow-hidden group hover:shadow-neural transition-all duration-500">
          <div className="absolute inset-0 holographic opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-60"></div>
          
          <CardHeader className="relative pb-4">
            <CardTitle className="flex items-center gap-4 text-primary text-2xl">
              <div className="ai-node">
                <div className="relative">
                  <Lightbulb className="h-8 w-8 animate-brain-pulse" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse-slow"></div>
                </div>
              </div>
              <span className="bg-gradient-primary bg-clip-text text-transparent font-bold">
                محطة التحليل الذكي
              </span>
              <div className="flex-1"></div>
              <Badge className="bg-primary/10 text-primary border-primary/30 animate-neural-glow">
                <Brain className="h-4 w-4 ml-1" />
                AI محسن
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <label className="text-lg font-medium text-foreground">
                  أدخل النص للتحليل والتحسين بالذكاء الاصطناعي
                </label>
                <div className="flex-1 h-px bg-gradient-to-l from-primary/50 to-transparent"></div>
              </div>
              
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثال: صمم شعار حديث وعصري للشركة التقنية الناشئة، يتضمن ألوان زاهية وخط أنيق مع عناصر تعبر عن الابتكار والتكنولوجيا..."
                  className="min-h-[160px] bg-card/50 border-primary/40 focus:border-primary/70 transition-all duration-300 text-lg leading-relaxed rounded-xl resize-none shadow-inner"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{prompt.length} حرف</span>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span className="text-primary font-medium">جاهز للتحليل</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Button 
                onClick={analyzePrompt}
                disabled={isAnalyzing || !prompt.trim()}
                className="w-full h-16 text-xl font-bold bg-gradient-primary hover:scale-[1.02] hover:shadow-glow transition-all duration-300 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <div className="absolute inset-0 border-2 border-current border-t-transparent rounded-full animate-spin opacity-30"></div>
                    </div>
                    <span className="text-lg">جاري التحليل بالذكاء الاصطناعي</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Brain className="h-6 w-6 animate-pulse" />
                    <span>تحليل وتحسين البرومت</span>
                    <Sparkles className="h-6 w-6 animate-pulse" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-ping"></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-1 bg-current rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

      {analysis && (
        <div className="space-y-12 animate-data-flow">
          
          {/* Advanced Results Header */}
          <div className="relative text-center space-y-6 py-8">
            <div className="absolute inset-0 bg-gradient-glow opacity-20 rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="ai-node">
                  <CheckCircle className="h-12 w-12 text-accent animate-pulse drop-shadow-xl" />
                </div>
                <h2 className="text-4xl font-black bg-gradient-neural bg-clip-text text-transparent">
                  نتائج التحليل المتقدم
                </h2>
                <div className="ai-node">
                  <Sparkles className="h-10 w-10 text-primary animate-brain-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
                  <Brain className="h-4 w-4 text-accent" />
                  <span className="text-accent font-medium">تحليل ذكي</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">نتائج دقيقة</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-secondary/30">
                  <Star className="h-4 w-4 text-secondary" />
                  <span className="text-secondary font-medium">تحسين احترافي</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Prompt */}
          {analysis.enhanced_prompt && (
            <Card className="glass-effect border-accent/30 shadow-neural overflow-hidden group hover:shadow-glow transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-neural opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-accent">
                  <div className="ai-node">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  البرومت المحسن
                  <Badge className="bg-accent/10 text-accent border-accent/30">
                    محسن بالذكاء الاصطناعي
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="relative group">
                  <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-accent/20 text-lg leading-relaxed circuit-pattern">
                    {analysis.enhanced_prompt}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-3 left-3 bg-accent/10 border-accent/30 hover:bg-accent/20 transition-all duration-300"
                    onClick={() => copyToClipboard(analysis.enhanced_prompt)}
                  >
                    <Copy className="h-4 w-4 text-accent" />
                    <span className="mr-2 text-accent">نسخ</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variables */}
          {analysis.variables && analysis.variables.length > 0 && (
            <Card className="glass-effect border-primary/30 shadow-glow overflow-hidden">
              <div className="absolute inset-0 holographic opacity-20"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-primary">
                  <div className="ai-node">
                    <Brain className="h-6 w-6" />
                  </div>
                  المتغيرات المستخرجة
                  <Badge className="bg-primary/10 text-primary border-primary/30 animate-pulse-slow">
                    {analysis.variables.length} متغير
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <Accordion type="multiple" className="w-full space-y-4">
                  {analysis.variables.map((variable, index) => {
                    const TypeIcon = getTypeIcon(variable.type);
                    return (
                      <AccordionItem 
                        key={index} 
                        value={`variable-${index}`}
                        className="border border-muted/30 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:bg-muted/20 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="ai-node">
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg">{variable.name}</span>
                            <Badge className={`${getTypeColor(variable.type)} border animate-neural-glow`}>
                              <TypeIcon className="h-3 w-3 ml-1" />
                              {variable.type}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-6">
                            <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                              <p className="text-muted-foreground leading-relaxed">
                                {variable.description}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-accent" />
                                الخيارات المتاحة ({variable.options?.length || 0})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {variable.options?.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="group border border-muted/40 rounded-xl p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                                    onClick={() => copyToClipboard(option.value)}
                                  >
                                    <div className="font-semibold text-base mb-2 text-foreground group-hover:text-primary transition-colors">
                                      {option.label}
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                      {option.description}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded text-primary border border-primary/20">
                                        {option.value}
                                      </code>
                                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                  </div>
                                )) || (
                                  <div className="text-muted-foreground col-span-2 text-center p-8 border border-dashed border-muted/40 rounded-xl">
                                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>لا توجد خيارات متاحة</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <Card className="glass-effect border-secondary/30 shadow-elegant overflow-hidden">
              <div className="absolute inset-0 bg-gradient-neural opacity-10"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-secondary">
                  <div className="ai-node">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  اقتراحات للتحسين
                  <Badge className="bg-secondary/10 text-secondary border-secondary/30">
                    {analysis.suggestions.length} اقتراح
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid gap-4">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="group flex items-start gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-secondary/20 hover:border-secondary/40 hover:bg-secondary/5 transition-all duration-300 hover:scale-[1.01]"
                    >
                      <div className="ai-node flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-base leading-relaxed group-hover:text-secondary transition-colors">
                        {suggestion}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                        onClick={() => copyToClipboard(suggestion)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default PromptAnalyzer;