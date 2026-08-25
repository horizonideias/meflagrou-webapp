import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  Check, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EventPhoto, UserProfile } from '../types';
import { MOCK_EVENTS } from '../data/mockDatabase';
import { soundFx } from '../services/biometricService';

interface ClientPhotoUploadModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onPhotoPublished: (newPhoto: EventPhoto) => void;
}

export const ClientPhotoUploadModal: React.FC<ClientPhotoUploadModalProps> = ({
  currentUser,
  onClose,
  onPhotoPublished,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [price, setPrice] = useState<number>(14.90);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [publishedPhoto, setPublishedPhoto] = useState<EventPhoto | null>(null);

  const sampleMobilePhotos = [
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setToastMsg('Selecione ou faça upload de uma foto da festa.');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setIsProcessing(true);
    soundFx.playRadarTick();

    setTimeout(() => {
      const eventObj = MOCK_EVENTS.find((ev) => ev.id === selectedEventId) || MOCK_EVENTS[0];

      const newPhoto: EventPhoto = {
        id: `client_photo_${Date.now()}`,
        url: imagePreview,
        thumbnailUrl: imagePreview,
        highResUrl: imagePreview,
        eventId: eventObj.id,
        eventName: eventObj.name,
        eventDate: eventObj.date,
        location: eventObj.location,
        city: eventObj.city,
        time: '01:30 AM',
        photographer: {
          name: currentUser.name,
          handle: `@${currentUser.handle}`,
          avatar: currentUser.avatar,
          camera: 'iPhone 15 Pro Max',
          lens: '24mm f/1.78',
        },
        exif: {
          camera: 'Apple iPhone 15 Pro Max',
          aperture: 'f/1.78',
          shutter: '1/60s',
          iso: '640',
          focalLength: '24mm',
        },
        tags: [
          {
            id: `tag_owner_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userHandle: currentUser.handle,
            userAvatar: currentUser.avatar,
            confidence: 99.4,
            boundingBox: { x: 30, y: 25, width: 35, height: 40 },
          },
        ],
        aspectRatio: 'portrait',
        likesCount: 1,
        forSaleByOwner: true,
        ownerPrice: price,
        ownerSellerId: currentUser.id,
        resolution: '4032 x 3024 (12 MP)',
        fileSize: '4.2 MB',
      };

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#ff007a', '#ffb703'],
      });

      soundFx.playUnlockSuccess();
      setIsProcessing(false);
      setPublishedPhoto(newPhoto);
      onPhotoPublished(newPhoto);
    }, 1200);
  };

  const handleFinish = () => {
    onClose();
  };

  const handlePublishAnother = () => {
    setPublishedPhoto(null);
    setImagePreview(null);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 245, 212, 0.95)',
          color: '#07080c',
          padding: '10px 22px',
          borderRadius: 24,
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 10px 30px rgba(0, 245, 212, 0.5)',
          zIndex: 10000,
        }}>
          <Check size={16} color="#07080c" />
          {toastMsg}
        </div>
      )}

      <div className="glass-panel" style={{
        maxWidth: 540,
        width: '100%',
        padding: 26,
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)',
        borderRadius: 24,
        animation: 'modalFadeIn 0.22s ease',
      }}>
        {!isProcessing && (
          <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
            <X size={18} />
          </button>
        )}

        {/* 🌟 TELA DE CONFIRMAÇÃO DE SUCESSO */}
        {publishedPhoto ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f5d4, #ff007a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 245, 212, 0.6)',
              marginBottom: 14
            }}>
              <CheckCircle2 size={30} color="#07080c" />
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>
              Foto Publicada com Sucesso! 🎉
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 16px 0', maxWidth: 400 }}>
              Sua foto do <strong>{publishedPhoto.eventName}</strong> já está adicionada à sua galeria e colocada à venda por <strong>R$ {price.toFixed(2).replace('.', ',')}</strong> via PIX.
            </p>

            {/* Thumbnail Preview */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 180,
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(0, 245, 212, 0.4)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.7)',
              marginBottom: 18
            }}>
              <img
                src={publishedPhoto.url}
                alt="Foto Publicada"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '3px 8px',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                R$ {price.toFixed(2).replace('.', ',')} no PIX
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button
                onClick={handleFinish}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                }}
              >
                <Eye size={16} />
                <span>Ver na Minha Galeria</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handlePublishAnother}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Plus size={15} />
                <span>Publicar Mais Fotos</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE ENVIO */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 245, 212, 0.4)'
              }}>
                <Smartphone size={20} color="#07080c" />
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Vender Foto Tirada na Festa
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Suba suas fotos do celular ou câmera e receba via PIX quando seus amigos comprarem.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Upload Area */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Foto do Celular / Álbum
                </label>

                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 180, border: '1px solid var(--accent-teal)' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: 'rgba(0,0,0,0.75)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label style={{
                      border: '2px dashed rgba(0, 245, 212, 0.4)',
                      borderRadius: 14,
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <UploadCloud size={32} color="var(--accent-teal)" style={{ marginBottom: 6 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                        Toque para escolher do rolo da câmera
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Fotos de iPhone / Android em alta qualidade
                      </span>
                    </label>

                    {/* Quick Samples */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Ou selecione um exemplo para testar:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {sampleMobilePhotos.map((url, i) => (
                          <div
                            key={i}
                            onClick={() => setImagePreview(url)}
                            style={{
                              aspectRatio: '1/1',
                              borderRadius: 8,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: imagePreview === url ? '2px solid var(--accent-teal)' : '1px solid rgba(255,255,255,0.1)',
                              transition: 'transform 0.2s ease'
                            }}
                          >
                            <img src={url} alt={`Sample ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Festa / Evento
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 12,
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  {MOCK_EVENTS.map((ev) => (
                    <option key={ev.id} value={ev.id} style={{ background: '#07080c', color: '#ffffff' }}>
                      {ev.name} ({ev.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Preset */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Preço de Venda da Foto (PIX)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
                  {[9.90, 14.90, 19.90].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrice(p)}
                      style={{
                        padding: '8px',
                        borderRadius: 10,
                        background: price === p ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.05)',
                        border: price === p ? 'none' : '1px solid var(--border-subtle)',
                        color: price === p ? '#07080c' : '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      R$ {p.toFixed(2).replace('.', ',')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!imagePreview || isProcessing}
                className="btn-primary"
                style={{
                  padding: '13px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                  marginTop: 4
                }}
              >
                <Sparkles size={17} />
                <span>{isProcessing ? 'Publicando Foto...' : `Publicar por R$ ${price.toFixed(2).replace('.', ',')} no PIX`}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
