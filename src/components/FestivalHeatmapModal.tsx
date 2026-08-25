import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Flame, 
  Sparkles, 
  Camera, 
  Radio
} from 'lucide-react';
import type { EventPhoto } from '../types';

interface FestivalHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPhotos: EventPhoto[];
  onOpenPhotoModal: (photo: EventPhoto) => void;
}

interface SectorInfo {
  id: string;
  name: string;
  tag: string;
  coords: { x: number; y: number };
  photosCount: number;
  photographersActive: number;
  temperature: 'ultra-hot' | 'hot' | 'warm';
  description: string;
}

export const FestivalHeatmapModal: React.FC<FestivalHeatmapModalProps> = ({
  isOpen,
  onClose,
  allPhotos,
  onOpenPhotoModal,
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>('main_stage');

  if (!isOpen) return null;

  const sectors: SectorInfo[] = [
    {
      id: 'main_stage',
      name: 'Main Stage (Palco Principal)',
      tag: 'Palco Principal',
      coords: { x: 50, y: 35 },
      photosCount: 342,
      photographersActive: 5,
      temperature: 'ultra-hot',
      description: 'Pico de flagras com show de pirotecnia e laserglow.',
    },
    {
      id: 'camarote_vip',
      name: 'Camarote VIP & Backstage',
      tag: 'Camarote',
      coords: { x: 78, y: 48 },
      photosCount: 215,
      photographersActive: 3,
      temperature: 'ultra-hot',
      description: 'Área com maior concentração de celebridades e convidados VIP.',
    },
    {
      id: 'sunset_deck',
      name: 'Sunset Deck & Lounge',
      tag: 'Sunset',
      coords: { x: 26, y: 65 },
      photosCount: 128,
      photographersActive: 2,
      temperature: 'hot',
      description: 'Fotos com luz dourada do pôr do sol e coquetelaria.',
    },
    {
      id: 'open_air_tunnel',
      name: 'Túnel Neon & Instalações de Arte',
      tag: 'Arte',
      coords: { x: 42, y: 80 },
      photosCount: 94,
      photographersActive: 2,
      temperature: 'warm',
      description: 'Espaço com iluminação prismática ideal para retratos 8K.',
    },
  ];

  const currentSector = sectors.find((s) => s.id === selectedSectorId) || sectors[0];
  const sectorPhotos = allPhotos.slice(0, 6);

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div 
        className="instagram-modal-container festival-heatmap-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="heatmap-modal-header">
          <div className="heatmap-title-group">
            <div className="heatmap-pulse-badge">
              <Radio size={14} className="radar-live-beacon" />
              <span>AO VIVO NO FESTIVAL</span>
            </div>
            <h3 className="heatmap-main-title">Mapa de Calor da Balada (Heatmap)</h3>
            <p className="heatmap-sub">Veja onde os fotógrafos oficiais estão clicando em tempo real</p>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="heatmap-modal-body">
          {/* Mapa Escuro Interativo com Círculos de Calor */}
          <div className="heatmap-stage-radar">
            {/* Grid & Compass Lines */}
            <div className="radar-grid-rings" />
            <div className="radar-compass-axis" />

            {/* Setores com Pinos Pulsantes */}
            {sectors.map((sector) => {
              const isSelected = sector.id === selectedSectorId;
              return (
                <div
                  key={sector.id}
                  className={`heatmap-pin-anchor ${sector.temperature} ${isSelected ? 'selected' : ''}`}
                  style={{ left: `${sector.coords.x}%`, top: `${sector.coords.y}%` }}
                  onClick={() => setSelectedSectorId(sector.id)}
                >
                  <div className="heat-glow-aura" />
                  <div className="heat-pin-dot">
                    <Flame size={12} color="#ffffff" />
                  </div>
                  <div className="heat-pin-label">
                    <span>{sector.tag}</span>
                    <strong>{sector.photosCount} fotos</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Painel do Setor Selecionado */}
          <div className="heatmap-sector-details">
            <div className="sector-info-header">
              <div className="sector-title-row">
                <MapPin size={16} color="var(--accent-teal)" />
                <h4>{currentSector.name}</h4>
              </div>
              <div className="sector-stats-chips">
                <span className="stat-chip">
                  <Camera size={12} />
                  {currentSector.photographersActive} Fotógrafos na Pista
                </span>
                <span className="stat-chip highlighted">
                  <Sparkles size={12} />
                  {currentSector.photosCount} Fotos Indexadas
                </span>
              </div>
            </div>
            <p className="sector-description-text">{currentSector.description}</p>

            {/* Mini Galeria de Fotos Recentes Desse Setor */}
            <div className="sector-mini-photos-grid">
              {sectorPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="sector-mini-photo-card"
                  onClick={() => onOpenPhotoModal(photo)}
                >
                  <img src={photo.url} alt={photo.eventName} className="mini-photo-img" />
                  <div className="mini-photo-overlay">
                    <span>{photo.likesCount} 🔥</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
