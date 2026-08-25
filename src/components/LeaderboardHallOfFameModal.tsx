import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Crown, 
  Flame, 
  Camera
} from 'lucide-react';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';

interface LeaderboardHallOfFameModalProps {
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  onSelectPhoto: (photo: EventPhoto) => void;
}

export const LeaderboardHallOfFameModal: React.FC<LeaderboardHallOfFameModalProps> = ({
  onClose,
  onSelectUser,
  onSelectPhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'vips' | 'photos' | 'photographers'>('vips');

  // Sorted VIP users by photos count
  const rankedUsers = [...MOCK_USERS].sort((a, b) => b.totalPhotosCount - a.totalPhotosCount);

  // Sorted photos by likes & generation
  const rankedPhotos = [...MOCK_PHOTOS].sort((a, b) => {
    const genA = a.tradingData?.generation || 1;
    const genB = b.tradingData?.generation || 1;
    if (genB !== genA) return genB - genA;
    return b.likesCount - a.likesCount;
  });

  const TOP_PHOTOGRAPHERS = [
    {
      id: 'photog_01',
      name: 'Studio meflagrou.com',
      handle: 'meflagrou_creator',
      avatar: '/founder_avatar.jpg',
      totalClicks: 1420,
      totalSalesAmount: 28450.00,
      eventsCovered: 18,
      rating: 5.0,
      badge: 'Criador Oficial'
    },
    {
      id: 'photog_02',
      name: 'Rafael Clicks',
      handle: 'rafael_clicks',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      totalClicks: 890,
      totalSalesAmount: 14280.50,
      eventsCovered: 12,
      rating: 4.9,
      badge: 'Top Club / Nightlife'
    },
    {
      id: 'photog_03',
      name: 'Beatriz Lens',
      handle: 'bia_lens',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      totalClicks: 740,
      totalSalesAmount: 9890.00,
      eventsCovered: 8,
      rating: 4.9,
      badge: 'Especialista Sunset'
    },
  ];

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999, padding: '12px' }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 860,
          maxHeight: '92vh',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1px solid rgba(255, 183, 3, 0.35)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 30px rgba(255, 183, 3, 0.15)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 0
        }}
      >
        {/* Header with Gold/Crown theme */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-glass)',
          background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.18), rgba(121, 40, 202, 0.18))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #ffb703, #fb8500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 183, 3, 0.4)',
              flexShrink: 0
            }}>
              <Trophy size={22} color="#07080c" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: 0 }}>
                  Hall da Fama meflagrou
                </h2>
                <span style={{
                  background: 'rgba(255, 183, 3, 0.25)',
                  border: '1px solid #ffb703',
                  color: '#ffb703',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  whiteSpace: 'nowrap'
                }}>
                  SEASON 2026
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: 2, marginBottom: 0, overflowWrap: 'break-word' }}>
                Os frequentadores mais flagrados, fotos mais valorizadas e melhores fotógrafos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: 34, height: 34, flexShrink: 0 }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs (Smooth Horizontal Scroll Tray) */}
        <div 
          className="no-scrollbar mobile-scroll-row"
          style={{
            display: 'flex',
            gap: 8,
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
            overflowX: 'auto',
            width: '100%'
          }}
        >
          <button
            onClick={() => setActiveTab('vips')}
            style={{
              background: activeTab === 'vips' ? 'linear-gradient(135deg, #ffb703, #fb8500)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'vips' ? '#07080c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '8px 14px',
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Crown size={14} />
            Top VIPs Mais Flagrados
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            style={{
              background: activeTab === 'photos' ? 'linear-gradient(135deg, #ff007a, #7928ca)' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '8px 14px',
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Flame size={14} />
            Fotos Mais Valorizadas 2x
          </button>

          <button
            onClick={() => setActiveTab('photographers')}
            style={{
              background: activeTab === 'photographers' ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'photographers' ? '#07080c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '8px 14px',
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Camera size={14} />
            Fotógrafos Destaque
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* TAB 1: VIPs LEADERBOARD */}
          {activeTab === 'vips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rankedUsers.map((u, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 16,
                      background: isFirst 
                        ? 'linear-gradient(135deg, rgba(255, 183, 3, 0.15), rgba(255, 255, 255, 0.03))'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isFirst ? '1.5px solid rgba(255, 183, 3, 0.5)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--accent-teal)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = isFirst ? 'rgba(255, 183, 3, 0.5)' : 'var(--border-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
                      {/* Rank Number Badge */}
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isFirst ? '#ffb703' : isSecond ? '#cbd5e1' : isThird ? '#cd7f32' : 'rgba(255, 255, 255, 0.08)',
                        color: isFirst || isSecond || isThird ? '#07080c' : '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isFirst ? '0 0 15px rgba(255, 183, 3, 0.6)' : 'none',
                        flexShrink: 0
                      }}>
                        {isFirst ? <Crown size={17} /> : `#${index + 1}`}
                      </div>

                      {/* Avatar */}
                      <img
                        src={u.avatar}
                        alt={u.name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isFirst ? '2px solid #ffb703' : '2px solid var(--border-subtle)',
                          flexShrink: 0
                        }}
                      />

                      {/* User metadata */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ overflowWrap: 'break-word' }}>{u.name}</span>
                          {isFirst && (
                            <span style={{ background: '#ffb703', color: '#07080c', padding: '1px 6px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                              👑 #1 DO BRASIL
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                          <span>@{u.handle}</span>
                          <span>•</span>
                          <span>{u.city}, {u.state}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Right */}
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 900, color: isFirst ? '#ffb703' : 'var(--accent-teal)' }}>
                        {u.totalPhotosCount} Flagras
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        em {u.eventsCount} Festas VIP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: MOST VALUED PHOTOS (2x TRADING) */}
          {activeTab === 'photos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rankedPhotos.map((p, idx) => {
                const gen = p.tradingData?.generation || 1;
                const price = p.ownerPrice || (p.tradingData ? p.tradingData.currentListingPrice : 999.99);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPhoto(p);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 16,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#ff007a';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(255, 0, 122, 0.2)',
                        color: '#ff007a',
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        #{idx + 1}
                      </div>

                      <img
                        src={p.thumbnailUrl || p.url}
                        alt={p.eventName}
                        style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                      />

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ overflowWrap: 'break-word' }}>{p.eventName}</span>
                          <span style={{ background: 'linear-gradient(135deg, #ff007a, #7928ca)', color: '#ffffff', padding: '1px 6px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                            🔥 GERAÇÃO #{gen}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          📸 {p.photographer.name} • ❤️ {p.likesCount} curtidas
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
                        R$ {price.toFixed(2).replace('.', ',')}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#ff007a', fontWeight: 700 }}>
                        Cadeia 2x Ativa
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TOP PHOTOGRAPHERS */}
          {activeTab === 'photographers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TOP_PHOTOGRAPHERS.map((photog, idx) => (
                <div
                  key={photog.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: idx === 0 ? 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(255, 255, 255, 0.02))' : 'rgba(255, 255, 255, 0.03)',
                    border: idx === 0 ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
                    <img
                      src={photog.avatar}
                      alt={photog.name}
                      style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-teal)', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ overflowWrap: 'break-word' }}>{photog.name}</span>
                        <span style={{ background: 'rgba(0, 245, 212, 0.2)', color: 'var(--accent-teal)', padding: '2px 6px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                          {photog.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        @{photog.handle} • ⭐ {photog.rating} Avaliação
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
                      R$ {photog.totalSalesAmount.toFixed(2).replace('.', ',')}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {photog.totalClicks} flagras • {photog.eventsCovered} eventos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
