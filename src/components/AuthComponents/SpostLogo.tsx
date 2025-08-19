import React from 'react';
import { motion } from 'framer-motion';

export const SpostLogo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-center mb-8 relative"
    >
      {/* خلفية متوهجة متحركة */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.6, 0.3],
          scale: [0.8, 1.2, 1]
        }}
        transition={{
          delay: 0.5,
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        style={{
          width: '200px',
          height: '200px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* حاوية الشعار الرئيسية */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: "spring" as const,
          stiffness: 100,
          damping: 15,
          duration: 1.2
        }}
        className="relative mb-6 inline-block"
      >
        <div className="relative">
          {/* توهج خلفي إضافي */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: '100px',
              height: '100px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
          
          {/* الشعار الرسمي */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{
              delay: 0.3,
              type: "spring" as const,
              stiffness: 120,
              damping: 12
            }}
            className="relative flex items-center justify-center z-10"
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 }
            }}
          >
            <img 
              src="/lovable-uploads/47734581-9a0a-49c9-bfb9-16c9bf3bcf22.png" 
              alt="الشعار الرسمي" 
              className="h-24 w-24 object-contain drop-shadow-2xl relative z-20"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* اسم البرنامج */}
      <motion.h1
        initial={{ y: 50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          delay: 0.8,
          type: "spring" as const,
          stiffness: 100,
          damping: 15
        }}
        className="text-6xl font-black text-white mb-4 tracking-wide text-center relative z-10"
        style={{ 
          textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.1)' 
        }}
        whileHover={{
          scale: 1.05
        }}
      >
        <motion.span
          animate={{
            backgroundPosition: ['0%', '100%', '0%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
          className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          style={{ backgroundSize: '300%' }}
        >
          Spost
        </motion.span>
      </motion.h1>

      {/* الشعار النصي */}
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: 0.8
        }}
        className="text-xl text-white/90 font-medium text-center leading-relaxed max-w-md mx-auto"
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
      >
        أنشئ، خطط وانشر محتواك بسهولة
      </motion.p>

      {/* خط الزخرفة المتحرك */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 128, opacity: 1 }}
        transition={{
          delay: 1.6,
          duration: 1
        }}
        className="mt-8 mx-auto h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-lg relative overflow-hidden"
        style={{ width: 128 }}
      >
        <motion.div
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{ width: '50%' }}
        />
      </motion.div>

      {/* جزيئات متحركة */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          initial={{
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.cos(i * 60 * Math.PI / 180) * 150,
            y: Math.sin(i * 60 * Math.PI / 180) * 150
          }}
          transition={{
            delay: 2 + i * 0.1,
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          style={{
            left: '50%',
            top: '50%'
          }}
        />
      ))}
    </motion.div>
  );
};