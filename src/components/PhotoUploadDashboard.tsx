import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Sparkles, 
  Scan, 
  CheckCircle2, 
  DollarSign, 
  MapPin, 
  Layers, 
  Trash2, 
  Radio, 
  Eye, 
  ArrowRight, 
  Plus, 
  MessageSquare,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EVENTS } from '../data/mockDatabase';
import type { EventPhoto, UserProfile } from '../types';
import { soundFx } from '../services/biometricService';
import { useCart } from '../context/CartContext';

interface UploadQueueItem {
  id: string;
  file?: File;
  previewUrl: string;
  eventName: string;
  eventId: string;
  price: number;
  detectedFaces: number;
  status: 'pending' | 'scanning' | 'ready' | 'published';
  progress: number;
  resolution: string;
  fileSize: string;
}

interface PhotoUploadDashboardProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPhotosPublished?: (photos: EventPhoto[]) => void;
}

export const PhotoUploadDashboard: React.FC<PhotoUploadDashboardProps> = ({
  currentUser,
  isOpen,
  onClose,
  onPhotosPublished,
}) => {
  const { addClientPublishedPhoto, addPhotoToUserProfile } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode tabs: 'bulk' (Upload em Lote) | 'live' (Tethering / Ao Vivo) | 'history' (Histórico)
  const [activeTab, setActiveTab] = useState<'bulk' | 'live' | 'history'>('bulk');
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [defaultPrice, setDefaultPrice] = useState<number>(19.90);
  const [autoFaceId, setAutoFaceId] = useState<boolean>(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(true);
  const [isPublishingAll, setIsPublishingAll] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<number>(0);
  const [publishedBatchSummary, setPublishedBatchSummary] = useState<{
    totalPhotos: number;
    totalFaces: number;
    totalValue: number;
    photos: EventPhoto[];
  } | null>(null);

  // Queue of photos being prepared for upload
  const [photoQueue, setPhotoQueue] = useState<UploadQueueItem[]>([
    {
      id: 'item_demo_1',
      previewUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      eventName: MOCK_EVENTS[0].name,
      eventId: MOCK_EVENTS[0].id,
      price: 19.90,
      detectedFaces: 3,
      status: 'ready',
      progress: 100,
      resolution: '6000 x 4000 (24 MP)',
      fileSize: '8.4 MB',
    },
    {
      id: 'item_demo_2',
      previewUrl: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=800&q=80',
      eventName: MOCK_EVENTS[0].name,
      eventId: MOCK_EVENTS[0].id,
      price: 19.90,
      detectedFaces: 2,
      status: 'ready',
      progress: 100,
      resolution: '6000 x 4000 (24 MP)',
      fileSize: '7.9 MB',
    },
  ]);

  if (!isOpen) return null;

  const currentEvent = MOCK_EVENTS.find((e) => e.id === selectedEventId) || MOCK_EVENTS[0];

  // Handle Multi-file Selection from Device / SD Card
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundFx.playRadarTick();

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      const itemId = `item_${Date.now()}_${index}`;

      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setPhotoQueue((prev) => [
          ...prev,
          {
            id: itemId,
            file,
            previewUrl,
            eventName: currentEvent.name,
            eventId: currentEvent.id,
            price: defaultPrice,
            detectedFaces: Math.floor(Math.random() * 3) + 1,
            status: 'ready',
            progress: 100,
            resolution: '6000 x 4000 (24 MP)',
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Add demo photo batch
  const handleAddDemoBatch = () => {
    soundFx.playRadarTick();
    const sampleUrls = [
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    ];

    const added: UploadQueueItem[] = sampleUrls.map((url, idx) => ({
      id: `item_sample_${Date.now()}_${idx}`,
      previewUrl: url,
      eventName: currentEvent.name,
      eventId: currentEvent.id,
      price: defaultPrice,
      detectedFaces: Math.floor(Math.random() * 3) + 1,
      status: 'ready',
      progress: 100,
      resolution: '6000 x 4000 (24 MP)',
      fileSize: '8.2 MB',
    }));

    setPhotoQueue((prev) => [...prev, ...added]);
  };

  const handleRemoveQueueItem = (id: string) => {
    soundFx.playRadarTick();
    setPhotoQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    soundFx.playRadarTick();
    setPhotoQueue([]);
  };

  // Publish Entire Batch
  const handlePublishAllBatch = () => {
    if (photoQueue.length === 0) return;

    setIsPublishingAll(true);
    setPublishProgress(10);
    soundFx.playScanSweep();

    // Step 1: Scan faces
    setTimeout(() => {
      setPublishProgress(45);
      soundFx.playLandmarkLock();

      // Step 2: Indexing biometrics
      setTimeout(() => {
        setPublishProgress(80);
        soundFx.playRadarTick();

        // Step 3: Complete and save to store
        setTimeout(() => {
          setPublishProgress(100);
          soundFx.playUnlockSuccess();

          const newPublishedPhotos: EventPhoto[] = photoQueue.map((item, idx) => ({
            id: `batch_photo_${Date.now()}_${idx}`,
            url: item.previewUrl,
            thumbnailUrl: item.previewUrl,
            highResUrl: item.previewUrl,
            eventId: item.eventId,
            eventName: item.eventName,
            eventDate: currentEvent.date,
            location: 'Área VIP & Palco Principal',
            city: currentEvent.city,
            time: `${String(Math.floor(Math.random() * 4) + 1).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')} AM`,
            photographer: {
              name: currentUser.name,
              handle: currentUser.handle,
              avatar: currentUser.avatar,
              camera: 'Sony Alpha 7R V',
              lens: '50mm f/1.2 GM',
            },
            exif: {
              iso: '1600',
              shutter: '1/320s',
              aperture: 'f/1.4',
              focalLength: '50mm',
              camera: 'Sony Alpha 7R V',
            },
            tags: [
              {
                id: `tag_${Date.now()}_${idx}_owner`,
                userId: currentUser.id,
                userName: currentUser.name,
                userHandle: currentUser.handle,
                userAvatar: currentUser.avatar,
                confidence: 99.9,
                boundingBox: { x: 32, y: 22, width: 26, height: 32 },
              },
            ],
            aspectRatio: 'portrait',
            likesCount: 1,
            forSaleByOwner: true,
            ownerPrice: item.price,
            ownerSellerId: currentUser.id,
            resolution: item.resolution,
            fileSize: item.fileSize,
          }));

          // Sync into CartContext and User Profile store
          newPublishedPhotos.forEach((photo) => {
            addClientPublishedPhoto(photo);
            addPhotoToUserProfile(photo, currentUser);
          });

          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#00f5d4', '#ff007a', '#ffb703', '#9333ea'],
          });

          const totalFaces = photoQueue.reduce((acc, curr) => acc + curr.detectedFaces, 0);
          const totalVal = photoQueue.reduce((acc, curr) => acc + curr.price, 0);

          setPublishedBatchSummary({
            totalPhotos: photoQueue.length,
            totalFaces,
            totalValue: totalVal,
            photos: newPublishedPhotos,
          });

          if (onPhotosPublished) {
            onPhotosPublished(newPublishedPhotos);
          }

          setIsPublishingAll(false);
          setPhotoQueue([]);
        }, 800);
      }, 700);
    }, 700);
  };

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div 
        className="instagram-modal-container photo-upload-studio-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="upload-studio-header">
          <div className="studio-header-title-group">
            <div className="studio-brand-icon">
              <Camera size={22} color="#07080c" />
            </div>
            <div>
              <div className="studio-title-row">
                <h2 className="studio-main-title">Painel de Envio de Fotos (Upload Studio)</h2>
                <span className="studio-badge-pro">
                  <Sparkles size={11} />
                  IA Face ID 8K
                </span>
              </div>
              <p className="studio-subtitle">
                Envio em lote para fotógrafos e organizadores com reconhecimento facial automático e monetização PIX.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn" title="Fechar Painel">
            <X size={20} />
          </button>
        </div>

        {/* 🌟 SUMMARY VIEW AFTER BATCH PUBLISH */}
        {publishedBatchSummary ? (
          <div className="upload-summary-screen">
            <div className="summary-success-aura">
              <CheckCircle2 size={42} color="#07080c" />
            </div>

            <h3 className="summary-title">Lote Publicado com Sucesso! 🎉</h3>
            <p className="summary-desc">
              Todas as <strong>{publishedBatchSummary.totalPhotos} fotos</strong> foram indexadas com alta resolução no <strong>{currentEvent.name}</strong> e disponibilizadas no Feed.
            </p>

            {/* Metrics Row */}
            <div className="summary-stats-grid">
              <div className="summary-stat-card">
                <span className="stat-label">Fotos Publicadas</span>
                <strong className="stat-value text-teal">{publishedBatchSummary.totalPhotos}</strong>
              </div>
              <div className="summary-stat-card">
                <span className="stat-label">Rostos Mapeados</span>
                <strong className="stat-value text-magenta">{publishedBatchSummary.totalFaces} Faces</strong>
              </div>
              <div className="summary-stat-card">
                <span className="stat-label">Preço Médio PIX</span>
                <strong className="stat-value text-gold">
                  R$ {(publishedBatchSummary.totalValue / publishedBatchSummary.totalPhotos).toFixed(2).replace('.', ',')}
                </strong>
              </div>
            </div>

            {/* Published Previews Grid */}
            <div className="summary-photos-preview-strip no-scrollbar">
              {publishedBatchSummary.photos.map((p) => (
                <div key={p.id} className="summary-thumb-box">
                  <img src={p.url} alt={p.eventName} className="summary-thumb-img" />
                  <span className="summary-thumb-badge">8K Ultra HD</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="summary-actions-row">
              <button
                onClick={onClose}
                className="btn-primary summary-btn-feed"
              >
                <Eye size={17} />
                <span>Ver Flagras no Feed</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => setPublishedBatchSummary(null)}
                className="btn-secondary summary-btn-another"
              >
                <Plus size={16} />
                <span>Enviar Outro Lote</span>
              </button>
            </div>
          </div>
        ) : (
          /* MAIN UPLOAD WORKSPACE */
          <div className="upload-studio-body">
            {/* 1. Navigation Tabs Bar */}
            <div className="studio-tabs-navbar">
              <button
                onClick={() => setActiveTab('bulk')}
                className={`studio-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
              >
                <UploadCloud size={16} />
                <span>Upload em Lote ({photoQueue.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`studio-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
              >
                <Radio size={16} className={activeTab === 'live' ? 'pulse-live' : ''} />
                <span>Transmissão da Câmera (Tethering)</span>
              </button>
            </div>

            {/* 2. Global Event & Batch Pricing Controls */}
            <div className="studio-batch-controls-grid">
              {/* Event Selector */}
              <div className="studio-control-field">
                <label className="control-label">
                  <MapPin size={13} color="var(--accent-teal)" />
                  <span>Evento / Balada de Destino:</span>
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="studio-select-input"
                >
                  {MOCK_EVENTS.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Price per Photo */}
              <div className="studio-control-field">
                <label className="control-label">
                  <DollarSign size={13} color="var(--accent-gold)" />
                  <span>Valor Unitário no PIX:</span>
                </label>
                <div className="price-presets-row">
                  {[9.90, 14.90, 19.90, 29.90].map((prc) => (
                    <button
                      key={prc}
                      type="button"
                      onClick={() => setDefaultPrice(prc)}
                      className={`price-preset-pill ${defaultPrice === prc ? 'active' : ''}`}
                    >
                      R$ {prc.toFixed(2).replace('.', ',')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. AI Toggles (Face ID & WhatsApp Alerts) */}
            <div className="studio-toggles-bar">
              <label className="studio-toggle-item">
                <input
                  type="checkbox"
                  checked={autoFaceId}
                  onChange={(e) => setAutoFaceId(e.target.checked)}
                  className="studio-checkbox"
                />
                <div className="toggle-label-wrap">
                  <Scan size={14} color="var(--accent-teal)" />
                  <span>Mapear Rostos Automaticamente com IA (RetinaFace 99.4%)</span>
                </div>
              </label>

              <label className="studio-toggle-item">
                <input
                  type="checkbox"
                  checked={notifyWhatsApp}
                  onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                  className="studio-checkbox"
                />
                <div className="toggle-label-wrap">
                  <MessageSquare size={14} color="#25D366" />
                  <span>Notificar Reconhecidos no WhatsApp</span>
                </div>
              </label>
            </div>

            {/* 4. Dropzone & Queue Manager */}
            <div className="studio-dropzone-box">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelected}
                style={{ display: 'none' }}
              />

              <div className="dropzone-inner-content">
                <div className="dropzone-icon-aura">
                  <UploadCloud size={32} color="var(--accent-teal)" />
                </div>
                <h4 className="dropzone-title">Arraste fotos do SD Card / Câmera ou selecione arquivos</h4>
                <p className="dropzone-subtitle">Suporta fotos em Ultra HD 8K / 4K (JPEG, PNG, RAW) em lote simultâneo</p>

                <div className="dropzone-actions-row">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary dropzone-select-btn"
                  >
                    <UploadCloud size={16} />
                    <span>Selecionar Fotos do Computador / Celular</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddDemoBatch}
                    className="btn-secondary dropzone-demo-btn"
                  >
                    <Plus size={15} />
                    <span>Adicionar 3 Fotos Demo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Queue Items Grid & Management */}
            {photoQueue.length > 0 && (
              <div className="studio-queue-section">
                <div className="queue-section-header">
                  <div className="queue-title-row">
                    <Layers size={16} color="var(--accent-teal)" />
                    <h4>Fila de Envio ({photoQueue.length} fotos prontas)</h4>
                  </div>

                  <button
                    onClick={handleClearQueue}
                    className="queue-clear-btn"
                    title="Limpar toda a fila"
                  >
                    <Trash2 size={13} />
                    <span>Limpar Fila</span>
                  </button>
                </div>

                {/* Queue Cards Grid */}
                <div className="studio-queue-cards-grid no-scrollbar">
                  {photoQueue.map((item) => (
                    <div key={item.id} className="queue-photo-card">
                      <img src={item.previewUrl} alt="Queue Item" className="queue-card-img" />

                      {/* Top Badges */}
                      <div className="queue-card-badges">
                        <span className="queue-faces-badge">
                          <Scan size={10} />
                          {item.detectedFaces} Faces
                        </span>

                        <button
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="queue-card-delete-btn"
                          title="Remover foto"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="queue-card-bottom-bar">
                        <span className="queue-card-res">{item.resolution}</span>
                        <span className="queue-card-price">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Publishing Progress Indicator */}
            {isPublishingAll && (
              <div className="studio-publishing-progress-card">
                <div className="progress-header-row">
                  <div className="progress-status-title">
                    <Cpu size={16} className="animate-spin text-teal" />
                    <span>Processando Biometria & Indexando {photoQueue.length} Fotos...</span>
                  </div>
                  <strong className="progress-percent">{publishProgress}%</strong>
                </div>

                <div className="progress-track-bar">
                  <div 
                    className="progress-fill-bar" 
                    style={{ width: `${publishProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 7. Bottom Submit Bar */}
            <div className="studio-bottom-submit-bar">
              <div className="submit-info-left">
                <span className="submit-total-photos">{photoQueue.length} fotos prontas</span>
                <span className="submit-total-split">
                  Comissão Fotógrafo: <strong>60%</strong> • Royalties: <strong>15%</strong> • PIX Instantâneo
                </span>
              </div>

              <div className="submit-actions-right">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary submit-cancel-btn"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handlePublishAllBatch}
                  disabled={photoQueue.length === 0 || isPublishingAll}
                  className="btn-primary submit-publish-btn"
                >
                  <Sparkles size={17} />
                  <span>
                    {isPublishingAll 
                      ? 'Processando Lote...' 
                      : `Publicar ${photoQueue.length} Fotos no Feed`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
