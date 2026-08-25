import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Flame, 
  Calendar, 
  MapPin, 
  Music, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Zap, 
  Camera, 
  Check, 
  Radio,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto } from '../types';
import { soundFx } from '../services/biometricService';

interface FeedPairedBlocksProps {
  pairIndex: number;
  allPhotos: EventPhoto[];
  onOpenPhotoModal?: (photo: EventPhoto) => void;
  onOpenRadar?: () => void;
  onOpenWhatsAppAlert?: () => void;
  onOpenVipHub?: () => void;
}

export const FeedPairedBlocks: React.FC<FeedPairedBlocksProps> = ({
  pairIndex,
  allPhotos,
  onOpenPhotoModal,
  onOpenRadar,
  onOpenWhatsAppAlert,
  onOpenVipHub,
}) => {
  const [votedSquare1, setVotedSquare1] = useState(false);
  const [votedQuizIndex, setVotedQuizIndex] = useState<number | null>(null);
  const [quizVotes, setQuizVotes] = useState([74, 118, 52]);

  const handleVoteSquare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedSquare1) return;
    setVotedSquare1(true);
    soundFx.playRadarTick();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#ff007a', '#00f5d4', '#ffb703'],
    });
  };

  const handleQuizVote = (idx: number) => {
    if (votedQuizIndex !== null) return;
    setVotedQuizIndex(idx);
    soundFx.playRadarTick();
    confetti({
      particleCount: 20,
      spread: 40,
      colors: ['#00f5d4', '#7928ca'],
    });
    setQuizVotes((prev) => {
      const next = [...prev];
      next[idx] += 1;
      return next;
    });
  };

  const samplePhoto1 = allPhotos[pairIndex % allPhotos.length] || allPhotos[0];
  const samplePhoto2 = allPhotos[(pairIndex + 2) % allPhotos.length] || allPhotos[1];

  // =========================================================================
  // PAIR 0: [Retângulo: Flash Pass 8K VIP] + [Quadrado: Look da Noite 1:1]
  // =========================================================================
  if (pairIndex % 4 === 0) {
    return (
      <div className="feed-paired-blocks-container layout-rect-square">
        {/* 1. Bloco Retangular */}
        <div 
          className="paired-block-rect vip-pass-card"
          onClick={() => {
            soundFx.playUnlockSuccess();
            onOpenVipHub?.();
          }}
          style={{ cursor: 'pointer' }}
          title="Clique para Desbloquear Passe VIP 8K"
        >
          <div className="rect-card-bg-img">
            <img 
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&h=600&q=80" 
              alt="VIP Pass 8K" 
              className="rect-img-fill"
            />
            <div className="rect-gradient-overlay" />
          </div>

          <div className="rect-card-content">
            <div className="rect-top-badge">
              <Crown size={12} color="#ffb703" />
              <span>PASSE VIP 8K • DOWNLOAD ILIMITADO</span>
            </div>
            <h4 className="rect-card-title">Cobertura Completa do seu Grupo</h4>
            <p className="rect-card-desc">
              Reconhecimento facial instantâneo e pacote de todos os flagras em resolução de cinema (50.1 MP).
            </p>
            <div className="rect-action-row">
              <span className="rect-price-tag">Por apenas R$ 29,90</span>
              <button 
                className="rect-cta-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playUnlockSuccess();
                  onOpenVipHub?.();
                }}
              >
                <span>Desbloquear</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Bloco Quadrado (1:1) */}
        <div 
          className="paired-block-square look-highlight-card"
          onClick={() => {
            if (samplePhoto2 && onOpenPhotoModal) {
              soundFx.playLandmarkLock();
              onOpenPhotoModal(samplePhoto2);
            }
          }}
          style={{ cursor: 'pointer' }}
          title="Clique para ver Foto em Alta Resolução"
        >
          <div className="square-img-wrapper">
            <img 
              src={samplePhoto2?.highResUrl || samplePhoto2?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80"} 
              alt="Look da Noite" 
              className="square-img-fill"
            />
            <div className="square-gradient-overlay" />
          </div>

          <div className="square-badge-top">
            <Sparkles size={11} color="#00f5d4" />
            <span>LOOK DA NOITE</span>
          </div>

          <div className="square-bottom-content">
            <span className="square-title">Gala & Street VIP</span>
            <div className="square-vote-row">
              <button 
                onClick={handleVoteSquare} 
                className={`square-vote-btn ${votedSquare1 ? 'voted' : ''}`}
              >
                <Heart size={14} fill={votedSquare1 ? '#ff007a' : 'none'} color={votedSquare1 ? '#ff007a' : '#ffffff'} />
                <span>{votedSquare1 ? '1.421 Votos' : 'Votar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAIR 1: [Quadrado: DJ Set & Stage 1:1] + [Retângulo: Radar de Festivais & WhatsApp]
  // =========================================================================
  if (pairIndex % 4 === 1) {
    return (
      <div className="feed-paired-blocks-container layout-square-rect">
        {/* 1. Bloco Quadrado (1:1) - Vintage Culture Set */}
        <div 
          className="paired-block-square dj-stage-card"
          onClick={() => {
            if (samplePhoto1 && onOpenPhotoModal) {
              soundFx.playLandmarkLock();
              onOpenPhotoModal(samplePhoto1);
            }
          }}
          style={{ cursor: 'pointer' }}
          title="Clique para ver o Set Completo e Fotos do Palco"
        >
          <div className="square-img-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&h=600&q=80" 
              alt="DJ Stage Set" 
              className="square-img-fill"
            />
            <div className="square-gradient-overlay" />
          </div>

          <div className="square-badge-top">
            <Radio size={11} color="#ff007a" />
            <span>MAINSTAGE LIVE</span>
          </div>

          <div className="square-bottom-content">
            <span className="square-title">Vintage Culture Set</span>
            <div className="square-audio-wave">
              <Music size={12} color="var(--accent-teal)" />
              <span>Gravação 8K Áudio PRO</span>
            </div>
          </div>
        </div>

        {/* 2. Bloco Retangular - Radar de Festas & Alerta WhatsApp */}
        <div 
          className="paired-block-rect festival-radar-card"
          onClick={() => {
            soundFx.playRadarTick();
            onOpenRadar?.();
          }}
          style={{ cursor: 'pointer' }}
          title="Clique para Abrir o Radar de Festas em Tempo Real"
        >
          <div className="rect-card-bg-img">
            <img 
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&h=600&q=80" 
              alt="Radar de Festivais" 
              className="rect-img-fill"
            />
            <div className="rect-gradient-overlay" />
          </div>

          <div className="rect-card-content">
            <div className="rect-top-badge">
              <Calendar size={12} color="#00f5d4" />
              <span>AGENDA VIP • PRÓXIMOS EVENTOS</span>
            </div>
            <h4 className="rect-card-title">Warung, Laroc & Green Valley</h4>
            <p 
              className="rect-card-desc"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playUnlockSuccess();
                onOpenWhatsAppAlert?.();
              }}
              title="Clique para Ativar seu Alerta no WhatsApp"
            >
              Fotógrafos credenciados já escalados. <strong style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }}>Ative seu alerta facial</strong> e receba seus flagras em tempo real no WhatsApp.
            </p>
            <div className="rect-action-row">
              <div 
                className="radar-status-dot-row"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playRadarTick();
                  onOpenRadar?.();
                }}
              >
                <span className="pulse-dot" />
                <span className="radar-status-text">14 Fotógrafos Ativos</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {onOpenWhatsAppAlert && (
                  <button 
                    className="rect-cta-btn"
                    style={{ background: 'rgba(37, 211, 102, 0.2)', border: '1px solid #25d366', color: '#25d366' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playUnlockSuccess();
                      onOpenWhatsAppAlert();
                    }}
                    title="Ativar Alerta WhatsApp"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </button>
                )}

                <button 
                  className="rect-cta-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playRadarTick();
                    onOpenRadar?.();
                  }}
                  title="Ver Radar de Festas"
                >
                  <MapPin size={13} />
                  <span>Ver Radar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAIR 2: [Retângulo: Fotógrafos Sony 8K] + [Quadrado: Enquete Rápida 1:1]
  // =========================================================================
  if (pairIndex % 4 === 2) {
    const totalQVotes = quizVotes.reduce((a, b) => a + b, 0);
    return (
      <div className="feed-paired-blocks-container layout-rect-square">
        {/* 1. Bloco Retangular */}
        <div 
          className="paired-block-rect photographer-spotlight-card"
          onClick={() => {
            if (samplePhoto1 && onOpenPhotoModal) {
              soundFx.playScanSweep();
              onOpenPhotoModal(samplePhoto1);
            }
          }}
          style={{ cursor: 'pointer' }}
          title="Clique para ver Foto com Sensor 50.1 MP"
        >
          <div className="rect-card-bg-img">
            <img 
              src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&h=600&q=80" 
              alt="Studio 8K" 
              className="rect-img-fill"
            />
            <div className="rect-gradient-overlay" />
          </div>

          <div className="rect-card-content">
            <div className="rect-top-badge">
              <Camera size={12} color="#ffb703" />
              <span>TECNOLOGIA MEFLAGROU • SONY ALPHA 1</span>
            </div>
            <h4 className="rect-card-title">Fotos com Nitidez Impecável</h4>
            <p className="rect-card-desc">
              Sensores de 50.1 megapixels e lentes G Master para capturar cada detalhe da sua noite em ultra alta definição.
            </p>
            <div className="rect-action-row">
              <div className="cert-seal-row">
                <ShieldCheck size={14} color="var(--accent-teal)" />
                <span className="cert-seal-text">Certificado de Autenticidade Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Bloco Quadrado (1:1) - Mini Quiz Interativo */}
        <div className="paired-block-square mini-quiz-card">
          <div className="mini-quiz-inner">
            <div className="square-badge-top">
              <Zap size={11} color="#ffb703" />
              <span>ENQUETE VIP</span>
            </div>
            <h5 className="mini-quiz-title">Qual o melhor festival do ano?</h5>

            <div className="mini-quiz-options">
              {['Tomorrowland', 'Ultra Brasil', 'Warung Day'].map((opt, i) => {
                const isSelected = votedQuizIndex === i;
                const pct = Math.round((quizVotes[i] / totalQVotes) * 100);
                return (
                  <button
                    key={opt}
                    onClick={() => handleQuizVote(i)}
                    className={`mini-quiz-opt-btn ${isSelected ? 'selected' : ''}`}
                  >
                    {votedQuizIndex !== null && (
                      <div className="mini-quiz-progress-fill" style={{ width: `${pct}%` }} />
                    )}
                    <span className="mini-opt-label">{opt}</span>
                    {votedQuizIndex !== null && (
                      <span className="mini-opt-pct">{pct}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PAIR 3: [Quadrado: Mosaico 1:1 de Flagras] + [Retângulo: Clube VIP Holográfico]
  // =========================================================================
  return (
    <div className="feed-paired-blocks-container layout-square-rect">
      {/* 1. Bloco Quadrado (1:1) */}
      <div 
        className="paired-block-square founder-mosaic-card"
        onClick={() => {
          if (samplePhoto1 && onOpenPhotoModal) {
            soundFx.playLandmarkLock();
            onOpenPhotoModal(samplePhoto1);
          }
        }}
        style={{ cursor: 'pointer' }}
        title="Clique para ver Coleção Presidencial"
      >
        <div className="square-img-wrapper">
          <img 
            src="/founder_avatar.jpg" 
            alt="Founder DEUS" 
            className="square-img-fill"
          />
          <div className="square-gradient-overlay" />
        </div>

        <div className="square-badge-top">
          <Crown size={11} color="#ffb703" />
          <span>DEUS • MEFLAGROU</span>
        </div>

        <div className="square-bottom-content">
          <span className="square-title">Área Presidencial 8K</span>
          <div className="square-meta-chip">
            <Sparkles size={11} color="#ffb703" />
            <span>Master Collection</span>
          </div>
        </div>
      </div>

      {/* 2. Bloco Retangular */}
      <div 
        className="paired-block-rect vip-club-banner-card"
        onClick={() => {
          soundFx.playUnlockSuccess();
          onOpenVipHub?.();
        }}
        style={{ cursor: 'pointer' }}
        title="Clique para Assinar o Clube VIP"
      >
        <div className="rect-card-bg-img">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&h=600&q=80" 
            alt="Clube VIP" 
            className="rect-img-fill"
          />
          <div className="rect-gradient-overlay" />
        </div>

        <div className="rect-card-content">
          <div className="rect-top-badge">
            <Flame size={12} color="#ff007a" />
            <span>CLUBE BLACK PASS MEFLAGROU</span>
          </div>
          <h4 className="rect-card-title">Acesso Prioritário & Descontos</h4>
          <p className="rect-card-desc">
            50% OFF em todas as fotos em alta resolução, download de álbuns inteiros com 1 clique e moldura dourada no perfil.
          </p>
          <div className="rect-action-row">
            <span className="rect-price-tag">Membro VIP Mensal</span>
            <button 
              className="rect-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playUnlockSuccess();
                onOpenVipHub?.();
              }}
            >
              <Check size={13} />
              <span>Assinar Clube</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
