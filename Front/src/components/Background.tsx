import { useEffect, useRef } from 'react';

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isDark: boolean) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(
    x, y, 
    x - size * 0.5, y, 
    x - size * 0.5, y + size * 0.3
  );
  ctx.bezierCurveTo(
    x - size * 0.5, y + size * 0.6, 
    x, y + size * 0.8, 
    x, y + size
  );
  ctx.bezierCurveTo(
    x, y + size * 0.8, 
    x + size * 0.5, y + size * 0.6, 
    x + size * 0.5, y + size * 0.3
  );
  ctx.bezierCurveTo(
    x + size * 0.5, y, 
    x, y, 
    x, y + size * 0.3
  );
  ctx.closePath();
}

function drawPulse(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  
  // Draw the pulse wave
  ctx.lineTo(x + width * 0.2, y);
  ctx.lineTo(x + width * 0.3, y - 20);
  ctx.lineTo(x + width * 0.35, y + 20);
  ctx.lineTo(x + width * 0.4, y - 40);
  ctx.lineTo(x + width * 0.45, y + 40);
  ctx.lineTo(x + width * 0.5, y);
  ctx.lineTo(x + width, y);
  
  ctx.stroke();
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gradient = gradientRef.current;
    if (!canvas || !gradient) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Animation variables
    let frame = 0;
    const hearts: Array<{ x: number; y: number; size: number; speed: number; opacity: number }> = [];
    const pulses: Array<{ x: number; y: number; progress: number }> = [];

    // Create initial hearts
    for (let i = 0; i < 15; i++) {
      hearts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    // Create initial pulses
    for (let i = 0; i < 5; i++) {
      pulses.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        progress: Math.random()
      });
    }

    const animate = () => {
      const isDark = document.documentElement.classList.contains('dark');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw hearts
      hearts.forEach(heart => {
        ctx.save();
        const color = isDark ? '129, 140, 248' : '79, 70, 229'; // indigo-400 : indigo-700
        ctx.fillStyle = `rgba(${color}, ${heart.opacity})`;
        ctx.strokeStyle = `rgba(${color}, ${heart.opacity * 1.5})`;
        ctx.lineWidth = 1;
        
        heart.y -= heart.speed;
        if (heart.y + heart.size < 0) {
          heart.y = canvas.height + heart.size;
          heart.x = Math.random() * canvas.width;
        }
        
        drawHeart(ctx, heart.x, heart.y, heart.size, isDark);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Update and draw pulses
      pulses.forEach(pulse => {
        ctx.save();
        const color = isDark ? '129, 140, 248' : '79, 70, 229'; // indigo-400 : indigo-700
        ctx.strokeStyle = `rgba(${color}, 0.2)`;
        ctx.lineWidth = 2;
        
        pulse.progress += 0.001;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.x = Math.random() * canvas.width;
          pulse.y = Math.random() * canvas.height;
        }
        
        drawPulse(ctx, pulse.x, pulse.y, 100);
        ctx.restore();
      });

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <>
      <div 
        ref={gradientRef}
        className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30"
      >
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-[100px]"></div>
      </div>
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 -z-10"
      />
    </>
  );
}