import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShieldCheck, 
  Check, 
  Send
} from 'lucide-react';
import type { PhotographerInfo } from '../types';

interface PhotographerHireModalProps {
  photographer: PhotographerInfo;
  onClose: () => void;
}

export const PhotographerHireModal: React.FC<PhotographerHireModalProps> = ({
  photographer,
  onClose,
}) => {
  const [eventType, setEventType] = useState<string>('Festa Noturna / Balada VIP');
  const [eventDate, setEventDate] = useState<string>('2026-03-20');
  const [city, setCity] = useState<string>('São Paulo, SP');
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSendBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessToast(`Solicitação enviada para ${photographer.name}! Ele responderá em menos de 2h.`);
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 2500);
    }, 1200);
  };

  const handleSendTip = (amount: number) => {
    setSelectedTip(amount);
    setSuccessToast(`Gorjeta de R$ ${amount},00 enviada para ${photographer.name}! Obrigado por apoiar os fotógrafos.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {successToast && (
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
          {successToast}
        </div>
      )}

      <div className="glass-panel" style={{
        maxWidth: 620,
        width: '100%',
        padding: 28,
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 35px rgba(0, 245, 212, 0.2)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </button>

        {/* Photographer Header Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 20 }}>
          <img
            src={photographer.avatar}
            alt={photographer.name}
            style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
                {photographer.name}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                <ShieldCheck size={11} /> Credenciado meflagrou
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', marginBottom: 6 }}>
              {photographer.handle} • São Paulo / Rio de Janeiro
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffb703', fontWeight: 700 }}>
                <Star size={13} fill="#ffb703" /> 4.98 (142 avaliações)
              </span>
              <span>•</span>
              <span>Equipamento: {photographer.camera} ({photographer.lens})</span>
            </div>
          </div>
        </div>

        {/* Quick Tip / Support Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
              <Heart size={15} fill="var(--accent-magenta)" color="var(--accent-magenta)" />
              Enviar Gorjeta pelo Flagra
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              100% repassado ao fotógrafo
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[20, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => handleSendTip(val)}
                style={{
                  padding: '8px',
                  borderRadius: 10,
                  background: selectedTip === val ? 'rgba(255, 0, 122, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedTip === val ? '1px solid var(--accent-magenta)' : '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                R$ {val},00 ☕
              </button>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSendBooking}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 4 }}>
              Solicitar Orçamento / Agendar Cobertura
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              Garanta que este fotógrafo cubra seu evento particular, casamento ou festa.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                Tipo de Evento
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 10,
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="Festa Noturna / Balada VIP" style={{ background: '#0f1118' }}>Festa Noturna / Balada VIP</option>
                <option value="Festival / Palco / Show" style={{ background: '#0f1118' }}>Festival / Palco / Show</option>
                <option value="Casamento / Sunset Celebration" style={{ background: '#0f1118' }}>Casamento / Sunset Celebration</option>
                <option value="Ensaio Fotográfico Individual" style={{ background: '#0f1118' }}>Ensaio Fotográfico Individual</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                  Data Desejada
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 10,
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                  Cidade / Local
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 10,
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <Send size={16} />
            {isSubmitting ? 'Enviando Proposta...' : 'Enviar Solicitação de Disponibilidade'}
          </button>
        </form>
      </div>
    </div>
  );
};
