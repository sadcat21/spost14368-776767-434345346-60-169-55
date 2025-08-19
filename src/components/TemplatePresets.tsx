import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bookmark, 
  BookOpen, 
  TrendingUp, 
  Lightbulb, 
  Heart,
  Search,
  Sparkles,
  Layout,
  Users,
  Trophy,
  Zap,
  Gift
} from "lucide-react";
import { toast } from "sonner";

export interface TemplatePreset {
  id: string;
  name: string;
  category: 'motivational' | 'educational' | 'marketing' | 'business' | 'wellness' | 'social';
  thumbnail: string;
  description: string;
  tags: string[];
  settings: {
    layoutType: 'rectangle' | 'triangle' | 'trapezoid' | 'half-triangle' | 'half-trapezoid' | 'half-circle' | 'half-ellipse' | 'polygon';
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    textStyle: {
      fontFamily: string;
      fontSize: number;
      fontWeight: string;
      alignment: 'left' | 'center' | 'right';
    };
    shapeSettings: any;
    frameSettings: any;
    backgroundEffects: any;
  };
  sampleText: string;
  popularity: number;
}

interface TemplatePresetsProps {
  onSelectTemplate: (template: TemplatePreset) => void;
  onSaveAsTemplate?: (name: string, description: string) => void;
}

const templateCategories = [
  { value: 'all', label: 'الكل', icon: Layout },
  { value: 'motivational', label: 'تحفيزي', icon: Zap },
  { value: 'educational', label: 'تعليمي', icon: BookOpen },
  { value: 'marketing', label: 'تسويقي', icon: TrendingUp },
  { value: 'business', label: 'أعمال', icon: Users },
  { value: 'wellness', label: 'صحة ورفاهية', icon: Heart },
  { value: 'social', label: 'اجتماعي', icon: Gift }
];

const sampleTemplates: TemplatePreset[] = [
  {
    id: 'motivational-1',
    name: 'إلهام النجاح',
    category: 'motivational',
    thumbnail: '/api/placeholder/300/200',
    description: 'قالب تحفيزي أنيق مع خلفية متدرجة وإطار ذهبي',
    tags: ['تحفيز', 'نجاح', 'إلهام', 'ذهبي'],
    settings: {
      layoutType: 'rectangle',
      colorScheme: {
        primary: '#f59e0b',
        secondary: '#1f2937',
        accent: '#fbbf24',
        background: 'linear-gradient(135deg, #1f2937, #374151)',
        text: '#ffffff'
      },
      textStyle: {
        fontFamily: 'Cairo',
        fontSize: 28,
        fontWeight: '700',
        alignment: 'center'
      },
      shapeSettings: {
        hasRoundedCorners: true,
        cornerRadius: 15
      },
      frameSettings: {
        enabled: true,
        borderColor: '#f59e0b',
        borderWidth: 3
      },
      backgroundEffects: {
        vignetteEnabled: true,
        vignetteIntensity: 30
      }
    },
    sampleText: 'النجاح يبدأ بخطوة واحدة... ابدأ اليوم!',
    popularity: 95
  },
  {
    id: 'educational-1',
    name: 'معلومة اليوم',
    category: 'educational',
    thumbnail: '/api/placeholder/300/200',
    description: 'قالب تعليمي بسيط مع تصميم أكاديمي احترافي',
    tags: ['تعليم', 'معلومات', 'أكاديمي', 'بسيط'],
    settings: {
      layoutType: 'rectangle',
      colorScheme: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#60a5fa',
        background: '#f8fafc',
        text: '#1e293b'
      },
      textStyle: {
        fontFamily: 'Tajawal',
        fontSize: 24,
        fontWeight: '600',
        alignment: 'right'
      },
      shapeSettings: {
        hasRoundedCorners: true,
        cornerRadius: 12
      },
      frameSettings: {
        enabled: true,
        borderColor: '#3b82f6',
        borderWidth: 2
      },
      backgroundEffects: {
        overlayEnabled: true,
        overlayTexture: 'paper',
        overlayIntensity: 10
      }
    },
    sampleText: 'هل تعلم أن... العقل البشري يستهلك 20% من طاقة الجسم؟',
    popularity: 88
  },
  {
    id: 'marketing-1',
    name: 'عرض مميز',
    category: 'marketing',
    thumbnail: '/api/placeholder/300/200',
    description: 'قالب تسويقي جذاب مع ألوان زاهية وتأثيرات بصرية',
    tags: ['تسويق', 'عروض', 'جذاب', 'زاهي'],
    settings: {
      layoutType: 'trapezoid',
      colorScheme: {
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#fca5a5',
        background: 'linear-gradient(45deg, #ef4444, #f97316)',
        text: '#ffffff'
      },
      textStyle: {
        fontFamily: 'Almarai',
        fontSize: 30,
        fontWeight: '800',
        alignment: 'center'
      },
      shapeSettings: {
        triangleDirection: 'up'
      },
      frameSettings: {
        enabled: true,
        borderColor: '#ffffff',
        borderWidth: 4
      },
      backgroundEffects: {
        lightingEnabled: true,
        lightingType: 'spot',
        lightIntensity: 70
      }
    },
    sampleText: 'عرض خاص! خصم 50% لفترة محدودة',
    popularity: 92
  },
  {
    id: 'business-1',
    name: 'احترافي أنيق',
    category: 'business',
    thumbnail: '/api/placeholder/300/200',
    description: 'تصميم احترافي للأعمال مع ألوان هادئة وخطوط واضحة',
    tags: ['أعمال', 'احترافي', 'أنيق', 'هادئ'],
    settings: {
      layoutType: 'rectangle',
      colorScheme: {
        primary: '#374151',
        secondary: '#4b5563',
        accent: '#9ca3af',
        background: '#f9fafb',
        text: '#111827'
      },
      textStyle: {
        fontFamily: 'Inter',
        fontSize: 26,
        fontWeight: '600',
        alignment: 'left'
      },
      shapeSettings: {
        hasRoundedCorners: true,
        cornerRadius: 8
      },
      frameSettings: {
        enabled: false
      },
      backgroundEffects: {
        vignetteEnabled: true,
        vignetteIntensity: 15,
        vignetteColor: '#374151'
      }
    },
    sampleText: 'الابتكار هو مفتاح النمو في عالم الأعمال',
    popularity: 85
  },
  {
    id: 'wellness-1',
    name: 'صحة وسلام',
    category: 'wellness',
    thumbnail: '/api/placeholder/300/200',
    description: 'تصميم مهدئ للصحة والرفاهية مع ألوان طبيعية',
    tags: ['صحة', 'سلام', 'طبيعي', 'مهدئ'],
    settings: {
      layoutType: 'half-circle',
      colorScheme: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#6ee7b7',
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        text: '#064e3b'
      },
      textStyle: {
        fontFamily: 'Cairo',
        fontSize: 24,
        fontWeight: '500',
        alignment: 'center'
      },
      shapeSettings: {
        triangleDirection: 'up'
      },
      frameSettings: {
        enabled: true,
        borderColor: '#10b981',
        borderWidth: 2
      },
      backgroundEffects: {
        atmosphericEnabled: true,
        particleType: 'dust',
        particleCount: 20
      }
    },
    sampleText: 'العقل السليم في الجسم السليم',
    popularity: 78
  },
  {
    id: 'social-1',
    name: 'تفاعل اجتماعي',
    category: 'social',
    thumbnail: '/api/placeholder/300/200',
    description: 'قالب مرح للمحتوى الاجتماعي مع ألوان نابضة بالحياة',
    tags: ['اجتماعي', 'مرح', 'نابض', 'تفاعلي'],
    settings: {
      layoutType: 'polygon',
      colorScheme: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#c4b5fd',
        background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
        text: '#ffffff'
      },
      textStyle: {
        fontFamily: 'Poppins',
        fontSize: 25,
        fontWeight: '700',
        alignment: 'center'
      },
      shapeSettings: {
        polygonSides: 6,
        polygonRotation: 15
      },
      frameSettings: {
        enabled: true,
        borderColor: '#ffffff',
        borderWidth: 3
      },
      backgroundEffects: {
        atmosphericEnabled: true,
        particleType: 'sparkles',
        particleCount: 30
      }
    },
    sampleText: '✨ شارك إبداعك مع العالم ✨',
    popularity: 90
  }
];

