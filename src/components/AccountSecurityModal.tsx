import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Laptop, 
  LogOut, 
  Fingerprint, 
  History, 
  Save,
  Check
} from 'lucide-react';
import type { UserProfile, UserSecuritySettings } from '../types';
import { authSecurityService } from '../services/authSecurityService';
import { haptics } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface AccountSecurityModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSecuritySettings: (settings: UserSecuritySettings) => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateSecuritySettings,
}) => {
  const currentSettings: UserSecuritySettings = user.securitySettings || authSecurityService.createDefaultSecuritySettings();

  const [activeTab, setActiveTab] = useState<'overview' | 'pin' | 'sessions' | 'history'>('overview');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(currentSettings.twoFactorEnabled ?? true);
  const [faceIdEnabled, setFaceIdEnabled] = useState<boolean>(currentSettings.faceIdBiometricEnabled ?? true);
  const [loginAlerts, setLoginAlerts] = useState<boolean>(currentSettings.loginAlertsWhatsApp ?? true);
  const [pinInput, setPinInput] = useState<string>(currentSettings.securityPin || '');
  const [confirmPinInput, setConfirmPinInput] = useState<string>(currentSettings.securityPin || '');
  const [pinError, setPinError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState(currentSettings.activeSessions || []);

  if (!isOpen) return null;

  const securityScore = authSecurityService.calculateSecurityScore({
    ...user,
    securitySettings: {
      ...currentSettings,
      twoFactorEnabled,
      faceIdBiometricEnabled: faceIdEnabled,
      securityPin: pinInput,
    }
  });

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const clean = pinInput.replace(/\D/g, '');
    if (clean.length !== 6) {
      setPinError('O PIN de segurança deve conter exatamente 6 números.');
      haptics.error();
      return;
    }

    if (clean !== confirmPinInput.replace(/\D/g, '')) {
      setPinError('Os PINs digitados não coincidem.');
      haptics.error();
      return;
    }

    const updated: UserSecuritySettings = {
      ...currentSettings,
      securityPin: clean,
      twoFactorEnabled,
      faceIdBiometricEnabled: faceIdEnabled,
      loginAlertsWhatsApp: loginAlerts,
      securityScore,
      lastPasswordChange: new Date().toLocaleDateString('pt-BR'),
      activeSessions,
    };

    onUpdateSecuritySettings(updated);
    haptics.success();
    setSuccessToast('PIN de segurança de 6 dígitos atualizado com sucesso! 🔒');
    setTimeout(() => setSuccessToast(null), 3500);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#00f0ff', '#ffb703']
    });
  };

  const handleTerminateOtherSessions = () => {
    haptics.lightTick();
    const currentOnly = (activeSessions || []).filter((s: any) => s.isCurrent);
    setActiveSessions(currentOnly);

    const updated: UserSecuritySettings = {
      ...currentSettings,
      activeSessions: currentOnly,
    };
    onUpdateSecuritySettings(updated);
    setSuccessToast('Todas as outras sessões foram desconectadas com sucesso!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 100000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 240, 255, 0.2)',
          padding: 24,
          position: 'relative',
          animation: 'modalFadeIn 0.25s ease'
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
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Segurança & Proteção da Conta
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
              Autenticação de 2 Fatores, PIN de Acesso e Gerenciamento de Sessões.
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(0, 245, 212, 0.04))',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Índice de Segurança da Conta
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: securityScore >= 80 ? 'var(--accent-teal)' : '#ffb703' }}>
                {securityScore}%
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
                background: securityScore >= 80 ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 183, 3, 0.15)',
                color: securityScore >= 80 ? 'var(--accent-teal)' : '#ffb703',
                border: `1px solid ${securityScore >= 80 ? 'var(--accent-teal)' : '#ffb703'}`
              }}>
                {securityScore >= 80 ? 'PROTEÇÃO MÁXIMA' : 'RECOMENDAÇÃO DE SEGURANÇA'}
              </span>
            </div>
          </div>

          <div style={{ width: 100, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              width: `${securityScore}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f0ff, #00f5d4)',
              borderRadius: 10,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 18 }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              background: activeTab === 'overview' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'overview' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: activeTab === 'overview' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              background: activeTab === 'pin' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'pin' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: activeTab === 'pin' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            PIN 6 Dígitos
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              background: activeTab === 'sessions' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'sessions' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: activeTab === 'sessions' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Sessões Ativas
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 4px',
              borderRadius: 10,
              background: activeTab === 'history' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === 'history' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: activeTab === 'history' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Histórico
          </button>
        </div>

        {/* Tab 1: Overview & 2FA */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 2FA Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#25d366'
                }}>
                  <Smartphone size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#ffffff', display: 'block' }}>
                    Autenticação em 2 Fatores (WhatsApp 2FA)
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Exige código de 6 dígitos via WhatsApp em novos acessos
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => {
                  haptics.lightTick();
                  setTwoFactorEnabled(e.target.checked);
                  onUpdateSecuritySettings({ ...currentSettings, twoFactorEnabled: e.target.checked });
                }}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
              />
            </div>

            {/* Face ID Biometric Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)'
                }}>
                  <Fingerprint size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#ffffff', display: 'block' }}>
                    Login Rápido com Face ID / Biometria
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Permite entrar sem digitar senha usando seu reconhecimento facial
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={faceIdEnabled}
                onChange={(e) => {
                  haptics.lightTick();
                  setFaceIdEnabled(e.target.checked);
                  onUpdateSecuritySettings({ ...currentSettings, faceIdBiometricEnabled: e.target.checked });
                }}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
              />
            </div>

            {/* WhatsApp Login Alerts Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255, 183, 3, 0.15)',
                  border: '1px solid rgba(255, 183, 3, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffb703'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.86rem', color: '#ffffff', display: 'block' }}>
                    Alertas de Login no WhatsApp
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Receba um aviso imediato via WhatsApp quando sua conta for acessada
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={loginAlerts}
                onChange={(e) => {
                  haptics.lightTick();
                  setLoginAlerts(e.target.checked);
                  onUpdateSecuritySettings({ ...currentSettings, loginAlertsWhatsApp: e.target.checked });
                }}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
              />
            </div>

            {/* Verification Checklist */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Checklist de Validação da Identidade:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: user.cpf ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={14} /> CPF Validado (Módulo 11)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: user.whatsapp ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={14} /> WhatsApp Oficial Vinculado
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: (user.facialDescriptor && user.facialDescriptor.length > 0) ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={14} /> Vetor Biométrico Facial (Face ID)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: user.cep ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={14} /> Endereço Residencial Cadastrado
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security PIN */}
        {activeTab === 'pin' && (
          <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Defina um <strong>PIN de 6 dígitos numéricos</strong> para confirmação de saques PIX, compras e recuperação de conta.
            </p>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Novo PIN de 6 Dígitos
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="Ex: 789012"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  letterSpacing: '0.25em',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Confirmar Novo PIN
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="Repita os 6 dígitos"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  letterSpacing: '0.25em',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            {pinError && (
              <div style={{ fontSize: '0.75rem', color: '#ff007a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> {pinError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #00f5d4)',
                color: '#07080c',
                padding: '11px',
                fontWeight: 900,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4
              }}
            >
              <Save size={16} /> Salvar PIN de Segurança
            </button>
          </form>
        )}

        {/* Tab 3: Active Sessions */}
        {activeTab === 'sessions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Dispositivos conectados à sua conta:
              </span>
              <button
                onClick={handleTerminateOtherSessions}
                style={{
                  background: 'rgba(255, 0, 122, 0.12)',
                  border: '1px solid rgba(255, 0, 122, 0.35)',
                  color: '#ff007a',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <LogOut size={12} /> Desconectar Outros
              </button>
            </div>

            {(activeSessions || []).map((sess: any) => (
              <div
                key={sess.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 12,
                  background: sess.isCurrent ? 'rgba(0, 245, 212, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                  border: sess.isCurrent ? '1px solid rgba(0, 245, 212, 0.3)' : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Laptop size={18} color={sess.isCurrent ? 'var(--accent-teal)' : 'var(--text-muted)'} />
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#ffffff', display: 'block' }}>
                      {sess.device} {sess.isCurrent && <span style={{ color: 'var(--accent-teal)', fontSize: '0.7rem' }}>(Este Dispositivo)</span>}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {sess.browser} • {sess.location || sess.city || 'Brasil'} ({sess.ip || sess.ipAddress || '127.0.0.1'})
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', fontWeight: 700 }}>
                  {sess.lastActive}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Audit & Login History */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Registro das últimas autenticações e atividades:
            </span>

            {(currentSettings.loginHistory || []).map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.76rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <History size={14} color="var(--accent-cyan)" />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Login Efetuado</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({item.device})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{item.date}</span>
                  <span style={{
                    color: 'var(--accent-teal)',
                    background: 'rgba(0, 245, 212, 0.1)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '0.66rem',
                    fontWeight: 800
                  }}>
                    AUTORIZADO
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(0, 245, 212, 0.15)',
            border: '1px solid var(--accent-teal)',
            color: 'var(--accent-teal)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Check size={14} /> {successToast}
          </div>
        )}
      </div>
    </div>
  );
};
