import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  Scan, 
  ShieldCheck, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  UserPlus, 
  Zap, 
  Info,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle,
  ShoppingBag,
  Flame,
  Trophy,
  Sparkles,
  ArrowRight,
  Search,
  X,
  Crown,
  Menu,
  Swords,
  MessageSquare,
  Radio,
  Users,
  MapPin,
  QrCode,
  Smartphone,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile, EventPhoto, ScanStatus, ScanResult } from '../types';
import { MOCK_USERS, MOCK_PHOTOS, MOCK_EVENTS } from '../data/mockDatabase';
import { 
  drawBiometricHUD, 
  soundFx, 
  simulateFaceRecognition 
} from '../services/biometricService';
import { StoryViewerModal } from './StoryViewerModal';
import { MOCK_STORIES, type StoryItem } from '../data/mockStories';
import { VipClubSubscriptionModal } from './VipClubSubscriptionModal';
import { FlagraBattleModal } from './FlagraBattleModal';
import { WhatsAppAlertModal } from './WhatsAppAlertModal';
import { PhotographerLiveTetherModal } from './PhotographerLiveTetherModal';
import { PhotographerAffiliateModal } from './PhotographerAffiliateModal';
import { PhotographerPortfolioModal } from './PhotographerPortfolioModal';
import { PhotographerCallPingModal } from './PhotographerCallPingModal';
import { SquadMatchBundleModal } from './SquadMatchBundleModal';
import { WristbandCheckInModal } from './WristbandCheckInModal';
import { PhotographerLeagueRankingModal } from './PhotographerLeagueRankingModal';
import { FeaturesHubMenuModal } from './FeaturesHubMenuModal';
import { InstallAppModal } from './InstallAppModal';
import { AICommunityFeedModal } from './AICommunityFeedModal';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { aiHumanEngine, type AIActivityEvent } from '../services/aiHumanEngine';

interface FacialScannerModalProps {
  onAuthenticated: (user: UserProfile, targetPhoto?: EventPhoto) => void;
  onOpenEnrollment: () => void;
  onOpenRadar?: () => void;
  onOpenHallOfFame?: () => void;
  initialDemoUser?: UserProfile | null;
}

