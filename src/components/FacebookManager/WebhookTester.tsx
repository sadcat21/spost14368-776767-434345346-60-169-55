import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, RefreshCw, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const WebhookTester = () => {
  const [testing, setTesting] = useState(false);
  const [checkingComments, setCheckingComments] = useState(false);
  const [lastTest, setLastTest] = useState<any>(null);

  const testWebhook = async () => {
    setTesting(true);
    try {
      const webhookUrl = 'https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-webhook?test=true';
      
      const response = await fetch(webhookUrl);
      const result = await response.json();
      
      setLastTest({
        success: response.ok,
        status: response.status,
        data: result,
        timestamp: new Date().toISOString()
      });
      
      if (response.ok) {
        toast.success('الويب هوك يعمل بشكل طبيعي');
      } else {
        toast.error('خطأ في الويب هوك');
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setLastTest({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('فشل في اختبار الويب هوك');
    } finally {
      setTesting(false);
    }
  };

  const checkComments = async () => {
    setCheckingComments(true);
    try {
      const webhookUrl = 'https://msrtbumkztdwtoqysykf.supabase.co/functions/v1/facebook-webhook?check_comments=true';
      
      const response = await fetch(webhookUrl);
      const result = await response.json();
      
      if (response.ok) {
        toast.success('تم فحص التعليقات بنجاح');
        
        // البحث عن التعليقات المحفوظة من page_events
        const { data: comments, error } = await supabase
          .from('page_events')
          .select('*')
          .eq('event_type', 'comment')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (!error && comments) {
          toast.success(`تم العثور على ${comments.length} تعليقات حديثة`);
        }
      } else {
        toast.error('فشل في فحص التعليقات');
      }
    } catch (error) {
      console.error('Error checking comments:', error);
      toast.error('خطأ في فحص التعليقات');
    } finally {
      setCheckingComments(false);
    }
  };

  const viewRecentComments = async () => {
    try {
      const { data: comments, error } = await supabase
        .from('page_events')
        .select('*')
        .eq('event_type', 'comment')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        toast.error('فشل في جلب التعليقات');
        return;
      }
      
      if (!comments || comments.length === 0) {
        toast.info('لا توجد تعليقات في قاعدة البيانات');
        return;
      }
      
      // Get page names for each comment
      const pageIds = [...new Set(comments.map(c => c.page_id).filter(id => id))];
      const { data: pages } = await supabase
        .from('facebook_pages')
        .select('page_id, page_name')
        .in('page_id', pageIds);
      
      const pageMap = pages?.reduce((acc, page) => {
        acc[page.page_id] = page.page_name;
        return acc;
      }, {} as Record<string, string>) || {};
      
      const commentsInfo = comments.map(c => 
        `📝 ${c.user_name || 'مجهول'}: "${(c.content || '').substring(0, 50)}..." (${pageMap[c.page_id] || 'Unknown Page'})`
      ).join('\n');
      
      console.log('Recent comments:', commentsInfo);
      toast.success(`تم العثور على ${comments.length} تعليقات`);
    } catch (error) {
      console.error('Error viewing comments:', error);
      toast.error('خطأ في عرض التعليقات');
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <TestTube className="h-5 w-5" />
          اختبار الويب هوك والتعليقات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            استخدم هذه الأدوات لاختبار الويب هوك وفحص التعليقات يدوياً
          </AlertDescription>
        </Alert>

        {/* Test Results */}
        {lastTest && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {lastTest.success ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  نجح الاختبار
                </Badge>
              ) : (
                <Badge variant="destructive">
                  فشل الاختبار
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {new Date(lastTest.timestamp).toLocaleString('ar')}
              </span>
            </div>
            
            {lastTest.data && (
              <pre className="text-xs bg-background p-2 rounded overflow-auto">
                {JSON.stringify(lastTest.data, null, 2)}
              </pre>
            )}
            
            {lastTest.error && (
              <div className="text-red-600 text-sm">
                خطأ: {lastTest.error}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testWebhook}
            disabled={testing}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {testing ? "جاري الاختبار..." : "اختبار الويب هوك"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={checkComments}
            disabled={checkingComments}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {checkingComments ? "جاري الفحص..." : "فحص التعليقات يدوياً"}
          </Button>
          
          <Button 
            variant="secondary"
            onClick={viewRecentComments}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            عرض التعليقات الحديثة
          </Button>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>تعليمات:</strong><br/>
            1. اختبار الويب هوك: يتحقق من أن الويب هوك يعمل<br/>
            2. فحص التعليقات: يبحث عن تعليقات جديدة في جميع الصفحات النشطة<br/>
            3. عرض التعليقات: يعرض آخر التعليقات المحفوظة في قاعدة البيانات
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};