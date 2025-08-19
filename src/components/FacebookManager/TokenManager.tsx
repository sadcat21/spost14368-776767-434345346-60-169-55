import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, RefreshCw, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface TokenInfo {
  app_id: string;
  type: string;
  application: string;
  data_access_expires_at: number;
  expires_at: number;
  is_valid: boolean;
  scopes: string[];
  user_id: string;
}

interface TokenManagerProps {
  // يمكن إضافة props إضافية حسب الحاجة
}

export const TokenManager = ({}: TokenManagerProps) => {
  const [token, setToken] = useState("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "غير محدد";
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const debugToken = async () => {
    if (!token.trim()) {
      toast.error("يرجى إدخال التوكن أولاً");
      return;
    }

    if (!appId.trim() || !appSecret.trim()) {
      toast.error("يرجى إدخال App ID و App Secret");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setTokenInfo(data.data);
      toast.success("تم جلب معلومات التوكن بنجاح");
    } catch (error) {
      console.error("Token debug error:", error);
      toast.error("فشل في جلب معلومات التوكن: " + (error as Error).message);
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!token.trim()) {
      toast.error("يرجى إدخال التوكن أولاً");
      return;
    }

    if (!appId.trim() || !appSecret.trim()) {
      toast.error("يرجى إدخال App ID و App Secret");
      return;
    }

    setRefreshing(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${token}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      // تحديث التوكن بالتوكن الجديد
      setToken(data.access_token);
      toast.success("تم تحديث التوكن بنجاح إلى long-lived token");
      
      // جلب معلومات التوكن الجديد
      setTimeout(() => {
        debugToken();
      }, 500);
      
    } catch (error) {
      console.error("Token refresh error:", error);
      toast.error("فشل في تحديث التوكن: " + (error as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    toast.success("تم نسخ التوكن");
  };

  return (
    <div className="space-y-6">
      {/* إعدادات التطبيق */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            إعدادات التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              تحتاج إلى App ID و App Secret من Facebook Developer Console لاستخدام هذه الميزة
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>App ID</Label>
              <Input
                type="text"
                placeholder="أدخل App ID"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>App Secret</Label>
              <Input
                type="password"
                placeholder="أدخل App Secret"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إدارة التوكن */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            إدارة التوكنات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Access Token</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="أدخل Access Token للتحليل"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToken}
                disabled={!token}
              >
                نسخ
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={debugToken}
              disabled={loading || !token || !appId || !appSecret}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              {loading ? "جاري التحليل..." : "تحليل التوكن"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={refreshToken}
              disabled={refreshing || !token || !appId || !appSecret}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {refreshing ? "جاري التحديث..." : "تحديث التوكن"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* معلومات التوكن */}
      {tokenInfo && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              معلومات التوكن
              {tokenInfo.is_valid ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  صالح
                </Badge>
              ) : (
                <Badge variant="destructive">
                  غير صالح
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الخاصية</TableHead>
                  <TableHead>القيمة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">نوع التوكن</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tokenInfo.type === 'USER' ? 'مستخدم' : 'صفحة'}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">حالة التوكن</TableCell>
                  <TableCell>
                    {tokenInfo.is_valid ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        صالح
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        غير صالح
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">تاريخ انتهاء التوكن</TableCell>
                  <TableCell>
                    <span className={tokenInfo.expires_at === 0 ? "text-green-600 font-medium" : ""}>
                      {tokenInfo.expires_at === 0 ? "لا ينتهي (Long-lived)" : formatDate(tokenInfo.expires_at)}
                    </span>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">تاريخ انتهاء الوصول للبيانات</TableCell>
                  <TableCell>{formatDate(tokenInfo.data_access_expires_at)}</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">معرف التطبيق</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {tokenInfo.app_id}
                    </code>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">معرف المستخدم</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {tokenInfo.user_id}
                    </code>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">اسم التطبيق</TableCell>
                  <TableCell>{tokenInfo.application}</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">الصلاحيات</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tokenInfo.scopes?.map((scope, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};