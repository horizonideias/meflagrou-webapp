import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Users, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  CheckCheck, 
  Crown
} from 'lucide-react';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import { soundFx } from '../services/biometricService';
import { MeflagrouLogo } from './MeflagrouLogo';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderHandle: string;
  senderAvatar: string;
  isFounder?: boolean;
  isVip?: boolean;
  channelId?: string; // If null/empty -> direct message
  text: string;
  attachedPhotoUrl?: string;
  timestamp: string;
  timeLabel: string;
  reactions?: Record<string, number>;
}

interface ChatChannel {
  id: string;
  name: string;
  icon: string;
  description: string;
  membersCount: number;
  unreadCount?: number;
  isPrivate?: boolean;
}

interface CommunityLiveChatModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (user: UserProfile) => void;
  onOpenPhoto?: (photo: EventPhoto) => void;
}

export const CommunityLiveChatModal: React.FC<CommunityLiveChatModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSelectUser,
  onOpenPhoto,
}) => {
  if (!isOpen) return null;

  // Active Tab: 'channels' | 'direct'
  const [activeTab, setActiveTab] = useState<'channels' | 'direct'>('channels');
  
  // Selected Channel or DM
  const [selectedChannelId, setSelectedChannelId] = useState<string>('general');
  const [selectedDirectUserId, setSelectedDirectUserId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Input state
  const [inputText, setInputText] = useState<string>('');
  const [selectedPhotoToAttach, setSelectedPhotoToAttach] = useState<string | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. CHANNELS LIST
  const channels: ChatChannel[] = [
    {
      id: 'general',
      name: 'Geral • Flagras & Baladas',
      icon: '🔥',
      description: 'Canal oficial da comunidade para comentar as noites e festivais.',
      membersCount: 14820,
    },
    {
      id: 'camarote-vip',
      name: 'Camarote VIP & After',
      icon: '👑',
      description: 'Exclusivo para membros VIP e ingressos pista premium.',
      membersCount: 3910,
    },
    {
      id: 'achei-voce',
      name: 'Achei Você • Lost & Found',
      icon: '⚡',
      description: 'Encontre e marque aquela pessoa que você flagrou na balada.',
      membersCount: 8420,
    },
    {
      id: 'fotografos-pro',
      name: 'Fotógrafos & Dicas de Poses',
      icon: '📸',
      description: 'Espaço com os fotógrafos oficiais do meflagrou.',
      membersCount: 2150,
    },
    {
      id: 'sunset-fest',
      name: 'Sunset Festival 2026 Live',
      icon: '🌅',
      description: 'Canal de cobertura em tempo real do festival Sunset.',
      membersCount: 5630,
    },
  ];

  // 2. DIRECT CONTACTS (VIP USERS)
  const directUsers = MOCK_USERS.filter((u) => u.id !== currentUser.id);

  // 3. SEED MESSAGES
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'user_founder',
      senderName: 'Deus • Meflagrou',
      senderHandle: 'meflagrou',
      senderAvatar: '/founder_avatar.jpg',
      isFounder: true,
      channelId: 'general',
      text: 'Sejam todos bem-vindos ao ChatOnline Oficial meflagrou.com! 🎉 Todas as fotos em 8K sem compressão já estão no feed!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      timeLabel: '13:40',
      reactions: { '🔥': 42, '👑': 28 }
    },
    {
      id: 'm2',
      senderId: 'user_isabela_rocha',
      senderName: 'Isabela Rocha',
      senderHandle: 'isa_rocha',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      isVip: true,
      channelId: 'general',
      text: 'Gente, as fotos do Sunset Festival ficaram impecáveis! Já adicionei todas no meu perfil 😍📸',
      attachedPhotoUrl: MOCK_PHOTOS[0]?.url,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      timeLabel: '14:15',
      reactions: { '❤️': 19, '🔥': 15 }
    },
    {
      id: 'm3',
      senderId: 'user_lucas_ferreira',
      senderName: 'Lucas Ferreira',
      senderHandle: 'lucas.flg',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      channelId: 'general',
      text: 'O Face ID achou meu flagra em menos de 2 segundos! Sistema surreal ⚡',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      timeLabel: '14:32',
      reactions: { '🚀': 12 }
    },
    {
      id: 'm4',
      senderId: 'user_founder',
      senderName: 'Deus • Meflagrou',
      senderHandle: 'meflagrou',
      senderAvatar: '/founder_avatar.jpg',
      isFounder: true,
      channelId: 'camarote-vip',
      text: 'Membros VIP Diamond têm acesso antecipado às fotos brutas direto do tethering dos fotógrafos 🍸✨',
      timestamp: new Date(Date.now() - 5000000).toISOString(),
      timeLabel: '12:10',
      reactions: { '💎': 34 }
    },
    {
      id: 'm5',
      senderId: 'user_isabela_rocha',
      senderName: 'Isabela Rocha',
      senderHandle: 'isa_rocha',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      isVip: true,
      channelId: 'achei-voce',
      text: 'Quem estava de jaqueta prateada na pista eletrônica perto da meia-noite? O flagra ficou sensacional!',
      attachedPhotoUrl: MOCK_PHOTOS[1]?.url,
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      timeLabel: '14:20',
      reactions: { '👀': 8 }
    }
  ]);

  // Scroll to bottom on message change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannelId, selectedDirectUserId]);

  // Filter messages for currently selected view
  const currentMessages = messages.filter((m) => {
    if (activeTab === 'channels') {
      return m.channelId === selectedChannelId;
    } else {
      return (
        (m.senderId === currentUser.id && m.channelId === `dm_${selectedDirectUserId}`) ||
        (m.senderId === selectedDirectUserId && m.channelId === `dm_${currentUser.id}`) ||
        m.channelId === `dm_${selectedDirectUserId}`
      );
    }
  });

  // Current active entity info
  const currentChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const currentDirectUser = directUsers.find((u) => u.id === selectedDirectUserId) || directUsers[0];

  // Send Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedPhotoToAttach) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderHandle: currentUser.handle,
      senderAvatar: currentUser.avatar,
      isFounder: currentUser.id === 'user_founder',
      isVip: true,
      channelId: activeTab === 'channels' ? selectedChannelId : `dm_${selectedDirectUserId}`,
      text: inputText.trim(),
      attachedPhotoUrl: selectedPhotoToAttach || undefined,
      timestamp: new Date().toISOString(),
      timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedPhotoToAttach(null);
    setShowPhotoPicker(false);
    soundFx.playLandmarkLock();

    // Auto simulated response after 1.8s
    if (activeTab === 'direct' || Math.random() > 0.4) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responder = activeTab === 'direct' 
          ? currentDirectUser 
          : directUsers[Math.floor(Math.random() * directUsers.length)];

        const autoReplies = [
          'Top demais! Vi suas fotos na galeria, ficaram incríveis! 🔥',
          'Sensacional! Você vai no próximo festival no sábado? 🚀',
          'Acabei de curtir seu flagra! Muito bom! 📸✨',
          'O meflagrou revolucionou a fotografia de baladas aqui no Brasil! 🇧🇷👑',
          'Valeu demais pela mensagem! Tmj no Camarote VIP! 🍸'
        ];

        const replyMsg: ChatMessage = {
          id: `reply_${Date.now()}`,
          senderId: responder.id,
          senderName: responder.name,
          senderHandle: responder.handle,
          senderAvatar: responder.avatar,
          isVip: true,
          channelId: activeTab === 'channels' ? selectedChannelId : `dm_${selectedDirectUserId}`,
          text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
          timestamp: new Date().toISOString(),
          timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: { '🔥': 1 }
        };

        setMessages((prev) => [...prev, replyMsg]);
        soundFx.playRadarTick();
      }, 1600);
    }
  };

  // Add emoji reaction
  const handleReaction = (msgId: string, emoji: string) => {
    soundFx.playRadarTick();
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const currentReactions = { ...(m.reactions || {}) };
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return { ...m, reactions: currentReactions };
        }
        return m;
      })
    );
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999, padding: '12px' }}>
      <div className="community-chat-window glass-panel">
        
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR: CANAIS & CONVERSAS DIRETAS */}
        {/* ========================================================================= */}
        <aside className="community-chat-sidebar">
          {/* Header */}
          <div className="community-sidebar-header">
            <div className="community-logo-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MeflagrouLogo height={24} animated={true} />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#00f5d4', letterSpacing: '-0.02em' }}>ChatOnline</span>
              </div>
              <span className="community-live-badge">
                <span className="live-pulse-dot" />
                AO VIVO
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="community-mode-tabs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('channels');
                  setSelectedDirectUserId(null);
                  soundFx.playRadarTick();
                }}
                className={`community-tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
              >
                <Users size={14} />
                <span>Salas & Festas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('direct');
                  if (!selectedDirectUserId) {
                    setSelectedDirectUserId(directUsers[0]?.id || null);
                  }
                  soundFx.playRadarTick();
                }}
                className={`community-tab-btn ${activeTab === 'direct' ? 'active' : ''}`}
              >
                <MessageSquare size={14} />
                <span>Directs (DMs)</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="community-search-box">
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder={activeTab === 'channels' ? 'Buscar salas de eventos...' : 'Buscar pessoas online...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="community-search-input"
              />
            </div>
          </div>

          {/* List Area */}
          <div className="community-list-scroll">
            {activeTab === 'channels' ? (
              <div className="channels-list">
                <span className="community-section-label">Canais Públicos & VIP</span>
                {channels
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((channel) => {
                    const isSelected = selectedChannelId === channel.id;
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => {
                          setSelectedChannelId(channel.id);
                          soundFx.playRadarTick();
                        }}
                        className={`channel-item-btn ${isSelected ? 'active' : ''}`}
                      >
                        <span className="channel-icon">{channel.icon}</span>
                        <div className="channel-meta">
                          <strong className="channel-name">{channel.name}</strong>
                          <span className="channel-desc">{channel.description}</span>
                        </div>
                        <span className="channel-members-tag">
                          {channel.membersCount.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="direct-users-list">
                <span className="community-section-label">Membros Online ({directUsers.length})</span>
                {directUsers
                  .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.handle.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((usr) => {
                    const isSelected = selectedDirectUserId === usr.id;
                    return (
                      <button
                        key={usr.id}
                        type="button"
                        onClick={() => {
                          setSelectedDirectUserId(usr.id);
                          soundFx.playRadarTick();
                        }}
                        className={`direct-user-item ${isSelected ? 'active' : ''}`}
                      >
                        <div className="direct-user-avatar-wrap">
                          <img src={usr.avatar} alt={usr.name} className="direct-user-avatar" />
                          <span className="direct-online-indicator" />
                        </div>
                        <div className="direct-user-info">
                          <div className="direct-user-name-row">
                            <strong className="direct-user-name">{usr.name}</strong>
                            {usr.id === 'user_founder' && (
                              <Crown size={12} color="#ffb703" />
                            )}
                          </div>
                          <span className="direct-user-handle">@{usr.handle}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Sidebar Footer: Current User Status */}
          <div className="community-sidebar-footer">
            <div className="current-user-badge-row">
              <div className="current-user-avatar-mini">
                <img src={currentUser.avatar} alt={currentUser.name} />
                <span className="online-green-dot" />
              </div>
              <div className="current-user-text">
                <strong>{currentUser.name}</strong>
                <span>@{currentUser.handle} • Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. RIGHT CHAT CONVERSATION MAIN PANEL */}
        {/* ========================================================================= */}
        <main className="community-chat-main">
          {/* Top Header of Chat */}
          <header className="chat-main-header">
            <div className="chat-header-info">
              {activeTab === 'channels' ? (
                <>
                  <span className="chat-header-icon">{currentChannel.icon}</span>
                  <div>
                    <h3 className="chat-header-title">{currentChannel.name}</h3>
                    <span className="chat-header-sub">
                      🟢 {currentChannel.membersCount.toLocaleString()} participantes ativos • {currentChannel.description}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="direct-chat-avatar-wrap">
                    <img src={currentDirectUser.avatar} alt={currentDirectUser.name} className="direct-chat-avatar" />
                    <span className="online-green-dot" />
                  </div>
                  <div>
                    <div className="direct-chat-title-row">
                      <h3 className="chat-header-title">{currentDirectUser.name}</h3>
                      <span className="direct-vip-pill">VIP DIAMOND</span>
                    </div>
                    <span className="chat-header-sub">
                      @{currentDirectUser.handle} • {currentDirectUser.city}, {currentDirectUser.state} • Online agora
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                onClick={onClose}
                className="chat-close-btn"
                title="Fechar Chat (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          {/* Messages Feed */}
          <div className="chat-messages-container">
            <div className="chat-welcome-banner">
              <Sparkles size={20} color="#00f5d4" />
              <h4>
                {activeTab === 'channels' 
                  ? `Bem-vindo à sala ${currentChannel.name}!`
                  : `Início da conversa com ${currentDirectUser.name}`}
              </h4>
              <p>
                {activeTab === 'channels'
                  ? 'Compartilhe seus flagras, encontre amigos e marque presença nas baladas mais quentes.'
                  : 'Mensagens criptografadas de ponta a ponta e identificação de flagras em tempo real.'}
              </p>
            </div>

            {currentMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;

              return (
                <div key={msg.id} className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}>
                  {!isMine && (
                    <img 
                      src={msg.senderAvatar} 
                      alt={msg.senderName} 
                      className="chat-msg-avatar"
                      onClick={() => {
                        const u = MOCK_USERS.find((usr) => usr.id === msg.senderId);
                        if (u && onSelectUser) onSelectUser(u);
                      }}
                    />
                  )}

                  <div className="chat-msg-bubble-wrap">
                    {/* Author row for channel messages */}
                    {!isMine && activeTab === 'channels' && (
                      <div className="chat-msg-author-row">
                        <span className="msg-author-name">{msg.senderName}</span>
                        {msg.isFounder && (
                          <span className="msg-founder-badge">FOUNDER</span>
                        )}
                        {msg.isVip && !msg.isFounder && (
                          <span className="msg-vip-badge">VIP</span>
                        )}
                        <span className="msg-author-handle">@{msg.senderHandle}</span>
                        <span className="msg-time">{msg.timeLabel}</span>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div className={`chat-msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      {msg.attachedPhotoUrl && (
                        <div 
                          className="chat-attached-photo-wrap"
                          style={{ cursor: onOpenPhoto ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (onOpenPhoto) {
                              const found = MOCK_PHOTOS.find((p) => p.url === msg.attachedPhotoUrl);
                              if (found) onOpenPhoto(found);
                            }
                          }}
                        >
                          <img 
                            src={msg.attachedPhotoUrl} 
                            alt="Flagra Anexo" 
                            className="chat-attached-photo" 
                          />
                          <span className="photo-8k-badge">8K ULTRA HD</span>
                        </div>
                      )}
                      
                      <p className="chat-msg-text">{msg.text}</p>
                      
                      <div className="chat-msg-footer">
                        <span className="chat-msg-time">{msg.timeLabel}</span>
                        {isMine && <CheckCheck size={14} color="#00f5d4" />}
                      </div>
                    </div>

                    {/* Emoji Reactions Bar */}
                    <div className="chat-reactions-strip">
                      {msg.reactions && Object.entries(msg.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="reaction-badge-btn"
                        >
                          <span>{emoji}</span>
                          <span className="reaction-count">{count}</span>
                        </button>
                      ))}

                      {/* Add quick reaction */}
                      <div className="reaction-quick-add">
                        {['🔥', '❤️', '🍸'].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => handleReaction(msg.id, em)}
                            className="reaction-add-btn"
                            title={`Reagir ${em}`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="chat-typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-text">Alguém está digitando...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Photo Picker Overlay */}
          {showPhotoPicker && (
            <div className="chat-photo-picker-drawer">
              <div className="photo-picker-header">
                <span>Selecione uma foto para anexar no chat</span>
                <button type="button" onClick={() => setShowPhotoPicker(false)}>✕</button>
              </div>
              <div className="photo-picker-grid">
                {MOCK_PHOTOS.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={p.eventName}
                    className={`photo-picker-thumb ${selectedPhotoToAttach === p.url ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPhotoToAttach(p.url);
                      setShowPhotoPicker(false);
                      soundFx.playRadarTick();
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attached Photo Preview */}
          {selectedPhotoToAttach && (
            <div className="chat-attached-preview-bar">
              <img src={selectedPhotoToAttach} alt="Anexo" />
              <span>Foto do Flagra anexada</span>
              <button type="button" onClick={() => setSelectedPhotoToAttach(null)}>✕</button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="chat-input-bar">
            <button
              type="button"
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              className={`chat-action-btn ${selectedPhotoToAttach ? 'active' : ''}`}
              title="Anexar Foto de Flagra"
            >
              <ImageIcon size={20} color={selectedPhotoToAttach ? '#00f5d4' : 'currentColor'} />
            </button>

            <div className="chat-quick-emojis">
              {['🔥', '😍', '👑', '🚀', '🍸'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                    soundFx.playRadarTick();
                  }}
                  className="quick-emoji-pill"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder={
                activeTab === 'channels'
                  ? `Conversar no #${currentChannel.name}...`
                  : `Enviar mensagem para ${currentDirectUser.name}...`
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-text-input"
              autoFocus
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !selectedPhotoToAttach}
              className="chat-send-btn"
              title="Enviar Mensagem (Enter)"
            >
              <Send size={18} />
            </button>
          </form>

        </main>

      </div>
    </div>
  );
};
