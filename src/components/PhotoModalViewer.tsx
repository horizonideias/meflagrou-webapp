import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Film, 
  ShoppingBag, 
  CheckCircle2, 
  Crown, 
  Share2, 
  Sliders, 
  Send, 
  MessageCircle,
  UserPlus,
  Lock,
  Camera,
  ShieldAlert,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Box,
  Layers,
  Disc,
  LayoutGrid,
  Scan
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto, UserProfile } from '../types';
import { StoryGeneratorModal } from './StoryGeneratorModal';
import { MagazineCoverStudio } from './MagazineCoverStudio';
import { PhotographerHireModal } from './PhotographerHireModal';
import { MotionVideoModal } from './MotionVideoModal';
import { DirectSaleModal } from './DirectSaleModal';
import { AuthenticityCertificateModal } from './AuthenticityCertificateModal';
import { StoryShareModal } from './StoryShareModal';
import { PhotoPrivacyRemovalModal } from './PhotoPrivacyRemovalModal';
import { haptics } from '../utils/haptics';
import { 
  FILM_PRESETS, 
  extractPhotoColorPalette, 
  type FilmPreset 
} from '../services/colorGradeEngine';
import { ambientSound } from '../services/ambientSoundscape';
import { soundFx } from '../services/biometricService';
import { useCart } from '../context/CartContext';

export type View3DMode = 'coverflow' | 'stage' | 'cylinder' | 'grid';

interface PhotoModalViewerProps {
  photo: EventPhoto;
  photosList: EventPhoto[];
  currentUser: UserProfile;
  onClose: () => void;
  onSelectUserByTag?: (userId: string) => void;
  onPhotoChange: (photo: EventPhoto) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  initial3DMode?: View3DMode;
}

