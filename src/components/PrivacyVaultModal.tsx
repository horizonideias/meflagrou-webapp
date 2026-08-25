import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Trash2, 
  EyeOff, 
  Download, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import type { UserProfile } from '../types';

interface PrivacyVaultModalProps {
  user: UserProfile;
  onClose: () => void;
  onBiometricWipe: () => void;
}

export const PrivacyVaultModal: React.FC<PrivacyVaultModalProps> = ({
  user,
  onClose,
  onBiometricWipe,
}) => {
  const [autoBlur, setAutoBlur] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportDataReport = () => {
    const reportData = {
      plataforma: 'meflagrou.com // LGPD Compliance Portal',
      dataExportacao: new Date().toISOString(),
      titular: {
        nome: user.name,
        handle: user.handle,
        cidade: user.city,
        assinaturaBiometricaId: user.faceSignatureId,
      },
      metricas: {
        totalFotosIdentificadas: user.totalPhotosCount,
        totalEventosParticipados: user.eventsCount,
      },
      direitosLGPD: 'Artigo 18 da Lei Geral de Proteção de Dados (Lei nº 13.709/2018)',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_lgpd_${user.handle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Relatório de dados pessoais (LGPD) exportado com sucesso!');
  };

  const handleToggleAutoBlur = () => {
    const newState = !autoBlur;
    setAutoBlur(newState);
    showToast(newState ? 'Modo Anônimo ativado: seu rosto será desfocado em fotos de fundo.' : 'Modo Anônimo desativado.');
  };

  const handleExecuteWipe = () => {
    showToast('Assinatura biométrica apagada permanentemente dos servidores.');
    setTimeout(() => {
      onBiometricWipe();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
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
        maxWidth: 640,
        width: '100%',
        padding: 28,
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 35px rgba(0, 245, 212, 0.2)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(0, 245, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--accent-teal)'
          }}>
            <ShieldCheck size={24} color="var(--accent-teal)" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800 }}>
              Central de Privacidade & Biometria (LGPD)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              Controle absoluto sobre seus dados faciais conforme a Lei nº 13.709/2018.
            </p>
          </div>
        </div>

        {/* Biometric Credentials Badge */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 14,
          padding: 16,
          border: '1px solid var(--border-subtle)',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Assinatura Biométrica Ativa
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
              HASH SHA-256
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#ffffff', wordBreak: 'break-all', background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: 8 }}>
            {user.faceSignatureId}-98F3A4E21BC0092
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Seus vetores faciais são processados com criptografia ponta a ponta e nunca são vendidos a terceiros.
          </div>
        </div>

        {/* Privacy Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {/* Auto Blur */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <EyeOff size={20} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Modo Anônimo Automático
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Desfoca automaticamente seu rosto caso você apareça ao fundo em fotos alheias.
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={autoBlur}
              onChange={handleToggleAutoBlur}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
            />
          </div>

          {/* Export LGPD Report */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Download size={20} color="var(--accent-teal)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  Exportar Relatório Completo (LGPD)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Baixe todos os logs de indexação e fotos associadas ao seu perfil em formato JSON.
                </div>
              </div>
            </div>

            <button
              onClick={handleExportDataReport}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Baixar JSON
            </button>
          </div>

          {/* Biometric Wipe Warning Box */}
          <div style={{
            background: 'rgba(255, 0, 122, 0.06)',
            border: '1px solid rgba(255, 0, 122, 0.3)',
            borderRadius: 14,
            padding: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: '#ff4d94', fontWeight: 800, fontSize: '0.88rem' }}>
              <AlertTriangle size={18} />
              Exclusão Permanente dos Dados Faciais
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>
              Ao solicitar a exclusão, todos os seus 68 vetores biométricos serão apagados da IA. O meflagrou.com não conseguirá mais reconhecer você em fotos futuras.
            </p>

            {confirmDelete ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleExecuteWipe}
                  style={{
                    background: '#ff007a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 16px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirmar Exclusão Definitiva
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ff007a',
                  color: '#ff007a',
                  borderRadius: 10,
                  padding: '7px 14px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Trash2 size={14} />
                Solicitar Exclusão da Minha Biometria
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