export const TemplatePresets = ({ onSelectTemplate, onSaveAsTemplate }: TemplatePresetsProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates] = useState<TemplatePreset[]>(sampleTemplates);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: TemplatePreset) => {
    onSelectTemplate(template);
    toast.success(`تم تحميل قالب "${template.name}" بنجاح!`);
  };

  const getCategoryIcon = (category: string) => {
    const categoryItem = templateCategories.find(cat => cat.value === category);
    return categoryItem ? categoryItem.icon : Layout;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      motivational: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      educational: 'bg-blue-100 text-blue-800 border-blue-200',
      marketing: 'bg-red-100 text-red-800 border-red-200',
      business: 'bg-gray-100 text-gray-800 border-gray-200',
      wellness: 'bg-green-100 text-green-800 border-green-200',
      social: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          مكتبة القوالب الجاهزة
        </CardTitle>
        
        {/* شريط البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="ابحث عن قالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          {/* تبويبات الفئات */}
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
            {templateCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="text-xs"
                >
                  <div className="flex items-center gap-1">
                    <IconComponent className="h-3 w-3" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* محتوى القوالب */}
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                return (
                  <div
                    key={template.id}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {/* معاينة القالب */}
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
                      <div 
                        className="w-3/4 h-3/4 rounded flex items-center justify-center text-white text-sm font-semibold shadow-lg"
                        style={{ 
                          background: template.settings.colorScheme.background,
                          color: template.settings.colorScheme.text
                        }}
                      >
                        <span className="text-center px-2 leading-tight">
                          {template.sampleText.substring(0, 50)}...
                        </span>
                      </div>
                      
                      {/* تراكب الاختيار */}
                      <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Sparkles className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm font-semibold">انقر للاستخدام</p>
                        </div>
                      </div>
                    </div>

                    {/* معلومات القالب */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Trophy className="h-3 w-3" />
                          {template.popularity}%
                        </div>
                      </div>

                      {/* التصنيف والعلامات */}
                      <div className="space-y-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(template.category)}`}
                        >
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {templateCategories.find(cat => cat.value === template.category)?.label}
                        </Badge>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد قوالب تطابق البحث</p>
                <p className="text-sm mt-2">جرب البحث بكلمات مختلفة أو اختر فئة أخرى</p>
              </div>
            )}
          </ScrollArea>

          {/* أزرار إضافية */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              <span>عدد القوالب: {filteredTemplates.length}</span>
            </div>
            
            {onSaveAsTemplate && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // يمكن إضافة مودال لحفظ التصميم الحالي كقالب
                  toast.info("ميزة حفظ القالب قيد التطوير");
                }}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                حفظ كقالب
              </Button>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};