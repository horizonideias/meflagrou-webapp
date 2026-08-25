import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Check, 
  Send, 
  Phone, 
  Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import type { UserProfile } from '../types';

interface WhatsAppAlertModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('(11) 98765-4321');
  const [telegramUser, setTelegramUser] = useState<string>(currentUser ? `@${currentUser.handle}` : '@meflagrou');
  const [notifyOnNewPhotos, setNotifyOnNewPhotos] = useState<boolean>(true);
  const [notifyOnSales2x, setNotifyOnSales2x] = useState<boolean>(true);
  const [notifyOnPartyNearby, setNotifyOnPartyNearby] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testSent, setTestSent] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    soundFx.playUnlockSuccess();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSendTestPush = () => {
    setIsSendingTest(true);
    soundFx.playRadarTick();

    setTimeout(() => {
      setIsSendingTest(false);
      setTestSent(true);
      soundFx.playUnlockSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#25D366', '#00f5d4', '#ffffff']
      });
      setTimeout(() => setTestSent(false), 4000);
    }, 1200);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid #25D366',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(37, 211, 102, 0.25)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 24,
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(37, 211, 102, 0.5)'
          }}>
            <MessageSquare size={22} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Alerta de Flagra no WhatsApp
              </h2>
              <span style={{
                background: 'rgba(37, 211, 102, 0.2)',
                border: '1px solid #25D366',
                color: '#25D366',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: '0.65rem',
                fontWeight: 900
              }}>
                IA PUSH 24H
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Receba suas fotos no WhatsApp na mesma hora em que o fotógrafo subir o álbum da festa.
            </p>
          </div>
        </div>

        {/* Simulated WhatsApp Message Bubble Preview */}
        <div style={{
          background: 'rgba(37, 211, 102, 0.06)',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ fontSize: '0.72rem', color: '#25D366', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={13} /> Prévia da Mensagem que Você Receberá:
          </div>

          <div style={{
            background: '#075E54',
            color: '#ffffff',
            borderRadius: '16px 16px 16px 4px',
            padding: '12px 14px',
            fontSize: '0.82rem',
            lineHeight: 1.4,
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            maxWidth: 480
          }}>
            <div style={{ fontWeight: 800, color: '#25D366', marginBottom: 4 }}>
              🔥 MEFLAGROU // Alerta de Novo Flagra!
            </div>
            <p style={{ margin: 0 }}>
              Olá <strong>{currentUser?.name || 'VIP'}</strong>! A IA biométrica acabou de identificar o seu rosto em <strong>3 novas fotos</strong> tiradas pelo <strong>Studio meflagrou</strong> na <strong>Sunset Festival 2026</strong>.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 8,
              padding: '6px 10px',
              marginTop: 8,
              fontSize: '0.75rem',
              color: '#00f5d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>🔗 meflagrou.com/f/sunset-2026</span>
              <span>100% Ultra HD</span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Número de WhatsApp (com DDD)
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#25D366" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(11) 99999-9999"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '10px 12px 10px 38px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Telegram (Opcional)
            </label>
            <input
              type="text"
              value={telegramUser}
              onChange={(e) => setTelegramUser(e.target.value)}
              placeholder="@seu_usuario"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '10px 12px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Toggle Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: '#ffffff' }}>
              <span>📸 Notificar imediatamente ao encontrar novos flagras</span>
              <input 
                type="checkbox" 
                checked={notifyOnNewPhotos} 
                onChange={(e) => setNotifyOnNewPhotos(e.target.checked)}
                style={{ accentColor: '#25D366', width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: '#ffffff' }}>
              <span>💰 Notificar quando uma foto sua for revendida (Lucro 2x)</span>
              <input 
                type="checkbox" 
                checked={notifyOnSales2x} 
                onChange={(e) => setNotifyOnSales2x(e.target.checked)}
                style={{ accentColor: '#25D366', width: 18, height: 18 }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: '#ffffff' }}>
              <span>📍 Avisar quando houver fotógrafos parceiros perto de você</span>
              <input 
                type="checkbox" 
                checked={notifyOnPartyNearby} 
                onChange={(e) => setNotifyOnPartyNearby(e.target.checked)}
                style={{ accentColor: '#25D366', width: 18, height: 18 }}
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSendTestPush}
              disabled={isSendingTest}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '11px',
                fontSize: '0.82rem',
                border: '1px solid #25D366',
                color: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Send size={15} />
              {isSendingTest ? 'Enviando...' : testSent ? '✅ Teste Enviado no WhatsApp!' : 'Testar Disparo no WhatsApp'}
            </button>

            <button
              type="submit"
              className="btn-primary"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#ffffff',
                padding: '11px',
                fontSize: '0.85rem',
                fontWeight: 800,
                boxShadow: '0 0 20px rgba(37, 211, 102, 0.4)'
              }}
            >
              <Check size={16} />
              {isSaved ? 'Configurações Salvas!' : 'Salvar Preferências'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
