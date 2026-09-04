import { 
  Home, 
  MapPin, 
  Swords, 
  Trophy, 
  Bell, 
  MessageSquare, 
  PlusSquare, 
  ShoppingBag, 
  Menu, 
  Users,
  Flame,
  Gift,
  Search,
  LogOut,
  Radio
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useCart } from '../context/CartContext';

import { MeflagrouLogo } from './MeflagrouLogo';

interface InstagramSidebarProps {
  currentUser: UserProfile;
  activeTab: 'feed' | 'profile';
  onNavigateTab: (tab: 'feed' | 'profile') => void;
  onOpenRadar: () => void;
  onOpenBattle: () => void;
  onOpenHallOfFame: () => void;
  onOpenNotifications: () => void;
  onOpenWhatsAppAlert: () => void;
  onOpenUpload: () => void;
  onOpenVipHub: () => void;
  onOpenProfileSwitcher: () => void;
  onOpenHeatmap?: () => void;
  onOpenReferral?: () => void;
  onOpenSearch?: () => void;
  onOpenCommunityChat?: () => void;
  onOpenLive?: () => void;
  onLogout?: () => void;
}

export const InstagramSidebar: React.FC<InstagramSidebarProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  onOpenRadar,
  onOpenBattle,
  onOpenHallOfFame,
  onOpenNotifications,
  onOpenWhatsAppAlert,
  onOpenUpload,
  onOpenVipHub,
  onOpenProfileSwitcher,
  onOpenHeatmap,
  onOpenReferral,
  onOpenSearch,
  onOpenCommunityChat,
  onOpenLive,
  onLogout,
}) => {
  const { cart, openCart } = useCart();
  const isFounder = currentUser.id === 'user_founder';

  return (
    <aside className="instagram-left-sidebar">
      {/* Official Animated Brand Logo Header (Camera Focus Ring) */}
      <div className="instagram-sidebar-logo" onClick={() => onNavigateTab('feed')} title="meflagrou - Início">
        <MeflagrouLogo height={38} animated={true} />
      </div>

      {/* Navigation Menu List */}
      <nav className="instagram-sidebar-nav">
        {/* 1. Página Inicial (Feed) */}
        <button
          onClick={() => onNavigateTab('feed')}
          className={`instagram-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
          title="Página Inicial (Feed)"
        >
          <Home size={22} className="nav-icon" />
          <span className="nav-label">Página Inicial</span>
        </button>

        {/* 🔍 Busca & Flagrantes */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="instagram-nav-item"
            title="Buscar Flagrantes (Usuários), Festas e Fotógrafos"
          >
            <Search size={22} className="nav-icon text-teal" />
            <span className="nav-label">Buscar Flagrantes</span>
          </button>
        )}

        {/* 💬 ChatOnline AO VIVO */}
        {onOpenCommunityChat && (
          <button
            onClick={onOpenCommunityChat}
            className="instagram-nav-item"
            title="ChatOnline em Tempo Real"
          >
            <div style={{ position: 'relative' }}>
              <MessageSquare size={22} className="nav-icon text-teal" />
              <span className="nav-badge-dot" style={{ background: '#00f5d4', boxShadow: '0 0 8px #00f5d4' }} />
            </div>
            <span className="nav-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              ChatOnline
              <span style={{ fontSize: '0.62rem', background: 'rgba(255, 0, 122, 0.2)', border: '1px solid #ff007a', color: '#ff007a', padding: '1px 5px', borderRadius: 6, fontWeight: 800 }}>LIVE</span>
            </span>
          </button>
        )}

        {/* 🔴 Lives Ao Vivo VIP */}
        {onOpenLive && (
          <button
            onClick={onOpenLive}
            className="instagram-nav-item"
            title="Assistir ou Transmitir Lives Ao Vivo"
          >
            <div style={{ position: 'relative' }}>
              <Radio size={22} className="nav-icon text-magenta animate-pulse" />
              <span className="nav-badge-dot" style={{ background: '#ff0055', boxShadow: '0 0 8px #ff0055' }} />
            </div>
            <span className="nav-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Lives Ao Vivo
              <span style={{ fontSize: '0.62rem', background: '#ff0055', color: '#fff', padding: '1px 5px', borderRadius: 6, fontWeight: 900 }}>3</span>
            </span>
          </button>
        )}

        {/* 2. Mapa de Calor da Balada (Heatmap) */}
        {onOpenHeatmap && (
          <button
            onClick={onOpenHeatmap}
            className="instagram-nav-item"
            title="Mapa de Calor das Pistas e Camarotes"
          >
            <Flame size={22} className="nav-icon text-magenta" />
            <span className="nav-label">Mapa de Calor</span>
          </button>
        )}

        {/* 3. Indique & Ganhe PIX */}
        {onOpenReferral && (
          <button
            onClick={onOpenReferral}
            className="instagram-nav-item"
            title="Indique Amigos e Ganhe R$ 2,00 no PIX"
          >
            <Gift size={22} className="nav-icon text-gold" />
            <span className="nav-label">Indique & Ganhe</span>
          </button>
        )}

        {/* 4. Explorar / Radar de Festas */}
        <button
          onClick={onOpenRadar}
          className="instagram-nav-item"
          title="Radar de Festas & GPS"
        >
          <MapPin size={22} className="nav-icon" />
          <span className="nav-label">Explorar / Radar</span>
        </button>

        {/* 5. Batalhas 1v1 */}
        <button
          onClick={onOpenBattle}
          className="instagram-nav-item"
          title="Batalhas 1v1 de Flagras"
        >
          <Swords size={22} className="nav-icon text-magenta" />
          <span className="nav-label">Batalhas 1v1</span>
        </button>

        {/* 6. Hall da Fama / Ranking VIP */}
        <button
          onClick={onOpenHallOfFame}
          className="instagram-nav-item"
          title="Hall da Fama & Ranking"
        >
          <Trophy size={22} className="nav-icon text-gold" />
          <span className="nav-label">Hall da Fama</span>
        </button>

        {/* 7. Notificações */}
        <button
          onClick={onOpenNotifications}
          className="instagram-nav-item"
          title="Notificações"
        >
          <div style={{ position: 'relative' }}>
            <Bell size={22} className="nav-icon" />
            <span className="nav-badge-dot" />
          </div>
          <span className="nav-label">Notificações</span>
        </button>

        {/* 8. Alertas WhatsApp */}
        <button
          onClick={onOpenWhatsAppAlert}
          className="instagram-nav-item"
          title="Alertas no WhatsApp"
        >
          <MessageSquare size={22} className="nav-icon text-teal" />
          <span className="nav-label">Alertas WhatsApp</span>
        </button>

        {/* 9. Criar / Postar Foto */}
        <button
          onClick={onOpenUpload}
          className="instagram-nav-item"
          title="Criar / Publicar Novo Flagra"
        >
          <PlusSquare size={22} className="nav-icon" />
          <span className="nav-label">Criar Flagra</span>
        </button>

        {/* 10. Carrinho & Vendas */}
        <button
          onClick={openCart}
          className="instagram-nav-item"
          title="Carrinho e Vendas de Fotos"
        >
          <div style={{ position: 'relative' }}>
            <ShoppingBag size={22} className="nav-icon" />
            {cart.length > 0 && (
              <span className="nav-badge-count">{cart.length}</span>
            )}
          </div>
          <span className="nav-label">Carrinho & Vendas</span>
        </button>

        {/* 9. Meu Perfil */}
        <button
          onClick={() => onNavigateTab('profile')}
          className={`instagram-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          title="Meu Perfil"
        >
          <div className="nav-avatar-wrapper">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`nav-avatar-img ${isFounder ? 'border-founder' : ''}`}
            />
          </div>
          <span className="nav-label font-bold">{currentUser.name.split(' ')[0]}</span>
        </button>
      </nav>

      {/* Bottom Menu: VIP Hub & Switch Profile */}
      <div className="instagram-sidebar-footer">
        {onLogout && (
          <button
            onClick={onLogout}
            className="instagram-nav-item logout-btn"
            style={{ color: '#ff70a6' }}
            title="Sair da Conta / Bloquear Acesso"
          >
            <LogOut size={18} className="nav-icon" />
            <span className="nav-label">Sair da Conta</span>
          </button>
        )}

        <button
          onClick={onOpenProfileSwitcher}
          className="instagram-nav-item subtle-btn"
          title="Trocar Perfil"
        >
          <Users size={20} className="nav-icon" />
          <span className="nav-label">Trocar Perfil</span>
        </button>

        <button
          onClick={onOpenVipHub}
          className="instagram-nav-item vip-hub-btn"
          title="Menu VIP Completo"
        >
          <Menu size={20} className="nav-icon text-teal" />
          <span className="nav-label font-bold">Mais / Menu VIP</span>
        </button>
      </div>
    </aside>
  );
};
