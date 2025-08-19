import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  BarChart3, 
  Zap,
  Users,
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';

export const FeaturesSidebar = () => {
  const features = [
    {
      icon: Brain,
      title: 'إدارة المحتوى بذكاء',
      description: 'إنشاء محتوى مخصص باستخدام الذكاء الاصطناعي',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Calendar,
      title: 'جدولة المنشورات بسهولة',
      description: 'برمج منشوراتك مسبقاً عبر جميع المنصات',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      icon: BarChart3,
      title: 'متابعة التفاعل والنتائج',
      description: 'تحليلات مفصلة لأداء المحتوى الخاص بك',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: Zap,
      title: 'أتمتة ذكية متقدمة',
      description: 'نشر تلقائي مع استجابة فورية للتعليقات',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  const stats = [
    { value: '10+', label: 'منصات اجتماعية', icon: Users },
    { value: '99%', label: 'وقت تشغيل', icon: TrendingUp },
    { value: '24/7', label: 'دعم مستمر', icon: Shield },
    { value: 'AI', label: 'ذكاء اصطناعي', icon: Sparkles }
  ];

  return (
    <div className="hidden lg:flex flex-col w-80 p-8 glass-effect">
      {/* عنوان القسم */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          لماذا Spost؟
        </h2>
        <p className="text-muted-foreground text-sm">
          اكتشف قوة إدارة المحتوى الذكية
        </p>
      </motion.div>

      {/* الميزات الرئيسية */}
      <div className="space-y-6 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
            className="group hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-lg hover:bg-white/5 transition-colors duration-300">
              <div className={`p-2 rounded-lg ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* الإحصائيات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="grid grid-cols-2 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.05 }}
            className="text-center p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-all duration-300"
          >
            <stat.icon className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* رسالة الثقة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="mt-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-400">آمان تام</span>
        </div>
        <p className="text-xs text-green-300">
          🔒 بياناتك محمية ومشفرة 100%
        </p>
      </motion.div>
    </div>
  );
};