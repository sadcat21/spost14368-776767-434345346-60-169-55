import { useState, useEffect, useCallback } from "react";
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle, TrendingUp, Globe, Zap, Brain, Star, BarChart3, Users, Clock, Sparkles, Activity, Eye, Target, Settings, Play, Pause, Send, Mail, Share2, Ghost } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useFacebook } from "@/contexts/FacebookContext";
import { useFacebookAuth } from "@/hooks/useFacebookAuth";
import { FacebookCard } from "@/components/FacebookCard";
import { AIIntelligenceCard } from "@/components/AIIntelligenceCard";
import { GmailAuthManager } from "@/components/GmailAuthManager";
import { SnapchatCard } from "@/components/SnapchatCard";
import snapchatLogo from "@/assets/snapchat.svg";

interface AIDashboardProps {
  accessToken?: string;
  copySettings?: any;
}

const AIDashboard = ({ accessToken, copySettings }: AIDashboardProps) => {
  const [activeIcon, setActiveIcon] = useState(0);
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [centralIconIsAI, setCentralIconIsAI] = useState(false); // حالة تبديل الأيقونة المركزية - تبدأ بوضع وسائل التواصل الاجتماعي
  const [facebookCentralMode, setFacebookCentralMode] = useState(false); // حالة عقدة فيسبوك المركزية
  const [aiInsights, setAiInsights] = useState({
    totalReach: 0,
    engagement: 0,
    growth: 0,
    automation: 0
  });
  const [showGmailAuth, setShowGmailAuth] = useState(false);
  const [gmailData, setGmailData] = useState<any>(null);

  // Get Facebook connection status and data from context
  const { 
    isConnected: isFacebookConnected, 
    selectedPage: facebookSelectedPage,
    pages: facebookPages
  } = useFacebook();

  // Facebook authentication hook
  const { startFacebookOAuth, quickLogin, loading: authLoading } = useFacebookAuth();

  // Radial network with 8 communication nodes - perfect symmetry on 8 radial axes
  const socialPlatformsBase = [
    { 
      Icon: Globe, 
      name: "Website", 
      color: "from-green-500 to-emerald-600", 
      textColor: "text-green-300",
      delay: 0,
      metrics: { visitors: "24.5K", conversion: "3.2%", bounce: "32%" },
      status: "active"
    },
    { 
      Icon: Instagram, 
      name: "Instagram", 
      color: "from-pink-500 to-rose-600", 
      textColor: "text-pink-300",
      delay: 0.2,
      metrics: { followers: "67.8K", stories: "24", reels: "156K" },
      status: "active"
    },
    { 
      Icon: Send, 
      name: "Telegram", 
      color: "from-blue-500 to-cyan-600", 
      textColor: "text-blue-300",
      delay: 0.4,
      metrics: { subscribers: "45.2K", messages: "1.8K", bots: "8" },
      status: "active"
    },
    { 
      Icon: Facebook, 
      name: "Facebook", 
      color: "from-blue-500 to-blue-700", 
      textColor: "text-blue-300",
      delay: 0.6,
      metrics: isFacebookConnected && facebookSelectedPage ? {
        page: facebookSelectedPage.name,
        category: facebookSelectedPage.category,
        pageId: facebookSelectedPage.id,
        status: "متصل",
        profilePicture: facebookSelectedPage.picture?.data?.url,
        totalPages: facebookPages.length.toString()
      } : { 
        status: "غير متصل", 
        pages: facebookPages.length.toString(),
        action: "اتصل بفيسبوك",
        totalPages: "0" 
      },
      status: isFacebookConnected ? "active" : "inactive"
    },
    { 
      Icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ), 
      name: "TikTok", 
      color: "from-purple-500 to-pink-600", 
      textColor: "text-purple-300",
      delay: 0.8,
      metrics: { followers: "89.2K", views: "2.1M", engagement: "8.7%" },
      status: "trending"
    },
    { 
      Icon: Mail, 
      name: "Gmail", 
      color: "from-red-500 to-red-600", 
      textColor: "text-red-300",
      delay: 1.0,
      metrics: gmailData?.isAuthenticated ? {
        total: gmailData.stats.total.toLocaleString(),
        unread: gmailData.stats.unread.toLocaleString(),
        sent: gmailData.stats.sent.toLocaleString(),
        email: gmailData.email,
        name: gmailData.email.split('@')[0] || 'مستخدم',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(gmailData.email)}&background=dc2626&color=fff&size=40`,
        status: "متصل",
        domain: gmailData.email.split('@')[1] || 'gmail.com'
      } : { 
        status: "غير متصل", 
        action: "سجل دخول لعرض البيانات",
        total: "0",
        name: "غير محدد",
        domain: "gmail.com"
      },
      status: gmailData?.isAuthenticated ? "active" : "inactive"
    },
    { 
      Icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ), 
      name: "X", 
      color: "from-gray-800 to-gray-900", 
      textColor: "text-gray-300",
      delay: 1.2,
      metrics: { posts: "2.4K", reposts: "987", mentions: "156" },
      status: "active"
    },
    { 
      Icon: MessageCircle, 
      name: "WhatsApp", 
      color: "from-green-500 to-emerald-600", 
      textColor: "text-green-300",
      delay: 1.4,
      metrics: { contacts: "3.2K", chats: "847", broadcasts: "24" },
      status: "active"
    },
    {
      Icon: (props: any) => (
        <img {...props} src={snapchatLogo} alt="Snapchat logo" className={`w-6 h-6 ${props?.className || ''}`} />
      ),
      name: "Snapchat",
      color: "from-yellow-400 to-yellow-500",
      textColor: "text-yellow-300",
      delay: 1.6,
      metrics: { friends: "12.3K", snaps: "56K", stories: "120" },
      status: "active"
    }
  ];

  // Facebook-centric nodes - عقد فرعية لفيسبوك
  const facebookSubNodes = [
    {
      Icon: Settings,
      name: "إعدادات فيسبوك",
      color: "from-blue-500 to-blue-700",
      textColor: "text-blue-300",
      delay: 0,
      metrics: { configured: "متصل", pages: facebookPages.length.toString() },
      status: "active",
      angle: 0,
      radius: 180,
      route: "/facebook-management"
    },
    {
      Icon: BarChart3,
      name: "تحليلات فيسبوك",
      color: "from-purple-500 to-indigo-600",
      textColor: "text-purple-300",
      delay: 0.3,
      metrics: { insights: "تحليل متقدم", data: "بيانات حية" },
      status: "active",
      angle: 60,
      radius: 180,
      route: "/facebook-management"
    },
    {
      Icon: Users,
      name: "إدارة الصفحات",
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-300",
      delay: 0.6,
      metrics: { pages: facebookPages.length.toString(), active: "جميع الصفحات" },
      status: "active",
      angle: 120,
      radius: 180,
      route: "/facebook-management"
    },
    {
      Icon: Zap,
      name: "النشر الآلي",
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-300",
      delay: 0.9,
      metrics: { automated: "نشر ذكي", scheduled: "مجدولة" },
      status: "trending",
      angle: 180,
      radius: 180,
      route: "/spost"
    },
    {
      Icon: Play,
      name: "نشر تلقائي متقدم",
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-300",
      delay: 1.8,
      metrics: { scheduled: "مجدولة", ai: "ذكي" },
      status: "active",
      angle: 210,
      radius: 180,
      route: "/automated-publishing"
    },
    {
      Icon: MessageCircle,
      name: "إدارة التعليقات",
      color: "from-cyan-500 to-blue-600",
      textColor: "text-cyan-300",
      delay: 1.2,
      metrics: { comments: "إدارة ذكية", replies: "ردود آلية" },
      status: "active",
      angle: 240,
      radius: 180,
      route: "/facebook-management"
    },
    {
      Icon: Globe,
      name: "إعداد Webhook",
      color: "from-violet-500 to-purple-600",
      textColor: "text-violet-300",
      delay: 1.5,
      metrics: { webhooks: "مهيأة", realtime: "فوري" },
      status: "active",
      angle: 300,
      radius: 180,
      route: "/webhook-setup"
    }
  ];

  // توزيع زوايا موحد شعاعيًا لمنع الفوضى والتداخل
  const socialPlatforms = socialPlatformsBase.map((p, i) => ({
    ...p,
    angle: Math.round((360 / socialPlatformsBase.length) * i),
    radius: 180
  }));


  // AI Mode - 8 core functions nodes
  const aiCoreFunctions = [
    { 
      Icon: Brain, 
      name: "تحليل المحتوى", 
      color: "from-purple-500 to-indigo-600", 
      textColor: "text-purple-300",
      delay: 0,
      metrics: { accuracy: "96.5%", speed: "2.1s", models: "12" },
      status: "active",
      angle: 0, // East
      radius: 180
    },
    { 
      Icon: Sparkles, 
      name: "إنتاج المحتوى", 
      color: "from-pink-500 to-purple-600", 
      textColor: "text-pink-300",
      delay: 0.2,
      metrics: { generated: "1.2K", quality: "94%", variations: "500+" },
      status: "active",
      angle: 45, // Northeast
      radius: 180
    },
    { 
      Icon: Target, 
      name: "تحسين الأداء", 
      color: "from-indigo-500 to-purple-600", 
      textColor: "text-indigo-300",
      delay: 0.4,
      metrics: { optimization: "87%", insights: "45", reports: "24" },
      status: "active",
      angle: 90, // North
      radius: 180
    },
    { 
      Icon: Eye, 
      name: "تحليل بصري", 
      color: "from-violet-500 to-purple-700", 
      textColor: "text-violet-300",
      delay: 0.6,
      metrics: { images: "8.7K", detection: "99.2%", objects: "156" },
      status: "active",
      angle: 135, // Northwest
      radius: 180
    },
    { 
      Icon: BarChart3, 
      name: "تحليل البيانات", 
      color: "from-purple-500 to-fuchsia-600", 
      textColor: "text-purple-300",
      delay: 0.8,
      metrics: { datasets: "342", predictions: "98.7%", models: "28" },
      status: "trending",
      angle: 180, // West
      radius: 180
    },
    { 
      Icon: Users, 
      name: "تحليل الجمهور", 
      color: "from-fuchsia-500 to-pink-600", 
      textColor: "text-fuchsia-300",
      delay: 1.0,
      metrics: { segments: "15", behavior: "89%", growth: "+24%" },
      status: "active",
      angle: 225, // Southwest
      radius: 180
    },
    { 
      Icon: Zap, 
      name: "أتمتة ذكية", 
      color: "from-purple-600 to-indigo-700", 
      textColor: "text-purple-300",
      delay: 1.2,
      metrics: { workflows: "67", efficiency: "+156%", tasks: "2.1K" },
      status: "active",
      angle: 270, // South
      radius: 180
    },
    { 
      Icon: Star, 
      name: "تقييم جودة", 
      color: "from-indigo-500 to-purple-600", 
      textColor: "text-indigo-300",
      delay: 1.4,
      metrics: { scores: "4.8/5", reviews: "892", improvements: "34%" },
      status: "active",
      angle: 315, // Southeast
      radius: 180
    }
  ];

  // AI-powered real-time insights simulation
  useEffect(() => {
    const updateInsights = () => {
      setAiInsights({
        totalReach: Math.floor(Math.random() * 1000000) + 500000,
        engagement: Math.floor(Math.random() * 15) + 5,
        growth: Math.floor(Math.random() * 30) + 10,
        automation: Math.floor(Math.random() * 40) + 60
      });
    };

    updateInsights();
    const interval = setInterval(updateInsights, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic icon cycling with pause functionality - يستخدم العقد المناسبة حسب الوضع
  useEffect(() => {
    if (!isAnimationPlaying) return;
    
    let currentPlatforms;
    if (facebookCentralMode) {
      currentPlatforms = facebookSubNodes;
    } else if (centralIconIsAI) {
      currentPlatforms = aiCoreFunctions;
    } else {
      currentPlatforms = socialPlatforms;
    }
    
    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % currentPlatforms.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnimationPlaying, centralIconIsAI, facebookCentralMode]);

  // Calculate orbital position based on angle and radius (solar system layout)
  const getPosition = (platform: typeof socialPlatforms[0]) => {
    const angleRad = (platform.angle * Math.PI) / 180;
    // استخدام الـ radius المخفض بنسبة 25% (180 بدلاً من 240)
    const uniformRadius = 180;
    const x = Math.cos(angleRad) * uniformRadius;
    const y = Math.sin(angleRad) * uniformRadius;
    return { x, y };
  };

  // حساب المسافة بين كل عقدة والعقدة المركزية
  const calculateDistance = (platform: typeof socialPlatforms[0]) => {
    const position = getPosition(platform);
    // المسافة الإقليدية = √((x2-x1)² + (y2-y1)²)
    // المركز في (0, 0) نسبة للإحداثيات المحلية
    const distance = Math.sqrt(position.x * position.x + position.y * position.y);
    return Math.round(distance);
  };

  // عرض المسافات في وحدة التحكم
  useEffect(() => {
    console.log("🎯 المسافات من العقدة المركزية (DAIGNO PAGE):");
    console.log("=" .repeat(50));
    
    socialPlatforms.forEach((platform, index) => {
      const distance = calculateDistance(platform);
      const position = getPosition(platform);
      console.log(`${index + 1}. ${platform.name}:`);
      console.log(`   📍 الزاوية: ${platform.angle}°`);
      console.log(`   📏 المسافة: ${distance} بكسل`);
      console.log(`   📊 الإحداثيات: (x: ${Math.round(position.x)}, y: ${Math.round(position.y)})`);
      console.log(`   🎨 الحالة: ${platform.status}`);
      console.log("-".repeat(30));
    });
    
    const avgDistance = socialPlatforms.reduce((sum, platform) => sum + calculateDistance(platform), 0) / socialPlatforms.length;
    console.log(`📈 متوسط المسافة: ${Math.round(avgDistance)} بكسل`);
    console.log(`🔄 عدد العقد: ${socialPlatforms.length}`);
    console.log("=" .repeat(50));
  }, [socialPlatforms]);

  // Handle platform selection
  const handlePlatformClick = useCallback(async (platform: any, index: number) => {
    setSelectedPlatform(platform.name);
    setActiveIcon(index);
    
    // التعامل مع النقر على العقد حسب الوضع النشط
    if (facebookCentralMode) {
      // في وضع فيسبوك المركزي - توجيه إلى الصفحات المحددة
      if (platform.route) {
        const event = new CustomEvent('navigateToRoute', { 
          detail: { route: platform.route } 
        });
        window.dispatchEvent(event);
        toast.success(`🔗 الانتقال إلى ${platform.name}`);
      } else {
        toast.success(`🎯 عرض ${platform.name}`);
      }
    } else if (centralIconIsAI) {
      // في وضع الذكاء الاصطناعي
      if (platform.name === "إنتاج المحتوى") {
        // الانتقال إلى تبويبة المحتوى (content)
        const event = new CustomEvent('navigateToContent');
        window.dispatchEvent(event);
        toast.success(`🚀 تم فتح مولد المحتوى الأصلي - معرف: content`);
      } else if (platform.name === "تحليل المحتوى") {
        // الانتقال إلى المحلل
        const event = new CustomEvent('navigateToAnalyzer');
        window.dispatchEvent(event);
        toast.success(`🔍 تم فتح محلل المحتوى - معرف: analyzer-tab`);
      } else if (platform.name === "تحليل بصري") {
        // الانتقال إلى Gemini Vision
        const event = new CustomEvent('navigateToGeminiVision');
        window.dispatchEvent(event);
        toast.success(`👁️ تم فتح تحليل الرؤية البصرية - معرف: gemini-vision-integration`);
      } else if (platform.name === "أتمتة ذكية") {
        // فتح النسخة الكاملة من نظام توليد المحتوى - Gemini
        const event = new CustomEvent('navigateToGeminiContent');
        window.dispatchEvent(event);
        toast.success(`🎨 تم فتح النسخة الكاملة من نظام توليد المحتوى - Gemini`);
      } else {
        toast.success(`🤖 عرض تفاصيل ${platform.name} - مدعوم بالذكاء الاصطناعي`);
      }
    } else {
      // في وضع وسائل التواصل الاجتماعي
      if (platform.name === "Facebook") {
        if (!isFacebookConnected) {
          // إذا لم يكن متصل، افتح نافذة OAuth الرسمية لفيسبوك
          try {
            await startFacebookOAuth();
          } catch (error) {
            toast.error('تعذر فتح نافذة تسجيل الدخول إلى Facebook');
          }
        } else {
          // إذا كان متصل، تحويل إلى وضع فيسبوك المركزي
          setFacebookCentralMode(true);
          setCentralIconIsAI(false);
          toast.success(`📘 تم تفعيل وضع فيسبوك المركزي - ${facebookPages.length} صفحة متاحة`);
        }
      } else if (platform.name === "Gmail") {
        if (!gmailData?.isAuthenticated) {
          setShowGmailAuth(true);
          toast.info("يرجى تسجيل الدخول لعرض بيانات Gmail الحقيقية");
        } else {
          // Navigate to Gmail Details tab
          const event = new CustomEvent('navigateToGmailDetails', { 
            detail: { gmailData } 
          });
          window.dispatchEvent(event);
          toast.success(`فتح تفاصيل Gmail: ${gmailData.email}`);
        }
      } else if (platform.name === "Automation") {
        // Navigate to Content Information tab
        const event = new CustomEvent('navigateToContentInfo');
        window.dispatchEvent(event);
        toast.success(`📋 معلومات العنصر - محتوى إنشاء وتحرير المحتوى`);
      } else {
        toast.success(`عرض تفاصيل ${platform.name}`);
      }
    }
  }, [centralIconIsAI, facebookCentralMode, isFacebookConnected, facebookSelectedPage, facebookPages.length, startFacebookOAuth, gmailData]);

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimationPlaying(!isAnimationPlaying);
  };

  // Toggle central icon between Settings, AI, and Facebook modes
  const toggleCentralIcon = () => {
    if (facebookCentralMode) {
      // من وضع فيسبوك المركزي إلى وضع وسائل التواصل
      setFacebookCentralMode(false);
      setCentralIconIsAI(false);
      toast.success("🌐 العودة إلى وضع وسائل التواصل الاجتماعي");
    } else if (centralIconIsAI) {
      // من وضع الذكاء الاصطناعي إلى وضع وسائل التواصل
      setCentralIconIsAI(false);
      toast.success("🌐 تم التبديل إلى وضع وسائل التواصل الاجتماعي");
    } else {
      // من وضع وسائل التواصل إلى وضع الذكاء الاصطناعي
      setCentralIconIsAI(true);
      toast.success("🤖 تم تفعيل وضع الذكاء الاصطناعي المتقدم ✨");
    }
  };

  const handleGmailAuthSuccess = (data: any) => {
    setGmailData(data);
    setShowGmailAuth(false);
    if (data.isAuthenticated) {
      toast.success(`تم تسجيل الدخول بنجاح: ${data.email}`);
    }
  };

  return (
    <>
      {/* Gmail Authentication Modal */}
      <AnimatePresence>
        {showGmailAuth && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGmailAuth(false)}
          >
            <motion.div
              className="bg-background rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GmailAuthManager onAuthSuccess={handleGmailAuthSuccess} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    <motion.div 
      className="w-full h-[600px] relative overflow-hidden bg-gradient-to-br from-background to-muted"
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {/* خطوط الشبكة المحسنة - مع تأثيرات خاصة لوضع الذكاء الاصطناعي */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            opacity: centralIconIsAI ? 0.5 : 0.3
          }}
          transition={{ duration: 1.5 }}
        >
          <div className="h-full w-full bg-[linear-gradient(rgba(148,163,184,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.3)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </motion.div>


        {/* خطوط محورية رئيسية */}
        <div className="absolute inset-0 opacity-20">
          {/* الخط الأفقي المركزي */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent transform -translate-y-0.5"></div>
          {/* الخط العمودي المركزي */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-border to-transparent transform -translate-x-0.5"></div>
        </div>

        {/* دوائر مركزية محورية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 rounded-full border border-border"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-border"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-border"></div>
          </div>
        </div>
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 25 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}

        {/* Neural Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          {[...Array(20)].map((_, i) => (
            <motion.line
              key={i}
              x1={Math.random() * window.innerWidth}
              y1={Math.random() * window.innerHeight}
              x2={Math.random() * window.innerWidth}
              y2={Math.random() * window.innerHeight}
              stroke="url(#gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: Math.random() * 3 + 2, delay: Math.random() * 2 }}
            />
          ))}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(34, 211, 238)" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Smart Hover Card - تعرض البطاقة المناسبة حسب الوضع */}
      <AnimatePresence>
        {hoveredIcon !== null && (
          <motion.div
            className="absolute top-6 left-6 z-30"
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {facebookCentralMode ? (
              <FacebookCard hoveredPlatform={facebookSubNodes[hoveredIcon]} />
            ) : centralIconIsAI ? (
              <AIIntelligenceCard hoveredNode={aiCoreFunctions[hoveredIcon]} />
            ) : (
              socialPlatforms[hoveredIcon].name === 'Snapchat' ? (
                <SnapchatCard hoveredPlatform={socialPlatforms[hoveredIcon]} />
              ) : (
                <FacebookCard hoveredPlatform={socialPlatforms[hoveredIcon]} />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Control Panel */}
      <motion.div
        className="absolute top-6 right-6 z-30 flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAnimation}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {isAnimationPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex items-center gap-2 text-white/80">
                <Activity className="h-4 w-4" />
                <span className="text-sm">AI Active</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Interactive Network Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* مركز العقدة الرئيسية - عقدة بسيطة مثل باقي العقد */}
          <motion.div
            className="absolute z-10 cursor-pointer group"
            style={{ 
              left: 'calc(50% - 40px)',
              top: 'calc(50% - 40px)',
              width: '80px',
              height: '80px'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            whileHover={{ scale: 1.15 }}
            onClick={toggleCentralIcon}
          >
            {/* العقدة المركزية بنفس تصميم العقد الأخرى */}
            <motion.div
            className={`relative w-20 h-20 rounded-full backdrop-blur-lg border-2 border-white/40 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 ${
                facebookCentralMode
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                  : centralIconIsAI 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
              }`}
              animate={{
                boxShadow: facebookCentralMode ? [
                  "0 0 30px rgba(59, 130, 246, 0.6)",
                  "0 0 50px rgba(59, 130, 246, 0.9)",
                  "0 0 30px rgba(59, 130, 246, 0.6)"
                ] : centralIconIsAI ? [
                  "0 0 30px rgba(139, 92, 246, 0.6)",
                  "0 0 50px rgba(139, 92, 246, 0.9)",
                  "0 0 30px rgba(139, 92, 246, 0.6)"
                ] : [
                  "0 0 30px rgba(34, 211, 238, 0.5)",
                  "0 0 50px rgba(34, 211, 238, 0.8)",
                  "0 0 30px rgba(34, 211, 238, 0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.5 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* مؤشر الحالة - مخفي في جميع الحالات */}
              {/* 
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-green-500"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              />
              */}
              
              {/* أيقونة المركز - تتبديل بين Facebook و Sparkles و Share2 */}
              {facebookCentralMode ? (
                <Facebook className="w-8 h-8 text-white transition-all duration-300 group-hover:scale-110" />
              ) : centralIconIsAI ? (
                <Sparkles className="w-8 h-8 text-white transition-all duration-300 group-hover:scale-110" />
              ) : (
                <Share2 className="w-8 h-8 text-white transition-all duration-300 group-hover:scale-110" />
              )}
            </motion.div>
            
            {/* حذف اسم العقدة المركزية */}
          </motion.div>

          {/* Smooth animated lines connecting central node to each peripheral node */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5" xmlns="http://www.w3.org/2000/svg">
            {(facebookCentralMode ? facebookSubNodes : centralIconIsAI ? aiCoreFunctions : socialPlatforms).map((platform, index) => {
              const position = getPosition(platform);
              const isActive = index === activeIcon;
              const isHovered = hoveredIcon === index;
              
              return (
                <g key={`connection-group-${platform.name}`}>
                  {/* Main connection line */}
                  <motion.line
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${position.x}px)`}
                    y2={`calc(50% + ${position.y}px)`}
                    stroke="url(#lineGradient)"
                    strokeWidth={isActive || isHovered ? "2" : "1.5"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: isActive || isHovered ? 0.9 : 0.6 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: platform.delay + 0.8,
                      opacity: { duration: 0.3 }
                    }}
                  />
                  
                  {/* Animated data flow particles */}
                  {(isActive || isHovered) && (
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="2"
                      fill="rgba(34, 211, 238, 0.8)"
                      initial={{ 
                        cx: "50%", 
                        cy: "50%",
                        opacity: 0 
                      }}
                      animate={{
                        cx: `calc(50% + ${position.x}px)`,
                        cy: `calc(50% + ${position.y}px)`,
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                      }}
                    />
                  )}
                </g>
              );
            })}
            
            {/* Gradient definitions for smooth lines */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.8)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0.3)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Enhanced Interactive Platform Nodes - تعرض العقد المناسبة حسب الوضع */}
          {(facebookCentralMode ? facebookSubNodes : centralIconIsAI ? aiCoreFunctions : socialPlatforms).map((platform, index) => {
            const position = getPosition(platform);
            const isActive = index === activeIcon;
            const isHovered = hoveredIcon === index;
            const isSelected = selectedPlatform === platform.name;
            
            return (
              <motion.div
                key={platform.name}
                className="absolute group cursor-pointer z-20"
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                }}
                animate={{ 
                  opacity: 1, 
                  scale: isActive || isHovered ? 1.2 : isSelected ? 1.1 : 1,
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: platform.delay,
                  scale: { duration: 0.4, ease: "easeOut" }
                }}
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredIcon(index)}
                onMouseLeave={() => setHoveredIcon(null)}
                onClick={() => handlePlatformClick(platform, index)}
              >
                {/* Enhanced Data Flow Animation */}
                {(isActive || isHovered) && (
                  <motion.div
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, position.x * 0.8],
                      y: [0, position.y * 0.8],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: Math.random() * 2
                    }}
                  />
                )}
                
                {/* Enhanced Platform Container with better sizing */}
                <motion.div
                  className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${platform.color} backdrop-blur-lg border border-white/30 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500`}
                  animate={isActive ? {
                    boxShadow: [
                      "0 0 20px rgba(34, 211, 238, 0.4)",
                      "0 0 40px rgba(34, 211, 238, 0.7)",
                      "0 0 20px rgba(34, 211, 238, 0.4)"
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Status Indicator - مخفي في وضع الذكاء الاصطناعي */}
                  {!centralIconIsAI && (
                    <motion.div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        platform.status === 'active' ? 'bg-green-500' : 
                        platform.status === 'processing' ? 'bg-yellow-500' : 
                        platform.status === 'inactive' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`}
                      animate={platform.status === 'active' ? {
                        scale: [1, 1.3, 1],
                      } : platform.status === 'processing' ? {
                        rotate: [0, 360]
                      } : platform.status === 'inactive' ? {
                        opacity: [0.7, 1, 0.7]
                      } : {
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: platform.status === 'processing' ? 2 : 1.5, 
                        repeat: Infinity 
                      }}
                    />
                  )}
                  
                  <platform.Icon 
                    className={`w-6 h-6 ${platform.textColor} transition-all duration-300 group-hover:scale-110`} 
                  />
                </motion.div>
                
                {/* Platform Name - مخفي */}
                {/* <motion.div
                  className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-medium whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive || isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  {platform.name}
                </motion.div> */}
              </motion.div>
            );
          })}

          {/* Smart Data Flow Visualization */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`data-flow-${i}`}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              animate={{
                x: [
                  Math.random() * 500 - 250,
                  Math.random() * 500 - 250,
                  Math.random() * 500 - 250
                ],
                y: [
                  Math.random() * 500 - 250,
                  Math.random() * 500 - 250,
                  Math.random() * 500 - 250
                ],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 8
              }}
              style={{
                left: '50%',
                top: '50%',
              }}
            />
          ))}

          {/* Multiple Pulse Effects - محدثة لتنطلق من مركز العقدة الجديدة */}
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={`pulse-${ring}`}
              className="absolute pointer-events-none"
              style={{
                left: 'calc(50% - 40px)',
                top: 'calc(50% - 40px)',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [0, 2],
                opacity: [0.6, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeOut",
                delay: ring * 1.5
              }}
            >
              <div className="w-20 h-20 rounded-full border border-cyan-400/40" />
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
    </>
  );
};

export default AIDashboard;