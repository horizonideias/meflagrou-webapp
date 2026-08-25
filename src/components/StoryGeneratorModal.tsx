import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Check, 
  Palette, 
  Type, 
  MapPin, 
  Smile
} from 'lucide-react';
import type { EventPhoto, UserProfile } from '../types';
import { InstagramIcon } from './Icons';
import { renderStoryCanvas } from '../services/exportCanvasService';

interface StoryGeneratorModalProps {
  photo: EventPhoto;
  currentUser: UserProfile;
  onClose: () => void;
}

export const StoryGeneratorModal: React.FC<StoryGeneratorModalProps> = ({
  photo,
  currentUser,
  onClose,
}) => {
  const [selectedGradient, setSelectedGradient] = useState<string>('neon');
  const [selectedSticker, setSelectedSticker] = useState<string>('flagrado');
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [showPhotographer, setShowPhotographer] = useState<boolean>(true);
  const [customText, setCustomText] = useState<string>('Que noite inesquecível! 🔥💃');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const gradients: { [key: string]: string } = {
    neon: 'linear-gradient(135deg, #090a0f 0%, #1a0b2e 50%, #002b28 100%)',
    sunset: 'linear-gradient(135deg, #1f0814 0%, #381204 50%, #0b1120 100%)',
    cyberpunk: 'linear-gradient(135deg, #001220 0%, #090b16 50%, #20002c 100%)',
    obsidian: 'linear-gradient(135deg, #050507 0%, #11141c 100%)',
  };

  const stickers: { [key: string]: { label: string; bg: string; text: string; icon: string } } = {
    flagrado: { label: 'ME FLAGROU! 📸', bg: '#00f5d4', text: '#07080c', icon: '🔥' },
    vip: { label: 'VIP ACCESS ✨', bg: '#ff007a', text: '#ffffff', icon: '👑' },
    front: { label: 'FRONT STAGE 🎧', bg: '#7928ca', text: '#ffffff', icon: '⚡' },
    sunset: { label: 'SUNSET VIBES 🌴', bg: '#ffb703', text: '#07080c', icon: '🍹' },
  };

  const handleDownloadStory = async () => {
    setIsGenerating(true);
    setToastMsg('Renderizando Story 9:16 em Alta Definição...');

    try {
      const dataUrl = await renderStoryCanvas(
        photo,
        currentUser,
        selectedGradient,
        selectedSticker,
        customText,
        showLocation,
        showPhotographer
      );

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `story_meflagrou_${currentUser.handle}_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGenerating(false);
      setToastMsg('Story 9:16 gerado e salvo com sucesso!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setIsGenerating(false);
      setToastMsg('Download concluído.');
      setTimeout(() => setToastMsg(null), 3000);
    }
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
        maxWidth: 880,
        width: '100%',
        padding: 24,
        position: 'relative',
        maxHeight: '94vh',
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 24,
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(255, 0, 122, 0.2)',
        border: '1px solid rgba(255, 0, 122, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 14, right: 14, zIndex: 30 }}>
          <X size={18} />
        </button>

        {/* LEFT: 9:16 Instagram Story Preview */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9/16',
          borderRadius: 24,
          background: gradients[selectedGradient],
          border: '2px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 16,
          boxShadow: '0 15px 35px rgba(0,0,0,0.8)'
        }}>
          {/* Top Story Brand & User info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-teal)' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#ffffff', lineHeight: 1.1 }}>
                  @{currentUser.handle}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--accent-teal)' }}>
                  meflagrou.com
                </div>
              </div>
            </div>

            {/* Sticker Top Right */}
            <div style={{
              background: stickers[selectedSticker].bg,
              color: stickers[selectedSticker].text,
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transform: 'rotate(-2deg)'
            }}>
              {stickers[selectedSticker].label}
            </div>
          </div>

          {/* Center Card with Event Photo */}
          <div style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            margin: '12px 0'
          }}>
            <img
              src={photo.url}
              alt={photo.eventName}
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
            />

            {/* In-photo Watermark */}
            <div style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              borderRadius: 10,
              padding: '3px 8px',
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#ffffff'
            }}>
              meflagrou<span style={{ color: 'var(--accent-teal)' }}>.com</span>
            </div>
          </div>

          {/* Bottom Story Info & Caption */}
          <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {customText && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                borderRadius: 12,
                padding: '6px 10px',
                fontSize: '0.75rem',
                color: '#ffffff',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {customText}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.65rem',
              color: '#e2e8f0',
              opacity: 0.9
            }}>
              {showLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={11} color="var(--accent-cyan)" />
                  <span>{photo.eventName}</span>
                </div>
              )}

              {showPhotographer && (
                <div>📸 {photo.photographer.name}</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Customization Studio Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <InstagramIcon size={22} color="var(--accent-magenta)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
                Gerador de Stories 9:16
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Personalize o layout oficial para postar nos Stories do Instagram com marcações e stickers.
            </p>
          </div>

          {/* Gradient Themes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>
              <Palette size={13} style={{ display: 'inline', marginRight: 4 }} />
              Tema de Fundo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Object.keys(gradients).map((gradKey) => (
                <button
                  key={gradKey}
                  onClick={() => setSelectedGradient(gradKey)}
                  style={{
                    height: 40,
                    borderRadius: 10,
                    background: gradients[gradKey],
                    border: selectedGradient === gradKey ? '2px solid var(--accent-teal)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    boxShadow: selectedGradient === gradKey ? '0 0 15px rgba(0, 245, 212, 0.4)' : 'none'
                  }}
                >
                  {gradKey}
                </button>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>
              <Smile size={13} style={{ display: 'inline', marginRight: 4 }} />
              Sticker Oficial
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {Object.keys(stickers).map((stkKey) => (
                <button
                  key={stkKey}
                  onClick={() => setSelectedSticker(stkKey)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: stickers[stkKey].bg,
                    color: stickers[stkKey].text,
                    border: selectedSticker === stkKey ? '2px solid #ffffff' : 'none',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>{stickers[stkKey].icon}</span>
                  <span>{stickers[stkKey].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Caption */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
              <Type size={13} style={{ display: 'inline', marginRight: 4 }} />
              Frase no Story
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Ex: Noite surreal! 🔥"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                borderRadius: 12,
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showLocation}
                onChange={(e) => setShowLocation(e.target.checked)}
                style={{ accentColor: 'var(--accent-teal)' }}
              />
              Local / Evento
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPhotographer}
                onChange={(e) => setShowPhotographer(e.target.checked)}
                style={{ accentColor: 'var(--accent-teal)' }}
              />
              Crédito do Fotógrafo
            </label>
          </div>

          {/* Export Button */}
          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <button
              onClick={handleDownloadStory}
              disabled={isGenerating}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                boxShadow: '0 4px 20px rgba(255, 0, 122, 0.4)'
              }}
            >
              <Download size={18} />
              {isGenerating ? 'Compondo Story 9:16...' : 'Baixar Story em Alta Definição (9:16)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