export const PhotoModalViewer: React.FC<PhotoModalViewerProps> = ({
  photo,
  photosList,
  currentUser,
  onClose,
  onPhotoChange,
  onUpdateAvatar,
  initial3DMode = 'coverflow',
}) => {
  const { 
    addToCart, 
    isPhotoPurchased, 
    openCheckout, 
    getPhotoSaleConfig,
    setPhotoSaleConfig,
    addPhotoToUserProfile,
    removePhotoFromUserProfile,
    isPhotoInUserProfile,
  } = useCart();

  const isPurchased = isPhotoPurchased(photo.id);
  const saleConfig = getPhotoSaleConfig(photo);

  // 🎛️ 3D View Mode State
  const [view3DMode, setView3DMode] = useState<View3DMode>(initial3DMode);
  const [isFaceMesh3DActive, setIsFaceMesh3DActive] = useState<boolean>(true);
  const [isAutoPlaySlideshow, setIsAutoPlaySlideshow] = useState<boolean>(false);
  const [slideSpeedMs] = useState<number>(3500);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);

  // ⏱️ Delayed overlay control
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showSideDrawer, setShowSideDrawer] = useState<'none' | 'comments' | 'studio' | 'info'>('none');

  // Zoom & Film state
  const [isLiked, setIsLiked] = useState<boolean>(photo.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(photo.likesCount);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedFilm, setSelectedFilm] = useState<FilmPreset>(FILM_PRESETS[1]);

  // Parallax Gyro 3D Tilt State
  const [tiltTransform, setTiltTransform] = useState<{ rx: number; ry: number; lx: number; ly: number }>({
    rx: 0,
    ry: 0,
    lx: 50,
    ly: 50,
  });

  // Profile status
  const [isAddedToProfile, setIsAddedToProfile] = useState<boolean>(() => {
    return isPhotoInUserProfile(photo.id, currentUser.id);
  });

  useEffect(() => {
    setIsAddedToProfile(isPhotoInUserProfile(photo.id, currentUser.id));
  }, [photo.id, currentUser.id, isPhotoInUserProfile]);

  // Sub-Modals
  const [isStoryShareOpen, setIsStoryShareOpen] = useState<boolean>(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isMagazineModalOpen, setIsMagazineModalOpen] = useState<boolean>(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState<boolean>(false);
  const [isMotionModalOpen, setIsMotionModalOpen] = useState<boolean>(false);
  const [isDirectSaleOpen, setIsDirectSaleOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isPrivacyRemovalOpen, setIsPrivacyRemovalOpen] = useState<boolean>(false);

  // Comments
  const [photoComments, setPhotoComments] = useState<{
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
  }[]>([
    {
      id: 'c1',
      userName: 'Sophia Valente',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'A experiência 3D desse flagra ficou surreal! Parece que estamos dentro da festa! 🔥',
      timestamp: 'há 5 min',
    },
    {
      id: 'c2',
      userName: 'Meflagrou Oficial',
      userAvatar: '/founder_avatar.jpg',
      text: 'Cobertura oficial 8K Ultra HD com Biometria 3D FaceMesh 👑📸',
      timestamp: 'há 18 min',
    }
  ]);
  const [commentInput, setCommentInput] = useState<string>('');

  const currentIndex = useMemo(() => {
    const idx = photosList.findIndex((p) => p.id === photo.id);
    return idx >= 0 ? idx : 0;
  }, [photosList, photo.id]);

  const colorPalette = useMemo(() => extractPhotoColorPalette(photo.id), [photo.id]);

  // 🎯 Navigation Handlers
  const handleNextPhoto = useCallback(() => {
    if (photosList.length === 0) return;
    const nextIdx = (currentIndex + 1) % photosList.length;
    onPhotoChange(photosList[nextIdx]);
    setSlideProgress(0);
    soundFx.playRadarTick();
  }, [currentIndex, photosList, onPhotoChange]);

  const handlePrevPhoto = useCallback(() => {
    if (photosList.length === 0) return;
    const prevIdx = (currentIndex - 1 + photosList.length) % photosList.length;
    onPhotoChange(photosList[prevIdx]);
    setSlideProgress(0);
    soundFx.playRadarTick();
  }, [currentIndex, photosList, onPhotoChange]);

  // ⏱️ Auto-Play 3D Slideshow Engine
  useEffect(() => {
    if (!isAutoPlaySlideshow || photosList.length <= 1) {
      setSlideProgress(0);
      return;
    }

    const intervalTime = 50;
    const step = (intervalTime / slideSpeedMs) * 100;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          handleNextPhoto();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaySlideshow, slideSpeedMs, photosList.length, handleNextPhoto]);

  // 🎮 Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        ambientSound.stop();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaySlideshow((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        handleToggleBrowserFullscreen();
      } else if (e.key.toLowerCase() === 'h') {
        setIsFaceMesh3DActive((prev) => !prev);
        soundFx.playRadarTick();
      } else if (e.key === '1') {
        setView3DMode('coverflow');
      } else if (e.key === '2') {
        setView3DMode('stage');
      } else if (e.key === '3') {
        setView3DMode('cylinder');
      } else if (e.key === '4') {
        setView3DMode('grid');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ambientSound.stop();
    };
  }, [handlePrevPhoto, handleNextPhoto, onClose]);

  // 🖱️ 3D Parallax Mouse Tracking
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -16;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 16;

    setTiltTransform({
      rx: rotateX,
      ry: rotateY,
      lx: percentX,
      ly: percentY,
    });
  };

  const handleStageMouseLeave = () => {
    setTiltTransform({ rx: 0, ry: 0, lx: 50, ly: 50 });
  };

  // 👆 Touch Swipe Gestures
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNextPhoto();
      } else {
        handlePrevPhoto();
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      setIsLiked(true);
      setLikesCount((c) => c + 1);
      soundFx.playRadarTick();
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.8 },
        colors: ['#ff007a', '#00f5d4', '#ffb703'],
      });
      showToast('Adicionado aos seus flagras favoritos! ❤️');
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    soundFx.playRadarTick();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00f5d4', '#ff007a'],
    });
    showToast('Baixando foto original em Ultra HD 8K...');

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = photo.highResUrl || photo.url;
      link.target = '_blank';
      link.download = `meflagrou_${photo.eventName.toLowerCase().replace(/\s+/g, '_')}_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    }, 800);
  };

  const handleToggleAddToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isAddedToProfile) {
      removePhotoFromUserProfile(photo.id, currentUser.id);
      setIsAddedToProfile(false);
      soundFx.playRadarTick();
      showToast('Foto removida do seu perfil.');
    } else {
      addPhotoToUserProfile(photo, currentUser);
      setIsAddedToProfile(true);
      soundFx.playUnlockSuccess();
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#ff007a', '#25d366', '#ffb703'],
      });
      showToast('🎉 Foto adicionada com sucesso ao seu Perfil!');
    }
  };

  const handleBuyNow = () => {
    addToCart(photo, 'single_hd');
    openCheckout();
  };

  const handleToggleSoundscape = () => {
    if (isPlayingAudio) {
      ambientSound.stop();
      setIsPlayingAudio(false);
      showToast('Som ambiente desativado.');
    } else {
      const mode = photo.eventName.toLowerCase().includes('sunset') 
        ? 'sunset' 
        : (photo.eventName.toLowerCase().includes('copa') ? 'lounge' : 'club');
      ambientSound.playMode(mode);
      setIsPlayingAudio(true);
      showToast(`Tocando atmosfera sonora 3D de ${photo.eventName} 🎧`);
    }
  };

  const handleToggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsBrowserFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsBrowserFullscreen(false)).catch(() => {});
      }
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setPhotoComments([
      ...photoComments,
      {
        id: String(Date.now()),
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: commentInput.trim(),
        timestamp: 'agora mesmo',
      }
    ]);
    setCommentInput('');
    soundFx.playRadarTick();
  };

  // 3D Coverflow Visible Slice Calculation
  const coverflowVisiblePhotos = useMemo(() => {
    const radius = 4; // -4 to +4 items around active
    const result: Array<{ photo: EventPhoto; offset: number; index: number }> = [];
    for (let offset = -radius; offset <= radius; offset++) {
      const idx = currentIndex + offset;
      if (idx >= 0 && idx < photosList.length) {
        result.push({ photo: photosList[idx], offset, index: idx });
      }
    }
    return result;
  }, [currentIndex, photosList]);

  return (
    <>
      <div 
        className="modal-3d-fullscreen-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fullscreen-toast">
            <Check size={16} color="#07080c" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. 🌌 3D SPATIAL STAGE ENVIRONMENT */}
        <div 
          className={`modal-3d-stage-container mode-${view3DMode}`}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          onClick={() => setShowOverlays((prev) => !prev)}
        >
          {/* Reactive Ambient Glow Backdrop */}
          <div 
            className="modal-3d-ambient-glow"
            style={{
              background: `radial-gradient(circle at ${tiltTransform.lx}% ${tiltTransform.ly}%, ${colorPalette[0]?.hex || 'var(--accent-teal)'}33 0%, rgba(121, 40, 202, 0.15) 45%, transparent 75%)`
            }}
          />

          {/* 🌀 MODO 1: 3D COVERFLOW (CARROSSEL COM PROFUNDIDADE Z E ROTAÇÃO Y) */}
          {view3DMode === 'coverflow' && (
            <div className="coverflow-3d-track">
              {coverflowVisiblePhotos.map(({ photo: p, offset, index }) => {
                const isCenter = offset === 0;
                const absOffset = Math.abs(offset);
                const rotateY = isCenter ? tiltTransform.ry : offset < 0 ? 50 : -50;
                const rotateX = isCenter ? tiltTransform.rx : 0;
                const translateZ = isCenter ? 120 : -180 * absOffset;
                const translateX = offset * 230;
                const opacity = Math.max(0.25, 1 - absOffset * 0.2);
                const scale = isCenter ? 1.05 : Math.max(0.72, 1 - absOffset * 0.1);

                return (
                  <div
                    key={p.id}
                    className={`coverflow-3d-card ${isCenter ? 'active-center' : ''}`}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                      opacity,
                      zIndex: 100 - absOffset,
                      filter: isCenter ? selectedFilm.cssFilter : 'brightness(0.65) saturate(0.8)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCenter) {
                        onPhotoChange(photosList[index]);
                        soundFx.playRadarTick();
                      }
                    }}
                  >
                    <img 
                      src={isCenter ? (p.highResUrl || p.url) : p.url} 
                      alt={p.eventName} 
                      className="coverflow-card-img"
                    />

                    {/* 🛡️ Anti-Print & Watermark Shield */}
                    {!isPurchased && isCenter && (
                      <div className="mobile-anti-print-watermark-overlay" aria-hidden="true">
                        <div className="anti-print-watermark-center">
                          <Lock size={16} />
                          <span>meflagrou.com • 3D PRO</span>
                        </div>
                      </div>
                    )}

                    {/* 🤖 HUD Biométrico 3D FaceMesh */}
                    {isCenter && isFaceMesh3DActive && p.tags && p.tags.length > 0 && (
                      <div className="biometric-3d-facemesh-overlay">
                        <div className="facemesh-scanner-beam" />
                        {p.tags.map((tag, tIdx) => {
                          const posX = tag.boundingBox ? tag.boundingBox.x : 50;
                          const posY = tag.boundingBox ? tag.boundingBox.y : 50;
                          return (
                            <div 
                              key={tIdx} 
                              className="facemesh-3d-face-box"
                              style={{
                                left: `${posX}%`,
                                top: `${posY}%`,
                              }}
                            >
                              <div className="facemesh-wireframe-bracket top-left" />
                              <div className="facemesh-wireframe-bracket top-right" />
                              <div className="facemesh-wireframe-bracket bottom-left" />
                              <div className="facemesh-wireframe-bracket bottom-right" />
                              <div className="facemesh-3d-points-matrix">
                                {[...Array(9)].map((_, ptIdx) => (
                                  <span key={ptIdx} className="facemesh-mesh-dot" />
                                ))}
                              </div>
                              <div className="facemesh-3d-tag-badge">
                                <Scan size={10} color="#00f5d4" />
                                <span>{tag.userName} ({Math.round(tag.confidence * 100)}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Hologram Floor Mirror Reflection */}
                    <div className="photo-3d-floor-reflection">
                      <img src={p.url} alt="" className="reflection-img" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 🎭 MODO 2: 3D CINEMA STAGE (IMAX COM GYRO-PARALLAX E LUZ ESPECULAR) */}
          {view3DMode === 'stage' && (
            <div 
              className="cinema-3d-stage-wrapper"
              style={{
                transform: `perspective(1100px) rotateX(${tiltTransform.rx}deg) rotateY(${tiltTransform.ry}deg)`,
                filter: selectedFilm.cssFilter,
              }}
            >
              <img 
                src={photo.highResUrl || photo.url} 
                alt={photo.eventName} 
                className="cinema-stage-main-img"
              />

              {/* Dynamic Specular Lens Sheen */}
              <div 
                className="cinema-specular-light"
                style={{
                  background: `radial-gradient(circle at ${tiltTransform.lx}% ${tiltTransform.ly}%, rgba(255,255,255,0.22) 0%, rgba(0,245,212,0.12) 30%, transparent 65%)`
                }}
              />

              {/* 🛡️ Watermark */}
              {!isPurchased && (
                <div className="mobile-anti-print-watermark-overlay" aria-hidden="true">
                  <div className="anti-print-watermark-center">
                    <Lock size={18} />
                    <span>meflagrou.com • FOTO OFICIAL 8K</span>
                  </div>
                </div>
              )}

              {/* 🤖 HUD Biométrico 3D FaceMesh */}
              {isFaceMesh3DActive && photo.tags && photo.tags.length > 0 && (
                <div className="biometric-3d-facemesh-overlay">
                  <div className="facemesh-scanner-beam" />
                  {photo.tags.map((tag, tIdx) => {
                    const posX = tag.boundingBox ? tag.boundingBox.x : 50;
                    const posY = tag.boundingBox ? tag.boundingBox.y : 50;
                    return (
                      <div 
                        key={tIdx} 
                        className="facemesh-3d-face-box"
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                        }}
                      >
                        <div className="facemesh-wireframe-bracket top-left" />
                        <div className="facemesh-wireframe-bracket top-right" />
                        <div className="facemesh-wireframe-bracket bottom-left" />
                        <div className="facemesh-wireframe-bracket bottom-right" />
                        <div className="facemesh-3d-points-matrix">
                          {[...Array(12)].map((_, ptIdx) => (
                            <span key={ptIdx} className="facemesh-mesh-dot" />
                          ))}
                        </div>
                        <div className="facemesh-3d-tag-badge">
                          <Scan size={11} color="#00f5d4" />
                          <span>{tag.userName} • {Math.round(tag.confidence * 100)}% Match</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floor Reflection */}
              <div className="photo-3d-floor-reflection">
                <img src={photo.url} alt="" className="reflection-img" />
              </div>
            </div>
          )}

          {/* 🎡 MODO 3: 3D CYLINDER WHEEL (CARROSSEL CIRCULAR EM ÓRBITA 3D) */}
          {view3DMode === 'cylinder' && (
            <div className="cylinder-3d-carousel-scene">
              <div 
                className="cylinder-3d-ring"
                style={{
                  transform: `rotateY(${-currentIndex * (360 / Math.min(16, photosList.length))}deg) rotateX(${tiltTransform.rx * 0.4}deg)`
                }}
              >
                {photosList.slice(0, 16).map((p, pIdx) => {
                  const total = Math.min(16, photosList.length);
                  const angle = pIdx * (360 / total);
                  const isCurrent = p.id === photo.id;

                  return (
                    <div
                      key={p.id}
                      className={`cylinder-3d-panel ${isCurrent ? 'active' : ''}`}
                      style={{
                        transform: `rotateY(${angle}deg) translateZ(420px)`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPhotoChange(p);
                        soundFx.playRadarTick();
                      }}
                    >
                      <img src={p.url} alt={p.eventName} className="cylinder-panel-img" />
                      <div className="cylinder-panel-caption">
                        <span>{p.eventName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🧱 MODO 4: 3D SPATIAL GRID (MOSAICO 3D TRIDIMENSIONAL) */}
          {view3DMode === 'grid' && (
            <div className="grid-3d-matrix-scene no-scrollbar">
              <div 
                className="grid-3d-matrix-plane"
                style={{
                  transform: `perspective(1200px) rotateX(18deg) rotateY(${tiltTransform.ry * 0.3}deg) scale(0.95)`
                }}
              >
                {photosList.map((p, pIdx) => {
                  const isCurrent = p.id === photo.id;
                  return (
                    <div
                      key={p.id}
                      className={`grid-3d-card ${isCurrent ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPhotoChange(p);
                        setView3DMode('coverflow');
                        soundFx.playRadarTick();
                      }}
                    >
                      <img src={p.url} alt={p.eventName} className="grid-3d-img" />
                      <div className="grid-3d-overlay">
                        <span className="grid-3d-title">{p.eventName}</span>
                        <span className="grid-3d-sub">{p.city} • #{pIdx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Floating Side Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPhoto();
            }}
            className="modal-3d-arrow left"
            title="Foto anterior (Seta esquerda)"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextPhoto();
            }}
            className="modal-3d-arrow right"
            title="Próxima foto (Seta direita)"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* 2. 🎛️ FLOATING TOP 3D CONTROLLER BAR */}
        <header className={`modal-3d-top-bar ${showOverlays ? 'visible' : ''}`}>
          {/* Left: Author, Event & Mode Selector */}
          <div className="modal-3d-top-left">
            <img 
              src={photo.photographer.avatar} 
              alt={photo.photographer.name} 
              className="modal-3d-author-avatar"
            />
            <div className="modal-3d-meta-wrap">
              <div className="modal-3d-title-row">
                <span className="modal-3d-author-name">{photo.photographer.name}</span>
                <span className="modal-3d-badge-3d">
                  <Box size={11} />
                  <span>3D SPACE</span>
                </span>
                <span className="modal-3d-counter-pill">
                  {currentIndex + 1} / {photosList.length}
                </span>
              </div>
              <div className="modal-3d-event-row">
                <MapPin size={11} color="var(--accent-teal)" />
                <span>{photo.eventName} • {photo.city}</span>
              </div>
            </div>
          </div>

          {/* Center: 4 Modos 3D Switches */}
          <div className="modal-3d-mode-switcher">
            <button
              onClick={() => { setView3DMode('coverflow'); soundFx.playRadarTick(); }}
              className={`mode-3d-chip ${view3DMode === 'coverflow' ? 'active' : ''}`}
              title="Modo 1: 3D Coverflow (Atalho 1)"
            >
              <Layers size={13} />
              <span>Coverflow 3D</span>
            </button>

            <button
              onClick={() => { setView3DMode('stage'); soundFx.playRadarTick(); }}
              className={`mode-3d-chip ${view3DMode === 'stage' ? 'active' : ''}`}
              title="Modo 2: Palco IMAX 3D Cinema (Atalho 2)"
            >
              <Box size={13} />
              <span>Cinema 3D</span>
            </button>

            <button
              onClick={() => { setView3DMode('cylinder'); soundFx.playRadarTick(); }}
              className={`mode-3d-chip ${view3DMode === 'cylinder' ? 'active' : ''}`}
              title="Modo 3: Cilindro Orbital 3D (Atalho 3)"
            >
              <Disc size={13} />
              <span>Cilindro 3D</span>
            </button>

            <button
              onClick={() => { setView3DMode('grid'); soundFx.playRadarTick(); }}
              className={`mode-3d-chip ${view3DMode === 'grid' ? 'active' : ''}`}
              title="Modo 4: Mosaico Espacial 3D (Atalho 4)"
            >
              <LayoutGrid size={13} />
              <span>Mosaico 3D</span>
            </button>
          </div>

          {/* Right: Actions, Biometrics, Audio, Fullscreen, Close */}
          <div className="modal-3d-top-right">
            {/* HUD Biométrico 3D FaceMesh Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFaceMesh3DActive(!isFaceMesh3DActive);
                soundFx.playRadarTick();
                showToast(isFaceMesh3DActive ? 'HUD Biométrico 3D desativado.' : 'HUD Biométrico 3D FaceMesh ativado!');
              }}
              className={`modal-3d-icon-btn ${isFaceMesh3DActive ? 'active-hud' : ''}`}
              title="Alternar HUD Biométrico 3D FaceMesh (Atalho H)"
            >
              <Scan size={16} color={isFaceMesh3DActive ? '#00f5d4' : 'currentColor'} />
              <span className="btn-label-desktop">IA FaceMesh</span>
            </button>

            {/* Slideshow Auto-Play Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoPlaySlideshow(!isAutoPlaySlideshow);
                soundFx.playRadarTick();
              }}
              className={`modal-3d-icon-btn ${isAutoPlaySlideshow ? 'active-play' : ''}`}
              title="Auto-Play Slideshow 3D (Espaço)"
            >
              {isAutoPlaySlideshow ? <Pause size={16} fill="#00f5d4" color="#00f5d4" /> : <Play size={16} />}
              <span className="btn-label-desktop">{isAutoPlaySlideshow ? 'Pausar' : 'Play 3D'}</span>
            </button>

            {/* Soundscape Ambience Audio */}
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleSoundscape(); }}
              className={`modal-3d-icon-btn ${isPlayingAudio ? 'active-audio' : ''}`}
              title="Atmosfera Sonora 3D da Balada"
            >
              {isPlayingAudio ? <Volume2 size={16} color="var(--accent-teal)" /> : <VolumeX size={16} />}
            </button>

            {/* Browser Native Fullscreen */}
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleBrowserFullscreen(); }}
              className="modal-3d-icon-btn"
              title="Alternar Tela Cheia Nativa (Atalho F)"
            >
              {isBrowserFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                ambientSound.stop();
                onClose();
              }}
              className="modal-3d-close-btn"
              title="Fechar Visualizador 3D (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* 3. ⏳ NEON PROGRESS BAR (SLIDESHOW) */}
        {isAutoPlaySlideshow && (
          <div className="modal-3d-slideshow-progress-bar">
            <div className="slideshow-progress-fill" style={{ width: `${slideProgress}%` }} />
          </div>
        )}

        {/* 4. 📌 FLOATING BOTTOM 3D ACTION BAR & THUMBNAILS RIBBON */}
        <footer className={`modal-3d-bottom-bar ${showOverlays ? 'visible' : ''}`}>
          {/* Mini 3D Thumbnails Ribbon Strip */}
          <div className="modal-3d-thumbnails-ribbon no-scrollbar">
            {photosList.map((p, idx) => {
              const isSelected = p.id === photo.id;
              return (
                <div
                  key={p.id}
                  className={`ribbon-thumb-item ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhotoChange(p);
                    soundFx.playRadarTick();
                  }}
                  title={`Foto ${idx + 1}: ${p.eventName}`}
                >
                  <img src={p.url} alt="" className="ribbon-thumb-img" />
                  {isSelected && <div className="ribbon-active-indicator" />}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="modal-3d-action-row">
            {/* Left: Event & Resolution Info */}
            <div className="bottom-left-info">
              <span className="info-title">{photo.eventName}</span>
              <div className="info-meta-chips">
                <span className="info-chip"><Calendar size={11} /> {photo.eventDate}</span>
                <span className="info-chip"><Clock size={11} /> {photo.time}</span>
                <span className="info-chip highlight"><Sparkles size={11} /> 8K Ultra HD</span>
              </div>
            </div>

            {/* Center: Buy HD / Download Button (Split 90/9/1%) */}
            <div className="bottom-center-cta">
              {isPurchased ? (
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="modal-3d-buy-btn purchased"
                  title="Baixar arquivo original de alta resolução"
                >
                  <Download size={16} />
                  <span>{isDownloading ? 'Baixando...' : 'Baixar Foto Original 8K'}</span>
                </button>
              ) : (
                <button 
                  onClick={handleBuyNow}
                  className="modal-3d-buy-btn"
                  title="Comprar foto em Ultra HD sem marca d'água com PIX"
                >
                  <ShoppingBag size={16} />
                  <span>Comprar Foto 8K • R$ {saleConfig.price.toFixed(2).replace('.', ',')}</span>
                </button>
              )}
            </div>

            {/* Right: Interaction Pills */}
            <div className="bottom-right-tools">
              {/* Usar como Foto de Perfil quando comprada */}
              {isPurchased && onUpdateAvatar && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateAvatar(photo.url);
                    showToast('✨ Foto definida como seu avatar oficial!');
                  }}
                  className="modal-3d-tool-pill highlight-story"
                  title="Definir esta foto comprada como seu avatar de perfil oficial"
                >
                  <Camera size={16} color="var(--accent-cyan)" />
                  <span>Avatar</span>
                </button>
              )}

              {/* Adicionar ao Meu Perfil */}
              <button 
                onClick={handleToggleAddToProfile}
                className={`modal-3d-tool-pill ${isAddedToProfile ? 'added' : ''}`}
                title={isAddedToProfile ? 'Foto salva no seu perfil' : 'Adicionar foto ao meu perfil'}
              >
                {isAddedToProfile ? <CheckCircle2 size={16} color="#00f5d4" /> : <UserPlus size={16} color="var(--accent-teal)" />}
                <span>{isAddedToProfile ? 'No Perfil' : 'Salvar Perfil'}</span>
              </button>

              {/* Curtir */}
              <button 
                onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
                className={`modal-3d-tool-pill ${isLiked ? 'liked' : ''}`}
                title="Curtir foto"
              >
                <Heart size={16} fill={isLiked ? '#ff007a' : 'none'} color={isLiked ? '#ff007a' : 'currentColor'} />
                <span>{likesCount}</span>
              </button>

              {/* Comentários */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSideDrawer(showSideDrawer === 'comments' ? 'none' : 'comments');
                }}
                className={`modal-3d-tool-pill ${showSideDrawer === 'comments' ? 'active' : ''}`}
                title="Ver comentários da foto"
              >
                <MessageCircle size={16} />
                <span>{photoComments.length}</span>
              </button>

              {/* Stories 9:16 */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStoryShareOpen(true);
                }}
                className="modal-3d-tool-pill highlight-story"
                title="Compartilhar no Instagram Stories (9:16)"
              >
                <Share2 size={16} color="var(--accent-magenta)" />
                <span>Stories</span>
              </button>

              {/* Estúdio LUMEN & EXIF */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSideDrawer(showSideDrawer === 'studio' ? 'none' : 'studio');
                }}
                className={`modal-3d-tool-pill ${showSideDrawer === 'studio' ? 'active' : ''}`}
                title="Efeitos LUMEN e Informações da Câmera"
              >
                <Sliders size={16} />
                <span>Estúdio</span>
              </button>

              {/* LGPD Privacy Removal Request */}
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  haptics.lightTick();
                  setIsPrivacyRemovalOpen(true); 
                }}
                className="modal-3d-tool-pill"
                style={{ color: '#00f0ff' }}
                title="Solicitar Desfoque Facial ou Remoção da Foto (LGPD)"
              >
                <ShieldAlert size={16} />
              </button>
            </div>
          </div>
        </footer>

        {/* 5. 🗂️ SIDE DRAWER (COMENTÁRIOS E ESTÚDIO LUMEN OVERLAY) */}
        {showSideDrawer !== 'none' && (
          <aside className="fullscreen-side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                {showSideDrawer === 'comments' && (
                  <>
                    <MessageCircle size={18} color="var(--accent-teal)" />
                    <span>Comentários do Flagra</span>
                  </>
                )}
                {showSideDrawer === 'studio' && (
                  <>
                    <Film size={18} color="var(--accent-cyan)" />
                    <span>Estúdio de Cores & EXIF</span>
                  </>
                )}
              </div>
              <button 
                onClick={() => setShowSideDrawer('none')}
                className="btn-icon"
                style={{ width: 28, height: 28 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Comments Tab */}
            {showSideDrawer === 'comments' && (
              <div className="drawer-comments-content">
                <div className="drawer-comments-list no-scrollbar">
                  {photoComments.map((c) => (
                    <div key={c.id} className="drawer-comment-card">
                      <img src={c.userAvatar} alt={c.userName} className="comment-avatar" />
                      <div className="comment-body">
                        <div className="comment-user-row">
                          <span className="comment-user-name">{c.userName}</span>
                          <span className="comment-time">{c.timestamp}</span>
                        </div>
                        <p className="comment-text-content">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostComment} className="drawer-comment-input-row">
                  <input 
                    type="text"
                    placeholder="Escreva um comentário..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="drawer-input"
                  />
                  <button type="submit" className="drawer-send-btn" title="Enviar">
                    <Send size={15} />
                  </button>
                </form>
              </div>
            )}

            {/* Studio & EXIF Tab */}
            {showSideDrawer === 'studio' && (
              <div className="drawer-studio-content no-scrollbar">
                {/* Film Presets Selection */}
                <div className="studio-section">
                  <span className="studio-section-title">Película Analógica (Color Grade):</span>
                  <div className="film-presets-grid">
                    {FILM_PRESETS.map((film) => (
                      <button
                        key={film.id}
                        onClick={() => {
                          setSelectedFilm(film);
                          soundFx.playRadarTick();
                        }}
                        className={`film-preset-btn ${selectedFilm.id === film.id ? 'active' : ''}`}
                      >
                        <span className="film-name">{film.name}</span>
                        <span className="film-desc">{film.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* EXIF Data */}
                <div className="studio-section">
                  <span className="studio-section-title">Dados Técnicos da Câmera:</span>
                  <div className="exif-grid">
                    <div className="exif-item"><span className="exif-k">Câmera:</span><span className="exif-v">{photo.exif.camera}</span></div>
                    <div className="exif-item"><span className="exif-k">Lente:</span><span className="exif-v">{photo.photographer.lens}</span></div>
                    <div className="exif-item"><span className="exif-k">Abertura:</span><span className="exif-v">{photo.exif.aperture}</span></div>
                    <div className="exif-item"><span className="exif-k">Velocidade:</span><span className="exif-v">{photo.exif.shutter}</span></div>
                    <div className="exif-item"><span className="exif-k">ISO:</span><span className="exif-v">{photo.exif.iso}</span></div>
                    <div className="exif-item"><span className="exif-k">Focal:</span><span className="exif-v">{photo.exif.focalLength}</span></div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="studio-section">
                  <span className="studio-section-title">Paleta de Cores Extraída:</span>
                  <div className="palette-row">
                    {colorPalette.map((col, idx) => (
                      <div 
                        key={idx} 
                        className="palette-swatch"
                        style={{ background: col.hex }}
                        title={`${col.name} (${col.hex})`}
                      />
                    ))}
                  </div>
                </div>

                {/* Direct Studio Modals Triggers */}
                <div className="studio-actions-list">
                  <button 
                    onClick={() => setIsMagazineModalOpen(true)}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <Crown size={14} color="var(--accent-gold)" />
                    Capa de Revista VIP
                  </button>

                  <button 
                    onClick={() => setIsStoryModalOpen(true)}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <Sparkles size={14} color="var(--accent-teal)" />
                    Criador de Reels / Stories
                  </button>

                  <button 
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={14} color="var(--accent-cyan)" />
                    Certificado de Autenticidade
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 🎬 SUB-MODALS */}
      {isStoryShareOpen && (
        <StoryShareModal
          photo={photo}
          currentUser={currentUser}
          onClose={() => setIsStoryShareOpen(false)}
        />
      )}

      {isStoryModalOpen && (
        <StoryGeneratorModal
          photo={photo}
          currentUser={currentUser}
          onClose={() => setIsStoryModalOpen(false)}
        />
      )}

      {isMagazineModalOpen && (
        <MagazineCoverStudio
          photo={photo}
          currentUser={currentUser}
          onClose={() => setIsMagazineModalOpen(false)}
        />
      )}

      {isHireModalOpen && (
        <PhotographerHireModal
          photographer={photo.photographer}
          onClose={() => setIsHireModalOpen(false)}
        />
      )}

      {isMotionModalOpen && (
        <MotionVideoModal
          photo={photo}
          currentUser={currentUser}
          onClose={() => setIsMotionModalOpen(false)}
        />
      )}

      {isDirectSaleOpen && (
        <DirectSaleModal
          photo={photo}
          onClose={() => setIsDirectSaleOpen(false)}
          onSavePrice={(photoId, isForSale, price) => {
            setPhotoSaleConfig(photoId, isForSale, price);
            setIsDirectSaleOpen(false);
            showToast('Preço e configurações de venda atualizados com sucesso!');
          }}
        />
      )}

      {isCertificateModalOpen && (
        <AuthenticityCertificateModal
          photo={photo}
          currentUser={currentUser}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}

      {isPrivacyRemovalOpen && (
        <PhotoPrivacyRemovalModal
          photo={photo}
          isOpen={isPrivacyRemovalOpen}
          onClose={() => setIsPrivacyRemovalOpen(false)}
          onPhotoHidden={() => {
            setIsPrivacyRemovalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
