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
  ShoppingBag,
  Edit3
} from 'lucide-react';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_PHOTOS, MOCK_USERS, MOCK_EVENTS } from '../data/mockDatabase';
import { generateUserSamplePhotos } from '../data/userPhotoGenerator';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { InstallAppModal } from './InstallAppModal';
import { InstagramIcon, TikTokIcon, XIcon } from './Icons';
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
import { EditProfileRegistrationModal } from './EditProfileRegistrationModal';
import { SelectAvatarFromGalleryModal } from './SelectAvatarFromGalleryModal';
import { MeflagrouLogo } from './MeflagrouLogo';
import { maskCPF, formatWhatsAppPhone } from '../utils/securityUtils';

interface SocialProfileProps {
  user: UserProfile;
  currentUser?: UserProfile;
  onOpenPhotoModal: (photo: EventPhoto, photoList: EventPhoto[]) => void;
  onSelectUser: (user: UserProfile) => void;
  onLockSession: () => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
  onUpdateProfile?: (updatedUser: UserProfile) => void;
}

export const SocialProfile: React.FC<SocialProfileProps> = ({
  user,
  currentUser,
  onOpenPhotoModal,
  onSelectUser,
  onLockSession,
  onUpdateAvatar,
  onUpdateProfile,
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
  const isOwnProfile = currentUser ? currentUser.id === user.id : true;
  const isFounderProfile = user.id === 'user_founder';
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedSquadFriendId, setSelectedSquadFriendId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Modals
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isSelectAvatarModalOpen, setIsSelectAvatarModalOpen] = useState<boolean>(false);
  const [isEditRegistrationOpen, setIsEditRegistrationOpen] = useState<boolean>(false);
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

  const handleSaveRegistration = (updatedUser: UserProfile) => {
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    setToastMessage('✅ Cadastro e dados oficiais atualizados com sucesso!');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3500);
  };

  // Aggregate photos for this profile from all persistent stores
  const savedUserPhotos = getUserSavedPhotos(user.id);
  const existingPhotos = isFounderProfile
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
  const userPhotos = isFounderProfile 
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
          {isOwnProfile && (
            <button
              onClick={() => setIsEditRegistrationOpen(true)}
              className="profile-top-action-pill edit-registration-pill"
              title="Editar Cadastro Oficial e Redes Sociais"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(255, 0, 122, 0.18))',
                borderColor: 'rgba(0, 240, 255, 0.5)',
                color: '#fff',
                fontWeight: 700
              }}
            >
              <Edit3 size={13} color="var(--accent-cyan)" />
              <span>⚙️ Cadastro & Dados</span>
            </button>
          )}

          {isOwnProfile && (
            <button
              onClick={() => setIsSelectAvatarModalOpen(true)}
              className="profile-top-action-pill select-avatar-pill"
              title="Escolher Foto de Perfil da sua Galeria Comprada"
              style={{
                background: 'rgba(0, 240, 255, 0.12)',
                borderColor: 'rgba(0, 240, 255, 0.35)',
                color: '#fff',
                fontWeight: 600
              }}
            >
              <Camera size={13} color="var(--accent-cyan)" />
              <span>Foto de Perfil</span>
            </button>
          )}

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
          {/* Avatar com Anel Biométrico & Botão de Seleção da Galeria */}
          <div 
            className="profile-hero-avatar-wrap"
            onClick={() => isOwnProfile && setIsSelectAvatarModalOpen(true)}
            style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            title={isOwnProfile ? "Clique para escolher uma foto da sua galeria de fotos compradas" : user.name}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="profile-hero-avatar-img"
            />
            {isOwnProfile && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelectAvatarModalOpen(true);
                }}
                className="profile-hero-change-photo-btn" 
                title="Escolher Foto de Perfil da sua Galeria Comprada"
              >
                <Camera size={14} />
              </button>
            )}
            <div 
              className={`profile-hero-badge-corner ${isFounderProfile ? 'founder' : 'vip'}`}
              title="Identidade Biométrica 8K Validada"
            >
              {isFounderProfile ? <Crown size={14} /> : <ShieldCheck size={14} />}
            </div>
          </div>

          {/* Dados do Usuário & Bio */}
          <div className="profile-hero-info-column">
            <div className="profile-hero-title-row">
              <h1 className="profile-hero-user-name">{user.name}</h1>
              <span className={`profile-hero-tier-tag ${isFounderProfile ? 'founder' : 'vip'}`}>
                <Award size={12} />
                {isFounderProfile ? 'FOUNDER MASTER' : 'VIP Diamond'}
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
                <span className="stat-lbl">{isFounderProfile ? 'Vault' : 'Flagras'}</span>
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
                  <DollarSign size={13} color={isFounderProfile ? '#ffb703' : 'var(--accent-teal)'} />
                  <strong className="wallet-num">
                    R$ {sellerProfile.availableBalance.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
                <span className="wallet-lbl">
                  {isFounderProfile ? 'Conta Master (9%) PIX →' : 'Ganhos PIX →'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Ações Rápidas em Pílulas */}
        <div className="profile-hero-action-buttons-grid">
          {isOwnProfile && (
            <button
              onClick={() => setIsEditRegistrationOpen(true)}
              className="hero-action-btn edit-reg"
              style={{
                background: 'rgba(0, 240, 255, 0.12)',
                borderColor: 'rgba(0, 240, 255, 0.35)',
                color: 'var(--accent-cyan)'
              }}
            >
              <Edit3 size={12} color="var(--accent-cyan)" />
              <span>Cadastro & Dados</span>
            </button>
          )}

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

        {/* 3.5 🛡️ BLOCO DE CADASTRO OFICIAL, ENDEREÇO & REDES SOCIAIS */}
        <div 
          className="profile-official-registration-badge-card"
          style={{
            marginTop: 14,
            padding: '16px 18px',
            background: 'linear-gradient(135deg, rgba(14, 18, 30, 0.9) 0%, rgba(8, 10, 16, 0.95) 100%)',
            borderRadius: 16,
            border: '1px solid rgba(0, 240, 255, 0.2)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: 5, borderRadius: 8, background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)', display: 'flex' }}>
                <ShieldCheck size={16} />
              </div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>
                Cadastro Oficial & Identidade VIP
              </h4>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(0, 255, 178, 0.15)', color: 'var(--accent-teal)', border: '1px solid rgba(0, 255, 178, 0.3)' }}>
                ✅ Validado
              </span>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setIsEditRegistrationOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: 8,
                  color: 'var(--accent-cyan)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Editar opções de cadastro"
              >
                <Edit3 size={12} />
                <span>Editar Dados</span>
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px 14px' }}>
            {/* Nome Completo */}
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Nome Verdadeiro:</span>
              <strong style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{user.name}</strong>
            </div>

            {/* CPF Mascarado - Visível APENAS para o próprio usuário (Privacidade Total) */}
            {isOwnProfile && (
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>CPF Oficial (Privado):</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {maskCPF(user.cpf)}
                </strong>
              </div>
            )}

            {/* Estado Civil */}
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Estado Civil:</span>
              <strong style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
                {user.maritalStatus || 'Solteiro(a)'}
              </strong>
            </div>

            {/* WhatsApp */}
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>WhatsApp:</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
                {user.whatsapp || user.phone ? formatWhatsAppPhone(user.whatsapp || user.phone || '') : 'Não informado'}
              </strong>
            </div>

            {/* Endereço Completo */}
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Endereço Residencial:</span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                {user.street 
                  ? `${user.street}${user.number ? ', nº ' + user.number : ''}${user.neighborhood ? ' - ' + user.neighborhood : ''}, ${user.city} - ${user.state || 'SP'}${user.cep ? ' (CEP ' + user.cep + ')' : ''}`
                  : `${user.city || 'São Paulo'}, ${user.state || 'SP'}`}
              </span>
            </div>

            {/* Redes Sociais */}
            <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>
                Redes Sociais Oficiais:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {/* Instagram */}
                <a
                  href={`https://instagram.com/${(user.socialLinks?.instagram || user.handle || '').replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 20,
                    background: 'rgba(225, 48, 108, 0.15)',
                    border: '1px solid rgba(225, 48, 108, 0.35)',
                    color: '#fff',
                    fontSize: '0.76rem',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                  title="Abrir Instagram"
                >
                  <InstagramIcon size={12} color="#E1306C" />
                  <span>@{user.socialLinks?.instagram || user.handle}</span>
                </a>

                {/* TikTok */}
                {user.socialLinks?.tiktok ? (
                  <a
                    href={`https://tiktok.com/@${user.socialLinks.tiktok.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 20,
                      background: 'rgba(255, 0, 122, 0.15)',
                      border: '1px solid rgba(255, 0, 122, 0.35)',
                      color: '#fff',
                      fontSize: '0.76rem',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                    title="Abrir TikTok"
                  >
                    <TikTokIcon size={12} color="#ff007a" />
                    <span>@{user.socialLinks.tiktok.replace(/^@/, '')}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setIsEditRegistrationOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 20,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.74rem',
                      cursor: 'pointer'
                    }}
                  >
                    <TikTokIcon size={12} color="rgba(255,255,255,0.4)" />
                    <span>+ TikTok</span>
                  </button>
                )}

                {/* X */}
                {(user.socialLinks?.x || user.socialLinks?.twitter) ? (
                  <a
                    href={`https://x.com/${(user.socialLinks?.x || user.socialLinks?.twitter || '').replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 20,
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#fff',
                      fontSize: '0.76rem',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                    title="Abrir X (Twitter)"
                  >
                    <XIcon size={11} color="#fff" />
                    <span>@{(user.socialLinks?.x || user.socialLinks?.twitter || '').replace(/^@/, '')}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setIsEditRegistrationOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      borderRadius: 20,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.74rem',
                      cursor: 'pointer'
                    }}
                  >
                    <XIcon size={11} color="rgba(255,255,255,0.4)" />
                    <span>+ X</span>
                  </button>
                )}
              </div>
            </div>
          </div>
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
            {isFounderProfile ? `👑 Master Vault (${userPhotos.length})` : `Todos os Flagras (${userPhotos.length})`}
          </button>

          <button
            onClick={() => setSelectedFilter('shop')}
            className={`gallery-filter-tab ${selectedFilter === 'shop' ? 'active' : ''}`}
          >
            <Store size={13} />
            <span>{isFounderProfile ? 'À Venda' : 'Minha Loja'}</span>
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

                    <div style={{ display: 'flex', gap: 6 }}>
                      {purchased && isOwnProfile && onUpdateAvatar && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateAvatar(photo.url);
                            setToastMessage('✨ Foto definida como foto de perfil!');
                            setCopiedToast(true);
                            setTimeout(() => setCopiedToast(false), 3500);
                          }}
                          className="grid-photo-action-btn avatar-btn"
                          title="Definir esta foto comprada como sua foto de perfil"
                          style={{
                            background: 'rgba(0, 240, 255, 0.2)',
                            borderColor: 'rgba(0, 240, 255, 0.5)',
                            color: '#fff'
                          }}
                        >
                          <Camera size={12} color="var(--accent-cyan)" />
                          <span>Perfil</span>
                        </button>
                      )}

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

      {isEditRegistrationOpen && (
        <EditProfileRegistrationModal
          user={user}
          isOpen={isEditRegistrationOpen}
          onClose={() => setIsEditRegistrationOpen(false)}
          onSave={handleSaveRegistration}
        />
      )}

      {isSelectAvatarModalOpen && (
        <SelectAvatarFromGalleryModal
          currentUser={user}
          photos={userPhotos}
          isOpen={isSelectAvatarModalOpen}
          onClose={() => setIsSelectAvatarModalOpen(false)}
          onSelectAvatar={(newAvatarUrl) => {
            if (onUpdateAvatar) {
              onUpdateAvatar(newAvatarUrl);
            }
            setToastMessage('✨ Foto de perfil atualizada a partir da sua galeria!');
            setCopiedToast(true);
            setTimeout(() => setCopiedToast(false), 3500);
          }}
          onNavigateToFeed={onLockSession}
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