export const FacialScannerModal: React.FC<FacialScannerModalProps> = ({
  onAuthenticated,
  onOpenEnrollment,
  onOpenRadar,
  onOpenHallOfFame,
}) => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Posicione seu rosto em frente à câmera');
  const [selectedDemoUser, setSelectedDemoUser] = useState<UserProfile | null>(MOCK_USERS[0]);
  const [targetPhotoToRedirect, setTargetPhotoToRedirect] = useState<EventPhoto | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.isMuted);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [livenessStage, setLivenessStage] = useState<'align' | 'blink' | 'verified'>('align');

  // Search & Filter Bar States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterChip, setActiveFilterChip] = useState<'todos' | 'deus' | 'curtidos' | 'festivais' | 'sp' | 'rio'>('todos');

  // Stories Modal State
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

  // Biometric Face ID Scanner Pop-up Modal State
  const [isScannerPopupOpen, setIsScannerPopupOpen] = useState<boolean>(false);

  // 6 Killer Features Modals
  const [isBattleModalOpen, setIsBattleModalOpen] = useState<boolean>(false);
  const [isVipClubOpen, setIsVipClubOpen] = useState<boolean>(false);
  const [isWhatsAppAlertOpen, setIsWhatsAppAlertOpen] = useState<boolean>(false);
  const [isLiveTetherOpen, setIsLiveTetherOpen] = useState<boolean>(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState<boolean>(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState<boolean>(false);
  const [isSquadMatchOpen, setIsSquadMatchOpen] = useState<boolean>(false);
  const [isWristbandOpen, setIsWristbandOpen] = useState<boolean>(false);
  const [isLeagueOpen, setIsLeagueOpen] = useState<boolean>(false);
  const [isHubMenuOpen, setIsHubMenuOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isAICommunityOpen, setIsAICommunityOpen] = useState<boolean>(false);
  const [liveAIToast, setLiveAIToast] = useState<AIActivityEvent | null>(null);

  // Subscribe to live AI human interactions
  useEffect(() => {
    const unsubscribe = aiHumanEngine.subscribe((event) => {
      setLiveAIToast(event);
      const timer = setTimeout(() => {
        setLiveAIToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  // PWA App Installation hook
  const { isInstalled, isIOS, triggerInstall } = usePwaInstall();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scanProgressRef = useRef<number>(0);

  // User's best spotlight photo for the Hero Section
  const userHeroBestPhoto = useMemo(() => {
    if (!selectedDemoUser) return MOCK_PHOTOS[0];
    const userPhotos = MOCK_PHOTOS.filter(p => p.tags.some(t => t.userId === selectedDemoUser.id) || p.ownerSellerId === selectedDemoUser.id);
    return userPhotos.length > 0 ? userPhotos[0] : MOCK_PHOTOS[0];
  }, [selectedDemoUser]);

  // Auto-scrolling state for Stories (Excluding the Fixed Top 3)
  const storiesAutoScrollRef = useRef<HTMLDivElement | null>(null);
  const [isStoriesPaused, setIsStoriesPaused] = useState<boolean>(false);

  useEffect(() => {
    const el = storiesAutoScrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    const scrollStep = 0.75; // Smooth automatic rolling speed

    const roll = () => {
      if (!isStoriesPaused && el) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollLeft = 0; // Seamless loop reset
        } else {
          el.scrollLeft += scrollStep;
        }
      }
      animationFrameId = requestAnimationFrame(roll);
    };

    animationFrameId = requestAnimationFrame(roll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isStoriesPaused]);

  // Sorted trending photos: by likes, purchases (generation) and comments
  const trendingPhotos = [...MOCK_PHOTOS].sort((a, b) => {
    const commentsA = a.commentsCount || (14 + a.tags.length * 4);
    const commentsB = b.commentsCount || (14 + b.tags.length * 4);
    const purchasesA = (a.tradingData?.generation || 1) * 25;
    const purchasesB = (b.tradingData?.generation || 1) * 25;
    const scoreA = (a.likesCount * 1) + purchasesA + (commentsA * 3);
    const scoreB = (b.likesCount * 1) + purchasesB + (commentsB * 3);
    return scoreB - scoreA;
  });

  // Filtered photos based on Google-style Search and Filter Chips
  const displayedPhotos = trendingPhotos.filter((p) => {
    if (activeFilterChip === 'deus' && !p.tags.some(t => t.userName.toLowerCase().includes('deus'))) return false;
    if (activeFilterChip === 'curtidos' && p.likesCount < 100) return false;
    if (activeFilterChip === 'festivais' && !p.eventName.toLowerCase().includes('tomorrowland') && !p.eventName.toLowerCase().includes('festival') && !p.eventName.toLowerCase().includes('vintage')) return false;
    if (activeFilterChip === 'sp' && !p.city.toLowerCase().includes('são paulo') && !p.city.toLowerCase().includes('valinhos') && !p.city.toLowerCase().includes('sorocaba')) return false;
    if (activeFilterChip === 'rio' && !p.city.toLowerCase().includes('rio') && !p.city.toLowerCase().includes('búzios') && !p.city.toLowerCase().includes('praia')) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchEvent = p.eventName.toLowerCase().includes(q);
    const matchCity = p.city.toLowerCase().includes(q);
    const matchLocation = p.location.toLowerCase().includes(q);
    const matchPhotographer = p.photographer.name.toLowerCase().includes(q) || p.photographer.handle.toLowerCase().includes(q);
    const matchTags = p.tags.some(t => t.userName.toLowerCase().includes(q));

    return matchEvent || matchCity || matchLocation || matchPhotographer || matchTags;
  });

  // Text-to-speech announcement helper
  const speakGreeting = (userName: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Identidade confirmada! Bem-vindo, ${userName}!`);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  // Initialize camera stream when scanner popup opens
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      stopCamera();
      setCameraError(null);
      setScanStatus('requesting_camera');
      setStatusMessage('Iniciando sensor óptico biométrico...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanStatus('camera_ready');
        setStatusMessage('Centralize seu rosto no visor holográfico');
        soundFx.playRadarTick();
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setCameraError('Permissão da câmera necessária. Utilize o modo de Upload de Selfie ou selecione um perfil demo abaixo.');
      setScanStatus('error');
      setStatusMessage('Câmera indisponível.');
    }
  };

  // Stop active camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Toggle Camera Front/Back
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Start camera whenever the popup is opened
  useEffect(() => {
    if (isScannerPopupOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerPopupOpen]);

  // Main Canvas Render Loop (HUD Overlays & Anti-Spoofing Visuals)
  useEffect(() => {
    if (!isScannerPopupOpen) return;
    let active = true;

    const renderHUD = () => {
      if (!active) return;

      if (canvasRef.current && videoRef.current && (scanStatus !== 'idle' && scanStatus !== 'error')) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            drawBiometricHUD(
              ctx,
              canvas.width,
              canvas.height,
              scanProgressRef.current / 100,
              scanStatus === 'matched',
              scanStatus,
              confidence
            );
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderHUD);
    };

    animationFrameRef.current = requestAnimationFrame(renderHUD);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScannerPopupOpen, scanStatus, confidence]);

  // Execute Biometric Simulation with Anti-Spoofing & Liveness Challenge
  const handleInitiateScan = async () => {
    setIsScannerPopupOpen(true);
    if (scanStatus === 'scanning' || scanStatus === 'matching') return;

    soundFx.playScanSweep();
    setScanStatus('scanning');
    setStatusMessage('Escaneando 128 pontos nodais da face...');
    scanProgressRef.current = 0;

    // Simulate progressive nodal scan
    const interval = setInterval(() => {
      scanProgressRef.current += 15;
      setConfidence(Math.min(scanProgressRef.current, 85));

      if (scanProgressRef.current >= 45 && scanProgressRef.current < 75) {
        setScanStatus('analyzing_landmarks');
        setLivenessStage('blink');
        setStatusMessage('Sensor anti-spoofing: Verificando micro-movimentos faciais...');
        soundFx.playLandmarkLock();
      }

      if (scanProgressRef.current >= 85) {
        clearInterval(interval);
        executeFaceMatch();
      }
    }, 200);
  };

  const executeFaceMatch = async () => {
    setScanStatus('matching');
    setStatusMessage('Cruzando assinatura vetorial com a base de eventos...');
    setLivenessStage('verified');

    const matchedUser = selectedDemoUser || MOCK_USERS[0];
    const result: ScanResult = await simulateFaceRecognition(matchedUser);

    if (result.matchedUser) {
      setConfidence(result.confidence);
      setScanStatus('matched');
      setStatusMessage(`Identidade confirmada! Bem-vindo, ${result.matchedUser.name}!`);
      soundFx.playUnlockSuccess();
      speakGreeting(result.matchedUser.name);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#00e5ff', '#ff007a', '#ffbe0b']
      });

      // Auto redirect to profile / target photo after delay
      setTimeout(() => {
        stopCamera();
        setIsScannerPopupOpen(false);
        onAuthenticated(result.matchedUser!, targetPhotoToRedirect || undefined);
      }, 1600);
    } else {
      setScanStatus('not_found');
      setStatusMessage('Rosto não encontrado na base. Cadastre-se ou tente novamente.');
      soundFx.playErrorBuzz();
    }
  };

  // Direct Click on Demo User Avatar
  const handleSelectDemoUser = (user: UserProfile) => {
    setSelectedDemoUser(user);
    soundFx.playRadarTick();
    handleInitiateScan();
  };

  // Direct Click on Trending Photo
  const handlePhotoCardClick = (photo: EventPhoto) => {
    setTargetPhotoToRedirect(photo);
    soundFx.playRadarTick();
    handleInitiateScan();
  };

  // Handle Photo File Upload (Selfie)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadedImagePreview(imageUrl);
        setScanStatus('camera_ready');
        setStatusMessage('Selfie carregada com sucesso! Clique em "Escanear Rosto".');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSound = () => {
    soundFx.isMuted = !isMuted;
    setIsMuted(soundFx.isMuted);
  };

  return (
    <div className="biometric-gate-container" style={{ padding: '12px 16px 80px 16px', width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Mobile & Desktop Navigation Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: '4px 0',
        zIndex: 10,
        gap: 8,
        width: '100%'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 245, 212, 0.5)',
            flexShrink: 0
          }}>
            <Scan size={20} color="#07080c" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              meflagrou<span style={{ color: 'var(--accent-teal)' }}>.com</span>
            </h1>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', display: 'block', whiteSpace: 'nowrap' }}>
              Fotos por Reconhecimento Facial
            </span>
          </div>
        </div>

        {/* Top Header Action Buttons: Instalar App + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Botão de Instalar App */}
          {!isInstalled && (
            <button
              onClick={() => {
                soundFx.playRadarTick();
                triggerInstall(() => setIsInstallModalOpen(true));
              }}
              style={{
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                color: '#07080c',
                border: 'none',
                borderRadius: 12,
                padding: '7px 10px',
                fontSize: '0.74rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 0 15px rgba(0, 245, 212, 0.35)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 245, 212, 0.7)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 245, 212, 0.35)';
              }}
            >
              <Smartphone size={14} color="#07080c" />
              <span>Instalar</span>
            </button>
          )}

          {/* Menu Mobile / VIP Button */}
          <button
            onClick={() => {
              soundFx.playRadarTick();
              setIsHubMenuOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.15), rgba(121, 40, 202, 0.2))',
              border: '1.5px solid var(--accent-teal)',
              color: '#ffffff',
              borderRadius: 12,
              padding: '7px 11px',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 15px rgba(0, 245, 212, 0.2)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 245, 212, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 245, 212, 0.2)';
            }}
          >
            <Menu size={16} color="var(--accent-teal)" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* 👑 HERO VIP SPOTLIGHT: SEU MELHOR FLAGRA EM DESTAQUE */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto 24px auto',
        width: '100%',
        position: 'relative'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.95), rgba(10, 12, 18, 0.98))',
          border: '1.5px solid rgba(0, 245, 212, 0.35)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 245, 212, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Top Banner Bar with Persona Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'rgba(0, 0, 0, 0.45)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                color: '#07080c',
                fontSize: '0.66rem',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <Crown size={12} color="#07080c" />
                SEU FLAGRA #1 EM DESTAQUE
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Conectado como <strong style={{ color: '#ffffff' }}>{selectedDemoUser?.name}</strong> (@{selectedDemoUser?.handle})
              </span>
            </div>

            {/* Quick Profile Switcher Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Trocar Perfil:</span>
              {MOCK_USERS.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    soundFx.playRadarTick();
                    setSelectedDemoUser(u);
                  }}
                  style={{
                    background: selectedDemoUser?.id === u.id ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.08)',
                    color: selectedDemoUser?.id === u.id ? '#07080c' : '#ffffff',
                    border: 'none',
                    borderRadius: 14,
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={u.avatar} alt={u.name} style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover' }} />
                  <span>{u.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Content: Image + Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            padding: 20,
            alignItems: 'center'
          }}>
            {/* Left: Big Cinematic Image with Biometric HUD Overlay */}
            <div 
              onClick={() => handlePhotoCardClick(userHeroBestPhoto)}
              style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                maxHeight: 380,
                cursor: 'pointer',
                border: '1.5px solid rgba(0, 245, 212, 0.3)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
              }}
            >
              <img
                src={userHeroBestPhoto.url}
                alt={userHeroBestPhoto.eventName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 380 }}
              />

              {/* Biometric Face Target HUD box */}
              <div style={{
                position: 'absolute',
                top: '18%',
                left: '28%',
                width: '32%',
                height: '42%',
                border: '2px solid var(--accent-teal)',
                borderRadius: 14,
                boxShadow: '0 0 20px rgba(0, 245, 212, 0.6), inset 0 0 15px rgba(0, 245, 212, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 6,
                pointerEvents: 'none'
              }}>
                <span style={{
                  background: 'rgba(0, 245, 212, 0.9)',
                  color: '#07080c',
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: 6,
                  alignSelf: 'flex-start'
                }}>
                  BIOMETRIA 99.8%
                </span>
                <span style={{
                  background: 'rgba(0,0,0,0.75)',
                  color: '#ffffff',
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: 4,
                  alignSelf: 'flex-end'
                }}>
                  @{selectedDemoUser?.handle}
                </span>
              </div>

              {/* Resolution Pill */}
              <span style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                background: 'rgba(0,0,0,0.8)',
                color: 'var(--accent-teal)',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 12,
                border: '1px solid rgba(0, 245, 212, 0.4)',
                backdropFilter: 'blur(10px)'
              }}>
                📸 {userHeroBestPhoto.resolution}
              </span>
            </div>

            {/* Right: Flagra Details & High-Conversion Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--accent-teal)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  Flagra Confirmado na Balada
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 8px 0', lineHeight: 1.2 }}>
                  {userHeroBestPhoto.eventName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>📍 {userHeroBestPhoto.location}</span>
                  <span>•</span>
                  <span>🗓️ {userHeroBestPhoto.eventDate} ({userHeroBestPhoto.time})</span>
                </div>
              </div>

              {/* Photographer Info & EXIF */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={userHeroBestPhoto.photographer.avatar}
                    alt={userHeroBestPhoto.photographer.name}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-teal)' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                      {userHeroBestPhoto.photographer.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {userHeroBestPhoto.photographer.camera} • {userHeroBestPhoto.photographer.lens}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  color: '#ffb703',
                  background: 'rgba(255, 183, 3, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontWeight: 800
                }}>
                  🔥 {userHeroBestPhoto.likesCount} Curtidas
                </span>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handlePhotoCardClick(userHeroBestPhoto)}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    minWidth: 160,
                    padding: '12px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    borderRadius: 14,
                    gap: 6
                  }}
                >
                  <Eye size={16} />
                  <span>Ver Foto em 8K / Comentar</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playRadarTick();
                    setIsBattleModalOpen(true);
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.82rem',
                    borderRadius: 14,
                    gap: 6,
                    border: '1px solid #ff007a',
                    color: '#ff007a'
                  }}
                  title="Disputar duelo 1x1 nas Batalhas"
                >
                  <Swords size={16} color="#ff007a" />
                  <span>Batalha 1x1</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedDemoUser) {
                      onAuthenticated(selectedDemoUser, userHeroBestPhoto);
                    }
                  }}
                  className="btn-secondary"
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.82rem',
                    borderRadius: 14,
                    gap: 6
                  }}
                  title="Ver meu perfil completo com todas as minhas fotos"
                >
                  <UserPlus size={15} />
                  <span>Meu Perfil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google-Style Ultra Search Bar with Face ID Reconhecimento Facial Button */}
      <div style={{ maxWidth: 860, margin: '0 auto 20px auto', width: '100%' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 17, 24, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(0, 245, 212, 0.35)',
          borderRadius: 9999,
          padding: '6px 8px 6px 18px',
          boxShadow: '0 10px 35px rgba(0,0,0,0.6), 0 0 25px rgba(0, 245, 212, 0.15)',
          transition: 'all 0.3s ease',
          gap: 10
        }}>
          {/* Search Icon */}
          <Search size={20} color="var(--accent-teal)" style={{ flexShrink: 0 }} />

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar festas, festivais, cidades, @usuários, fotógrafos..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 500,
              minWidth: 0,
              padding: '6px 0'
            }}
          />

          {/* Clear Search button */}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: 26,
                height: 26,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Limpar busca"
            >
              <X size={14} />
            </button>
          )}

          {/* Quick 1-Click Selfie Finder Pill */}
          <button
            onClick={() => {
              soundFx.playRadarTick();
              setFacingMode('user');
              setIsScannerPopupOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
              color: '#07080c',
              border: 'none',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 18px rgba(0, 245, 212, 0.5)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
            title="Tirar selfie e achar todas as suas fotos em 1 segundo"
          >
            <Camera size={15} color="#07080c" />
            <span>⚡ Selfie Finder (1s)</span>
          </button>
        </div>
      </div>

      {/* STORIES DOS TOP FOTÓGRAFOS E 1.000 PERFIS (TOP 3 FIXOS NO RANK) */}
      <div style={{ maxWidth: 1400, margin: '0 auto 24px auto', width: '100%' }}>
        {/* Stories Horizontal Tray with STATIC TOP 3 + AUTO-ROLLING STREAM */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 22,
          padding: '10px 12px',
          overflow: 'hidden',
          position: 'relative',
          gap: 12
        }}>
          {/* 1. STATIC PINNED SECTION: TOP 3 NO RANK */}
          <div style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            flexShrink: 0,
            paddingRight: 14,
            borderRight: '1.5px solid rgba(255, 255, 255, 0.12)',
            position: 'relative',
            zIndex: 10,
            background: 'rgba(10, 12, 18, 0.96)',
            borderRadius: '16px 0 0 16px'
          }}>
            {MOCK_STORIES.slice(0, 3).map((story: StoryItem) => {
              const isRank1 = story.rankPosition === 1 || story.isDeus;
              const isRank2 = story.rankPosition === 2;
              const isRank3 = story.rankPosition === 3;

              return (
                <button
                  key={story.id}
                  onClick={() => {
                    soundFx.playRadarTick();
                    setActiveStory(story);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.25s ease',
                    outline: 'none',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Fixed Rank Floating Tag */}
                  {isRank1 && (
                    <span style={{
                      position: 'absolute',
                      top: -6,
                      zIndex: 10,
                      background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                      color: '#07080c',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(255, 183, 3, 0.8)',
                      letterSpacing: 0.5
                    }}>
                      #1 RANK
                    </span>
                  )}
                  {isRank2 && (
                    <span style={{
                      position: 'absolute',
                      top: -6,
                      zIndex: 10,
                      background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                      color: '#07080c',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0, 245, 212, 0.6)',
                      letterSpacing: 0.5
                    }}>
                      #2 RANK
                    </span>
                  )}
                  {isRank3 && (
                    <span style={{
                      position: 'absolute',
                      top: -6,
                      zIndex: 10,
                      background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                      color: '#ffffff',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(255, 0, 122, 0.6)',
                      letterSpacing: 0.5
                    }}>
                      #3 RANK
                    </span>
                  )}

                  {/* Glowing Story Ring Frame */}
                  <div style={{
                    position: 'relative',
                    width: isRank1 ? 74 : 68,
                    height: isRank1 ? 74 : 68,
                    borderRadius: '50%',
                    padding: 3,
                    background: isRank1 
                      ? 'linear-gradient(135deg, #ffb703, #fb8500, #ff007a)' 
                      : isRank2
                      ? 'linear-gradient(135deg, #00f5d4, #00b4d8, #ffffff)'
                      : 'linear-gradient(135deg, #ff007a, #7928ca, #ffb703)',
                    boxShadow: isRank1 
                      ? '0 0 20px rgba(255, 183, 3, 0.7), 0 0 40px rgba(251, 133, 0, 0.4)' 
                      : isRank2
                      ? '0 0 16px rgba(0, 245, 212, 0.5)'
                      : '0 0 16px rgba(255, 0, 122, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #07080c',
                        background: '#07080c'
                      }}
                    />

                    {/* Top Badge Icon */}
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: isRank1 ? '#ffb703' : isRank2 ? 'var(--accent-teal)' : '#ff007a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #07080c',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.8)'
                    }}>
                      {isRank1 ? (
                        <Crown size={12} color="#07080c" />
                      ) : isRank2 ? (
                        <Camera size={11} color="#07080c" />
                      ) : (
                        <Sparkles size={11} color="#ffffff" />
                      )}
                    </div>
                  </div>

                  {/* Story Label / Name */}
                  <div style={{ textAlign: 'center', maxWidth: 80 }}>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: isRank1 ? '#ffb703' : isRank2 ? 'var(--accent-teal)' : '#ff007a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2
                    }}>
                      {isRank1 ? '👑 DEUS' : story.authorName.split(' ')[0]}
                    </div>
                    <div style={{
                      fontSize: '0.62rem',
                      color: isRank1 ? '#ffb703' : isRank2 ? 'var(--accent-teal)' : '#ff007a',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {isRank1 ? '🥇 #1 Oficial' : isRank2 ? '🥈 #2 Studio' : '🥉 #3 VIP'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2. AUTO-ROLLING SECTION: 1.000+ STORIES */}
          <div 
            ref={storiesAutoScrollRef}
            className="no-scrollbar"
            onMouseEnter={() => setIsStoriesPaused(true)}
            onMouseLeave={() => setIsStoriesPaused(false)}
            onTouchStart={() => setIsStoriesPaused(true)}
            onTouchEnd={() => setIsStoriesPaused(false)}
            style={{
              display: 'flex',
              gap: 14,
              overflowX: 'auto',
              flex: 1,
              alignItems: 'flex-start',
              padding: '4px 0',
              scrollBehavior: 'smooth'
            }}
          >
            {MOCK_STORIES.slice(3).map((story: StoryItem) => (
              <button
                key={story.id}
                onClick={() => {
                  soundFx.playRadarTick();
                  setActiveStory(story);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Story Ring Frame */}
                <div style={{
                  position: 'relative',
                  width: 66,
                  height: 66,
                  borderRadius: '50%',
                  padding: 2.5,
                  background: story.authorType === 'photographer'
                    ? 'linear-gradient(135deg, #00f5d4, #00b4d8)'
                    : 'linear-gradient(135deg, #ff007a, #7928ca)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #07080c',
                      background: '#07080c'
                    }}
                  />

                  {/* Badge Icon */}
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: story.authorType === 'photographer' ? 'var(--accent-teal)' : '#ff007a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #07080c',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.8)'
                  }}>
                    {story.authorType === 'photographer' ? (
                      <Camera size={10} color="#07080c" />
                    ) : (
                      <Sparkles size={10} color="#ffffff" />
                    )}
                  </div>
                </div>

                {/* Story Label / Name */}
                <div style={{ textAlign: 'center', maxWidth: 76 }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2
                  }}>
                    {story.authorName.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: '0.6rem',
                    color: story.authorType === 'photographer' ? 'var(--accent-teal)' : 'var(--text-muted)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {story.authorType === 'photographer' ? 'Fotógrafo' : 'VIP'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCOS DE FUNCIONALIDADES DO SITE (GRID INTERATIVO MOBILE & DESKTOP) */}
      <div style={{ maxWidth: 1400, margin: '0 auto 24px auto', width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          padding: '0 4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={16} color="var(--accent-teal)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              Experiências & Recursos Inteligentes
            </span>
          </div>
          <button
            onClick={() => {
              soundFx.playRadarTick();
              setIsHubMenuOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-teal)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Ver Todos</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Grid de Blocos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: 10
        }}>
          {/* 1. Batalha 1x1 */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsBattleModalOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.12), rgba(121, 40, 202, 0.06))',
              border: '1px solid rgba(255, 0, 122, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255, 0, 122, 0.25)',
              color: '#ff007a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Swords size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Batalha 1x1</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Duelo de Flagras</div>
            </div>
          </div>

          {/* 2. Alerta WhatsApp */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsWhatsAppAlertOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(18, 140, 126, 0.06))',
              border: '1px solid rgba(37, 211, 102, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(37, 211, 102, 0.25)',
              color: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Alerta WhatsApp</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Fotos em Tempo Real</div>
            </div>
          </div>

          {/* 3. Modo Pista */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsLiveTetherOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.12), rgba(0, 180, 216, 0.06))',
              border: '1px solid rgba(0, 245, 212, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(0, 245, 212, 0.25)',
              color: 'var(--accent-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Modo Pista 5G</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Transmissão ao Vivo</div>
            </div>
          </div>

          {/* 4. Indicar Fotógrafo */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsAffiliateOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.12), rgba(0, 229, 255, 0.06))',
              border: '1px solid rgba(0, 245, 212, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(0, 245, 212, 0.25)',
              color: 'var(--accent-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Indicar Fotógrafo</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--accent-teal)', fontWeight: 700 }}>Ganhe 10% no PIX</div>
            </div>
          </div>

          {/* 5. Chamar Fotógrafo */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsPingModalOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.12), rgba(255, 183, 3, 0.06))',
              border: '1px solid rgba(255, 0, 122, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255, 0, 122, 0.25)',
              color: '#ff007a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Chamar Fotógrafo</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Mesa VIP & Camarote</div>
            </div>
          </div>

          {/* 6. Check in Pulseira */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsWristbandOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 245, 212, 0.06))',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(0, 229, 255, 0.25)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Check-in Pulseira</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>NFC & QR Code</div>
            </div>
          </div>

          {/* 7. Liga dos Fotógrafos */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsLeagueOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.12), rgba(251, 133, 0, 0.06))',
              border: '1px solid rgba(255, 183, 3, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255, 183, 3, 0.25)',
              color: '#ffb703',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Liga dos Fotógrafos</div>
              <div style={{ fontSize: '0.66rem', color: '#ffb703', fontWeight: 700 }}>R$ 5.000 em Prêmios</div>
            </div>
          </div>

          {/* 8. Passaporte VIP */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsVipClubOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.12), rgba(121, 40, 202, 0.06))',
              border: '1px solid rgba(255, 183, 3, 0.35)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255, 183, 3, 0.25)',
              color: '#ffb703',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Crown size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Passaporte VIP</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>Assinatura Ilimitada</div>
            </div>
          </div>

          {/* 9. Comunidade & IAs Humanas */}
          <div
            onClick={() => {
              soundFx.playRadarTick();
              setIsAICommunityOpen(true);
            }}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.15), rgba(0, 180, 216, 0.08))',
              border: '1.5px solid var(--accent-teal)',
              borderRadius: 16,
              padding: 12,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0, 245, 212, 0.2)'
            }}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(0, 245, 212, 0.25)',
              color: 'var(--accent-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Comunidade IA</span>
                <span style={{ fontSize: '0.55rem', background: '#00f5d4', color: '#07080c', padding: '1px 4px', borderRadius: 4, fontWeight: 900 }}>
                  AO VIVO
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--accent-teal)' }}>Interações a cada minuto</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div 
        className="no-scrollbar mobile-scroll-row"
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          justifyContent: 'center',
          overflowX: 'auto',
          padding: '2px 4px',
          width: '100%'
        }}
      >
        {[
          { id: 'todos', label: '⚡ Todos os Flagras' },
          { id: 'deus', label: '👑 Acervo de Deus' },
          { id: 'curtidos', label: '🔥 Mais Votados' },
          { id: 'festivais', label: '🎪 Grandes Festivais' },
          { id: 'sp', label: '📍 São Paulo / Clubs' },
          { id: 'rio', label: '🏖️ Rio / Beach Clubs' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => {
              setActiveFilterChip(chip.id as any);
              setSearchQuery('');
            }}
            style={{
              background: activeFilterChip === chip.id ? 'rgba(0, 245, 212, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: activeFilterChip === chip.id ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
              color: activeFilterChip === chip.id ? 'var(--accent-teal)' : 'var(--text-secondary)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ⚔️ SEÇÃO: BATALHA 1x1 DA NOITE (DUELO DE FLAGRAS AO VIVO) */}
      <div style={{ maxWidth: 1400, margin: '0 auto 28px auto', width: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.08), rgba(121, 40, 202, 0.08))',
          border: '1.5px solid rgba(255, 0, 122, 0.3)',
          borderRadius: 22,
          padding: '16px 20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ff007a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Swords size={16} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚔️ Batalha 1x1 da Noite</span>
                  <span style={{ fontSize: '0.62rem', background: '#ff007a', color: '#ffffff', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>
                    RODADA #42 AO VIVO
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  Vote no melhor flagra da balada e veja quem ganha no ranking VIP!
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playRadarTick();
                setIsBattleModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #ff007a, #7928ca)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span>Entrar na Arena 1x1</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 2 Photos Dueling Side-by-Side */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 12,
            alignItems: 'center'
          }}>
            {/* Fighter 1 */}
            <div
              onClick={() => {
                soundFx.playLandmarkLock();
                setIsBattleModalOpen(true);
              }}
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                maxHeight: 190,
                cursor: 'pointer',
                border: '1.5px solid rgba(0, 245, 212, 0.4)',
                boxShadow: '0 4px 15px rgba(0, 245, 212, 0.2)'
              }}
            >
              <img src={MOCK_PHOTOS[0].url} alt="Fighter 1" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 190 }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}>@{MOCK_PHOTOS[0].tags[0]?.userHandle || 'deus'}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', fontWeight: 800 }}>🗳️ 54% Votos</span>
              </div>
            </div>

            {/* VS Badge */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff007a, #7928ca)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.8rem',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(255, 0, 122, 0.6)',
              zIndex: 2,
              flexShrink: 0
            }}>
              VS
            </div>

            {/* Fighter 2 */}
            <div
              onClick={() => {
                soundFx.playLandmarkLock();
                setIsBattleModalOpen(true);
              }}
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                maxHeight: 190,
                cursor: 'pointer',
                border: '1.5px solid rgba(255, 0, 122, 0.4)',
                boxShadow: '0 4px 15px rgba(255, 0, 122, 0.2)'
              }}
            >
              <img src={MOCK_PHOTOS[1].url} alt="Fighter 2" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 190 }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}>@{MOCK_PHOTOS[1].tags[0]?.userHandle || 'isabelarocha'}</span>
                <span style={{ fontSize: '0.68rem', color: '#ff007a', fontWeight: 800 }}>🗳️ 46% Votos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🪩 SEÇÃO: ÚLTIMAS BALADAS & FESTIVAIS COBERTOS */}
      <div style={{ maxWidth: 1400, margin: '0 auto 28px auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={16} color="#ffb703" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              Últimas Baladas, Festivais & Estádios
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.playRadarTick();
              if (onOpenRadar) {
                onOpenRadar();
              } else {
                setIsHubMenuOpen(true);
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-teal)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Ver no Radar 3D</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Carousel / Grid of Events */}
        <div className="no-scrollbar mobile-scroll-row" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {MOCK_EVENTS.map(evt => (
            <div
              key={evt.id}
              onClick={() => {
                soundFx.playRadarTick();
                setSearchQuery(evt.name.split(' ')[0]);
              }}
              style={{
                minWidth: 220,
                borderRadius: 18,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: 120,
                flexShrink: 0
              }}
            >
              <img src={evt.coverUrl} alt={evt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--accent-teal)', fontWeight: 800, textTransform: 'uppercase' }}>
                  {evt.category}
                </span>
                <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {evt.name}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                  📍 {evt.city} • 📸 {evt.totalPhotos} fotos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public Trending Photos Feed & Live Search Results (Full-Width High-Impact Presentation) */}
      <div style={{ width: '100%', minWidth: 0 }}>
        {/* Header of Feed */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={22} color="#ff007a" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {searchQuery ? `Resultados para "${searchQuery}"` : activeFilterChip !== 'todos' ? 'Flagras Filtrados' : 'Flagras Mais Votados da Noite'}
              </h2>
              <span style={{
                background: 'rgba(255, 0, 122, 0.2)',
                border: '1px solid #ff007a',
                color: '#ff007a',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.68rem',
                fontWeight: 800
              }}>
                {displayedPhotos.length} fotos
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              {searchQuery 
                ? 'Toque em qualquer flagra para autenticar seu rosto e acessar em Ultra HD.'
                : 'Fotos ranqueadas por curtidas, compras 2x e comentários em tempo real.'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Heart size={13} color="#ff007a" /> Curtidas
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShoppingBag size={13} color="#00f5d4" /> Compras
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MessageCircle size={13} color="#ffb703" /> Comentários
            </span>
          </div>
        </div>

        {/* Empty Search Result State */}
        {displayedPhotos.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 20,
            border: '1px dashed var(--border-subtle)',
            marginTop: 10
          }}>
            <Search size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
              Nenhum flagra encontrado para "{searchQuery}"
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Tente buscar por nomes de festas (Tomorrowland, Warung, Laroc), cidades (São Paulo, Rio) ou nomes de amigos.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilterChip('todos');
              }}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.8rem' }}
            >
              Limpar Busca & Ver Todos
            </button>
          </div>
        ) : (
          /* 2-Column Responsive Masonry on Mobile / 4-Column on Desktop */
          <div className="photo-grid-masonry">
            {displayedPhotos.map((photo, index) => {
              const commentsCount = photo.commentsCount || (14 + photo.tags.length * 4);
              const purchasesCount = (photo.tradingData?.generation || 1) + 2;

              return (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoCardClick(photo)}
                  className="photo-card-item"
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: 'var(--bg-surface-elevated)',
                    border: index === 0 ? '2px solid rgba(255, 183, 3, 0.6)' : '1px solid var(--border-subtle)',
                    boxShadow: index === 0 ? '0 10px 30px rgba(255, 183, 3, 0.2)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.eventName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />

                  {/* Top Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: index === 0 
                      ? 'linear-gradient(135deg, #ffb703, #fb8500)' 
                      : index === 1 
                      ? 'linear-gradient(135deg, #ff007a, #7928ca)' 
                      : 'rgba(7, 8, 12, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: index === 0 ? '#07080c' : '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.68rem',
                    padding: '3px 8px',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    {index === 0 ? <Trophy size={11} color="#07080c" /> : <Flame size={11} color="#ff007a" />}
                    <span>#{index + 1} EM ALTA</span>
                  </div>

                  {/* Buy Button with Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoCardClick(photo);
                    }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                      color: '#07080c',
                      border: 'none',
                      borderRadius: 14,
                      padding: '4px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 245, 212, 0.4)',
                      zIndex: 10
                    }}
                    title="Ver Preço e Comprar em 8K"
                  >
                    <ShoppingBag size={12} color="#07080c" />
                    <span>Comprar</span>
                  </button>

                  {/* Bottom Overlay with Metrics */}
                  <div className="photo-card-overlay" style={{
                    padding: '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(to top, rgba(7, 8, 12, 0.95) 0%, rgba(7, 8, 12, 0.4) 60%, transparent 100%)'
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff', marginBottom: 2 }}>
                      {photo.eventName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1', marginBottom: 6 }}>
                      📍 {photo.city}
                    </div>

                    {/* 3 Metrics Row: Likes / Purchases / Comments */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      marginBottom: 6
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#ff007a', fontWeight: 700 }}>
                        <Heart size={11} fill="#ff007a" />
                        {photo.likesCount}
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#00f5d4', fontWeight: 700 }}>
                        <ShoppingBag size={11} />
                        {purchasesCount}
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#ffb703', fontWeight: 700 }}>
                        <MessageCircle size={11} />
                        {commentsCount}
                      </span>
                    </div>

                    {/* Touch to Unlock Hint */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      color: 'var(--accent-teal)',
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}>
                      <Scan size={12} />
                      <span>Identificar Rosto & Abrir</span>
                      <ArrowRight size={11} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STORY VIEWER MODAL (When any story circle is clicked) */}
      {activeStory && (
        <StoryViewerModal
          initialStory={activeStory}
          onClose={() => setActiveStory(null)}
          onSelectUser={(user) => {
            setActiveStory(null);
            onAuthenticated(user);
          }}
          onTriggerScan={() => {
            setActiveStory(null);
            handleInitiateScan();
          }}
        />
      )}

      {/* COMPACT HIGH-TECH FACE ID BIOMETRIC SCANNER POPUP MODAL */}
      {isScannerPopupOpen && (
        <div className="modal-backdrop" style={{ zIndex: 10000, padding: 16 }}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 440,
              padding: '20px 18px',
              position: 'relative',
              borderRadius: 24,
              boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
              border: '1.5px solid rgba(0, 245, 212, 0.4)',
              animation: 'modalFadeIn 0.25s ease',
              background: 'rgba(10, 12, 18, 0.98)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                stopCamera();
                setIsScannerPopupOpen(false);
              }}
              className="btn-icon"
              style={{ position: 'absolute', top: 14, right: 14, zIndex: 40 }}
              title="Fechar"
            >
              <X size={18} />
            </button>

            {/* Active Redirect Photo Banner */}
            {targetPhotoToRedirect && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.2), rgba(0, 245, 212, 0.2))',
                border: '1px solid var(--accent-magenta)',
                borderRadius: 12,
                padding: '8px 12px',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.74rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color="var(--accent-magenta)" />
                  <span>Abrindo flagra: <strong>{targetPhotoToRedirect.eventName}</strong></span>
                </div>
                <button
                  onClick={() => setTargetPhotoToRedirect(null)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Top Modal Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingRight: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: scanStatus === 'matched' ? '#00f5d4' : (scanStatus === 'scanning' || scanStatus === 'matching' ? '#00e5ff' : '#94a3b8'),
                  boxShadow: scanStatus === 'matched' ? '0 0 10px #00f5d4' : 'none'
                }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  RECONHECIMENTO FACIAL IA
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={handleToggleCamera}
                  className="btn-icon"
                  style={{ width: 32, height: 32 }}
                  title="Alternar Câmera"
                >
                  <RefreshCw size={14} />
                </button>

                <button 
                  onClick={toggleSound} 
                  className="btn-icon" 
                  style={{ width: 32, height: 32 }}
                  title={isMuted ? 'Ativar som' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="var(--accent-teal)" />}
                </button>
              </div>
            </div>

            {/* Video & Canvas Scanner Viewport */}
            <div className="scanner-box" style={{ margin: '0 auto 16px auto' }}>
              {uploadedImagePreview ? (
                <img 
                  src={uploadedImagePreview} 
                  alt="Selfie" 
                  className="scanner-video" 
                  style={{ filter: 'brightness(0.9) contrast(1.1)' }}
                />
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="scanner-video" 
                />
              )}

              {/* Canvas Biometric HUD Overlay */}
              <canvas ref={canvasRef} className="scanner-canvas" />

              {/* Liveness Indicator Pill */}
              {scanStatus === 'analyzing_landmarks' && (
                <div style={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 229, 255, 0.9)',
                  color: '#07080c',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  zIndex: 30,
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.6)',
                  animation: 'pulse 1s infinite'
                }}>
                  <Eye size={13} />
                  {livenessStage === 'blink' ? 'Pisque para Vivacidade' : 'Verificando Vivacidade'}
                </div>
              )}

              {/* Scanner Success Banner */}
              {scanStatus === 'matched' && selectedDemoUser && (
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  background: 'rgba(0, 245, 212, 0.95)',
                  color: '#07080c',
                  padding: '8px 12px',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  zIndex: 30,
                  boxShadow: '0 0 20px rgba(0, 245, 212, 0.8)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <img 
                    src={selectedDemoUser.avatar} 
                    alt={selectedDemoUser.name} 
                    style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #07080c' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1 }}>{selectedDemoUser.name}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{confidence.toFixed(1)}% Compatibilidade</div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 12,
              background: scanStatus === 'matched' 
                ? 'rgba(0, 245, 212, 0.15)' 
                : scanStatus === 'not_found' || scanStatus === 'error'
                ? 'rgba(255, 0, 122, 0.15)'
                : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid ' + (
                scanStatus === 'matched' 
                  ? 'var(--accent-teal)' 
                  : scanStatus === 'not_found' || scanStatus === 'error'
                  ? 'var(--accent-magenta)'
                  : 'var(--border-subtle)'
              ),
              marginBottom: 14,
              fontSize: '0.8rem',
              fontWeight: 600,
              color: scanStatus === 'matched' ? 'var(--accent-teal)' : '#ffffff'
            }}>
              {scanStatus === 'matched' && <ShieldCheck size={16} color="var(--accent-teal)" />}
              {scanStatus === 'not_found' && <AlertCircle size={16} color="var(--accent-magenta)" />}
              {(scanStatus === 'scanning' || scanStatus === 'matching' || scanStatus === 'analyzing_landmarks') && (
                <div className="hud-spinner" style={{ width: 14, height: 14 }} />
              )}
              <span>{statusMessage}</span>
            </div>

            {/* Error Message if Camera Blocked */}
            {cameraError && (
              <div style={{
                background: 'rgba(255, 0, 122, 0.1)',
                border: '1px solid var(--accent-magenta)',
                borderRadius: 12,
                padding: '8px 12px',
                fontSize: '0.74rem',
                color: '#f8fafc',
                marginBottom: 12,
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}>
                <Info size={15} color="var(--accent-magenta)" style={{ flexShrink: 0 }} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Primary Action Button: Escanear Rosto */}
            <button
              onClick={handleInitiateScan}
              disabled={scanStatus === 'scanning' || scanStatus === 'matching'}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.92rem',
                fontWeight: 800,
                marginBottom: 10,
                boxShadow: '0 0 25px rgba(0, 245, 212, 0.4)',
                opacity: (scanStatus === 'scanning' || scanStatus === 'matching') ? 0.7 : 1,
              }}
            >
              <Zap size={17} />
              {scanStatus === 'scanning' || scanStatus === 'matching' 
                ? 'Processando Reconhecimento Facial...' 
                : 'Escanear Rosto Agora'}
            </button>

            {/* Secondary Option: Upload Selfie Image */}
            <label 
              className="btn-secondary" 
              style={{
                width: '100%',
                padding: '9px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                marginBottom: 14
              }}
            >
              <Upload size={14} />
              <span>Enviar Foto / Selfie da Galeria</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
            </label>

            {/* DEMO PROFILES FAST SELECTOR */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 8 
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Perfis Demo (Acesso Rápido)
                </span>
                <span style={{ fontSize: '0.66rem', color: 'var(--accent-teal)' }}>
                  1-Clique Login
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
                {MOCK_USERS.map((u) => {
                  const isSelected = selectedDemoUser?.id === u.id;
                  const isDeus = u.id === 'user_00' || u.id === 'user_01' || u.id === 'user_founder';

                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectDemoUser(u)}
                      style={{
                        background: isSelected ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected 
                          ? '2px solid var(--accent-teal)' 
                          : isDeus 
                          ? '1px solid rgba(255, 183, 3, 0.5)' 
                          : '1px solid var(--border-subtle)',
                        borderRadius: 12,
                        padding: '6px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isSelected ? '2px solid var(--accent-teal)' : 'none'
                        }}
                      />
                      <span style={{ 
                        fontSize: '0.66rem', 
                        fontWeight: 700, 
                        color: isSelected ? 'var(--accent-teal)' : '#ffffff',
                        maxWidth: 68,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {u.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* New Enrollment Link */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  stopCamera();
                  setIsScannerPopupOpen(false);
                  onOpenEnrollment();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <UserPlus size={13} />
                <span>Primeiro acesso? Cadastre sua biometria</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚔️ Batalha 1x1 Flagra Modal */}
      {isBattleModalOpen && (
        <FlagraBattleModal
          onClose={() => setIsBattleModalOpen(false)}
          onOpenPhoto={(photo) => {
            setIsBattleModalOpen(false);
            handlePhotoCardClick(photo);
          }}
          onSelectUser={(user) => {
            setIsBattleModalOpen(false);
            onAuthenticated(user);
          }}
        />
      )}

      {/* 👑 Clube de Assinatura VIP Modal */}
      {isVipClubOpen && (
        <VipClubSubscriptionModal
          currentUser={selectedDemoUser}
          onClose={() => setIsVipClubOpen(false)}
          onSubscribed={(tierBadge) => {
            alert(`🎉 Parabéns! Você agora é membro ${tierBadge} do meflagrou!`);
          }}
        />
      )}

      {/* 📲 Alertas no WhatsApp / Telegram Modal */}
      {isWhatsAppAlertOpen && (
        <WhatsAppAlertModal
          currentUser={selectedDemoUser}
          onClose={() => setIsWhatsAppAlertOpen(false)}
        />
      )}

      {/* ⚡ Painel Modo Pista 5G Live Tethering Modal */}
      {isLiveTetherOpen && (
        <PhotographerLiveTetherModal
          onClose={() => setIsLiveTetherOpen(false)}
        />
      )}

      {/* 🤝 Programa de Indicação de Fotógrafos (10%) Modal */}
      {isAffiliateOpen && (
        <PhotographerAffiliateModal
          currentUser={selectedDemoUser}
          onClose={() => setIsAffiliateOpen(false)}
        />
      )}

      {/* 📸 Portfólio 8K e Contratação de Fotógrafo Modal */}
      {isPortfolioOpen && (
        <PhotographerPortfolioModal
          onClose={() => setIsPortfolioOpen(false)}
        />
      )}

      {/* 📍 Radar "Me Flagre Aqui!" Chamado de Fotógrafo Modal */}
      {isPingModalOpen && (
        <PhotographerCallPingModal
          currentUser={selectedDemoUser}
          onClose={() => setIsPingModalOpen(false)}
        />
      )}

      {/* 👥 Squad Match Camarote Bundle Modal */}
      {isSquadMatchOpen && (
        <SquadMatchBundleModal
          currentUser={selectedDemoUser}
          onClose={() => setIsSquadMatchOpen(false)}
        />
      )}

      {/* 🎟️ Check-in Pulseira Digital NFC Modal */}
      {isWristbandOpen && (
        <WristbandCheckInModal
          currentUser={selectedDemoUser}
          onClose={() => setIsWristbandOpen(false)}
        />
      )}

      {/* 🏆 Liga dos Fotógrafos Ranking Modal */}
      {isLeagueOpen && (
        <PhotographerLeagueRankingModal
          onClose={() => setIsLeagueOpen(false)}
        />
      )}

      {/* ✨ Hub de Recursos & Menu VIP Modal */}
      {isHubMenuOpen && (
        <FeaturesHubMenuModal
          onClose={() => setIsHubMenuOpen(false)}
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
          onOpenRadar={onOpenRadar}
          onOpenHallOfFame={onOpenHallOfFame}
          onOpenInstallApp={() => setIsInstallModalOpen(true)}
          onOpenAICommunity={() => setIsAICommunityOpen(true)}
        />
      )}

      {/* 🤖 Comunidade & IAs Humanas Feed Modal */}
      {isAICommunityOpen && (
        <AICommunityFeedModal
          currentUser={selectedDemoUser}
          onClose={() => setIsAICommunityOpen(false)}
          onOpenPhoto={(photo) => {
            setIsAICommunityOpen(false);
            handlePhotoCardClick(photo);
          }}
          onSelectUser={(userId) => {
            setIsAICommunityOpen(false);
            const foundUser = MOCK_USERS.find(u => u.id === userId);
            if (foundUser) {
              onAuthenticated(foundUser);
            }
          }}
        />
      )}

      {/* 📲 Modal de Instalação do App PWA */}
      {isInstallModalOpen && (
        <InstallAppModal
          onClose={() => setIsInstallModalOpen(false)}
          onNativeInstall={() => triggerInstall()}
          isIOS={isIOS}
        />
      )}

      {/* 🟢 Live Floating AI Activity Ticker Toast */}
      {liveAIToast && (
        <div
          onClick={() => setIsAICommunityOpen(true)}
          style={{
            position: 'fixed',
            bottom: 74,
            right: 16,
            zIndex: 999,
            background: 'rgba(10, 12, 18, 0.95)',
            border: '1px solid var(--accent-teal)',
            borderRadius: 16,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 245, 212, 0.25)',
            cursor: 'pointer',
            maxWidth: 340,
            animation: 'modalFadeIn 0.3s ease'
          }}
        >
          <img
            src={liveAIToast.aiUser.avatar}
            alt={liveAIToast.aiUser.name}
            style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--accent-teal)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{liveAIToast.aiUser.name}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--accent-teal)' }}>@{liveAIToast.aiUser.handle}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {liveAIToast.content || liveAIToast.targetTitle}
            </div>
          </div>
          <span style={{ fontSize: '0.55rem', background: 'rgba(0, 245, 212, 0.2)', color: 'var(--accent-teal)', padding: '2px 5px', borderRadius: 6, fontWeight: 900 }}>
            AO VIVO
          </span>
        </div>
      )}
    </div>
  );
};
