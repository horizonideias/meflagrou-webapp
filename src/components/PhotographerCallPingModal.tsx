import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import type { UserProfile } from '../types';

interface PhotographerCallPingModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const PhotographerCallPingModal: React.FC<PhotographerCallPingModalProps> = ({
  currentUser: _currentUser,
  onClose,
}) => {
  const [locationName, setLocationName] = useState<string>('Camarote 12 • Mesa VIP');
  const [occasion, setOccasion] = useState<string>('Aniversário com os Amigos');
  const [tipAmount, setTipAmount] = useState<number>(20);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const assignedPhotographer = 'Studio meflagrou';

  const handleSendCall = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatched(true);
    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#ff007a', '#ffb703']
    });
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-magenta)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 0, 122, 0.3)',
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

        {isDispatched ? (
          <div style={{ textAlign: 'center', padding: '36px 12px' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff007a, #7928ca)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px rgba(255, 0, 122, 0.6)'
            }}>
              <CheckCircle2 size={38} color="#ffffff" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Chamado Enviado com Sucesso!
            </h2>
            <p style={{ color: 'var(--accent-teal)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>
              📸 {assignedPhotographer} está a caminho da sua mesa!
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', maxWidth: 420, margin: '0 auto 20px auto' }}>
              Localização: <strong>{locationName}</strong> • Tempo estimado de chegada: <strong>~3 a 5 minutos</strong>.
              {tipAmount > 0 && ` (Gorjeta Prioritária de R$ ${tipAmount.toFixed(2)} incluída)`}
            </p>

            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
              Concluir e Voltar
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(255, 0, 122, 0.5)'
              }}>
                <MapPin size={24} color="#ffffff" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Radar "Me Flagre Aqui!" // Chamado VIP
                  </h2>
                  <span style={{
                    background: 'rgba(255, 0, 122, 0.2)',
                    border: '1px solid var(--accent-magenta)',
                    color: '#ff007a',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.65rem',
                    fontWeight: 900
                  }}>
                    AO VIVO NA PISTA
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                  Chame o fotógrafo oficial mais próximo para registrar o seu camarote ou grupo agora.
                </p>
              </div>
            </div>

            {/* Radar Photographers Proximity Card */}
            <div style={{
              background: 'rgba(0, 245, 212, 0.06)',
              border: '1px solid rgba(0, 245, 212, 0.25)',
              borderRadius: 16,
              padding: 14,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(0, 245, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-teal)'
                }}>
                  <Camera size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                    Fotógrafos Ativos no Local: 4 Profissionais
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                    📡 Mais próximo: <strong>Studio meflagrou (a 18 metros do Camarote)</strong>
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.68rem',
                color: '#ffb703',
                background: 'rgba(255, 183, 3, 0.15)',
                padding: '4px 8px',
                borderRadius: 8,
                fontWeight: 800
              }}>
                ⚡ Tempo Médio: 3 min
              </span>
            </div>

            {/* Form to dispatch call */}
            <form onSubmit={handleSendCall} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Sua Localização no Evento (Mesa / Setor)
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ex: Camarote 12, Backstage, Pista VIP..."
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Motivo da Comemoração / Pauta da Foto
                </label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Ex: Aniversário da Isa, Despedida de Solteiro, Brinde..."
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Priority Tip Selector */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Gorjeta / Prioridade de Atendimento PIX:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { amount: 0, label: 'Sem Gorjeta', desc: 'Fila Padrão' },
                    { amount: 20, label: 'R$ 20,00', desc: 'Prioridade Alta' },
                    { amount: 50, label: 'R$ 50,00', desc: 'VIP Flash Instantâneo' }
                  ].map((tip) => (
                    <button
                      key={tip.amount}
                      type="button"
                      onClick={() => setTipAmount(tip.amount)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        background: tipAmount === tip.amount ? 'linear-gradient(135deg, #ff007a, #7928ca)' : 'rgba(255, 255, 255, 0.04)',
                        border: tipAmount === tip.amount ? '1px solid #ff007a' : '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.82rem' }}>{tip.label}</span>
                      <span style={{ fontSize: '0.62rem', opacity: 0.7 }}>{tip.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                  padding: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  boxShadow: '0 0 25px rgba(255, 0, 122, 0.5)',
                  marginTop: 6
                }}
              >
                <Send size={16} />
                Chamar Fotógrafo na Minha Mesa Agora
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
