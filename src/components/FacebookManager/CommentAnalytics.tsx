import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Target, 
  Heart, 
  MessageCircle, 
  Frown, 
  HelpCircle,
  ChevronDown,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface Comment {
  id: string;
  message: string;
  from: {
    name: string;
    id: string;
  };
  created_time: string;
  post_id?: string;
  like_count?: number;
  comment_count?: number;
}

interface CommentAnalyticsProps {
  selectedPage: FacebookPage;
  comments: Comment[];
  classifiedComments: {[key: string]: any};
  posts: any[];
  selectedPostId: string;
  onPostSelect: (postId: string) => void;
  onRefreshPosts: () => void;
  loading: boolean;
}

export const CommentAnalytics = ({ 
  selectedPage, 
  comments, 
  classifiedComments, 
  posts, 
  selectedPostId,
  onPostSelect,
  onRefreshPosts,
  loading 
}: CommentAnalyticsProps) => {
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Calculate performance statistics from classified comments
  const getPerformanceStats = () => {
    const total = comments.length;
    let compliments = 0;
    let questions = 0;
    let complaints = 0;
    let engagementRate = 1;

    Object.values(classifiedComments).forEach((classification: any) => {
      if (classification.type.includes("داعم") || classification.type.includes("مجاملة")) {
        compliments++;
      } else if (classification.type.includes("استفسار") || classification.type.includes("طلب")) {
        questions++;
      } else if (classification.type.includes("شكوى") || classification.type.includes("سلبي")) {
        complaints++;
      }
    });

    // Calculate engagement rate based on total interactions
    if (total > 0) {
      const totalEngagement = compliments + questions + complaints;
      engagementRate = Math.round((totalEngagement / total) * 100);
    }

    // Estimate audience reach (simplified calculation)
    const estimatedReach = Math.round(total * 30); // Rough estimate

    return {
      compliments,
      questions,
      complaints,
      engagementRate,
      total,
      estimatedReach
    };
  };

  const stats = getPerformanceStats();

  return (
    <div className="space-y-4">
      {/* Performance Statistics Card - Main Display */}
      <Card className="border-primary/20 shadow-elegant">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              إحصائيات الأداء
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContentPreview(!showContentPreview)}
              className="text-muted-foreground"
            >
              {showContentPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Main Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{stats.questions}</div>
              <div className="text-sm text-blue-600 font-medium">أسئلة</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">{stats.compliments}</div>
              <div className="text-sm text-green-600 font-medium">محبطات</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{stats.engagementRate}%</div>
              <div className="text-sm text-purple-600 font-medium">معدل التفاعل</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-600">{stats.complaints}</div>
              <div className="text-sm text-red-600 font-medium">شكاوى</div>
            </div>
          </div>

          {/* Estimated Audience Reach */}
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-lg font-bold text-gray-700">{stats.estimatedReach}</div>
            <div className="text-sm text-gray-600">وصول الجمهور المقدر</div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Management Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MessageSquare className="h-5 w-5" />
            إدارة التعليقات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Post Selection */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-sm font-medium">اختر المنشور</Label>
              <Select value={selectedPostId} onValueChange={onPostSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="من طالب جامعي إلى رائد أعمال ناجح، قصة 'مذهلة الح'..." />
                </SelectTrigger>
                <SelectContent>
                  {posts.map((post) => (
                    <SelectItem key={post.id} value={post.id}>
                      {post.message ? 
                        `${post.message.substring(0, 50)}...` : 
                        `منشور ${post.created_time ? formatShortDateInArabic(post.created_time) : 'غير محدد'}`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={onRefreshPosts} disabled={loading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">البحث في التعليقات</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالكلمات المفتاحية أو اسم المعلق"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">ترتيب التعليقات</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="priority">حسب الأولوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto Analysis Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-sm font-medium">التحليل التلقائي</Label>
                <p className="text-xs text-muted-foreground">
                  رد ذكي متقدم
                </p>
              </div>
            </div>
            <Switch
              checked={autoAnalysisEnabled}
              onCheckedChange={setAutoAnalysisEnabled}
            />
          </div>

          {/* Content Preview Toggle */}
          {showContentPreview && selectedPostId && (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">
                  <strong>محتوى المنشور:</strong>
                  <p className="mt-2 p-3 bg-background rounded border">
                    {posts.find(p => p.id === selectedPostId)?.message || "لا يوجد نص للمنشور"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Count Display */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">التعليقات ({stats.total})</span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-600">
                <Heart className="h-3 w-3 mr-1" />
                {stats.compliments} محبطات
              </Badge>
              <Badge variant="outline" className="text-blue-600">
                <HelpCircle className="h-3 w-3 mr-1" />
                {stats.questions} أسئلة  
              </Badge>
              <Badge variant="outline" className="text-red-600">
                <Frown className="h-3 w-3 mr-1" />
                {stats.complaints} شكاوى
              </Badge>
            </div>
          </div>

          {/* Total Comments and Estimated Reach Summary */}
          <div className="border-t pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">وصول الجمهور المقدر</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};