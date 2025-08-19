import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useFacebook } from '@/contexts/FacebookContext';

interface AccessTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AccessTokenDialog = ({ open, onClose }: AccessTokenDialogProps) => {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { handleAuthSuccess, setIsConnected } = useFacebook();

  const handleSaveToken = async () => {
    if (!accessToken.trim()) {
      toast.error('يرجى إدخال رمز الوصول');
      return;
    }

    setLoading(true);
    try {
      // Validate token by trying to get user info
      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${accessToken}&fields=id,name,email,picture`
      );
      const userData = await response.json();

      if (userData.error) {
        toast.error('رمز الوصول غير صالح');
        return;
      }

      // Get user pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category,picture`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        toast.error('خطأ في الحصول على الصفحات');
        return;
      }

      // Save to database
      const defaultUserId = "00000000-0000-0000-0000-000000000000";
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          key_name: 'FACEBOOK_ACCESS_TOKEN',
          key_value: accessToken,
          user_id: defaultUserId
        });

      if (error) {
        console.error('Error saving token:', error);
        toast.error('خطأ في حفظ رمز الوصول');
        return;
      }

      // Update Facebook context
      handleAuthSuccess(accessToken, pagesData.data || [], userData);
      setIsConnected(true);
      
      toast.success('تم حفظ رمز الوصول بنجاح');
      onClose();
      setAccessToken('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('خطأ في التحقق من رمز الوصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Key className="h-5 w-5" />
            ربط حساب فيسبوك
          </DialogTitle>
          <DialogDescription>
            أدخل رمز الوصول الخاص بفيسبوك للاتصال بحسابك
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              يمكنك الحصول على رمز الوصول من 
              <a 
                href="https://developers.facebook.com/tools/explorer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline mx-1"
              >
                Facebook Graph API Explorer
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="access-token">رمز الوصول</Label>
            <Input
              id="access-token"
              type="password"
              placeholder="أدخل رمز الوصول هنا..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveToken}
              disabled={loading || !accessToken.trim()}
              className="flex-1"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الرمز'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};