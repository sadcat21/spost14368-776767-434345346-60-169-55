import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Users, Activity } from "lucide-react";
import { useFacebook } from "@/contexts/FacebookContext";
import { motion, AnimatePresence } from "framer-motion";

interface PlatformInfo {
  name: string;
  Icon: any;
  color: string;
  textColor: string;
  metrics: any;
  status: string;
}

interface FacebookCardProps {
  hoveredPlatform?: PlatformInfo | null;
}

export const FacebookCard = ({ hoveredPlatform }: FacebookCardProps) => {
  const { userInfo, selectedPage, isConnected, pages } = useFacebook();

  // Use Facebook data as default when no platform is hovered
  const displayPlatform = hoveredPlatform || {
    name: "Facebook",
    Icon: Facebook,
    color: "from-blue-500 to-blue-700",
    textColor: "text-blue-300",
    metrics: isConnected && selectedPage ? {
      page: selectedPage.name,
      category: selectedPage.category,
      pageId: selectedPage.id,
      status: "متصل",
      profilePicture: selectedPage.picture?.data?.url,
      totalPages: pages.length.toString()
    } : { 
      status: "غير متصل", 
      pages: pages.length.toString(),
      action: "اتصل بفيسبوك",
      totalPages: "0" 
    },
    status: isConnected ? "active" : "inactive"
  };

  const getStatusBadge = () => {
    if (displayPlatform.name === "Facebook") {
      return isConnected ? (
        <Badge variant="secondary" className="bg-green-100 text-green-800">متصل</Badge>
      ) : (
        <Badge variant="secondary" className="bg-red-100 text-red-800">غير متصل</Badge>
      );
    }
    
    const statusMap = {
      "active": <Badge variant="secondary" className="bg-green-100 text-green-800">نشط</Badge>,
      "inactive": <Badge variant="secondary" className="bg-red-100 text-red-800">غير نشط</Badge>,
      "processing": <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد المعالجة</Badge>,
      "trending": <Badge variant="secondary" className="bg-purple-100 text-purple-800">رائج</Badge>
    };
    
    return statusMap[displayPlatform.status as keyof typeof statusMap] || statusMap.inactive;
  };

  const renderMetrics = () => {
    if (displayPlatform.name === "Facebook" && isConnected && selectedPage) {
      return (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400">
              <Activity className="h-4 w-4" />
              <span className="text-sm">حالة الاتصال</span>
            </div>
            <p className="text-green-300 font-bold">نشط</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400">
              <Users className="h-4 w-4" />
              <span className="text-sm">إجمالي الصفحات</span>
            </div>
            <p className="text-white font-bold">{pages.length}</p>
          </div>
        </div>
      );
    }

    // Display metrics for other platforms
    const metrics = displayPlatform.metrics;
    const metricKeys = Object.keys(metrics);
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {metricKeys.slice(0, 4).map((key, index) => (
          <div key={key} className="text-center">
            <div className="flex items-center justify-center gap-1 text-cyan-400">
              <Activity className="h-3 w-3" />
              <span className="text-xs capitalize">{key}</span>
            </div>
            <p className="text-white font-bold text-sm">{metrics[key]}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayPlatform.name}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className={`w-full max-w-md mx-auto bg-gradient-to-br ${displayPlatform.color} border-white/20 text-white shadow-2xl backdrop-blur-sm`}>
          <CardContent className="p-0">
            {/* User Account Section (Red Area) */}
            <motion.div 
              className="border-2 border-red-500/50 rounded-t-lg p-4 bg-black/20 backdrop-blur-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <displayPlatform.Icon className="h-6 w-6 text-cyan-400" />
                  <span className="text-lg font-semibold">{displayPlatform.name}</span>
                </div>
                {getStatusBadge()}
              </div>
              
              {displayPlatform.name === "Facebook" && userInfo ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={userInfo.picture?.data?.url} 
                      alt={userInfo.name}
                    />
                    <AvatarFallback>
                      {userInfo.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{userInfo.name}</p>
                    {userInfo.email && (
                      <p className="text-sm text-white/70">{userInfo.email}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-300">
                      <displayPlatform.Icon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">نظام {displayPlatform.name}</p>
                    <p className="text-sm text-white/70">منصة التواصل الاجتماعي</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Page Information Section (Yellow Area) */}
            <motion.div 
              className="border-2 border-yellow-500/50 rounded-b-lg p-4 bg-black/10 backdrop-blur-sm"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {displayPlatform.name === "Facebook" && selectedPage ? (
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={selectedPage.picture?.data?.url} 
                      alt={selectedPage.name}
                    />
                    <AvatarFallback>
                      {selectedPage.name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedPage.name}</h3>
                    <p className="text-white/70 text-sm">{selectedPage.category}</p>
                    <p className="text-xs text-white/50 font-mono">
                      ID: {selectedPage.id}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-yellow-500/20 text-yellow-300">
                      <displayPlatform.Icon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">تحليلات {displayPlatform.name}</h3>
                    <p className="text-white/70 text-sm">إحصائيات المنصة</p>
                    <p className="text-xs text-white/50">
                      الحالة: {displayPlatform.status}
                    </p>
                  </div>
                </div>
              )}

              {/* Platform Metrics */}
              {renderMetrics()}

              {/* Additional Info */}
              <motion.div 
                className="mt-4 pt-3 border-t border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">منصة التواصل</span>
                  <span className="text-white/90 font-medium">{displayPlatform.name}</span>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Diagnopage Smart Management
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};