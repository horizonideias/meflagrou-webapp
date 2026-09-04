import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../types';
import { enrollNewUserFace, soundFx } from '../services/biometricService';
import { MOCK_USERS } from '../data/mockDatabase';
import { 
  sanitizeInput, 
  formatWhatsAppPhone, 
  isValidCPF, 
  isValidRealFullName,
  formatCPF,
  formatCEP 
} from '../utils/securityUtils';
import { AuthSecurityService, type PasswordStrengthResult } from '../services/authSecurityService';
import { haptics } from '../utils/haptics';
import { MeflagrouLogo } from './MeflagrouLogo';

interface AuthGatekeeperPageProps {
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterSuccess: (user: UserProfile) => void;
}

export const AuthGatekeeperPage: React.FC<AuthGatekeeperPageProps> = ({
  allUsers,
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | '2fa'>('login');

  // --- LOGIN STATES ---
  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // --- CADASTRO COMPLETO DO PERFIL ---
  const [regName, setRegName] = useState<string>('');
  const [regCpf, setRegCpf] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regCep, setRegCep] = useState<string>('');
  const [regRua, setRegRua] = useState<string>('');
  const [regNumero, setRegNumero] = useState<string>('');
  const [regBairro, setRegBairro] = useState<string>('');
  const [regCity, setRegCity] = useState<string>('');
  const [regState, setRegState] = useState<string>('SP');
  const [regCivilState, setRegCivilState] = useState<string>('solteiro');
  const [regInstagram, setRegInstagram] = useState<string>('');
  const [regTiktok, setRegTiktok] = useState<string>('');
  const [regX, setRegX] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSearchingCep, setIsSearchingCep] = useState<boolean>(false);

  // --- 2FA OTP CHALLENGE STATES ---
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [isRegisterPending, setIsRegisterPending] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [simulatedOtpReceived, setSimulatedOtpReceived] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(45);

  // Check lockout on mount
  useEffect(() => {
    const lock = AuthSecurityService.isLockedOut();
    if (lock.locked) {
      setLockoutTimer(lock.remainingSeconds);
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    let interval: any;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer(t => {
          if (t <= 1) {
            AuthSecurityService.resetFailedAttempts();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Resend OTP cooldown timer
  useEffect(() => {
    let interval: any;
    if (resendCooldown > 0 && mode === '2fa') {
      interval = setInterval(() => {
        setResendCooldown(c => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown, mode]);

  const passwordStrength: PasswordStrengthResult = AuthSecurityService.evaluatePasswordStrength(regPassword);

  // Mask Phone Input ((XX) 9XXXX-XXXX)
  const handlePhoneMask = (value: string, setter: (v: string) => void) => {
    setter(formatWhatsAppPhone(value));
  };

  // Mask CPF input (000.000.000-00)
  const handleCpfMask = (value: string, setter: (v: string) => void) => {
    setter(formatCPF(value));
  };

  // Mask CEP input (00000-000) & Auto-fetch via ViaCEP
  const handleCepMask = async (value: string) => {
    const masked = formatCEP(value);
    setRegCep(masked);

    const cleanCep = masked.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetch('https://viacep.com.br/ws/' + cleanCep + '/json/');
        const data = await res.json();
        if (data && !data.erro) {
          setRegRua(data.logradouro || '');
          setRegBairro(data.bairro || '');
          setRegCity(data.localidade || '');
          setRegState(data.uf || 'SP');
          soundFx.playLandmarkLock();
        }
      } catch {
        // Silently ignore if offline
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  // Trigger 2FA Challenge
  const trigger2FA = (user: UserProfile, isRegister: boolean) => {
    const challenge = AuthSecurityService.generate2FAChallenge(user.whatsapp || loginPhone);
    setPendingUser(user);
    setIsRegisterPending(isRegister);
    setMode('2fa');
    setOtpCode('');
    setOtpError(null);
    setResendCooldown(45);
    
    // Simulate instant WhatsApp push notification delivery
    setSimulatedOtpReceived(challenge.code);
    soundFx.playLandmarkLock();
    haptics.notification();
  };

  // --- 🔑 LOGIN ACTION ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (lockoutTimer > 0) {
      setAuthError('Conta temporariamente bloqueada por segurança. Aguarde ' + lockoutTimer + 's.');
      haptics.error();
      return;
    }

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError('Informe seu número de celular com DDD.');
      haptics.error();
      return;
    }

    if (!loginPassword || loginPassword.length < 4) {
      setAuthError('Informe sua senha de acesso.');
      haptics.error();
      return;
    }

    setIsLoading(true);
    soundFx.playScanSweep();

    setTimeout(() => {
      setIsLoading(false);
      const usersPool = allUsers && allUsers.length > 0 ? allUsers : MOCK_USERS;
      
      let user = usersPool.find((u) => {
        const uPhone = (u.whatsapp || u.phone || '').replace(/\D/g, '');
        return cleanPhone.length >= 10 && uPhone.includes(cleanPhone.slice(-8));
      });

      if (!user) {
        user = {
          ...MOCK_USERS[0],
          name: 'Usuário VIP',
          whatsapp: loginPhone,
          phone: loginPhone,
        };
      }

      // Step into 2FA verification for high-security login
      trigger2FA(user, false);
    }, 450);
  };

  // --- 📝 CADASTRO COMPLETO DO PERFIL ACTION ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = sanitizeInput(regName);
    const cleanCpf = regCpf.replace(/\D/g, '');
    const cleanPhone = regPhone.replace(/\D/g, '');
    const cleanCep = regCep.replace(/\D/g, '');

    if (!cleanName || !isValidRealFullName(cleanName)) {
      setRegError('Informe seu Nome Verdadeiro completo (pelo menos 2 nomes).');
      haptics.error();
      return;
    }

    if (!cleanCpf || !isValidCPF(regCpf)) {
      setRegError('Informe um CPF válido (Módulo 11 obrigatório).');
      haptics.error();
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('Informe seu Celular/WhatsApp com DDD.');
      haptics.error();
      return;
    }

    if (!regEmail || !regEmail.includes('@')) {
      setRegError('Informe um E-mail válido.');
      haptics.error();
      return;
    }

    if (!cleanCep || cleanCep.length < 8) {
      setRegError('Informe seu CEP com 8 dígitos.');
      haptics.error();
      return;
    }

    if (!regRua || !regNumero || !regBairro) {
      setRegError('Complete seu endereço (Rua, Número e Bairro).');
      haptics.error();
      return;
    }

    if (passwordStrength.score < 2) {
      setRegError('Crie uma senha mais forte com números e letras.');
      haptics.error();
      return;
    }

    setIsLoading(true);
    soundFx.playScanSweep();

    setTimeout(() => {
      setIsLoading(false);

      const registeredUser = enrollNewUserFace({
        name: cleanName,
        cpf: regCpf.trim(),
        whatsapp: regPhone.trim(),
        phone: regPhone.trim(),
        email1: regEmail.trim().toLowerCase(),
        email2: regEmail.trim().toLowerCase(),
        email: regEmail.trim().toLowerCase(),
        cep: regCep.trim(),
        rua: regRua.trim(),
        numero: regNumero.trim(),
        bairro: regBairro.trim(),
        city: regCity.split(',')[0].trim() || 'São Paulo',
        state: regState || 'SP',
        estadoCivil: regCivilState,
        socialLinks: {
          instagram: regInstagram.trim(),
          tiktok: regTiktok.trim(),
          x: regX.trim(),
          twitter: regX.trim()
        },
        handle: cleanName.toLowerCase().replace(/\s+/g, '_'),
        avatarDataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      });

      // Proceed to 2FA phone activation
      trigger2FA(registeredUser, true);
    }, 600);
  };

  // --- 🛡️ VERIFY 2FA OTP ACTION ---
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const res = AuthSecurityService.verify2FACode(otpCode);
    if (!res.success) {
      setOtpError(res.error || 'Código 2FA incorreto.');
      haptics.error();
      return;
    }

    AuthSecurityService.resetFailedAttempts();
    soundFx.playUnlockSuccess();
    haptics.success();

    if (pendingUser) {
      // Store encrypted session token
      const token = AuthSecurityService.createSecureSessionToken(pendingUser.id);
      localStorage.setItem('meflagrou_session_token', token);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#25d366', '#ff007a', '#ffb703'],
      });

      if (isRegisterPending) {
        onRegisterSuccess(pendingUser);
      } else {
        onLoginSuccess(pendingUser);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at 50% 10%, #151926 0%, #080a0f 70%, #030407 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Simulated WhatsApp 2FA Push Banner */}
      {simulatedOtpReceived && mode === '2fa' && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 460,
          background: 'rgba(37, 211, 102, 0.18)',
          border: '1.5px solid #25d366',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(37, 211, 102, 0.35)',
          borderRadius: 16,
          padding: '12px 16px',
          backdropFilter: 'blur(12px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'slideInDown 0.3s ease'
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#25d366',
            color: '#07080c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900
          }}>
            <KeyRound size={20} />
          </div>
          <div style={{ flex: 1, fontSize: '0.78rem' }}>
            <div style={{ fontWeight: 800, color: '#25d366' }}>WhatsApp • Código Meflagrou</div>
            <div style={{ color: '#fff' }}>Seu código de segurança 2FA é: <strong style={{ fontSize: '1rem', letterSpacing: 2 }}>{simulatedOtpReceived}</strong></div>
          </div>
          <button
            onClick={() => setOtpCode(simulatedOtpReceived)}
            style={{
              background: '#25d366',
              border: 'none',
              color: '#07080c',
              padding: '6px 12px',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Preencher
          </button>
        </div>
      )}

      {/* Main Glass Card */}
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: mode === 'register' ? 620 : 440,
          borderRadius: 24,
          background: 'rgba(10, 12, 18, 0.95)',
          border: '1.5px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.95), 0 0 40px rgba(0, 240, 255, 0.2)',
          padding: 24,
          position: 'relative',
          transition: 'max-width 0.3s ease'
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', marginBottom: 8 }}>
            <MeflagrouLogo height={38} animated={true} />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
            Curadoria Fotográfica 8K com Proteção e Autenticação Criptografada
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 🔐 1. TELA 2FA (TWO-FACTOR AUTHENTICATION) */}
        {/* ========================================================================= */}
        {mode === '2fa' && (
          <form onSubmit={handleVerify2FA} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              textAlign: 'center',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: 16,
              padding: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0, 240, 255, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                Verificação em Duas Etapas (2FA)
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                Digite o código de 6 dígitos enviado para seu WhatsApp:
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid var(--accent-cyan)',
                  borderRadius: 14,
                  padding: '12px',
                  color: '#fff',
                  fontSize: '1.6rem',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontWeight: 900,
                  outline: 'none'
                }}
              />
            </div>

            {otpError && (
              <div style={{ fontSize: '0.75rem', color: '#ff0055', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {otpError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #00f5d4)',
                color: '#07080c',
                padding: '12px',
                fontWeight: 900,
                fontSize: '0.88rem'
              }}
            >
              Confirmar e Acessar Conta
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                Voltar ao Login
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={() => pendingUser && trigger2FA(pendingUser, isRegisterPending)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-teal)',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  fontWeight: 700
                }}
              >
                {resendCooldown > 0 ? 'Reenviar em ' + resendCooldown + 's' : 'Reenviar Código'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 🔑 2. MODO LOGIN */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div>
            {/* Mode Switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
              <button
                type="button"
                onClick={() => { haptics.lightTick(); setMode('login'); }}
                style={{
                  padding: '9px',
                  borderRadius: 12,
                  background: 'rgba(0, 240, 255, 0.2)',
                  border: '1.5px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Entrar na Conta
              </button>

              <button
                type="button"
                onClick={() => { haptics.lightTick(); setMode('register'); }}
                style={{
                  padding: '9px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Criar Nova Conta
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Celular / WhatsApp */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  WhatsApp / Celular com DDD
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-8888"
                    value={loginPhone}
                    onChange={e => handlePhoneMask(e.target.value, setLoginPhone)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      padding: '10px 12px 10px 36px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Senha de Acesso
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha secreta"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 12,
                      padding: '10px 36px 10px 36px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(s => !s)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div style={{ fontSize: '0.75rem', color: '#ff0055', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff, #00f5d4)',
                  color: '#07080c',
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6
                }}
              >
                {isLoading ? 'Autenticando...' : (
                  <>
                    <span>Entrar com Segurança 2FA</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 📝 3. MODO CADASTRO COMPLETO */}
        {/* ========================================================================= */}
        {mode === 'register' && (
          <div>
            {/* Mode Switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
              <button
                type="button"
                onClick={() => { haptics.lightTick(); setMode('login'); }}
                style={{
                  padding: '9px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Já tenho conta
              </button>

              <button
                type="button"
                onClick={() => { haptics.lightTick(); setMode('register'); }}
                style={{
                  padding: '9px',
                  borderRadius: 12,
                  background: 'rgba(0, 240, 255, 0.2)',
                  border: '1.5px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cadastro Oficial
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Nome Verdadeiro + CPF */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Nome Verdadeiro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    CPF (Módulo 11) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={regCpf}
                    onChange={e => handleCpfMask(e.target.value, setRegCpf)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Celular/WhatsApp + E-mail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    WhatsApp / Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-8888"
                    value={regPhone}
                    onChange={e => handlePhoneMask(e.target.value, setRegPhone)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    E-mail Principal *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Endereço: CEP + Rua + Número */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    CEP {isSearchingCep && '...'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    value={regCep}
                    onChange={e => handleCepMask(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Rua / Logradouro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Paulista"
                    value={regRua}
                    onChange={e => setRegRua(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Nº *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1000"
                    value={regNumero}
                    onChange={e => setRegNumero(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Bairro + Cidade + Estado Civil */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Bairro *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bairro"
                    value={regBairro}
                    onChange={e => setRegBairro(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cidade"
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Estado Civil
                  </label>
                  <select
                    value={regCivilState}
                    onChange={e => setRegCivilState(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#090b10',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 6px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  >
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              {/* Redes Sociais */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={regInstagram}
                    onChange={e => setRegInstagram(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    TikTok
                  </label>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={regTiktok}
                    onChange={e => setRegTiktok(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    X / Twitter
                  </label>
                  <input
                    type="text"
                    placeholder="@usuario"
                    value={regX}
                    onChange={e => setRegX(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      color: '#fff',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Senha com Medidor de Força */}
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Criar Senha Segura *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '8px 34px 8px 10px',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(s => !s)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {regPassword && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: ((passwordStrength.score + 1) * 20) + '%',
                        background: passwordStrength.color,
                        transition: 'width 0.3s ease, background 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {regError && (
                <div style={{ fontSize: '0.75rem', color: '#ff0055', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
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
                  marginTop: 6
                }}
              >
                {isLoading ? 'Validando...' : (
                  <>
                    <span>Continuar para Ativação 2FA</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
