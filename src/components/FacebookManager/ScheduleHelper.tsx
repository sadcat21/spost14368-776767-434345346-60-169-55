import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { formatDateInArabic } from "@/utils/dateUtils";

interface ScheduleHelperProps {
  scheduledTime?: string;
  isScheduled: boolean;
}

export const ScheduleHelper = ({ scheduledTime, isScheduled }: ScheduleHelperProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isScheduled || !scheduledTime) {
    return null;
  }

  const getScheduleInfo = () => {
    try {
      const scheduledDate = new Date(scheduledTime);
      const now = new Date();
      const diffMs = scheduledDate.getTime() - now.getTime();
      const diffMinutes = Math.ceil(diffMs / (60 * 1000));
      const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
      
      const unixTimestamp = Math.floor(scheduledDate.getTime() / 1000);
      const currentUnixTime = Math.floor(now.getTime() / 1000);
      
      const isValid = !isNaN(scheduledDate.getTime()) && 
                     scheduledDate > now && 
                     diffMinutes >= 10 && 
                     diffDays <= 75;

      let timeDescription = "";
      if (diffMinutes < 60) {
        timeDescription = `خلال ${diffMinutes} دقيقة`;
      } else if (diffHours < 24) {
        timeDescription = `خلال ${diffHours} ساعة`;
      } else {
        timeDescription = `خلال ${diffDays} يوم`;
      }

      return {
        isValid,
        scheduledDate,
        diffMinutes,
        diffHours,
        diffDays,
        timeDescription,
        unixTimestamp,
        currentUnixTime,
        englishDate: formatDateInArabic(scheduledDate, true)
      };
    } catch (error) {
      return null;
    }
  };

  const scheduleInfo = getScheduleInfo();

  if (!scheduleInfo) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          تنسيق التاريخ والوقت غير صحيح
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusBadge = () => {
    if (scheduleInfo.isValid) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          جاهز للجدولة
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          وقت غير صالح
        </Badge>
      );
    }
  };

  const getValidationIssues = () => {
    const issues = [];
    
    if (isNaN(scheduleInfo.scheduledDate.getTime())) {
      issues.push("تنسيق التاريخ غير صحيح");
    }
    
    if (scheduleInfo.scheduledDate <= new Date()) {
      issues.push("التاريخ في الماضي");
    }
    
    if (scheduleInfo.diffMinutes < 10) {
      issues.push(`الوقت قريب جداً (${scheduleInfo.diffMinutes} دقيقة) - يجب أن يكون بعد 10 دقائق على الأقل`);
    }
    
    if (scheduleInfo.diffDays > 75) {
      issues.push("التاريخ بعيد جداً (أكثر من 75 يوم)");
    }
    
    return issues;
  };

  const validationIssues = getValidationIssues();

  return (
    <Card className="shadow-sm border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            معلومات الجدولة
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <div className="font-medium mb-1">موعد النشر:</div>
          <div className="text-muted-foreground">
            {scheduleInfo.englishDate}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {scheduleInfo.timeDescription}
          </div>
        </div>

        {validationIssues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">مشاكل في التوقيت:</div>
              <ul className="list-disc list-inside text-xs space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {scheduleInfo.isValid && scheduleInfo.diffMinutes < 15 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              الوقت المجدول قريب ({scheduleInfo.diffMinutes} دقيقة). تأكد من أنك تريد النشر في هذا التوقيت.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
          >
            {showDetails ? "إخفاء" : "عرض"} التفاصيل التقنية
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs"
          >
            <a 
              href="https://developers.facebook.com/docs/graph-api/reference/page/feed#publish" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              دليل فيسبوك
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        {showDetails && (
          <div className="bg-muted rounded-lg p-3 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Unix Timestamp:</span>
                <div className="font-mono">{scheduleInfo.unixTimestamp}</div>
              </div>
              <div>
                <span className="font-medium">التاريخ الحالي:</span>
                <div className="font-mono">{scheduleInfo.currentUnixTime}</div>
              </div>
              <div>
                <span className="font-medium">الفرق بالثواني:</span>
                <div className="font-mono">{scheduleInfo.unixTimestamp - scheduleInfo.currentUnixTime}</div>
              </div>
              <div>
                <span className="font-medium">الفرق بالدقائق:</span>
                <div className="font-mono">{scheduleInfo.diffMinutes}</div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="font-medium mb-1">متطلبات فيسبوك:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>الحد الأدنى: 10 دقائق من الآن</li>
                <li>الحد الأقصى: 75 يوم من الآن</li>
                <li>التنسيق: Unix timestamp بالثواني</li>
                <li>يجب أن يكون published=false للجدولة</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};