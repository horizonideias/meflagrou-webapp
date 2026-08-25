import React, { useState, useMemo, useEffect } from 'react';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import { MOCK_STORIES, getOrderedStories, type StoryItem } from '../data/mockStories';
import { InstagramSidebar } from './InstagramSidebar';
import { InstagramRightSidebar } from './InstagramRightSidebar';
import { InstagramFeed } from './InstagramFeed';
import { SocialProfile } from './SocialProfile';
import { PhotoModalViewer } from './PhotoModalViewer';
import { StoryViewerModal } from './StoryViewerModal';
import { ProfileSwitcherModal } from './ProfileSwitcherModal';
import { StoryShareModal } from './StoryShareModal';
import { BottomMobileNav } from './BottomMobileNav';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { PhotographerSalesDashboard } from './PhotographerSalesDashboard';
import { PartyRadarMapModal } from './PartyRadarMapModal';
import { LeaderboardHallOfFameModal } from './LeaderboardHallOfFameModal';
import { NotificationDrawer } from './NotificationDrawer';
import { PhotoUploadDashboard } from './PhotoUploadDashboard';
import { NewEnrollmentModal } from './NewEnrollmentModal';
import { FeaturesHubMenuModal } from './FeaturesHubMenuModal';
import { FlagraBattleModal } from './FlagraBattleModal';
import { VipClubSubscriptionModal } from './VipClubSubscriptionModal';
import { WhatsAppAlertModal } from './WhatsAppAlertModal';
import { PhotographerLiveTetherModal } from './PhotographerLiveTetherModal';
import { PhotographerAffiliateModal } from './PhotographerAffiliateModal';
import { PhotographerPortfolioModal } from './PhotographerPortfolioModal';
import { PhotographerCallPingModal } from './PhotographerCallPingModal';
import { SquadMatchBundleModal } from './SquadMatchBundleModal';
import { WristbandCheckInModal } from './WristbandCheckInModal';
import { PhotographerLeagueRankingModal } from './PhotographerLeagueRankingModal';
import { PrivacyVaultModal } from './PrivacyVaultModal';
import { FacialScannerModal } from './FacialScannerModal';
import { FestivalHeatmapModal } from './FestivalHeatmapModal';
import { ReferralCashbackModal } from './ReferralCashbackModal';
import { FlagrantesSearchModal } from './FlagrantesSearchModal';
import { FullscreenPhotoSlideshowModal } from './FullscreenPhotoSlideshowModal';
import { AntiScreenCaptureShield } from './AntiScreenCaptureShield';
import { AuthGatekeeperPage } from './AuthGatekeeperPage';
import { CommunityLiveChatModal } from './CommunityLiveChatModal';
import { MeflagrouLogo } from './MeflagrouLogo';
import { useCart } from '../context/CartContext';
import { dbService } from '../services/databaseService';
import { Bell, ShoppingBag, Users, X, Check, Search, LogOut } from 'lucide-react';

