import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Check, 
  Sparkles, 
  Share2, 
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import type { UserProfile } from '../types';

interface SquadMatchBundleModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const SquadMatchBundleModal: React.FC<SquadMatchBundleModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([
    'user_isabela',
    'user_lucas',
    'user_camila'
  ]);
  const [copiedPixMessage, setCopiedPixMessage] = useState<boolean>(false);

  const availableFriends = MOCK_USERS.filter(u => u.id !== currentUser?.id && u.id !== 'user_founder');
  
  const toggleFriend = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      if (selectedFriends.length > 1) {
        setSelectedFriends(selectedFriends.filter(id => id !== friendId));
      }
    } else {
      if (selectedFriends.length < 5) {
        setSelectedFriends([...selectedFriends, friendId]);
      }
    }
  };

  const totalPeople = selectedFriends.length + 1; // + current user
  const originalPrice = 350.00;
  const comboPrice = 199.00;
  const perPersonSplit = comboPrice / totalPeople;

  const matchedGroupPhotos = MOCK_PHOTOS.slice(0, 4);

  const handleCopyWhatsAppPix = () => {
    const message = `🎉 Fala galera do Camarote! O pacote com 10 fotos 8K do nosso grupo no meflagrou.com deu R$ ${perPersonSplit.toFixed(2).replace('.', ',')} para cada um (${totalPeople} pessoas). Paga no PIX pelo link: https://meflagrou.com/pix/squad_camarote_${Date.now()}`;
    navigator.clipboard.writeText(message);
    setCopiedPixMessage(true);
    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#00e5ff', '#ffb703']
    });
    setTimeout(() => setCopiedPixMessage(false), 3000);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-cyan)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 229, 255, 0.25)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 24,
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 245, 212, 0.6)'
          }}>
            <Users size={24} color="#07080c" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Squad Match // Pacote Camarote VIP
              </h2>
              <span style={{
                background: 'rgba(0, 245, 212, 0.2)',
                border: '1px solid var(--accent-teal)',
                color: 'var(--accent-teal)',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: '0.65rem',
                fontWeight: 900
              }}>
                DESCONTO DE 43%
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              A IA cruza a biometria do seu grupo e monta uma pasta coletiva com todas as fotos onde vocês aparecem juntos.
            </p>
          </div>
        </div>

        {/* Select Squad Friends (Multi-Face Selector) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
            Selecione os Amigos do seu Camarote / Squad:
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableFriends.map((friend) => {
              const isSelected = selectedFriends.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: isSelected ? 'linear-gradient(135deg, rgba(0, 245, 212, 0.25), rgba(0, 180, 216, 0.25))' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{friend.name}</span>
                  {isSelected && <Check size={13} color="var(--accent-teal)" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matched Group Photos Showcase */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> 4 Fotos Coletivas Encontradas onde o Grupo Aparece Junto:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
            {matchedGroupPhotos.map((p) => (
              <div
                key={p.id}
                style={{
                  height: 110,
                  borderRadius: 12,
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <img src={p.thumbnailUrl || p.url} alt={p.eventName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(0, 245, 212, 0.9)',
                  color: '#07080c',
                  padding: '2px 6px',
                  borderRadius: 6,
                  fontSize: '0.6rem',
                  fontWeight: 900
                }}>
                  {selectedFriends.length + 1} Rostos
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combo Pricing & Split PIX Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 18,
          padding: 18,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                  R$ {originalPrice.toFixed(2)}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
                  R$ {comboPrice.toFixed(2).replace('.', ',')}
                </span>
                <span style={{ fontSize: '0.7rem', background: '#ff007a', color: '#ffffff', padding: '2px 6px', borderRadius: 6, fontWeight: 900 }}>
                  10 FOTOS 8K
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Pacote inclui todas as fotos em resolução original sem marcas d'água.
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 245, 212, 0.1)',
              border: '1px solid var(--accent-teal)',
              borderRadius: 12,
              padding: '8px 14px',
              textAlign: 'right'
            }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
                Dividindo por {totalPeople} amigos:
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                R$ {perPersonSplit.toFixed(2).replace('.', ',')} <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/ cada</span>
              </div>
            </div>
          </div>

          {/* Action to share Split PIX */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <button
              onClick={handleCopyWhatsAppPix}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                padding: '11px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Share2 size={16} />
              {copiedPixMessage ? 'Mensagem Copiada!' : 'Dividir no WhatsApp (PIX)'}
            </button>

            <button
              onClick={() => {
                soundFx.playUnlockSuccess();
                alert(`🎉 Pacote Squad Camarote comprado com sucesso! Todas as fotos foram liberadas.`);
                onClose();
              }}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                padding: '11px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Download size={16} />
              Comprar Combo Completo (R$ 199)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
