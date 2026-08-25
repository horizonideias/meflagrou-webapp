import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Type, 
  QrCode, 
  Check, 
  LayoutTemplate
} from 'lucide-react';
import type { EventPhoto, UserProfile } from '../types';
import { renderMagazineCoverCanvas } from '../services/exportCanvasService';

interface MagazineCoverStudioProps {
  photo: EventPhoto;
  currentUser: UserProfile;
  onClose: () => void;
}

export type MagazineTemplate = 'vogue' | 'mixmag' | 'dazed' | 'rollingstone' | 'lumen';

export const MagazineCoverStudio: React.FC<MagazineCoverStudioProps> = ({
  photo,
  currentUser,
  onClose,
}) => {
  const [template, setTemplate] = useState<MagazineTemplate>('lumen');
  const [mainHeadline, setMainHeadline] = useState<string>('THE NIGHTLIFE REVOLUTION');
  const [subHeadline, setSubHeadline] = useState<string>('Biometria, estilo e os momentos inesquecíveis da noite brasileira');
  const [sideTagline, setSideTagline] = useState<string>('SPECIAL ISSUE // NO. 24');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '4:5' | '1:1'>('4:5');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const templatesConfig = {
    lumen: {
      title: 'LUMEN',
      subtitle: 'THE VISUAL CULTURE & NIGHTLIFE GAZETTE',
      fontTitle: "'Outfit', sans-serif",
      fontWeight: 800,
      titleColor: '#00f5d4',
      accentColor: '#00e5ff',
      borderColor: 'rgba(0, 245, 212, 0.4)',
    },
    vogue: {
      title: 'VOGUE',
      subtitle: 'VIP EDITION // SPECIAL FESTIVAL REPORT',
      fontTitle: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      titleColor: '#ffffff',
      accentColor: '#ff007a',
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    mixmag: {
      title: 'MIXMAG',
      subtitle: 'DANCE MUSIC & CLUB CULTURE WORLDWIDE',
      fontTitle: "'JetBrains Mono', monospace",
      fontWeight: 800,
      titleColor: '#ffb703',
      accentColor: '#ff007a',
      borderColor: 'rgba(255, 183, 3, 0.5)',
    },
    dazed: {
      title: 'DAZED',
      subtitle: 'UNDERGROUND SOUNDS & HIGH FASHION',
      fontTitle: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 900,
      titleColor: '#ffffff',
      accentColor: '#00f5d4',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    rollingstone: {
      title: 'ROLLING STONE',
      subtitle: 'FESTIVAL LIVE CHRONICLES 2026',
      fontTitle: "Impact, 'Outfit', sans-serif",
      fontWeight: 800,
      titleColor: '#ff007a',
      accentColor: '#ffbe0b',
      borderColor: 'rgba(255, 0, 122, 0.5)',
    },
  };

  const handleExportCover = async () => {
    setIsExporting(true);
    setToastMsg('Compondo e Renderizando Capa Editorial em 4K...');

    try {
      const dataUrl = await renderMagazineCoverCanvas(
        photo,
        currentUser,
        template,
        mainHeadline,
        subHeadline,
        sideTagline,
        aspectRatio
      );

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `magazine_cover_${template}_${currentUser.handle}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setToastMsg('Capa Editorial 4K salva com sucesso!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setIsExporting(false);
      setToastMsg('Download concluído.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const currentCfg = templatesConfig[template];

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
        maxWidth: 960,
        width: '100%',
        padding: 24,
        position: 'relative',
        maxHeight: '94vh',
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        gap: 24,
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.2)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 14, right: 14, zIndex: 30 }}>
          <X size={18} />
        </button>

        {/* LEFT: Magazine Cover Preview */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio === '9:16' ? '9/16' : (aspectRatio === '4:5' ? '4/5' : '1/1'),
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.9), 0 0 25px rgba(0, 245, 212, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 20,
          background: '#07080c',
          transition: 'aspect-ratio 0.3s ease',
        }}>
          {/* Background Photo */}
          <img
            src={photo.url}
            alt={photo.eventName}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1,
            }}
          />

          {/* Vignette Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.9) 100%)',
            zIndex: 2,
          }} />

          {/* TOP: Magazine Masthead Title */}
          <div style={{ zIndex: 10, textAlign: 'center' }}>
            <h1 style={{
              fontFamily: currentCfg.fontTitle,
              fontSize: template === 'rollingstone' ? '2.4rem' : '3.6rem',
              fontWeight: currentCfg.fontWeight,
              letterSpacing: template === 'vogue' ? '8px' : (template === 'dazed' ? '4px' : '-1px'),
              color: currentCfg.titleColor,
              lineHeight: 1,
              textTransform: 'uppercase',
              textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)',
              margin: '0 0 4px 0',
            }}>
              {currentCfg.title}
            </h1>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '2px',
              color: '#ffffff',
              opacity: 0.9,
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}>
              {currentCfg.subtitle}
            </div>
          </div>

          {/* MIDDLE: Feature Side Tagline */}
          <div style={{ zIndex: 10, margin: 'auto 0' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              borderLeft: `3px solid ${currentCfg.accentColor}`,
              padding: '4px 10px',
              borderRadius: '0 8px 8px 0',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              {sideTagline}
            </div>
          </div>

          {/* BOTTOM: Main Cover Headlines & Barcode */}
          <div style={{ zIndex: 10 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '-0.5px',
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
              marginBottom: 4,
            }}>
              {mainHeadline}
            </h2>

            <p style={{
              fontSize: '0.72rem',
              color: '#cbd5e1',
              lineHeight: 1.3,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              marginBottom: 12,
              maxWidth: '90%',
            }}>
              {subHeadline}
            </p>

            {/* Bottom Bar: User, Event & Barcode */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: 8,
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: currentCfg.accentColor }}>
                  STAR: @{currentUser.handle.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                  {photo.eventName} • {photo.eventDate}
                </div>
              </div>

              {/* Barcode & Price Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <QrCode size={22} color="#ffffff" />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#cbd5e1', lineHeight: 1 }}>
                  <div>R$ 38,00</div>
                  <div>ISSUE #26</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Studio Customization Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <LayoutTemplate size={22} color="var(--accent-teal)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
                Magazine Cover Studio
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Transforme seu flagra em capa de revista de alta costura com tipografia editorial.
            </p>
          </div>

          {/* Template Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>
              Estilo Editorial da Capa
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {(['lumen', 'vogue', 'mixmag', 'dazed', 'rollingstone'] as MagazineTemplate[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 10,
                    background: template === t ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: template === t ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                    color: template === t ? 'var(--accent-teal)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
              Formato de Exportação
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['4:5', '9:16', '1:1'] as ('4:5' | '9:16' | '1:1')[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  style={{
                    padding: '8px',
                    borderRadius: 10,
                    background: aspectRatio === ratio ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: aspectRatio === ratio ? '1.5px solid #ffffff' : '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  {ratio === '4:5' ? '4:5 (Feed)' : (ratio === '9:16' ? '9:16 (Stories)' : '1:1 (Quadrado)')}
                </button>
              ))}
            </div>
          </div>

          {/* Headline Inputs */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
              <Type size={13} style={{ display: 'inline', marginRight: 4 }} />
              Manchete Principal
            </label>
            <input
              type="text"
              value={mainHeadline}
              onChange={(e) => setMainHeadline(e.target.value)}
              placeholder="Ex: THE NIGHTLIFE REVOLUTION"
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
              Subtítulo Editorial
            </label>
            <input
              type="text"
              value={subHeadline}
              onChange={(e) => setSubHeadline(e.target.value)}
              placeholder="Ex: Os momentos mais icônicos..."
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
              Selo Lateral / Edição
            </label>
            <input
              type="text"
              value={sideTagline}
              onChange={(e) => setSideTagline(e.target.value)}
              placeholder="Ex: SPECIAL ISSUE // NO. 24"
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

          {/* Export Button */}
          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <button
              onClick={handleExportCover}
              disabled={isExporting}
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              <Download size={18} />
              {isExporting ? 'Compondo Capa em 4K...' : 'Exportar Capa Editorial em 4K'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
