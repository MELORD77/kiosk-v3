import { useEffect, useRef } from 'react';
import type { FaceBox } from '../model/face-detector';

interface FaceOverlayProps {
  faces: FaceBox[];
  progress: number;
}

export function FaceOverlay({ faces, progress }: FaceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const colors = getComputedStyle(canvas);
      const color = colors
        .getPropertyValue(progress > 0 ? '--color-success' : '--color-primary')
        .trim();
      context.strokeStyle = color;
      context.lineWidth = 3;
      for (const face of faces) {
        const x = face.x * width;
        const y = face.y * height;
        const boxWidth = face.width * width;
        const boxHeight = face.height * height;
        context.beginPath();
        context.roundRect(
          x,
          y,
          boxWidth,
          boxHeight,
          Math.min(16, boxWidth / 4, boxHeight / 4),
        );
        context.stroke();
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
    };
  }, [faces, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
