import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Zap, 
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import type { UserProfile } from '../types';

interface WristbandCheckInModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const WristbandCheckInModal: React.FC<WristbandCheckInModalProps> = ({
  currentUser: _currentUser,
  onClose,
}) => {
  const [wristbandCode, setWristbandCode] = useState<string>('NFC-VIP-9941-SP');
  const eventName = 'Tomorrowland Brasil 2026 • VIP Mainstage';
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handlePairWristband = () => {
    setIsScanning(true);
    soundFx.playRadarTick();

    setTimeout(() => {
      setIsScanning(false);
      setIsPaired(true);
      soundFx.playUnlockSuccess();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#00e5ff', '#ffb703']
      });
    }, 1200);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 620,
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

        {isPaired ? (
          <div style={{ textAlign: 'center', padding: '32px 10px' }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 35px rgba(0, 245, 212, 0.6)'
            }}>
              <CheckCircle2 size={40} color="#07080c" />
            </div>

            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Pulseira Vinculada ao seu Face ID!
            </h2>
            <p style={{ color: 'var(--accent-teal)', fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>
              {eventName} • ID: {wristbandCode}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', maxWidth: 430, margin: '0 auto 20px auto' }}>
              📡 <strong>Radar Ativo:</strong> Toda vez que qualquer fotógrafo do festival clicar uma foto sua, você receberá a prévia instantaneamente no seu WhatsApp durante a festa!
            </p>

            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
              Pronto, Entrar na Balada
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
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(0, 245, 212, 0.6)'
              }}>
                <QrCode size={24} color="#07080c" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Check-in por Pulseira Digital / NFC
                  </h2>
                  <span style={{
                    background: 'rgba(0, 245, 212, 0.2)',
                    border: '1px solid var(--accent-teal)',
                    color: 'var(--accent-teal)',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.65rem',
                    fontWeight: 900
                  }}>
                    RADAR 1-TOQUE
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
                  Aproxime o celular da pulseira NFC ou do QR Code de entrada para ativar o rastreio de flagras.
                </p>
              </div>
            </div>

            {/* Visual Pulseira Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.08), rgba(121, 40, 202, 0.08))',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              borderRadius: 18,
              padding: 20,
              textAlign: 'center',
              marginBottom: 18
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(0, 245, 212, 0.15)',
                border: '2px solid var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                animation: isScanning ? 'pulseGlow 1s infinite' : 'none'
              }}>
                <Radio size={28} color="var(--accent-teal)" />
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                {isScanning ? 'Lendo Sensor NFC da Pulseira...' : 'Pronto para Leitura'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
                Aproxime o topo do iPhone ou traseira do Android da pulseira oficial do festival.
              </p>
            </div>

            {/* Manual Code Input fallback */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Código da Pulseira / Ingresso
              </label>
              <input
                type="text"
                value={wristbandCode}
                onChange={(e) => setWristbandCode(e.target.value)}
                placeholder="Ex: NFC-VIP-9941-SP"
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

            <button
              onClick={handlePairWristband}
              disabled={isScanning}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 800,
                boxShadow: '0 0 25px rgba(0, 245, 212, 0.5)'
              }}
            >
              <Zap size={16} />
              {isScanning ? 'Pareando...' : 'Aproximar Celular & Parear Pulseira'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
