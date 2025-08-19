import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Clock, CheckCircle, XCircle, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CronJobResponse {
  timestamp: string;
  response: string;
  success: boolean;
  trigger: string;
  processed_count?: number;
  cron_jobs_disabled?: boolean;
}

interface CronJobHistoryButtonProps {
  pageId: string;
  pageName: string;
  cronjobId?: string;
}

export const CronJobHistoryButton: React.FC<CronJobHistoryButtonProps> = ({ 
  pageId, 
  pageName, 
  cronjobId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<CronJobResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCronJobHistory = async () => {
    if (!cronjobId) {
      toast.error("لا يوجد معرف مهمة للصفحة");
      return;
    }

    setLoading(true);
    
    try {
      // محاكاة استدعاء API للحصول على تاريخ cron job من cron-job.org
      const CRONJOB_API_KEY = 'GaRmebqvWDdSkPnMrgJsQoZw8OMan0gVo1Ny+v+UZNE=';
      const response = await fetch(`https://api.cron-job.org/jobs/${cronjobId}/history`, {
        headers: {
          'Authorization': `Bearer ${CRONJOB_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`فشل في جلب التاريخ: ${response.status}`);
      }

      const data = await response.json();
      
      // تحويل البيانات إلى الصيغة المطلوبة
      const formattedHistory: CronJobResponse[] = (data.history || [])
        .slice(0, 20) // أحدث 20 تنفيذ
        .map((item: any) => ({
          timestamp: item.date || new Date().toISOString(),
          response: item.response || 'لا توجد استجابة',
          success: item.statusCode >= 200 && item.statusCode < 300,
          trigger: 'CRON_SECRET',
          processed_count: 0,
          cron_jobs_disabled: item.response?.includes('disabled') || false
        }));

      setHistory(formattedHistory);
      
    } catch (error) {
      console.error('خطأ في جلب تاريخ cron job:', error);
      
      // بيانات تجريبية في حالة الخطأ
      const mockHistory: CronJobResponse[] = [
        {
          timestamp: new Date().toISOString(),
          response: JSON.stringify({
            success: true,
            message: "No active subscriptions found - all cron jobs disabled",
            trigger: "CRON_SECRET",
            processed_count: 0,
            cron_jobs_disabled: true
          }),
          success: true,
          trigger: 'CRON_SECRET',
          processed_count: 0,
          cron_jobs_disabled: true
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(), // ساعة مضت
          response: JSON.stringify({
            success: true,
            message: "Content generated and published successfully",
            trigger: "CRON_SECRET",
            processed_count: 1
          }),
          success: true,
          trigger: 'CRON_SECRET',
          processed_count: 1
        },
        {
          timestamp: new Date(Date.now() - 7200000).toISOString(), // ساعتان مضتا
          response: JSON.stringify({
            success: false,
            error: "API rate limit exceeded",
            trigger: "CRON_SECRET"
          }),
          success: false,
          trigger: 'CRON_SECRET'
        }
      ];
      
      setHistory(mockHistory);
      toast.warning("تم عرض بيانات تجريبية - تعذر الاتصال بـ API");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    fetchCronJobHistory();
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'تاريخ غير صحيح';
    }
  };

  const parseResponse = (responseText: string) => {
    try {
      return JSON.parse(responseText);
    } catch {
      return { message: responseText };
    }
  };

  const getStatusIcon = (success: boolean, cronJobsDisabled?: boolean) => {
    if (cronJobsDisabled) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (success: boolean, cronJobsDisabled?: boolean) => {
    if (cronJobsDisabled) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">تم الإيقاف</Badge>;
    }
    return success ? 
      <Badge variant="default" className="bg-green-100 text-green-800">نجح</Badge> : 
      <Badge variant="destructive">فشل</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="flex items-center gap-2"
          disabled={!cronjobId}
        >
          <History className="h-4 w-4" />
          تاريخ التنفيذ
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[85vh] bg-gradient-to-br from-background via-background/95 to-secondary/20 border-2 border-primary/10 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 shadow-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            تاريخ تنفيذ مهام الأتمتة - {pageName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* معلومات الصفحة */}
          <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5" />
                </div>
                معلومات المهمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 hover:scale-105 transition-transform duration-200">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">اسم الصفحة</div>
                  <div className="font-bold text-blue-900 dark:text-blue-100 mt-1">{pageName}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 hover:scale-105 transition-transform duration-200">
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider">معرف المهمة</div>
                  <div className="font-bold text-purple-900 dark:text-purple-100 mt-1 font-mono text-sm">{cronjobId || 'غير محدد'}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700 hover:scale-105 transition-transform duration-200">
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider">آخر تحديث</div>
                  <div className="font-bold text-green-900 dark:text-green-100 mt-1 text-sm">{formatTimestamp(new Date().toISOString())}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-200 dark:border-orange-700 hover:scale-105 transition-transform duration-200">
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wider">عدد التنفيذات</div>
                  <div className="font-bold text-orange-900 dark:text-orange-100 mt-1 text-2xl">{history.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تاريخ التنفيذ */}
          <Card className="border-2 border-primary/10 bg-gradient-to-br from-background via-background/98 to-primary/5 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-3 text-primary">
                <div className="p-2 rounded-lg bg-primary/10">
                  <History className="h-5 w-5" />
                </div>
                سجل التنفيذ
                <div className="mr-auto">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {history.length} تنفيذ
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse"></div>
                    </div>
                    <span className="text-lg font-medium text-primary animate-pulse">جاري التحميل...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="p-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 w-fit mx-auto">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-medium text-muted-foreground">لا يوجد تاريخ تنفيذ بعد</p>
                      <p className="text-sm text-muted-foreground">ستظهر هنا سجلات تنفيذ المهام التلقائية</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item, index) => {
                      const parsedResponse = parseResponse(item.response);
                      const isSuccess = item.success;
                      const isDisabled = item.cron_jobs_disabled;
                      
                      return (
                        <div 
                          key={index} 
                          className={`group relative border-2 rounded-xl p-5 space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                            isDisabled 
                              ? 'border-orange-200 bg-gradient-to-r from-orange-50/80 via-orange-50/40 to-yellow-50/80 hover:from-orange-100 hover:to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20' 
                              : isSuccess 
                                ? 'border-green-200 bg-gradient-to-r from-green-50/80 via-emerald-50/40 to-teal-50/80 hover:from-green-100 hover:to-teal-100 dark:from-green-900/20 dark:to-teal-900/20' 
                                : 'border-red-200 bg-gradient-to-r from-red-50/80 via-pink-50/40 to-rose-50/80 hover:from-red-100 hover:to-rose-100 dark:from-red-900/20 dark:to-rose-900/20'
                          }`}
                        >
                          {/* Decorative gradient overlay */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Header */}
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl shadow-md ${
                                isDisabled 
                                  ? 'bg-gradient-to-r from-orange-400 to-yellow-400' 
                                  : isSuccess 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                                    : 'bg-gradient-to-r from-red-400 to-pink-400'
                              }`}>
                                {getStatusIcon(item.success, item.cron_jobs_disabled)}
                              </div>
                              <div className="space-y-1">
                                <div className="font-bold text-lg text-foreground">
                                  {formatTimestamp(item.timestamp)}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium">
                                  المؤشر #{history.length - index}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getStatusBadge(item.success, item.cron_jobs_disabled)}
                              <Badge variant="outline" className="text-xs bg-white/50 backdrop-blur-sm border-gray-300">
                                {item.trigger}
                              </Badge>
                            </div>
                          </div>

                          {/* Response Details */}
                          <div className="relative space-y-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-2">
                              <div className="font-semibold text-foreground text-sm">الرسالة:</div> 
                              <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                {parsedResponse.message || 'لا توجد رسالة'}
                              </div>
                            </div>
                            
                            {parsedResponse.processed_count !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-foreground text-sm">عدد المعالج:</div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                  {parsedResponse.processed_count}
                                </Badge>
                              </div>
                            )}
                            
                            {parsedResponse.cron_jobs_disabled && (
                              <div className="flex items-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <div className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                                  تم إيقاف مهام الأتمتة تلقائياً لعدم وجود اشتراكات نشطة
                                </div>
                              </div>
                            )}
                            
                            {parsedResponse.error && (
                              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-700">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <div className="text-red-700 dark:text-red-300 text-sm font-medium">
                                  خطأ: {parsedResponse.error}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Raw Response */}
                          <details className="group/details">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 select-none p-2 rounded bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700">
                              <span className="font-medium">عرض الاستجابة الكاملة</span>
                              <span className="float-left group-open/details:rotate-180 transition-transform duration-200">▼</span>
                            </summary>
                            <div className="mt-3 p-4 bg-gray-900 dark:bg-gray-950 rounded-lg border border-gray-700 shadow-inner">
                              <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(JSON.parse(item.response || '{}'), null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};