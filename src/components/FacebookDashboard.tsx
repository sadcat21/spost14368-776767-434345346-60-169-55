import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Users, 
  Webhook,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFacebook } from '@/contexts/FacebookContext';
import FacebookLoginButton from './FacebookLoginButton';

const FacebookDashboard = () => {
  const navigate = useNavigate();
  const { isConnected, pages, selectedPage } = useFacebook();

  const quickActions = [
    {
      title: 'إدارة الصفحات',
      description: 'عرض وإدارة جميع صفحات فيسبوك المتصلة',
      icon: Users,
      path: '/facebook-management',
      color: 'blue',
      enabled: true
    },
    {
      title: 'التحليلات والإحصائيات',
      description: 'عرض تحليلات مفصلة للصفحات والمشاركات',
      icon: BarChart3,
      path: '/facebook-management',
      color: 'green',
      enabled: isConnected && !!selectedPage
    },
    {
      title: 'إدارة الرسائل',
      description: 'الرد على الرسائل والتعليقات تلقائياً',
      icon: MessageSquare,
      path: '/facebook-management',
      color: 'purple',
      enabled: isConnected && !!selectedPage
    },
    {
      title: 'إعدادات الويب هوك',
      description: 'إعداد وإدارة الويب هوك للصفحات',
      icon: Webhook,
      path: '/facebook-management',
      color: 'orange',
      enabled: isConnected
    },
    {
      title: 'النشر التلقائي',
      description: 'أتمتة نشر المحتوى على فيسبوك',
      icon: Settings,
      path: '/automated-publishing',
      color: 'indigo',
      enabled: isConnected && !!selectedPage
    },
    {
      title: 'إعداد فيسبوك',
      description: 'إضافة صفحات جديدة وإعداد الاتصال',
      icon: Facebook,
      path: '/facebook-management',
      color: 'blue',
      enabled: true
    }
  ];

  const getColorClasses = (color: string, enabled: boolean) => {
    if (!enabled) return 'text-gray-400 bg-gray-100';
    
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      indigo: 'text-indigo-600 bg-indigo-100'
    };
    return colors[color as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-blue-500 rounded-full">
            <Facebook className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم فيسبوك</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          إدارة شاملة لصفحات فيسبوك مع جميع الأدوات والميزات المتقدمة
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            حالة الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isConnected ? 'متصل بفيسبوك' : 'غير متصل بفيسبوك'}
                </p>
                <p className="text-sm text-gray-600">
                  {isConnected 
                    ? `${pages.length} صفحة متاحة • الصفحة المحددة: ${selectedPage?.name || 'لا توجد'}`
                    : 'يجب الاتصال بفيسبوك للوصول إلى الميزات'
                  }
                </p>
              </div>
              <FacebookLoginButton variant="outline" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const colorClasses = getColorClasses(action.color, action.enabled);
          
          return (
            <Card 
              key={index}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                action.enabled 
                  ? 'hover:scale-105 border-gray-200' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => action.enabled && navigate(action.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    {!action.enabled && (
                      <Badge variant="outline" className="text-xs mt-1">
                        يتطلب الاتصال
                      </Badge>
                    )}
                  </div>
                  {action.enabled && (
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connected Pages Preview */}
      {isConnected && pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الصفحات المتصلة</CardTitle>
            <CardDescription>
              عرض سريع للصفحات المتصلة - انقر للوصول إلى الإدارة الكاملة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pages.slice(0, 4).map((page) => (
                <Card 
                  key={page.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPage?.id === page.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => navigate('/facebook-management')}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={page.picture?.data?.url} 
                        alt={page.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{page.name}</p>
                        <p className="text-xs text-gray-600">{page.category}</p>
                        {selectedPage?.id === page.id && (
                          <Badge variant="default" className="mt-1 text-xs">محدد</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pages.length > 4 && (
                <Card 
                  className="cursor-pointer transition-all hover:shadow-md border-dashed"
                  onClick={() => navigate('/facebook-management')}
                >
                  <CardContent className="pt-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          +{pages.length - 4}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">المزيد من الصفحات</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                onClick={() => navigate('/facebook-management')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                عرض جميع الصفحات والميزات
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-blue-900">
              بحاجة إلى مساعدة؟
            </h3>
            <p className="text-blue-700">
              تصفح الأدلة والتوجيهات للحصول على أقصى استفادة من أدوات فيسبوك
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/facebook-management')}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              الانتقال إلى الإدارة الكاملة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookDashboard;