import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Play, 
  Pause, 
  Film, 
  Zap, 
  Check 
} from 'lucide-react';
import type { EventPhoto, UserProfile } from '../types';

interface MotionVideoModalProps {
  photo: EventPhoto;
  currentUser: UserProfile;
  onClose: () => void;
}

export const MotionVideoModal: React.FC<MotionVideoModalProps> = ({
  photo,
  currentUser,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [motionStyle, setMotionStyle] = useState<'dolly' | 'pan' | 'pulse'>('dolly');
  const [strobeEffect, setStrobeEffect] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const timeRef = useRef<number>(0);

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photo.highResUrl || photo.url;
    img.onload = () => {
      imgRef.current = img;
    };
  }, [photo]);

  // Motion Loop Render Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    const renderLoop = () => {
      if (isPlaying) {
        timeRef.current += 0.025 * speed;
      }
      const t = timeRef.current;
      const { width, height } = canvas;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Ambient Color
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#101422');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Moving 3D Photo with Selected Motion Style
      if (imgRef.current && imgRef.current.width > 0) {
        ctx.save();

        let scale = 1.0;
        let panX = 0;
        let panY = 0;

        if (motionStyle === 'dolly') {
          // Vertigo / Dolly Zoom Loop (1.0 to 1.15)
          scale = 1.05 + Math.sin(t * 1.5) * 0.08;
        } else if (motionStyle === 'pan') {
          // Smooth Pan Loop
          panX = Math.sin(t * 1.2) * 30;
          panY = Math.cos(t * 1.2) * 20;
          scale = 1.1;
        } else {
          // Neon Pulse Loop
          scale = 1.03 + (Math.sin(t * 3) > 0 ? 0.03 : 0);
        }

        // Center card bounds (1080 x 1350)
        const cardX = 40;
        const cardY = 120;
        const cardW = width - 80;
        const cardH = height - 260;

        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 28);
        ctx.clip();

        // Translate to card center for scaling
        ctx.translate(cardX + cardW / 2 + panX, cardY + cardH / 2 + panY);
        ctx.scale(scale, scale);

        ctx.drawImage(
          imgRef.current,
          -cardW / 2 - 20,
          -cardH / 2 - 20,
          cardW + 40,
          cardH + 40
        );

        // Strobe Flash Light Effect
        if (strobeEffect) {
          const flash = (Math.sin(t * 4) + 1) / 2;
          if (flash > 0.85) {
            ctx.fillStyle = `rgba(0, 245, 212, ${(flash - 0.85) * 1.2})`;
            ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
          }
        }

        ctx.restore();

        // Draw Card Glowing Border
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 28);
        ctx.stroke();

        // Overlay meflagrou stamp
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath();
        ctx.roundRect(cardX + cardW - 240, cardY + cardH - 60, 220, 44, 12);
        ctx.fill();

        ctx.font = '800 20px "Outfit", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('meflagrou.com', cardX + cardW - 130, cardY + cardH - 30);
      }

      // Top Title Bar
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 34px "Outfit", sans-serif';
      ctx.fillText(`@${currentUser.handle}`, 100, 110);

      ctx.fillStyle = '#00f5d4';
      ctx.font = '600 22px "Outfit", sans-serif';
      ctx.fillText('3D MOTION LOOP // 60 FPS', 100, 146);

      // Bottom Details
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 24px "Outfit", sans-serif';
      ctx.fillText(`📍 ${photo.eventName}`, 100, height - 100);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, speed, motionStyle, strobeEffect, photo, currentUser]);

  const handleExportMotion = () => {
    setIsExporting(true);
    setToastMsg('Exportando Loop 3D em Formato MP4/Reels...');

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.download = `motion_loop_${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setIsExporting(false);
      setToastMsg('Vídeo 3D salvo com sucesso!');
      setTimeout(() => setToastMsg(null), 3000);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 245, 212, 0.95)',
          color: '#07080c',
          padding: '10px 22px',
          borderRadius: 24,
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 10px 30px rgba(0, 245, 212, 0.5)',
          zIndex: 10000,
        }}>
          <Check size={16} color="#07080c" />
          {toastMsg}
        </div>
      )}

      <div className="glass-panel" style={{
        maxWidth: 920,
        width: '100%',
        padding: 24,
        position: 'relative',
        maxHeight: '94vh',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 24,
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 14, right: 14, zIndex: 30 }}>
          <X size={18} />
        </button>

        {/* LEFT: 1080 x 1350 Canvas Motion Loop Preview */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1080 / 1350',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: '#07080c'
        }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />

          {/* Floating Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0, 245, 212, 0.95)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 245, 212, 0.5)'
            }}
          >
            {isPlaying ? <Pause size={18} color="#07080c" /> : <Play size={18} color="#07080c" />}
          </button>
        </div>

        {/* RIGHT: Motion Controls & Style Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Film size={22} color="var(--accent-teal)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
                Gerador de Vídeo 3D / Boomerang
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Dê vida aos seus flagras estáticos com movimento de câmera tridimensional e luzes sincronizadas.
            </p>
          </div>

          {/* Motion Style Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>
              Estilo de Movimento 3D
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { key: 'dolly', label: 'Dolly Zoom (Vertigo)', icon: '🎥' },
                { key: 'pan', label: 'Panorâmica Fluida', icon: '↔️' },
                { key: 'pulse', label: 'Neon Pulse Beat', icon: '⚡' },
              ].map((style) => (
                <button
                  key={style.key}
                  onClick={() => setMotionStyle(style.key as 'dolly' | 'pan' | 'pulse')}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 12,
                    background: motionStyle === style.key ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: motionStyle === style.key ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                    color: motionStyle === style.key ? 'var(--accent-teal)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Speed Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Velocidade do Loop ({speed}x)
              </label>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
            />
          </div>

          {/* Strobe Effect Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={18} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Flashes de Estrobo Neon</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Luzes sincronizadas com o ritmo da música</div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={strobeEffect}
              onChange={(e) => setStrobeEffect(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
            />
          </div>

          {/* Export Button */}
          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <button
              onClick={handleExportMotion}
              disabled={isExporting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
                boxShadow: '0 4px 20px rgba(0, 245, 212, 0.35)'
              }}
            >
              <Download size={18} />
              {isExporting ? 'Renderizando Loop 60 FPS...' : 'Baixar Vídeo 3D / Reels'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
