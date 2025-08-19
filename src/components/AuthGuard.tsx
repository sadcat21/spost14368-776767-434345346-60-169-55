import React, { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFacebook } from '@/contexts/FacebookContext';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isConnected: isFacebookConnected } = useFacebook();

  useEffect(() => {
    console.log('AuthGuard: Setting up auth listeners...', { isFacebookConnected });
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast.success('تم تسجيل الدخول بنجاح!');
        } else if (event === 'SIGNED_OUT') {
          toast.info('تم تسجيل الخروج');
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // مراقبة تغييرات Facebook connection منفصلة
  useEffect(() => {
    console.log('AuthGuard: Facebook connection state changed:', isFacebookConnected);
    if (isFacebookConnected) {
      console.log('Facebook is connected, allowing access');
      setLoading(false);
    }
  }, [isFacebookConnected]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If not authenticated via Supabase AND not connected to Facebook, redirect to auth page
  if ((!user || !session) && !isFacebookConnected) {
    // تأخير قصير لتجنب التوجيه المتكرر
    setTimeout(() => {
      if (window.location.pathname !== '/auth') {
        navigate('/auth');
      }
    }, 100);
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;