import React, { useState } from 'react';
import { Swords, Flame, CheckCircle2, Trophy, ArrowRight, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto } from '../types';
import { soundFx } from '../services/biometricService';

interface FeedBattleCardProps {
  battleIndex: number;
  allPhotos: EventPhoto[];
  onOpenBattle?: () => void;
}

interface BattleScenario {
  id: string;
  title: string;
  category: string;
  photoA: {
    url: string;
    label: string;
    event: string;
    initialVotes: number;
  };
  photoB: {
    url: string;
    label: string;
    event: string;
    initialVotes: number;
  };
}

export const FeedBattleCard: React.FC<FeedBattleCardProps> = ({
  battleIndex,
  allPhotos,
  onOpenBattle,
}) => {
  // 4 Temas de Batalhas Diversificados
  const battleScenarios: BattleScenario[] = [
    {
      id: 'b1',
      title: 'Duelo de Festivais: Pyro Show vs Sunset Garden',
      category: 'MAINSTAGE 8K',
      photoA: {
        url: allPhotos[0]?.highResUrl || allPhotos[0]?.url || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Tomorrowland Pyro',
        event: 'Mainstage Itu • SP',
        initialVotes: 184,
      },
      photoB: {
        url: allPhotos[1]?.highResUrl || allPhotos[1]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Warung Sunset Garden',
        event: 'Garden Stage • Itajaí',
        initialVotes: 142,
      },
    },
    {
      id: 'b2',
      title: 'Batalha de Looks: Red Carpet Gala vs Camarote Neon',
      category: 'FASHION & GLAMOUR',
      photoA: {
        url: allPhotos[4]?.highResUrl || allPhotos[4]?.url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Baile do Copa Lux',
        event: 'Golden Room • Rio',
        initialVotes: 215,
      },
      photoB: {
        url: allPhotos[2]?.highResUrl || allPhotos[2]?.url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Privilège Neon Lounge',
        event: 'Dom Pérignon Deck',
        initialVotes: 198,
      },
    },
    {
      id: 'b3',
      title: 'Batalha de DJs: Vintage Culture vs Alok Infinite',
      category: 'LINE-UP ESTELAR',
      photoA: {
        url: allPhotos[12]?.highResUrl || allPhotos[12]?.url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Vintage Culture Live',
        event: 'Ultra Brasil Sunset',
        initialVotes: 320,
      },
      photoB: {
        url: allPhotos[13]?.highResUrl || allPhotos[13]?.url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Alok Infinite Tour',
        event: 'Laser Confetti Show',
        initialVotes: 295,
      },
    },
    {
      id: 'b4',
      title: 'Duelo do Amanhecer: D-EDGE 06h vs Bora Bora Beach',
      category: 'SUNRISE VIBES',
      photoA: {
        url: allPhotos[16]?.highResUrl || allPhotos[16]?.url || 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'D-EDGE 05h Techno',
        event: 'Pista 1 • São Paulo',
        initialVotes: 168,
      },
      photoB: {
        url: allPhotos[11]?.highResUrl || allPhotos[11]?.url || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1080&h=1920&q=80',
        label: 'Bora Bora Sunset Toast',
        event: 'Florianópolis • SC',
        initialVotes: 154,
      },
    },
  ];

  const currentScenario = battleScenarios[battleIndex % battleScenarios.length];

  const [votedSide, setVotedSide] = useState<'A' | 'B' | null>(null);
  const [votesA, setVotesA] = useState(currentScenario.photoA.initialVotes);
  const [votesB, setVotesB] = useState(currentScenario.photoB.initialVotes);

  const handleVote = (side: 'A' | 'B') => {
    if (votedSide) return;
    setVotedSide(side);
    soundFx.playRadarTick();
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#ff007a', '#00f5d4', '#ffb703'],
    });

    if (side === 'A') setVotesA((v) => v + 1);
    else setVotesB((v) => v + 1);
  };

  const totalVotes = votesA + votesB;
  const pctA = Math.round((votesA / totalVotes) * 100);
  const pctB = 100 - pctA;

  return (
    <div className="feed-battle-card-wrapper">
      {/* Header da Batalha */}
      <div className="feed-battle-card-header">
        <div className="battle-header-left">
          <div className="battle-category-pill">
            <Swords size={12} color="#ff007a" />
            <span>BATALHA 1v1 • {currentScenario.category}</span>
          </div>
          <h4 className="battle-main-title">{currentScenario.title}</h4>
        </div>

        {onOpenBattle && (
          <button onClick={onOpenBattle} className="battle-arena-link-btn" title="Ver todas as batalhas">
            <Trophy size={13} color="var(--accent-gold)" />
            <span>Arena Completa</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Arena de Duelo 1v1 (Duas Fotos Lado a Lado) */}
      <div className="feed-battle-duel-stage">
        {/* Foto A */}
        <div
          onClick={() => handleVote('A')}
          className={`battle-competitor-card side-a ${votedSide === 'A' ? 'voted-winner' : ''} ${votedSide && votedSide !== 'A' ? 'voted-loser' : ''}`}
        >
          <div className="competitor-img-frame">
            <img
              src={currentScenario.photoA.url}
              alt={currentScenario.photoA.label}
              className="competitor-img"
              loading="lazy"
            />
            <div className="competitor-gradient-bottom" />
          </div>

          <div className="competitor-badge-top left">
            <Flame size={11} color="#ff007a" />
            <span>OPÇÃO A</span>
          </div>

          {/* Info & Vote Button */}
          <div className="competitor-info-overlay">
            <span className="competitor-name">{currentScenario.photoA.label}</span>
            <span className="competitor-event">{currentScenario.photoA.event}</span>

            {votedSide ? (
              <div className="battle-result-bar-wrap">
                <div className="battle-pct-fill fill-a" style={{ width: `${pctA}%` }} />
                <div className="battle-pct-label-row">
                  <span className="pct-number">{pctA}%</span>
                  <span className="pct-count">{votesA} votos</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); handleVote('A'); }}
                className="battle-vote-action-btn btn-a"
              >
                <Heart size={13} fill="#ffffff" color="#ffffff" />
                <span>Votar na Opção A</span>
              </button>
            )}
          </div>
        </div>

        {/* VS Floating Badge no Centro */}
        <div className="feed-battle-vs-badge">
          <span className="vs-text">VS</span>
          <Sparkles size={10} color="#ffffff" className="vs-sparkle" />
        </div>

        {/* Foto B */}
        <div
          onClick={() => handleVote('B')}
          className={`battle-competitor-card side-b ${votedSide === 'B' ? 'voted-winner' : ''} ${votedSide && votedSide !== 'B' ? 'voted-loser' : ''}`}
        >
          <div className="competitor-img-frame">
            <img
              src={currentScenario.photoB.url}
              alt={currentScenario.photoB.label}
              className="competitor-img"
              loading="lazy"
            />
            <div className="competitor-gradient-bottom" />
          </div>

          <div className="competitor-badge-top right">
            <Sparkles size={11} color="#00f5d4" />
            <span>OPÇÃO B</span>
          </div>

          {/* Info & Vote Button */}
          <div className="competitor-info-overlay">
            <span className="competitor-name">{currentScenario.photoB.label}</span>
            <span className="competitor-event">{currentScenario.photoB.event}</span>

            {votedSide ? (
              <div className="battle-result-bar-wrap">
                <div className="battle-pct-fill fill-b" style={{ width: `${pctB}%` }} />
                <div className="battle-pct-label-row">
                  <span className="pct-number">{pctB}%</span>
                  <span className="pct-count">{votesB} votos</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); handleVote('B'); }}
                className="battle-vote-action-btn btn-b"
              >
                <Heart size={13} fill="#ffffff" color="#ffffff" />
                <span>Votar na Opção B</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer da Batalha com Feedback de Voto */}
      <div className="feed-battle-card-footer">
        {votedSide ? (
          <div className="battle-vote-confirmed-msg">
            <CheckCircle2 size={15} color="var(--accent-teal)" />
            <span>Seu voto foi registrado! ({totalVotes} participações na arena)</span>
          </div>
        ) : (
          <span className="battle-hint-text">
            👆 Clique em uma das fotos para registrar seu voto no ranking geral
          </span>
        )}
      </div>
    </div>
  );
};
