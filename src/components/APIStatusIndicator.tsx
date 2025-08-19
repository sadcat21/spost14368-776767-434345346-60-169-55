import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Camera, Globe, Zap } from "lucide-react";
import { geminiApiManager } from "@/utils/geminiApiManager";

export const APIStatusIndicator: React.FC = () => {
  const geminiStats = geminiApiManager.getKeyStats();

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-primary">حالة APIs المتقدمة</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Gemini API Status */}
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Gemini API</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {geminiStats.activeKeys}/{geminiStats.totalKeys} مفاتيح نشطة
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* A4F API Status */}
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">A4F API</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      Imagen-3 جاهز
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>جميع الخدمات تعمل بكفاءة عالية</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};