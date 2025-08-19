import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  BarChart3, 
  Zap,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  Cpu,
  Target,
  Rocket,
  Globe
} from 'lucide-react';

export const SmartFeatureCards = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: 'إدارة المحتوى بذكاء',
      description: 'إنشاء محتوى مخصص باستخدام الذكاء الاصطناعي المتطور',
      gradient: 'from-blue-500 to-purple-600',
      shadowColor: 'shadow-blue-500/25',
      stats: '+500% كفاءة'
    },
    {
      icon: Calendar,
      title: 'جدولة المنشورات بسهولة',
      description: 'برمج منشوراتك مسبقاً عبر جميع المنصات الاجتماعية',
      gradient: 'from-green-500 to-teal-600',
      shadowColor: 'shadow-green-500/25',
      stats: '24/7 نشر'
    },
    {
      icon: BarChart3,
      title: 'تحليلات متقدمة',
      description: 'تحليلات مفصلة وتقارير ذكية لأداء المحتوى الخاص بك',
      gradient: 'from-orange-500 to-red-600',
      shadowColor: 'shadow-orange-500/25',
      stats: '+300% نمو'
    },
    {
      icon: Zap,
      title: 'أتمتة ذكية',
      description: 'نشر تلقائي مع استجابة فورية للتعليقات والرسائل',
      gradient: 'from-yellow-500 to-orange-600',
      shadowColor: 'shadow-yellow-500/25',
      stats: '99.9% دقة'
    },
    {
      icon: Target,
      title: 'استهداف دقيق',
      description: 'وصل للجمهور المناسب في الوقت المناسب بدقة عالية',
      gradient: 'from-pink-500 to-rose-600',
      shadowColor: 'shadow-pink-500/25',
      stats: '+250% تفاعل'
    },
    {
      icon: Globe,
      title: 'نشر عالمي',
      description: 'انشر محتواك عبر أكثر من 10 منصات اجتماعية بضغطة واحدة',
      gradient: 'from-indigo-500 to-blue-600',
      shadowColor: 'shadow-indigo-500/25',
      stats: '10+ منصات'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-96 p-6 relative">
      {/* عنوان القسم */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.h2 
          className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          لماذا Spost؟
        </motion.h2>
        <p className="text-muted-foreground">
          اكتشف قوة إدارة المحتوى الذكية
        </p>
      </motion.div>

      {/* البطاقات المتحركة */}
      <div className="relative w-full h-80 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            transition={{
              duration: 0.8,
              ease: [0.175, 0.885, 0.32, 1.275]
            }}
            className="absolute inset-0"
          >
            <div 
              className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${features[currentFeature].gradient} ${features[currentFeature].shadowColor} shadow-2xl backdrop-blur-sm border border-white/10 overflow-hidden transform perspective-1000`}
            >
              {/* خلفية متوهجة */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
              
              {/* محتوى البطاقة */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                {/* الأيقونة والعنوان */}
                <div className="text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {React.createElement(features[currentFeature].icon, { className: "w-8 h-8 text-white" })}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-bold text-white mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {features[currentFeature].title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-white/90 text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {features[currentFeature].description}
                  </motion.p>
                </div>

                {/* الإحصائية */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                    <Sparkles className="w-4 h-4 text-white mr-2" />
                    <span className="text-white font-semibold text-sm">
                      {features[currentFeature].stats}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* تأثير الضوء */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* مؤشرات التقدم */}
      <div className="flex space-x-2 rtl:space-x-reverse mt-6">
        {features.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentFeature ? 'bg-primary w-8' : 'bg-white/30'
            }`}
            onClick={() => setCurrentFeature(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
        ))}
      </div>

      {/* إحصائيات جانبية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8 grid grid-cols-2 gap-4 w-full"
      >
        {[
          { value: '10+', label: 'منصات', icon: Users },
          { value: 'AI', label: 'ذكاء اصطناعي', icon: Cpu },
          { value: '24/7', label: 'دعم مستمر', icon: Shield },
          { value: '99%', label: 'وقت تشغيل', icon: TrendingUp }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {React.createElement(stat.icon, { className: "h-4 w-4 text-primary mx-auto mb-1" })}
            <div className="text-lg font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};