import React, { useState } from 'react';
import { 
  X, 
  WifiOff, 
  Sun, 
  Check, 
  Copy
} from 'lucide-react';
import type { UserProfile } from '../types';

interface PartyModeOfflineQrModalProps {
  user: UserProfile;
  onClose: () => void;
}

export const PartyModeOfflineQrModal: React.FC<PartyModeOfflineQrModalProps> = ({
  user,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [maxBrightness, setMaxBrightness] = useState<boolean>(true);

  // Generate simulated dynamic QR Data
  const qrData = `MEFLAGROU://BIO-TAG?id=${user.id}&handle=${user.handle}&sig=${user.faceSignatureId}&ts=${Date.now()}`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=07080c&bgcolor=00f5d4&margin=8`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.faceSignatureId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        className="glass-panel"
        style={{
          width: '95%',
          maxWidth: 480,
          borderRadius: 24,
          overflow: 'hidden',
          background: maxBrightness ? '#07080c' : 'rgba(10, 12, 18, 0.95)',
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 20px 60px rgba(0, 245, 212, 0.4)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 28,
          textAlign: 'center'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(0, 245, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WifiOff size={16} color="var(--accent-teal)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                Modo Balada Offline
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                Pareamento sem sinal de internet
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Instructions banner */}
        <div style={{
          background: 'rgba(0, 245, 212, 0.08)',
          border: '1px solid rgba(0, 245, 212, 0.25)',
          borderRadius: 14,
          padding: '10px 14px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: 20,
          textAlign: 'left'
        }}>
          💡 <strong>Mostre esta tela para o fotógrafo</strong> meflagrou no camarote ou pista. A câmera dele lê o seu código instantaneamente e indexa seus flagras no seu perfil.
        </div>

        {/* QR Code Container with Glowing Neon Frame */}
        <div style={{
          background: '#00f5d4',
          padding: 16,
          borderRadius: 24,
          display: 'inline-block',
          boxShadow: '0 0 40px rgba(0, 245, 212, 0.6)',
          marginBottom: 20
        }}>
          <img
            src={qrSvgUrl}
            alt="QR Code Biométrico"
            style={{
              width: 220,
              height: 220,
              display: 'block',
              borderRadius: 12
            }}
          />
        </div>

        {/* User identification badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal)' }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
              ID: {user.faceSignatureId}
            </div>
          </div>
        </div>

        {/* Quick ID Copy Button */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={handleCopyId}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.75rem' }}
          >
            {copiedId ? <Check size={14} color="var(--accent-teal)" /> : <Copy size={14} />}
            {copiedId ? 'ID Copiado!' : 'Copiar ID Biométrico'}
          </button>

          <button
            onClick={() => setMaxBrightness(!maxBrightness)}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.75rem' }}
          >
            <Sun size={14} color={maxBrightness ? '#ffb703' : 'var(--text-secondary)'} />
            {maxBrightness ? 'Brilho Máximo Ativo' : 'Brilho Normal'}
          </button>
        </div>
      </div>
    </div>
  );
};
