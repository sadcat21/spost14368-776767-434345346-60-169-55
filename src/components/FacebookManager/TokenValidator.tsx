import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Key, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatShortDateInArabic } from "@/utils/dateUtils";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface TokenValidatorProps {
  selectedPage: FacebookPage;
  onTokenExpired?: () => void;
}

interface TokenInfo {
  isValid: boolean;
  expiresAt?: number;
  appId?: string;
  scopes?: string[];
  error?: string;
  lastChecked: number;
}

export const TokenValidator = ({ selectedPage, onTokenExpired }: TokenValidatorProps) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);

  // فحص التوكن عند تحميل المكون
  useEffect(() => {
    if (selectedPage?.access_token) {
      checkTokenValidity();
    }
  }, [selectedPage?.access_token]);

  // فحص دوري للتوكن كل 10 دقائق
  useEffect(() => {
    if (!autoCheckEnabled) return;

    const interval = setInterval(() => {
      if (selectedPage?.access_token) {
        checkTokenValidity(false); // فحص صامت
      }
    }, 10 * 60 * 1000); // 10 دقائق

    return () => clearInterval(interval);
  }, [selectedPage?.access_token, autoCheckEnabled]);

  const checkTokenValidity = async (showToast = true) => {
    if (!selectedPage?.access_token) return;

    setChecking(true);
    
    try {
      // فحص معلومات التوكن من Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${selectedPage.access_token}&fields=id,name`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // فحص صلاحيات التوكن
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${selectedPage.id}/permissions?access_token=${selectedPage.access_token}`
      );

      const permissionsData = await permissionsResponse.json();
      
      // استخراج معلومات التوكن من endpoint أخر للحصول على تاريخ الانتهاء
      const debugResponse = await fetch(
        `https://graph.facebook.com/v19.0/debug_token?input_token=${selectedPage.access_token}&access_token=${selectedPage.access_token}`
      );
      
      const debugData = await debugResponse.json();
      
      const newTokenInfo: TokenInfo = {
        isValid: true,
        expiresAt: debugData.data?.expires_at || 0,
        appId: debugData.data?.app_id,
        scopes: debugData.data?.scopes || [],
        lastChecked: Date.now()
      };

      // التحقق من الصلاحيات المطلوبة
      const requiredPermissions = ['pages_manage_posts', 'pages_show_list'];
      const hasRequiredPermissions = requiredPermissions.every(perm => 
        newTokenInfo.scopes?.includes(perm)
      );

      if (!hasRequiredPermissions) {
        newTokenInfo.error = "صلاحيات غير كافية - يجب أن يحتوي التوكن على pages_manage_posts و pages_show_list";
        newTokenInfo.isValid = false;
      }

      setTokenInfo(newTokenInfo);

      if (showToast) {
        if (newTokenInfo.isValid) {
          toast.success("التوكن صالح ويحتوي على الصلاحيات المطلوبة");
        } else {
          toast.error(newTokenInfo.error || "التوكن غير صالح");
          onTokenExpired?.();
        }
      }

    } catch (error) {
      console.error("Token validation error:", error);
      
      const errorTokenInfo: TokenInfo = {
        isValid: false,
        error: (error as Error).message,
        lastChecked: Date.now()
      };

      setTokenInfo(errorTokenInfo);

      if (showToast) {
        toast.error("فشل في التحقق من صلاحية التوكن: " + (error as Error).message);
        onTokenExpired?.();
      }
    } finally {
      setChecking(false);
    }
  };

  const getExpiryText = () => {
    if (!tokenInfo?.expiresAt || tokenInfo.expiresAt === 0) {
      return "غير محدد"; // توكن طويل الأمد
    }

    const expiryDate = new Date(tokenInfo.expiresAt * 1000);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "منتهي الصلاحية";
    } else if (diffDays === 0) {
      return "ينتهي اليوم";
    } else if (diffDays === 1) {
      return "ينتهي غداً";
    } else if (diffDays < 7) {
      return `ينتهي خلال ${diffDays} أيام`;
    } else {
      return `ينتهي في ${formatShortDateInArabic(expiryDate)}`;
    }
  };

  const getStatusBadge = () => {
    if (checking) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          جاري الفحص
        </Badge>
      );
    }

    if (!tokenInfo) {
      return (
        <Badge variant="secondary">
          لم يتم الفحص
        </Badge>
      );
    }

    if (tokenInfo.isValid) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          صالح
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          غير صالح
        </Badge>
      );
    }
  };

  const shouldShowExpiry = tokenInfo?.expiresAt && tokenInfo.expiresAt > 0;
  const isExpiringSoon = shouldShowExpiry && tokenInfo.expiresAt < (Date.now() / 1000) + (7 * 24 * 60 * 60); // خلال 7 أيام

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            حالة التوكن
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkTokenValidity()}
              disabled={checking}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              فحص
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tokenInfo?.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {tokenInfo.error}
            </AlertDescription>
          </Alert>
        )}

        {isExpiringSoon && tokenInfo.isValid && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              تحذير: التوكن قارب على الانتهاء - {getExpiryText()}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">حالة التوكن:</span>
            <div className="mt-1">
              {tokenInfo?.isValid ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  صالح وجاهز للاستخدام
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  غير صالح أو منتهي الصلاحية
                </span>
              )}
            </div>
          </div>

          {shouldShowExpiry && (
            <div>
              <span className="font-medium">تاريخ الانتهاء:</span>
              <div className="mt-1">
                <span className={isExpiringSoon ? "text-amber-600" : "text-muted-foreground"}>
                  {getExpiryText()}
                </span>
              </div>
            </div>
          )}

          {tokenInfo?.scopes && (
            <div className="col-span-2">
              <span className="font-medium">الصلاحيات المتاحة:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {tokenInfo.scopes.map((scope) => (
                  <Badge key={scope} variant="outline" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {tokenInfo?.lastChecked && (
            <div className="col-span-2 text-xs text-muted-foreground">
              آخر فحص: {new Date(tokenInfo.lastChecked).toLocaleString('en-US')}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <label className="text-sm font-medium">
            الفحص التلقائي
          </label>
          <Button
            variant={autoCheckEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoCheckEnabled(!autoCheckEnabled)}
          >
            {autoCheckEnabled ? "مفعل" : "معطل"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};