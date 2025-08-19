import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageSquare, 
  BarChart3, 
  Send, 
  Brain, 
  Clock, 
  Shield, 
  Zap,
  Target,
  TrendingUp,
  Users,
  Heart,
  CheckCircle,
  Settings,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Bot,
  Search,
  Tags,
  Gauge
} from "lucide-react";

interface FeaturesProps {
  isCompactView?: boolean;
}

export const Features = ({ isCompactView = false }: FeaturesProps) => {
  const featuresData = {
    publishing: {
      title: "النشر المباشر والمجدول",
      icon: <Send className="h-5 w-5" />,
      description: "منصة شاملة لنشر وجدولة المحتوى على فيسبوك بتقنيات متقدمة",
      features: [
        {
          name: "النشر الفوري المتقدم",
          icon: <Zap className="h-4 w-4" />,
          description: "نشر فوري للنصوص والصور والفيديوهات مع خيارات تنسيق متقدمة",
          benefits: [
            "نشر سريع بثوانٍ معدودة", 
            "دعم جميع أنواع الملفات", 
            "إعدادات خصوصية مرنة",
            "معاينة مباشرة قبل النشر",
            "حفظ المسودات تلقائياً"
          ]
        },
        {
          name: "الجدولة الذكية بالذكاء الاصطناعي",
          icon: <Clock className="h-4 w-4" />,
          description: "نظام ذكي لاختيار أفضل أوقات النشر حسب نشاط الجمهور",
          benefits: [
            "تحليل أوقات تفاعل المتابعين", 
            "جدولة تلقائية للأسابيع",
            "تنبيهات قبل النشر",
            "إعادة جدولة ذكية للمنشورات الفاشلة",
            "تحسين التوقيت باستمرار"
          ]
        },
        {
          name: "محرر المحتوى المتطور",
          icon: <Target className="h-4 w-4" />,
          description: "أدوات تحرير متقدمة مع قوالب واقتراحات ذكية",
          benefits: [
            "قوالب جاهزة لكل المناسبات",
            "اقتراحات نصوص بالذكاء الاصطناعي",
            "فلاتر وتأثيرات للصور",
            "تحسين SEO للمنشورات",
            "فحص الأخطاء الإملائية تلقائياً"
          ]
        },
        {
          name: "إدارة المحتوى المرئي",
          icon: <Sparkles className="h-4 w-4" />,
          description: "أدوات متقدمة لرفع وتحرير الصور والفيديوهات",
          benefits: [
            "ضغط الصور الذكي لسرعة التحميل",
            "محرر فيديو مدمج",
            "مكتبة وسائط منظمة",
            "تحويل صيغ الملفات تلقائياً",
            "إضافة علامات مائية"
          ]
        }
      ],
      problems: [
        "استهلاك وقت طويل في إدارة المحتوى يدوياً",
        "صعوبة تحديد أفضل أوقات النشر",
        "فقدان فرص التفاعل بسبب النشر في الوقت الخاطئ",
        "الحاجة لتطبيقات متعددة لإدارة الصفحة",
        "عدم وجود نظام منظم لحفظ المحتوى"
      ]
    },
    comments: {
      title: "إدارة التعليقات الذكية المتطورة",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "نظام شامل لإدارة التعليقات بذكاء اصطناعي متقدم مع ميزات الرد التلقائي",
      features: [
        {
          name: "التصنيف الذكي متعدد المستويات",
          icon: <Brain className="h-4 w-4" />,
          description: "تصنيف متطور للتعليقات بـ 15 فئة مختلفة مع تحليل المشاعر",
          benefits: [
            "تصنيف دقيق بنسبة 95%",
            "تحليل مشاعر المعلقين",
            "ترتيب حسب الأولوية والطوارئ",
            "تمييز العملاء المحتملين",
            "اكتشاف المحتوى الضار تلقائياً"
          ]
        },
        {
          name: "التصنيف الكلي المطور",
          icon: <Tags className="h-4 w-4" />,
          description: "معالجة مئات التعليقات في دقائق مع تقارير تفصيلية",
          benefits: [
            "معالجة 1000+ تعليق في 5 دقائق",
            "تقارير إحصائية شاملة",
            "تجميع التعليقات المتشابهة",
            "حفظ التصنيفات للمراجع المستقبلية",
            "تصدير النتائج بصيغ متعددة"
          ]
        },
        {
          name: "الرد التلقائي الذكي",
          icon: <Bot className="h-4 w-4" />,
          description: "نظام رد تلقائي فوري على التعليقات الجديدة بذكاء اصطناعي متقدم",
          benefits: [
            "رد فوري خلال ثوانٍ من التعليق",
            "ردود مخصصة حسب محتوى المنشور",
            "تعلم من أسلوب صاحب الصفحة",
            "كشف الأسئلة الشائعة والرد عليها",
            "إيقاف الرد على التعليقات السلبية"
          ]
        },
        {
          name: "الرد الذكي المتقدم",
          icon: <Sparkles className="h-4 w-4" />,
          description: "توليد ردود احترافية مع تحليل سياق المحادثة",
          benefits: [
            "ردود تتناسب مع طبيعة النشاط التجاري",
            "استخراج معلومات الاتصال من المنشور",
            "ردود شخصية باسم المعلق",
            "اقتراحات ردود متنوعة",
            "حفظ الردود المفضلة كقوالب"
          ]
        },
        {
          name: "البحث والفلترة المتقدمة",
          icon: <Search className="h-4 w-4" />,
          description: "أدوات بحث متطورة مع فلاتر ذكية متعددة",
          benefits: [
            "بحث بالكلمات المفتاحية والعبارات",
            "فلترة حسب التاريخ والوقت",
            "تجميع التعليقات حسب المؤلف",
            "بحث في الردود والمحادثات",
            "حفظ عمليات البحث المتكررة"
          ]
        },
        {
          name: "عرض التعليقات والردود الشامل",
          icon: <MessageCircle className="h-4 w-4" />,
          description: "واجهة متقدمة لعرض التعليقات مع جميع الردود والمحادثات",
          benefits: [
            "عرض شجري للردود والتعليقات الفرعية",
            "تتبع المحادثات الطويلة",
            "إظهار عدد الردود لكل تعليق",
            "ترقيم وتنظيم المحادثات",
            "إمكانية طي وتوسيع المحادثات"
          ]
        }
      ],
      problems: [
        "تراكم آلاف التعليقات يومياً دون تنظيم",
        "فقدان العملاء المحتملين بسبب التأخير في الرد",
        "استغراق ساعات طويلة في قراءة وتصنيف التعليقات",
        "صعوبة تتبع المحادثات الطويلة والردود",
        "عدم القدرة على تحديد أولويات الرد",
        "فقدان التعليقات المهمة في زحام المحتوى",
        "عدم الرد في الوقت المناسب مما يؤثر على سمعة النشاط"
      ]
    },
    analytics: {
      title: "التحليلات والإحصائيات",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "تحليل شامل لأداء صفحتك ومنشوراتك",
      features: [
        {
          name: "إحصائيات الصفحة",
          icon: <Users className="h-4 w-4" />,
          description: "متابعة نمو المتابعين والتفاعل",
          benefits: ["فهم الجمهور", "قياس النمو", "تحسين الاستراتيجية"]
        },
        {
          name: "تحليل المنشورات",
          icon: <TrendingUp className="h-4 w-4" />,
          description: "قياس أداء كل منشور",
          benefits: ["معرفة المحتوى الأفضل", "تحسين التوقيت", "زيادة التفاعل"]
        },
        {
          name: "تقارير مفصلة",
          icon: <Gauge className="h-4 w-4" />,
          description: "تقارير شاملة عن الأداء",
          benefits: ["رؤى عميقة", "قرارات مدروسة", "تطوير مستمر"]
        }
      ],
      problems: [
        "صعوبة فهم أداء المحتوى",
        "عدم معرفة أفضل أوقات النشر",
        "فقدان فرص تحسين التفاعل"
      ]
    },
    messenger: {
      title: "إدارة الرسائل الخاصة",
      icon: <MessageCircle className="h-5 w-5" />,
      description: "إدارة الرسائل والمحادثات الخاصة",
      features: [
        {
          name: "الرسائل الواردة",
          icon: <MessageCircle className="h-4 w-4" />,
          description: "عرض وإدارة جميع الرسائل الواردة",
          benefits: ["لا تفوت رسالة", "تنظيم محسن", "رد سريع"]
        },
        {
          name: "الرد السريع",
          icon: <Zap className="h-4 w-4" />,
          description: "قوالب ردود جاهزة وذكية",
          benefits: ["توفير الوقت", "اتساق الردود", "احترافية عالية"]
        }
      ],
      problems: [
        "صعوبة متابعة الرسائل الكثيرة",
        "تأخير في الرد على العملاء",
        "فقدان فرص تجارية"
      ]
    },
    security: {
      title: "الأمان وإدارة التوكنات",
      icon: <Shield className="h-5 w-5" />,
      description: "إدارة آمنة لمفاتيح الوصول والصلاحيات",
      features: [
        {
          name: "التحقق من التوكنات",
          icon: <CheckCircle className="h-4 w-4" />,
          description: "فحص صلاحية مفاتيح الوصول",
          benefits: ["أمان محسن", "منع الأخطاء", "تحديثات تلقائية"]
        },
        {
          name: "إدارة الصلاحيات",
          icon: <Settings className="h-4 w-4" />,
          description: "التحكم في صلاحيات الوصول",
          benefits: ["حماية البيانات", "تحكم دقيق", "شفافية كاملة"]
        }
      ],
      problems: [
        "مخاوف أمنية من مشاركة البيانات",
        "صعوبة إدارة المفاتيح",
        "انتهاء صلاحية المفاتيح"
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            ميزات ومواصفات منصة إدارة فيسبوك
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            منصة شاملة لإدارة صفحات فيسبوك بذكاء اصطناعي تساعدك في توفير الوقت وزيادة التفاعل وتحسين أداء صفحتك
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">5+</div>
              <div className="text-sm text-muted-foreground">أقسام رئيسية</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">15+</div>
              <div className="text-sm text-muted-foreground">ميزة ذكية</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">AI</div>
              <div className="text-sm text-muted-foreground">تقنية ذكاء اصطناعي</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="publishing" className="w-full">
        <TabsList className={`grid w-full ${isCompactView ? 'grid-cols-2' : 'grid-cols-5'} gap-1`}>
          <TabsTrigger value="publishing" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className={isCompactView ? 'hidden md:inline' : 'inline'}>النشر</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className={isCompactView ? 'hidden md:inline' : 'inline'}>التعليقات</span>
          </TabsTrigger>
          {!isCompactView && (
            <>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                التحليلات
              </TabsTrigger>
              <TabsTrigger value="messenger" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                الرسائل
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                الأمان
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {Object.entries(featuresData).map(([key, section]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  {section.icon}
                  {section.title}
                </CardTitle>
                <p className="text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* المشاكل التي يحلها */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      المشاكل التي يحلها
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {section.problems.map((problem, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-sm text-red-700">{problem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* الميزات التفصيلية */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      الميزات التفصيلية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.features.map((feature, index) => (
                        <Card key={index} className="border-l-4 border-l-primary/60">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {feature.icon}
                              </div>
                              <h4 className="font-medium">{feature.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {feature.description}
                            </p>
                            <div className="space-y-1">
                              {feature.benefits.map((benefit, benefitIndex) => (
                                <div key={benefitIndex} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-muted-foreground">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* الفوائد العامة */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
                      <Heart className="h-4 w-4" />
                      الفوائد لأصحاب الصفحات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center">
                        <Clock className="h-6 w-6 mx-auto mb-1 text-green-600" />
                        <div className="text-sm font-medium text-green-700">توفير الوقت</div>
                        <div className="text-xs text-green-600">حتى 80% وقت أقل</div>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-600" />
                        <div className="text-sm font-medium text-green-700">زيادة التفاعل</div>
                        <div className="text-xs text-green-600">تحسين الأداء</div>
                      </div>
                      <div className="text-center">
                        <Target className="h-6 w-6 mx-auto mb-1 text-green-600" />
                        <div className="text-sm font-medium text-green-700">تنظيم أفضل</div>
                        <div className="text-xs text-green-600">إدارة احترافية</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};