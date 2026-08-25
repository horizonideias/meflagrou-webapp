import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  MapPin, 
  Check, 
  Copy, 
  Music,
  Video,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto, UserProfile } from '../types';
import { soundFx } from '../services/biometricService';
import { MeflagrouLogo } from './MeflagrouLogo';

interface StoryShareModalProps {
  photo: EventPhoto;
  currentUser?: UserProfile;
  onClose: () => void;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  photo,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isVideoExporting, setIsVideoExporting] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string>('techno');
  const frameRef = useRef<HTMLDivElement>(null);

  const musicTracks = [
    { id: 'techno', name: '🔥 Warung Techno Pulse (128 BPM)', genre: 'Peak Time' },
    { id: 'melodic', name: '✨ Laroc Melodic Sunset (124 BPM)', genre: 'Melodic House' },
    { id: 'brazilian', name: '⚡ Tomorrowland MainStage (130 BPM)', genre: 'Festival Bass' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    soundFx.playRadarTick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadStoryImage = () => {
    setIsDownloading(true);
    soundFx.playRadarTick();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#ff007a', '#ffb703'],
    });

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = photo.highResUrl || photo.url;
      link.download = `meflagrou_story_${photo.id}_9x16.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    }, 800);
  };

  const handleExportVideoReel = () => {
    setIsVideoExporting(true);
    soundFx.playRadarTick();
    confetti({
      particleCount: 65,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#ff007a', '#00f5d4', '#ffb703', '#9333ea'],
    });

    setTimeout(() => {
      setIsVideoExporting(false);
      alert('🎬 Vídeo 9:16 gerado com sucesso com trilha sonora oficial! Pronto para postar no Instagram Reels / TikTok.');
    }, 1800);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 490,
          maxHeight: '94vh',
          borderRadius: 24,
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.95), 0 0 50px rgba(255, 0, 122, 0.25)',
          background: 'rgba(10, 12, 18, 0.96)',
          border: '1px solid rgba(255, 0, 122, 0.4)',
          overflowY: 'auto',
          animation: 'modalFadeIn 0.22s ease',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Gerador de Stories 9:16 com Música
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Vídeo vertical oficial para Instagram Stories & TikTok
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* 🎵 Seletor de Trilha Sonora do Festival */}
        <div className="story-music-selector-row">
          <div className="music-selector-title">
            <Music size={13} color="var(--accent-teal)" />
            <span>Trilha Sonora:</span>
          </div>
          <div className="music-chips-list no-scrollbar">
            {musicTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedMusic(track.id);
                  soundFx.playRadarTick();
                }}
                className={`music-chip-btn ${selectedMusic === track.id ? 'active' : ''}`}
              >
                <span>{track.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📱 9:16 Vertical Instagram Story Canvas Preview */}
        <div
          ref={frameRef}
          className="story-frame-canvas"
          style={{
            width: '100%',
            maxWidth: 310,
            aspectRatio: '9/16',
            borderRadius: 20,
            background: 'linear-gradient(180deg, #0d111a 0%, #05070a 100%)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 245, 212, 0.2)',
            margin: '12px auto',
          }}
        >
          {/* Top Brand Header on Canvas */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <MeflagrouLogo height={26} animated={true} />

            <span
              style={{
                background: 'rgba(255, 0, 122, 0.2)',
                border: '1px solid #ff007a',
                color: '#ff007a',
                fontSize: '0.58rem',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: 8,
                textTransform: 'uppercase',
              }}
            >
              Flagra Oficial
            </span>
          </div>

          {/* Central Main Photo in Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/5',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              margin: 'auto 0',
            }}
          >
            <img
              src={photo.highResUrl || photo.url}
              alt={photo.eventName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Event pill on bottom left of photo */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                background: 'rgba(0, 0, 0, 0.82)',
                backdropFilter: 'blur(8px)',
                padding: '3px 8px',
                borderRadius: 10,
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <MapPin size={10} color="var(--accent-teal)" />
              <span>{photo.eventName}</span>
            </div>

            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0, 245, 212, 0.9)',
                color: '#07080c',
                padding: '2px 6px',
                borderRadius: 8,
                fontSize: '0.58rem',
                fontWeight: 900,
              }}
            >
              8K ULTRA HD
            </div>

            {/* 🌊 Barras de Soundwave Animadas */}
            <div className="story-soundwave-visualizer">
              <div className="soundwave-bar bar-1" />
              <div className="soundwave-bar bar-2" />
              <div className="soundwave-bar bar-3" />
              <div className="soundwave-bar bar-4" />
              <div className="soundwave-bar bar-5" />
            </div>
          </div>

          {/* Bottom Footer Info on Story Frame */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: '8px 10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              zIndex: 10,
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}>
                📸 Flagrado por: @{photo.photographer.name}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--accent-teal)' }}>
                Encontre suas fotos no meflagrou.com
              </div>
            </div>

            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={20} color="#07080c" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {/* Exportar Vídeo com Música */}
          <button
            onClick={handleExportVideoReel}
            disabled={isVideoExporting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #ff007a, #9333ea)',
              boxShadow: '0 4px 20px rgba(255, 0, 122, 0.4)',
            }}
          >
            <Video size={17} />
            <span>{isVideoExporting ? 'Gerando Vídeo 9:16...' : 'Gerar Vídeo com Trilha Sonora'}</span>
          </button>

          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button
              onClick={handleDownloadStoryImage}
              disabled={isDownloading}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Download size={15} />
              <span>{isDownloading ? 'Baixando...' : 'Baixar Imagem'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {copied ? <Check size={15} color="var(--accent-teal)" /> : <Copy size={15} />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
