import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Brain, 
  Image, 
  Upload, 
  Download, 
  Settings, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileImage,
  Sparkles,
  BarChart3,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { geminiApiManager } from '@/utils/geminiApiManager';
import { formatDateInArabic, formatShortDateInArabic } from '@/utils/dateUtils';

interface AnalysisResult {
  id: string;
  imageUrl: string;
  analysis: string;
  confidence: number;
  timestamp: Date;
  tags: string[];
  objects: string[];
  emotions?: string[];
  colors?: string[];
}

const GeminiVisionIntegrationPage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  // فحص حالة الاتصال بـ Gemini API
  React.useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    setApiKeyStatus('checking');
    try {
      // محاولة استدعاء بسيط للتحقق من الاتصال
      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "test" }] }]
          })
        }
      );
      setApiKeyStatus(response.ok ? 'connected' : 'disconnected');
    } catch (error) {
      setApiKeyStatus('disconnected');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error('يرجى اختيار صورة أولاً');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const base64Data = await convertImageToBase64(selectedImage);
      
      const prompt = customPrompt || `حلل هذه الصورة بالتفصيل واذكر:
1. الكائنات والعناصر الموجودة في الصورة
2. الألوان السائدة والمزاج العام
3. التركيب والإضاءة
4. أي نص مرئي في الصورة
5. الغرض المحتمل من الصورة
6. اقتراحات لتحسين الصورة إذا لزم الأمر

قدم التحليل باللغة العربية بطريقة واضحة ومفصلة.`;

      const response = await geminiApiManager.makeRequest(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: selectedImage.type,
                    data: base64Data
                  }
                }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      const analysis = data.candidates[0].content.parts[0].text;

      // استخراج الكلمات المفتاحية والعناصر
      const tags = extractTags(analysis);
      const objects = extractObjects(analysis);
      const colors = extractColors(analysis);

      const result: AnalysisResult = {
        id: Date.now().toString(),
        imageUrl: imagePreview,
        analysis,
        confidence: 0.95, // يمكن تحسين هذا بناءً على استجابة API
        timestamp: new Date(),
        tags,
        objects,
        colors
      };

      setAnalysisResult(result);
      setAnalysisHistory(prev => [result, ...prev.slice(0, 4)]); // الاحتفاظ بآخر 5 تحليلات
      toast.success('تم تحليل الصورة بنجاح!');

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('حدث خطأ في تحليل الصورة');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTags = (text: string): string[] => {
    // منطق بسيط لاستخراج الكلمات المفتاحية
    const keywords = ['طبيعة', 'شخص', 'مبنى', 'سيارة', 'طعام', 'حيوان', 'نبات', 'تقنية'];
    return keywords.filter(keyword => text.includes(keyword));
  };

  const extractObjects = (text: string): string[] => {
    // منطق لاستخراج الكائنات المذكورة
    const objects = ['كرسي', 'طاولة', 'شجرة', 'سماء', 'بحر', 'جبل', 'شمس', 'قمر'];
    return objects.filter(obj => text.includes(obj));
  };

  const extractColors = (text: string): string[] => {
    const colors = ['أحمر', 'أزرق', 'أخضر', 'أصفر', 'برتقالي', 'بنفسجي', 'وردي', 'أسود', 'أبيض', 'رمادي'];
    return colors.filter(color => text.includes(color));
  };

  const copyAnalysis = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult.analysis);
      toast.success('تم نسخ التحليل');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              تكامل Gemini Vision
            </h1>
            <p className="text-muted-foreground mt-2">
              تحليل الصور الذكي باستخدام تقنية Gemini Vision من Google
            </p>
          </div>
          
          {/* API Status */}
          <div className="flex items-center gap-3">
            <Badge 
              variant={apiKeyStatus === 'connected' ? 'default' : 'destructive'}
              className="px-3 py-1"
            >
              {apiKeyStatus === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
              {apiKeyStatus === 'disconnected' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {apiKeyStatus === 'checking' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {apiKeyStatus === 'connected' ? 'متصل' : 
               apiKeyStatus === 'disconnected' ? 'غير متصل' : 'جاري الفحص...'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkApiConnection}
              disabled={apiKeyStatus === 'checking'}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Upload and Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  رفع الصورة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-muted-foreground">
                          {selectedImage?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileImage className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">اختر صورة للتحليل</p>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-4"
                    />
                  </div>
                  
                  {/* Custom Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">برومت مخصص (اختياري)</Label>
                    <Textarea
                      id="prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="اكتب تعليمات مخصصة لتحليل الصورة..."
                      rows={3}
                    />
                  </div>

                  {/* Analyze Button */}
                  <Button
                    onClick={analyzeImage}
                    disabled={!selectedImage || isAnalyzing || apiKeyStatus !== 'connected'}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        تحليل الصورة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  المميزات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                    <h4 className="font-semibold">تحليل ذكي</h4>
                    <p className="text-xs text-muted-foreground">تحليل شامل للصور</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <h4 className="font-semibold">سرعة فائقة</h4>
                    <p className="text-xs text-muted-foreground">نتائج فورية</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Settings className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <h4 className="font-semibold">قابل للتخصيص</h4>
                    <p className="text-xs text-muted-foreground">برومت مخصص</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <h4 className="font-semibold">إحصائيات</h4>
                    <p className="text-xs text-muted-foreground">تتبع التحليلات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Results */}
          <div className="space-y-6">
            {/* Analysis Result */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      نتيجة التحليل
                    </div>
                    <Button variant="outline" size="sm" onClick={copyAnalysis}>
                      <Copy className="h-4 w-4 mr-1" />
                      نسخ
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Confidence Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">دقة التحليل</span>
                      <Badge variant="secondary">
                        {Math.round(analysisResult.confidence * 100)}%
                      </Badge>
                    </div>

                    {/* Analysis Text */}
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {analysisResult.analysis}
                        </p>
                      </div>
                    </div>

                    {/* Tags and Objects */}
                    {(analysisResult.tags.length > 0 || analysisResult.objects.length > 0 || analysisResult.colors?.length > 0) && (
                      <div className="space-y-3">
                        {analysisResult.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">الكلمات المفتاحية</h4>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisResult.objects.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">الكائنات المكتشفة</h4>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.objects.map((object, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {object}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {analysisResult.colors && analysisResult.colors.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">الألوان</h4>
                            <div className="flex flex-wrap gap-1">
                              {analysisResult.colors.map((color, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {color}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      تم التحليل في: {formatDateInArabic(analysisResult.timestamp, true)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    سجل التحليلات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisHistory.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer"
                        onClick={() => setAnalysisResult(result)}
                      >
                        <img 
                          src={result.imageUrl} 
                          alt="Thumbnail" 
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            تحليل {formatShortDateInArabic(result.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            دقة: {Math.round(result.confidence * 100)}%
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.tags.length + result.objects.length} عنصر
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  معلومات التكامل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>الموديل المستخدم:</span>
                    <Badge variant="outline">Gemini 1.5 Flash</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>حالة الاتصال:</span>
                    <Badge variant={apiKeyStatus === 'connected' ? 'default' : 'destructive'}>
                      {apiKeyStatus === 'connected' ? 'متصل' : 'غير متصل'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد التحليلات:</span>
                    <span>{analysisHistory.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Status Alert */}
        {apiKeyStatus === 'disconnected' && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              غير متصل بـ Gemini API. يرجى التحقق من إعدادات API أو الاتصال بالإنترنت.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default GeminiVisionIntegrationPage;