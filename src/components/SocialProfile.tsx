import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Users, 
  Flame, 
  Share2, 
  Check, 
  Award, 
  CalendarDays, 
  PartyPopper,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Store,
  Crown,
  QrCode,
  Film,
  Swords,
  MessageSquare,
  Menu,
  ArrowLeft,
  Download,
  ShoppingBag
} from 'lucide-react';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_PHOTOS, MOCK_USERS, MOCK_EVENTS } from '../data/mockDatabase';
import { generateUserSamplePhotos } from '../data/userPhotoGenerator';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { InstallAppModal } from './InstallAppModal';
import { InstagramIcon } from './Icons';
import { InteractiveStage } from './InteractiveStage';
import { useCart } from '../context/CartContext';
import { PhotoUploadDashboard } from './PhotoUploadDashboard';
import { DirectSaleModal } from './DirectSaleModal';
import { PartyRecapVideoModal } from './PartyRecapVideoModal';
import { LeaderboardHallOfFameModal } from './LeaderboardHallOfFameModal';
import { PartyModeOfflineQrModal } from './PartyModeOfflineQrModal';
import { VipClubSubscriptionModal } from './VipClubSubscriptionModal';
import { WhatsAppAlertModal } from './WhatsAppAlertModal';
import { FlagraBattleModal } from './FlagraBattleModal';
import { PhotographerAffiliateModal } from './PhotographerAffiliateModal';
import { PhotographerCallPingModal } from './PhotographerCallPingModal';
import { SquadMatchBundleModal } from './SquadMatchBundleModal';
import { WristbandCheckInModal } from './WristbandCheckInModal';
import { PhotographerLeagueRankingModal } from './PhotographerLeagueRankingModal';
import { FeaturesHubMenuModal } from './FeaturesHubMenuModal';
import { MeflagrouLogo } from './MeflagrouLogo';

interface SocialProfileProps {
  user: UserProfile;
  onOpenPhotoModal: (photo: EventPhoto, photoList: EventPhoto[]) => void;
  onSelectUser: (user: UserProfile) => void;
  onLockSession: () => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
}

