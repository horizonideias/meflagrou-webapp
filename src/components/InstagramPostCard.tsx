import React, { useState, useMemo, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  MoreHorizontal, 
  Sparkles, 
  Crown, 
  MapPin, 
  Download, 
  ShoppingBag, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Share2,
  Tag,
  Radio,
  Gift,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto, UserProfile } from '../types';
import { useCart } from '../context/CartContext';
import { soundFx } from '../services/biometricService';
import { PhotoMagnifierLoupe } from './PhotoMagnifierLoupe';
import { FaceTagsOverlay } from './FaceTagsOverlay';
import { ReferralCashbackModal } from './ReferralCashbackModal';

interface InstagramPostCardProps {
  photo: EventPhoto;
  currentUser: UserProfile;
  onOpenPhotoModal: (photo: EventPhoto) => void;
  onSelectUser: (user: UserProfile) => void;
  onOpenStoryShare?: (photo: EventPhoto) => void;
  allPhotos: EventPhoto[];
}

export const InstagramPostCard: React.FC<InstagramPostCardProps> = ({
  photo,
  currentUser,
  onOpenPhotoModal,
  onSelectUser,
  onOpenStoryShare,
  allPhotos,
}) => {
  const { 
    cart, 
    addToCart, 
    openCheckout,
    addPhotoToUserProfile,
    removePhotoFromUserProfile,
    isPhotoInUserProfile,
  } = useCart();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(photo.likesCount);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string }>>([
    { id: '1', user: 'mariana.costa', text: 'Que flagra absurdo! A foto ficou incrível 🔥' },
    { id: '2', user: 'lucas.albuquerque', text: 'Esse festival foi histórico! 🚀' },
  ]);

  // 🏷️ Marcação Facial Interativa "Quem é Quem"
  const [isFaceTagsVisible, setIsFaceTagsVisible] = useState<boolean>(false);

  // 💸 Modal de Indique & Ganhe Cashback PIX
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);

  // Floating Emoji Reactions State
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number }>>([]);

  // Multi-photo Carousel State: Agrupa todas as fotos do mesmo evento
  const eventCarouselPhotos = useMemo(() => {
    const sameEvent = allPhotos.filter((p) => p.eventName === photo.eventName);
    if (sameEvent.length === 0) return [photo];
    const ordered = [photo, ...sameEvent.filter((p) => p.id !== photo.id)];
    return ordered.slice(0, 10);
  }, [allPhotos, photo]);

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const currentSlidePhoto = eventCarouselPhotos[activePhotoIndex] || photo;

  // 👤 Adicionar ao Meu Perfil State
  const isAddedToProfile = isPhotoInUserProfile(currentSlidePhoto.id, currentUser.id);

  // Sale info & cart status
  const photoPrice = currentSlidePhoto.ownerPrice || 19.90;
  const isPurchased = cart.some((item) => item.photo.id === currentSlidePhoto.id);
  const isFounderProfile = photo.photographer.name.includes('Meflagrou') || photo.photographer.name.includes('Founder');

  // Tag do autor
  const authorTag = photo.tags && photo.tags[0];
  const authorName = authorTag?.userName || photo.eventName || 'Flagra VIP';
  const authorAvatar = authorTag?.userAvatar || '/founder_avatar.jpg';
  const authorHandle = authorTag?.userName.toLowerCase().replace(/\s+/g, '_') || 'meflagrou';

  // ◀️ ▶️ Navegação pelas fotos do evento
  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playRadarTick();
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : eventCarouselPhotos.length - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playRadarTick();
    setActivePhotoIndex((prev) => (prev < eventCarouselPhotos.length - 1 ? prev + 1 : 0));
  };

  // Toggle Like with heart burst animation
  const handleToggleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((c) => c + 1);
      soundFx.playRadarTick();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#ff007a', '#00f5d4', '#ffb703'],
      });
    } else {
      setIsLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    }
  };

  // 👆👆 2 TOQUES / DUPLO CLIQUE PARA ABRIR A GALERIA EM TELA CHEIA
  const lastTapTimeRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePhotoDoubleTapOrClick = () => {
    soundFx.playRadarTick();
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((c) => c + 1);
    }
    setShowHeartBurst(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#ff007a', '#ffb703'],
    });
    
    onOpenPhotoModal(currentSlidePhoto);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  // 👆 Touch Start
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  // 👆 Touch End: Detecta Arraste Horizontal (Swipe) OU 1 Toque (Passar Foto) OU 2 Toques (Galeria)
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartXRef.current;
    const diffY = touchEndY - touchStartYRef.current;

    // 1. 👉 Arrastar o dedo para horizontal (Swipe)
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
      return;
    }

    // 2. 👆 Toque rápido na tela
    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
      const now = Date.now();
      const DOUBLE_TAP_GAP = 300;

      if (now - lastTapTimeRef.current < DOUBLE_TAP_GAP) {
        if (singleClickTimerRef.current) {
          clearTimeout(singleClickTimerRef.current);
          singleClickTimerRef.current = null;
        }
        handlePhotoDoubleTapOrClick();
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
        singleClickTimerRef.current = setTimeout(() => {
          handleNextSlide();
          singleClickTimerRef.current = null;
        }, DOUBLE_TAP_GAP);
      }
    }
  };

  // 🖱️ Desktop Click: 1 Clique passa foto (lado esquerdo = volta, lado direito = avança)
  const handleMediaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.carousel-arrow, .carousel-dot, .post-price-badge, .post-media-badge, .magnifier-toggle-pill, .face-detected-pin, .post-face-tag-toggle-btn')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = clickX < rect.width * 0.35;

    if (singleClickTimerRef.current) {
      clearTimeout(singleClickTimerRef.current);
      singleClickTimerRef.current = null;
    }

    singleClickTimerRef.current = setTimeout(() => {
      if (isLeftHalf) {
        handlePrevSlide();
      } else {
        handleNextSlide();
      }
      singleClickTimerRef.current = null;
    }, 240);
  };

  const handleMediaDoubleClick = () => {
    if (singleClickTimerRef.current) {
      clearTimeout(singleClickTimerRef.current);
      singleClickTimerRef.current = null;
    }
    handlePhotoDoubleTapOrClick();
  };

  // Quick Emoji Reaction
  const handleQuickReaction = (emoji: string) => {
    soundFx.playRadarTick();
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setLikesCount((c) => c + 1);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newEmoji.id));
    }, 1800);
  };

  // Toggle Add Photo to Current User's Profile
  const handleToggleAddToProfile = () => {
    if (isAddedToProfile) {
      removePhotoFromUserProfile(currentSlidePhoto.id, currentUser.id);
      soundFx.playRadarTick();
    } else {
      addPhotoToUserProfile(currentSlidePhoto, currentUser);
      soundFx.playUnlockSuccess();
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#ff007a', '#25d366', '#ffb703'],
      });
    }
  };

  // Buy Single Photo
  const handleBuyOrDownload = () => {
    if (isPurchased) {
      soundFx.playRadarTick();
      alert('📥 Baixando foto em Ultra HD 8K sem marca d\'água!');
    } else {
      addToCart(currentSlidePhoto, 'single_hd');
      openCheckout();
    }
  };

  // Buy Event Bundle
  const handleBuyBundle = () => {
    addToCart(currentSlidePhoto, 'event_pack');
    openCheckout();
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user: currentUser.handle,
        text: commentInput.trim(),
      },
    ]);
    setCommentInput('');
    soundFx.playRadarTick();
  };

  const handleOpenShare = () => {
    if (onOpenStoryShare) {
      onOpenStoryShare(currentSlidePhoto);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('🔗 Link do flagra copiado!');
    }
  };

  return (
    <article className="instagram-post-card">
      {/* 1. Header do Post (Autor, Avatar, Localização, Badge VIP & Live) */}
      <header className="post-card-header">
        <div
          className="post-header-left"
          onClick={() => {
            if (authorTag) {
              onSelectUser({
                id: authorTag.userId,
                name: authorTag.userName,
                handle: authorHandle,
                avatar: authorTag.userAvatar,
                city: 'São Paulo',
                state: 'SP',
                bio: 'Amante de festivais e boa música.',
                eventsCount: 8,
                totalPhotosCount: 14,
                verifiedAt: '2026-08-01',
                facialDescriptor: [],
                faceSignatureId: 'sig_vip',
                attendedEvents: [photo.eventName],
                socialLinks: { instagram: `@${authorHandle}` },
                privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true },
                topFriends: [],
              });
            }
          }}
        >
          <div className="post-author-avatar-ring">
            <img src={authorAvatar} alt={authorName} className="post-author-avatar" />
          </div>
          <div>
            <div className="post-author-name-row">
              <span className="post-author-name">{authorName}</span>
              {isFounderProfile ? (
                <span className="founder-mini-badge">
                  <Crown size={11} color="#07080c" /> FOUNDER
                </span>
              ) : (
                <span className="vip-mini-badge">VIP</span>
              )}

              {/* 🔴 Selo AO VIVO (Transmissão Direta da Pista) */}
              <span className="post-live-now-badge" title="Fotos enviadas pelo fotógrafo em tempo real">
                <Radio size={10} className="pulse-live-beacon" />
                AO VIVO
              </span>
            </div>
            <div className="post-location-row">
              <MapPin size={11} color="var(--text-muted)" />
              <span>{photo.eventName}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenPhotoModal(currentSlidePhoto)}
          className="post-options-btn"
          title="Ver detalhes da foto"
        >
          <MoreHorizontal size={18} />
        </button>
      </header>

      {/* 2. 🖼️ Galeria do Evento com Lupa Microscópica 8K & Marcação Facial Interativa */}
      <div
        className="post-media-container"
        onClick={handleMediaClick}
        onDoubleClick={handleMediaDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Lupa Microscópica 8K Integrada */}
        <PhotoMagnifierLoupe
          src={currentSlidePhoto.highResUrl || currentSlidePhoto.url}
          alt={`${currentSlidePhoto.eventName} - Foto ${activePhotoIndex + 1}`}
          zoomLevel={2.8}
        >
          {/* Marcação Facial Interativa ("Quem é Quem na Foto") */}
          <FaceTagsOverlay
            photo={currentSlidePhoto}
            isVisible={isFaceTagsVisible}
            onSelectUser={onSelectUser}
          />
        </PhotoMagnifierLoupe>

        {/* ◀️ ▶️ Setas de Navegação da Galeria no Feed */}
        {eventCarouselPhotos.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="carousel-arrow left"
              title="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNextSlide}
              className="carousel-arrow right"
              title="Próxima foto"
            >
              <ChevronRight size={20} />
            </button>

            {/* Pontos de Paginação na Base */}
            <div className="carousel-dots-tray">
              {eventCarouselPhotos.map((_, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playRadarTick();
                    setActivePhotoIndex(idx);
                  }}
                  className={`carousel-dot ${idx === activePhotoIndex ? 'active' : ''}`}
                  title={`Ir para foto ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Double click heart animation */}
        {showHeartBurst && (
          <div className="post-heart-burst">
            <Heart size={84} color="#ffffff" fill="#ff007a" strokeWidth={0} />
          </div>
        )}

        {/* Floating Emoji Reactions Stream */}
        {floatingEmojis.map((e) => (
          <div
            key={e.id}
            className="floating-reaction-particle"
            style={{ left: `${e.x}%` }}
          >
            {e.emoji}
          </div>
        ))}

        {/* Watermark / HD badge */}
        <div className="post-media-badge">
          <Sparkles size={13} color="var(--accent-teal)" />
          <span>meflagrou 8K</span>
        </div>

        {/* Botão de Alternar Marcação Facial (Quem é Quem) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playRadarTick();
            setIsFaceTagsVisible(!isFaceTagsVisible);
          }}
          className={`post-face-tag-toggle-btn ${isFaceTagsVisible ? 'active' : ''}`}
          title="Ver quem foi identificado nesta foto com IA"
        >
          <Tag size={12} />
          <span>{isFaceTagsVisible ? 'Ocultar Rostos' : 'Quem é Quem'}</span>
        </button>

        {/* Event Cover Badge */}
        <div className="post-event-cover-badge">
          <Sparkles size={11} color="#ffb703" />
          <span>{activePhotoIndex === 0 ? 'CAPA DO EVENTO' : `FLAGRA #${activePhotoIndex + 1}`}</span>
        </div>

        {/* Price tag badge */}
        <div className="post-price-badge">
          {isPurchased ? (
            <span className="purchased-label">
              <Check size={12} /> Comprada
            </span>
          ) : (
            <span>R$ {photoPrice.toFixed(2).replace('.', ',')}</span>
          )}
        </div>

        {/* Bottom Event Cover Gradient Info Bar */}
        <div className="post-event-cover-gradient-info">
          <span className="cover-event-title">{photo.eventName}</span>
          <div className="cover-event-meta-row">
            <span>{photo.city} • {photo.location}</span>
            <span className="cover-event-dot">•</span>
            <span className="cover-event-time">{photo.time}</span>
          </div>
        </div>
      </div>

      {/* 3. Barra de Ferramentas e Reações Rápidas */}
      <div className="post-quick-reactions-bar">
        <span className="reactions-title">Reagir:</span>
        <div className="reactions-buttons">
          {['🔥', '😍', '👑', '🍸', '🚀'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickReaction(emoji)}
              className="reaction-emoji-btn"
              title={`Reagir com ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Botão de Indique Amigo & Ganhe PIX */}
        <button
          onClick={() => setIsReferralModalOpen(true)}
          className="post-referral-quick-pill"
          title="Indique um amigo da foto e ganhe R$ 2,00 no PIX"
        >
          <Gift size={12} color="#ffb703" />
          <span>Ganhe R$ 2 PIX</span>
        </button>
      </div>

      {/* 4. Barra de Ações (Like, Comentário, Share nos Stories, Salvar, Comprar) */}
      <div className="post-actions-bar">
        <div className="post-actions-left">
          {/* Like Heart */}
          <button
            onClick={handleToggleLike}
            className={`post-action-btn ${isLiked ? 'liked' : ''}`}
            title="Curtir foto"
          >
            <Heart
              size={24}
              fill={isLiked ? '#ff007a' : 'none'}
              color={isLiked ? '#ff007a' : 'currentColor'}
            />
          </button>

          {/* Comment Bubble */}
          <button
            onClick={() => onOpenPhotoModal(currentSlidePhoto)}
            className="post-action-btn"
            title="Ver e adicionar comentários"
          >
            <MessageCircle size={24} />
          </button>

          {/* Share to Instagram Stories */}
          <button onClick={handleOpenShare} className="post-action-btn" title="Compartilhar no Instagram Stories (9:16)">
            <Share2 size={22} color="var(--accent-magenta)" />
          </button>

          {/* Adicionar ao Meu Perfil Button */}
          <button
            onClick={handleToggleAddToProfile}
            className={`post-action-btn ${isAddedToProfile ? 'added-profile' : ''}`}
            title={isAddedToProfile ? 'Foto no seu perfil (Clique para remover)' : 'Adicionar esta foto ao meu perfil'}
            style={{ color: isAddedToProfile ? '#00f5d4' : undefined }}
          >
            {isAddedToProfile ? <CheckCircle2 size={23} color="#00f5d4" /> : <UserPlus size={23} />}
          </button>
        </div>

        <div className="post-actions-right">
          {/* Instant Buy / Download Button */}
          <button
            onClick={handleBuyOrDownload}
            className={`post-buy-pill-btn ${isPurchased ? 'purchased' : ''}`}
            title={isPurchased ? 'Baixar em Alta Resolução' : 'Comprar foto em Ultra HD'}
          >
            {isPurchased ? (
              <>
                <Download size={14} />
                <span>Baixar HD</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Comprar R$ {photoPrice.toFixed(2).replace('.', ',')}</span>
              </>
            )}
          </button>

          {/* Save Bookmark */}
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              soundFx.playRadarTick();
            }}
            className={`post-action-btn ${isSaved ? 'saved' : ''}`}
            title="Salvar na coleção"
          >
            <Bookmark
              size={24}
              fill={isSaved ? '#ffffff' : 'none'}
              color={isSaved ? '#ffffff' : 'currentColor'}
            />
          </button>
        </div>
      </div>

      {/* 5. Informações de Likes & Descrição */}
      <div className="post-info-block">
        <div className="post-likes-count">
          <strong>{likesCount.toLocaleString()} curtidas</strong>
        </div>

        <div className="post-caption-row">
          <span className="caption-author">{authorName}</span>
          <span className="caption-text">{photo.location || photo.eventName} • Flagra Oficial meflagrou em 8K</span>
        </div>

        {/* 6. Comentários Fixos do Card */}
        {comments.length > 0 && (
          <div className="post-comments-preview">
            {comments.slice(0, 2).map((c) => (
              <div key={c.id} className="comment-line">
                <span className="comment-user">{c.user}</span>
                <span className="comment-text">{c.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* 7. Input Rápido para Comentar */}
        <form onSubmit={handleAddComment} className="post-comment-form">
          <input
            type="text"
            placeholder="Adicione um comentário..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="post-comment-input"
          />
          {commentInput.trim() && (
            <button type="submit" className="post-comment-submit-btn">
              Publicar
            </button>
          )}
        </form>

        {/* Oferta de Pacote Completo do Evento */}
        {!isPurchased && eventCarouselPhotos.length > 1 && (
          <div className="post-bundle-offer-pill" onClick={handleBuyBundle}>
            <Package size={14} color="var(--accent-gold)" />
            <span>Leve todas as {eventCarouselPhotos.length} fotos do {photo.eventName} por R$ 39,90 no PIX</span>
          </div>
        )}
      </div>

      {/* Modal de Indique & Ganhe Cashback PIX */}
      <ReferralCashbackModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        userName={currentUser.name}
      />
    </article>
  );
};
