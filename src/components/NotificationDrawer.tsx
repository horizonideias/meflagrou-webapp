import React from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  Camera, 
  Heart, 
  Clock
} from 'lucide-react';
import type { EventPhoto } from '../types';

interface NotificationItem {
  id: string;
  type: 'photo_match' | 'friend_tag' | 'like';
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  photoUrl?: string;
}

interface NotificationDrawerProps {
  onClose: () => void;
  onSelectNotificationPhoto?: (photo: EventPhoto) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  onClose,
}) => {
  const notifications: NotificationItem[] = [
    {
      id: 'notif_01',
      type: 'photo_match',
      title: 'Novo flagra facial indexado!',
      description: 'A IA identificou seu rosto em 2 fotos novas do Sunset Festival 2026.',
      timeAgo: 'Há 4 min',
      unread: true,
      photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'notif_02',
      type: 'friend_tag',
      title: 'Lucas Ferreira estava com você',
      description: 'Vocês foram fotografados juntos na área VIP do Privilège Club.',
      timeAgo: 'Há 1 hora',
      unread: true,
      photoUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'notif_03',
      type: 'like',
      title: 'Camila Duarte curtiu seu flagra',
      description: 'Sua foto no Baile do Copa recebeu 1 nova curtida.',
      timeAgo: 'Há 3 horas',
      unread: false,
      photoUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleRequestPushPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('meflagrou.com', {
            body: 'Notificações ativadas! Você será alertado assim que a IA encontrar um novo flagra seu nas festas.',
            icon: '/favicon.svg',
          });
        }
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel" style={{
        maxWidth: 420,
        width: '100%',
        padding: 22,
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 35px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(0, 245, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--accent-teal)'
          }}>
            <Bell size={18} color="var(--accent-teal)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
              Notificações de Flagras
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Alertas da IA biométrica em tempo real
            </span>
          </div>
        </div>

        {/* Push Notification Opt-In Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(121, 40, 202, 0.15))',
          borderRadius: 12,
          padding: 12,
          border: '1px solid rgba(0, 245, 212, 0.2)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
              Ativar Alertas Push no Celular
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Seja avisado na hora enquanto curte a festa.
            </div>
          </div>

          <button
            onClick={handleRequestPushPermission}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
          >
            Ativar
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 12,
                background: n.unread ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: n.unread ? '1px solid rgba(0, 245, 212, 0.3)' : '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {n.photoUrl ? (
                <img
                  src={n.photoUrl}
                  alt={n.title}
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {n.type === 'photo_match' ? <Camera size={20} color="var(--accent-teal)" /> : (n.type === 'like' ? <Heart size={20} color="var(--accent-magenta)" /> : <Sparkles size={20} color="var(--accent-cyan)" />)}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: n.unread ? '#ffffff' : 'var(--text-secondary)' }}>
                    {n.title}
                  </span>
                  {n.unread && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-teal)' }} />
                  )}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: 4 }}>
                  {n.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <Clock size={11} /> {n.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
