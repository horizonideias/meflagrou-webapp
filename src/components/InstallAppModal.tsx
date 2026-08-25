import React from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  Sparkles, 
  Zap, 
  BellRing
} from 'lucide-react';
import { soundFx } from '../services/biometricService';

interface InstallAppModalProps {
  onClose: () => void;
  onNativeInstall?: () => void;
  isIOS?: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  onClose,
  onNativeInstall,
  isIOS = false,
}) => {
  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.3)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 24,
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* App Logo & Glow Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 0 35px rgba(0, 245, 212, 0.6)'
          }}>
            <Smartphone size={38} color="#07080c" />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
            Instalar Aplicativo meflagrou
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 400, margin: '0 auto' }}>
            Tenha a melhor experiência com tela cheia, alertas em tempo real e busca facial instantânea na palma da mão.
          </p>
        </div>

        {/* Benefits Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          marginBottom: 20
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Zap size={18} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>1-Toque na Tela</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Sem abrir navegador</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <BellRing size={18} color="#ffb703" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>Alertas VIP</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Fotos da festa na hora</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Sparkles size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>Face ID Fluido</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>120 FPS sem travamentos</div>
            </div>
          </div>
        </div>

        {/* Native Install Button (Android / Chrome / Desktop) */}
        {onNativeInstall && !isIOS && (
          <button
            onClick={() => {
              soundFx.playUnlockSuccess();
              onNativeInstall();
            }}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 0 25px rgba(0, 245, 212, 0.5)',
              marginBottom: 16
            }}
          >
            <Download size={18} />
            Instalar no Meu Celular Agora
          </button>
        )}

        {/* Step-by-Step Instructions for iOS / Manual */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: 16
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
            {isIOS ? '📱 Como instalar no iPhone (Safari):' : '📲 Como instalar manualmente:'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem',
                flexShrink: 0
              }}>
                1
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {isIOS ? (
                  <span>Toque no botão <strong>Compartilhar</strong> (<Share size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />) na barra inferior do Safari.</span>
                ) : (
                  <span>Toque no menu do navegador (<strong>três pontinhos ⋮</strong>) no topo.</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem',
                flexShrink: 0
              }}>
                2
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Role para baixo e selecione <strong style={{ color: '#ffffff' }}>"Adicionar à Tela de Início"</strong> (<PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />) ou <strong style={{ color: '#ffffff' }}>"Instalar Aplicativo"</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.75rem',
                flexShrink: 0
              }}>
                3
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Confirme em <strong>"Adicionar / Instalar"</strong>. O ícone do <strong>meflagrou</strong> aparecerá na tela do seu celular!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