export const SocialProfile: React.FC<SocialProfileProps> = ({
  user,
  onOpenPhotoModal,
  onSelectUser,
  onLockSession,
  onUpdateAvatar,
}) => {
  const { 
    isPhotoPurchased, 
    sellerProfile, 
    openSellerDashboard, 
    getPhotoSaleConfig, 
    setPhotoSaleConfig,
    clientPublishedPhotos,
    getUserSavedPhotos,
  } = useCart();

  const { triggerInstall } = usePwaInstall();
  const isDeusProfile = user.id === 'user_founder';
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedSquadFriendId, setSelectedSquadFriendId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Handle Photo Upload for Changing Profile Avatar
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl && onUpdateAvatar) {
          onUpdateAvatar(dataUrl);
          setToastMessage('📸 Foto de perfil alterada com sucesso!');
          setCopiedToast(true);
          setTimeout(() => setCopiedToast(false), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Modals
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isClientUploadOpen, setIsClientUploadOpen] = useState<boolean>(false);
  const [editingSalePhoto, setEditingSalePhoto] = useState<EventPhoto | null>(null);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isPartyModeQrOpen, setIsPartyModeQrOpen] = useState<boolean>(false);
  const [isVipClubOpen, setIsVipClubOpen] = useState<boolean>(false);
  const [isWhatsAppAlertOpen, setIsWhatsAppAlertOpen] = useState<boolean>(false);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState<boolean>(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState<boolean>(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState<boolean>(false);
  const [isSquadMatchOpen, setIsSquadMatchOpen] = useState<boolean>(false);
  const [isWristbandOpen, setIsWristbandOpen] = useState<boolean>(false);
  const [isLeagueOpen, setIsLeagueOpen] = useState<boolean>(false);
  const [isHubMenuOpen, setIsHubMenuOpen] = useState<boolean>(false);

  // Aggregate photos for this profile from all persistent stores
  const savedUserPhotos = getUserSavedPhotos(user.id);
  const existingPhotos = isDeusProfile
    ? Array.from(new Map([...clientPublishedPhotos, ...savedUserPhotos, ...MOCK_PHOTOS].map((p) => [p.id, p])).values())
    : Array.from(
        new Map(
          [
            ...savedUserPhotos,
            ...clientPublishedPhotos.filter((p) => p.ownerSellerId === user.id || (p.tags && p.tags.some((t) => t.userId === user.id))),
            ...MOCK_PHOTOS.filter((photo) => photo.tags && photo.tags.some((tag) => tag.userId === user.id)),
          ].map((p) => [p.id, p])
        ).values()
      );

  const samplePhotos = generateUserSamplePhotos(user);
  const userPhotos = isDeusProfile 
    ? existingPhotos 
    : existingPhotos.length > 0 
    ? existingPhotos 
    : samplePhotos;

  const userAchievements = user.achievements || [
    { id: 'ach_vip', title: 'Rei do Camarote', icon: '👑', description: 'Mais de 10 presenças VIP' },
    { id: 'ach_battle', title: 'Invicto em Batalhas', icon: '⚔️', description: '95% de vitórias 1x1' },
    { id: 'ach_photo', title: 'Fotogênico 8K', icon: '📸', description: 'Biometria 99.8% confirmada' },
    { id: 'ach_pioneer', title: 'Membro Fundador', icon: '💎', description: 'Passe VIP Vitalício' }
  ];

  // Apply active category and event filters
  const filteredPhotos = userPhotos.filter((photo) => {
    if (selectedEventId !== 'all' && photo.eventId !== selectedEventId) {
      return false;
    }
    if (selectedSquadFriendId) {
      const hasFriend = photo.tags.some((t) => t.userId === selectedSquadFriendId);
      if (!hasFriend) return false;
    }
    if (selectedFilter === 'investments') {
      const isPurchasedByUser = isPhotoPurchased(photo.id);
      const isOwnerSeller = photo.ownerSellerId === user.id;
      return isPurchasedByUser || isOwnerSeller;
    }
    if (selectedFilter === 'shop') {
      const config = getPhotoSaleConfig(photo);
      return config.isForSale;
    }
    if (selectedFilter === 'purchased') {
      return isPhotoPurchased(photo.id);
    }
    if (selectedFilter === 'featured') {
      return photo.isFeatured;
    }
    if (selectedFilter === 'groups') {
      return photo.isGroup || photo.tags.length > 1;
    }
    return true;
  });

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name} no meflagrou.com`,
        text: `Confira os flagras oficiais e fotos em Ultra HD 8K de ${user.name}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link do perfil copiado!');
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleNotifyPhotographers = (partyName: string) => {
    setToastMessage(`Presença confirmada no ${partyName}! Fotógrafos avisados.`);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="unified-profile-page-container">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="profile-floating-toast">
          <Check size={16} color="var(--accent-teal)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Barra Superior Unificada (Voltar ao Feed, Logo e Ações) */}
      <header className="profile-unified-top-bar">
        <button
          onClick={onLockSession}
          className="profile-back-to-feed-btn"
          title="Voltar ao Feed de Fotos"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Feed</span>
        </button>

        <div className="profile-brand-header-center">
          <MeflagrouLogo height={28} animated={true} />
        </div>

        <div className="profile-header-actions-right">
          <label className="profile-top-action-pill change-photo-pill" title="Mudar Foto de Perfil">
            <Camera size={13} />
            <span>Mudar Foto</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={() => triggerInstall(() => setIsInstallModalOpen(true))}
            className="profile-top-action-pill"
            title="Instalar aplicativo PWA"
          >
            <Download size={13} />
            <span>📲 Instalar App</span>
          </button>

          <button
            onClick={() => setIsHubMenuOpen(true)}
            className="profile-top-vip-menu-btn"
            title="Abrir Menu VIP"
          >
            <Menu size={14} />
            <span>Menu VIP</span>
          </button>
        </div>
      </header>

      {/* 2. 🌟 BLOCO ÚNICO DE BIO INTEGRADO AO FEED (100% Full Width) */}
      <section className="profile-unified-hero-card">
        {/* Glow ambient background */}
        <div className="profile-hero-ambient-glow" />

        <div className="profile-hero-main-row">
          {/* Avatar com Anel Biométrico & Botão de Alteração */}
          <div className="profile-hero-avatar-wrap">
            <img
              src={user.avatar}
              alt={user.name}
              className="profile-hero-avatar-img"
            />
            <label 
              className="profile-hero-change-photo-btn" 
              title="Clique para Mudar Foto de Perfil"
            >
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
            <div 
              className={`profile-hero-badge-corner ${isDeusProfile ? 'founder' : 'vip'}`}
              title="Identidade Biométrica 8K Validada"
            >
              {isDeusProfile ? <Crown size={14} /> : <ShieldCheck size={14} />}
            </div>
          </div>

          {/* Dados do Usuário & Bio */}
          <div className="profile-hero-info-column">
            <div className="profile-hero-title-row">
              <h1 className="profile-hero-user-name">{user.name}</h1>
              <span className={`profile-hero-tier-tag ${isDeusProfile ? 'founder' : 'vip'}`}>
                <Award size={12} />
                {isDeusProfile ? 'FOUNDER MASTER' : 'VIP Diamond'}
              </span>
            </div>

            <div className="profile-hero-meta-row">
              <span className="profile-hero-handle">
                <InstagramIcon size={13} color="var(--accent-cyan)" />
                @{user.handle}
              </span>
              <span className="profile-meta-dot">•</span>
              <span className="profile-hero-location">
                <MapPin size={12} color="var(--text-muted)" />
                {(() => {
                  if (!user.city && !user.state) return 'São Paulo, SP';
                  const rawCity = user.city || '';
                  if (rawCity.includes(',')) {
                    const parts = rawCity.split(',').map((s) => s.trim()).filter(Boolean);
                    if (parts.length >= 2) {
                      return `${parts[0]}, ${parts[1]}`;
                    }
                    return `${parts[0]}, ${user.state || 'SP'}`;
                  }
                  return `${rawCity || 'São Paulo'}, ${user.state || 'SP'}`;
                })()}
              </span>
            </div>

            <p className="profile-hero-bio-text">{user.bio}</p>

            {/* Linha de Métricas / Estatísticas */}
            <div className="profile-hero-stats-strip">
              <div className="hero-stat-box">
                <strong className="stat-num">{userPhotos.length}</strong>
                <span className="stat-lbl">{isDeusProfile ? 'Vault' : 'Flagras'}</span>
              </div>
              <div className="hero-stat-box stat-divider">
                <strong className="stat-num text-cyan">{user.eventsCount}</strong>
                <span className="stat-lbl">Festas</span>
              </div>
              <div className="hero-stat-box stat-divider">
                <strong className="stat-num text-magenta">{user.topFriends.length}</strong>
                <span className="stat-lbl">Conexões</span>
              </div>

              {/* Saldo / Ganhos PIX */}
              <div 
                onClick={openSellerDashboard}
                className="hero-stat-box stat-wallet-box"
                title="Ver extrato e solicitar saque via PIX"
              >
                <div className="wallet-amount-row">
                  <DollarSign size={13} color={isDeusProfile ? '#ffb703' : 'var(--accent-teal)'} />
                  <strong className="wallet-num">
                    R$ {sellerProfile.availableBalance.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
                <span className="wallet-lbl">
                  {isDeusProfile ? 'Conta DEUS (9%) PIX →' : 'Ganhos PIX →'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Ações Rápidas em Pílulas */}
        <div className="profile-hero-action-buttons-grid">
          <button
            onClick={() => setIsRecapModalOpen(true)}
            className="hero-action-btn recap"
          >
            <Film size={12} />
            <span>Recap (9s)</span>
          </button>

          <button
            onClick={() => setIsVipClubOpen(true)}
            className="hero-action-btn vip"
          >
            <Crown size={12} />
            <span>Passaporte VIP</span>
          </button>

          <button
            onClick={() => setIsBattleModalOpen(true)}
            className="hero-action-btn battle"
          >
            <Swords size={12} color="#ff007a" />
            <span>Batalha 1x1</span>
          </button>

          <button
            onClick={() => setIsWhatsAppAlertOpen(true)}
            className="hero-action-btn whatsapp"
          >
            <MessageSquare size={12} color="#25D366" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setIsPartyModeQrOpen(true)}
            className="hero-action-btn party"
          >
            <QrCode size={12} />
            <span>Modo Balada</span>
          </button>

          <button
            onClick={() => setIsAffiliateOpen(true)}
            className="hero-action-btn affiliate"
          >
            <Users size={12} />
            <span>Indicar (10%)</span>
          </button>

          <button
            onClick={() => setIsClientUploadOpen(true)}
            className="hero-action-btn upload"
          >
            <PlusCircle size={12} />
            <span>Postar Foto</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="hero-action-btn share"
          >
            <Share2 size={12} />
            <span>Compartilhar</span>
          </button>
        </div>

        {/* 4. Conquistas & Find My Squad em Linha */}
        <div className="profile-hero-sub-strips">
          {/* Conquistas VIP */}
          <div className="profile-sub-strip-block">
            <div className="sub-strip-header">
              <Award size={13} color="#ffb703" />
              <span>Conquistas & Selos VIP ({userAchievements.length})</span>
            </div>
            <div className="achievements-horizontal-row no-scrollbar">
              {userAchievements.map((ach) => (
                <div key={ach.id} className="achievement-pill-badge">
                  <span className="ach-icon">{ach.icon}</span>
                  <div className="ach-texts">
                    <strong>{ach.title}</strong>
                    <span>{ach.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Find My Squad */}
          {user.topFriends.length > 0 && (
            <div className="profile-sub-strip-block">
              <div className="sub-strip-header">
                <Users size={13} color="var(--accent-cyan)" />
                <span>Find My Squad:</span>
              </div>
              <div className="squad-friends-row no-scrollbar">
                {user.topFriends.map((f) => {
                  const friend = MOCK_USERS.find((u) => u.id === f.userId);
                  if (!friend) return null;
                  const isSelected = selectedSquadFriendId === friend.id;
                  return (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedSquadFriendId(isSelected ? null : friend.id)}
                      className={`squad-friend-pill ${isSelected ? 'active' : ''}`}
                    >
                      <img src={friend.avatar} alt={friend.name} className="squad-avatar" />
                      <span>{friend.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Próximas Festas com Fotógrafos meflagrou.com */}
      <section className="profile-upcoming-festivals-banner">
        <div className="upcoming-left-content">
          <div className="calendar-icon-wrap">
            <CalendarDays size={18} color="var(--accent-teal)" />
          </div>
          <div>
            <h4 className="upcoming-title">Próximas Festas com Fotógrafos meflagrou.com</h4>
            <p className="upcoming-desc">Avise a equipe que você vai para ser flagrado(a) nos melhores ângulos.</p>
          </div>
        </div>

        <div className="upcoming-action-chips">
          <button
            onClick={() => handleNotifyPhotographers('Ultra Brasil 2026')}
            className="upcoming-confirm-chip"
          >
            <PartyPopper size={12} color="var(--accent-teal)" />
            <span>Ultra Brasil (Confirmar)</span>
          </button>

          <button
            onClick={() => handleNotifyPhotographers('Warung Beach Club')}
            className="upcoming-confirm-chip"
          >
            <PartyPopper size={12} color="var(--accent-cyan)" />
            <span>Warung Beach (Confirmar)</span>
          </button>
        </div>
      </section>

      {/* 6. Categorias e Filtros da Galeria */}
      <nav className="profile-gallery-filter-navbar">
        {/* Main Category Tabs */}
        <div className="gallery-main-tabs-row no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`gallery-filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
          >
            {isDeusProfile ? `👑 Master Vault (${userPhotos.length})` : `Todos os Flagras (${userPhotos.length})`}
          </button>

          <button
            onClick={() => setSelectedFilter('shop')}
            className={`gallery-filter-tab ${selectedFilter === 'shop' ? 'active' : ''}`}
          >
            <Store size={13} />
            <span>{isDeusProfile ? 'À Venda' : 'Minha Loja'}</span>
          </button>

          <button
            onClick={() => setSelectedFilter('investments')}
            className={`gallery-filter-tab ${selectedFilter === 'investments' ? 'active' : ''}`}
          >
            <Flame size={13} />
            <span>Revendas 2x</span>
          </button>

          <button
            onClick={() => setSelectedFilter('purchased')}
            className={`gallery-filter-tab ${selectedFilter === 'purchased' ? 'active' : ''}`}
          >
            <CheckCircle2 size={13} />
            <span>Adquiridos Ultra HD</span>
          </button>

          <button
            onClick={() => setSelectedFilter('featured')}
            className={`gallery-filter-tab ${selectedFilter === 'featured' ? 'active' : ''}`}
          >
            <Flame size={13} />
            <span>Destaque</span>
          </button>

          <button
            onClick={() => setSelectedFilter('groups')}
            className={`gallery-filter-tab ${selectedFilter === 'groups' ? 'active' : ''}`}
          >
            <Users size={13} />
            <span>Em Grupo</span>
          </button>
        </div>

        {/* Event Chips Row */}
        <div className="gallery-event-chips-row no-scrollbar">
          <button
            onClick={() => setSelectedEventId('all')}
            className={`event-filter-chip ${selectedEventId === 'all' ? 'active' : ''}`}
          >
            Todos os Eventos
          </button>

          {MOCK_EVENTS.map((evt) => (
            <button
              key={evt.id}
              onClick={() => setSelectedEventId(evt.id)}
              className={`event-filter-chip ${selectedEventId === evt.id ? 'active' : ''}`}
            >
              {evt.name}
            </button>
          ))}
        </div>
      </nav>

      {/* 7. Galeria de Fotos 100% Full-Width Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="profile-photos-empty-card">
          <Camera size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3>Nenhum flagra encontrado nesta categoria</h3>
          <p>Tente selecionar outro evento ou filtro acima para ver mais fotos.</p>
          <button
            onClick={() => setIsClientUploadOpen(true)}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.85rem', marginTop: 12 }}
          >
            <PlusCircle size={15} />
            <span>+ Vender Foto do Celular</span>
          </button>
        </div>
      ) : (
        <div className="profile-unified-photos-grid">
          {filteredPhotos.map((photo) => {
            const purchased = isPhotoPurchased(photo.id);

            return (
              <InteractiveStage
                key={photo.id}
                onClick={() => onOpenPhotoModal(photo, filteredPhotos)}
                className="profile-grid-photo-card"
              >
                <div className="photo-card-inner-box">
                  <img
                    src={photo.url}
                    alt={photo.eventName}
                    loading="lazy"
                    className="grid-photo-img"
                  />

                  {/* Top Badges */}
                  <div className="grid-photo-top-badges">
                    <span className="photo-vibe-badge">
                      {photo.vibeLabel || (photo.eventName.includes('Festival') || photo.eventName.includes('Tomorrowland') ? '🔥 Dançando no Drop' : photo.eventName.includes('Bar') || photo.eventName.includes('Lounge') ? '🥂 Brinde VIP' : '✨ Look 8K')}
                    </span>

                    {purchased && (
                      <span className="photo-purchased-badge">
                        <CheckCircle2 size={11} />
                        Ultra HD
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay com Likes e Evento */}
                  <div className="grid-photo-hover-overlay">
                    <div className="overlay-event-info">
                      <span className="overlay-event-title">{photo.eventName}</span>
                      <span className="overlay-likes-count">🔥 {photo.likesCount} curtidas</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPhotoModal(photo, filteredPhotos);
                      }}
                      className="grid-photo-action-btn"
                    >
                      {purchased ? (
                        <>
                          <Download size={13} />
                          <span>Baixar</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} />
                          <span>Comprar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </InteractiveStage>
            );
          })}
        </div>
      )}

      {/* Sub-modals */}
      {editingSalePhoto && (
        <DirectSaleModal
          photo={editingSalePhoto}
          onSavePrice={(photoId, isForSale, price) => {
            setPhotoSaleConfig(photoId, isForSale, price);
            setEditingSalePhoto(null);
          }}
          onClose={() => setEditingSalePhoto(null)}
        />
      )}

      {isClientUploadOpen && (
        <PhotoUploadDashboard
          currentUser={user}
          isOpen={isClientUploadOpen}
          onClose={() => setIsClientUploadOpen(false)}
          onPhotosPublished={() => {
            setIsClientUploadOpen(false);
          }}
        />
      )}

      {isRecapModalOpen && (
        <PartyRecapVideoModal
          user={user}
          photos={userPhotos}
          onClose={() => setIsRecapModalOpen(false)}
        />
      )}

      {isLeaderboardOpen && (
        <LeaderboardHallOfFameModal
          onSelectUser={(u) => {
            setIsLeaderboardOpen(false);
            onSelectUser(u);
          }}
          onSelectPhoto={(p) => {
            setIsLeaderboardOpen(false);
            onOpenPhotoModal(p, userPhotos);
          }}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {isPartyModeQrOpen && (
        <PartyModeOfflineQrModal
          user={user}
          onClose={() => setIsPartyModeQrOpen(false)}
        />
      )}

      {isVipClubOpen && (
        <VipClubSubscriptionModal
          currentUser={user}
          onSubscribed={() => {
            setIsVipClubOpen(false);
          }}
          onClose={() => setIsVipClubOpen(false)}
        />
      )}

      {isWhatsAppAlertOpen && (
        <WhatsAppAlertModal
          currentUser={user}
          onClose={() => setIsWhatsAppAlertOpen(false)}
        />
      )}

      {isBattleModalOpen && (
        <FlagraBattleModal
          onClose={() => setIsBattleModalOpen(false)}
          onOpenPhoto={(photo) => {
            setIsBattleModalOpen(false);
            onOpenPhotoModal(photo, userPhotos);
          }}
          onSelectUser={(u) => {
            setIsBattleModalOpen(false);
            onSelectUser(u);
          }}
        />
      )}

      {isAffiliateOpen && (
        <PhotographerAffiliateModal
          currentUser={user}
          onClose={() => setIsAffiliateOpen(false)}
        />
      )}

      {isPingModalOpen && (
        <PhotographerCallPingModal
          currentUser={user}
          onClose={() => setIsPingModalOpen(false)}
        />
      )}

      {isSquadMatchOpen && (
        <SquadMatchBundleModal
          currentUser={user}
          onClose={() => setIsSquadMatchOpen(false)}
        />
      )}

      {isWristbandOpen && (
        <WristbandCheckInModal
          currentUser={user}
          onClose={() => setIsWristbandOpen(false)}
        />
      )}

      {isLeagueOpen && (
        <PhotographerLeagueRankingModal
          onClose={() => setIsLeagueOpen(false)}
        />
      )}

      {isHubMenuOpen && (
        <FeaturesHubMenuModal
          onClose={() => setIsHubMenuOpen(false)}
          onOpenBattle={() => setIsBattleModalOpen(true)}
          onOpenVipClub={() => setIsVipClubOpen(true)}
          onOpenWhatsAppAlert={() => setIsWhatsAppAlertOpen(true)}
          onOpenLiveTether={() => setIsPartyModeQrOpen(true)}
          onOpenAffiliate={() => setIsAffiliateOpen(true)}
          onOpenPortfolio={() => setIsAffiliateOpen(true)}
          onOpenPingModal={() => setIsPingModalOpen(true)}
          onOpenSquadMatch={() => setIsSquadMatchOpen(true)}
          onOpenWristband={() => setIsWristbandOpen(true)}
          onOpenLeague={() => setIsLeagueOpen(true)}
          onOpenHallOfFame={() => setIsLeaderboardOpen(true)}
        />
      )}

      {isInstallModalOpen && (
        <InstallAppModal
          onClose={() => setIsInstallModalOpen(false)}
        />
      )}
    </div>
  );
};
