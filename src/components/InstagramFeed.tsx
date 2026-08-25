import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Crown, 
  Flame, 
  Search, 
  MapPin, 
  X, 
  ChevronDown, 
  Play, 
  Pause, 
  ChevronUp, 
  Scan,
  Users,
  ArrowRight,
  LayoutGrid
} from 'lucide-react';
import type { EventPhoto, UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockDatabase';
import { type StoryItem } from '../data/mockStories';
import { InstagramStoriesTray } from './InstagramStoriesTray';
import { InstagramPostCard } from './InstagramPostCard';
import { PhotoCategoryAlternatingCards } from './PhotoCategoryAlternatingCards';
import { FeedPairedBlocks } from './FeedPairedBlocks';
import { FeedBattleCard } from './FeedBattleCard';
import { useCart } from '../context/CartContext';
import { soundFx } from '../services/biometricService';

interface InstagramFeedProps {
  currentUser: UserProfile;
  allUsers?: UserProfile[];
  stories: StoryItem[];
  allPhotos: EventPhoto[];
  onOpenStory: (story: StoryItem) => void;
  onOpenPhotoModal: (photo: EventPhoto) => void;
  onSelectUser: (user: UserProfile) => void;
  onOpenStoryShare?: (photo: EventPhoto) => void;
  onOpenUpload: () => void;
  onOpenBattle?: () => void;
  onOpenFaceScanner?: () => void;
  onOpenWhatsAppAlert?: () => void;
  onOpenHallOfFame?: () => void;
  onOpenRadar?: () => void;
  onOpenVipHub?: () => void;
  onOpenFullscreenGrid?: (initialPhoto?: EventPhoto, mode?: 'grid' | 'slideshow') => void;
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({
  currentUser,
  allUsers,
  stories,
  allPhotos,
  onOpenStory,
  onOpenPhotoModal,
  onSelectUser,
  onOpenStoryShare,
  onOpenUpload,
  onOpenBattle,
  onOpenFaceScanner,
  onOpenWhatsAppAlert,
  onOpenHallOfFame: _onOpenHallOfFame,
  onOpenRadar,
  onOpenVipHub,
  onOpenFullscreenGrid,
}) => {
  const { clientPublishedPhotos } = useCart();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'flagrantes' | 'vip' | 'festivais' | 'sp' | 'rio'>('todos');
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState<boolean>(true);

  // 👥 Flagrantes correspondentes (Usuários do meflagrou)
  const matchedFlagrantes = useMemo(() => {
    const list = allUsers && allUsers.length > 0 ? allUsers : MOCK_USERS;
    if (!searchQuery.trim()) return list.slice(0, 36);
    const q = searchQuery.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q)
    );
  }, [searchQuery, allUsers]);

  // Helper: Detect Mobile / Touch Screen Device
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  };

  // 🔄 ROLAGEM AUTOMÁTICA DE 3 SEGUNDOS: DESATIVADA NO CELULAR POR PADRÃO
  const [isAutoScrollActive, setIsAutoScrollActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && isMobileDevice()) {
      return false; // NO CELULAR NUNCA ATIVAR SCROLL AUTOMÁTICO
    }
    return true; // No Desktop pode iniciar ativo
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(1);

  const BLOCK_DURATION_MS = 3000; // 3 segundos de bloco em bloco

  // Combined published client photos + all mock database photos with search & filters
  const filteredPhotos = useMemo(() => {
    const list = [...clientPublishedPhotos, ...allPhotos];
    let unique = Array.from(new Map(list.map((p) => [p.id, p])).values());

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      unique = unique.filter(
        (p) =>
          p.eventName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.photographer.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.userName.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedFilter === 'vip') {
      unique = unique.filter((p) => p.isFeatured || p.likesCount > 800);
    } else if (selectedFilter === 'festivais') {
      unique = unique.filter(
        (p) =>
          p.eventName.toLowerCase().includes('festival') ||
          p.eventName.toLowerCase().includes('tomorrowland')
      );
    } else if (selectedFilter === 'sp') {
      unique = unique.filter(
        (p) =>
          p.eventName.toLowerCase().includes('sunset') ||
          p.eventName.toLowerCase().includes('tomorrowland')
      );
    } else if (selectedFilter === 'rio') {
      unique = unique.filter(
        (p) =>
          p.eventName.toLowerCase().includes('privilège') ||
          p.eventName.toLowerCase().includes('rooftop')
      );
    }

    return unique;
  }, [clientPublishedPhotos, allPhotos, searchQuery, selectedFilter]);

  // Total blocks estimated (posts + battles + paired blocks)
  const totalBlocks = Math.max(1, filteredPhotos.length + Math.floor(filteredPhotos.length / 2));

  // 🎯 Encaixe Perfeito: Função de Rolagem de Bloco em Bloco
  const scrollToBlockElement = useCallback((directionOrIdx: 'next' | 'prev' | number) => {
    const stream = document.querySelector('.instagram-posts-stream');
    if (!stream) return;

    const blockElements = Array.from(
      stream.querySelectorAll('.instagram-post-card, .feed-battle-card-wrapper, .feed-paired-blocks-container')
    ) as HTMLElement[];

    if (blockElements.length === 0) return;

    const scrollContainer = document.querySelector('.instagram-main-content') as HTMLElement | null;
    const currentScrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

    // Achar bloco ativo atual
    let activeIdx = 0;
    for (let i = 0; i < blockElements.length; i++) {
      const el = blockElements[i];
      const offsetTop = el.offsetTop - 210;
      if (currentScrollTop >= offsetTop - 50) {
        activeIdx = i;
      }
    }

    let targetIdx = activeIdx;
    if (typeof directionOrIdx === 'number') {
      targetIdx = directionOrIdx;
    } else if (directionOrIdx === 'next') {
      targetIdx = (activeIdx + 1) % blockElements.length;
    } else {
      targetIdx = (activeIdx - 1 + blockElements.length) % blockElements.length;
    }

    const targetEl = blockElements[targetIdx];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentBlockIndex(targetIdx + 1);
    }
  }, []);

  // ⏱️ Auto-scroll Engine de 3 Segundos com Encaixe Perfeito (DESATIVADO NO CELULAR)
  useEffect(() => {
    // Se for celular/touch, em hover, ou desativado, NÃO executar rolagem automática
    if (!isAutoScrollActive || isHovered || isMobileDevice()) return;

    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / BLOCK_DURATION_MS) * 100);
      setScrollProgress(pct);

      if (elapsed >= BLOCK_DURATION_MS) {
        startTime = Date.now();
        setScrollProgress(0);
        scrollToBlockElement('next');
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoScrollActive, isHovered, scrollToBlockElement]);

  // Manual Block Navigation
  const handleScrollBlock = (direction: 'next' | 'prev') => {
    soundFx.playRadarTick();
    scrollToBlockElement(direction);
    setScrollProgress(0);
  };

  const handleToggleAutoScroll = () => {
    soundFx.playRadarTick();
    setIsAutoScrollActive(!isAutoScrollActive);
    setScrollProgress(0);
  };

  return (
    <div 
      className="instagram-feed-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 📌 Header Sticky Superior: Menu Acima dos Stories + Stories */}
      <div className="feed-sticky-header">
        
        {/* 1. 🔍 Menu Superior: Busca Global & Chips de Filtro (ACIMA DOS STORIES) */}
        <div className="feed-top-menu-section">
          {/* Global Search Bar with Live Flagrantes Dropdown */}
          <div className="feed-search-wrapper">
            <Search size={16} className="feed-search-icon" />
            <input
              type="text"
              placeholder="Buscar flagrantes (pessoas), festas, cidades ou fotógrafos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="feed-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="feed-search-clear-btn" title="Limpar">
                <X size={14} />
              </button>
            )}

            {/* Live Search Instant Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="feed-live-search-dropdown no-scrollbar">
                <div className="live-search-section-header">
                  <Users size={12} color="var(--accent-teal)" />
                  <span>Flagrantes Encontrados ({matchedFlagrantes.length})</span>
                </div>
                {matchedFlagrantes.length === 0 ? (
                  <div className="live-search-empty">Nenhum flagrante correspondente encontrado.</div>
                ) : (
                  <div className="live-search-users-list">
                    {matchedFlagrantes.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        className="live-search-user-item"
                        onClick={() => {
                          onSelectUser(u);
                          setSearchQuery('');
                        }}
                      >
                        <img src={u.avatar} alt={u.name} className="live-search-user-avatar" />
                        <div className="live-search-user-info">
                          <div className="live-search-user-top">
                            <span className="live-search-user-name">{u.name}</span>
                            <span className="live-search-user-handle">@{u.handle}</span>
                          </div>
                          <span className="live-search-user-city">{u.city} • {u.totalPhotosCount} flagras</span>
                        </div>
                        <ArrowRight size={13} color="var(--text-muted)" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Filter Chips Bar */}
          <div className="instagram-filter-chips no-scrollbar">
            {/* 🖼️ Mosaico em Tela Toda */}
            {onOpenFullscreenGrid && (
              <button
                onClick={() => onOpenFullscreenGrid(undefined, 'grid')}
                className="filter-chip"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.22), rgba(0, 229, 255, 0.15))',
                  border: '1px solid var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 900,
                  boxShadow: '0 0 14px rgba(0, 245, 212, 0.35)',
                }}
                title="Abrir Todas as Fotos em Grade / Mosaico na Tela Toda"
              >
                <LayoutGrid size={13} color="var(--accent-teal)" />
                <span>🖼️ Mosaico Tela Toda</span>
              </button>
            )}

            {/* 🎬 Slideshow em Tela Cheia */}
            {onOpenFullscreenGrid && (
              <button
                onClick={() => onOpenFullscreenGrid(filteredPhotos[0], 'slideshow')}
                className="filter-chip"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.22), rgba(121, 40, 202, 0.15))',
                  border: '1px solid #ff007a',
                  color: '#ffffff',
                  fontWeight: 900,
                  boxShadow: '0 0 14px rgba(255, 0, 122, 0.35)',
                }}
                title="Iniciar Slideshow Automático de Todas as Fotos em Tela Cheia"
              >
                <Play size={13} fill="#ff007a" color="#ff007a" />
                <span>🎬 Slideshow Tela Cheia</span>
              </button>
            )}

            <button
              onClick={() => setSelectedFilter('todos')}
              className={`filter-chip ${selectedFilter === 'todos' ? 'active' : ''}`}
            >
              <Flame size={13} />
              <span>Todos os Flagras</span>
            </button>

            <button
              onClick={() => setSelectedFilter('flagrantes')}
              className={`filter-chip ${selectedFilter === 'flagrantes' ? 'active' : ''}`}
            >
              <Users size={13} />
              <span>Flagrantes (Pessoas)</span>
            </button>

            {onOpenFaceScanner && (
              <button
                onClick={onOpenFaceScanner}
                className="filter-chip special-ai-chip"
                title="Buscar Meu Rosto por Inteligência Artificial"
              >
                <Scan size={13} />
                <span>IA Face ID</span>
              </button>
            )}

            <button
              onClick={() => setSelectedFilter('vip')}
              className={`filter-chip ${selectedFilter === 'vip' ? 'active' : ''}`}
            >
              <Crown size={13} />
              <span>VIP & Destaques</span>
            </button>

            <button
              onClick={() => setSelectedFilter('festivais')}
              className={`filter-chip ${selectedFilter === 'festivais' ? 'active' : ''}`}
            >
              <Sparkles size={13} />
              <span>Festivais</span>
            </button>

            <button
              onClick={() => setSelectedFilter('sp')}
              className={`filter-chip ${selectedFilter === 'sp' ? 'active' : ''}`}
            >
              <MapPin size={12} />
              <span>São Paulo</span>
            </button>

            <button
              onClick={() => setSelectedFilter('rio')}
              className={`filter-chip ${selectedFilter === 'rio' ? 'active' : ''}`}
            >
              <MapPin size={12} />
              <span>Rio de Janeiro</span>
            </button>
          </div>
        </div>

        {/* 2. ⭕ Stories Tray Circular Logo Abaixo do Menu */}
        <InstagramStoriesTray
          currentUser={currentUser}
          stories={stories}
          onOpenStory={onOpenStory}
          onOpenUpload={onOpenUpload}
        />
      </div>

      {/* 3. 🔀 18 Mini Cards de Categorias (Recolhem e sobem com o scroll do Feed) */}
      <div className="feed-collapsible-categories-section">
        <div className="categories-section-header">
          <div className="categories-header-title">
            <Sparkles size={14} color="var(--accent-teal)" />
            <span>Categorias em Destaque (18 Canais)</span>
          </div>
          <button 
            onClick={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
            className="categories-toggle-btn"
            title={isCategoriesCollapsed ? 'Expandir 18 Cards' : 'Recolher 18 Cards'}
          >
            <span>{isCategoriesCollapsed ? 'Expandir 18 Cards' : 'Recolher'}</span>
            <ChevronDown 
              size={14} 
              style={{ 
                transform: isCategoriesCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', 
                transition: 'transform 0.25s ease' 
              }} 
            />
          </button>
        </div>

        {!isCategoriesCollapsed && (
          <PhotoCategoryAlternatingCards
            allPhotos={allPhotos}
            selectedCategory={selectedFilter as any}
            onSelectCategory={(cat) => setSelectedFilter(cat as any)}
            onOpenPhotoModal={onOpenPhotoModal}
          />
        )}
      </div>

      {/* 4. 👥 Flagrantes Showcase OU 📸 Feed de Capas dos Eventos */}
      {selectedFilter === 'flagrantes' ? (
        <div className="flagrantes-feed-showcase-section">
          <div className="flagrantes-section-header">
            <div>
              <h3 className="flagrantes-section-title">
                <Users size={18} color="var(--accent-teal)" />
                Flagrantes do meflagrou ({matchedFlagrantes.length} pessoas)
              </h3>
              <p className="flagrantes-section-subtitle">
                Explore os perfis, biometrias faciais e fotos de quem foi flagrado nas melhores baladas e festivais.
              </p>
            </div>
          </div>

          <div className="flagrantes-feed-cards-grid">
            {matchedFlagrantes.map((user) => (
              <div 
                key={user.id} 
                className="flagrante-feed-user-card"
                onClick={() => onSelectUser(user)}
              >
                <div className="flagrante-feed-avatar-wrap">
                  <img src={user.avatar} alt={user.name} className="flagrante-feed-avatar-img" />
                  {user.id === 'user_founder' ? (
                    <div className="flagrante-founder-badge" title="DEUS • Fundador">
                      <Crown size={11} color="#07080c" />
                    </div>
                  ) : (
                    <div className="flagrante-vip-badge">VIP</div>
                  )}
                </div>

                <div className="flagrante-feed-info">
                  <h4 className="flagrante-feed-name">{user.name}</h4>
                  <span className="flagrante-feed-handle">@{user.handle}</span>
                  <span className="flagrante-feed-location">
                    <MapPin size={11} /> {user.city}, {user.state}
                  </span>
                  <span className="flagrante-feed-stats-badge">
                    📸 {user.totalPhotosCount} Flagras • 🎟️ {user.eventsCount || 4} Festas
                  </span>
                </div>

                <button className="flagrante-feed-action-btn">
                  Ver Perfil
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="instagram-posts-stream">
          {filteredPhotos.length === 0 ? (
            <div className="feed-empty-state">
              <Search size={32} color="var(--text-muted)" />
              <p>Nenhum flagra encontrado para essa busca.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('todos');
                }}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 14px' }}
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            filteredPhotos.map((photo, index) => (
              <React.Fragment key={photo.id}>
                {/* Card de Capa do Evento (1080x1350) */}
                <InstagramPostCard
                  photo={photo}
                  allPhotos={allPhotos}
                  currentUser={currentUser}
                  onOpenPhotoModal={onOpenPhotoModal}
                  onSelectUser={onSelectUser}
                  onOpenStoryShare={onOpenStoryShare}
                />

                {/* ⚔️ Batalhas 1v1 Intercaladas a cada 4 posts */}
                {(index + 1) % 4 === 2 && (
                  <FeedBattleCard
                    battleIndex={Math.floor(index / 4)}
                    allPhotos={allPhotos}
                    onOpenBattle={onOpenBattle}
                  />
                )}

                {/* 🔲 Pares de Blocos (Retângulo + Quadrado) intercalados a cada 4 posts */}
                {(index + 1) % 4 === 0 && (
                  <FeedPairedBlocks
                    pairIndex={Math.floor(index / 4)}
                    allPhotos={allPhotos}
                    onOpenPhotoModal={onOpenPhotoModal}
                    onOpenRadar={onOpenRadar}
                    onOpenWhatsAppAlert={onOpenWhatsAppAlert}
                    onOpenVipHub={onOpenVipHub}
                  />
                )}
              </React.Fragment>
            ))
          )}
        </div>
      )}

      {/* 5. 🎛️ CONTROLE FLUTUANTE DE ROLAGEM AUTOMÁTICA (3s COM ENCAIXE PERFEITO) */}
      <div className="feed-autoscroll-floating-controller">
        <div className="autoscroll-pill-wrapper">
          {/* Progress Bar Line */}
          {isAutoScrollActive && !isHovered && (
            <div 
              className="autoscroll-progress-fill" 
              style={{ width: `${scrollProgress}%` }} 
            />
          )}

          {/* Toggle Play / Pause */}
          <button 
            onClick={handleToggleAutoScroll}
            className={`autoscroll-pill-btn ${isAutoScrollActive ? 'active' : ''}`}
            title={isAutoScrollActive ? 'Pausar Rolagem Automática' : 'Iniciar Rolagem Automática'}
          >
            {isAutoScrollActive && !isHovered ? (
              <Pause size={13} color="#07080c" />
            ) : (
              <Play size={13} color="var(--accent-teal)" />
            )}
          </button>

          {/* Status Label */}
          <div className="autoscroll-pill-info">
            <span className="autoscroll-pill-title">
              {isAutoScrollActive 
                ? isHovered 
                  ? 'Pausado (Cursor no Feed)' 
                  : `Bloco ${currentBlockIndex} de ${totalBlocks} • 3s`
                : 'Rolagem Manual'}
            </span>
            <span className="autoscroll-pill-desc">Encaixe perfeito na tela</span>
          </div>

          {/* Prev / Next Block Buttons */}
          <div className="autoscroll-pill-nav">
            <button 
              onClick={() => handleScrollBlock('prev')}
              className="pill-nav-arrow"
              title="Bloco anterior"
            >
              <ChevronUp size={14} />
            </button>
            <button 
              onClick={() => handleScrollBlock('next')}
              className="pill-nav-arrow"
              title="Próximo bloco"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
