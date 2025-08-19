import { useEffect, useRef } from "react";

const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Neural network nodes
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      connections: number[];
      isCentral?: boolean;
    }> = [];

    // Create nodes
    const nodeCount = 60; // زيادة عدد العقد
    for (let i = 0; i < nodeCount; i++) {
      const isCentral = i === Math.floor(nodeCount / 2);
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isCentral ? 0.2 : 0.8), // العقدة المركزية تتحرك ببطء
        vy: (Math.random() - 0.5) * (isCentral ? 0.2 : 0.8),
        radius: isCentral ? 8 : Math.random() * 4 + 2, // العقدة المركزية أكبر
        connections: [],
        isCentral: isCentral
      });
    }

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      nodes.forEach((node, index) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Keep nodes in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Find connections (skip for central node)
        node.connections = [];
        if (!node.isCentral) {
          nodes.forEach((otherNode, otherIndex) => {
            if (index !== otherIndex && !otherNode.isCentral) {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
              );
              if (distance < 150) {
                node.connections.push(otherIndex);
              }
            }
          });
        }
      });

      // Draw connections with enhanced visibility
      ctx.lineWidth = 2;
      nodes.forEach((node, index) => {
        node.connections.forEach(connectionIndex => {
          if (connectionIndex > index) { // Avoid drawing the same line twice
            const otherNode = nodes[connectionIndex];
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
            );
            const opacity = Math.max(0, 1 - distance / 150);
            
            // تدرج لوني للخطوط
            const gradient = ctx.createLinearGradient(node.x, node.y, otherNode.x, otherNode.y);
            gradient.addColorStop(0, `rgba(0, 191, 255, ${opacity * 0.6})`);
            gradient.addColorStop(0.5, `rgba(100, 149, 237, ${opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(0, 191, 255, ${opacity * 0.6})`);
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes (without green connection points)
      nodes.forEach(node => {
        // Central node styling
        if (node.isCentral) {
          // Central node glow (larger and more prominent)
          const centralGradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, node.radius * 4
          );
          centralGradient.addColorStop(0, 'rgba(138, 43, 226, 0.9)');
          centralGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
          centralGradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
          
          ctx.fillStyle = centralGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
          ctx.fill();

          // Central node core
          ctx.fillStyle = 'rgba(138, 43, 226, 1)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Central node inner glow
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Regular node glow
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, node.radius * 3
          );
          gradient.addColorStop(0, 'rgba(0, 191, 255, 0.8)');
          gradient.addColorStop(0.5, 'rgba(0, 191, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 191, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
          ctx.fill();

          // Regular node core
          ctx.fillStyle = 'rgba(0, 191, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();

          // Regular node inner glow
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        opacity: 0.9,
        background: 'linear-gradient(45deg, rgba(10, 10, 20, 0.95), rgba(20, 10, 30, 0.95))'
      }}
    />
  );
};

export default NeuralBackground;
