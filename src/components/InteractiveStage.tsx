import React, { useState, useRef } from 'react';

interface InteractiveStageProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const InteractiveStage: React.FC<InteractiveStageProps> = ({
  children,
  className = '',
  intensity = 15,
  glowColor = 'rgba(0, 245, 212, 0.25)',
  style = {},
  onClick,
}) => {
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [lightPosition, setLightPosition] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -intensity;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * intensity;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setLightPosition({ x: percentX, y: percentY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setLightPosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: transformStyle,
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
    >
      {children}

      {/* Dynamic Specular Light & Lens Flare Sheen Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(circle at ${lightPosition.x}% ${lightPosition.y}%, ${glowColor} 0%, rgba(255, 255, 255, 0.08) 25%, transparent 60%)`,
          opacity: lightPosition.opacity,
          transition: 'opacity 0.25s ease',
          mixBlendMode: 'screen',
          zIndex: 15,
        }}
      />
    </div>
  );
};