export const InstagramApp: React.FC = () => {
  // Persistent users list (Custom enrolled users + MOCK_USERS)
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('meflagrou_registered_users');
      if (saved) {
        const customUsers: UserProfile[] = JSON.parse(saved);
        const existingIds = new Set(customUsers.map((u) => u.id));
        return [...customUsers, ...MOCK_USERS.filter((u) => !existingIds.has(u.id))];
      }
    } catch {
      // fallback
    }
    return MOCK_USERS;
  });

  // Mandatory Authentication / Gatekeeper State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem('meflagrou_active_session');
      if (!session) return false;
      const parsed = JSON.parse(session);
      return !!(parsed && typeof parsed === 'object' && parsed.id && parsed.name);
    } catch {
      return false;
    }
  });

  // Current logged-in user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const session = localStorage.getItem('meflagrou_active_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
          if (parsed.city && parsed.city.includes(',')) {
            const parts = parsed.city.split(',').map((s: string) => s.trim()).filter(Boolean);
            parsed.city = parts[0];
            if (parts.length > 1) {
              parsed.state = parts[1];
            }
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return allUsers[0] || MOCK_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');

  // Modals & Viewers
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState<EventPhoto | null>(null);
  const [modalPhotosList, setModalPhotosList] = useState<EventPhoto[]>(MOCK_PHOTOS);
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [sharingStoryPhoto, setSharingStoryPhoto] = useState<EventPhoto | null>(null);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState<boolean>(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Fullscreen Photo Grid & Slideshow Mode
  const [isFullscreenSlideshowOpen, setIsFullscreenSlideshowOpen] = useState<boolean>(false);
  const [fullscreenSlideMode, setFullscreenSlideMode] = useState<'grid' | 'slideshow'>('grid');
  const [fullscreenInitialPhoto, setFullscreenInitialPhoto] = useState<EventPhoto | null>(null);

  const handleOpenFullscreenGridOrSlide = (photo?: EventPhoto, mode: 'grid' | 'slideshow' = 'grid') => {
    setFullscreenInitialPhoto(photo || null);
    setFullscreenSlideMode(mode);
    setIsFullscreenSlideshowOpen(true);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('meflagrou_active_session', JSON.stringify(user));
    } catch {
      // safe fallback
    }
    setUploadSuccessToast(`👋 Bem-vindo de volta, ${user.name.split(' ')[0]}! Acesso ao meflagrou.com liberado.`);
    setTimeout(() => setUploadSuccessToast(null), 4500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterSuccess = (newUser: UserProfile) => {
    setAllUsers((prev) => {
      const updated = [newUser, ...prev.filter((u) => u.id !== newUser.id)];
      try {
        const customOnly = updated.filter(
          (u) => u.id !== 'user_founder' && !u.id.startsWith('seed_user_')
        );
        localStorage.setItem('meflagrou_registered_users', JSON.stringify(customOnly));
        localStorage.setItem('meflagrou_active_session', JSON.stringify(newUser));
      } catch {
        // safe fallback
      }
      return updated;
    });

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveTab('profile');
    setUploadSuccessToast(
      `🎉 Bem-vindo ao meflagrou, ${newUser.name}! Seu cadastro com IA Face ID foi ativado e seu acesso está liberado!`
    );
    setTimeout(() => setUploadSuccessToast(null), 5000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateUserAvatar = (newAvatarUrl: string) => {
    const updatedUser: UserProfile = {
      ...currentUser,
      avatar: newAvatarUrl,
    };
    setCurrentUser(updatedUser);
    setAllUsers((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      try {
        const customOnly = updated.filter(
          (u) => u.id !== 'user_founder' && !u.id.startsWith('seed_user_')
        );
        localStorage.setItem('meflagrou_registered_users', JSON.stringify(customOnly));
        localStorage.setItem('meflagrou_active_session', JSON.stringify(updatedUser));
      } catch {
        // safe fallback
      }
      return updated;
    });
    dbService.saveUser(updatedUser);
    setUploadSuccessToast('📸 Foto de perfil atualizada com sucesso!');
    setTimeout(() => setUploadSuccessToast(null), 4000);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('meflagrou_active_session');
    } catch {
      // safe fallback
    }
    setIsAuthenticated(false);
  };

  // Handle Enrollment from inside modal
  const handleEnrollmentComplete = (newUser: UserProfile) => {
    handleRegisterSuccess(newUser);
    setIsEnrollmentOpen(false);
  };

  // Features Modals
  const [isRadarOpen, setIsRadarOpen] = useState<boolean>(false);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState<boolean>(false);
  const [isHallOfFameOpen, setIsHallOfFameOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isWhatsAppAlertOpen, setIsWhatsAppAlertOpen] = useState<boolean>(false);
  const [isPhotographerUploadOpen, setIsPhotographerUploadOpen] = useState<boolean>(false);
  const [isGlobalFeaturesHubOpen, setIsGlobalFeaturesHubOpen] = useState<boolean>(false);
  const [isPrivacyVaultOpen, setIsPrivacyVaultOpen] = useState<boolean>(false);
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState<boolean>(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState<boolean>(false);

  // VIP Sub-modals
  const [isVipClubOpen, setIsVipClubOpen] = useState<boolean>(false);
  const [isLiveTetherOpen, setIsLiveTetherOpen] = useState<boolean>(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState<boolean>(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState<boolean>(false);
  const [isSquadMatchOpen, setIsSquadMatchOpen] = useState<boolean>(false);
  const [isWristbandOpen, setIsWristbandOpen] = useState<boolean>(false);
  const [isLeagueOpen, setIsLeagueOpen] = useState<boolean>(false);

  const { cart, openCart, clientPublishedPhotos } = useCart();

  useEffect(() => {
    dbService.init().catch(console.error);
  }, []);

  // Dynamic Stories ordering: Logged-in user always at Index 0
  const orderedStories = useMemo(() => {
    return getOrderedStories(currentUser, MOCK_STORIES);
  }, [currentUser]);

  // All combined photos
  const allCombinedPhotos = useMemo(() => {
    const combined = [...clientPublishedPhotos, ...MOCK_PHOTOS];
    return Array.from(new Map(combined.map((p) => [p.id, p])).values());
  }, [clientPublishedPhotos]);

  const handleOpenPhotoModal = (photo: EventPhoto, list?: EventPhoto[]) => {
    setActiveModalPhoto(photo);
    setModalPhotosList(list && list.length > 0 ? list : allCombinedPhotos);
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUserDirectly = (user: UserProfile) => {
    setCurrentUser(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔒 MANDATORY GATEKEEPER CHECK: Only authenticated/registered visitors can enter meflagrou.com
  if (!isAuthenticated || !currentUser) {
    return (
      <AuthGatekeeperPage
        allUsers={allUsers}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <div className="instagram-layout-root">
      {/* 📱 Mobile Top Header */}
      <header className="mobile-top-header">
        <div className="mobile-brand-row" onClick={() => { setActiveTab('feed'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <MeflagrouLogo height={28} animated={true} />
        </div>

        <div className="mobile-header-actions">
          {/* Search Flagrantes */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="mobile-header-btn"
            title="Buscar Flagrantes (Usuários)"
          >
            <Search size={18} />
          </button>

          {/* Switch Profiles / Users */}
          <button
            onClick={() => setIsProfileSwitcherOpen(true)}
            className="mobile-header-btn"
            title="Alternar Perfil"
          >
            <Users size={18} />
          </button>

          {/* Logout on mobile */}
          <button
            onClick={handleLogout}
            className="mobile-header-btn"
            style={{ color: '#ff70a6' }}
            title="Sair da Conta"
          >
            <LogOut size={17} />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="mobile-header-btn"
            title="Notificações"
          >
            <Bell size={18} />
          </button>

          {/* Cart Icon with badge */}
          <button
            onClick={openCart}
            className="mobile-header-btn mobile-cart-btn"
            title="Carrinho de Compras"
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="mobile-cart-badge">{cart.length}</span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* 💻 Instagram Main Workspace Grid */}
      <div className="instagram-workspace-grid">
        {/* 1. Left Sidebar Navigation */}
        <InstagramSidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenRadar={() => setIsRadarOpen(true)}
          onOpenBattle={() => setIsBattleModalOpen(true)}
          onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenWhatsAppAlert={() => setIsWhatsAppAlertOpen(true)}
          onOpenUpload={() => setIsPhotographerUploadOpen(true)}
          onOpenVipHub={() => setIsGlobalFeaturesHubOpen(true)}
          onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
          onOpenHeatmap={() => setIsHeatmapOpen(true)}
          onOpenReferral={() => setIsReferralOpen(true)}
          onOpenCommunityChat={() => setIsCommunityChatOpen(true)}
          onLogout={handleLogout}
        />

        {/* 2. Main Central Content Column */}
        <main className="instagram-main-content">
          {activeTab === 'feed' ? (
            <InstagramFeed
              currentUser={currentUser}
              allUsers={allUsers}
              stories={orderedStories}
              allPhotos={allCombinedPhotos}
              onOpenStory={(story) => setActiveStory(story)}
              onOpenPhotoModal={(photo) => handleOpenPhotoModal(photo)}
              onSelectUser={handleSelectUser}
              onOpenStoryShare={(p) => setSharingStoryPhoto(p)}
              onOpenUpload={() => setIsPhotographerUploadOpen(true)}
              onOpenBattle={() => setIsBattleModalOpen(true)}
              onOpenFaceScanner={() => setIsFaceScannerOpen(true)}
              onOpenWhatsAppAlert={() => setIsWhatsAppAlertOpen(true)}
              onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
              onOpenRadar={() => setIsRadarOpen(true)}
              onOpenVipHub={() => setIsGlobalFeaturesHubOpen(true)}
              onOpenFullscreenGrid={handleOpenFullscreenGridOrSlide}
            />
          ) : (
            <div className="instagram-profile-wrapper">
              <SocialProfile
                user={currentUser}
                onOpenPhotoModal={(photo, list) => handleOpenPhotoModal(photo, list)}
                onSelectUser={(u) => handleSelectUser(u)}
                onLockSession={() => setActiveTab('feed')}
                onUpdateAvatar={handleUpdateUserAvatar}
              />
            </div>
          )}
        </main>

        {/* 3. Right Sidebar Widgets (Desktop Only) */}
        <InstagramRightSidebar
          currentUser={currentUser}
          allPhotos={allCombinedPhotos}
          onSelectUser={handleSelectUser}
          onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
          onOpenRadar={() => setIsRadarOpen(true)}
          onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
          onOpenBattle={() => setIsBattleModalOpen(true)}
          onOpenPhotoModal={(photo) => handleOpenPhotoModal(photo)}
          onOpenCommunityChat={() => setIsCommunityChatOpen(true)}
        />
      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <BottomMobileNav
        currentUser={currentUser}
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenUpload={() => setIsPhotographerUploadOpen(true)}
        onOpenBattle={() => setIsBattleModalOpen(true)}
        onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
      />

      {/* 🎬 MODALS & POPUPS */}

      {/* 9:16 Instagram Stories Frame Generator Modal */}
      {sharingStoryPhoto && (
        <StoryShareModal
          photo={sharingStoryPhoto}
          currentUser={currentUser}
          onClose={() => setSharingStoryPhoto(null)}
        />
      )}

      {/* Photo Detail Modal Viewer (Clean, No Bounding Boxes) */}
      {activeModalPhoto && (
        <PhotoModalViewer
          photo={activeModalPhoto}
          photosList={modalPhotosList}
          currentUser={currentUser}
          onClose={() => setActiveModalPhoto(null)}
          onSelectUserByTag={(userId) => {
            const found = allUsers.find((u) => u.id === userId) || MOCK_USERS.find((u) => u.id === userId);
            if (found) handleSelectUser(found);
          }}
          onPhotoChange={(newPhoto) => setActiveModalPhoto(newPhoto)}
        />
      )}

      {/* Stories Viewer Modal (Ordered with Logged User first & Auto-progression) */}
      {activeStory && (
        <StoryViewerModal
          initialStory={activeStory}
          storiesList={orderedStories}
          currentUser={currentUser}
          onClose={() => setActiveStory(null)}
          onSelectUser={handleSelectUser}
        />
      )}

      {/* Profile Switcher Modal */}
      {isProfileSwitcherOpen && (
        <ProfileSwitcherModal
          currentUser={currentUser}
          allUsers={allUsers}
          onSelectUser={handleSwitchUserDirectly}
          onClose={() => setIsProfileSwitcherOpen(false)}
          onOpenNewEnrollment={() => setIsEnrollmentOpen(true)}
        />
      )}

      {/* New User Biometric Enrollment Modal */}
      {isEnrollmentOpen && (
        <NewEnrollmentModal
          onClose={() => setIsEnrollmentOpen(false)}
          onEnrollmentComplete={handleEnrollmentComplete}
        />
      )}

      {/* Shopping Cart Drawer & Checkout */}
      <CartDrawer />
      <CheckoutModal currentUser={currentUser} />

      {/* Photographer Sales Dashboard */}
      <PhotographerSalesDashboard />

      {/* Party Radar Map GPS */}
      {isRadarOpen && <PartyRadarMapModal onClose={() => setIsRadarOpen(false)} />}

      {/* Hall da Fama & Ranking Modal */}
      {isHallOfFameOpen && (
        <LeaderboardHallOfFameModal
          onClose={() => setIsHallOfFameOpen(false)}
          onSelectUser={(u) => {
            handleSelectUser(u);
            setIsHallOfFameOpen(false);
          }}
          onSelectPhoto={(p) => {
            handleOpenPhotoModal(p);
            setIsHallOfFameOpen(false);
          }}
        />
      )}

      {/* Notification Drawer */}
      {isNotificationsOpen && (
        <NotificationDrawer onClose={() => setIsNotificationsOpen(false)} />
      )}

      {/* Photo Upload Studio Dashboard */}
      {isPhotographerUploadOpen && (
        <PhotoUploadDashboard
          currentUser={currentUser}
          isOpen={isPhotographerUploadOpen}
          onClose={() => setIsPhotographerUploadOpen(false)}
          onPhotosPublished={(photos) => {
            setIsPhotographerUploadOpen(false);
            handleSelectUser(currentUser);
            setUploadSuccessToast(`📸 ${photos.length} flagras publicados com sucesso no seu perfil!`);
            setTimeout(() => setUploadSuccessToast(null), 4000);
          }}
        />
      )}

      {/* Global Features Hub VIP Modal */}
      {isGlobalFeaturesHubOpen && (
        <FeaturesHubMenuModal
          onClose={() => setIsGlobalFeaturesHubOpen(false)}
          onOpenBattle={() => setIsBattleModalOpen(true)}
          onOpenVipClub={() => setIsVipClubOpen(true)}
          onOpenWhatsAppAlert={() => setIsWhatsAppAlertOpen(true)}
          onOpenLiveTether={() => setIsLiveTetherOpen(true)}
          onOpenAffiliate={() => setIsAffiliateOpen(true)}
          onOpenPortfolio={() => setIsPortfolioOpen(true)}
          onOpenPingModal={() => setIsPingModalOpen(true)}
          onOpenSquadMatch={() => setIsSquadMatchOpen(true)}
          onOpenWristband={() => setIsWristbandOpen(true)}
          onOpenLeague={() => setIsLeagueOpen(true)}
          onOpenRadar={() => setIsRadarOpen(true)}
          onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
        />
      )}

      {/* Sub-modals */}
      {isBattleModalOpen && (
        <FlagraBattleModal
          onClose={() => setIsBattleModalOpen(false)}
          onOpenPhoto={(p) => {
            setIsBattleModalOpen(false);
            handleOpenPhotoModal(p);
          }}
          onSelectUser={(u) => {
            setIsBattleModalOpen(false);
            handleSelectUser(u);
          }}
        />
      )}

      {isVipClubOpen && (
        <VipClubSubscriptionModal
          currentUser={currentUser}
          onClose={() => setIsVipClubOpen(false)}
          onSubscribed={(tier) => {
            alert(`🎉 Parabéns! Você agora é membro ${tier} do meflagrou!`);
          }}
        />
      )}

      {isWhatsAppAlertOpen && (
        <WhatsAppAlertModal
          currentUser={currentUser}
          onClose={() => setIsWhatsAppAlertOpen(false)}
        />
      )}

      {/* Biometric AI Face ID Scanner Modal */}
      {isFaceScannerOpen && (
        <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto' }}>
            <button
              onClick={() => setIsFaceScannerOpen(false)}
              className="btn-icon"
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 200 }}
              title="Fechar"
            >
              <X size={18} />
            </button>
            <FacialScannerModal
              onAuthenticated={(user, targetPhoto) => {
                handleSelectUser(user);
                setIsFaceScannerOpen(false);
                if (targetPhoto) {
                  handleOpenPhotoModal(targetPhoto);
                }
              }}
              onOpenEnrollment={() => {}}
              onOpenRadar={() => {
                setIsFaceScannerOpen(false);
                setIsRadarOpen(true);
              }}
              onOpenHallOfFame={() => {
                setIsFaceScannerOpen(false);
                setIsHallOfFameOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isLiveTetherOpen && (
        <PhotographerLiveTetherModal onClose={() => setIsLiveTetherOpen(false)} />
      )}

      {isAffiliateOpen && (
        <PhotographerAffiliateModal
          currentUser={currentUser}
          onClose={() => setIsAffiliateOpen(false)}
        />
      )}

      {isPortfolioOpen && (
        <PhotographerPortfolioModal onClose={() => setIsPortfolioOpen(false)} />
      )}

      {isPingModalOpen && (
        <PhotographerCallPingModal
          currentUser={currentUser}
          onClose={() => setIsPingModalOpen(false)}
        />
      )}

      {isSquadMatchOpen && (
        <SquadMatchBundleModal
          currentUser={currentUser}
          onClose={() => setIsSquadMatchOpen(false)}
        />
      )}

      {isWristbandOpen && (
        <WristbandCheckInModal
          currentUser={currentUser}
          onClose={() => setIsWristbandOpen(false)}
        />
      )}

      {isLeagueOpen && (
        <PhotographerLeagueRankingModal onClose={() => setIsLeagueOpen(false)} />
      )}

      {isPrivacyVaultOpen && (
        <PrivacyVaultModal 
          user={currentUser}
          onBiometricWipe={() => {
            alert('🔒 Dados biométricos e histórico facial limpos com sucesso.');
            setIsPrivacyVaultOpen(false);
          }}
          onClose={() => setIsPrivacyVaultOpen(false)} 
        />
      )}

      {isHeatmapOpen && (
        <FestivalHeatmapModal
          isOpen={isHeatmapOpen}
          onClose={() => setIsHeatmapOpen(false)}
          allPhotos={allCombinedPhotos}
          onOpenPhotoModal={(photo) => handleOpenPhotoModal(photo)}
        />
      )}

      {isReferralOpen && (
        <ReferralCashbackModal
          isOpen={isReferralOpen}
          onClose={() => setIsReferralOpen(false)}
          userName={currentUser.name}
        />
      )}

      {/* 💬 Comunidade VIP & Chat Online em Tempo Real */}
      {isCommunityChatOpen && (
        <CommunityLiveChatModal
          currentUser={currentUser}
          isOpen={isCommunityChatOpen}
          onClose={() => setIsCommunityChatOpen(false)}
          onSelectUser={(u) => {
            setIsCommunityChatOpen(false);
            handleSelectUser(u);
          }}
          onOpenPhoto={(p) => {
            setIsCommunityChatOpen(false);
            handleOpenPhotoModal(p);
          }}
        />
      )}

      {/* 🔍 Flagrantes & Global Search Modal */}
      {isSearchModalOpen && (
        <FlagrantesSearchModal
          isOpen={isSearchModalOpen}
          allUsers={allUsers}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectUser={handleSelectUser}
          onSelectPhoto={(photo) => handleOpenPhotoModal(photo)}
        />
      )}

      {/* 🖼️ Fullscreen Photo Grid Mosaic & Auto-Play Slideshow */}
      {isFullscreenSlideshowOpen && (
        <FullscreenPhotoSlideshowModal
          isOpen={isFullscreenSlideshowOpen}
          initialMode={fullscreenSlideMode}
          initialPhoto={fullscreenInitialPhoto}
          photos={allCombinedPhotos}
          currentUser={currentUser}
          onClose={() => setIsFullscreenSlideshowOpen(false)}
          onSelectUser={handleSelectUser}
        />
      )}

      {/* 🚀 Global Floating Upload Success Banner */}
      {uploadSuccessToast && (
        <div className="profile-floating-toast" style={{ zIndex: 100000 }}>
          <Check size={18} color="var(--accent-teal)" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* 🛡️ Digital Anti-Print & Screen Protection Shield */}
      <AntiScreenCaptureShield onOpenCart={openCart} />
    </div>
  );
};
