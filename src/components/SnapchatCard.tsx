import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ghost, Activity, Camera, Flame, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import snapchatLogo from "@/assets/snapchat.svg";

interface PlatformInfo {
  name: string;
  Icon: any;
  color: string;
  textColor: string;
  metrics: Record<string, string>;
  status: string;
}

interface SnapchatCardProps {
  hoveredPlatform?: PlatformInfo | null;
}

export const SnapchatCard = ({ hoveredPlatform }: SnapchatCardProps) => {
  const displayPlatform: PlatformInfo = hoveredPlatform || {
    name: 'Snapchat',
    Icon: (props: any) => (
      <img {...props} src={snapchatLogo} alt="شعار سناب شات الرسمي" className={`h-6 w-6 drop-shadow ${props?.className || ''}`} />
    ),
    color: 'from-yellow-400 to-yellow-500',
    textColor: 'text-yellow-300',
    metrics: { friends: '12.3K', snaps: '56K', stories: '120' },
    status: 'active',
  };

  const metrics = displayPlatform.metrics || {};
  const entries = Object.entries(metrics).slice(0, 4);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="snapchat-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className={`w-full max-w-md mx-auto bg-gradient-to-br ${displayPlatform.color} border-white/20 text-white shadow-2xl backdrop-blur-sm`}>
          <CardContent className="p-0">
            {/* Header */}
            <motion.div 
              className="rounded-t-lg p-4 bg-black/20 backdrop-blur-sm border-b border-white/20"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <displayPlatform.Icon className="h-6 w-6 text-black drop-shadow" />
                  <span className="text-lg font-semibold">Snapchat</span>
                </div>
                <Badge variant="secondary" className="bg-black/20 text-white border border-white/20">نشط</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-yellow-500/20 text-yellow-900">
                    <Ghost className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">حساب Snapchat</p>
                  <p className="text-sm text-white/80">قصص، سنابات، سكور</p>
                </div>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div 
              className="p-4 bg-black/10"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-3 gap-3">
                {entries.map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="flex items-center justify-center gap-1 text-black/80">
                      <Activity className="h-3 w-3" />
                      <span className="text-xs">
                        {key}
                      </span>
                    </div>
                    <p className="text-white font-bold text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1">
                  <Camera className="h-3 w-3" />
                  <span>Snaps</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1">
                  <PlayCircle className="h-3 w-3" />
                  <span>Stories</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 rounded px-2 py-1">
                  <Flame className="h-3 w-3" />
                  <span>Streaks</span>
                </div>
              </div>

              <motion.div 
                className="mt-4 pt-3 border-t border-white/20 text-sm text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                تحليلات سريعة لحساب Snapchat وتحسين التفاعل مع الجمهور.
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
