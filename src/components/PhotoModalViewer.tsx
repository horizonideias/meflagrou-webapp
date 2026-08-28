import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
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
  Camera
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
import { 
  FILM_PRESETS, 
  extractPhotoColorPalette, 
  type FilmPreset 
} from '../services/colorGradeEngine';
import { ambientSound } from '../services/ambientSoundscape';
import { soundFx } from '../services/biometricService';
import { useCart } from '../context/CartContext';

interface PhotoModalViewerProps {
  photo: EventPhoto;
  photosList: EventPhoto[];
  currentUser: UserProfile;
  onClose: () => void;
  onSelectUserByTag?: (userId: string) => void;
  onPhotoChange: (photo: EventPhoto) => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
}

export const PhotoModalViewer: React.FC<PhotoModalViewerProps> = ({
  photo,
  photosList,
  currentUser,
  onClose,
  onPhotoChange,
  onUpdateAvatar,
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

  // ⏱️ 1-second delayed overlay over fullscreen photo
  const [showOverlays, setShowOverlays] = useState<boolean>(false);
  const [showSideDrawer, setShowSideDrawer] = useState<'none' | 'comments' | 'studio' | 'info'>('none');

  useEffect(() => {
    setShowOverlays(false);
    const timer = setTimeout(() => {
      setShowOverlays(true);
    }, 1000); // Exibida em tela inteira e depois de 1s as informações aparecem sobre a foto
    return () => clearTimeout(timer);
  }, [photo.id]);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(photo.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(photo.likesCount);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedFilm, setSelectedFilm] = useState<FilmPreset>(FILM_PRESETS[1]);

  // 👤 Adicionar ao Meu Perfil State
  const [isAddedToProfile, setIsAddedToProfile] = useState<boolean>(() => {
    return isPhotoInUserProfile(photo.id, currentUser.id);
  });

  useEffect(() => {
    setIsAddedToProfile(isPhotoInUserProfile(photo.id, currentUser.id));
  }, [photo.id, currentUser.id, isPhotoInUserProfile]);

  // Story Share 9:16 Modal
  const [isStoryShareOpen, setIsStoryShareOpen] = useState<boolean>(false);

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
      text: 'A iluminação e o enquadramento dessa foto ficaram absurdos! 😍🔥',
      timestamp: 'há 10 min',
    },
    {
      id: 'c2',
      userName: 'Deus • Meflagrou',
      userAvatar: '/founder_avatar.jpg',
      text: 'Cobertura oficial 8K Ultra HD sem compressão 👑📸',
      timestamp: 'há 25 min',
    }
  ]);
  const [commentInput, setCommentInput] = useState<string>('');

  // Sub-Modals
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isMagazineModalOpen, setIsMagazineModalOpen] = useState<boolean>(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState<boolean>(false);
  const [isMotionModalOpen, setIsMotionModalOpen] = useState<boolean>(false);
  const [isDirectSaleOpen, setIsDirectSaleOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);

  const currentIndex = photosList.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photosList.length - 1;
  const colorPalette = extractPhotoColorPalette(photo.id);

  // Keyboard navigation & light dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        ambientSound.stop();
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onPhotoChange(photosList[currentIndex - 1]);
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight' && hasNext) {
        onPhotoChange(photosList[currentIndex + 1]);
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ambientSound.stop();
    };
  }, [currentIndex, hasPrev, hasNext, photosList, onClose, onPhotoChange]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
        particleCount: 30,
        spread: 50,
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
      const mode = photo.eventName.toLowerCase().includes('sunset') ? 'sunset' : (photo.eventName.toLowerCase().includes('copa') ? 'lounge' : 'club');
      ambientSound.playMode(mode);
      setIsPlayingAudio(true);
      showToast(`Tocando atmosfera sonora de ${photo.eventName} 🎧`);
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

  return (
    <>
      <div 
        className="fullscreen-photo-viewer-root"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowOverlays(!showOverlays);
          }
        }}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fullscreen-toast">
            <Check size={16} color="#07080c" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. 🖼️ FULLSCREEN MAIN PHOTO (TELA INTEIRA) */}
        <div 
          className="fullscreen-image-stage"
          onClick={() => setShowOverlays(!showOverlays)}
        >
          <img 
            src={photo.highResUrl || photo.url} 
            alt={photo.eventName}
            className="fullscreen-main-img"
            style={{
              transform: `scale(${zoomLevel})`,
              filter: selectedFilm.cssFilter,
            }}
          />

          {/* 🛡️ Marca d'Água de Proteção Anti-Print & Anti-Captura Mobile */}
          {!isPurchased && (
            <div className="mobile-anti-print-watermark-overlay" aria-hidden="true">
              <div className="anti-print-watermark-center">
                <Lock size={18} />
                <span>meflagrou.com • FOTO OFICIAL 8K</span>
              </div>
            </div>
          )}

          {/* Previous / Next Arrow Controls */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPhotoChange(photosList[currentIndex - 1]);
                setZoomLevel(1);
              }}
              className="fullscreen-nav-btn left"
              title="Foto anterior (Seta esquerda)"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPhotoChange(photosList[currentIndex + 1]);
                setZoomLevel(1);
              }}
              className="fullscreen-nav-btn right"
              title="Próxima foto (Seta direita)"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* 2. 📌 FLOATING TOP BAR (APARECE SOBRE A FOTO DEPOIS DE 1S) */}
        <header className={`fullscreen-floating-top ${showOverlays ? 'visible' : ''}`}>
          {/* Author & Event Info */}
          <div className="floating-top-left">
            <img 
              src={photo.photographer.avatar} 
              alt={photo.photographer.name} 
              className="floating-author-avatar"
            />
            <div className="floating-author-info">
              <div className="floating-author-row">
                <span className="floating-author-name">{photo.photographer.name}</span>
                <span className="floating-pro-badge">PRO 8K</span>
              </div>
              <div className="floating-event-row">
                <MapPin size={12} color="var(--accent-teal)" />
                <span>{photo.eventName} • {photo.city}</span>
              </div>
            </div>
          </div>

          {/* Top Actions & Dismiss */}
          <div className="floating-top-right">
            {/* Zoom Controls */}
            <div className="floating-zoom-controls">
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.max(1, z - 0.25)); }}
                className="floating-icon-btn"
                title="Reduzir zoom"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-value">{Math.round(zoomLevel * 100)}%</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.min(2.5, z + 0.25)); }}
                className="floating-icon-btn"
                title="Aumentar zoom"
              >
                <ZoomIn size={16} />
              </button>
              {zoomLevel > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setZoomLevel(1); }}
                  className="floating-icon-btn"
                  title="Restaurar zoom"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Adicionar ao Meu Perfil Button */}
            <button
              onClick={handleToggleAddToProfile}
              className={`floating-add-profile-btn ${isAddedToProfile ? 'added' : ''}`}
              title={isAddedToProfile ? 'Esta foto está no seu perfil (Clique para remover)' : 'Adicionar esta foto ao seu perfil'}
            >
              {isAddedToProfile ? (
                <>
                  <CheckCircle2 size={15} color="#00f5d4" />
                  <span>No Meu Perfil</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>Adicionar ao Perfil</span>
                </>
              )}
            </button>

            {/* Soundscape Ambience Audio Toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleSoundscape(); }}
              className={`floating-icon-btn ${isPlayingAudio ? 'active-audio' : ''}`}
              title="Atmosfera Sonora do Evento"
            >
              {isPlayingAudio ? <Volume2 size={18} color="var(--accent-teal)" /> : <VolumeX size={18} />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                ambientSound.stop();
                onClose();
              }}
              className="floating-close-btn"
              title="Fechar Tela Inteira (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* 3. 📌 FLOATING BOTTOM ACTION BAR (APARECE SOBRE A FOTO DEPOIS DE 1S) */}
        <footer className={`fullscreen-floating-bottom ${showOverlays ? 'visible' : ''}`}>
          {/* Bottom Left: Event Meta & Resolution */}
          <div className="floating-bottom-left">
            <div className="floating-event-title">{photo.eventName}</div>
            <div className="floating-meta-pills">
              <span className="meta-pill"><Calendar size={11} /> {photo.eventDate}</span>
              <span className="meta-pill"><Clock size={11} /> {photo.time}</span>
              <span className="meta-pill highlight"><Sparkles size={11} /> 8K Ultra HD</span>
            </div>
          </div>

          {/* Bottom Center: Quick Buy / Download Pill */}
          <div className="floating-bottom-center">
            {isPurchased ? (
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="floating-buy-btn purchased"
                title="Baixar arquivo original de alta resolução"
              >
                <Download size={16} />
                <span>{isDownloading ? 'Baixando...' : 'Baixar Foto Original HD'}</span>
              </button>
            ) : (
              <button 
                onClick={handleBuyNow}
                className="floating-buy-btn"
                title="Comprar foto em Ultra HD sem marca d'água"
              >
                <ShoppingBag size={16} />
                <span>Comprar Foto HD • R$ {saleConfig.price.toFixed(2).replace('.', ',')}</span>
              </button>
            )}
          </div>

          {/* Bottom Right: Like, Comments, Share Stories, Tools */}
          <div className="floating-bottom-right">
            {/* Definir como Foto de Perfil se a Foto for Comprada */}
            {isPurchased && onUpdateAvatar && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateAvatar(photo.url);
                  setToastMessage('✨ Foto definida como seu avatar oficial!');
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="floating-action-pill highlight"
                title="Definir esta foto comprada como seu avatar de perfil oficial"
                style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
              >
                <Camera size={18} color="var(--accent-cyan)" />
                <span>Usar no Perfil</span>
              </button>
            )}

            {/* Adicionar ao Meu Perfil Action Pill */}
            <button 
              onClick={handleToggleAddToProfile}
              className={`floating-action-pill ${isAddedToProfile ? 'added-profile' : ''}`}
              title={isAddedToProfile ? 'Foto salva no seu perfil' : 'Adicionar foto ao meu perfil'}
            >
              {isAddedToProfile ? (
                <CheckCircle2 size={18} color="#00f5d4" />
              ) : (
                <UserPlus size={18} color="var(--accent-teal)" />
              )}
              <span>{isAddedToProfile ? 'No Perfil' : 'Meu Perfil'}</span>
            </button>

            {/* Like Heart */}
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleLike(); }}
              className={`floating-action-pill ${isLiked ? 'liked' : ''}`}
              title="Curtir foto"
            >
              <Heart size={18} fill={isLiked ? '#ff007a' : 'none'} color={isLiked ? '#ff007a' : 'currentColor'} />
              <span>{likesCount}</span>
            </button>

            {/* Comments Toggle */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSideDrawer(showSideDrawer === 'comments' ? 'none' : 'comments');
              }}
              className={`floating-action-pill ${showSideDrawer === 'comments' ? 'active' : ''}`}
              title="Ver comentários da foto"
            >
              <MessageCircle size={18} />
              <span>{photoComments.length}</span>
            </button>

            {/* Share to Stories 9:16 */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsStoryShareOpen(true);
              }}
              className="floating-action-pill highlight"
              title="Compartilhar no Instagram Stories (9:16)"
            >
              <Share2 size={18} color="var(--accent-magenta)" />
              <span>Stories</span>
            </button>

            {/* Studio Tools (Presets / EXIF) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowSideDrawer(showSideDrawer === 'studio' ? 'none' : 'studio');
              }}
              className={`floating-action-pill ${showSideDrawer === 'studio' ? 'active' : ''}`}
              title="Efeitos LUMEN e Informações da Câmera"
            >
              <Sliders size={18} />
              <span>Estúdio</span>
            </button>
          </div>
        </footer>

        {/* 4. 🗂️ SIDE DRAWER (COMENTÁRIOS E ESTÚDIO LUMEN OVERLAY) */}
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
    </>
  );
};
