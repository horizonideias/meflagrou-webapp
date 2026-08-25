import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Image as ImageIcon,
  Cpu,
  Scan,
  CheckCircle2,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EVENTS, MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import type { EventPhoto } from '../types';
import { soundFx } from '../services/biometricService';

interface PhotographerUploaderProps {
  onClose: () => void;
  onPhotoUploaded: (newPhoto: EventPhoto) => void;
}

export const PhotographerUploader: React.FC<PhotographerUploaderProps> = ({
  onClose,
  onPhotoUploaded,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [detectedFacesCount, setDetectedFacesCount] = useState<number>(0);
  const [logStatus, setLogStatus] = useState<string>('');
  const [publishedPhoto, setPublishedPhoto] = useState<EventPhoto | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoPartyPhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80');
  };

  const handleProcessAndIndex = () => {
    if (!photoPreview) return;

    setIsProcessing(true);
    setLogStatus('Executando modelo de detecção facial RetinaFace...');
    soundFx.playScanSweep();

    setTimeout(() => {
      setLogStatus('Detectando múltiplos rostos e alinhando landmarks...');
      soundFx.playLandmarkLock();
      setDetectedFacesCount(2);

      setTimeout(() => {
        setLogStatus('Comparando vetores biométricos contra base meflagrou.com...');
        soundFx.playRadarTick();

        setTimeout(() => {
          setLogStatus('Faces indexadas com sucesso! 2 usuários notificados.');
          soundFx.playUnlockSuccess();

          const currentEvt = MOCK_EVENTS.find((e) => e.id === selectedEventId) || MOCK_EVENTS[0];
          
          const newPhoto: EventPhoto = {
            id: `photo_uploaded_${Date.now()}`,
            url: photoPreview,
            thumbnailUrl: photoPreview,
            highResUrl: photoPreview,
            eventId: currentEvt.id,
            eventName: currentEvt.name,
            eventDate: currentEvt.date,
            location: 'Frontstage & Área VIP',
            city: currentEvt.city,
            time: '01:30 AM',
            photographer: {
              name: 'Rafael Clicks',
              handle: 'rafael_clicks',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
              camera: 'Sony A7R V',
              lens: '50mm f/1.2 GM',
            },
            exif: {
              iso: '1250',
              shutter: '1/250s',
              aperture: 'f/1.4',
              focalLength: '50mm',
              camera: 'Sony Alpha 7R V',
            },
            tags: [
              {
                id: `tag_up_${Date.now()}_1`,
                userId: MOCK_USERS[0].id,
                userName: MOCK_USERS[0].name,
                userHandle: MOCK_USERS[0].handle,
                userAvatar: MOCK_USERS[0].avatar,
                confidence: 99.3,
                boundingBox: { x: 35, y: 20, width: 24, height: 30 },
              },
              {
                id: `tag_up_${Date.now()}_2`,
                userId: MOCK_USERS[1].id,
                userName: MOCK_USERS[1].name,
                userHandle: MOCK_USERS[1].handle,
                userAvatar: MOCK_USERS[1].avatar,
                confidence: 98.7,
                boundingBox: { x: 62, y: 22, width: 22, height: 28 },
              },
            ],
            aspectRatio: 'landscape',
            likesCount: 1,
            forSaleByOwner: true,
            ownerPrice: 19.90,
            resolution: '6000 x 4000 (24 MP)',
            fileSize: '8.1 MB',
          };

          MOCK_PHOTOS.unshift(newPhoto);

          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f5d4', '#ff007a', '#ffb703'],
          });

          setIsProcessing(false);
          setPublishedPhoto(newPhoto);
        }, 1000);
      }, 900);
    }, 900);
  };

  const handleFinishAndOpenFeed = () => {
    if (publishedPhoto) {
      onPhotoUploaded(publishedPhoto);
    } else {
      onClose();
    }
  };

  const handlePublishAnother = () => {
    setPublishedPhoto(null);
    setPhotoPreview(null);
    setDetectedFacesCount(0);
    setLogStatus('');
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}>
      <div className="glass-panel" style={{
        maxWidth: 580,
        width: '100%',
        padding: 26,
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.4)',
        borderRadius: 24,
        animation: 'modalFadeIn 0.22s ease',
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </button>

        {/* 🌟 TELA DE SUCESSO APÓS PUBLICAR */}
        {publishedPhoto ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f5d4, #ff007a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 245, 212, 0.6)',
              marginBottom: 16
            }}>
              <CheckCircle2 size={32} color="#07080c" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>
              Foto Publicada com Sucesso! 🎉
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 16px 0', maxWidth: 420 }}>
              Sua foto já foi indexada na base oficial do <strong>{publishedPhoto.eventName}</strong> com Face ID e está visível no Feed em 8K Ultra HD.
            </p>

            {/* Thumbnail Preview Card */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxHeight: 220,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(0, 245, 212, 0.4)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
              marginBottom: 20
            }}>
              <img
                src={publishedPhoto.url}
                alt="Publicada"
                style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(0, 245, 212, 0.95)',
                color: '#07080c',
                padding: '4px 10px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Scan size={13} />
                <span>2 Rostos Reconhecidos (99.4%)</span>
              </div>
              <div style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: 10,
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {publishedPhoto.eventName} • R$ 19,90 no PIX
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button
                onClick={handleFinishAndOpenFeed}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                  boxShadow: '0 4px 20px rgba(0, 245, 212, 0.4)'
                }}
              >
                <Eye size={17} />
                <span>Ver Flagra no Feed</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={handlePublishAnother}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Plus size={16} />
                <span>Publicar Outra Foto</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE ENVIO E PROCESSAMENTO */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(0, 245, 212, 0.15)',
                border: '1px solid var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={22} color="var(--accent-teal)" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Criar & Publicar Flagra 8K
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '2px 0 0 0' }}>
                  Envie fotos do evento para a IA auto-identificar os rostos e disponibilizar no feed.
                </p>
              </div>
            </div>

            {/* Event Selection */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Selecione o Evento / Balada
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              >
                {MOCK_EVENTS.map((evt) => (
                  <option key={evt.id} value={evt.id} style={{ background: '#0f1118', color: '#ffffff' }}>
                    {evt.name} ({evt.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Upload Area */}
            <div style={{
              border: '2px dashed var(--border-glass)',
              borderRadius: 16,
              padding: 20,
              textAlign: 'center',
              background: 'rgba(0,0,0,0.3)',
              marginBottom: 20
            }}>
              {photoPreview ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', maxHeight: 220 }}>
                  <img src={photoPreview} alt="Upload" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                  {detectedFacesCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(0, 245, 212, 0.95)',
                      color: '#07080c',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <Scan size={14} />
                      {detectedFacesCount} Faces Mapeadas
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <ImageIcon size={36} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 8, color: '#ffffff' }}>
                    Arraste fotos da festa ou envie do seu dispositivo
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <label className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <Upload size={14} />
                      Carregar do Celular / PC
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button
                      type="button"
                      onClick={handleUseDemoPartyPhoto}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                    >
                      Foto de Teste
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Logs */}
            {isProcessing && (
              <div style={{
                background: 'rgba(0, 245, 212, 0.1)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.8rem',
                color: 'var(--accent-teal)'
              }}>
                <Cpu size={18} className="animate-spin" />
                <span>{logStatus}</span>
              </div>
            )}

            {/* Submit Index Button */}
            <button
              onClick={handleProcessAndIndex}
              disabled={!photoPreview || isProcessing}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
              }}
            >
              <Sparkles size={17} />
              <span>{isProcessing ? 'Processando IA Biometria...' : 'Processar & Publicar Foto no Feed'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
