import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Key, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PixabayKeyManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPixabayKey();
  }, []);

  const checkPixabayKey = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('/supabase/functions/v1/get-pixabay-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setHasKey(data.hasKey || false);
    } catch (error) {
      console.error('خطأ في فحص مفتاح Pixabay:', error);
      setHasKey(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast.error('يرجى إدخال مفتاح Pixabay API');
      return;
    }

    setIsLoading(true);
    try {
      // هنا يجب حفظ المفتاح في أسرار Supabase
      // هذه العملية تحتاج إلى صلاحيات إدارية
      toast.info('لحفظ مفتاح Pixabay، يرجى إضافته إلى أسرار Supabase تحت اسم PIXABAY_API_KEY');
      
      // محاكاة حفظ المفتاح مؤقتاً في localStorage كحل بديل
      localStorage.setItem('pixabay_api_key', apiKey);
      setHasKey(true);
      setIsOpen(false);
      toast.success('تم حفظ مفتاح Pixabay مؤقتاً');
    } catch (error) {
      console.error('خطأ في حفظ مفتاح Pixabay:', error);
      toast.error('فشل في حفظ المفتاح');
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIndicator = () => {
    if (isChecking) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <span>جاري الفحص...</span>
        </div>
      );
    }

    if (hasKey) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Pixabay API متاح</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <AlertTriangle className="w-4 h-4" />
        <span>مفتاح Pixabay غير مُعرّف</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">إعدادات Pixabay API</h3>
          <p className="text-sm text-muted-foreground">
            لاستخدام الصور الاحتياطية من Pixabay
          </p>
        </div>
        <StatusIndicator />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant={hasKey ? "outline" : "default"} size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {hasKey ? "تعديل المفتاح" : "إضافة مفتاح"}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              إعداد مفتاح Pixabay API
            </DialogTitle>
            <DialogDescription>
              سيتم استخدام Pixabay كحل احتياطي في حالة فشل توليد الصورة باستخدام A4F.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pixabay-key">مفتاح Pixabay API</Label>
              <Input
                id="pixabay-key"
                type="password"
                placeholder="أدخل مفتاح Pixabay API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>يمكنك الحصول على مفتاح مجاني من:</p>
              <a 
                href="https://pixabay.com/api/docs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Pixabay API Documentation
              </a>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveKey} 
                disabled={isLoading || !apiKey.trim()}
                className="flex-1"
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ المفتاح'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};