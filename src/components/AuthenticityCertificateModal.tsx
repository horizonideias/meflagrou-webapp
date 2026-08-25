import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Download, 
  Share2, 
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto, UserProfile } from '../types';

interface AuthenticityCertificateModalProps {
  photo: EventPhoto;
  currentUser: UserProfile;
  onClose: () => void;
}

export const AuthenticityCertificateModal: React.FC<AuthenticityCertificateModalProps> = ({
  photo,
  currentUser,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Generate simulated cryptographic hash
  const certId = `CERT-MF-${photo.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const sha256Hash = `SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://meflagrou.com/verify/${certId}`)}&color=07080c&bgcolor=ffb703&margin=4`;

  const handleDownloadCertificate = () => {
    setIsExporting(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ffb703', '#00f5d4', '#ffffff']
    });

    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        className="glass-panel"
        style={{
          width: '95%',
          maxWidth: 680,
          borderRadius: 24,
          overflow: 'hidden',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid rgba(255, 183, 3, 0.4)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 28
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ffb703, #fb8500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 183, 3, 0.4)'
            }}>
              <Award size={20} color="#07080c" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                Certificado Oficial de Autenticidade
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Registro Imutável de Propriedade & Autoria meflagrou.com
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

        {/* Certificate Card Body */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.06), rgba(255, 255, 255, 0.02))',
          border: '1px solid rgba(255, 183, 3, 0.3)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Watermark Logo */}
          <div style={{
            position: 'absolute',
            right: -20,
            bottom: -20,
            opacity: 0.05,
            pointerEvents: 'none'
          }}>
            <Award size={200} color="#ffb703" />
          </div>

          {/* Top Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#ffb703', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                REGISTRO OFICIAL MEFLAGROU
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                {certId}
              </div>
            </div>

            <span style={{
              background: 'rgba(0, 245, 212, 0.15)',
              border: '1px solid var(--accent-teal)',
              color: 'var(--accent-teal)',
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: '0.7rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <ShieldCheck size={13} />
              PROPRIEDADE VERIFICADA
            </span>
          </div>

          {/* Photo & Metadata Grid */}
          <div style={{ display: 'flex', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.eventName}
              style={{
                width: 110,
                height: 110,
                borderRadius: 14,
                objectFit: 'cover',
                border: '2px solid rgba(255, 183, 3, 0.4)'
              }}
            />

            <div style={{ flex: 1, minWidth: 'min(200px, 100%)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', marginBottom: 4 }}>
                {photo.eventName}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div>📸 <strong>Autor / Fotógrafo</strong>: {photo.photographer.name} (@{photo.photographer.handle})</div>
                <div>👤 <strong>Titular Atual</strong>: {currentUser.name} (@{currentUser.handle})</div>
                <div>📍 <strong>Local</strong>: {photo.location} • {photo.city}</div>
                <div>🗓️ <strong>Data do Clique</strong>: {photo.eventDate} às {photo.time}</div>
                <div>🔍 <strong>Resolução Master</strong>: {photo.resolution || '8640 x 5760 (Ultra HD 4K)'}</div>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Bar */}
          <div style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Hash Criptográfico SHA-256 da Imagem RAW:
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-teal)', wordBreak: 'break-all' }}>
                {sha256Hash}
              </div>
            </div>

            <img
              src={qrUrl}
              alt="QR Validação"
              style={{ width: 44, height: 44, borderRadius: 6, display: 'block' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {downloadSuccess && (
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <Check size={14} /> Certificado exportado!
            </span>
          )}

          <button
            onClick={handleDownloadCertificate}
            disabled={isExporting}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #ffb703, #fb8500)',
              color: '#07080c',
              fontWeight: 900
            }}
          >
            <Download size={15} />
            {isExporting ? 'Gerando...' : 'Baixar Certificado Digital (PDF/PNG)'}
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(certId);
              alert('ID do certificado copiado!');
            }}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '0.82rem' }}
          >
            <Share2 size={14} />
            Copiar Link de Validação
          </button>
        </div>
      </div>
    </div>
  );
};
