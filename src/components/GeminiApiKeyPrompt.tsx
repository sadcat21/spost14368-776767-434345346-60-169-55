import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface GeminiApiKeyPromptProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
  autoFocus?: boolean;
}

export const GeminiApiKeyPrompt: React.FC<GeminiApiKeyPromptProps> = ({
  onApiKeySet,
  currentApiKey = '',
  autoFocus = true
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(apiKey.trim().length > 0);
  }, [apiKey]);

  useEffect(() => {
    if (autoFocus) {
      // التركيز التلقائي على الحقل
      const timer = setTimeout(() => {
        const input = document.getElementById('gemini-api-key-input');
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      toast.error('يرجى إدخال مفتاح Gemini API');
      return;
    }

    onApiKeySet(apiKey.trim());
    toast.success('تم حفظ مفتاح API بنجاح! 🎉');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Key className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">
            مطلوب مفتاح Gemini API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              يجب إدخال مفتاح Gemini API لتوليد الصور والمحتوى
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="gemini-api-key-input" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              مفتاح Gemini API
            </Label>
            <Input
              id="gemini-api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="أدخل مفتاح Gemini API الخاص بك..."
              className="text-left"
              autoFocus={autoFocus}
            />
            {isValid && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                مفتاح API جاهز للاستخدام
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            <Key className="h-4 w-4 mr-2" />
            حفظ المفتاح والمتابعة
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• المفتاح يُحفظ محلياً في متصفحك فقط</p>
            <p>• لن يتم إرسال المفتاح إلى خوادمنا</p>
            <p>• يمكنك الحصول على مفتاح من Google AI Studio</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};