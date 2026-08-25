import React from 'react';
import { 
  X, 
  Trophy
} from 'lucide-react';

interface PhotographerLeagueRankingModalProps {
  onClose: () => void;
}

export const PhotographerLeagueRankingModal: React.FC<PhotographerLeagueRankingModalProps> = ({
  onClose,
}) => {
  const selectedMonth = 'Agosto 2026';

  const topPhotographers = [
    {
      rank: 1,
      name: 'Studio meflagrou',
      handle: '@meflagrou',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      tier: '💎 Diamante',
      tierColor: '#00f5d4',
      salesCount: 1420,
      monthlyVolume: 'R$ 71.000,00',
      prize: 'R$ 2.500,00 (1º Lugar)'
    },
    {
      rank: 2,
      name: 'Rafael Clicks',
      handle: '@rafaelclicks',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      tier: '🥇 Ouro Pro',
      tierColor: '#ffb703',
      salesCount: 890,
      monthlyVolume: 'R$ 44.500,00',
      prize: 'R$ 1.500,00 (2º Lugar)'
    },
    {
      rank: 3,
      name: 'Beatriz Lens',
      handle: '@beatrizlens',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      tier: '🥈 Prata Star',
      tierColor: '#e0e1dd',
      salesCount: 640,
      monthlyVolume: 'R$ 32.000,00',
      prize: 'R$ 1.000,00 (3º Lugar)'
    },
    {
      rank: 4,
      name: 'Lucas Drone & 8K',
      handle: '@lucasdrone',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      tier: '🥉 Bronze Elite',
      tierColor: '#cd7f32',
      salesCount: 410,
      monthlyVolume: 'R$ 20.500,00',
      prize: 'Selo Destaque'
    }
  ];

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid #ffb703',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 183, 3, 0.3)',
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ffb703, #fb8500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(255, 183, 3, 0.6)'
          }}>
            <Trophy size={24} color="#07080c" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Liga dos Fotógrafos // Temporada de Festivais
              </h2>
              <span style={{
                background: 'rgba(255, 183, 3, 0.2)',
                border: '1px solid #ffb703',
                color: '#ffb703',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: '0.65rem',
                fontWeight: 900
              }}>
                R$ 5.000 EM PREMIAÇÕES
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Ranking oficial dos maiores fotógrafos do Brasil com metas gamificadas e bônus de performance.
            </p>
          </div>
        </div>

        {/* Prize Pool Spotlight Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.12), rgba(255, 0, 122, 0.12))',
          border: '1px solid rgba(255, 183, 3, 0.35)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#ffb703', fontWeight: 800, textTransform: 'uppercase' }}>
                Premiação Total do Mês ({selectedMonth})
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 900, color: '#ffffff', marginTop: 2 }}>
                R$ 5.000,00 <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 700 }}>no PIX</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>1º Lugar</span>
                <div style={{ fontWeight: 800, color: '#ffb703', fontSize: '0.85rem' }}>R$ 2.500</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2º Lugar</span>
                <div style={{ fontWeight: 800, color: '#e0e1dd', fontSize: '0.85rem' }}>R$ 1.500</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>3º Lugar</span>
                <div style={{ fontWeight: 800, color: '#cd7f32', fontSize: '0.85rem' }}>R$ 1.000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topPhotographers.map((p) => (
            <div
              key={p.rank}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: p.rank === 1 ? '1.5px solid #ffb703' : '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  color: p.rank === 1 ? '#ffb703' : p.rank === 2 ? '#e0e1dd' : '#cd7f32',
                  width: 24,
                  textAlign: 'center'
                }}>
                  #{p.rank}
                </span>

                <img
                  src={p.avatar}
                  alt={p.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${p.tierColor}`
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>
                      {p.name}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: p.tierColor,
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 6px',
                      borderRadius: 6
                    }}>
                      {p.tier}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {p.handle} • {p.salesCount} fotos vendidas
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  {p.prize}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Volume: {p.monthlyVolume}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
