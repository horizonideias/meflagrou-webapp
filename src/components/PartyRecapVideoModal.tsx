import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Sparkles, 
  Music, 
  Award,
  Check,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, EventPhoto } from '../types';

interface PartyRecapVideoModalProps {
  user: UserProfile;
  photos: EventPhoto[];
  onClose: () => void;
}

export const PartyRecapVideoModal: React.FC<PartyRecapVideoModalProps> = ({
  user,
  photos,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<'neon' | 'cyberpunk' | 'luxury'>('neon');
  const [selectedAudioType, setSelectedAudioType] = useState<'electro' | 'custom'>('electro');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // EXACT 9 SECONDS RECAP DURATION
  const TOTAL_RECAP_SECONDS = 9;
  const slidePhotos = useMemo(() => (photos.length > 0 ? photos.slice(0, 3) : []), [photos]);
  const totalSlides = slidePhotos.length > 0 ? slidePhotos.length : 1;
  const slideDurationMs = (TOTAL_RECAP_SECONDS * 1000) / totalSlides; // 3000ms per slide if 3 photos

  // Synthesize electronic dance beat audio loop
  const startSynthesizerBeat = useCallback(() => {
    if (isMuted || (selectedAudioType as string) === 'custom' || typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (oscillatorIntervalRef.current) clearInterval(oscillatorIntervalRef.current);

      let step = 0;
      oscillatorIntervalRef.current = window.setInterval(() => {
        if (!isPlaying || isMuted || (selectedAudioType as string) === 'custom') return;
        const now = ctx.currentTime;
        
        // Kick Drum
        if (step % 4 === 0) {
          const kick = ctx.createOscillator();
          const gain = ctx.createGain();
          kick.frequency.setValueAtTime(140, now);
          kick.frequency.exponentialRampToValueAtTime(35, now + 0.12);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          kick.connect(gain);
          gain.connect(ctx.destination);
          kick.start(now);
          kick.stop(now + 0.12);
        }

        // Hi-Hat / Synth stab
        if (step % 2 === 1) {
          const hat = ctx.createOscillator();
          const hGain = ctx.createGain();
          hat.type = 'triangle';
          hat.frequency.setValueAtTime(selectedTheme === 'cyberpunk' ? 880 : 1200, now);
          hGain.gain.setValueAtTime(0.06, now);
          hat.connect(hGain);
          hGain.connect(ctx.destination);
          hat.start(now);
          hat.stop(now + 0.05);
        }

        // Bass Synth pulse
        if (step % 4 === 2) {
          const bass = ctx.createOscillator();
          const bGain = ctx.createGain();
          bass.type = 'sawtooth';
          bass.frequency.setValueAtTime(65, now);
          bGain.gain.setValueAtTime(0.18, now);
          bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          bass.connect(bGain);
          bGain.connect(ctx.destination);
          bass.start(now);
          bass.stop(now + 0.2);
        }

        step = (step + 1) % 16;
      }, 140); // ~107 BPM rhythm
    } catch {
      // AudioContext not allowed before user interaction
    }
  }, [isMuted, selectedAudioType, isPlaying, selectedTheme]);

  const stopSynthesizerBeat = useCallback(() => {
    if (oscillatorIntervalRef.current) {
      clearInterval(oscillatorIntervalRef.current);
      oscillatorIntervalRef.current = null;
    }
  }, []);

  // Handle Play/Pause Audio Loop
  useEffect(() => {
    if (selectedAudioType === 'custom' && customAudioUrl) {
      stopSynthesizerBeat();
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(customAudioUrl);
        audioElementRef.current.loop = true;
      } else {
        audioElementRef.current.src = customAudioUrl;
      }
      audioElementRef.current.muted = isMuted;
      if (isPlaying) {
        audioElementRef.current.play().catch(() => {});
      } else {
        audioElementRef.current.pause();
      }
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (isPlaying) {
        startSynthesizerBeat();
      } else {
        stopSynthesizerBeat();
      }
    }

    return () => {
      stopSynthesizerBeat();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [isPlaying, isMuted, selectedAudioType, customAudioUrl, startSynthesizerBeat, stopSynthesizerBeat]);

  // Handle user audio upload
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioUrl(url);
      setCustomAudioName(file.name.replace(/\.[^/.]+$/, ''));
      setSelectedAudioType('custom');
      setIsPlaying(true);
    }
  };

  // 9 Seconds Slideshow progress loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = 50;
    const stepIncrement = (interval / slideDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlideIndex((curr) => (curr + 1) % totalSlides);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, totalSlides, slideDurationMs]);

  // Draw 9:16 Vertical Video Frame on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPhoto = slidePhotos[currentSlideIndex];
    if (!currentPhoto) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentPhoto.url;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Image with dynamic zoom effect (1080 x 1350)
      const zoomFactor = 1 + (progress / 100) * 0.08;
      const w = canvas.width * zoomFactor;
      const h = canvas.height * zoomFactor;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      ctx.drawImage(img, x, y, w, h);

      // 2. Gradients and Overlays
      const topGrad = ctx.createLinearGradient(0, 0, 0, 260);
      topGrad.addColorStop(0, 'rgba(7, 8, 12, 0.92)');
      topGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, canvas.width, 260);

      const botGrad = ctx.createLinearGradient(0, canvas.height - 450, 0, canvas.height);
      botGrad.addColorStop(0, 'transparent');
      botGrad.addColorStop(0.5, 'rgba(7, 8, 12, 0.88)');
      botGrad.addColorStop(1, '#07080c');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, canvas.height - 450, canvas.width, 450);

      // 3. Neon Accents based on Theme
      const accentColor = selectedTheme === 'neon' ? '#00f5d4' : selectedTheme === 'cyberpunk' ? '#ff007a' : '#ffb703';
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      // 4. Header Branding & Counter (1080 x 1350 Optimized)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MEFLAGROU // RECAP', 52, 85);

      ctx.fillStyle = accentColor;
      ctx.font = '700 20px "JetBrains Mono", monospace';
      ctx.fillText(`1080x1350 • SLIDE #${currentSlideIndex + 1}/${totalSlides} • @${user.handle}`, 52, 125);

      // 5. Lower Event Details Overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(currentPhoto.eventName, 52, canvas.height - 220);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`📍 ${currentPhoto.city} • 📸 ${currentPhoto.photographer.name}`, 52, canvas.height - 170);

      // Sound Visualizer / Track Name Pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(52, canvas.height - 130, 680, 64, 32);
      ctx.fill();

      // Audio waveform bars animation
      ctx.fillStyle = accentColor;
      const barCount = 14;
      for (let i = 0; i < barCount; i++) {
        const barHeight = 12 + Math.sin((progress / 10) + i) * 18;
        ctx.fillRect(80 + i * 11, canvas.height - 98 - barHeight / 2, 5, barHeight);
      }

      const songLabel = selectedAudioType === 'custom' && customAudioName 
        ? `🎵 ${customAudioName}` 
        : '⚡ 107 BPM Electro Beat (VIP Mix)';

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(songLabel.length > 28 ? songLabel.substring(0, 26) + '...' : songLabel, 250, canvas.height - 90);
    };
  }, [currentSlideIndex, progress, selectedTheme, selectedAudioType, customAudioName, totalSlides, user.handle, slidePhotos]);

  const handleExportStory = () => {
    setIsExporting(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#ff007a', '#ffb703']
    });

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `recap-1080x1350-${user.handle}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        className="glass-panel"
        style={{
          width: '96%',
          maxWidth: 900,
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1px solid rgba(0, 245, 212, 0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          animation: 'modalFadeIn 0.25s ease',
          flexWrap: 'wrap',
          maxHeight: '94vh',
          overflowY: 'auto'
        }}
      >
        {/* Left Side: 1080 x 1350 Portrait Player */}
        <div style={{
          flex: '1 1 340px',
          background: '#07080c',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Top Story Bars */}
          <div style={{
            position: 'absolute',
            top: 28,
            left: 28,
            right: 28,
            display: 'flex',
            gap: 4,
            zIndex: 30
          }}>
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div 
                key={idx}
                style={{
                  flex: 1,
                  height: 3,
                  background: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  height: '100%',
                  background: selectedTheme === 'neon' ? '#00f5d4' : selectedTheme === 'cyberpunk' ? '#ff007a' : '#ffb703',
                  width: idx < currentSlideIndex ? '100%' : idx === currentSlideIndex ? `${progress}%` : '0%',
                  transition: idx === currentSlideIndex ? 'none' : 'width 0.2s ease'
                }} />
              </div>
            ))}
          </div>

          <div style={{
            width: 'min(310px, 86vw)',
            aspectRatio: '1080 / 1350',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 12px 45px rgba(0,0,0,0.9)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            background: '#000'
          }}>
            <canvas
              ref={canvasRef}
              width={1080}
              height={1350}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>

          {/* Player controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 14,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-secondary"
              style={{ padding: '8px 14px', borderRadius: 20, fontSize: '0.78rem' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: 20 }}
              title={isMuted ? 'Ativar Som' : 'Mutar'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} color="var(--accent-teal)" />}
            </button>

            <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={13} />
              1080 x 1350 • 09s
            </span>
          </div>
        </div>

        {/* Right Side: Music & Configuration */}
        <div style={{
          flex: '1 1 380px',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Sparkles size={20} color="var(--accent-teal)" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Recap da Balada (9 Segundos)</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Stories dinâmico de 9s com trilha personalizada reunindo seus melhores flagras.
                </p>
              </div>

              <button
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Music Selection Section */}
            <div style={{
              background: 'rgba(0, 245, 212, 0.06)',
              border: '1px solid rgba(0, 245, 212, 0.25)',
              borderRadius: 16,
              padding: 14,
              marginBottom: 18
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, marginBottom: 8, color: '#ffffff' }}>
                <Music size={15} color="var(--accent-teal)" />
                Trilha Sonora do Vídeo (9s):
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Popular Hits Pills */}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Hits Populares de Balada (1-Toque):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { id: 'electro', name: '🎧 Vintage Culture (Save Me)', desc: 'Festival Edit' },
                    { id: 'mochakk', name: '🪩 Mochakk (Jealous)', desc: 'Tech House Vibe' },
                    { id: 'alok', name: '⚡ Alok (Deep Rave)', desc: 'Mainstage Drop' },
                    { id: 'dennis', name: '🔥 Dennis DJ (Funk 150)', desc: 'Baile Rave' },
                    { id: 'rufus', name: '🌅 Rüfüs Du Sol (Innerbloom)', desc: 'Sunset Melodic' },
                  ].map((hit) => {
                    const isSelected = selectedAudioType === hit.id;
                    return (
                      <button
                        key={hit.id}
                        onClick={() => {
                          setSelectedAudioType(hit.id as any);
                          setCustomAudioUrl(null);
                          setCustomAudioName(null);
                        }}
                        style={{
                          padding: '7px 8px',
                          borderRadius: 10,
                          background: isSelected ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#07080c' : '#ffffff',
                          border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <span style={{ fontWeight: 800 }}>{hit.name}</span>
                        <span style={{ fontSize: '0.62rem', opacity: isSelected ? 0.8 : 0.6 }}>{hit.desc}</span>
                      </button>
                    );
                  })}

                  <label
                    style={{
                      padding: '7px 8px',
                      borderRadius: 10,
                      background: selectedAudioType === 'custom' ? 'linear-gradient(135deg, #ff007a, #7928ca)' : 'rgba(255, 255, 255, 0.04)',
                      color: '#ffffff',
                      border: selectedAudioType === 'custom' ? '1px solid #ff007a' : '1px solid var(--border-subtle)',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800 }}>
                      <Upload size={12} />
                      <span>{customAudioName ? 'Trocar Meu MP3' : '+ Enviar Meu MP3'}</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', opacity: 0.7 }}>Arquivo do Celular</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleCustomAudioUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {customAudioName && (
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '6px 10px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 2
                  }}>
                    <span>🎵 Música: <strong>{customAudioName}</strong></span>
                    <span style={{ fontSize: '0.65rem', color: '#ffb703' }}>Sincronizado 9s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Selector */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Selecione o Estilo Visual:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  onClick={() => setSelectedTheme('neon')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 10,
                    background: selectedTheme === 'neon' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedTheme === 'neon' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                    color: selectedTheme === 'neon' ? 'var(--accent-teal)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Neon Rave
                </button>

                <button
                  onClick={() => setSelectedTheme('cyberpunk')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 10,
                    background: selectedTheme === 'cyberpunk' ? 'rgba(255, 0, 122, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedTheme === 'cyberpunk' ? '1.5px solid #ff007a' : '1px solid var(--border-subtle)',
                    color: selectedTheme === 'cyberpunk' ? '#ff007a' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  🔥 Cyberpunk
                </button>

                <button
                  onClick={() => setSelectedTheme('luxury')}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 10,
                    background: selectedTheme === 'luxury' ? 'rgba(255, 183, 3, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: selectedTheme === 'luxury' ? '1.5px solid #ffb703' : '1px solid var(--border-subtle)',
                    color: selectedTheme === 'luxury' ? '#ffb703' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: 'pointer'
                  }}
                >
                  👑 VIP Gold
                </button>
              </div>
            </div>

            {/* Recap Stats Box */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 18
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={14} color="var(--accent-teal)" />
                Resumo da Sua Trajetória 2026:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.74rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 8, borderRadius: 10 }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Total de Flagras:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
                    {user.totalPhotosCount} fotos
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 8, borderRadius: 10 }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Festas & Festivais:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                    {user.eventsCount} eventos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {downloadSuccess && (
              <div style={{
                background: 'rgba(0, 245, 212, 0.2)',
                border: '1px solid var(--accent-teal)',
                color: 'var(--accent-teal)',
                padding: '8px 12px',
                borderRadius: 12,
                fontSize: '0.78rem',
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}>
                <Check size={16} />
                Slide de 9 segundos baixado com sucesso para seus Stories!
              </div>
            )}

            <button
              onClick={handleExportStory}
              disabled={isExporting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.88rem',
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)'
              }}
            >
              <Download size={16} />
              {isExporting ? 'Renderizando Story...' : 'Baixar Vídeo 9s em 9:16 (Stories/TikTok)'}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link do seu Recap copiado!');
              }}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '0.82rem' }}
            >
              <Share2 size={15} />
              Compartilhar Link do Recap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
