import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { geminiApiManager } from "../utils/geminiApiManager";
import { RefreshCw, Key, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export const GeminiApiStatus = () => {
  const [stats, setStats] = useState(geminiApiManager.getKeyStats());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats(geminiApiManager.getKeyStats());
      setIsRefreshing(false);
      toast.success("تم تحديث إحصائيات المفاتيح");
    }, 500);
  };

  const resetFailedKeys = () => {
    geminiApiManager.resetAllFailedKeys();
    setStats(geminiApiManager.getKeyStats());
    toast.success("تم إعادة تعيين جميع المفاتيح الفاشلة");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(geminiApiManager.getKeyStats());
    }, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (stats.failedKeys === stats.totalKeys) return "bg-destructive";
    if (stats.failedKeys > stats.totalKeys / 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (stats.failedKeys === stats.totalKeys) return <AlertTriangle className="h-4 w-4" />;
    if (stats.failedKeys > 0) return <Settings className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const healthPercentage = ((stats.activeKeys / stats.totalKeys) * 100);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            حالة مفاتيح Gemini API
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStats}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* مؤشر الصحة العامة */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>صحة النظام</span>
            <span>{Math.round(healthPercentage)}%</span>
          </div>
          <Progress value={healthPercentage} className="h-2" />
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.activeKeys}</div>
            <div className="text-xs text-muted-foreground">نشط</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.failedKeys}</div>
            <div className="text-xs text-muted-foreground">معطل</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.totalKeys}</div>
            <div className="text-xs text-muted-foreground">إجمالي</div>
          </div>
        </div>

        {/* المفتاح الحالي */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs font-medium">المفتاح الحالي:</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {stats.currentKey}
          </Badge>
        </div>

        {/* حالة التنبيه */}
        {stats.failedKeys > 0 && (
          <div className="space-y-2">
            <div className={`p-2 rounded-lg text-white text-xs ${getStatusColor()}`}>
              {stats.failedKeys === stats.totalKeys 
                ? "⚠️ جميع المفاتيح معطلة! يرجى المحاولة لاحقاً"
                : `🔄 ${stats.failedKeys} مفتاح معطل مؤقتاً - التبديل التلقائي نشط`
              }
            </div>
            
            {stats.activeKeys > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFailedKeys}
                className="w-full text-xs"
              >
                إعادة تعيين المفاتيح المعطلة
              </Button>
            )}
          </div>
        )}

        {/* نصائح */}
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded-lg">
          💡 النظام يتبدل تلقائياً بين المفاتيح عند استنفاد الحصة
        </div>
      </CardContent>
    </Card>
  );
};