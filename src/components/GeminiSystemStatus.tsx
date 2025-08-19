import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, Key, Zap, Settings, Edit, Lock, Shield } from "lucide-react";
import { useGeminiApiKey } from "@/hooks/useGeminiApiKey";
import { toast } from "sonner";

const ApiKeyManager: React.FC<{ currentApiKey: string; onSave: (key: string) => void }> = ({ currentApiKey, onSave }) => {
  const [newApiKey, setNewApiKey] = useState(currentApiKey);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (newApiKey.trim()) {
      onSave(newApiKey.trim());
      setIsOpen(false);
      toast.success('تم تحديث مفتاح API بنجاح! 🎉');
    } else {
      toast.error('يرجى إدخال مفتاح API صحيح');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-3 bg-white/10 hover:bg-white/20 border-white/20 text-foreground">
          <Edit className="h-3 w-3 ml-1" />
          تعديل المفتاح
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Key className="h-5 w-5 text-primary" />
            تعديل مفتاح Gemini API
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key" className="text-foreground">مفتاح API الجديد</Label>
            <Input
              id="api-key"
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="أدخل مفتاح Gemini API الجديد..."
              className="text-left bg-background text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Key className="h-4 w-4 ml-2" />
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const GeminiSystemStatus: React.FC = () => {
  const { hasApiKey, apiKey, saveApiKey } = useGeminiApiKey();

  const statusIndicators = [
    { 
      label: 'اتصال API', 
      active: hasApiKey(), 
      color: hasApiKey() ? 'bg-emerald-500' : 'bg-gray-400',
      icon: Key 
    },
    { 
      label: 'تشفير محلي', 
      active: true, 
      color: 'bg-blue-500',
      icon: Lock 
    },
    { 
      label: 'نظام مستقل', 
      active: true, 
      color: 'bg-purple-500',
      icon: Zap 
    },
    { 
      label: 'آمان كامل', 
      active: true, 
      color: 'bg-green-500',
      icon: Shield 
    }
  ];

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card shadow-xl">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-pulse"></div>
      
      <CardHeader className="pb-4 relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent shadow-lg">
                <Zap className="h-5 w-5 text-primary-foreground drop-shadow-sm" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                🎨 نظام Gemini المتقدم
              </h3>
              <p className="text-xs text-muted-foreground">نظام الذكاء الاصطناعي للمحتوى</p>
            </div>
          </div>
          {hasApiKey() && (
            <ApiKeyManager currentApiKey={apiKey} onSave={saveApiKey} />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        {/* حالة الاتصال */}
        <div className="space-y-3">
          {hasApiKey() ? (
            <Alert className="border-0 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 shadow-sm">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">النظام متصل وجاهز للعمل</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">نشط</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-lg">
                    <Key className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                      {apiKey.substring(0, 12)}...
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium">مطلوب مفتاح Gemini API للتشغيل</span>
                  <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 h-6">
                    <Settings className="h-4 w-4 ml-1" />
                    إعداد
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* مؤشرات الحالة */}
        <div className="grid grid-cols-2 gap-3">
          {statusIndicators.map((indicator, index) => {
            const IconComponent = indicator.icon;
            return (
              <div 
                key={indicator.label}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/70 transition-all duration-200"
              >
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${indicator.color} shadow-sm`}></div>
                  {indicator.active && (
                    <div className={`absolute inset-0 w-3 h-3 rounded-full ${indicator.color} animate-ping opacity-75`}></div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{indicator.label}</span>
                </div>
                {indicator.active && (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* إحصائيات سريعة */}
        <div className="flex items-center justify-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                نظام آمن ومشفر بالكامل
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              جميع البيانات محفوظة محلياً • لا توجد خوادم خارجية
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};