import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, Sparkles, X } from 'lucide-react';

interface PhotoMagnifierLoupeProps {
  src: string;
  alt: string;
  zoomLevel?: number;
  loupeSize?: number;
  className?: string;
  onDoubleTap?: () => void;
  children?: React.ReactNode;
}

export const PhotoMagnifierLoupe: React.FC<PhotoMagnifierLoupeProps> = ({
  src,
  alt,
  zoomLevel = 2.8,
  loupeSize = 140,
  className = '',
  onDoubleTap,
  children,
}) => {
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; bgX: number; bgY: number }>({
    x: 0,
    y: 0,
    bgX: 0,
    bgY: 0,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isLoupeActive || !imgRef.current) return;

      const rect = imgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Restrict within image bounds
      const x = Math.max(0, Math.min(clientX, rect.width));
      const y = Math.max(0, Math.min(clientY, rect.height));

      // Calculate background position percentages for zoom
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      setLoupePos({ x, y, bgX, bgY });
    },
    [isLoupeActive]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isLoupeActive || !imgRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      const rect = imgRef.current.getBoundingClientRect();
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;

      const x = Math.max(0, Math.min(clientX, rect.width));
      const y = Math.max(0, Math.min(clientY, rect.height));

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      setLoupePos({ x, y, bgX, bgY });
    },
    [isLoupeActive]
  );

  return (
    <div
      className={`photo-magnifier-container ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onDoubleClick={onDoubleTap}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="magnifier-base-image"
      />

      {/* 🔍 Botão Flutuante de Ativar Lupa 8K */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsLoupeActive(!isLoupeActive);
        }}
        className={`magnifier-toggle-pill ${isLoupeActive ? 'active' : ''}`}
        title={isLoupeActive ? 'Fechar Lupa 8K' : 'Ativar Lupa Microscópica 8K'}
      >
        {isLoupeActive ? (
          <>
            <X size={12} />
            <span>Fechar Zoom</span>
          </>
        ) : (
          <>
            <ZoomIn size={12} />
            <span>Zoom 8K</span>
          </>
        )}
      </button>

      {/* 🔬 Lente Microscópica 8K Flutuante */}
      {isLoupeActive && (
        <div
          className="magnifier-glass-loupe"
          style={{
            width: `${loupeSize}px`,
            height: `${loupeSize}px`,
            left: `${loupePos.x}px`,
            top: `${loupePos.y}px`,
            backgroundImage: `url(${src})`,
            backgroundPosition: `${loupePos.bgX}% ${loupePos.bgY}%`,
            backgroundSize: `${zoomLevel * 100}%`,
          }}
        >
          {/* Miras de Precisão Óptica */}
          <div className="loupe-reticle-crosshair" />
          <div className="loupe-reticle-ring" />
          
          <div className="loupe-zoom-badge">
            <Sparkles size={9} color="var(--accent-teal)" />
            <span>{zoomLevel.toFixed(1)}x Ultra HD</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
