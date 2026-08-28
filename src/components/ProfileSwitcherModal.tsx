import React, { useState } from 'react';
import { X, Search, Crown, Check, UserCheck, Sparkles } from 'lucide-react';
import type { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockDatabase';
import { soundFx } from '../services/biometricService';

interface ProfileSwitcherModalProps {
  currentUser: UserProfile;
  allUsers?: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onClose: () => void;
  onOpenNewEnrollment?: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onClose,
  onOpenNewEnrollment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const usersPool = allUsers && allUsers.length > 0 ? allUsers : MOCK_USERS;

  const filteredUsers = usersPool.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  const handleChoose = (user: UserProfile) => {
    soundFx.playRadarTick();
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '85vh',
          borderRadius: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(0, 245, 212, 0.2)',
          background: 'rgba(10, 12, 18, 0.96)',
          border: '1px solid var(--border-glow)',
          animation: 'modalFadeIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00f5d4, #ff007a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={20} color="#07080c" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Alternar Perfil
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
                Navegue como qualquer usuário, criador ou fotógrafo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 34, height: 34 }}>
            <X size={18} />
          </button>
        </div>

        {/* 🌟 Botão de Cadastro Biométrico Instantâneo */}
        {onOpenNewEnrollment && (
          <button
            onClick={() => {
              onClose();
              onOpenNewEnrollment();
            }}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 14,
              marginBottom: 16,
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
              boxShadow: '0 4px 20px rgba(0, 245, 212, 0.35)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={16} />
            <span>+ Cadastrar Novo Rosto com IA (Face ID)</span>
          </button>
        )}

        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: 16,
          }}
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nome, @handle ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* User List */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingRight: 4,
          }}
        >
          {filteredUsers.map((u) => {
            const isCurrent = u.id === currentUser.id;
            const isFounder = u.id === 'user_founder';

            return (
              <div
                key={u.id}
                onClick={() => handleChoose(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 16,
                  background: isCurrent
                    ? 'rgba(0, 245, 212, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent
                    ? '1.5px solid var(--accent-teal)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseOut={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isFounder ? '2px solid #ffb703' : '2px solid var(--accent-teal)',
                      }}
                    />
                    {isFounder && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          background: '#ffb703',
                          color: '#07080c',
                          borderRadius: '50%',
                          width: 16,
                          height: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Crown size={10} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#ffffff' }}>
                        {u.name}
                      </span>
                      {isFounder && (
                        <span
                          style={{
                            background: '#ffb703',
                            color: '#07080c',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            padding: '1px 5px',
                            borderRadius: 6,
                          }}
                        >
                          MASTER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      @{u.handle} • {u.city}, {u.state}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isCurrent ? (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: 'var(--accent-teal)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      <Check size={14} /> Ativo
                    </span>
                  ) : (
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.72rem',
                        borderRadius: 12,
                      }}
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
