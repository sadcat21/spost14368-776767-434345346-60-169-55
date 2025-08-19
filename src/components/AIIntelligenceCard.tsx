import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, TrendingUp } from "lucide-react";

interface AIIntelligenceNode {
  Icon: React.ComponentType<any>;
  name: string;
  color: string;
  textColor: string;
  delay: number;
  metrics: Record<string, string>;
  status: string;
  angle: number;
  radius: number;
}

interface AIIntelligenceCardProps {
  hoveredNode: AIIntelligenceNode;
}

export const AIIntelligenceCard = ({ hoveredNode }: AIIntelligenceCardProps) => {
  const { Icon, name, metrics, status } = hoveredNode;

  // تحديد اللون والأيقونة بناءً على حالة العقدة
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { 
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50", 
          icon: Zap,
          text: "نشط" 
        };
      case "trending":
        return { 
          color: "bg-orange-500/20 text-orange-400 border-orange-500/50", 
          icon: TrendingUp,
          text: "متطور" 
        };
      default:
        return { 
          color: "bg-blue-500/20 text-blue-400 border-blue-500/50", 
          icon: Brain,
          text: "متاح" 
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-80 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${hoveredNode.color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{name}</h3>
              <p className="text-purple-300 text-sm">مدعوم بالذكاء الاصطناعي</p>
            </div>
          </div>
          <Badge className={`${statusInfo.color} flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.text}
          </Badge>
        </div>

        {/* AI Metrics */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(metrics).map(([key, value], index) => (
              <motion.div
                key={key}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-purple-300 text-xs font-medium mb-1 capitalize">
                  {getMetricLabel(key)}
                </div>
                <div className="text-white font-bold text-lg">{value}</div>
              </motion.div>
            ))}
          </div>

          {/* AI Performance Indicator */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">كفاءة الذكاء الاصطناعي</span>
              <span className="text-white font-semibold">98.5%</span>
            </div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "98.5%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* AI Insights */}
          <div className="mt-4 flex items-center gap-2 text-sm text-purple-300">
            <Brain className="w-4 h-4" />
            <span>محسّن بخوارزميات التعلم العميق</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// دالة مساعدة لترجمة أسماء المقاييس
const getMetricLabel = (key: string): string => {
  const labels: Record<string, string> = {
    accuracy: "الدقة",
    speed: "السرعة", 
    models: "النماذج",
    generated: "المُولد",
    quality: "الجودة",
    variations: "التنويعات",
    optimization: "التحسين",
    insights: "الرؤى",
    reports: "التقارير",
    images: "الصور",
    detection: "الكشف",
    objects: "الكائنات",
    datasets: "مجموعات البيانات",
    predictions: "التنبؤات",
    segments: "الشرائح",
    behavior: "السلوك",
    growth: "النمو",
    workflows: "سير العمل",
    efficiency: "الكفاءة",
    tasks: "المهام",
    scores: "النقاط",
    reviews: "المراجعات",
    improvements: "التحسينات"
  };
  
  return labels[key] || key;
};