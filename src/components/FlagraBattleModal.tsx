import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Swords, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  MessageCircle, 
  Send, 
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import { MOCK_PHOTOS, MOCK_USERS } from '../data/mockDatabase';
import { aiHumanEngine } from '../services/aiHumanEngine';
import type { EventPhoto, UserProfile } from '../types';

interface BattleComment {
  id: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  votedFor: 'A' | 'B';
}

interface FlagraBattleModalProps {
  onClose: () => void;
  onOpenPhoto: (photo: EventPhoto) => void;
  onSelectUser?: (user: UserProfile) => void;
}

export const FlagraBattleModal: React.FC<FlagraBattleModalProps> = ({
  onClose,
  onOpenPhoto: _onOpenPhoto,
  onSelectUser,
}) => {
  const [battleNumber, setBattleNumber] = useState<number>(1);
  const [votedPhotoId, setVotedPhotoId] = useState<string | null>(null);
  const [votesA, setVotesA] = useState<number>(142);
  const [votesB, setVotesB] = useState<number>(98);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');

  // Sample Battle Comments
  const [comments, setComments] = useState<BattleComment[]>([
    {
      id: 'c1',
      userName: 'DEUS',
      userHandle: '@deus_founder',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'A iluminação da Foto A tá em outro patamar! 🔥',
      timestamp: 'há 2 min',
      votedFor: 'A'
    },
    {
      id: 'c2',
      userName: 'Isabela',
      userHandle: '@isabelavip',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      text: 'O look da Foto B no camarote tá perfeito demais 😍',
      timestamp: 'há 5 min',
      votedFor: 'B'
    }
  ]);

  const photoIndexA = ((battleNumber - 1) * 2) % MOCK_PHOTOS.length;
  const photoIndexB = ((battleNumber - 1) * 2 + 1) % MOCK_PHOTOS.length;

  const photoA = MOCK_PHOTOS[photoIndexA] || MOCK_PHOTOS[0];
  const photoB = MOCK_PHOTOS[photoIndexB] || MOCK_PHOTOS[1];

  // People in Photo A & Photo B
  const tagA = photoA.tags[0];
  const personA = tagA ? MOCK_USERS.find(u => u.id === tagA.userId) || MOCK_USERS[0] : MOCK_USERS[0];

  const tagB = photoB.tags[0];
  const personB = tagB ? MOCK_USERS.find(u => u.id === tagB.userId) || MOCK_USERS[1] : MOCK_USERS[1];

  const totalVotes = votesA + votesB;
  const percentA = Math.round((votesA / totalVotes) * 100);
  const percentB = 100 - percentA;

  // Next Battle Switcher
  const handleNextBattle = () => {
    setBattleNumber(n => n + 1);
    setVotedPhotoId(null);
    setAutoNextCountdown(null);
    setVotesA(Math.floor(75 + Math.random() * 85));
    setVotesB(Math.floor(75 + Math.random() * 85));
    soundFx.playRadarTick();
  };

  // Vote handler with Auto-Advance timer
  const handleVote = (photoId: string, isA: boolean) => {
    if (votedPhotoId) return;

    setVotedPhotoId(photoId);
    setStreakCount(s => s + 1);

    if (isA) {
      setVotesA(v => v + 1);
    } else {
      setVotesB(v => v + 1);
    }

    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff007a', '#00f5d4', '#ffb703']
    });

    // Auto-advance in 1.4 seconds unless user opened comments
    if (!isCommentsOpen) {
      setAutoNextCountdown(1);
    }
  };

  // Automatic next battle timer
  useEffect(() => {
    if (autoNextCountdown === null || isCommentsOpen) return;

    const timer = setTimeout(() => {
      handleNextBattle();
    }, 1400);

    return () => clearTimeout(timer);
  }, [autoNextCountdown, battleNumber, isCommentsOpen]);

  // Subscribe to AI human live battle comments and votes
  useEffect(() => {
    const unsubscribe = aiHumanEngine.subscribe((event) => {
      if (event.type === 'battle_comment' && event.content) {
        const aiComment: BattleComment = {
          id: event.id,
          userName: event.aiUser.name,
          userHandle: `@${event.aiUser.handle}`,
          userAvatar: event.aiUser.avatar,
          text: event.content,
          timestamp: 'agora',
          votedFor: Math.random() > 0.5 ? 'A' : 'B'
        };
        setComments((prev) => [aiComment, ...prev]);
      } else if (event.type === 'battle_vote') {
        if (Math.random() > 0.5) {
          setVotesA(v => v + 1);
        } else {
          setVotesB(v => v + 1);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Send new comment handler
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: BattleComment = {
      id: `c_${Date.now()}`,
      userName: 'Você',
      userHandle: '@voce_vip',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text: commentInput.trim(),
      timestamp: 'agora',
      votedFor: votedPhotoId === photoB.id ? 'B' : 'A'
    };

    setComments([newComment, ...comments]);
    setCommentInput('');
    soundFx.playUnlockSuccess();
  };

  const handleOpenUserProfile = (user: UserProfile) => {
    if (onSelectUser) {
      onClose();
      onSelectUser(user);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: '10px 8px' }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 760,
          maxHeight: '96vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-magenta)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 0, 122, 0.3)',
          animation: 'modalFadeIn 0.25s ease',
          padding: '16px 14px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 20 }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Compact Header */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.2), rgba(121, 40, 202, 0.2))',
            border: '1px solid var(--accent-magenta)',
            padding: '2px 10px',
            borderRadius: 20,
            color: '#ff007a',
            fontSize: '0.72rem',
            fontWeight: 800,
            marginBottom: 4
          }}>
            <Swords size={13} />
            <span>BATALHA 1x1 • RODADA #{battleNumber}</span>
            {streakCount > 0 && (
              <span style={{ color: '#ffb703', marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <Flame size={12} fill="#ffb703" /> {streakCount} votos
              </span>
            )}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#ffffff',
            margin: '2px 0 0 0'
          }}>
            Qual flagra tem a melhor vibe da festa?
          </h2>
        </div>

        {/* 1x1 SIDE-BY-SIDE PHOTO BATTLE GRID (Both photos 100% visible on mobile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 10,
          position: 'relative'
        }}>
          {/* PHOTO A */}
          <div 
            onClick={() => handleVote(photoA.id, true)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 16,
              overflow: 'hidden',
              border: votedPhotoId === photoA.id 
                ? '2.5px solid var(--accent-teal)' 
                : votedPhotoId 
                  ? '1px solid rgba(255,255,255,0.08)' 
                  : '1.5px solid rgba(0, 245, 212, 0.3)',
              cursor: votedPhotoId ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: votedPhotoId === photoA.id ? '0 0 25px rgba(0, 245, 212, 0.4)' : 'none',
              transform: votedPhotoId === photoA.id ? 'scale(1.02)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: 210 }}>
              <img
                src={photoA.url}
                alt={photoA.eventName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Tag Desafiante A */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(0, 245, 212, 0.92)',
                color: '#07080c',
                fontWeight: 900,
                fontSize: '0.62rem',
                padding: '2px 7px',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}>
                FOTO A
              </div>

              {/* Vote Percentage Reveal Overlay */}
              {votedPhotoId && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: votedPhotoId === photoA.id ? 'rgba(0, 245, 212, 0.35)' : 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                  }}>
                    {percentA}%
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 800 }}>
                    {votesA} votos
                  </span>
                  {votedPhotoId === photoA.id && (
                    <div style={{
                      marginTop: 4,
                      background: '#07080c',
                      color: 'var(--accent-teal)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <CheckCircle2 size={11} /> Seu Voto
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photo A Info + Link to Person Profile */}
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Person Profile Link */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUserProfile(personA);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 6px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
                title="Ver perfil no meflagrou"
              >
                <img
                  src={personA.avatar}
                  alt={personA.name}
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    color: 'var(--accent-teal)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <span>@{personA.name.split(' ')[0]}</span>
                    <ExternalLink size={10} color="var(--accent-teal)" />
                  </div>
                </div>
              </div>

              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {photoA.eventName}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  📸 {photoA.photographer.name}
                </div>
              </div>

              <button
                type="button"
                disabled={!!votedPhotoId}
                style={{
                  width: '100%',
                  padding: '6px 4px',
                  borderRadius: 10,
                  background: votedPhotoId === photoA.id 
                    ? '#00f5d4' 
                    : 'linear-gradient(135deg, rgba(0, 245, 212, 0.25), rgba(0, 180, 216, 0.25))',
                  border: '1px solid var(--accent-teal)',
                  color: votedPhotoId === photoA.id ? '#07080c' : 'var(--accent-teal)',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                  cursor: votedPhotoId ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <Heart size={13} fill={votedPhotoId === photoA.id ? '#07080c' : 'none'} />
                <span>{votedPhotoId === photoA.id ? 'Votado!' : 'Votar na Foto A'}</span>
              </button>
            </div>
          </div>

          {/* PHOTO B */}
          <div 
            onClick={() => handleVote(photoB.id, false)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 16,
              overflow: 'hidden',
              border: votedPhotoId === photoB.id 
                ? '2.5px solid #ff007a' 
                : votedPhotoId 
                  ? '1px solid rgba(255,255,255,0.08)' 
                  : '1.5px solid rgba(255, 0, 122, 0.3)',
              cursor: votedPhotoId ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: votedPhotoId === photoB.id ? '0 0 25px rgba(255, 0, 122, 0.4)' : 'none',
              transform: votedPhotoId === photoB.id ? 'scale(1.02)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: 210 }}>
              <img
                src={photoB.url}
                alt={photoB.eventName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Tag Desafiante B */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'rgba(255, 0, 122, 0.92)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.62rem',
                padding: '2px 7px',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}>
                FOTO B
              </div>

              {/* Vote Percentage Reveal Overlay */}
              {votedPhotoId && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: votedPhotoId === photoB.id ? 'rgba(255, 0, 122, 0.35)' : 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                  }}>
                    {percentB}%
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 800 }}>
                    {votesB} votos
                  </span>
                  {votedPhotoId === photoB.id && (
                    <div style={{
                      marginTop: 4,
                      background: '#07080c',
                      color: '#ff007a',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <CheckCircle2 size={11} /> Seu Voto
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photo B Info + Link to Person Profile */}
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Person Profile Link */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUserProfile(personB);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 6px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)'
                }}
                title="Ver perfil no meflagrou"
              >
                <img
                  src={personB.avatar}
                  alt={personB.name}
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    color: '#ff007a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <span>@{personB.name.split(' ')[0]}</span>
                    <ExternalLink size={10} color="#ff007a" />
                  </div>
                </div>
              </div>

              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {photoB.eventName}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  📸 {photoB.photographer.name}
                </div>
              </div>

              <button
                type="button"
                disabled={!!votedPhotoId}
                style={{
                  width: '100%',
                  padding: '6px 4px',
                  borderRadius: 10,
                  background: votedPhotoId === photoB.id 
                    ? '#ff007a' 
                    : 'linear-gradient(135deg, rgba(255, 0, 122, 0.25), rgba(121, 40, 202, 0.25))',
                  border: '1px solid #ff007a',
                  color: votedPhotoId === photoB.id ? '#ffffff' : '#ff007a',
                  fontWeight: 900,
                  fontSize: '0.74rem',
                  cursor: votedPhotoId ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <Heart size={13} fill={votedPhotoId === photoB.id ? '#ffffff' : 'none'} />
                <span>{votedPhotoId === photoB.id ? 'Votado!' : 'Votar na Foto B'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Vote Progress Bar */}
        {votedPhotoId && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(255, 0, 122, 0.1))',
            borderRadius: 12,
            padding: '8px 12px',
            marginBottom: 10,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              marginBottom: 4
            }}>
              <span style={{ color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={13} /> Voto Computado!
              </span>
              <span style={{ color: '#ffb703', fontWeight: 900 }}>
                ⚡ Próxima em 1s...
              </span>
            </div>

            <div style={{ height: 6, borderRadius: 4, background: '#ff007a', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${percentA}%`, background: 'var(--accent-teal)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* COMENTÁRIOS DA BATALHA (EXPANSÍVEL E INTERATIVO) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: 10,
          marginBottom: 10
        }}>
          <div 
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageCircle size={15} color="var(--accent-teal)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
                Comentários da Batalha ({comments.length})
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
              {isCommentsOpen ? 'Ocultar' : 'Ver e Comentar'}
            </span>
          </div>

          {/* Expanded Comments List & Input */}
          {isCommentsOpen && (
            <div style={{ marginTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
              {/* Comments Feed */}
              <div style={{ maxHeight: 130, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <img src={c.userAvatar} alt={c.userName} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: '6px 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: c.votedFor === 'A' ? 'var(--accent-teal)' : '#ff007a' }}>
                          {c.userName} • Voto na Foto {c.votedFor}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{c.timestamp}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleSendComment} style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Deixe seu comentário nesta batalha..."
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 10,
                    padding: '6px 10px',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <Sparkles size={13} color="#ffb703" />
            <span>Total: <strong>{totalVotes}</strong> votos</span>
          </div>

          {/* Manual Next Battle Button */}
          <button
            onClick={handleNextBattle}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ff007a, #7928ca)',
              border: 'none',
              boxShadow: '0 0 15px rgba(255, 0, 122, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>Próxima Batalha</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
