import { useState, useEffect } from 'react';

interface FacebookPage {
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

interface FacebookInsights {
  page_views: number;
  page_fans: number;
  page_engaged_users: number;
  page_impressions: number;
  page_posts_impressions: number;
  page_actions_post_reactions_total: number;
}

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  type?: string;
  full_picture?: string;
  picture?: string;
  likes?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
  shares?: { count: number };
}

export const useFacebookData = (selectedPage: FacebookPage | null) => {
  const [insights, setInsights] = useState<FacebookInsights | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPageInsights = async (page: FacebookPage) => {
    try {
      // جلب معلومات الصفحة الأساسية أولاً
      const pageInfoResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?` +
        `fields=id,name,category,fan_count,followers_count&` +
        `access_token=${page.access_token}`
      );

      const pageInfo = await pageInfoResponse.json();
      
      if (pageInfo.error) {
        console.warn('Page Info API Error:', pageInfo.error.message);
      }

      // استخدام metrics أساسية فقط لتجنب أخطاء API
      const basicMetrics = ['page_fans'];
      
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}/insights?` +
        `metric=${basicMetrics.join(',')}&` +
        `access_token=${page.access_token}`
      );

      const insightsData = await insightsResponse.json();

      // بناء البيانات من مصادر مختلفة
      const finalData: FacebookInsights = {
        // استخدام fan_count من معلومات الصفحة كأولوية
        page_fans: pageInfo.fan_count || pageInfo.followers_count || 0,
        page_views: 0,
        page_engaged_users: 0,
        page_impressions: 0,
        page_posts_impressions: 0,
        page_actions_post_reactions_total: 0
      };

      // دمج بيانات insights إذا كانت متاحة
      if (insightsData.data && !insightsData.error) {
        insightsData.data.forEach((metric: any) => {
          const metricName = metric.name as keyof FacebookInsights;
          if (metric.values && metric.values.length > 0) {
            const latestValue = metric.values[metric.values.length - 1].value;
            if (typeof latestValue === 'number') {
              finalData[metricName] = latestValue;
            }
          }
        });
      }

      // إذا لم نحصل على fan_count من insights، استخدم من معلومات الصفحة
      if (finalData.page_fans === 0 && (pageInfo.fan_count || pageInfo.followers_count)) {
        finalData.page_fans = pageInfo.fan_count || pageInfo.followers_count;
      }

      return finalData;
    } catch (error) {
      console.error('Error fetching page insights:', error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        page_fans: 0,
        page_views: 0,
        page_engaged_users: 0,
        page_impressions: 0,
        page_posts_impressions: 0,
        page_actions_post_reactions_total: 0
      } as FacebookInsights;
    }
  };

  const fetchPagePosts = async (page: FacebookPage) => {
    try {
      // استخدام API أبسط يتوافق مع الإصدارات الحديثة ويشمل الصور
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/posts?` +
        `fields=id,message,created_time,full_picture,picture,reactions.limit(0).summary(total_count),comments.limit(0).summary(total_count),shares&` +
        `limit=100&` +
        `access_token=${page.access_token}`
      );

      const data = await response.json();

      if (data.error) {
        console.warn('Posts API Error:', data.error.message);
        // في حالة فشل الإصدار 18، جرب إصدار أقدم
        const fallbackResponse = await fetch(
          `https://graph.facebook.com/v17.0/${page.id}/posts?` +
          `fields=id,message,created_time,likes.summary(total_count),comments.summary(total_count),shares&` +
          `limit=50&` +
          `access_token=${page.access_token}`
        );
        
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.error) {
          throw new Error(fallbackData.error.message);
        }
        
        return fallbackData.data || [];
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching page posts:', error);
      // إرجاع مصفوفة فارغة بدلاً من رمي خطأ
      return [];
    }
  };

  const refreshData = async () => {
    if (!selectedPage) return;

    setLoading(true);
    setError(null);

    try {
      const [insightsData, postsData] = await Promise.all([
        fetchPageInsights(selectedPage),
        fetchPagePosts(selectedPage)
      ]);

      setInsights(insightsData);
      setPosts(postsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPage) {
      refreshData();
    }
  }, [selectedPage]);

  // استمع للأحداث المخصصة لتحديث البيانات
  useEffect(() => {
    const handleRefresh = () => {
      refreshData();
    };

    window.addEventListener('refreshFacebookData', handleRefresh);
    return () => window.removeEventListener('refreshFacebookData', handleRefresh);
  }, [selectedPage]);

  // جلب بيانات الرسائل
  const fetchMessages = async (page: FacebookPage) => {
    try {
      // جلب المحادثات أولاً للحصول على عدد الرسائل الجديدة
      const conversationsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}/conversations?` +
        `fields=id,updated_time,unread_count,message_count&` +
        `limit=100&` +
        `access_token=${page.access_token}`
      );

      const conversationsData = await conversationsResponse.json();

      if (conversationsData.error) {
        console.warn('Conversations API Error:', conversationsData.error.message);
        return 0;
      }

      // حساب الرسائل غير المقروءة
      const unreadMessages = conversationsData.data?.reduce((total: number, conv: any) => {
        return total + (conv.unread_count || 0);
      }, 0) || 0;

      return unreadMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return 0;
    }
  };

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (selectedPage) {
      fetchMessages(selectedPage).then(setUnreadMessages);
    }
  }, [selectedPage]);

  return {
    insights,
    posts,
    unreadMessages,
    loading,
    error,
    refreshData
  };
};