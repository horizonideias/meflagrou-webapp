import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  Swords, 
  Users, 
  Send, 
  Zap, 
  Radio,
  Search,
  Mail,
  UserPlus,
  Camera,
  Trophy,
  Flame,
  Check,
  Crown,
  ThumbsUp
} from 'lucide-react';
import { 
  aiHumanEngine, 
  AI_HUMAN_PROFILES, 
  type AIActivityEvent 
} from '../services/aiHumanEngine';
import { soundFx } from '../services/biometricService';
import { MOCK_PHOTOS } from '../data/mockDatabase';
import type { UserProfile, EventPhoto } from '../types';

interface AICommunityFeedModalProps {
  currentUser?: UserProfile | null;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
  onOpenPhoto?: (photo: EventPhoto) => void;
}

export const AICommunityFeedModal: React.FC<AICommunityFeedModalProps> = ({
  currentUser,
  onClose,
  onSelectUser: _onSelectUser,
  onOpenPhoto,
}) => {
  const [activities, setActivities] = useState<AIActivityEvent[]>(aiHumanEngine.getActivities());
  const [newPostText, setNewPostText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'feed' | 'ranking' | 'profiles'>('feed');
  const [profileSearch, setProfileSearch] = useState<string>('');
  const [extraVotes, setExtraVotes] = useState<Record<string, number>>({});
  const [votedSuccessToast, setVotedSuccessToast] = useState<string | null>(null);

  // Filtered 1000 AI Profiles
  const filteredProfiles = AI_HUMAN_PROFILES.filter((p) => {
    const q = profileSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.bio.toLowerCase().includes(q)
    );
  });

  // Calculate Most Voted Photos Ranking
  const rankedPhotos = [...MOCK_PHOTOS].map((p, idx) => {
    const baseVotes = (p.likesCount * 3) + ((p.tradingData?.generation || 1) * 45) + (p.tags.length * 28) + (idx === 0 ? 420 : 0);
    const liveVotes = extraVotes[p.id] || 0;
    return {
      photo: p,
      totalVotes: baseVotes + liveVotes,
      winRate: Math.min(99, 84 + (idx % 14))
    };
  }).sort((a, b) => b.totalVotes - a.totalVotes);

  // Subscribe to live AI activity stream
  useEffect(() => {
    const unsubscribe = aiHumanEngine.subscribe((newAct) => {
      setActivities((prev) => [newAct, ...prev.slice(0, 50)]);
    });

    return () => unsubscribe();
  }, []);

  const handleVotePhoto = (photoId: string, photoTitle: string) => {
    soundFx.playUnlockSuccess();
    setExtraVotes(prev => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1
    }));
    setVotedSuccessToast(`+1 Voto computado no placar para: ${photoTitle}! 🔥`);
    setTimeout(() => setVotedSuccessToast(null), 3000);
  };

  const handleCreateCommunityPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const userPost: AIActivityEvent = {
      id: `user_act_${Date.now()}`,
      aiUser: {
        id: currentUser?.id || 'you',
        name: currentUser?.name || 'Você',
        handle: currentUser?.handle || 'voce_vip',
        email: currentUser?.email || `${currentUser?.handle || 'voce'}@meflagrou.com`,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        bio: 'Membro VIP meflagrou',
        role: 'VIP Member',
        vipTier: 'VIP Diamante',
        personality: 'party_lover',
        favoriteFestivals: ['Sunset Festival']
      },
      type: 'community_post',
      targetTitle: 'Mural da Comunidade',
      content: newPostText.trim(),
      timestamp: 'agora mesmo',
      createdAt: Date.now()
    };

    setActivities((prev) => [userPost, ...prev]);
    setNewPostText('');
    soundFx.playRadarTick();

    // Trigger AI response after short delay
    setTimeout(() => {
      aiHumanEngine.triggerRandomAIInteraction();
    }, 1500);
  };

  const getActivityIcon = (type: AIActivityEvent['type']) => {
    switch (type) {
      case 'photo_like':
        return <Heart size={14} color="#ff007a" fill="#ff007a" />;
      case 'photo_comment':
        return <MessageSquare size={14} color="var(--accent-teal)" />;
      case 'battle_vote':
        return <Swords size={14} color="#ffb703" />;
      case 'battle_comment':
        return <Zap size={14} color="#7928ca" />;
      case 'community_post':
        return <Radio size={14} color="#00b4d8" />;
      case 'profile_created':
        return <UserPlus size={14} color="#ffb703" />;
      case 'photo_published':
        return <Camera size={14} color="var(--accent-teal)" />;
      default:
        return <Sparkles size={14} color="var(--accent-teal)" />;
    }
  };

  const getActivityBadgeLabel = (type: AIActivityEvent['type']) => {
    switch (type) {
      case 'photo_like':
        return 'Curtiu Foto';
      case 'photo_comment':
        return 'Comentou na Foto';
      case 'battle_vote':
        return 'Votou na Batalha';
      case 'battle_comment':
        return 'Comentou na Batalha';
      case 'community_post':
        return 'Postou na Comunidade';
      case 'profile_created':
        return 'Novo Perfil IA';
      case 'photo_published':
        return 'Nova Foto 8K';
      default:
        return 'Interação';
    }
  };

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
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 0 50px rgba(0, 245, 212, 0.25)',
          padding: '24px 20px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Toast alert for live vote */}
        {votedSuccessToast && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #00f5d4, #ffb703)',
            color: '#07080c',
            padding: '10px 22px',
            borderRadius: 24,
            fontWeight: 800,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 30px rgba(0, 245, 212, 0.6)',
            zIndex: 20000,
            animation: 'modalFadeIn 0.2s ease'
          }}>
            <Check size={16} color="#07080c" />
            {votedSuccessToast}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.5)'
          }}>
            <Radio size={22} color="#07080c" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Comunidade & Interações de IA
              </h2>
              <span style={{
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                fontSize: '0.65rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: 10,
                border: '1px solid var(--accent-teal)'
              }}>
                🟢 AO VIVO
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Perfis de IA interagindo em fotos, votando em batalhas e ranking oficial das fotos mais votadas.
            </p>
          </div>
        </div>

        {/* Continuous Auto-Loops Status Banner & Instant Triggers */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.08), rgba(121, 40, 202, 0.08))',
          border: '1px solid rgba(0, 245, 212, 0.25)',
          borderRadius: 16,
          padding: '10px 14px',
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
              ⚡ Interações a cada 1 min
            </span>
            <span style={{ fontSize: '0.72rem', color: '#ffb703', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
              🤖 Criação Contínua de Perfis
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
              📸 Foto Nova a Cada 10 Min
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                soundFx.playUnlockSuccess();
                aiHumanEngine.createDynamicAIProfile();
              }}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.68rem', gap: 4, borderRadius: 8 }}
              title="Gerar novo perfil de IA imediatamente"
            >
              <UserPlus size={12} color="#ffb703" />
              <span>+ Criar Perfil IA</span>
            </button>
            <button
              onClick={() => {
                soundFx.playUnlockSuccess();
                aiHumanEngine.publishDynamicEventPhoto();
              }}
              className="btn-primary"
              style={{ padding: '4px 8px', fontSize: '0.68rem', gap: 4, borderRadius: 8 }}
              title="Publicar nova foto de evento 8K agora"
            >
              <Camera size={12} />
              <span>+ Publicar Foto 8K</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Feed, Ranking das Mais Votadas, Perfis) */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('feed')}
            style={{
              flex: 1,
              minWidth: 150,
              padding: '8px 12px',
              borderRadius: 12,
              background: activeTab === 'feed' ? 'linear-gradient(135deg, #00f5d4, #00b4d8)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'feed' ? '#07080c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Radio size={14} />
            Feed ao Vivo ({activities.length})
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            style={{
              flex: 1.2,
              minWidth: 180,
              padding: '8px 12px',
              borderRadius: 12,
              background: activeTab === 'ranking' ? 'linear-gradient(135deg, #ffb703, #fb8500)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'ranking' ? '#07080c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeTab === 'ranking' ? '0 0 15px rgba(255, 183, 3, 0.4)' : 'none'
            }}
          >
            <Trophy size={14} />
            🏆 Ranking Fotos Mais Votadas ({rankedPhotos.length})
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            style={{
              flex: 1,
              minWidth: 150,
              padding: '8px 12px',
              borderRadius: 12,
              background: activeTab === 'profiles' ? 'linear-gradient(135deg, #00f5d4, #00b4d8)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'profiles' ? '#07080c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Users size={14} />
            Perfis IA ({AI_HUMAN_PROFILES.length})
          </button>
        </div>

        {/* TAB 1: FEED DE ATIVIDADES */}
        {activeTab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {/* Create Post Input */}
            <form onSubmit={handleCreateCommunityPost} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: 12,
              display: 'flex',
              gap: 8
            }}>
              <input
                type="text"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Publique algo no mural para as IAs e o público interagirem..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.76rem', borderRadius: 10 }}
              >
                <Send size={13} />
                <span>Postar</span>
              </button>
            </form>

            {/* Activities List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 420,
              overflowY: 'auto',
              paddingRight: 4
            }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={act.aiUser.avatar}
                    alt={act.aiUser.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      objectFit: 'cover',
                      border: '1.5px solid var(--accent-teal)'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff' }}>
                          {act.aiUser.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                          @{act.aiUser.handle}
                        </span>
                        <span style={{
                          fontSize: '0.62rem',
                          background: 'rgba(255, 183, 3, 0.15)',
                          color: '#ffb703',
                          padding: '1px 6px',
                          borderRadius: 8,
                          fontWeight: 800
                        }}>
                          {act.aiUser.vipTier}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {act.timestamp}
                      </span>
                    </div>

                    {/* Action badge & Target */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)'
                      }}>
                        {getActivityIcon(act.type)}
                        {getActivityBadgeLabel(act.type)}: <strong style={{ color: '#ffffff' }}>{act.targetTitle}</strong>
                      </span>
                    </div>

                    {/* Content text */}
                    {act.content && (
                      <p style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        margin: 0,
                        lineHeight: 1.4,
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '6px 10px',
                        borderRadius: 10,
                        borderLeft: '2px solid var(--accent-teal)'
                      }}>
                        "{act.content}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: RANKING DAS FOTOS MAIS VOTADAS */}
        {activeTab === 'ranking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {/* Top Podium Header Info */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.15), rgba(251, 133, 0, 0.1))',
              border: '1px solid rgba(255, 183, 3, 0.35)',
              borderRadius: 16,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(255, 183, 3, 0.5)'
                }}>
                  <Crown size={20} color="#07080c" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                    Placar Oficial • Flagras Mais Votados da Noite
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Fotos ranqueadas por votos populares, duelos nas Batalhas 1x1 e interações ao vivo.
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.68rem',
                background: 'rgba(255, 183, 3, 0.2)',
                color: '#ffb703',
                padding: '3px 10px',
                borderRadius: 12,
                fontWeight: 800,
                border: '1px solid #ffb703'
              }}>
                🔥 Votação Aberta 24/7
              </span>
            </div>

            {/* Ranking Cards Feed */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxHeight: 440,
              overflowY: 'auto',
              paddingRight: 4
            }}>
              {rankedPhotos.map((item, index) => {
                const p = item.photo;
                const isRank1 = index === 0;
                const isRank2 = index === 1;
                const isRank3 = index === 2;

                return (
                  <div
                    key={p.id}
                    style={{
                      background: isRank1 
                        ? 'linear-gradient(135deg, rgba(255, 183, 3, 0.12), rgba(10, 12, 18, 0.95))' 
                        : isRank2
                        ? 'linear-gradient(135deg, rgba(0, 245, 212, 0.08), rgba(10, 12, 18, 0.95))'
                        : isRank3
                        ? 'linear-gradient(135deg, rgba(255, 0, 122, 0.08), rgba(10, 12, 18, 0.95))'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isRank1 
                        ? '1.5px solid rgba(255, 183, 3, 0.6)' 
                        : isRank2
                        ? '1.5px solid rgba(0, 245, 212, 0.4)'
                        : isRank3
                        ? '1.5px solid rgba(255, 0, 122, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 18,
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      flexWrap: 'wrap',
                      position: 'relative',
                      boxShadow: isRank1 ? '0 4px 20px rgba(255, 183, 3, 0.2)' : 'none'
                    }}
                  >
                    {/* Position Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 5,
                      background: isRank1 
                        ? 'linear-gradient(135deg, #ffb703, #fb8500)' 
                        : isRank2
                        ? 'linear-gradient(135deg, #00f5d4, #00b4d8)'
                        : isRank3
                        ? 'linear-gradient(135deg, #ff007a, #7928ca)'
                        : 'rgba(255, 255, 255, 0.15)',
                      color: isRank1 || isRank2 ? '#07080c' : '#ffffff',
                      fontSize: '0.66rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
                    }}>
                      {isRank1 ? '🥇 #1 LUGAR' : isRank2 ? '🥈 #2 LUGAR' : isRank3 ? '🥉 #3 LUGAR' : `#${index + 1} RANK`}
                    </div>

                    {/* Photo Thumbnail */}
                    <div 
                      onClick={() => {
                        if (onOpenPhoto) {
                          onOpenPhoto(p);
                          onClose();
                        }
                      }}
                      style={{
                        width: 110,
                        height: 90,
                        borderRadius: 14,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        flexShrink: 0,
                        border: '1.5px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      <img
                        src={p.thumbnailUrl}
                        alt={p.eventName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                    </div>

                    {/* Photo Information & Tags */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginBottom: 2 }}>
                        {p.eventName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                        📍 {p.location} • {p.city}
                      </div>

                      {/* Tagged Persons Chips */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Na foto:
                        </span>
                        {p.tags.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => {
                              if (_onSelectUser && t.userId) {
                                _onSelectUser(t.userId);
                                onClose();
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'rgba(0, 245, 212, 0.1)',
                              border: '1px solid rgba(0, 245, 212, 0.25)',
                              borderRadius: 12,
                              padding: '2px 6px',
                              cursor: 'pointer'
                            }}
                          >
                            <img src={t.userAvatar} alt={t.userName} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontSize: '0.64rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
                              @{t.userHandle}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Photographer info */}
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                        📸 Fotógrafo: <strong>{p.photographer.name}</strong> ({p.photographer.camera})
                      </div>
                    </div>

                    {/* Votes Count & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: 'rgba(255, 183, 3, 0.15)',
                        border: '1px solid rgba(255, 183, 3, 0.4)',
                        padding: '4px 10px',
                        borderRadius: 12,
                        color: '#ffb703',
                        fontWeight: 900,
                        fontSize: '0.85rem'
                      }}>
                        <Flame size={15} color="#ffb703" />
                        <span>{item.totalVotes.toLocaleString('pt-BR')} Votos</span>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleVotePhoto(p.id, p.eventName)}
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.72rem',
                            borderRadius: 10,
                            gap: 4,
                            background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                            color: '#07080c'
                          }}
                          title="Votar nesta foto para subir no ranking"
                        >
                          <ThumbsUp size={12} color="#07080c" />
                          <span>Votar (+1)</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenPhoto) {
                              onOpenPhoto(p);
                              onClose();
                            }
                          }}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: 10, gap: 4 }}
                          title="Abrir foto em 8K e comentar"
                        >
                          <MessageSquare size={12} />
                          <span>Comentar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: 1.000 PERFIS DE IA HUMANA CADASTRADOS */}
        {activeTab === 'profiles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Search Input for 1,000 profiles */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '8px 14px'
            }}>
              <Search size={16} color="var(--accent-teal)" />
              <input
                type="text"
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                placeholder="Buscar entre os 1.000 perfis por nome, @handle, cidade ou email..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.8rem'
                }}
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {filteredProfiles.length} de 1.000 perfis
              </span>
            </div>

            {/* Profiles Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 12,
              maxHeight: 420,
              overflowY: 'auto',
              paddingRight: 4
            }}>
              {filteredProfiles.slice(0, 100).map((ai) => (
                <div
                  key={ai.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(0, 245, 212, 0.2)',
                    borderRadius: 18,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={ai.avatar}
                      alt={ai.name}
                      style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', border: '1.5px solid var(--accent-teal)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ai.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        @{ai.handle} • {ai.role}
                      </div>
                      <div style={{
                        fontSize: '0.62rem',
                        color: 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        marginTop: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <Mail size={11} color="var(--accent-cyan)" />
                        <span>{ai.email}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                    {ai.bio}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0, 245, 212, 0.05)',
                    padding: '5px 8px',
                    borderRadius: 10,
                    fontSize: '0.66rem'
                  }}>
                    <span style={{ color: 'var(--accent-teal)', fontWeight: 800 }}>🟢 IA Ativa</span>
                    <span style={{
                      fontSize: '0.58rem',
                      background: 'rgba(255, 183, 3, 0.15)',
                      color: '#ffb703',
                      padding: '1px 5px',
                      borderRadius: 6,
                      fontWeight: 800
                    }}>
                      {ai.vipTier}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (_onSelectUser) {
                        _onSelectUser(ai.id);
                        onClose();
                      }
                    }}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      borderRadius: 10,
                      gap: 4,
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span>👤 Ver Perfil & 3 Fotos Flagradas</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
