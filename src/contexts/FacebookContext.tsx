import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface FacebookContextType {
  // State
  isConnected: boolean;
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  userAccessToken: string;
  userInfo: FacebookUser | null;
  loading: boolean;

  // Actions
  setIsConnected: (connected: boolean) => void;
  setPages: (pages: FacebookPage[]) => void;
  setSelectedPage: (page: FacebookPage | null) => void;
  setUserAccessToken: (token: string) => void;
  setUserInfo: (user: FacebookUser | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Methods
  handleAuthSuccess: (token: string, pagesData: FacebookPage[], userData?: FacebookUser) => Promise<void>;
  disconnectFromFacebook: () => void;
  handlePageSelect: (page: FacebookPage) => void;
  initializeFromStorage: () => void;
}

const FacebookContext = createContext<FacebookContextType | undefined>(undefined);

export const useFacebook = () => {
  const context = useContext(FacebookContext);
  if (context === undefined) {
    throw new Error('useFacebook must be used within a FacebookProvider');
  }
  return context;
};

interface FacebookProviderProps {
  children: ReactNode;
}

export const FacebookProvider: React.FC<FacebookProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
  const [userAccessToken, setUserAccessToken] = useState("");
  const [userInfo, setUserInfo] = useState<FacebookUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage on mount
  const initializeFromStorage = () => {
    console.log('FacebookContext: Initializing from storage...');
    const savedToken = localStorage.getItem("facebook_user_token");
    const savedPages = localStorage.getItem("facebook_pages");
    const savedSelectedPage = localStorage.getItem("facebook_selected_page");
    const savedUserInfo = localStorage.getItem("facebook_user_info");
    
    console.log('FacebookContext: Storage data:', {
      hasToken: !!savedToken,
      hasPages: !!savedPages,
      hasSelectedPage: !!savedSelectedPage,
      hasUserInfo: !!savedUserInfo
    });
    
    if (savedToken && savedPages) {
      setUserAccessToken(savedToken);
      const parsedPages = JSON.parse(savedPages);
      setPages(parsedPages);
      setIsConnected(true);
      
      if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo));
      }
      
      if (savedSelectedPage) {
        const foundPage = parsedPages.find((p: FacebookPage) => p.id === savedSelectedPage);
        if (foundPage) {
          setSelectedPage(foundPage);
        }
      }
      
      console.log('FacebookContext: Successfully loaded from storage, connected:', true);
    } else {
      console.log('FacebookContext: No valid data in storage, not connected');
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeFromStorage();
  }, []);

  const handleAuthSuccess = async (token: string, pagesData: FacebookPage[], userData?: FacebookUser) => {
    setUserAccessToken(token);
    setPages(pagesData);
    setIsConnected(true);
    
    if (userData) {
      setUserInfo(userData);
      
      // حفظ بيانات المستخدم في قاعدة البيانات
      try {
        await saveFacebookUserToDatabase(userData, token);
      } catch (error) {
        console.error('خطأ في حفظ بيانات المستخدم:', error);
        toast.error('تم الاتصال ولكن فشل في حفظ بعض البيانات');
      }
    }
    
    // حفظ الصفحات في قاعدة البيانات
    if (pagesData && pagesData.length > 0) {
      try {
        await saveFacebookPagesToDatabase(pagesData);
      } catch (error) {
        console.error('خطأ في حفظ بيانات الصفحات:', error);
        toast.error('تم الاتصال ولكن فشل في حفظ بيانات الصفحات');
      }
    }
    
    // Save to localStorage for persistence
    localStorage.setItem("facebook_user_token", token);
    localStorage.setItem("facebook_pages", JSON.stringify(pagesData));
    
    if (userData) {
      localStorage.setItem("facebook_user_info", JSON.stringify(userData));
    }
  };

  const disconnectFromFacebook = () => {
    setIsConnected(false);
    setPages([]);
    setSelectedPage(null);
    setUserAccessToken("");
    setUserInfo(null);
    
    // Clear localStorage
    localStorage.removeItem("facebook_user_token");
    localStorage.removeItem("facebook_pages");
    localStorage.removeItem("facebook_selected_page");
    localStorage.removeItem("facebook_user_info");
    localStorage.removeItem("facebook_auth_method");
    
    toast.success("تم قطع الاتصال بفيسبوك");
  };

  const handlePageSelect = (page: FacebookPage) => {
    setSelectedPage(page);
    localStorage.setItem("facebook_selected_page", page.id);
    toast.success(`تم اختيار صفحة: ${page.name}`);
  };

  // وظيفة حفظ بيانات المستخدم في قاعدة البيانات
  const saveFacebookUserToDatabase = async (userData: FacebookUser, accessToken: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('facebook_users')
        .upsert({
          facebook_id: userData.id,
          facebook_name: userData.name,
          facebook_email: userData.email || null,
          facebook_picture_url: userData.picture?.data?.url || null,
          access_token: accessToken,
          last_login: new Date().toISOString()
        }, {
          onConflict: 'facebook_id'
        });

      if (error) {
        console.error('خطأ في حفظ بيانات المستخدم:', error);
        throw error;
      }

      console.log('تم حفظ بيانات المستخدم في قاعدة البيانات');
    } catch (error) {
      console.error('خطأ في الاتصال بقاعدة البيانات:', error);
      throw error;
    }
  };

  // وظيفة حفظ بيانات الصفحات في قاعدة البيانات
  const saveFacebookPagesToDatabase = async (pagesData: FacebookPage[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // معالجة الصفحات بشكل متوازي بدلاً من متتالي
      const savePromises = pagesData.map(async (page) => {
        const { error } = await supabase
          .from('facebook_pages')
          .upsert({
            page_id: page.id,
            page_name: page.name,
            access_token: page.access_token,
            category: page.category || null,
            picture_url: page.picture?.data?.url || null,
            user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000',
            is_active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'page_id'
          });

        if (error) {
          console.error(`خطأ في حفظ صفحة ${page.name}:`, error);
          throw error;
        }
        
        return page;
      });

      await Promise.all(savePromises);
      console.log('تم حفظ بيانات الصفحات في قاعدة البيانات');
    } catch (error) {
      console.error('خطأ في معالجة الصفحات:', error);
      throw error;
    }
  };

  const value: FacebookContextType = {
    // State
    isConnected,
    pages,
    selectedPage,
    userAccessToken,
    userInfo,
    loading,

    // Actions
    setIsConnected,
    setPages,
    setSelectedPage,
    setUserAccessToken,
    setUserInfo,
    setLoading,

    // Methods
    handleAuthSuccess,
    disconnectFromFacebook,
    handlePageSelect,
    initializeFromStorage,
  };

  return (
    <FacebookContext.Provider value={value}>
      {children}
    </FacebookContext.Provider>
  );
};