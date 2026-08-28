import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Sparkles, 
  Camera, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Scan, 
  MapPin 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockDatabase';
import { soundFx } from '../services/biometricService';
import { getOrderedStories, type StoryItem } from '../data/mockStories';

interface StoryViewerModalProps {
  initialStory: StoryItem;
  storiesList?: StoryItem[];
  currentUser?: UserProfile | null;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  onTriggerScan?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  initialStory,
  storiesList,
  currentUser = null,
  onClose,
  onSelectUser,
  onTriggerScan,
}) => {
  const activeStories = React.useMemo(() => {
    return storiesList && storiesList.length > 0 ? storiesList : getOrderedStories(currentUser);
  }, [storiesList, currentUser]);

  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(() => {
    const idx = activeStories.findIndex((s) => s.id === initialStory.id);
    return idx >= 0 ? idx : 0;
  });

  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.isMuted);

  const currentStory = activeStories[currentStoryIndex] || activeStories[0];
  const currentSlide = currentStory.slides[slideIndex] || currentStory.slides[0];
  const totalSlides = currentStory.slides.length;

  const handleNextSlide = React.useCallback(() => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((s) => s + 1);
      setProgress(0);
    } else if (currentStoryIndex < activeStories.length - 1) {
      setCurrentStoryIndex((c) => c + 1);
      setSlideIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [slideIndex, totalSlides, currentStoryIndex, activeStories.length, onClose]);

  useEffect(() => {
    setLikesCount(currentSlide?.likesCount || 0);
    setIsLiked(false);
    setProgress(0);
  }, [currentStoryIndex, slideIndex, currentSlide?.likesCount]);

  // Ambient Nightclub Audio Beats Loop
  useEffect(() => {
    if (!isMuted) {
      soundFx.startNightclubBeat();
    } else {
      soundFx.stopNightclubBeat();
    }
    return () => {
      soundFx.stopNightclubBeat();
    };
  }, [isMuted]);

  // Slide timer progress animation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + 2.5; // ~4 seconds per slide
      });
    }, 100);

    return () => clearInterval(interval);
  }, [handleNextSlide, isPaused]);

  const handlePrevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(s => s - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(c => c - 1);
      const prevStory = activeStories[currentStoryIndex - 1];
      setSlideIndex(prevStory.slides.length - 1);
      setProgress(0);
    }
  };

  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(c => c + 1);
      soundFx.playRadarTick();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#ff007a', '#00f5d4', '#ffb703']
      });
    } else {
      setIsLiked(false);
      setLikesCount(c => c - 1);
    }
  };

  const handleOpenProfile = () => {
    const user = MOCK_USERS.find(u => u.id === currentStory.authorId) || MOCK_USERS[0];
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, background: 'rgba(0,0,0,0.92)' }}>
      <div 
        className="story-viewer-modal-card"
        style={{
          border: currentStory.isDeus ? '2px solid #ffb703' : '1px solid var(--border-glow)',
        }}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Background Image / Slide */}
        <img
          src={currentSlide.mediaUrl}
          alt={currentSlide.caption}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Top Vignette Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 140,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }} />

        {/* Bottom Vignette Gradient Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        }} />

        {/* Progress Bars for all slides in this story */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          display: 'flex',
          gap: 4,
          zIndex: 20
        }}>
          {currentStory.slides.map((s, idx) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: currentStory.isDeus ? 'linear-gradient(90deg, #ffb703, #fb8500)' : 'var(--accent-teal)',
                  width: idx < slideIndex ? '100%' : idx === slideIndex ? `${progress}%` : '0%',
                  transition: idx === slideIndex ? 'width 0.1s linear' : 'none'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              padding: 2,
              background: currentStory.isDeus 
                ? 'linear-gradient(135deg, #ffb703, #fb8500)' 
                : currentStory.authorType === 'photographer'
                ? 'linear-gradient(135deg, #00f5d4, #00b4d8)'
                : 'linear-gradient(135deg, #ff007a, #7928ca)',
              boxShadow: currentStory.isDeus ? '0 0 12px rgba(255, 183, 3, 0.7)' : 'none'
            }}>
              <img
                src={currentStory.authorAvatar}
                alt={currentStory.authorName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                  {currentStory.authorName}
                </span>
                {currentStory.rankPosition === 1 ? (
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                    color: '#07080c',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 0 10px rgba(255, 183, 3, 0.6)'
                  }}>
                    👑 TOP #1 RANK
                  </span>
                ) : currentStory.rankPosition === 2 ? (
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                    color: '#07080c',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 0 10px rgba(0, 245, 212, 0.4)'
                  }}>
                    🥈 TOP #2 RANK
                  </span>
                ) : currentStory.rankPosition === 3 ? (
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                    color: '#ffffff',
                    fontWeight: 900,
                    padding: '2px 7px',
                    borderRadius: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 0 10px rgba(255, 0, 122, 0.4)'
                  }}>
                    🥉 TOP #3 RANK
                  </span>
                ) : currentStory.authorType === 'photographer' ? (
                  <Camera size={13} color="var(--accent-teal)" />
                ) : null}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{currentSlide.location}</span>
                <span>•</span>
                <span>{currentSlide.timestamp}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                soundFx.isMuted = nextMuted;
                if (nextMuted) {
                  soundFx.stopNightclubBeat();
                } else {
                  soundFx.startNightclubBeat();
                }
              }}
              style={{
                background: isMuted ? 'rgba(0,0,0,0.6)' : 'rgba(0, 245, 212, 0.2)',
                border: isMuted ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--accent-teal)',
                borderRadius: 20,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700
              }}
              title={isMuted ? 'Ativar Som da Balada' : 'Mutar Som'}
            >
              {isMuted ? <VolumeX size={13} color="#ffffff" /> : <Volume2 size={13} color="var(--accent-teal)" />}
              <span>{isMuted ? 'Mudo' : '🎵 Sunset Festival (124 BPM)'}</span>
              {!isMuted && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 10 }}>
                  <div style={{ width: 2, height: 10, background: 'var(--accent-teal)', borderRadius: 1 }} />
                  <div style={{ width: 2, height: 6, background: 'var(--accent-teal)', borderRadius: 1 }} />
                  <div style={{ width: 2, height: 8, background: 'var(--accent-teal)', borderRadius: 1 }} />
                </div>
              )}
            </button>

            <button
              onClick={() => {
                soundFx.stopNightclubBeat();
                onClose();
              }}
              className="btn-icon"
              style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.5)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Arrows on Left / Right */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
          className="btn-icon"
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            width: 36,
            height: 36,
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '50%'
          }}
          title="Slide anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
          className="btn-icon"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            width: 36,
            height: 36,
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '50%'
          }}
          title="Próximo slide"
        >
          <ChevronRight size={18} />
        </button>

        {/* Tap Zones for Left / Right Navigation */}
        <div 
          onClick={handlePrevSlide}
          style={{ position: 'absolute', top: 80, bottom: 120, left: 0, width: '40%', zIndex: 15, cursor: 'pointer' }} 
        />
        <div 
          onClick={handleNextSlide}
          style={{ position: 'absolute', top: 80, bottom: 120, right: 0, width: '60%', zIndex: 15, cursor: 'pointer' }} 
        />

        {/* Bottom Story Footer */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 14,
          right: 14,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {/* Badge & Event */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              background: currentStory.isDeus ? 'rgba(255, 183, 3, 0.25)' : 'rgba(0, 245, 212, 0.2)',
              border: currentStory.isDeus ? '1px solid #ffb703' : '1px solid var(--accent-teal)',
              color: currentStory.isDeus ? '#ffb703' : 'var(--accent-teal)',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: '0.68rem',
              fontWeight: 800
            }}>
              {currentStory.badge}
            </span>

            <span style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color="var(--accent-cyan)" /> {currentSlide.eventName}
            </span>
          </div>

          {/* Caption */}
          <p style={{
            fontSize: '0.85rem',
            color: '#ffffff',
            fontWeight: 600,
            lineHeight: 1.3,
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            {currentSlide.caption}
          </p>

          {/* Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <button
              onClick={handleLike}
              style={{
                background: isLiked ? 'rgba(255, 0, 122, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                border: isLiked ? '1.5px solid #ff007a' : '1px solid rgba(255, 255, 255, 0.2)',
                color: isLiked ? '#ff007a' : '#ffffff',
                borderRadius: 20,
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backdropFilter: 'blur(10px)',
                flexShrink: 0
              }}
            >
              <Heart size={16} fill={isLiked ? '#ff007a' : 'none'} />
              <span>{likesCount}</span>
            </button>

            {/* Recognize Face in Story */}
            <button
              onClick={onTriggerScan}
              className="btn-secondary"
              style={{
                borderRadius: 20,
                padding: '8px 12px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0
              }}
              title="Identificar meu rosto neste flagra"
            >
              <Scan size={14} color="var(--accent-teal)" />
            </button>

            {/* View Profile / Enter Master Vault */}
            <button
              onClick={handleOpenProfile}
              style={{
                flex: 1,
                background: currentStory.isDeus 
                  ? 'linear-gradient(135deg, #ffb703, #fb8500)' 
                  : 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                color: '#07080c',
                border: 'none',
                borderRadius: 20,
                padding: '9px 14px',
                fontSize: '0.82rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap'
              }}
            >
              <Sparkles size={15} />
              <span>{currentStory.isDeus ? 'Acessar Acervo Master' : 'Ver Perfil & Flagras'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
