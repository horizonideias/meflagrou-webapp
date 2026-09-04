import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Video, 
  Radio, 
  Users, 
  DollarSign, 
  Send, 
  Volume2, 
  VolumeX, 
  Camera, 
  Sparkles, 
  MessageSquare, 
  Gift, 
  ShieldCheck, 
  Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import { haptics } from '../utils/haptics';
import type { UserProfile, EventPhoto } from '../types';

interface LiveComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  isTip?: boolean;
  tipAmount?: number;
  timestamp: string;
}

interface LiveStreamChannel {
  id: string;
  title: string;
  eventName: string;
  location: string;
  hostName: string;
  hostAvatar: string;
  hostHandle: string;
  viewersCount: number;
  previewUrl: string;
  isOfficial?: boolean;
}

const MOCK_LIVE_CHANNELS: LiveStreamChannel[] = [
  {
    id: 'live_sunset_01',
    title: '🔥 Frontstage Sunset Festival Ao Vivo!',
    eventName: 'Sunset Festival 2026',
    location: 'São Paulo, SP',
    hostName: 'Meflagrou Oficial',
    hostAvatar: '/founder_avatar.jpg',
    hostHandle: 'meflagrou',
    viewersCount: 2480,
    previewUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    isOfficial: true
  },
  {
    id: 'live_privilege_02',
    title: '⚡ Neon Night & Camarote VIP',
    eventName: 'Privilège Club',
    location: 'Itajaí, SC',
    hostName: 'Isabela Rocha',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    hostHandle: 'isabelarocha',
    viewersCount: 1340,
    previewUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'live_tomorrow_03',
    title: '🎪 Tomorrowland Brasil • Mainstage',
    eventName: 'Tomorrowland Brasil',
    location: 'Itu, SP',
    hostName: 'Lucas Albuquerque',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    hostHandle: 'lucas_albuquerque',
    viewersCount: 3890,
    previewUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
  }
];

interface UserLiveStreamModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'watch' | 'broadcast';
  initialChannelId?: string;
  onOpenPhotoModal?: (photo: EventPhoto) => void;
}

