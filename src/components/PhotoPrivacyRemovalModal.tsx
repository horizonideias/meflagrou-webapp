import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Lock, EyeOff, Send } from 'lucide-react';
import type { EventPhoto } from '../types';
import { haptics } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface PhotoPrivacyRemovalModalProps {
  photo: EventPhoto;
  isOpen: boolean;
  onClose: () => void;
  onPhotoHidden?: (photoId: string) => void;
}

export const PhotoPrivacyRemovalModal: React.FC<PhotoPrivacyRemovalModalProps> = ({
  photo,
  isOpen,
  onClose,
  onPhotoHidden,
}) => {
  const [reason, setReason] = useState<string>('lgpd_image_rights');
  const [requestType, setRequestType] = useState<'blur' | 'remove'>('blur');
  const [requesterName, setRequesterName] = useState<string>('');
  const [requesterContact, setRequesterContact] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [protocolNumber, setProtocolNumber] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.success();
    const protocol = `LGPD-${Math.floor(100000 + Math.random() * 900000)}`;
    setProtocolNumber(protocol);
    setIsSubmitted(true);

    try {
      // Save locally to moderation requests
      const savedRequests = JSON.parse(localStorage.getItem('meflagrou_lgpd_requests') || '[]');
      savedRequests.unshift({
        protocol,
        photoId: photo.id,
        photoUrl: photo.url,
        eventName: photo.eventName,
        reason,
        requestType,
        requesterName,
        requesterContact,
        notes,
        createdAt: new Date().toISOString(),
        status: 'accepted'
      });
      localStorage.setItem('meflagrou_lgpd_requests', JSON.stringify(savedRequests));

      // Save hidden/blurred photos list
      const hiddenList = JSON.parse(localStorage.getItem('meflagrou_hidden_photos') || '[]');
      if (!hiddenList.includes(photo.id)) {
        hiddenList.push(photo.id);
        localStorage.setItem('meflagrou_hidden_photos', JSON.stringify(hiddenList));
      }

      if (onPhotoHidden) {
        onPhotoHidden(photo.id);
      }
    } catch {
      // ignore
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#00f0ff', '#7928ca']
    });
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 100000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(0, 240, 255, 0.2)',
          padding: 24,
          position: 'relative',
          animation: 'modalFadeIn 0.25s ease'
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

        {!isSubmitted ? (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Solicitação LGPD & Privacidade de Imagem
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>
            </div>

            {/* Photo Preview Mini Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: 10,
              marginBottom: 16
            }}>
              <img 
                src={photo.url} 
                alt="Foto para moderação" 
                style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
              />
              <div style={{ fontSize: '0.78rem' }}>
                <strong style={{ color: '#ffffff', display: 'block' }}>{photo.eventName}</strong>
                <span style={{ color: 'var(--text-muted)' }}>Fotógrafo: {photo.photographer.name}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type of Action */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Ação Desejada:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setRequestType('blur')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      background: requestType === 'blur' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: requestType === 'blur' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                      color: requestType === 'blur' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                  >
                    <EyeOff size={14} /> Desfocar Meu Rosto
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('remove')}
                    style={{
                      padding: '10px',
                      borderRadius: 10,
                      background: requestType === 'remove' ? 'rgba(255, 0, 122, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: requestType === 'remove' ? '1.5px solid #ff007a' : '1px solid var(--border-subtle)',
                      color: requestType === 'remove' ? '#ff007a' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                  >
                    <Lock size={14} /> Remover Foto do Feed
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Motivo da Solicitação:
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option value="lgpd_image_rights" style={{ background: '#0a0c12' }}>Direito de Imagem / LGPD (Art. 18)</option>
                  <option value="unauthorized" style={{ background: '#0a0c12' }}>Não autorizei a publicação</option>
                  <option value="embarrassing" style={{ background: '#0a0c12' }}>Foto constrangedora ou inadequada</option>
                  <option value="other" style={{ background: '#0a0c12' }}>Outro motivo particular</option>
                </select>
              </div>

              {/* Requester Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    WhatsApp ou E-mail
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Para confirmação"
                    value={requesterContact}
                    onChange={(e) => setRequesterContact(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Informações Adicionais (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva onde você aparece na foto caso haja várias pessoas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff, #00f5d4)',
                  color: '#07080c',
                  padding: '11px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6
                }}
              >
                <Send size={15} /> Confirmar Solicitação Imediata
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(0, 245, 212, 0.15)',
              border: '2px solid var(--accent-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-teal)'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
              Solicitação Processada com Sucesso!
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              O protocolo oficial <strong>#{protocolNumber}</strong> foi gerado. A foto foi imediatamente desativada da sua visualização e encaminhada para a moderação técnica do <strong>meflagrou.com</strong>.
            </p>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.85rem', fontWeight: 800 }}
            >
              Entendido / Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
