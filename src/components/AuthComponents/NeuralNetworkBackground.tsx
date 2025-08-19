import React from 'react';
import { motion } from 'framer-motion';

export const NeuralNetworkBackground = () => {
  // نقاط الشبكة العصبية
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  }));

  // خطوط الاتصال
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = Math.sqrt(
        Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
      );
      if (distance < 25) {
        connections.push({
          from: nodes[i],
          to: nodes[j],
          opacity: Math.max(0.1, 1 - distance / 25),
        });
      }
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg className="absolute inset-0 w-full h-full">
        {/* خطوط الاتصال */}
        {connections.map((connection, index) => (
          <motion.line
            key={index}
            x1={`${connection.from.x}%`}
            y1={`${connection.from.y}%`}
            x2={`${connection.to.x}%`}
            y2={`${connection.to.y}%`}
            stroke="url(#neuralGradient)"
            strokeWidth="1"
            opacity={connection.opacity}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: index * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 3,
            }}
          />
        ))}
        
        {/* تدرجات للخطوط */}
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195 100% 60%)" />
            <stop offset="50%" stopColor="hsl(260 100% 70%)" />
            <stop offset="100%" stopColor="hsl(150 100% 60%)" />
          </linearGradient>
          
          <radialGradient id="nodeGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(195 100% 60%)" stopOpacity="0.8" />
            <stop offset="70%" stopColor="hsl(260 100% 70%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* نقاط الشبكة العصبية */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
            background: 'radial-gradient(circle, hsl(195 100% 60%), hsl(260 100% 70%))',
            boxShadow: '0 0 20px hsl(195 100% 60% / 0.5)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3,
            delay: node.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* موجات الطاقة */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border border-primary/10 rounded-full"
            style={{
              left: '20%',
              top: '30%',
              width: '60%',
              height: '40%',
            }}
            animate={{
              scale: [1, 2, 3],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 4,
              delay: i * 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* جزيئات طاقة متحركة */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* شبكة هندسية */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)] bg-[length:100px_100px]"></div>
      </div>
    </div>
  );
};