import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Clock, 
  Edit, 
  Trash2, 
  Plus, 
  CalendarIcon, 
  RefreshCw, 
  AlertTriangle,
  Send,
  Image as ImageIcon
} from "lucide-react";
import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface ScheduledPost {
  id: string;
  message: string;
  scheduled_publish_time: string;
  created_time: string;
  status_type?: string;
  picture?: string;
  full_picture?: string;
}

interface ScheduledPostsManagerProps {
  selectedPage: FacebookPage;
}

export const ScheduledPostsManager = ({ selectedPage }: ScheduledPostsManagerProps) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  
  // New/Edit post form state
  const [postMessage, setPostMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");

  // Load scheduled posts with improved error handling
  const loadScheduledPosts = async () => {
    setLoading(true);
    try {
      console.log("🔄 بدء تحميل المنشورات المجدولة...");
      console.log("📄 الصفحة المحددة:", selectedPage?.name, selectedPage?.id);
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/scheduled_posts?fields=id,message,scheduled_publish_time,created_time,status_type,picture,full_picture&access_token=${selectedPage.access_token}`
      );
      
      console.log("📊 استجابة API:", response.status, response.statusText);
      
      const data = await response.json();
      
      console.log("📋 البيانات المستلمة:", data);
      
      if (data.error) {
        console.error("❌ خطأ من Facebook API:", data.error);
        throw new Error(data.error.message);
      }

      // فلترة المنشورات وإزالة أي منشورات بتواريخ غير صحيحة
      console.log("🔍 البيانات الخام من Facebook:", data.data);
      
      const validPosts = (data.data || []).filter((post: ScheduledPost) => {
        console.log(`📝 فحص المنشور ${post.id}:`, {
          id: post.id,
          scheduled_publish_time: post.scheduled_publish_time,
          message_preview: post.message?.substring(0, 50) + '...'
        });
        
        if (!post.scheduled_publish_time) {
          console.warn('❌ منشور بدون scheduled_publish_time:', post.id);
          return false;
        }
        
        // Facebook يُرجع scheduled_publish_time كـ Unix timestamp، لذا نحوله إلى milliseconds
        const date = new Date(parseInt(post.scheduled_publish_time) * 1000);
        console.log(`🕐 التاريخ المحول للمنشور ${post.id}:`, {
          original: post.scheduled_publish_time,
          unix_timestamp: parseInt(post.scheduled_publish_time),
          converted: date.toISOString(),
          readable: date.toLocaleString('en-US'),
          isValid: !isNaN(date.getTime()),
          year: date.getFullYear()
        });
        
        if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
          console.warn('❌ منشور بتاريخ غير صحيح:', post.id, post.scheduled_publish_time);
          return false;
        }
        
        console.log(`✅ منشور صالح: ${post.id}`);
        return true;
      });

      console.log(`📋 Loaded ${validPosts.length} valid scheduled posts (filtered from ${data.data?.length || 0} total)`);
      console.log('جميع المنشورات المجدولة:', validPosts.map(p => ({
        id: p.id,
        message: p.message.substring(0, 50) + '...',
        scheduled_time: p.scheduled_publish_time,
        formatted_time: formatScheduledTime(p.scheduled_publish_time)
      })));
      setScheduledPosts(validPosts);
    } catch (error) {
      console.error("Error loading scheduled posts:", error);
      toast.error("فشل في تحميل المنشورات المجدولة: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPage) {
      loadScheduledPosts();
    }
  }, [selectedPage]);

  // Format scheduled time for display with proper validation
  const formatScheduledTime = (timestamp: string | number) => {
    try {
      // التحقق من صحة timestamp قبل التحويل
      if (!timestamp || timestamp.toString().trim() === '') {
        console.warn('Empty timestamp provided to formatScheduledTime');
        return "وقت غير محدد";
      }

      // Facebook يُرجع Unix timestamp، لذا نحوله إلى milliseconds
      const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
      const date = new Date(timestampNum * 1000);
      
      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        console.warn('Invalid date from timestamp:', timestamp);
        return "تاريخ غير صحيح";
      }
      
      // التحقق من أن التاريخ ليس من عام 1970 (Unix epoch)
      if (date.getFullYear() === 1970) {
        console.warn('Unix epoch date detected (1970), likely invalid timestamp:', timestamp);
        return "تاريخ غير صحيح - يرجى إعادة تحديد الموعد";
      }
      
      // التحقق من أن التاريخ منطقي (ليس بعيداً جداً في الماضي أو المستقبل)
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
      
      if (date < oneYearAgo || date > twoYearsFromNow) {
        console.warn('Date seems unrealistic:', date, 'from timestamp:', timestamp);
        return "تاريخ غير منطقي - يرجى التحقق";
      }
      
      return format(date, "PPP 'في' p");
    } catch (error) {
      console.error('Error formatting scheduled time:', error, 'timestamp:', timestamp);
      return "خطأ في تنسيق التاريخ";
    }
  };

  // Convert date and time to Unix timestamp with validation
  const getUnixTimestamp = (date: Date, time: string) => {
    console.log('🕐 Converting to Unix timestamp:', { date, time });
    
    // التحقق من صحة المدخلات
    if (!date || !time) {
      throw new Error("التاريخ والوقت مطلوبان");
    }
    
    // التحقق من تنسيق الوقت
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error("تنسيق الوقت غير صحيح. استخدم تنسيق HH:MM (مثال: 14:30)");
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    // التحقق من صحة الساعات والدقائق
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("قيم الساعة والدقائق غير صحيحة");
    }
    
    const scheduledDateTime = new Date(date);
    
    // التحقق من صحة التاريخ
    if (isNaN(scheduledDateTime.getTime())) {
      throw new Error("التاريخ المحدد غير صحيح");
    }
    
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const minTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    const maxTime = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000); // 75 days from now
    
    // التحقق من أن الوقت ليس في الماضي
    if (scheduledDateTime < now) {
      throw new Error("لا يمكن جدولة منشور في الماضي");
    }
    
    if (scheduledDateTime < minTime) {
      const remainingMinutes = Math.ceil((minTime.getTime() - now.getTime()) / (60 * 1000));
      throw new Error(`يجب أن يكون موعد النشر بعد ${remainingMinutes} دقيقة على الأقل من الآن (متطلب فيسبوك)`);
    }
    
    if (scheduledDateTime > maxTime) {
      throw new Error("لا يمكن جدولة المنشور لأكثر من 75 يوماً في المستقبل (حد فيسبوك الأقصى)");
    }
    
    const unixTimestamp = Math.floor(scheduledDateTime.getTime() / 1000);
    
    // التحقق من صحة Unix timestamp النهائي
    if (unixTimestamp <= 0 || isNaN(unixTimestamp)) {
      throw new Error("خطأ في تحويل التاريخ إلى Unix timestamp");
    }
    
    // تحقق إضافي: التأكد من أن Unix timestamp لا يعيد إلى 1970
    if (unixTimestamp < 86400) { // أقل من يوم واحد منذ Unix epoch
      throw new Error("Unix timestamp غير صحيح - قد يؤدي إلى عرض تاريخ 1970");
    }
    
    console.log('✅ Unix timestamp generated successfully:', {
      originalDate: date.toISOString(),
      originalTime: time,
      combinedDateTime: scheduledDateTime.toISOString(),
      unixTimestamp: unixTimestamp,
      readableDate: scheduledDateTime.toLocaleString('en-US')
    });
    
    return unixTimestamp;
  };

  // Create new scheduled post
  const createScheduledPost = async () => {
    if (!postMessage.trim() || !scheduledDate || !scheduledTime) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const unixTimestamp = getUnixTimestamp(scheduledDate, scheduledTime);
      
      // Validate token permissions before creating post using debug_token
      const debugTokenResponse = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${selectedPage.access_token}&access_token=1184403590157230|7f871fe6601e884f595ce8bcae6d192d`
      );
      const debugTokenData = await debugTokenResponse.json();
      
      if (debugTokenData.error) {
        throw new Error("فشل في التحقق من صلاحيات التوكن: " + debugTokenData.error.message);
      }
      
      const tokenInfo = debugTokenData.data;
      if (!tokenInfo || !tokenInfo.is_valid) {
        throw new Error("التوكن غير صالح أو منتهي الصلاحية");
      }
      
      const requiredPermissions = ['pages_manage_posts', 'pages_read_engagement', 'pages_manage_metadata'];
      const grantedPermissions = tokenInfo.scopes || [];
      const missingPermissions = requiredPermissions.filter(p => !grantedPermissions.includes(p));
      
      if (missingPermissions.length > 0) {
        throw new Error(`التوكن يفتقر للصلاحيات التالية: ${missingPermissions.join(', ')}`);
      }
      
      const params = new URLSearchParams();
      params.append('message', postMessage);
      params.append('published', 'false');
      params.append('scheduled_publish_time', unixTimestamp.toString());
      params.append('access_token', selectedPage.access_token);
      
      console.log('Creating scheduled post with timestamp:', unixTimestamp, 'for date:', new Date(unixTimestamp * 1000));
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        }
      );

      const data = await response.json();
      
      if (data.error) {
        console.error("Facebook API error:", data.error);
        if (data.error.code === 100 && data.error.error_subcode === 1501234) {
          throw new Error("خطأ في الوقت المجدول. تأكد من أن الوقت صحيح ويتوافق مع المنطقة الزمنية للصفحة");
        } else if (data.error.code === 200) {
          throw new Error("صلاحيات غير كافية. تحقق من أن التوكن يحتوي على الصلاحيات المطلوبة");
        }
        throw new Error(data.error.message);
      }

      console.log("Scheduled post created successfully:", data);
      toast.success(`تم إنشاء المنشور المجدول بنجاح! سيتم نشره في ${formatScheduledTime(new Date(unixTimestamp * 1000).toISOString())}`);
      setShowNewPostDialog(false);
      resetForm();
      
      // تحديث القائمة مع تأخير للتأكد من معالجة Facebook للطلب
      setTimeout(() => {
        loadScheduledPosts();
        console.log("🔄 تم تحديث قائمة المنشورات المجدولة بعد إنشاء منشور جديد");
      }, 2000);
    } catch (error) {
      console.error("Error creating scheduled post:", error);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes("يجب أن يكون موعد النشر")) {
        toast.error(errorMessage);
      } else {
        toast.error("فشل في إنشاء المنشور المجدول: " + errorMessage);
      }
    }
  };

  // Update scheduled post
  const updateScheduledPost = async () => {
    if (!editingPost || !postMessage.trim() || !scheduledDate || !scheduledTime) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const unixTimestamp = getUnixTimestamp(scheduledDate, scheduledTime);
      
      const params = new URLSearchParams();
      params.append('message', postMessage);
      params.append('scheduled_publish_time', unixTimestamp.toString());
      params.append('access_token', selectedPage.access_token);
      
      console.log('Updating scheduled post with timestamp:', unixTimestamp, 'for date:', new Date(unixTimestamp * 1000));
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${editingPost.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      toast.success("تم تحديث المنشور المجدول بنجاح");
      setEditingPost(null);
      resetForm();
      loadScheduledPosts();
    } catch (error) {
      console.error("Error updating scheduled post:", error);
      toast.error("فشل في تحديث المنشور المجدول: " + (error as Error).message);
    }
  };

  // Delete scheduled post
  const deleteScheduledPost = async (postId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور المجدول؟")) {
      return;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${postId}?access_token=${selectedPage.access_token}`,
        {
          method: 'DELETE'
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      toast.success("تم حذف المنشور المجدول بنجاح");
      loadScheduledPosts();
    } catch (error) {
      console.error("Error deleting scheduled post:", error);
      toast.error("فشل في حذف المنشور المجدول: " + (error as Error).message);
    }
  };

  // Publish scheduled post now - Correct method with image support
  const publishNow = async (postId: string) => {
    try {
      // Find the post to get its message
      const post = scheduledPosts.find(p => p.id === postId);
      if (!post) {
        toast.error("لم يتم العثور على المنشور");
        return;
      }

      console.log("Publishing scheduled post now:", postId, "with message:", post.message.substring(0, 50));
      console.log("Post data:", {
        id: post.id,
        hasMessage: !!post.message,
        hasPicture: !!post.picture,
        hasFullPicture: !!post.full_picture,
        picture: post.picture,
        full_picture: post.full_picture
      });

      // للمنشورات المجدولة، نحتاج لإنشاء منشور جديد فوري وحذف المجدول
      
      // إنشاء منشور جديد فوري مع الصورة
      const params = new URLSearchParams();
      params.append('message', post.message);
      params.append('published', 'true');
      
      // إضافة الصورة إذا كانت موجودة
      if (post.full_picture) {
        console.log("Adding image to post:", post.full_picture);
        params.append('link', post.full_picture);
      } else if (post.picture) {
        console.log("Adding picture to post:", post.picture);
        params.append('link', post.picture);
      }
      
      params.append('access_token', selectedPage.access_token);
      
      console.log("Creating new immediate post with params:", Object.fromEntries(params.entries()));
      
      // إذا كانت هناك صورة، نستخدم endpoint مختلف
      let endpoint;
      let formData;
      
      if (post.full_picture || post.picture) {
        // للمنشورات مع الصور، نستخدم photos endpoint
        const imageUrl = post.full_picture || post.picture;
        
        try {
          // تحميل الصورة من الرابط
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            
            formData = new FormData();
            formData.append('message', post.message);
            formData.append('source', imageBlob, 'image.jpg');
            formData.append('published', 'true');
            formData.append('access_token', selectedPage.access_token);
            
            endpoint = `https://graph.facebook.com/v19.0/${selectedPage.id}/photos`;
            console.log("Using photos endpoint with uploaded image");
          } else {
            throw new Error("فشل في تحميل الصورة");
          }
        } catch (imageError) {
          console.warn("Failed to download image, falling back to text-only post:", imageError);
          // في حالة فشل تحميل الصورة، ننشر نص فقط
          endpoint = `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`;
          formData = params;
        }
      } else {
        // للمنشورات النصية فقط
        endpoint = `https://graph.facebook.com/v19.0/${selectedPage.id}/feed`;
        formData = params;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: formData instanceof FormData ? {} : {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData instanceof FormData ? formData : formData.toString()
      });

      const data = await response.json();
      
      console.log("Create new post response:", data);
      
      if (data.error) {
        console.error("Facebook API error creating new post:", data.error);
        throw new Error(data.error.message);
      }

      // إذا نجح إنشاء المنشور الجديد، احذف المنشور المجدول
      if (data.id || data.post_id) {
        const newPostId = data.id || data.post_id;
        console.log("New post created successfully with ID:", newPostId);
        
        // حذف المنشور المجدول
        try {
          const deleteResponse = await fetch(
            `https://graph.facebook.com/v19.0/${postId}?access_token=${selectedPage.access_token}`,
            {
              method: 'DELETE'
            }
          );
          
          const deleteData = await deleteResponse.json();
          
          if (deleteData.error) {
            console.warn("Could not delete scheduled post:", deleteData.error);
            // لا نرمي خطأ هنا لأن المنشور الجديد تم إنشاؤه بنجاح
          } else {
            console.log("Scheduled post deleted successfully");
          }
        } catch (deleteError) {
          console.warn("Error deleting scheduled post:", deleteError);
          // لا نرمي خطأ هنا لأن المنشور الجديد تم إنشاؤه بنجاح
        }
        
        const hasImage = !!(post.full_picture || post.picture);
        toast.success(`تم نشر المنشور${hasImage ? ' مع الصورة' : ''} فوراً بنجاح!`);
        loadScheduledPosts();
      } else {
        console.warn("Unexpected response from create post API:", data);
        toast.warning("حدث خطأ غير متوقع، يرجى التحقق من الصفحة");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      toast.error("فشل في نشر المنشور: " + (error as Error).message);
    }
  };

  // Reset form
  const resetForm = () => {
    setPostMessage("");
    setScheduledDate(undefined);
    setScheduledTime("");
  };

  // Start editing post
  const startEditing = (post: ScheduledPost) => {
    setEditingPost(post);
    setPostMessage(post.message);
    
    try {
      // Facebook يُرجع scheduled_publish_time كـ Unix timestamp
      const scheduleDate = new Date(parseInt(post.scheduled_publish_time) * 1000);
      setScheduledDate(scheduleDate);
      setScheduledTime(format(scheduleDate, "HH:mm"));
    } catch {
      setScheduledDate(undefined);
      setScheduledTime("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              إدارة المنشورات المجدولة
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadScheduledPosts}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                تحديث
              </Button>
              <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    منشور جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>إنشاء منشور مجدول جديد</DialogTitle>
                  </DialogHeader>
                  <PostForm
                    message={postMessage}
                    setMessage={setPostMessage}
                    scheduledDate={scheduledDate}
                    setScheduledDate={setScheduledDate}
                    scheduledTime={scheduledTime}
                    setScheduledTime={setScheduledTime}
                    onSubmit={createScheduledPost}
                    onCancel={() => {
                      setShowNewPostDialog(false);
                      resetForm();
                    }}
                    isEditing={false}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>يمكنك جدولة المنشورات لتنشر تلقائياً في الوقت المحدد.</p>
              <p><strong>متطلبات مهمة:</strong></p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>الوقت يجب أن يكون بعد 10 دقائق على الأقل من الآن</li>
                <li>لا يمكن الجدولة لأكثر من 75 يوماً في المستقبل</li>
                <li>التوكن يجب أن يحتوي على الصلاحيات: pages_manage_posts, pages_read_engagement, pages_manage_metadata</li>
                <li>تأكد من ضبط المنطقة الزمنية الصحيحة لصفحتك على فيسبوك</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Scheduled Posts List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="shadow-elegant">
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="mr-2">جاري تحميل المنشورات المجدولة...</span>
            </CardContent>
          </Card>
        ) : scheduledPosts.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد منشورات مجدولة حالياً</p>
              <p className="text-xs text-muted-foreground mt-2">
                آخر تحديث: {new Date().toLocaleString('en-US')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log("🔍 إعادة تحميل المنشورات المجدولة يدوياً");
                  loadScheduledPosts();
                }}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                إعادة تحميل
              </Button>
            </CardContent>
          </Card>
        ) : (
          scheduledPosts.map((post) => (
            <Card key={post.id} className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        مجدول
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const formattedTime = formatScheduledTime(post.scheduled_publish_time);
                          // إذا كان التاريخ غير صحيح، أظهر تحذيراً
                          if (formattedTime.includes("غير صحيح") || formattedTime.includes("غير منطقي")) {
                            return (
                              <span className="text-red-600 font-medium flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {formattedTime}
                              </span>
                            );
                          }
                          return formattedTime;
                        })()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed">{post.message}</p>
                      
                      {(post.picture || post.full_picture) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          <span>يحتوي على صورة مرفقة</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      ID: {post.id}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(post)}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => publishNow(post.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Send className="h-4 w-4" />
                      نشر الآن
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteScheduledPost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المنشور المجدول</DialogTitle>
          </DialogHeader>
          <PostForm
            message={postMessage}
            setMessage={setPostMessage}
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            scheduledTime={scheduledTime}
            setScheduledTime={setScheduledTime}
            onSubmit={updateScheduledPost}
            onCancel={() => {
              setEditingPost(null);
              resetForm();
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Post Form Component
interface PostFormProps {
  message: string;
  setMessage: (message: string) => void;
  scheduledDate: Date | undefined;
  setScheduledDate: (date: Date | undefined) => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const PostForm = ({
  message,
  setMessage,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  onSubmit,
  onCancel,
  isEditing
}: PostFormProps) => {
  // Set default time to 1 hour from now
  useEffect(() => {
    if (!scheduledTime && !isEditing) {
      const defaultTime = addHours(new Date(), 1);
      setScheduledTime(format(defaultTime, "HH:mm"));
    }
  }, [scheduledTime, isEditing, setScheduledTime]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>محتوى المنشور</Label>
        <Textarea
          placeholder="اكتب محتوى المنشور هنا..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>تاريخ النشر</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !scheduledDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {scheduledDate ? format(scheduledDate, "PPP") : "اختر التاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>وقت النشر</Label>
          <Input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="text-right"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? "تحديث المنشور" : "جدولة المنشور"}
        </Button>
      </div>
    </div>
  );
};