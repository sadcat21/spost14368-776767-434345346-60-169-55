import React from 'react';
import { motion } from 'framer-motion';
import { NeuralNetworkBackground } from './NeuralNetworkBackground';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* الخلفية الأساسية المتدرجة */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background"></div>
      
      {/* شبكة عصبية ذكية */}
      <NeuralNetworkBackground />
      
      {/* كرات الطاقة المتحركة */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"
          style={{ top: '-20%', right: '-20%' }}
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-3xl"
          style={{ bottom: '-15%', left: '-15%' }}
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 0.9, 1],
            rotate: [0, -120, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>

      {/* جزيئات ذكية متحركة */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* تأثير الطيف الضوئي */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            style={{
              top: `${30 + i * 20}%`,
              left: '-100%',
              right: '-100%',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 3
            }}
          />
        ))}
      </div>
    </div>
  );
};