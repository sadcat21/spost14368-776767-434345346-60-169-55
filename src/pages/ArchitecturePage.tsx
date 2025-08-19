import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const ArchitecturePage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          المخطط المعماري للنظام
        </h1>
        <p className="text-muted-foreground text-lg">
          مخططات C4 توضح البنية المعمارية الكاملة للنظام
        </p>
      </div>

      <Tabs defaultValue="context" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="context">السياق العام</TabsTrigger>
          <TabsTrigger value="container">الحاويات</TabsTrigger>
          <TabsTrigger value="component">المكونات</TabsTrigger>
          <TabsTrigger value="code">الكود</TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">C4 Level 1</Badge>
                مخطط السياق العام
              </CardTitle>
              <CardDescription>
                يوضح النظام والمستخدمين والأنظمة الخارجية المتصلة به
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-8 rounded-lg">
                <div className="flex flex-col items-center space-y-8">
                  {/* المستخدمون */}
                  <div className="flex gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        المستخدم
                      </div>
                      <p className="text-sm mt-2">مطور أو مسوق رقمي</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        المدير
                      </div>
                      <p className="text-sm mt-2">مدير النظام</p>
                    </div>
                  </div>

                  {/* النظام الرئيسي */}
                  <div className="border-4 border-dashed border-primary p-8 rounded-lg bg-background">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                        نظام إدارة المحتوى الذكي
                      </div>
                      <p className="text-sm mt-2 max-w-xs">منصة شاملة لإنشاء وإدارة المحتوى الرقمي</p>
                    </div>
                  </div>

                  {/* الأنظمة الخارجية */}
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="text-center">
                      <div className="w-24 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        Facebook API
                      </div>
                      <p className="text-xs mt-1">منصة النشر</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        Gemini AI
                      </div>
                      <p className="text-xs mt-1">الذكاء الاصطناعي</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-16 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        Pixabay API
                      </div>
                      <p className="text-xs mt-1">مكتبة الصور</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 h-16 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        Supabase
                      </div>
                      <p className="text-xs mt-1">قاعدة البيانات</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="container" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">C4 Level 2</Badge>
                مخطط الحاويات
              </CardTitle>
              <CardDescription>
                يوضح التطبيقات وقواعد البيانات والخدمات داخل النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-8 rounded-lg">
                <div className="space-y-8">
                  {/* المستخدم */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto">
                      المستخدم
                    </div>
                  </div>

                  {/* النظام */}
                  <div className="border-4 border-dashed border-primary p-6 rounded-lg bg-background">
                    <h3 className="text-center font-bold mb-6">نظام إدارة المحتوى الذكي</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-24 h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                          تطبيق الويب React
                        </div>
                        <p className="text-xs mt-2">واجهة المستخدم</p>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-20 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                          API Gateway
                        </div>
                        <p className="text-xs mt-2">معالجة الطلبات</p>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-20 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                          قاعدة البيانات
                        </div>
                        <p className="text-xs mt-2">PostgreSQL</p>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-20 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                          تخزين الملفات
                        </div>
                        <p className="text-xs mt-2">Supabase Storage</p>
                      </div>
                      <div className="text-center">
                        <div className="w-24 h-20 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                          المصادقة
                        </div>
                        <p className="text-xs mt-2">Supabase Auth</p>
                      </div>
                    </div>
                  </div>

                  {/* الأنظمة الخارجية */}
                  <div className="flex flex-wrap justify-center gap-6">
                    <div className="w-20 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      Facebook
                    </div>
                    <div className="w-20 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      Gemini
                    </div>
                    <div className="w-20 h-16 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      Pixabay
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="component" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">C4 Level 3</Badge>
                مخطط المكونات
              </CardTitle>
              <CardDescription>
                يوضح المكونات الرئيسية داخل تطبيق الويب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-8 rounded-lg">
                <div className="border-4 border-dashed border-blue-500 p-6 rounded-lg bg-background">
                  <h3 className="text-center font-bold mb-6 text-blue-600">تطبيق الويب React</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-20 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                        لوحة التحكم
                      </div>
                      <p className="text-xs mt-1">AIDashboard</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                        مولد المحتوى
                      </div>
                      <p className="text-xs mt-1">ContentGenerator</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                        مدير فيسبوك
                      </div>
                      <p className="text-xs mt-1">FacebookManager</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-16 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                        محرك الأتمتة
                      </div>
                      <p className="text-xs mt-1">AutomationEngine</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-16 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                        التحليلات
                      </div>
                      <p className="text-xs mt-1">Analytics</p>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-16 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mx-auto">
                        أدوات التصميم
                      </div>
                      <p className="text-xs mt-1">DesignControls</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-6 mt-6">
                  <div className="text-center">
                    <div className="w-24 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      API Gateway
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-16 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      خدمة المصادقة
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">C4 Level 4</Badge>
                مخطط الكود
              </CardTitle>
              <CardDescription>
                يوضح تفاصيل تنفيذ مكون مولد المحتوى
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-center">Classes والمكونات</h4>
                  <div className="space-y-3">
                    <div className="border-2 border-blue-300 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <h5 className="font-semibold text-blue-700 dark:text-blue-300">ContentGenerator</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>+ useState() hooks</li>
                        <li>+ useGeminiApi() hook</li>
                        <li>+ handleContentGeneration()</li>
                        <li>+ handleImageUpload()</li>
                        <li>+ renderContent()</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-green-300 p-4 rounded-lg bg-green-50 dark:bg-green-950">
                      <h5 className="font-semibold text-green-700 dark:text-green-300">AutoPromptGenerator</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>+ generatePrompts()</li>
                        <li>+ analyzeContent()</li>
                        <li>+ createVariations()</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-purple-300 p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                      <h5 className="font-semibold text-purple-700 dark:text-purple-300">GeminiApiManager</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>+ analyzeImage()</li>
                        <li>+ generateText()</li>
                        <li>+ extractText()</li>
                        <li>+ handleApiCall()</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-center">المكونات المساعدة</h4>
                  <div className="space-y-3">
                    <div className="border-2 border-orange-300 p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                      <h5 className="font-semibold text-orange-700 dark:text-orange-300">ContentPreview</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>+ renderPreview()</li>
                        <li>+ handleDeviceToggle()</li>
                        <li>+ updateContent()</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-cyan-300 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950">
                      <h5 className="font-semibold text-cyan-700 dark:text-cyan-300">ImageController</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>+ uploadImage()</li>
                        <li>+ processImage()</li>
                        <li>+ applyFilters()</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-red-300 p-4 rounded-lg bg-red-50 dark:bg-red-950">
                      <h5 className="font-semibold text-red-700 dark:text-red-300">TextCustomizer</h5>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>+ formatText()</li>
                        <li>+ applyStyles()</li>
                        <li>+ handleFontChange()</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h5 className="font-semibold mb-2">العلاقات والتبعيات:</h5>
                <ul className="text-sm space-y-1">
                  <li>• ContentGenerator يستخدم جميع المكونات الأخرى</li>
                  <li>• AutoPromptGenerator يتصل مع GeminiApiManager</li>
                  <li>• ImageController يستخدم GeminiApiManager لتحليل الصور</li>
                  <li>• جميع المكونات تتبع نمط React Hooks</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>تقنيات ومكتبات مستخدمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Frontend</h4>
              <ul className="text-sm space-y-1">
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Framer Motion</li>
                <li>• Radix UI</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Backend</h4>
              <ul className="text-sm space-y-1">
                <li>• Supabase</li>
                <li>• PostgreSQL</li>
                <li>• Edge Functions</li>
                <li>• Real-time subscriptions</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">AI Services</h4>
              <ul className="text-sm space-y-1">
                <li>• Google Gemini</li>
                <li>• Text Generation</li>
                <li>• Image Analysis</li>
                <li>• Content Extraction</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">External APIs</h4>
              <ul className="text-sm space-y-1">
                <li>• Facebook Graph API</li>
                <li>• Pixabay API</li>
                <li>• Canvas API</li>
                <li>• File Upload APIs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchitecturePage;