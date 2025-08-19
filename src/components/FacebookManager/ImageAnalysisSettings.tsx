import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Image, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Brain, 
  Zap,
  BarChart3,
  Target,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface ImageAnalysisSettingsProps {
  onSettingsChange?: (settings: ImageAnalysisSettings) => void;
}

interface ImageAnalysisSettings {
  enableImageAnalysis: boolean;
  autoAnalyzeOnUpload: boolean;
  extractTextFromImages: boolean;
  detectContactInfo: boolean;
  analyzeProducts: boolean;
  confidenceThreshold: number;
  saveAnalysisResults: boolean;
}

export const ImageAnalysisSettings = ({ onSettingsChange }: ImageAnalysisSettingsProps) => {
  const [settings, setSettings] = useState<ImageAnalysisSettings>({
    enableImageAnalysis: true,
    autoAnalyzeOnUpload: true,
    extractTextFromImages: true,
    detectContactInfo: true,
    analyzeProducts: true,
    confidenceThreshold: 70,
    saveAnalysisResults: true
  });

  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('image-analysis-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('فشل في تحميل إعدادات تحليل الصور:', error);
      }
    }
  }, []);

  // Save settings to localStorage and notify parent component
  useEffect(() => {
    localStorage.setItem('image-analysis-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = (key: keyof ImageAnalysisSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const testImageAnalysis = async () => {
    setTesting(true);
    try {
      // Test with a sample image URL (you can replace this with an actual test image)
      const testImageUrl = "/lovable-uploads/caa948dc-224c-4350-ad0d-92cf684b7454.png";
      
      const response = await fetch(`https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-image-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          postContent: "اختبار تحليل الصورة",
          userComment: "ما الموجود في هذه الصورة؟",
          analysisType: 'comment'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(result);
        if (result.hasImage) {
          toast.success("✅ اختبار تحليل الصور نجح!");
        } else {
          toast.warning("⚠️ لم يتم تحليل الصورة بشكل صحيح");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('خطأ في اختبار تحليل الصور:', error);
      toast.error("❌ فشل اختبار تحليل الصور: " + (error as Error).message);
      setTestResults({ error: (error as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const resetSettings = () => {
    const defaultSettings: ImageAnalysisSettings = {
      enableImageAnalysis: true,
      autoAnalyzeOnUpload: true,
      extractTextFromImages: true,
      detectContactInfo: true,
      analyzeProducts: true,
      confidenceThreshold: 70,
      saveAnalysisResults: true
    };
    setSettings(defaultSettings);
    toast.success("تم إعادة تعيين الإعدادات إلى القيم الافتراضية");
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-elegant border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Camera className="h-5 w-5" />
            إعدادات تحليل الصور المتقدم
            <Badge variant={settings.enableImageAnalysis ? "default" : "secondary"}>
              {settings.enableImageAnalysis ? "مُفعل" : "معطل"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">الإعدادات العامة</TabsTrigger>
              <TabsTrigger value="features">الميزات</TabsTrigger>
              <TabsTrigger value="test">اختبار النظام</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  يستخدم النظام تقنية Gemini AI لتحليل الصور واستخراج المعلومات المفيدة من المنشورات والتعليقات.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-analysis">تفعيل تحليل الصور</Label>
                    <p className="text-sm text-muted-foreground">
                      تشغيل أو إيقاف نظام تحليل الصور بالكامل
                    </p>
                  </div>
                  <Switch
                    id="enable-analysis"
                    checked={settings.enableImageAnalysis}
                    onCheckedChange={(checked) => updateSetting('enableImageAnalysis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-analyze">التحليل التلقائي</Label>
                    <p className="text-sm text-muted-foreground">
                      تحليل الصور تلقائياً عند العثور عليها في المنشورات
                    </p>
                  </div>
                  <Switch
                    id="auto-analyze"
                    checked={settings.autoAnalyzeOnUpload}
                    onCheckedChange={(checked) => updateSetting('autoAnalyzeOnUpload', checked)}
                    disabled={!settings.enableImageAnalysis}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="save-results">حفظ نتائج التحليل</Label>
                    <p className="text-sm text-muted-foreground">
                      حفظ نتائج التحليل لاستخدامها مستقبلاً
                    </p>
                  </div>
                  <Switch
                    id="save-results"
                    checked={settings.saveAnalysisResults}
                    onCheckedChange={(checked) => updateSetting('saveAnalysisResults', checked)}
                    disabled={!settings.enableImageAnalysis}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  اختر الميزات التي تريد تفعيلها في تحليل الصور. كلما زادت الميزات، زادت دقة التحليل.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="extract-text" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      استخراج النصوص
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      قراءة واستخراج النصوص المكتوبة في الصور
                    </p>
                  </div>
                  <Switch
                    id="extract-text"
                    checked={settings.extractTextFromImages}
                    onCheckedChange={(checked) => updateSetting('extractTextFromImages', checked)}
                    disabled={!settings.enableImageAnalysis}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="detect-contact" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      كشف معلومات الاتصال
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      البحث عن أرقام الهاتف والإيميلات والعناوين في الصور
                    </p>
                  </div>
                  <Switch
                    id="detect-contact"
                    checked={settings.detectContactInfo}
                    onCheckedChange={(checked) => updateSetting('detectContactInfo', checked)}
                    disabled={!settings.enableImageAnalysis}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="analyze-products" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      تحليل المنتجات والخدمات
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      تحديد المنتجات والخدمات الظاهرة في الصور
                    </p>
                  </div>
                  <Switch
                    id="analyze-products"
                    checked={settings.analyzeProducts}
                    onCheckedChange={(checked) => updateSetting('analyzeProducts', checked)}
                    disabled={!settings.enableImageAnalysis}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  اختبر نظام تحليل الصور للتأكد من عمله بشكل صحيح. سيتم تحليل صورة تجريبية.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  onClick={testImageAnalysis}
                  disabled={testing || !settings.enableImageAnalysis}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      جاري اختبار النظام...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      اختبار تحليل الصور
                    </>
                  )}
                </Button>

                {testResults && (
                  <div className="space-y-2">
                    <Label>نتائج الاختبار:</Label>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {testResults.error ? (
                        <div className="text-red-600">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          خطأ: {testResults.error}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">نجح التحليل!</span>
                          </div>
                          <div><strong>وصف الصورة:</strong> {testResults.imageDescription}</div>
                          {testResults.extractedInfo && (
                            <div>
                              <strong>المعلومات المستخرجة:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {testResults.extractedInfo.text?.map((text, i) => (
                                  <li key={i}>نص: {text}</li>
                                ))}
                                {testResults.extractedInfo.numbers?.map((num, i) => (
                                  <li key={i}>رقم: {num}</li>
                                ))}
                                {testResults.extractedInfo.locations?.map((loc, i) => (
                                  <li key={i}>موقع: {loc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {testResults.confidence && (
                            <div><strong>مستوى الثقة:</strong> {testResults.confidence}%</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={resetSettings} className="flex-1">
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};