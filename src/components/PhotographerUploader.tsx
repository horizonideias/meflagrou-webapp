import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Image as ImageIcon,
  Cpu,
  CheckCircle2,
  Plus,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EVENTS, MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import type { EventPhoto, UserProfile } from '../types';
import { soundFx } from '../services/biometricService';
import { whatsappGatewayService } from '../services/whatsappGatewayService';

interface PhotographerUploaderProps {
  onClose: () => void;
  onPhotoUploaded: (newPhoto: EventPhoto) => void;
}

export const PhotographerUploader: React.FC<PhotographerUploaderProps> = ({
  onClose,
  onPhotoUploaded,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [logStatus, setLogStatus] = useState<string>('');
  const [notifiedUsers, setNotifiedUsers] = useState<string[]>([]);
  const [publishedPhotos, setPublishedPhotos] = useState<EventPhoto[]>([]);

  const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      const dataUrl = await promise;
      previews.push(dataUrl);
    }
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const handleUseDemoPartyPhoto = () => {
    setPhotoPreviews([
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
    ]);
  };

  const handleProcessAndIndex = async () => {
    if (photoPreviews.length === 0) return;

    setIsProcessing(true);
    setLogStatus('Extraindo metadados EXIF 8K e calibrando RetinaFace 3D...');
    soundFx.playScanSweep();

    setTimeout(() => {
      setLogStatus(`Varrendo ${photoPreviews.length} fotos e alinhando 468 landmarks faciais...`);
      soundFx.playLandmarkLock();

      setTimeout(async () => {
        setLogStatus('Indexando vetores biométricos contra a base de usuários meflagrou.com...');
        soundFx.playRadarTick();

        const currentEvt = MOCK_EVENTS.find((e) => e.id === selectedEventId) || MOCK_EVENTS[0];
        const newUploadedList: EventPhoto[] = [];
        const targetedUserNames: string[] = [];

        const matchedUsers: UserProfile[] = [MOCK_USERS[0], MOCK_USERS[1]];

        for (let i = 0; i < photoPreviews.length; i++) {
          const preview = photoPreviews[i];
          const newPhoto: EventPhoto = {
            id: `photo_uploaded_${Date.now()}_${i}`,
            url: preview,
            thumbnailUrl: preview,
            highResUrl: preview,
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
            tags: matchedUsers.map((u, uIdx) => ({
              id: `tag_up_${Date.now()}_${i}_${uIdx}`,
              userId: u.id,
              userName: u.name,
              userHandle: u.handle,
              userAvatar: u.avatar,
              confidence: 99.2 - uIdx * 0.5,
              boundingBox: { x: 30 + uIdx * 40, y: 20, width: 25, height: 35 },
            })),
            aspectRatio: 'portrait',
            resolution: '7680 x 4320 (8K UHD)',
            fileSize: '18.4 MB',
            likesCount: 14,
            isFeatured: true,
          };

          newUploadedList.push(newPhoto);
          MOCK_PHOTOS.unshift(newPhoto);
          onPhotoUploaded(newPhoto);
        }

        for (const user of matchedUsers) {
          targetedUserNames.push(user.name);
          const userPhone = user.whatsapp || user.phone;
          if (userPhone) {
            whatsappGatewayService.sendFlagraAlertNotification(
              userPhone,
              currentEvt.name,
              photoPreviews.length,
              'Rafael Clicks',
              'https://horizonideias9servidor-meflagrou.rkrxgo.easypanel.host/',
              user.name
            );
          }
        }

        setNotifiedUsers(targetedUserNames);
        setPublishedPhotos(newUploadedList);
        setIsProcessing(false);
        setLogStatus(`Lote publicado! ${targetedUserNames.length} usuários notificados no WhatsApp.`);
        soundFx.playUnlockSuccess();

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00f5d4', '#00e5ff', '#ff007a', '#ffbe0b'],
        });
      }, 1400);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}>
      <div className="glass-panel" style={{
        maxWidth: 620,
        width: '100%',
        padding: 28,
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        {!isProcessing && (
          <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
            <X size={18} />
          </button>
        )}

        {publishedPhotos.length > 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 10px' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(0, 245, 212, 0.15)',
              border: '2px solid var(--accent-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px rgba(0, 245, 212, 0.4)'
            }}>
              <CheckCircle2 size={36} color="var(--accent-teal)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
              Lote Publicado com Sucesso! 📸
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 440, margin: '0 auto 18px auto' }}>
              Suas {publishedPhotos.length} fotos foram indexadas pela IA biométrica 3D e já estão no feed oficial do evento.
            </p>

            <div style={{
              background: 'rgba(37, 211, 102, 0.12)',
              border: '1px solid rgba(37, 211, 102, 0.4)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 20,
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#25d366', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>
                <MessageSquare size={16} />
                <span>Alertas de Flagra Disparados via WhatsApp (Evolution API)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Notificamos instantaneamente: <strong>{notifiedUsers.join(', ')}</strong> com link direto e prévia em alta resolução.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
              {publishedPhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.thumbnailUrl}
                  alt={photo.eventName}
                  style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--accent-teal)' }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  const galleryEl = document.getElementById('profile-gallery-section') || document.getElementById('user-photos-grid') || document.querySelector('.profile-unified-photos-grid');
                  if (galleryEl) {
                    galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 300);
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}
            >
              <Sparkles size={16} />
              Concluir e Ver na Galeria
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(0, 245, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={20} color="var(--accent-teal)" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 }}>
                  Portal do Fotógrafo Pro
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  Upload em lote com EXIF 8K, auto-tagging facial 3D e alerta no WhatsApp
                </p>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-subtle)', margin: '14px 0 18px 0' }} />

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Selecione o Evento Vinculado
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
                {MOCK_EVENTS.map((evt) => (
                  <option key={evt.id} value={evt.id} style={{ background: '#090b10' }}>
                    {evt.name} • {evt.city} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Upload em Lote (RAW, JPEG, PNG até 8K)
              </label>

              {photoPreviews.length > 0 ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginBottom: 10 }}>
                    {photoPreviews.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative', height: 100, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                        <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <label className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.78rem', textAlign: 'center', cursor: 'pointer' }}>
                      <Plus size={14} /> Adicionar Mais Fotos
                      <input type="file" multiple accept="image/*" onChange={handleMultiFileChange} style={{ display: 'none' }} />
                    </label>
                    <button onClick={() => setPhotoPreviews([])} className="btn-icon" style={{ padding: '8px 12px' }}>
                      Limpar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  border: '2px dashed var(--border-glass)',
                  borderRadius: 16,
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <Upload size={32} color="var(--accent-teal)" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
                    Arraste fotos do evento ou selecione do computador
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    Suporte a lote de até 500 fotos com leitura EXIF e marca d'água automática
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    <label className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <ImageIcon size={14} /> Selecionar Arquivos
                      <input type="file" multiple accept="image/*" onChange={handleMultiFileChange} style={{ display: 'none' }} />
                    </label>

                    <button
                      onClick={handleUseDemoPartyPhoto}
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      Usar Fotos de Demonstração
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isProcessing && (
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 16,
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: 'var(--accent-teal)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={16} className="animate-spin" />
                  <span>{logStatus}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleProcessAndIndex}
              disabled={isProcessing || photoPreviews.length === 0}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.9rem',
                opacity: photoPreviews.length === 0 ? 0.6 : 1,
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)'
              }}
            >
              <Cpu size={16} />
              {isProcessing
                ? 'Indexando com IA & Disparando WhatsApp...'
                : `Processar ${photoPreviews.length} Foto(s) & Disparar Alertas`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};