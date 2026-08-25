import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  Maximize2, 
  Minimize2, 
  ShoppingBag, 
  Check, 
  Heart, 
  Search, 
  MapPin, 
  Calendar, 
  Camera, 
  FastForward
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto, UserProfile } from '../types';
import { useCart } from '../context/CartContext';
import { soundFx } from '../services/biometricService';

interface FullscreenPhotoSlideshowModalProps {
  isOpen: boolean;
  initialMode?: 'grid' | 'slideshow';
  initialPhoto?: EventPhoto | null;
  photos: EventPhoto[];
  currentUser?: UserProfile;
  onClose: () => void;
  onSelectUser?: (user: UserProfile) => void;
}

export const FullscreenPhotoSlideshowModal: React.FC<FullscreenPhotoSlideshowModalProps> = ({
  isOpen,
  initialMode = 'grid',
  initialPhoto,
  photos,
  onClose,
}) => {
  const { addToCart, isPhotoPurchased, openCart, getPhotoSaleConfig } = useCart();

  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slideSpeedMs, setSlideSpeedMs] = useState<number>(3500); // 3.5s per slide
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity] = useState<string>('todos');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtered photos list
  const displayPhotos = useMemo(() => {
    let list = photos;
    if (selectedCity !== 'todos') {
      list = list.filter((p) => p.city.toLowerCase().includes(selectedCity.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.eventName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.photographer.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.userName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [photos, selectedCity, searchQuery]);

  // Sync initial photo when modal opens
  useEffect(() => {
    if (initialPhoto && displayPhotos.length > 0) {
      const idx = displayPhotos.findIndex((p) => p.id === initialPhoto.id);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setViewMode(initialMode);
      }
    } else {
      setViewMode(initialMode);
    }
  }, [initialPhoto, initialMode, displayPhotos]);

  // Current active photo in slideshow
  const activePhoto = displayPhotos[currentIndex] || displayPhotos[0];

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (displayPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
    setSlideProgress(0);
    soundFx.playRadarTick();
  }, [displayPhotos.length]);

  const handlePrev = useCallback(() => {
    if (displayPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
    setSlideProgress(0);
    soundFx.playRadarTick();
  }, [displayPhotos.length]);

  // ⏱️ Auto-Play Slideshow Engine
  useEffect(() => {
    if (!isOpen || viewMode !== 'slideshow' || !isPlaying || displayPhotos.length <= 1) {
      setSlideProgress(0);
      return;
    }

    const intervalTime = 50; // Update progress bar every 50ms
    const step = (intervalTime / slideSpeedMs) * 100;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, viewMode, isPlaying, slideSpeedMs, displayPhotos.length, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'slideshow') {
          setViewMode('grid');
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key.toLowerCase() === 'g') {
        setViewMode((prev) => (prev === 'grid' ? 'slideshow' : 'grid'));
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, handleNext, handlePrev, onClose]);

  // Auto-hide controls when idle in slideshow
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (viewMode === 'slideshow' && isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleOpenPhotoInSlide = (index: number) => {
    setCurrentIndex(index);
    setViewMode('slideshow');
    setIsPlaying(true);
    setSlideProgress(0);
    soundFx.playLandmarkLock();
  };

  const toggleLike = (photoId: string) => {
    setLikedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
        soundFx.playUnlockSuccess();
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#ff007a', '#00f5d4'],
        });
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fullscreen-modal-root"
      onMouseMove={handleMouseMove}
    >
      {/* ========================================================================= */}
      {/* 🖼️ 1. MODO GRADE DE MINIATURAS EM TELA TODA (FULLSCREEN GRID MOSAIC) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' ? (
        <div className="fullscreen-grid-container">
          
          {/* Top Bar Header */}
          <div className="fullscreen-grid-header">
            <div className="fullscreen-grid-title-row">
              <div className="fullscreen-badge-icon">
                <LayoutGrid size={20} color="var(--accent-teal)" />
              </div>
              <div>
                <h2 className="fullscreen-grid-title">
                  Galeria em Tela Cheia • Mosaico de Flagrantes
                </h2>
                <p className="fullscreen-grid-subtitle">
                  {displayPhotos.length} fotos disponíveis • Clique em qualquer miniatura para iniciar o <strong>Slideshow em Tela Toda</strong>
                </p>
              </div>
            </div>

            {/* Actions & Filters */}
            <div className="fullscreen-grid-controls">
              {/* Search input */}
              <div className="fullscreen-search-box">
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar festa, local ou fotógrafo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="fullscreen-search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="fullscreen-clear-btn">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Start Slideshow Button */}
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setViewMode('slideshow');
                  setIsPlaying(true);
                  soundFx.playScanSweep();
                }}
                className="fullscreen-start-slide-btn"
                title="Iniciar Slideshow Automático"
              >
                <Play size={16} fill="currentColor" />
                Iniciar Slideshow
              </button>

              {/* Close Button */}
              <button onClick={onClose} className="fullscreen-close-btn" title="Fechar">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mosaic Grid of Responsive Thumbnails */}
          <div className="fullscreen-thumbnails-masonry">
            {displayPhotos.map((p, idx) => {
              const isPurchased = isPhotoPurchased(p.id);
              const saleConfig = getPhotoSaleConfig(p);

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenPhotoInSlide(idx)}
                  className="fullscreen-thumb-tile group"
                  title={`${p.eventName} (Clique para ver no Slideshow)`}
                >
                  <img
                    src={p.url}
                    alt={p.eventName}
                    loading="lazy"
                    className="fullscreen-thumb-img"
                  />

                  {/* Neon Glow Hover Overlay */}
                  <div className="fullscreen-thumb-overlay">
                    <div className="fullscreen-thumb-top-badges">
                      <span className="fullscreen-pill-event">
                        {p.eventName}
                      </span>
                      {isPurchased && (
                        <span className="fullscreen-pill-purchased">
                          <Check size={12} /> Comprada
                        </span>
                      )}
                    </div>

                    <div className="fullscreen-thumb-bottom-row">
                      <div className="fullscreen-thumb-photog">
                        <Camera size={12} color="var(--accent-teal)" />
                        <span>{p.photographer.name}</span>
                      </div>
                      <span className="fullscreen-thumb-price">
                        R$ {saleConfig.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Play Slide Hover Indicator */}
                    <div className="fullscreen-thumb-play-center">
                      <Play size={26} fill="var(--accent-teal)" color="var(--accent-teal)" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 🎬 2. MODO APRESENTAÇÃO SLIDESHOW CONTÍNUO EM TELA CHEIA (100% FULLSCREEN) */
        /* ========================================================================= */
        <div className="fullscreen-slideshow-container">
          
          {/* Top Progress Bar */}
          <div className="fullscreen-progress-track">
            <div 
              className="fullscreen-progress-fill" 
              style={{ width: `${slideProgress}%` }} 
            />
          </div>

          {/* Active Photo Background & Main Image with Ken Burns animation */}
          <div className="fullscreen-slide-stage">
            <div 
              className="fullscreen-slide-blur-backdrop"
              style={{ backgroundImage: `url(${activePhoto?.url})` }}
            />

            <img
              key={activePhoto?.id}
              src={activePhoto?.url}
              alt={activePhoto?.eventName}
              className={`fullscreen-slide-main-image ${isPlaying ? 'ken-burns-active' : ''}`}
            />
          </div>

          {/* Left / Right Navigation Touch/Click Zones & Arrows */}
          <button 
            onClick={handlePrev} 
            className={`fullscreen-arrow-nav left ${showControls ? 'visible' : ''}`}
            title="Foto Anterior (Seta Esquerda)"
          >
            <ChevronLeft size={36} />
          </button>

          <button 
            onClick={handleNext} 
            className={`fullscreen-arrow-nav right ${showControls ? 'visible' : ''}`}
            title="Próxima Foto (Seta Direita)"
          >
            <ChevronRight size={36} />
          </button>

          {/* Floating Top Controls Header */}
          <div className={`fullscreen-slide-top-bar ${showControls ? 'visible' : ''}`}>
            {/* Event & Photographer Info */}
            <div className="fullscreen-slide-info">
              <span className="fullscreen-slide-event-badge">
                {activePhoto?.eventName}
              </span>
              <div className="fullscreen-slide-meta-row">
                <span className="fullscreen-meta-item">
                  <MapPin size={13} color="var(--accent-teal)" />
                  {activePhoto?.location} • {activePhoto?.city}
                </span>
                <span className="fullscreen-meta-item">
                  <Calendar size={13} color="var(--accent-gold)" />
                  {activePhoto?.eventDate}
                </span>
                <span className="fullscreen-meta-item">
                  <Camera size={13} color="var(--accent-pink)" />
                  {activePhoto?.photographer.name}
                </span>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="fullscreen-slide-top-actions">
              {/* Switch to Grid View */}
              <button
                onClick={() => {
                  setViewMode('grid');
                  setIsPlaying(false);
                  soundFx.playRadarTick();
                }}
                className="fullscreen-icon-action-btn"
                title="Ver Todas as Miniaturas em Grade (G)"
              >
                <LayoutGrid size={20} />
                <span className="btn-text-desktop">Grade</span>
              </button>

              {/* Fullscreen HTML5 API Toggle */}
              <button
                onClick={toggleFullscreen}
                className="fullscreen-icon-action-btn"
                title="Tela Cheia (F)"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="fullscreen-icon-action-btn close"
                title="Fechar (Esc)"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Floating Bottom Controls Player Bar */}
          <div className={`fullscreen-slide-bottom-bar ${showControls ? 'visible' : ''}`}>
            
            {/* Left: Counter & Like */}
            <div className="fullscreen-bottom-left">
              <span className="fullscreen-slide-counter">
                {currentIndex + 1} / {displayPhotos.length}
              </span>

              <button
                onClick={() => activePhoto && toggleLike(activePhoto.id)}
                className={`fullscreen-like-btn ${likedPhotos.has(activePhoto?.id) ? 'liked' : ''}`}
                title="Curtir foto"
              >
                <Heart size={20} fill={likedPhotos.has(activePhoto?.id) ? '#ff007a' : 'none'} />
                <span>{(activePhoto?.likesCount || 0) + (likedPhotos.has(activePhoto?.id) ? 1 : 0)}</span>
              </button>
            </div>

            {/* Center: Play/Pause, Speed & Controls */}
            <div className="fullscreen-player-controls">
              <button
                onClick={handlePrev}
                className="fullscreen-player-btn"
                title="Foto Anterior (⬅️)"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => {
                  setIsPlaying((prev) => !prev);
                  soundFx.playRadarTick();
                }}
                className="fullscreen-play-pause-circle"
                title={isPlaying ? 'Pausar Slideshow (Espaço)' : 'Continuar Slideshow (Espaço)'}
              >
                {isPlaying ? (
                  <Pause size={24} fill="#07080c" />
                ) : (
                  <Play size={24} fill="#07080c" style={{ marginLeft: 3 }} />
                )}
              </button>

              <button
                onClick={handleNext}
                className="fullscreen-player-btn"
                title="Próxima Foto (➡️)"
              >
                <ChevronRight size={24} />
              </button>

              {/* Speed Switcher */}
              <div className="fullscreen-speed-selector">
                <FastForward size={14} color="var(--accent-teal)" />
                <select
                  value={slideSpeedMs}
                  onChange={(e) => setSlideSpeedMs(Number(e.target.value))}
                  className="fullscreen-speed-select"
                >
                  <option value={2000}>2.0s (Rápido)</option>
                  <option value={3500}>3.5s (Padrão)</option>
                  <option value={5000}>5.0s (Lento)</option>
                </select>
              </div>
            </div>

            {/* Right: Buy Photo & Tagged People */}
            <div className="fullscreen-bottom-right">
              {activePhoto && (
                <button
                  onClick={() => {
                    addToCart(activePhoto, 'single_hd');
                    openCart();
                    soundFx.playUnlockSuccess();
                  }}
                  className="fullscreen-buy-btn"
                  title="Comprar Foto Digital HD"
                >
                  <ShoppingBag size={18} />
                  <span>Comprar • R$ {getPhotoSaleConfig(activePhoto).price.toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