export const UserLiveStreamModal: React.FC<UserLiveStreamModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  initialMode = 'watch',
  initialChannelId = 'live_sunset_01',
}) => {
  const [activeTab, setActiveTab] = useState<'watch' | 'broadcast'>(initialMode);
  const [selectedChannel, setSelectedChannel] = useState<LiveStreamChannel>(() => {
    return MOCK_LIVE_CHANNELS.find(c => c.id === initialChannelId) || MOCK_LIVE_CHANNELS[0];
  });

  // --- BROADCASTER STATES (WEBCAM & STREAMING) ---
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [streamTitle, setStreamTitle] = useState<string>('Ao Vivo do Frontstage 🔥');
  const [selectedEventName, setSelectedEventName] = useState<string>('Sunset Festival 2026');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [activeFilter, setActiveFilter] = useState<'none' | 'neon' | 'golden' | 'vintage'>('neon');
  const [broadcastViewers, setBroadcastViewers] = useState<number>(0);
  const [liveDuration, setLiveDuration] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- VIEWER & CHAT STATES ---
  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: 'c1',
      userName: 'Camila Duarte',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      text: 'Essa festa tá incrível demais! 🔥🔥🔥',
      timestamp: 'agora'
    },
    {
      id: 'c2',
      userName: 'Rafael Guimarães',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      text: 'Qualidade 8K tá surreal de lisa! 👏',
      timestamp: 'há 10s'
    },
    {
      id: 'c3',
      userName: 'Pedro Silva',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      text: 'Mandei um Pix pra fortalecer a cobertura! 💰',
      isTip: true,
      tipAmount: 25.00,
      timestamp: 'há 25s'
    }
  ]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; icon: string; x: number }[]>([]);
  const [recentTipAlert, setRecentTipAlert] = useState<{ userName: string; amount: number } | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState<boolean>(false);
  const [selectedTipAmount, setSelectedTipAmount] = useState<number>(10);

  // Clean camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Timer & Spectator fluctuation effect
  useEffect(() => {
    let timer: any;
    if (isBroadcasting || activeTab === 'watch') {
      timer = setInterval(() => {
        setLiveDuration(d => d + 1);
        if (isBroadcasting) {
          setBroadcastViewers(v => Math.max(12, v + Math.floor(Math.random() * 7) - 2));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBroadcasting, activeTab]);

  if (!isOpen) return null;

  // --- START BROADCAST ---
  const handleStartBroadcast = async () => {
    try {
      haptics.success();
      soundFx.playScanSweep();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsBroadcasting(true);
      setBroadcastViewers(148);
      soundFx.playUnlockSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback if camera denied
      setIsBroadcasting(true);
      setBroadcastViewers(148);
    }
  };

  // --- STOP BROADCAST ---
  const handleStopBroadcast = () => {
    haptics.lightTick();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsBroadcasting(false);
    setLiveDuration(0);
  };

  // --- SEND COMMENT ---
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    haptics.lightTick();
    const newC: LiveComment = {
      id: 'c_' + Date.now(),
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newCommentText.trim(),
      timestamp: 'agora'
    };
    setComments(prev => [...prev.slice(-20), newC]);
    setNewCommentText('');
  };

  // --- SEND FLOATING REACTION ---
  const handleSendReaction = (icon: string) => {
    haptics.vote();
    const id = Date.now() + Math.random();
    const x = 50 + (Math.random() * 40 - 20);
    setFloatingReactions(prev => [...prev.slice(-15), { id, icon, x }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  // --- SEND PIX TIP / GORJETA ---
  const handleSendPixTip = () => {
    haptics.success();
    setIsTipModalOpen(false);
    soundFx.playUnlockSuccess();

    const tipComment: LiveComment = {
      id: 'tip_' + Date.now(),
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: 'Enviou R$ ' + selectedTipAmount.toFixed(2).replace('.', ',') + ' de Gorjeta PIX! 💎✨',
      isTip: true,
      tipAmount: selectedTipAmount,
      timestamp: 'agora'
    };
    setComments(prev => [...prev, tipComment]);
    setRecentTipAlert({ userName: currentUser.name, amount: selectedTipAmount });
    setTimeout(() => setRecentTipAlert(null), 4000);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00f5d4', '#ffb703', '#ff007a']
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
  };

  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'neon': return 'contrast(1.15) saturate(1.4) hue-rotate(10deg)';
      case 'golden': return 'sepia(0.25) saturate(1.3) contrast(1.05)';
      case 'vintage': return 'contrast(1.2) brightness(0.9) grayscale(0.2)';
      default: return 'none';
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 100000, padding: 10 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 960,
          height: '92vh',
          borderRadius: 24,
          overflow: 'hidden',
          background: 'rgba(8, 10, 15, 0.98)',
          border: '1.5px solid rgba(255, 0, 122, 0.4)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.98), 0 0 40px rgba(255, 0, 122, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'modalFadeIn 0.25s ease'
        }}
      >
        {/* Header Tabs & Close */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 20
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { haptics.lightTick(); setActiveTab('watch'); }}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                background: activeTab === 'watch' ? 'rgba(255, 0, 122, 0.2)' : 'transparent',
                border: activeTab === 'watch' ? '1px solid #ff007a' : '1px solid transparent',
                color: activeTab === 'watch' ? '#ff007a' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Radio size={14} className={activeTab === 'watch' ? 'animate-pulse' : ''} />
              <span>Assistir Lives VIP</span>
            </button>

            <button
              onClick={() => { haptics.lightTick(); setActiveTab('broadcast'); }}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                background: activeTab === 'broadcast' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                border: activeTab === 'broadcast' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                color: activeTab === 'broadcast' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Video size={14} />
              <span>Transmitir Ao Vivo</span>
            </button>
          </div>

          <button
            onClick={() => { handleStopBroadcast(); onClose(); }}
            className="btn-icon"
            style={{ width: 34, height: 34 }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* ========================================================================= */}
          {/* 📺 1. MODO ASSISTIR LIVES (VIEWER MODE) */}
          {/* ========================================================================= */}
          {activeTab === 'watch' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Channel Selector Bar */}
              <div style={{
                display: 'flex',
                gap: 8,
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                overflowX: 'auto'
              }} className="no-scrollbar">
                {MOCK_LIVE_CHANNELS.map(ch => {
                  const isSelected = selectedChannel.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { haptics.lightTick(); setSelectedChannel(ch); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 14,
                        background: isSelected ? 'rgba(255, 0, 122, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid #ff007a' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '0.74rem',
                        fontWeight: 700
                      }}
                    >
                      <img src={ch.hostAvatar} alt={ch.hostName} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                      <span>{ch.eventName}</span>
                      <span style={{
                        background: '#ff0055',
                        color: '#fff',
                        fontSize: '0.62rem',
                        padding: '2px 5px',
                        borderRadius: 6,
                        fontWeight: 900
                      }}>
                        🔴 {ch.viewersCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Video Player & Chat Layout Grid */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
                {/* Video Stream Stage */}
                <div style={{ position: 'relative', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={selectedChannel.previewUrl}
                    alt={selectedChannel.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.1) brightness(0.95)'
                    }}
                  />

                  {/* Live HUD Overlays */}
                  <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #ff0055, #ff007a)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontWeight: 900,
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 0 15px rgba(255,0,122,0.6)'
                    }}>
                      <Radio size={12} className="animate-pulse" />
                      <span>AO VIVO</span>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <Users size={12} color="var(--accent-teal)" />
                      <span>{selectedChannel.viewersCount} assistindo</span>
                    </div>
                  </div>

                  {/* Host Info Bottom Left */}
                  <div style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 12px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.15)',
                    zIndex: 10
                  }}>
                    <img src={selectedChannel.hostAvatar} alt={selectedChannel.hostName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {selectedChannel.hostName}
                        {selectedChannel.isOfficial && <ShieldCheck size={13} color="var(--accent-cyan)" />}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        @{selectedChannel.hostHandle} • {selectedChannel.location}
                      </div>
                    </div>
                  </div>

                  {/* Floating Tip Banner Alert */}
                  {recentTipAlert && (
                    <div style={{
                      position: 'absolute',
                      top: 60,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.95), rgba(255, 0, 122, 0.95))',
                      color: '#07080c',
                      padding: '8px 18px',
                      borderRadius: 30,
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 10px 30px rgba(255, 183, 3, 0.5)',
                      animation: 'slideInDown 0.3s ease',
                      zIndex: 30
                    }}>
                      <Award size={16} />
                      <span>{recentTipAlert.userName} mandou R$ {recentTipAlert.amount.toFixed(2).replace('.', ',')} de Gorjeta PIX! 💎</span>
                    </div>
                  )}

                  {/* Floating Reactions Emitter */}
                  <div style={{ position: 'absolute', bottom: 60, right: 20, pointerEvents: 'none', zIndex: 25 }}>
                    {floatingReactions.map(r => (
                      <div
                        key={r.id}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: r.x,
                          fontSize: '1.8rem',
                          animation: 'floatUpAndFade 1.8s ease forwards'
                        }}
                      >
                        {r.icon}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Chat Panel */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(10, 12, 18, 0.95)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {/* Chat Header */}
                  <div style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageSquare size={14} color="var(--accent-teal)" /> Chat Ao Vivo
                    </span>
                    <button
                      onClick={() => setIsTipModalOpen(true)}
                      style={{
                        background: 'linear-gradient(135deg, #ffb703, #ff007a)',
                        border: 'none',
                        color: '#07080c',
                        padding: '4px 10px',
                        borderRadius: 14,
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer'
                      }}
                    >
                      <Gift size={12} /> Mandar PIX
                    </button>
                  </div>

                  {/* Comments Feed */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }} className="no-scrollbar">
                    {comments.map(c => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          padding: c.isTip ? '8px 10px' : '4px 0',
                          background: c.isTip ? 'rgba(255, 183, 3, 0.12)' : 'transparent',
                          border: c.isTip ? '1px solid rgba(255, 183, 3, 0.3)' : 'none',
                          borderRadius: 10
                        }}
                      >
                        <img src={c.userAvatar} alt={c.userName} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                          <span style={{ fontWeight: 800, color: c.isTip ? '#ffb703' : '#fff', marginRight: 6 }}>
                            {c.userName}
                          </span>
                          <span style={{ color: c.isTip ? '#fff' : 'var(--text-secondary)' }}>
                            {c.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Reactions Bar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '8px 6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    {['🔥', '❤️', '⚡', '🥂', '🎉'].map(icon => (
                      <button
                        key={icon}
                        onClick={() => handleSendReaction(icon)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                        className="hover-scale"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleSendComment} style={{ display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <input
                      type="text"
                      placeholder="Enviar mensagem na live..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 20,
                        padding: '6px 12px',
                        color: '#fff',
                        fontSize: '0.76rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--accent-teal)',
                        border: 'none',
                        color: '#07080c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🎥 2. MODO TRANSMITIR AO VIVO (BROADCASTER STUDIO) */}
          {/* ========================================================================= */}
          {activeTab === 'broadcast' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', overflow: 'hidden' }}>
                {/* Camera / Studio Stage */}
                <div style={{ position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: getFilterStyle(),
                      transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                    }}
                  />

                  {/* If not broadcasting yet, show setup overlay */}
                  {!isBroadcasting ? (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.75)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '2px solid var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                        marginBottom: 16
                      }}>
                        <Video size={30} />
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                        Estúdio de Transmissão Ao Vivo
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 380, marginBottom: 20 }}>
                        Transmita em tempo real da festa, receba gorjetas instantâneas via PIX e compartilhe flagras exclusivos com a comunidade.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320, marginBottom: 20 }}>
                        <input
                          type="text"
                          placeholder="Título da sua Live (ex: Camarote Sunset)"
                          value={streamTitle}
                          onChange={e => setStreamTitle(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 12,
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '0.82rem',
                            outline: 'none'
                          }}
                        />

                        <select
                          value={selectedEventName}
                          onChange={e => setSelectedEventName(e.target.value)}
                          style={{
                            background: '#0e111a',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 12,
                            padding: '10px 14px',
                            color: '#fff',
                            fontSize: '0.82rem',
                            outline: 'none'
                          }}
                        >
                          <option value="Sunset Festival 2026">Sunset Festival 2026</option>
                          <option value="Privilège Club">Privilège Club Neon</option>
                          <option value="Tomorrowland Brasil">Tomorrowland Brasil</option>
                          <option value="Festa Particular / VIP">Festa Particular / VIP</option>
                        </select>
                      </div>

                      <button
                        onClick={handleStartBroadcast}
                        className="btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, #ff0055, #ff007a)',
                          color: '#fff',
                          padding: '12px 32px',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          boxShadow: '0 0 25px rgba(255, 0, 122, 0.5)'
                        }}
                      >
                        <Radio size={18} /> Iniciar Transmissão Ao Vivo
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Active Broadcasting HUD */}
                      <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          background: '#ff0055',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontWeight: 900,
                          fontSize: '0.72rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <Radio size={12} className="animate-pulse" />
                          <span>NO AR • {formatDuration(liveDuration)}</span>
                        </div>

                        <div style={{
                          background: 'rgba(0,0,0,0.65)',
                          backdropFilter: 'blur(8px)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}>
                          <Users size={12} color="var(--accent-teal)" />
                          <span>{broadcastViewers} espectadores</span>
                        </div>
                      </div>

                      {/* Controls Bottom Center */}
                      <div style={{
                        position: 'absolute',
                        bottom: 18,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: '8px 16px',
                        borderRadius: 30,
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}>
                        <button
                          onClick={() => {
                            haptics.lightTick();
                            setFacingMode(f => f === 'user' ? 'environment' : 'user');
                          }}
                          className="btn-icon"
                          title="Alternar Câmera"
                        >
                          <Camera size={16} />
                        </button>

                        <button
                          onClick={() => {
                            haptics.lightTick();
                            setIsAudioMuted(m => !m);
                          }}
                          className="btn-icon"
                          title={isAudioMuted ? 'Ativar Áudio' : 'Mutar Áudio'}
                        >
                          {isAudioMuted ? <VolumeX size={16} color="#ff0055" /> : <Volume2 size={16} />}
                        </button>

                        <button
                          onClick={handleStopBroadcast}
                          style={{
                            background: '#ff0055',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 14px',
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Encerrar Live
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Studio Tools & Filters Sidebar */}
                <div style={{
                  background: 'rgba(10, 12, 18, 0.95)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={15} color="var(--accent-cyan)" /> Efeitos de Vídeo
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { id: 'none', label: 'Normal HD' },
                      { id: 'neon', label: 'Cyber Neon' },
                      { id: 'golden', label: 'Golden Hour' },
                      { id: 'vintage', label: 'Vintage 35mm' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => { haptics.lightTick(); setActiveFilter(f.id as any); }}
                        style={{
                          padding: '8px',
                          borderRadius: 10,
                          background: activeFilter === f.id ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: activeFilter === f.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          color: activeFilter === f.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {isBroadcasting && (
                    <div style={{ marginTop: 'auto', background: 'rgba(0, 255, 178, 0.08)', padding: 12, borderRadius: 14, border: '1px solid rgba(0, 255, 178, 0.2)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: 4 }}>
                        💰 Extrato PIX da Live
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                        R$ 85,00
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        4 gorjetas recebidas ao vivo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- MODAL DOAR PIX / GORJETA --- */}
        {isTipModalOpen && (
          <div className="modal-backdrop" style={{ zIndex: 110000, padding: 14 }}>
            <div 
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: 380,
                borderRadius: 20,
                background: '#090b10',
                border: '1.5px solid #ffb703',
                padding: 20,
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(255, 183, 3, 0.15)',
                color: '#ffb703',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <DollarSign size={24} />
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                Mandar Gorjeta PIX na Live
              </h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Apoie quem está transmitindo diretamente na chave PIX cadastrada.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
                {[5, 10, 25, 50].map(val => (
                  <button
                    key={val}
                    onClick={() => { haptics.lightTick(); setSelectedTipAmount(val); }}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 10,
                      background: selectedTipAmount === val ? 'rgba(255, 183, 3, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedTipAmount === val ? '1.5px solid #ffb703' : '1px solid var(--border-subtle)',
                      color: selectedTipAmount === val ? '#ffb703' : '#fff',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setIsTipModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: 10, fontSize: '0.8rem' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendPixTip}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: 10,
                    fontSize: '0.8rem',
                    background: 'linear-gradient(135deg, #ffb703, #ff007a)',
                    color: '#07080c',
                    fontWeight: 900
                  }}
                >
                  Pagar R$ {selectedTipAmount},00
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
