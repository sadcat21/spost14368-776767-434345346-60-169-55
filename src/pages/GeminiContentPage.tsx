import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Brain, Zap, Star, Shield, Cpu, Rocket } from "lucide-react";
import { NewGeminiContentEngine } from "@/components/NewGeminiContentEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const GeminiContentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 relative overflow-hidden">
      {/* خلفية متحركة للذكاء الاصطناعي */}
      <div className="absolute inset-0 bg-neural-pattern opacity-20 animate-pulse-slow"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
      
      {/* شبكة الطاقة الكهربائية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative container mx-auto p-6 space-y-8">
        {/* العنوان الرئيسي المطور */}
        <div className="text-center space-y-6 py-16">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 animate-brain-pulse drop-shadow-2xl">
              🎨 النسخة الكاملة
            </h1>
            <div className="absolute -top-4 -right-4">
              <Sparkles className="h-10 w-10 text-cyan-400 animate-spin drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-2 -left-4">
              <Zap className="h-8 w-8 text-purple-400 animate-pulse drop-shadow-lg" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Brain className="h-10 w-10 text-cyan-400 animate-pulse drop-shadow-lg" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              نظام Gemini المتقدم
            </h2>
            <div className="relative">
              <Cpu className="h-10 w-10 text-purple-400 animate-pulse drop-shadow-lg" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            منصة شاملة لتوليد المحتوى والصور بتقنيات الذكاء الاصطناعي المتطورة مع واجهة عصرية وقوية
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge className="px-6 py-3 text-base bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 border-cyan-400/20 animate-fade-in hover-scale shadow-lg">
              <Zap className="h-5 w-5 ml-2" />
              سرعة فائقة
            </Badge>
            <Badge className="px-6 py-3 text-base bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-purple-400/20 animate-fade-in hover-scale shadow-lg" style={{animationDelay: '0.2s'}}>
              <Star className="h-5 w-5 ml-2" />
              جودة عالية
            </Badge>
            <Badge className="px-6 py-3 text-base bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400/20 animate-fade-in hover-scale shadow-lg" style={{animationDelay: '0.4s'}}>
              <Shield className="h-5 w-5 ml-2" />
              آمن ومحلي
            </Badge>
          </div>
        </div>

        {/* البطاقة الرئيسية المطورة */}
        <Card className="shadow-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl hover:shadow-cyan-500/10 transition-all duration-700 hover:scale-[1.01] relative overflow-hidden group">
          {/* تأثير الضوء المتحرك */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -skew-x-12 animate-data-flow group-hover:via-cyan-400/10"></div>
          
          {/* تأثير الحواف المضيئة */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent"></div>
          
          <CardHeader className="relative border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
            <CardTitle className="flex items-center gap-4 text-3xl">
              <div className="relative">
                <Bot className="h-10 w-10 text-cyan-400 animate-ai-pulse drop-shadow-lg" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-pulse"></div>
              </div>
              <span className="bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 bg-clip-text text-transparent font-black">
                محرك توليد المحتوى الذكي
              </span>
              <Sparkles className="h-8 w-8 text-purple-400 animate-pulse drop-shadow-lg" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative space-y-8">
            {/* قسم الميزات الرئيسية */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* بطاقة النظام المستقل */}
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 border border-cyan-400/30 group hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-400/20 backdrop-blur-sm">
                <div className="absolute top-4 left-4">
                  <Rocket className="h-8 w-8 text-cyan-400 group-hover:animate-bounce drop-shadow-lg" />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h3 className="text-2xl font-bold text-slate-100 mb-4 mr-12 drop-shadow-lg">
                  نظام توليد المحتوى المستقل
                </h3>
                
                <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                  نظام متطور لتوليد المحتوى والصور باستخدام تقنيات Gemini الحديثة، 
                  يعتمد بالكامل على مفتاح API المدخل من المستخدم
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg"
                    onClick={() => navigate("/gemini-image")}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 border-cyan-400/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20 text-white font-semibold"
                  >
                    🎨 مولد الصور الذكي
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate("/ai-tools")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 hover:border-slate-500 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  >
                    🤖 أدوات الذكاء الاصطناعي
                  </Button>
                </div>
              </div>

              {/* بطاقة متطلبات النظام */}
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 border border-emerald-400/30 group hover:border-emerald-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-400/20 backdrop-blur-sm">
                <div className="absolute top-4 left-4">
                  <Shield className="h-8 w-8 text-emerald-400 group-hover:animate-pulse drop-shadow-lg" />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <h4 className="text-2xl font-bold text-slate-100 mb-4 mr-12 drop-shadow-lg">
                  ⚠️ متطلبات النظام
                </h4>
                
                <ul className="space-y-4 text-lg text-slate-300">
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>يجب إدخال مفتاح Gemini API صالح للتشغيل</span>
                  </li>
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>المفتاح محفوظ محلياً في المتصفح فقط</span>
                  </li>
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>جميع العمليات تستخدم المفتاح المدخل حصرياً</span>
                  </li>
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>يمكن الحصول على المفتاح من Google AI Studio</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* المحرك الرئيسي */}
            <div className="relative p-2 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/30">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-purple-400/5 to-blue-400/5 rounded-2xl"></div>
              <NewGeminiContentEngine />
            </div>
            
            {/* قسم الإصلاحات والتحديثات */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-400/20 group backdrop-blur-sm">
              <div className="absolute top-4 left-4">
                <Star className="h-8 w-8 text-purple-400 group-hover:animate-spin drop-shadow-lg" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h4 className="text-2xl font-bold text-slate-100 mb-6 mr-12 drop-shadow-lg">
                ✅ الإصلاحات والتحسينات المطبقة
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-4 text-lg text-slate-300">
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>إصلاح تمرير برومت جينيوس من المرحلة الثانية إلى الرابعة</span>
                  </li>
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>إضافة عرض واضح لكلا البرومتين (العادي + جينيوس)</span>
                  </li>
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>إصلاح توليد الصور بالنمطين معاً</span>
                  </li>
                </ul>
                
                <ul className="space-y-4 text-lg text-slate-300">
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>تحسين واجهة عرض الصور مع تبويبات منفصلة</span>
                  </li>
                  <li className="flex items-start gap-3 group/item hover:text-slate-100 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2 flex-shrink-0 group-hover/item:animate-pulse drop-shadow-sm"></div>
                    <span>إضافة مؤشرات واضحة لحالة البرومت وتوفر النمط جينيوس</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* خط فاصل مع تأثير */}
        <div className="flex items-center justify-center py-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          <div className="mx-6 relative">
            <Brain className="h-8 w-8 text-cyan-400 animate-pulse drop-shadow-lg" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default GeminiContentPage;