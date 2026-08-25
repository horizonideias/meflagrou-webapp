import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Camera, 
  Check, 
  PartyPopper,
  Flame
} from 'lucide-react';
import { soundFx } from '../services/biometricService';

interface PartyRadarMapModalProps {
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
}

interface RadarLocation {
  id: string;
  name: string;
  category: string;
  city: string;
  distanceKm: number;
  photographersActive: number;
  photosTakenTonight: number;
  coverImage: string;
  vibe: string;
  x: number; // Percentage on radar map
  y: number;
}

export const PartyRadarMapModal: React.FC<PartyRadarMapModalProps> = ({
  onClose,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [checkedInEventId, setCheckedInEventId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeSpot, setActiveSpot] = useState<RadarLocation | null>(null);

  const radarSpots: RadarLocation[] = [
    {
      id: 'evt_01',
      name: 'Sunset Festival 2026',
      category: 'Festival Eletrônico',
      city: 'Guarujá, SP',
      distanceKm: 4.2,
      photographersActive: 4,
      photosTakenTonight: 340,
      coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      vibe: 'Pôr do Sol & Deep House',
      x: 35,
      y: 40,
    },
    {
      id: 'evt_02',
      name: 'Privilège Club // Neon Night',
      category: 'Super Club VIP',
      city: 'São Paulo, SP',
      distanceKm: 1.8,
      photographersActive: 3,
      photosTakenTonight: 280,
      coverImage: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=800&q=80',
      vibe: 'Tech House & Lasers',
      x: 65,
      y: 30,
    },
    {
      id: 'evt_03',
      name: 'Tomorrowland Brasil 2026',
      category: 'Mega Festival',
      city: 'Itu, SP',
      distanceKm: 68.0,
      photographersActive: 8,
      photosTakenTonight: 1250,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      vibe: 'Mainstage Épico',
      x: 75,
      y: 65,
    },
    {
      id: 'evt_04',
      name: 'Baile do Copa VIP Gala',
      category: 'Gala & Black Tie',
      city: 'Rio de Janeiro, RJ',
      distanceKm: 420.0,
      photographersActive: 2,
      photosTakenTonight: 195,
      coverImage: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
      vibe: 'Champagne & Alta Sociedade',
      x: 25,
      y: 70,
    },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCheckIn = (spot: RadarLocation) => {
    setCheckedInEventId(spot.id);
    showToast(`Check-in confirmado no ${spot.name}! Os ${spot.photographersActive} fotógrafos parceiros foram alertados.`);
  };

  const filteredSpots = radarSpots.filter((s) => {
    if (selectedCity === 'SP') return s.city.includes('SP');
    if (selectedCity === 'RJ') return s.city.includes('RJ');
    return true;
  });

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {toastMsg && (
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
          {toastMsg}
        </div>
      )}

      <div className="glass-panel radar-modal-grid" style={{
        position: 'relative',
        padding: 24,
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 14, right: 14, zIndex: 30 }}>
          <X size={18} />
        </button>

        {/* LEFT: Holographic Radar Map Viewport */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: 'min(360px, 45vh)',
          background: 'radial-gradient(ellipse at center, #0a1120 0%, #05070c 100%)',
          borderRadius: 18,
          border: '1px solid rgba(0, 245, 212, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 14
        }}>
          {/* Radar Circles */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at center, transparent 30%, rgba(0, 245, 212, 0.05) 31%, transparent 32%),
              radial-gradient(circle at center, transparent 60%, rgba(0, 245, 212, 0.05) 61%, transparent 62%),
              radial-gradient(circle at center, transparent 85%, rgba(0, 245, 212, 0.05) 86%, transparent 87%)
            `,
            pointerEvents: 'none'
          }} />

          {/* Rotating Radar Sweep Line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '50%',
            height: 2,
            background: 'linear-gradient(90deg, var(--accent-teal), transparent)',
            transformOrigin: '0% 0%',
            animation: 'radarSweep 4s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* Top Radar Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#00f5d4',
                boxShadow: '0 0 10px #00f5d4',
                animation: 'pulse 1s infinite'
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
                RADAR GPS // 17 ONLINE
              </span>
            </div>

            <div style={{ display: 'flex', gap: 5 }}>
              {['all', 'SP', 'RJ'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 10,
                    background: selectedCity === c ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.06)',
                    color: selectedCity === c ? '#07080c' : '#ffffff',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {c === 'all' ? 'Brasil' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Radar Blip Points */}
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 'min(240px, 30vh)', zIndex: 10 }}>
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setActiveSpot(spot)}
                style={{
                  position: 'absolute',
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 20
                }}
              >
                {/* Blip Circle */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: activeSpot?.id === spot.id ? 'rgba(0, 245, 212, 0.4)' : 'rgba(255, 0, 122, 0.3)',
                  border: activeSpot?.id === spot.id ? '2px solid var(--accent-teal)' : '2px solid var(--accent-magenta)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0, 245, 212, 0.6)',
                  animation: 'pulse 2s infinite'
                }}>
                  <Camera size={14} color="#ffffff" />
                </div>

                {/* Spot Mini Label */}
                <div style={{
                  position: 'absolute',
                  top: 36,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  {spot.name}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom GPS Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Navigation size={13} color="var(--accent-cyan)" /> Sua Localização: São Paulo, Brasil
            </span>
            <span>Cobertura Ativa em Tempo Real</span>
          </div>
        </div>

        {/* RIGHT: Selected Event Details & Live Check-in */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MapPin size={22} color="var(--accent-teal)" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 }}>
                Radar de Festas
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Veja onde os fotógrafos parceiros estão clicando agora e faça check-in.
            </p>
          </div>

          {/* Active / Featured Spot Details */}
          {activeSpot ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img
                src={activeSpot.coverImage}
                alt={activeSpot.name}
                style={{ width: '100%', height: 110, objectFit: 'cover' }}
              />

              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                    {activeSpot.category}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#ffb703', fontWeight: 700 }}>
                    📍 {activeSpot.distanceKm} km de você
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 4 }}>
                  {activeSpot.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {activeSpot.vibe} • {activeSpot.city}
                </p>

                {/* Telemetry Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  background: 'rgba(0,0,0,0.4)',
                  padding: 10,
                  borderRadius: 10,
                  fontSize: '0.72rem',
                  marginBottom: 14
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Fotógrafos no Local</div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                      📸 {activeSpot.photographersActive} Ativos
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Flagras Hoje</div>
                    <div style={{ fontWeight: 800, color: 'var(--accent-magenta)', fontSize: '0.85rem' }}>
                      🔥 {activeSpot.photosTakenTonight} fotos
                    </div>
                  </div>
                </div>

                {/* Tickets & VIP Pass Options */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 12
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                    🎟️ Ingressos & Camarotes Oficiais
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <button
                      onClick={() => {
                        soundFx.playUnlockSuccess();
                        alert(`🎟️ Ingresso Pista Premium reservado com sucesso para ${activeSpot.name}! QR Code enviado no seu WhatsApp.`);
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(0, 245, 212, 0.1)',
                        border: '1px solid var(--accent-teal)',
                        borderRadius: 8,
                        padding: '6px 4px',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--accent-teal)' }}>Pista Premium</div>
                      <div style={{ fontSize: '0.65rem' }}>R$ 120,00</div>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playUnlockSuccess();
                        alert(`👑 Camarote VIP Open Bar reservado para ${activeSpot.name}! Acesso preferencial liberado.`);
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 183, 3, 0.12)',
                        border: '1px solid #ffb703',
                        borderRadius: 8,
                        padding: '6px 4px',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#ffb703' }}>Camarote VIP</div>
                      <div style={{ fontSize: '0.65rem' }}>R$ 350,00</div>
                    </button>
                  </div>
                </div>

                {/* Check In Button */}
                <button
                  onClick={() => handleCheckIn(activeSpot)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.82rem',
                    background: checkedInEventId === activeSpot.id ? '#00f5d4' : 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                    color: '#07080c'
                  }}
                >
                  <PartyPopper size={15} />
                  {checkedInEventId === activeSpot.id ? 'Check-in Confirmado!' : 'Estou Aqui! Avisar Fotógrafos'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: 20,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 14,
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem'
            }}>
              <Flame size={24} color="var(--accent-teal)" style={{ margin: '0 auto 8px auto' }} />
              Clique em um dos pontos brilhantes no radar para ver a cobertura ao vivo do evento.
            </div>
          )}

          {/* Quick List of Nearby Parties */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Festas Próximas no Radar
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredSpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setActiveSpot(spot)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: activeSpot?.id === spot.id ? 'rgba(0, 245, 212, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: activeSpot?.id === spot.id ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{spot.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{spot.city}</div>
                  </div>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.72rem' }}>
                    {spot.distanceKm} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
