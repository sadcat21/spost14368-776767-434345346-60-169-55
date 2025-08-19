import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2,
  KeyRound
} from 'lucide-react';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
  rememberMe?: boolean;
}

interface EnhancedAuthFormProps {
  onLogin: (data: AuthFormData) => Promise<void>;
  onSignup: (data: AuthFormData) => Promise<void>;
  loading: boolean;
}

export const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({
  onLogin,
  onSignup,
  loading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState<AuthFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [signupForm, setSignupForm] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(loginForm);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignup(signupForm);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="w-full"
    >
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
          <TabsTrigger 
            value="login" 
            className="rounded-lg text-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
          >
            تسجيل الدخول
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="rounded-lg text-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300"
          >
            إنشاء حساب
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* حقل الإيميل */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-white font-medium">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="pr-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-primary/20 rounded-xl h-12"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            {/* حقل كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-white font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="pr-10 pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-primary/20 rounded-xl h-12"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>

            {/* خيارات إضافية */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={loginForm.rememberMe}
                  onCheckedChange={(checked) => 
                    setLoginForm({...loginForm, rememberMe: checked as boolean})
                  }
                  className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="remember" className="text-white/80 text-sm cursor-pointer">
                  تذكرني
                </Label>
              </div>
              
              <Button
                variant="link"
                className="text-primary hover:text-primary/80 text-sm p-0 h-auto"
                type="button"
              >
                نسيت كلمة المرور؟
              </Button>
            </div>
            
            {/* زر تسجيل الدخول */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-primary hover:shadow-glow text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <KeyRound className="h-5 w-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="signup">
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            {/* الاسم */}
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-white font-medium">
                الاسم الكامل (اختياري)
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={signupForm.displayName}
                  onChange={(e) => setSignupForm({...signupForm, displayName: e.target.value})}
                  className="pr-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-primary/20 rounded-xl h-12"
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* الإيميل */}
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-white font-medium">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="pr-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-primary/20 rounded-xl h-12"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            {/* كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-white font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة مرور قوية"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="pr-10 pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-primary/20 rounded-xl h-12"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>
            
            {/* تأكيد كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="signup-confirm" className="text-white font-medium">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                  className="pr-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-primary focus:ring-primary/20 rounded-xl h-12"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            {/* زر إنشاء الحساب */}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-primary hover:shadow-glow text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  <User className="h-5 w-5 ml-2" />
                  إنشاء حساب جديد
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};