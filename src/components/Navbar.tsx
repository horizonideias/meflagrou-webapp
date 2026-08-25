import React from 'react';
import { 
  Scan, 
  ShieldCheck, 
  Lock, 
  Volume2, 
  VolumeX, 
  Shield, 
  MapPin, 
  Bell, 
  ShoppingBag, 
  DollarSign 
} from 'lucide-react';
import type { UserProfile } from '../types';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentUser: UserProfile | null;
  onLockSession: () => void;
  onOpenPhotographerModal: () => void;
  onOpenScannerModal: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenRadarModal?: () => void;
  onOpenNotificationModal?: () => void;
  unreadNotificationsCount?: number;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLockSession,
  onOpenScannerModal,
  onOpenPrivacyModal,
  onOpenRadarModal,
  onOpenNotificationModal,
  unreadNotificationsCount = 2,
  isMuted,
  onToggleSound,
}) => {
  const { cart, openCart, openSellerDashboard } = useCart();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 8, 12, 0.82)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Brand Logo */}
        <div 
          onClick={onLockSession}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 245, 212, 0.4)'
          }}>
            <Scan size={20} color="#07080c" />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: '#ffffff'
          }}>
            meflagrou<span style={{ color: 'var(--accent-teal)' }}>.com</span>
          </span>
        </div>

        {/* Center / Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="btn-icon"
            style={{ width: 36, height: 36 }}
            title={isMuted ? 'Ativar som' : 'Silenciar'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} color="var(--accent-teal)" />}
          </button>

          {/* Radar de Festas GPS Button */}
          {onOpenRadarModal && (
            <button
              onClick={onOpenRadarModal}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
              title="Radar de Festas com Fotógrafos ao Vivo"
            >
              <MapPin size={14} color="var(--accent-cyan)" />
              <span className="hide-mobile">Radar</span>
            </button>
          )}

          {/* Vender Fotos / Monetização Button */}
          <button
            onClick={openSellerDashboard}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0, 245, 212, 0.1)',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              color: 'var(--accent-teal)'
            }}
            title="Vender Minhas Fotos & Receber via PIX"
          >
            <DollarSign size={14} />
            <span>Vender Fotos</span>
          </button>

          {/* Carrinho de Compras Button with Badge */}
          <button
            onClick={openCart}
            className="btn-icon"
            style={{ width: 36, height: 36, position: 'relative' }}
            title="Abrir Carrinho de Compras"
          >
            <ShoppingBag size={16} color="var(--accent-teal)" />
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 17,
                height: 17,
                borderRadius: '50%',
                background: 'var(--accent-teal)',
                color: '#07080c',
                fontSize: '0.65rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(0, 245, 212, 0.6)'
              }}>
                {cart.length}
              </span>
            )}
          </button>

          {/* Notifications Bell Button with Unread Badge */}
          {currentUser && onOpenNotificationModal && (
            <button
              onClick={onOpenNotificationModal}
              className="btn-icon"
              style={{ width: 36, height: 36, position: 'relative' }}
              title="Notificações de Flagras"
            >
              <Bell size={16} color="#ffffff" />
              {unreadNotificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  background: '#ff007a',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px #ff007a'
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* LGPD Privacy Vault Button (If logged in) */}
          {currentUser && onOpenPrivacyModal && (
            <button
              onClick={onOpenPrivacyModal}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
              title="Central de Privacidade & Biometria (LGPD)"
            >
              <Shield size={14} color="var(--accent-teal)" />
              <span className="hide-mobile">LGPD</span>
            </button>
          )}

          {/* Authenticated User Face Chip */}
          {currentUser ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              borderRadius: 30,
              padding: '4px 12px 4px 6px'
            }}>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--accent-teal)'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.1 }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShieldCheck size={10} /> Biometria OK
                </span>
              </div>

              <button
                onClick={onLockSession}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  marginLeft: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Trocar de Rosto / Bloquear"
              >
                <Lock size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenScannerModal}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <Scan size={15} />
              Reconhecer Rosto
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
