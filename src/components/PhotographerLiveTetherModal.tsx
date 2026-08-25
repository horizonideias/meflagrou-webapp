import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Wifi, 
  Flame, 
  Play, 
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';

interface PhotographerLiveTetherModalProps {
  onClose: () => void;
}

export const PhotographerLiveTetherModal: React.FC<PhotographerLiveTetherModalProps> = ({
  onClose,
}) => {
  const cameraModel = 'Sony Alpha A7 IV (Wi-Fi 5GHz)';
  const [isTetherActive, setIsTetherActive] = useState<boolean>(true);
  const [photosDispatched, setPhotosDispatched] = useState<number>(342);
  const [facesIndexed, setFacesIndexed] = useState<number>(890);
  const [liveEarnings, setLiveEarnings] = useState<number>(4780.00);
  const [recentSales, setRecentSales] = useState<{ id: string; time: string; buyer: string; amount: number; event: string }[]>([
    { id: 's1', time: 'Agora há pouco', buyer: 'Isabela Rocha', amount: 999.99, event: 'Sunset Festival' },
    { id: 's2', time: 'Há 2 min', buyer: 'Lucas Ferreira', amount: 59.60, event: 'Sunset Festival' },
    { id: 's3', time: 'Há 5 min', buyer: 'Camila Duarte', amount: 29.80, event: 'Sunset Festival' },
  ]);

  // Simulate live camera shots and sales incoming during the party
  useEffect(() => {
    if (!isTetherActive) return;

    const interval = setInterval(() => {
      // Dispatch new shot
      setPhotosDispatched(p => p + 1);
      setFacesIndexed(f => f + Math.floor(1 + Math.random() * 3));

      // 30% chance of random sale triggering live cash bell
      if (Math.random() > 0.65) {
        const amt = [29.80, 59.60, 119.20, 999.99][Math.floor(Math.random() * 4)];
        const buyers = ['Matheus Silva', 'Beatriz Lima', 'Thiago VIP', 'Rafaela Front', 'Bruno Balada'];
        const buyer = buyers[Math.floor(Math.random() * buyers.length)];

        setLiveEarnings(e => e + amt);
        setRecentSales(prev => [
          { id: `s_${Date.now()}`, time: 'Agora', buyer, amount: amt, event: 'Sunset Festival' },
          ...prev.slice(0, 4)
        ]);

        soundFx.playUnlockSuccess();
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.85 },
          colors: ['#00f5d4', '#ffb703']
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isTetherActive]);

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.3)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 22,
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.5)'
          }}>
            <Camera size={22} color="#07080c" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Modo Pista // Live Tethering 5G
              </h2>
              <span style={{
                background: isTetherActive ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: isTetherActive ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                color: isTetherActive ? 'var(--accent-teal)' : 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: '0.68rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <Wifi size={11} /> {isTetherActive ? 'SINCRONIA AO VIVO' : 'PAUSADO'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Dispare na câmera e a IA indexa os rostos e vende na mesma hora para os frequentadores da balada.
            </p>
          </div>
        </div>

        {/* Top 3 Live Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 18 }}>
          {/* Live Earnings */}
          <div style={{
            background: 'rgba(0, 245, 212, 0.08)',
            border: '1px solid rgba(0, 245, 212, 0.35)',
            borderRadius: 16,
            padding: 14
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Faturamento Hoje (Ao Vivo)</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-teal)', marginTop: 2 }}>
              R$ {liveEarnings.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
              🔔 Repasses caindo na hora
            </div>
          </div>

          {/* Photos Dispatched */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 14
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Fotos Transmitidas</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
              {photosDispatched} cliques
            </div>
            <div style={{ fontSize: '0.68rem', color: '#ffb703', marginTop: 4 }}>
              ⚡ Sincronizado via Wi-Fi 5G
            </div>
          </div>

          {/* Faces Indexed */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16,
            padding: 14
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Rostos Indexados IA</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-magenta)', marginTop: 2 }}>
              {facesIndexed} pessoas
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
              🎯 Notificados no WhatsApp
            </div>
          </div>
        </div>

        {/* Camera Pairing Settings */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Câmera Pareada</div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
              📷 {cameraModel}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setIsTetherActive(!isTetherActive)}
              className={isTetherActive ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '8px 14px', fontSize: '0.78rem' }}
            >
              {isTetherActive ? <Pause size={14} /> : <Play size={14} />}
              {isTetherActive ? 'Pausar Tether' : 'Retomar Transmissão'}
            </button>
          </div>
        </div>

        {/* Live Sales Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={15} color="#ff007a" /> Vendas Ocorrendo na Festa (Tempo Real)
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)' }}>
              Atualização Automática
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00f5d4' }} />
                  <div>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{sale.buyer}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginLeft: 6 }}>({sale.time})</span>
                  </div>
                </div>

                <div style={{ fontWeight: 900, color: 'var(--accent-teal)' }}>
                  + R$ {sale.amount.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
