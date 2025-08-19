import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreditRefillButtonProps {
  pageId: string;
  currentCredits: number;
  onCreditsUpdated: () => void;
}

export const CreditRefillButton: React.FC<CreditRefillButtonProps> = ({
  pageId,
  currentCredits,
  onCreditsUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRefillForm, setShowRefillForm] = useState(false);
  const [refillAmount, setRefillAmount] = useState(10);

  const handleRefillCredits = async () => {
    if (refillAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    setIsLoading(true);
    
    try {
      // تحديث الكريديت في قاعدة البيانات
      const { error } = await supabase
        .from('automation_subscriptions')
        .update({
          credits_remaining: currentCredits + refillAmount,
          credits_total: currentCredits + refillAmount,
          automation_active: true, // إعادة تفعيل الأتمتة
          updated_at: new Date().toISOString()
        })
        .eq('page_id', pageId);

      if (error) {
        throw error;
      }

      toast.success(`✅ تم إضافة ${refillAmount} كريديت بنجاح!`);
      setShowRefillForm(false);
      onCreditsUpdated();
      
    } catch (error) {
      console.error('خطأ في إعادة تعبئة الكريديت:', error);
      toast.error('فشل في إعادة تعبئة الكريديت');
    } finally {
      setIsLoading(false);
    }
  };

  const quickRefillOptions = [5, 10, 20, 50];

  if (!showRefillForm) {
    return (
      <Button
        onClick={() => setShowRefillForm(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        إعادة تعبئة الكريديت
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          إعادة تعبئة الكريديت
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="refill-amount">عدد الكريديت المراد إضافته</Label>
          <Input
            id="refill-amount"
            type="number"
            min="1"
            value={refillAmount}
            onChange={(e) => setRefillAmount(parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        {/* خيارات سريعة */}
        <div className="space-y-2">
          <Label>خيارات سريعة:</Label>
          <div className="flex gap-2 flex-wrap">
            {quickRefillOptions.map((amount) => (
              <Button
                key={amount}
                onClick={() => setRefillAmount(amount)}
                variant={refillAmount === amount ? "default" : "outline"}
                size="sm"
              >
                {amount} كريديت
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefillCredits}
            disabled={isLoading || refillAmount <= 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            إضافة {refillAmount} كريديت
          </Button>
          
          <Button
            onClick={() => setShowRefillForm(false)}
            variant="outline"
          >
            إلغاء
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>الكريديت الحالي: {currentCredits}</p>
          <p>بعد الإضافة: {currentCredits + refillAmount}</p>
        </div>
      </CardContent>
    </Card>
  );
};