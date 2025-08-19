import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  Activity, 
  Eye, 
  Heart, 
  MessageCircle,
  Share,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateInArabic, getCurrentTimeInArabic } from "@/utils/dateUtils";

interface PageEvent {
  id: string;
  event_type: 'comment' | 'message' | 'reaction' | 'post' | 'webhook';
  created_at: string;
  content: string;
  status: 'success' | 'failed' | 'pending';
  response_content?: string;
  page_id?: string;
  post_id?: string;
  comment_id?: string;
  message_id?: string;
  user_id?: string;
  user_name?: string;
  post_content?: string;
  auto_replied?: boolean;
  is_offensive?: boolean;
  error_message?: string;
  metadata?: any;
}

const EventsPage = () => {
  const [events, setEvents] = useState<PageEvent[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // ردود التعليقات
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [repliesMap, setRepliesMap] = useState<Record<string, any[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  // جلب الأحداث من قاعدة البيانات
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('خطأ في جلب الأحداث:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب أحداث الصفحات",
          variant: "destructive"
        });
        return;
      }

      setEvents((data || []).map(item => ({
        ...item,
        event_type: item.event_type as PageEvent['event_type'],
        status: item.status as PageEvent['status']
      })));
      setLastUpdate(new Date());
      console.log('تم جلب الأحداث بنجاح:', data?.length, 'حدث');
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بقاعدة البيانات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث تلقائي كل دقيقة مع عداد
  useEffect(() => {
    fetchEvents(); // جلب البيانات عند تحميل الصفحة

    const updateInterval = setInterval(() => {
      fetchEvents();
      setCountdown(60); // إعادة تعيين العداد
    }, 60000); // كل دقيقة

    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 60);
    }, 1000); // كل ثانية

    return () => {
      clearInterval(updateInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // إعطاء أولوية للبيانات الحقيقية من قاعدة البيانات
  useEffect(() => {
    // لا نضع بيانات وهمية، سنعتمد على البيانات الحقيقية فقط
  }, []);

  const getEventIcon = (type: string, status: string) => {
    if (status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-warning" />;
    
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'reaction':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'post':
        return <Share className="h-4 w-4 text-purple-500" />;
      case 'webhook':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">نجح</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      case 'pending':
        return <Badge variant="secondary">في الانتظار</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const filteredEvents = events.filter(event => {
    if (eventFilter === 'all') return true;
    return event.event_type === eventFilter;
  });

  const stats = {
    total: events.length,
    comments: events.filter(e => e.event_type === 'comment').length,
    messages: events.filter(e => e.event_type === 'message').length,
    successful: events.filter(e => e.status === 'success').length,
    failed: events.filter(e => e.status === 'failed').length
  };

  const refreshData = () => {
    fetchEvents();
    setCountdown(60);
    toast({
      title: "تم تحديث البيانات",
      description: "تم جلب أحدث الأحداث بنجاح"
    });
  };

  // تحميل ردود تعليق محدد
  const loadReplies = async (ev: PageEvent) => {
    if (!ev.comment_id) return;
    setLoadingReplies(prev => ({ ...prev, [ev.id]: true }));
    try {
      // البحث عن ردود في نفس الجدول باستخدام metadata أو post_id
      const { data, error } = await supabase
        .from('page_events')
        .select('*')
        .eq('event_type', 'comment')
        .eq('post_id', ev.post_id)
        .neq('id', ev.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('خطأ في جلب الردود:', error);
        toast({ title: 'خطأ في جلب الردود', variant: 'destructive' });
        return;
      }
      
      // تحويل البيانات إلى تنسيق مناسب للعرض
      const replies = (data || []).map(reply => ({
        comment_id: reply.comment_id,
        commenter_name: reply.user_name,
        comment_text: reply.content,
        created_at: reply.created_at,
        is_replied: reply.auto_replied
      }));
      
      setRepliesMap(prev => ({ ...prev, [ev.id]: replies }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [ev.id]: false }));
    }
  };

  const handleToggleReplies = async (ev: PageEvent) => {
    const isOpen = !!openReplies[ev.id];
    setOpenReplies(prev => ({ ...prev, [ev.id]: !isOpen }));
    if (!isOpen && !repliesMap[ev.id]) {
      await loadReplies(ev);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              أحداث الصفحات
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            متابعة جميع التفاعلات والردود التلقائية على صفحات فيسبوك
          </p>
          
          {/* شريط المعلومات والعداد */}
          <div className="flex items-center justify-center gap-6 bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">التحديث القادم خلال: {countdown} ثانية</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              <span className="text-sm">آخر تحديث: {formatDateInArabic(lastUpdate, true)}</span>
            </div>
            <Button 
              onClick={refreshData} 
              size="sm" 
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث الآن
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-semibold">المجموع</span>
              </div>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">تعليقات</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{stats.comments}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span className="font-semibold">رسائل</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.messages}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold">نجح</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="font-semibold">فشل</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={() => setEventFilter('all')}>جميع الأحداث</TabsTrigger>
            <TabsTrigger value="comment" onClick={() => setEventFilter('comment')}>التعليقات</TabsTrigger>
            <TabsTrigger value="message" onClick={() => setEventFilter('message')}>الرسائل</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  سجل الأحداث المباشر
                </CardTitle>
                <CardDescription>
                  جميع التفاعلات والردود التلقائية على صفحاتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {filteredEvents.map((event, index) => (
                      <div key={event.id}>
                         <div className="flex items-start gap-4 p-4 rounded-lg border border-muted">
                           <div className="flex-shrink-0 mt-1">
                             {getEventIcon(event.event_type, event.status)}
                           </div>
                          
                          <div className="flex-1 space-y-3">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <span className="font-semibold">
                                   {event.user_name || 'مستخدم غير معروف'}
                                 </span>
                                 <Badge variant="outline">
                                   {event.event_type === 'comment' ? 'تعليق' : 
                                    event.event_type === 'message' ? 'رسالة' : 
                                    event.event_type === 'webhook' ? 'ويب هوك' : event.event_type}
                                 </Badge>
                                 {getStatusBadge(event.status)}
                               </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatDateInArabic(event.created_at, true)}
                                </span>
                             </div>
                            
                            <div className="bg-muted/50 p-3 rounded-md">
                              <p className="text-sm">{event.content}</p>
                            </div>

                            {event.comment_id && (
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                {event.metadata?.page_name && (
                                  <Badge variant="outline">{event.metadata.page_name}</Badge>
                                )}
                                {event.metadata?.comment_permalink && (
                                  <a
                                    href={event.metadata.comment_permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    رابط التعليق
                                  </a>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleReplies(event)}
                                  className="inline-flex items-center gap-1"
                                >
                                  {openReplies[event.id] ? (
                                    <><ChevronUp className="h-4 w-4" /> إخفاء الردود</>
                                  ) : (
                                    <><ChevronDown className="h-4 w-4" /> إظهار الردود</>
                                  )}
                                </Button>
                              </div>
                            )}

                            {openReplies[event.id] && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                {loadingReplies[event.id] ? (
                                  <p className="text-sm text-muted-foreground">جاري تحميل الردود...</p>
                                ) : (repliesMap[event.id]?.length ? (
                                  <div className="space-y-3">
                                    {repliesMap[event.id]!.map((r, idx) => (
                                      <div key={idx} className="flex items-start gap-3">
                                        <Badge variant="secondary">{r.commenter_name || 'مستخدم'}</Badge>
                                        <span className="text-xs text-muted-foreground">{formatDateInArabic(r.created_at, true)}</span>
                                        <p className="text-sm flex-1">{r.comment_text}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">لا توجد ردود بعد</p>
                                ))}
                              </div>
                            )}
                              
                              {event.post_content && (
                               <div className="text-sm text-muted-foreground">
                                 <strong>محتوى المنشور:</strong> {event.post_content}
                                 {event.post_content === 'غير متاح' && (
                                   <AlertTriangle className="inline h-4 w-4 text-warning ml-2" />
                                 )}
                               </div>
                             )}
                             
                             {event.response_content && (
                               <div className="bg-primary/10 p-3 rounded-md border-r-4 border-primary">
                                 <p className="text-sm"><strong>الرد التلقائي:</strong> {event.response_content}</p>
                               </div>
                             )}
                             
                             {event.status === 'failed' && (
                               <div className="bg-destructive/10 p-3 rounded-md border-r-4 border-destructive">
                                 <p className="text-sm text-destructive">
                                   <strong>سبب الفشل:</strong> {event.error_message || 'فشل في تحليل محتوى المنشور أو إرسال الرد'}
                                 </p>
                               </div>
                             )}
                             
                             {event.auto_replied && (
                               <div className="flex items-center gap-2 text-sm text-green-600">
                                 <CheckCircle className="h-4 w-4" />
                                 <span>تم الرد تلقائياً</span>
                               </div>
                             )}
                          </div>
                        </div>
                        {index < filteredEvents.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comment">
            <Card>
              <CardHeader>
                <CardTitle>أحداث التعليقات</CardTitle>
                <CardDescription>
                  جميع التعليقات والردود التلقائية عليها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  سيتم عرض أحداث التعليقات هنا
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="message">
            <Card>
              <CardHeader>
                <CardTitle>أحداث الرسائل</CardTitle>
                <CardDescription>
                  جميع الرسائل الخاصة والردود التلقائية عليها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  سيتم عرض أحداث الرسائل هنا
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>تحليلات الأداء</CardTitle>
                <CardDescription>
                  إحصائيات مفصلة حول أداء النظام التلقائي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">معدل النجاح</h3>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full" 
                        style={{ width: `${(stats.successful / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((stats.successful / stats.total) * 100)}% من العمليات نجحت
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">أكثر المشاكل شيوعاً</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        عدم توفر محتوى المنشور
                      </li>
                      <li className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        فشل في إرسال الرد
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأحداث</CardTitle>
                <CardDescription>
                  تخصيص عرض وإدارة أحداث الصفحات
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span>تحديث تلقائي كل دقيقة</span>
                     <Badge variant="default" className="bg-green-500">مُفعل</Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>إشعارات عند الفشل</span>
                     <Badge variant="default" className="bg-green-500">مُفعل</Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>حفظ السجل لمدة 30 يوم</span>
                     <Badge variant="default" className="bg-green-500">مُفعل</Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>عدد الأحداث المحملة</span>
                     <Badge variant="outline">{events.length}</Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>معرف الصفحة الحالية</span>
                     <Badge variant="outline">{selectedPage}</Badge>
                   </div>
                   <Button onClick={refreshData} className="w-full">
                     تحديث البيانات الآن
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsPage;