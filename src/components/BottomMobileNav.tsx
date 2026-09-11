import React from 'react';
import { 
  Home, 
  MapPin, 
  PlusSquare, 
  Swords,
  Scan
} from 'lucide-react';
import { type UserProfile, isUserAdmin } from '../types';

interface BottomMobileNavProps {
  currentUser: UserProfile;
  activeTab: 'feed' | 'profile';
  onNavigateTab: (tab: 'feed' | 'profile') => void;
  onOpenRadar: () => void;
  onOpenUpload: () => void;
  onOpenBattle: () => void;
  onOpenHallOfFame?: () => void;
  onOpenFaceScanner?: () => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  onOpenRadar,
  onOpenUpload,
  onOpenBattle,
  onOpenFaceScanner,
}) => {
  const isAdmin = isUserAdmin(currentUser);

  return (
    <nav className="mobile-bottom-nav">
      {/* 1. Feed / Home */}
      <button
        onClick={() => {
          onNavigateTab('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        title="Página Inicial"
      >
        <Home size={22} color={activeTab === 'feed' ? 'var(--accent-teal)' : 'currentColor'} />
        <span>Início</span>
      </button>

      {/* 2. Radar GPS */}
      <button
        onClick={onOpenRadar}
        className="mobile-nav-item"
        title="Radar de Festas & GPS"
      >
        <MapPin size={22} color="var(--accent-cyan)" />
        <span>Radar</span>
      </button>

      {/* 3. Central Action: Admin -> Publicar Galeria | Cliente -> IA Face ID */}
      {isAdmin ? (
        <button
          onClick={onOpenUpload}
          className="mobile-nav-create-btn"
          title="Publicar Galeria Oficial (Admin)"
        >
          <PlusSquare size={22} color="#07080c" />
        </button>
      ) : (
        <button
          onClick={onOpenFaceScanner || onOpenRadar}
          className="mobile-nav-create-btn"
          title="Buscar Meu Rosto com IA Face ID"
          style={{
            background: 'linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-cyan) 100%)',
            boxShadow: '0 0 16px rgba(0, 245, 212, 0.45)'
          }}
        >
          <Scan size={22} color="#07080c" strokeWidth={2.5} />
        </button>
      )}

      {/* 4. Batalhas / Ranking */}
      <button
        onClick={onOpenBattle}
        className="mobile-nav-item"
        title="Batalhas 1v1"
      >
        <Swords size={22} color="var(--accent-magenta)" />
        <span>Batalhas</span>
      </button>

      {/* 5. Perfil */}
      <button
        onClick={() => {
          onNavigateTab('profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        title="Meu Perfil"
      >
        <div className={`mobile-nav-avatar-wrap ${activeTab === 'profile' ? 'active' : ''}`}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="mobile-nav-avatar-img"
          />
        </div>
        <span>Perfil</span>
      </button>
    </nav>
  );
};
