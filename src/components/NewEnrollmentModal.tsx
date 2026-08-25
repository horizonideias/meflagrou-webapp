import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  User, 
  MapPin, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Video,
  RefreshCw,
  Lock,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../types';
import { enrollNewUserFace, soundFx } from '../services/biometricService';
import { validateRegistrationForm, sanitizeInput, formatWhatsAppPhone } from '../utils/securityUtils';
import { InstagramIcon } from './Icons';

interface NewEnrollmentModalProps {
  onClose: () => void;
  onEnrollmentComplete: (newUser: UserProfile) => void;
}

export const NewEnrollmentModal: React.FC<NewEnrollmentModalProps> = ({
  onClose,
  onEnrollmentComplete,
}) => {
  // 1. Form States
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [email1, setEmail1] = useState<string>('');
  const [email2, setEmail2] = useState<string>('');
  const [handle, setHandle] = useState<string>('');
  const [city, setCity] = useState<string>('São Paulo, SP');

  // 2. Selfie & Biometrics States
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepMessage, setStepMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mask CPF input (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(v);
  };

  // Live Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('Não foi possível acessar a câmera. Você pode enviar uma foto da galeria ou usar a selfie de exemplo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setPhotoDataUrl(dataUrl);
        soundFx.playLandmarkLock();
      }
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoDataUrl(event.target?.result as string);
        soundFx.playRadarTick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSelfie = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
    ];
    setPhotoDataUrl(sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)]);
    soundFx.playRadarTick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateRegistrationForm({
      name,
      cpf,
      whatsapp,
      email1,
      email2,
      photoDataUrl,
    });

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Verifique os dados informados.');
      soundFx.playRadarTick();
      return;
    }

    setIsProcessing(true);
    setStepMessage('Criptografando dados cadastrais e gerando Face ID...');
    soundFx.playScanSweep();

    setTimeout(() => {
      setStepMessage('Indexando biometria facial 128-D no meflagrou.com...');
      soundFx.playRadarTick();

      setTimeout(() => {
        setStepMessage('Vinculando acervo e ativando perfil com sucesso...');
        soundFx.playUnlockSuccess();

        const newUser = enrollNewUserFace({
          name: sanitizeInput(name),
          cpf: cpf.trim(),
          whatsapp: whatsapp.trim(),
          address: sanitizeInput(address),
          email1: sanitizeInput(email1).toLowerCase(),
          email2: sanitizeInput(email2).toLowerCase(),
          handle: sanitizeInput(handle) || sanitizeInput(name).toLowerCase().replace(/\s+/g, '_'),
          city: sanitizeInput(city) || 'São Paulo, SP',
          avatarDataUrl: photoDataUrl || '',
        });

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#25d366', '#00f5d4', '#ff007a', '#ffb703'],
        });

        setTimeout(() => {
          setIsProcessing(false);
          onEnrollmentComplete(newUser);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="instagram-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div 
        className="glass-panel" 
        style={{
          maxWidth: 620,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 24px',
          position: 'relative',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
          border: '1.5px solid rgba(0, 245, 212, 0.35)',
          borderRadius: 24,
          background: 'rgba(11, 14, 22, 0.96)',
          margin: 'auto'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 18, right: 18, zIndex: 10 }}
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.2), rgba(255, 0, 122, 0.2))',
            border: '1.5px solid var(--accent-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
          }}>
            <ShieldCheck size={26} color="var(--accent-teal)" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginBottom: 4 }}>
            Área de Cadastro de Usuário
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Cadastre seus dados e ative seu reconhecimento biométrico <strong>Face ID</strong>
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(255, 0, 122, 0.15)',
            border: '1px solid #ff007a',
            color: '#ff70a6',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: 16
          }}>
            <AlertCircle size={16} color="#ff007a" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* 1. Nome Completo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={13} color="var(--accent-teal)" />
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Gabriel Alencar Rocha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* 2. CPF, WhatsApp & Instagram */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={13} color="var(--accent-teal)" />
                CPF *
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                className="input-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} color="#25d366" />
                WhatsApp com DDD *
              </label>
              <input
                type="tel"
                placeholder="(11) 98888-7777"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsAppPhone(e.target.value))}
                className="input-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* 3. Endereço Completo, Cidade & Instagram */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="var(--accent-teal)" />
              Endereço Completo (Rua, Nº, Bairro)
            </label>
            <input
              type="text"
              placeholder="Ex: Av. Paulista, 1500 - Bela Vista"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-base"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <InstagramIcon size={13} color="var(--accent-pink)" />
                @ Instagram (Opcional)
              </label>
              <input
                type="text"
                placeholder="@seunome"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="input-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} color="var(--accent-teal)" />
                Cidade / UF
              </label>
              <input
                type="text"
                placeholder="São Paulo, SP"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* 4. E-mail 1 (Principal) & E-mail 2 (Secundário / Recuperação) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="var(--accent-teal)" />
                E-mail 1 (Principal) *
              </label>
              <input
                type="email"
                required
                placeholder="principal@email.com"
                value={email1}
                onChange={(e) => setEmail1(e.target.value)}
                className="input-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="var(--accent-gold)" />
                E-mail 2 (Secundário / Backup)
              </label>
              <input
                type="email"
                placeholder="backup@email.com"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                className="input-base"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          {/* 5. Foto SELFIE / Biometria Facial */}
          <div style={{ 
            border: '1.5px dashed rgba(0, 245, 212, 0.35)', 
            borderRadius: 18, 
            padding: 16, 
            background: 'rgba(0, 245, 212, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={16} color="var(--accent-teal)" />
                Foto SELFIE (Face ID) *
              </span>
              {photoDataUrl && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(0, 245, 212, 0.2)', color: 'var(--accent-teal)', padding: '2px 8px', borderRadius: 8, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12} /> Selfie Pronta
                </span>
              )}
            </div>

            {/* Live Camera View */}
            {isCameraActive ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', width: 220, height: 220, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent-teal)', boxShadow: '0 0 25px rgba(0, 245, 212, 0.5)' }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {/* Oval Guideline */}
                  <div style={{ position: 'absolute', top: '10%', left: '15%', right: '15%', bottom: '10%', border: '2px dashed rgba(0, 245, 212, 0.7)', borderRadius: '50%', pointerEvents: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="btn-primary"
                    style={{ padding: '8px 18px', borderRadius: 20, fontSize: '0.84rem', fontWeight: 800, background: 'var(--accent-teal)', color: '#07080c' }}
                  >
                    📸 Capturar Foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn-secondary"
                    style={{ padding: '8px 14px', borderRadius: 20, fontSize: '0.84rem' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : photoDataUrl ? (
              /* Photo Preview */
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid var(--accent-teal)', boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)' }}>
                  <img src={photoDataUrl} alt="Selfie do Usuário" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Video size={13} color="var(--accent-teal)" />
                    Tirar Outra Selfie
                  </button>
                  <label
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      textAlign: 'center',
                      fontWeight: 700
                    }}
                  >
                    📁 Trocar por Arquivo
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            ) : (
              /* Selfie Buttons Option Grid */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.18), rgba(0, 229, 255, 0.12))',
                    border: '1px solid rgba(0, 245, 212, 0.4)',
                    color: 'var(--accent-teal)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.76rem',
                    fontWeight: 800
                  }}
                >
                  <Camera size={20} />
                  Tirar Selfie
                </button>

                <label
                  style={{
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  <Upload size={20} color="#ff007a" />
                  Galeria / Foto
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <button
                  type="button"
                  onClick={handleQuickSelfie}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.15), rgba(251, 133, 0, 0.1))',
                    border: '1px solid rgba(255, 183, 3, 0.35)',
                    color: '#ffb703',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.76rem',
                    fontWeight: 800
                  }}
                >
                  <Sparkles size={20} />
                  Selfie Exemplo
                </button>
              </div>
            )}

            {cameraError && (
              <p style={{ fontSize: '0.72rem', color: '#ffb703', margin: 0, textAlign: 'center' }}>
                {cameraError}
              </p>
            )}
          </div>

          {/* Privacy & LGPD Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}>
            <Lock size={12} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
            <span>Seus dados e biometria estão protegidos com criptografia e em total conformidade com a LGPD.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              marginTop: 6,
              padding: '14px 20px',
              borderRadius: 16,
              background: isProcessing
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, #00f5d4, #00e5ff, #7928ca)',
              color: isProcessing ? 'var(--text-muted)' : '#07080c',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontWeight: 900,
              fontSize: '0.94rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isProcessing ? 'none' : '0 8px 24px rgba(0, 245, 212, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                {stepMessage || 'Cadastrando...'}
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Concluir Cadastro & Ativar Face ID
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
