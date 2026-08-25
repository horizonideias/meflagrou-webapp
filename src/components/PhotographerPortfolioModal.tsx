import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Calendar, 
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import { MOCK_PHOTOS } from '../data/mockDatabase';

interface PhotographerPortfolioModalProps {
  onClose: () => void;
}

export const PhotographerPortfolioModal: React.FC<PhotographerPortfolioModalProps> = ({
  onClose,
}) => {
  const [selectedEventType, setSelectedEventType] = useState<string>('festival');
  const [eventDate, setEventDate] = useState<string>('2026-09-20');
  const [city, setCity] = useState<string>('São Paulo, SP');
  const [hours, setHours] = useState<number>(4);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const baseRates: Record<string, number> = {
    festival: 1800,
    aniversario: 1200,
    casamento: 3500,
    after: 1500
  };

  const estimatedTotal = (baseRates[selectedEventType] || 1500) + ((hours - 4) * 250);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#00e5ff', '#ffb703']
    });
  };

  const photographerPhotos = MOCK_PHOTOS.slice(0, 6);

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
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

        {isBooked ? (
          <div style={{ textAlign: 'center', padding: '40px 10px' }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px rgba(0, 245, 212, 0.6)'
            }}>
              <CheckCircle2 size={40} color="#07080c" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Solicitação de Cobertura Enviada!
            </h2>
            <p style={{ color: 'var(--accent-teal)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>
              Studio meflagrou • {city} • Orçamento Estimado: R$ {estimatedTotal.toFixed(2).replace('.', ',')}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 460, margin: '0 auto 20px auto' }}>
              Os detalhes foram encaminhados com garantia meflagrou Escrow 100% segura. O fotógrafo responderá no seu WhatsApp em minutos.
            </p>

            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
              Fechar
            </button>
          </div>
        ) : (
          <div>
            {/* Photographer Profile Header */}
            <div style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 18,
              marginBottom: 20,
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                  alt="Studio meflagrou"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--accent-teal)',
                    boxShadow: '0 0 20px rgba(0, 245, 212, 0.5)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--accent-teal)',
                  color: '#07080c',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #07080c'
                }}>
                  <CheckCircle2 size={13} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Studio meflagrou
                  </h2>
                  <span style={{
                    background: 'rgba(0, 245, 212, 0.2)',
                    border: '1px solid var(--accent-teal)',
                    color: 'var(--accent-teal)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Award size={11} /> PRO VERIFIED 8K
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 4 }}>
                  <span>📍 São Paulo, SP & Brasil</span>
                  <span>⭐ 4.98 (340 avaliações)</span>
                  <span>🔥 +12.400 flagras</span>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
                  📷 <strong>Equipamento:</strong> Sony Alpha A7R V • Lentes G-Master 24-70 f/2.8 & 85mm f/1.4 • Drone DJI Mavic 3
                </div>
              </div>
            </div>

            {/* 8K Showcase Portfolio Grid */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                Portfólio Recente (Flagras em Grandes Festivais):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                {photographerPhotos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      height: 100,
                      borderRadius: 12,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <img src={p.thumbnailUrl || p.url} alt={p.eventName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.eventName}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking / Quote Calculator Form */}
            <form onSubmit={handleBookingSubmit} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 18,
              padding: 18,
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: 12 }}>
                <Calendar size={16} /> Contratar Cobertura Fotográfica para o seu Evento:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Tipo de Evento
                  </label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    <option value="festival" style={{ background: '#07080c' }}>Festival / Balada VIP</option>
                    <option value="aniversario" style={{ background: '#07080c' }}>Aniversário / Festa Privada</option>
                    <option value="casamento" style={{ background: '#07080c' }}>Casamento / Destination</option>
                    <option value="after" style={{ background: '#07080c' }}>After Party Sunset</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Cidade do Evento
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Data Prevista
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Duração da Cobertura
                  </label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    <option value={4} style={{ background: '#07080c' }}>4 Horas (Padrão)</option>
                    <option value={6} style={{ background: '#07080c' }}>6 Horas (+ R$ 500)</option>
                    <option value={8} style={{ background: '#07080c' }}>8 Horas (+ R$ 1.000)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Código de Indicação (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: @seunome ou VIP"
                    defaultValue="DEUS_FOUNDER"
                    style={{
                      width: '100%',
                      background: 'rgba(0, 245, 212, 0.08)',
                      border: '1px solid rgba(0, 245, 212, 0.3)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: 'var(--accent-teal)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Commission tag for affiliate */}
              <div style={{
                background: 'rgba(0, 245, 212, 0.06)',
                border: '1px dashed var(--accent-teal)',
                borderRadius: 12,
                padding: '8px 12px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem'
              }}>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>
                  🤝 Comissão por Indicação (10% no PIX):
                </span>
                <span style={{ color: '#ffffff', fontWeight: 900 }}>
                  R$ {(estimatedTotal * 0.10).toFixed(2).replace('.', ',')} para o parceiro
                </span>
              </div>

              {/* Estimate Total & CTA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Valor Total do Contrato:</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
                    R$ {estimatedTotal.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '11px 22px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
                  }}
                >
                  <MessageSquare size={16} />
                  Solicitar Orçamento no WhatsApp
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
