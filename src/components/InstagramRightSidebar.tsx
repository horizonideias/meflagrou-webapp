import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Crown, 
  MapPin, 
  DollarSign, 
  Swords, 
  Shuffle, 
  HelpCircle, 
  ExternalLink, 
  Flame, 
  CheckCircle2, 
  Megaphone, 
  Pause, 
  Play 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_PHOTOS } from '../data/mockDatabase';
import { useCart } from '../context/CartContext';
import { soundFx } from '../services/biometricService';

interface InstagramRightSidebarProps {
  currentUser: UserProfile;
  allPhotos?: EventPhoto[];
  onSelectUser: (user: UserProfile) => void;
  onOpenProfileSwitcher: () => void;
  onOpenRadar: () => void;
  onOpenHallOfFame: () => void;
  onOpenBattle?: () => void;
  onOpenPhotoModal?: (photo: EventPhoto) => void;
  onOpenCommunityChat?: () => void;
}

export const InstagramRightSidebar: React.FC<InstagramRightSidebarProps> = ({
  currentUser,
  allPhotos = MOCK_PHOTOS,
  onSelectUser,
  onOpenProfileSwitcher,
  onOpenRadar,
  onOpenHallOfFame,
  onOpenBattle,
  onOpenPhotoModal,
  onOpenCommunityChat,
}) => {
  const { sellerProfile, openSellerDashboard } = useCart();
  const isFounder = currentUser.id === 'user_founder';

  const suggestedUsers = MOCK_USERS.filter((u) => u.id !== currentUser.id).slice(0, 4);

  // 1. Fotos Aleatórias do Site
  const [randomSeed, setRandomSeed] = useState(0);
  const randomPhotos = useMemo(() => {
    if (randomSeed < 0) return [];
    const list = [...allPhotos];
    return list.sort(() => Math.random() - 0.5).slice(0, 6);
  }, [allPhotos, randomSeed]);

  const handleShufflePhotos = () => {
    soundFx.playRadarTick();
    setRandomSeed((s) => s + 1);
  };

  // 2. Batalha 1v1 Interativa no Bloco Lateral
  const [battleVote, setBattleVote] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(142);
  const [votesB, setVotesB] = useState(118);

  const battlePhotoA = allPhotos[0] || MOCK_PHOTOS[0];
  const battlePhotoB = allPhotos[1] || MOCK_PHOTOS[1];

  const handleVoteBattle = (side: 'A' | 'B') => {
    if (battleVote) return;
    setBattleVote(side);
    soundFx.playRadarTick();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { x: 0.85, y: 0.5 },
      colors: ['#ff007a', '#00f5d4', '#ffb703'],
    });
    if (side === 'A') setVotesA((v) => v + 1);
    else setVotesB((v) => v + 1);
  };

  const totalBattleVotes = votesA + votesB;
  const pctA = Math.round((votesA / totalBattleVotes) * 100);
  const pctB = 100 - pctA;

  // 3. Quiz da Noite
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const quizQuestion = {
    title: 'Qual a sua vibe de balada hoje?',
    options: [
      { id: 0, text: '🍸 Camarote Open Bar', votes: 58 },
      { id: 1, text: '🎧 Frontstage colado no DJ', votes: 84 },
      { id: 2, text: '🌅 After até as 08h da manhã', votes: 46 },
    ],
  };

  const [quizVotes, setQuizVotes] = useState(quizQuestion.options.map((o) => o.votes));
  const totalQuizVotes = quizVotes.reduce((acc, curr) => acc + curr, 0);

  const handleVoteQuiz = (index: number) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(index);
    soundFx.playRadarTick();
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { x: 0.85, y: 0.7 },
      colors: ['#00f5d4', '#7928ca'],
    });
    setQuizVotes((prev) => {
      const next = [...prev];
      next[index] += 1;
      return next;
    });
  };

  // 🔄 4. AUTO-SCROLL AUTOMÁTICO PARA CIMA COM PAUSA NO HOVER
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let scrollSubPixel = 0;

    const scrollStep = (time: number) => {
      const deltaTime = Math.min(50, time - lastTime);
      lastTime = time;

      if (!isAutoScrollPaused && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollHeight - container.clientHeight;

        if (container.scrollTop >= maxScroll - 1) {
          // Loop suave de volta ao topo
          container.scrollTop = 0;
          scrollSubPixel = 0;
        } else {
          // 🐢 Velocidade reduzida e ultra-suave (~14px/s)
          scrollSubPixel += (14 * deltaTime) / 1000;
          if (scrollSubPixel >= 0.5) {
            container.scrollTop += scrollSubPixel;
            scrollSubPixel = 0;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoScrollPaused]);

  return (
    <aside className="instagram-right-sidebar">
      {/* 1. Header Fixo Superior: Card do Usuário Logado */}
      <div className="right-sidebar-fixed-header">
        <div className="right-user-profile-card">
          <div className="right-user-avatar-wrapper" onClick={() => onSelectUser(currentUser)}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`right-user-avatar ${isFounder ? 'border-gold' : 'border-teal'}`}
            />
          </div>

          <div className="right-user-info" onClick={() => onSelectUser(currentUser)}>
            <div className="right-user-name-row">
              <span className="right-user-handle">@{currentUser.handle}</span>
              {isFounder ? (
                <span className="right-founder-badge">
                  <Crown size={10} color="#07080c" /> DEUS
                </span>
              ) : (
                <span className="right-vip-badge">VIP</span>
              )}
            </div>
            <div className="right-user-name">{currentUser.name}</div>
          </div>

          <button
            onClick={onOpenProfileSwitcher}
            className="right-switch-account-btn"
            title="Mudar de perfil"
          >
            Trocar
          </button>
        </div>

        {/* Indicador de Auto-Scroll com Botão de Pausar/Continuar */}
        <div className="right-autoscroll-control-bar">
          <div className="autoscroll-status-tag">
            <span className={`autoscroll-dot ${isAutoScrollPaused ? 'paused' : 'live'}`} />
            <span>{isAutoScrollPaused ? 'Scroll Pausado (Hover)' : 'Rolagem Automática Ativa'}</span>
          </div>
          <button 
            onClick={() => setIsAutoScrollPaused(!isAutoScrollPaused)}
            className="autoscroll-toggle-icon"
            title={isAutoScrollPaused ? 'Retomar Rolagem' : 'Pausar Rolagem'}
          >
            {isAutoScrollPaused ? <Play size={11} color="var(--accent-teal)" /> : <Pause size={11} color="var(--text-muted)" />}
          </button>
        </div>
      </div>

      {/* 2. 🚀 CORPO DO MENU DIREITO EM SCROLL AUTOMÁTICO PARA CIMA */}
      <div 
        ref={scrollContainerRef}
        className="right-sidebar-scroll-ticker"
        onMouseEnter={() => setIsAutoScrollPaused(true)}
        onMouseLeave={() => setIsAutoScrollPaused(false)}
      >
        {/* 2.1 Saldo e Repasses de Vendas PIX */}
        <div className="right-pix-wallet-card" onClick={openSellerDashboard}>
          <div className="pix-header">
            <div className="pix-title">
              <DollarSign size={15} color={isFounder ? '#ffb703' : 'var(--accent-teal)'} />
              <span>{isFounder ? 'Repasses Master (9%):' : 'Carteira PIX:'}</span>
            </div>
            <span className="pix-link">Extrato →</span>
          </div>
          <div className="pix-balance-row">
            <span className="pix-balance">
              R$ {sellerProfile.availableBalance.toFixed(2).replace('.', ',')}
            </span>
            <span className="pix-badge">Instantâneo</span>
          </div>
        </div>

        {/* 2.15 💬 CHATONLINE AO VIVO */}
        {onOpenCommunityChat && (
          <div 
            className="right-sidebar-block"
            onClick={onOpenCommunityChat}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.08) 0%, rgba(255, 0, 122, 0.05) 100%)',
              borderColor: 'rgba(0, 245, 212, 0.25)',
              padding: '12px',
              borderRadius: '16px',
            }}
          >
            <div className="sidebar-block-header" style={{ marginBottom: 4 }}>
              <div className="block-title-row">
                <span style={{ fontSize: '1rem' }}>💬</span>
                <span className="block-title" style={{ color: '#00f5d4', fontWeight: 800 }}>ChatOnline</span>
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, background: 'rgba(255, 0, 122, 0.2)', border: '1px solid #ff007a', color: '#ff007a', padding: '1px 5px', borderRadius: 6 }}>AO VIVO</span>
            </div>
            <p className="block-subtitle" style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.72rem' }}>
              🔥 1.480 membros online nos canais de festas e directs!
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {suggestedUsers.slice(0, 3).map((u) => (
                  <img
                    key={u.id}
                    src={u.avatar}
                    alt={u.name}
                    style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #00f5d4', objectFit: 'cover' }}
                  />
                ))}
                <span style={{ fontSize: '0.68rem', color: '#00f5d4', fontWeight: 700 }}>+1.4k</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#00f5d4', fontWeight: 800 }}>Entrar no Chat →</span>
            </div>
          </div>
        )}

        {/* 2.2 ⚔️ BLOCO DE BATALHA 1v1 DA NOITE */}
        <div className="right-sidebar-block battle-widget-card">
          <div className="sidebar-block-header">
            <div className="block-title-row">
              <Swords size={15} color="var(--accent-magenta)" />
              <span className="block-title">Batalha 1v1 da Noite</span>
            </div>
            {onOpenBattle && (
              <button onClick={onOpenBattle} className="block-action-link">
                Ver Arena →
              </button>
            )}
          </div>
          <p className="block-subtitle">Quem teve a melhor vibe na pista?</p>

          <div className="battle-vs-container">
            {/* Foto A */}
            <div
              onClick={() => handleVoteBattle('A')}
              className={`battle-photo-box ${battleVote === 'A' ? 'voted-selected' : ''}`}
            >
              <img
                src={battlePhotoA.highResUrl || battlePhotoA.url}
                alt="Competidor A"
                className="battle-thumb"
              />
              <div className="battle-vote-overlay">
                <span className="battle-label">{battlePhotoA.tags[0]?.userName || 'Deus VIP'}</span>
                {battleVote && <span className="battle-pct">{pctA}%</span>}
              </div>
            </div>

            {/* VS Badge */}
            <div className="battle-vs-badge">VS</div>

            {/* Foto B */}
            <div
              onClick={() => handleVoteBattle('B')}
              className={`battle-photo-box ${battleVote === 'B' ? 'voted-selected' : ''}`}
            >
              <img
                src={battlePhotoB.highResUrl || battlePhotoB.url}
                alt="Competidor B"
                className="battle-thumb"
              />
              <div className="battle-vote-overlay">
                <span className="battle-label">{battlePhotoB.tags[0]?.userName || 'Isabela R.'}</span>
                {battleVote && <span className="battle-pct">{pctB}%</span>}
              </div>
            </div>
          </div>

          {battleVote ? (
            <div className="battle-voted-status">
              <CheckCircle2 size={13} color="var(--accent-teal)" />
              <span>Voto computado! Total: {totalBattleVotes} votos</span>
            </div>
          ) : (
            <span className="battle-instruction">Clique na foto para votar</span>
          )}
        </div>

        {/* 2.3 🎲 BLOCO DE FOTOS ALEATÓRIAS (EM FORMATO 9:16) */}
        <div className="right-sidebar-block random-gallery-card">
          <div className="sidebar-block-header">
            <div className="block-title-row">
              <Shuffle size={15} color="var(--accent-cyan)" />
              <span className="block-title">Flagras Aleatórios</span>
            </div>
            <button onClick={handleShufflePhotos} className="block-action-link" title="Embaralhar fotos">
              <Shuffle size={12} />
              <span>Girar</span>
            </button>
          </div>
          <p className="block-subtitle">Fotos do feed em formato vertical de story</p>

          <div className="random-photos-grid">
            {randomPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onOpenPhotoModal && onOpenPhotoModal(photo)}
                className="random-photo-item"
                title={`${photo.eventName} • ${photo.tags[0]?.userName || 'VIP'}`}
              >
                <img src={photo.thumbnailUrl || photo.url} alt={photo.eventName} />
                <div className="random-photo-hover">
                  <Flame size={12} color="#ffffff" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2.4 💡 BLOCO DE QUIZ / ENQUETE INTERATIVA */}
        <div className="right-sidebar-block quiz-widget-card">
          <div className="sidebar-block-header">
            <div className="block-title-row">
              <HelpCircle size={15} color="var(--accent-teal)" />
              <span className="block-title">Quiz da Noite</span>
            </div>
            <span className="quiz-badge">VOTAÇÃO</span>
          </div>

          <span className="quiz-question-title">{quizQuestion.title}</span>

          <div className="quiz-options-list">
            {quizQuestion.options.map((opt, idx) => {
              const isSelected = selectedQuizOption === idx;
              const pct = Math.round((quizVotes[idx] / totalQuizVotes) * 100);

              return (
                <button
                  key={opt.id}
                  onClick={() => handleVoteQuiz(idx)}
                  className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                >
                  {selectedQuizOption !== null && (
                    <div className="quiz-progress-bar" style={{ width: `${pct}%` }} />
                  )}
                  <span className="quiz-option-text">{opt.text}</span>
                  {selectedQuizOption !== null && (
                    <span className="quiz-option-pct">{pct}%</span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedQuizOption !== null && (
            <span className="quiz-footer-meta">
              ✓ Seu voto foi registrado ({totalQuizVotes} participações)
            </span>
          )}
        </div>

        {/* 2.5 📢 BLOCO DE PUBLICIDADE / PATROCINADOR VIP */}
        <div className="right-sidebar-block ad-sponsor-card">
          <div className="ad-header-row">
            <span className="ad-badge">
              <Megaphone size={11} /> Patrocinado
            </span>
            <span className="ad-brand-name">Heineken • Tomorrowland</span>
          </div>

          <div className="ad-media-container">
            <img
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&h=300&q=80"
              alt="Anúncio VIP"
              className="ad-banner-img"
            />
            <div className="ad-overlay-content">
              <span className="ad-deal-title">Área Exclusiva VIP Stage</span>
              <span className="ad-deal-code">Use o cupom: MEFLAGROU2026</span>
            </div>
          </div>

          <a
            href="https://meflagrou.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ad-action-btn"
          >
            <span>Garantir Acesso</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* 2.6 Sugestões de Perfis */}
        <div className="right-suggestions-section">
          <div className="suggestions-header">
            <span className="suggestions-title">Sugestões para você</span>
            <button onClick={onOpenHallOfFame} className="suggestions-see-all">
              Ver tudo
            </button>
          </div>

          <div className="suggestions-list">
            {suggestedUsers.map((u) => (
              <div key={u.id} className="suggestion-item">
                <div className="suggestion-left" onClick={() => onSelectUser(u)}>
                  <img src={u.avatar} alt={u.name} className="suggestion-avatar" />
                  <div className="suggestion-info">
                    <div className="suggestion-handle">@{u.handle}</div>
                    <div className="suggestion-reason">
                      {u.id.includes('photog') ? 'Fotógrafo Oficial 8K' : 'Seguido por amigos'}
                    </div>
                  </div>
                </div>

                <button onClick={() => onSelectUser(u)} className="suggestion-follow-btn">
                  Ver
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2.7 Radar de Eventos Ativos */}
        <div className="right-events-section">
          <div className="events-header">
            <div className="events-title">
              <MapPin size={14} color="var(--accent-cyan)" />
              <span>Eventos no Radar</span>
            </div>
            <button onClick={onOpenRadar} className="events-see-all">
              Mapa GPS
            </button>
          </div>

          <div className="events-mini-list">
            {MOCK_EVENTS.slice(0, 3).map((event) => (
              <div key={event.id} className="event-mini-item" onClick={onOpenRadar}>
                <div className="event-dot" />
                <div className="event-info">
                  <span className="event-name">{event.name}</span>
                  <span className="event-city">{event.city}</span>
                </div>
                <span className="event-photos-badge">{event.totalPhotos} flagras</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 📌 RODAPÉ FIXO NO MENU DIREITO */}
      <footer className="right-sidebar-fixed-footer">
        <div className="footer-links">
          <span>Sobre</span> • <span>Ajuda</span> • <span>Termos</span> •{' '}
          <span>Privacidade</span> • <span>API</span> • <span>Fotógrafos</span>
        </div>
        <div className="footer-copyright">
          © 2026 MEFLAGROU • FOTOGRAFIA & BIOMETRIA VIP
        </div>
      </footer>
    </aside>
  );
};
