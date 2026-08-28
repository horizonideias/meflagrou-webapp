import React from 'react';
import { 
  X, 
  Camera, 
  Check, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  Image as ImageIcon,
  Flame,
  ArrowRight
} from 'lucide-react';
import type { EventPhoto, UserProfile } from '../types';
import { useCart } from '../context/CartContext';

interface SelectAvatarFromGalleryModalProps {
  currentUser: UserProfile;
  photos: EventPhoto[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (newAvatarUrl: string) => void;
  onNavigateToFeed?: () => void;
}

export const SelectAvatarFromGalleryModal: React.FC<SelectAvatarFromGalleryModalProps> = ({
  currentUser,
  photos,
  isOpen,
  onClose,
  onSelectAvatar,
  onNavigateToFeed,
}) => {
  const { isPhotoPurchased } = useCart();

  if (!isOpen) return null;

  // Filter photos: Only photos that are purchased or in user's official gallery
  const availablePhotos = photos.filter((p) => isPhotoPurchased(p.id) || p.ownerSellerId === currentUser.id);

  const handleChoosePhoto = (photoUrl: string) => {
    onSelectAvatar(photoUrl);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="modal-content-card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #0e121e 0%, #080a10 100%)',
          borderRadius: 20,
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 240, 255, 0.1)',
          color: '#fff',
          padding: '24px 26px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            color: '#aaa',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div 
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 122, 0.2))',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <Camera size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
              Escolher Foto de Perfil Oficial
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0' }}>
              Selecione qualquer foto adquirida da sua galeria para exibir no seu perfil.
            </p>
          </div>
        </div>

        {/* Current Avatar Preview */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 18px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 14,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: 20
          }}
        >
          <div style={{ position: 'relative' }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent-cyan)',
                boxShadow: '0 0 16px rgba(0, 240, 255, 0.35)'
              }}
            />
            <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#00f5d4', borderRadius: '50%', padding: 2 }}>
              <ShieldCheck size={12} color="#07080c" />
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Foto de Perfil Atual</span>
            <h4 style={{ margin: '2px 0 0 0', fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>{currentUser.name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>@{currentUser.handle}</span>
          </div>
        </div>

        {/* Photos Grid or Empty State */}
        {availablePhotos.length === 0 ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '32px 20px',
              background: 'rgba(0, 240, 255, 0.03)',
              borderRadius: 16,
              border: '1px dashed rgba(0, 240, 255, 0.25)',
              margin: '10px 0'
            }}
          >
            <div 
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: 'var(--accent-cyan)'
              }}
            >
              <ShoppingBag size={28} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              Nenhuma Foto Comprada Disponível
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', maxWidth: 440, margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              No <strong>meflagrou</strong>, sua foto de perfil oficial é obtida diretamente dos seus flagras de alta qualidade.
              Assim que você <strong>comprar uma foto</strong> no feed, ela é adicionada <strong>automaticamente</strong> ao seu perfil e à sua galeria para você usá-la como avatar a qualquer momento!
            </p>
            {onNavigateToFeed && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToFeed();
                }}
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #ff007a 100%)',
                  borderRadius: 12,
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(0, 240, 255, 0.3)'
                }}
              >
                <Flame size={16} />
                <span>Explorar e Comprar Flagras no Feed</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImageIcon size={14} color="var(--accent-teal)" />
                <span>Fotos Compradas na sua Galeria ({availablePhotos.length})</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 600 }}>
                Clique para definir como foto de perfil
              </span>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 14,
                maxHeight: '48vh',
                overflowY: 'auto',
                paddingRight: 4
              }}
            >
              {availablePhotos.map((p) => {
                const isCurrent = currentUser.avatar === p.url;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleChoosePhoto(p.url)}
                    style={{
                      background: isCurrent ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      borderRadius: 14,
                      border: `1.5px solid ${isCurrent ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      padding: 10,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    {/* Circular Avatar Preview */}
                    <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 10 }}>
                      <img
                        src={p.url}
                        alt={p.eventName}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${isCurrent ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)'}`,
                          boxShadow: isCurrent ? '0 0 15px rgba(0, 240, 255, 0.5)' : '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                      />
                      {isCurrent && (
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: 'var(--accent-cyan)',
                            color: '#07080c',
                            borderRadius: '50%',
                            padding: 3,
                            display: 'flex',
                            boxShadow: '0 0 8px rgba(0,240,255,0.8)'
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {p.eventName}
                    </span>

                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: 2, marginBottom: 8 }}>
                      Flagra Oficial 8K
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChoosePhoto(p.url);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 0',
                        background: isCurrent ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: `1px solid ${isCurrent ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: 8,
                        color: isCurrent ? 'var(--accent-cyan)' : '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      {isCurrent ? (
                        <>
                          <Check size={11} />
                          <span>Foto Atual</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} color="var(--accent-teal)" />
                          <span>Definir no Perfil</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
