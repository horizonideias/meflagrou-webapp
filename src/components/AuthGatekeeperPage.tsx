import React, { useState } from 'react';
import { 
  Phone, 
  Lock, 
  User, 
  FileText,
  Mail,
  MapPin,
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle, 
  RefreshCw, 
  Camera, 
  Upload,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../types';
import { enrollNewUserFace, soundFx } from '../services/biometricService';
import { MOCK_USERS } from '../data/mockDatabase';
import { sanitizeInput, formatWhatsAppPhone, isValidCPF } from '../utils/securityUtils';
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
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // --- LOGIN STATES (CELULAR + SENHA) ---
  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- CADASTRO COMPLETO DO PERFIL (NOME, CPF, CELULAR, EMAIL, CEP, SENHA) ---
  const [regName, setRegName] = useState<string>('');
  const [regCpf, setRegCpf] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regCep, setRegCep] = useState<string>('');
  const [regCity, setRegCity] = useState<string>('');
  const [regState, setRegState] = useState<string>('SP');
  const [regPassword, setRegPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regPhoto, setRegPhoto] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSearchingCep, setIsSearchingCep] = useState<boolean>(false);

  // Mask Phone Input ((XX) 9XXXX-XXXX)
  const handlePhoneMask = (value: string, setter: (v: string) => void) => {
    setter(formatWhatsAppPhone(value));
  };

  // Mask CPF input (000.000.000-00)
  const handleCpfMask = (value: string, setter: (v: string) => void) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setter(v);
  };

  // Mask CEP input (00000-000) & Auto-fetch via ViaCEP
  const handleCepMask = async (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);

    if (v.length > 5) {
      v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    setRegCep(v);

    // Auto-search CEP when 8 digits are typed
    const cleanCep = v.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (data && !data.erro) {
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

  // Handle Profile Photo Upload from File
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRegPhoto(event.target?.result as string);
        soundFx.playLandmarkLock();
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 🔑 LOGIN ACTION ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError('Informe seu número de celular com DDD.');
      soundFx.playRadarTick();
      return;
    }

    if (!loginPassword || loginPassword.length < 4) {
      setAuthError('Informe sua senha de acesso.');
      soundFx.playRadarTick();
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

      soundFx.playUnlockSuccess();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#ff007a', '#25d366', '#ffb703'],
      });

      onLoginSuccess(user);
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

    if (!cleanName || cleanName.length < 3) {
      setRegError('Informe seu Nome Completo.');
      soundFx.playRadarTick();
      return;
    }

    if (!cleanCpf || !isValidCPF(regCpf)) {
      setRegError('Informe um CPF válido (Módulo 11).');
      soundFx.playRadarTick();
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('Informe seu Celular com DDD.');
      soundFx.playRadarTick();
      return;
    }

    if (!regEmail || !regEmail.includes('@')) {
      setRegError('Informe um E-mail válido.');
      soundFx.playRadarTick();
      return;
    }

    if (!cleanCep || cleanCep.length < 8) {
      setRegError('Informe seu CEP com 8 dígitos.');
      soundFx.playRadarTick();
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError('Crie uma senha com pelo menos 4 caracteres.');
      soundFx.playRadarTick();
      return;
    }

    setIsLoading(true);
    soundFx.playScanSweep();

    setTimeout(() => {
      setIsLoading(false);
      soundFx.playUnlockSuccess();

      const newUser = enrollNewUserFace({
        name: cleanName,
        cpf: regCpf.trim(),
        whatsapp: regPhone.trim(),
        phone: regPhone.trim(),
        email1: regEmail.trim().toLowerCase(),
        email2: regEmail.trim().toLowerCase(),
        email: regEmail.trim().toLowerCase(),
        cep: regCep.trim(),
        city: regCity.split(',')[0].trim() || 'São Paulo',
        state: regState || 'SP',
        handle: cleanName.toLowerCase().replace(/\s+/g, '_'),
        avatarDataUrl: regPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      });

      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f5d4', '#25d366', '#ff007a', '#ffb703'],
      });

      onRegisterSuccess(newUser);
    }, 650);
  };

  // Quick Demo Login
  const handleQuickDemoLogin = () => {
    const user = allUsers[0] || MOCK_USERS[0];
    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#ff007a', '#ffb703'],
    });
    onLoginSuccess(user);
  };

  return (
    <div className="auth-clean-backdrop">
      <div className="auth-clean-card">
        
        {/* Glow de fundo sutil */}
        <div className="auth-clean-glow" />

        {/* 1. Logo Central Oficial Animada */}
        <div className="auth-clean-header">
          <div className="auth-clean-logo-wrap">
            <MeflagrouLogo height={44} animated={true} />
          </div>
          <p className="auth-clean-subtitle">
            {mode === 'login' 
              ? 'Acesse seus flagrantes exclusivos' 
              : 'Preencha seus dados para criar seu Perfil'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 📱 MODO 1: LOGIN CLEAN (CELULAR + SENHA) */}
        {/* ========================================================================= */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-clean-form">
            {authError && (
              <div className="auth-clean-alert">
                <AlertCircle size={15} />
                <span>{authError}</span>
              </div>
            )}

            {/* Campo Celular */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">Celular</label>
              <div className="auth-clean-input-wrap">
                <Phone size={18} className="auth-clean-icon" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={loginPhone}
                  onChange={(e) => handlePhoneMask(e.target.value, setLoginPhone)}
                  className="auth-clean-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">Senha</label>
              <div className="auth-clean-input-wrap">
                <Lock size={18} className="auth-clean-icon" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Sua senha de acesso"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="auth-clean-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="auth-clean-eye-btn"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-clean-btn-primary"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Alternar para Cadastrar */}
            <div className="auth-clean-switch-row">
              <span>Não tem uma conta?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthError(null);
                  setRegError(null);
                }}
                className="auth-clean-switch-btn"
              >
                Cadastrar Perfil
              </button>
            </div>

            {/* Acesso Rápido Demo (Discreto) */}
            <div className="auth-clean-demo-divider">
              <span>ou</span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="auth-clean-demo-btn"
            >
              <Zap size={14} color="#ffb703" />
              <span>Acesso Rápido Demo</span>
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* 📝 MODO 2: CADASTRO DO PERFIL COMPLETO (NOME, CPF, CELULAR, EMAIL, CEP) */
          /* ========================================================================= */
          <form onSubmit={handleRegisterSubmit} className="auth-clean-form">
            {regError && (
              <div className="auth-clean-alert">
                <AlertCircle size={15} />
                <span>{regError}</span>
              </div>
            )}

            {/* 1. Nome Completo */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">Nome Completo *</label>
              <div className="auth-clean-input-wrap">
                <User size={18} className="auth-clean-icon" />
                <input
                  type="text"
                  placeholder="Seu nome e sobrenome"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="auth-clean-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* 2. CPF (Módulo 11) */}
            <div className="auth-clean-field">
              <div className="auth-clean-label-row">
                <label className="auth-clean-label">CPF *</label>
                {isValidCPF(regCpf) && (
                  <span className="auth-field-valid-badge">
                    <CheckCircle2 size={12} color="#25d366" />
                    Válido
                  </span>
                )}
              </div>
              <div className="auth-clean-input-wrap">
                <FileText size={18} className="auth-clean-icon" />
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={regCpf}
                  onChange={(e) => handleCpfMask(e.target.value, setRegCpf)}
                  className={`auth-clean-input ${isValidCPF(regCpf) ? 'is-valid' : ''}`}
                  required
                />
              </div>
            </div>

            {/* 3. CELULAR */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">Celular (WhatsApp) *</label>
              <div className="auth-clean-input-wrap">
                <Phone size={18} className="auth-clean-icon" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={regPhone}
                  onChange={(e) => handlePhoneMask(e.target.value, setRegPhone)}
                  className="auth-clean-input"
                  required
                />
              </div>
            </div>

            {/* 4. EMAIL */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">E-mail *</label>
              <div className="auth-clean-input-wrap">
                <Mail size={18} className="auth-clean-icon" />
                <input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="auth-clean-input"
                  required
                />
              </div>
            </div>

            {/* 5. CEP */}
            <div className="auth-clean-field">
              <div className="auth-clean-label-row">
                <label className="auth-clean-label">CEP *</label>
                {isSearchingCep && (
                  <span className="auth-cep-loading">
                    <RefreshCw size={11} className="animate-spin" />
                    Buscando CEP...
                  </span>
                )}
                {regCity && !isSearchingCep && (
                  <span className="auth-cep-city-badge">
                    <MapPin size={11} />
                    {regCity}, {regState}
                  </span>
                )}
              </div>
              <div className="auth-clean-input-wrap">
                <MapPin size={18} className="auth-clean-icon" />
                <input
                  type="text"
                  placeholder="00000-000"
                  value={regCep}
                  onChange={(e) => handleCepMask(e.target.value)}
                  className="auth-clean-input"
                  required
                />
              </div>
            </div>

            {/* 6. Senha */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">Criar Senha de Acesso *</label>
              <div className="auth-clean-input-wrap">
                <Lock size={18} className="auth-clean-icon" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Mínimo 4 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="auth-clean-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="auth-clean-eye-btn"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Foto de Perfil / Selfie (Upload & Câmera) */}
            <div className="auth-clean-field">
              <label className="auth-clean-label">Foto de Perfil (Opcional • Face ID)</label>
              {regPhoto ? (
                <div className="auth-clean-photo-card">
                  <img src={regPhoto} alt="Foto de Perfil" className="auth-clean-photo-avatar" />
                  <div className="auth-clean-photo-meta">
                    <span className="auth-clean-photo-ok">
                      <CheckCircle2 size={14} color="#00f5d4" />
                      Foto Carregada com Sucesso
                    </span>
                    <div className="auth-clean-photo-actions">
                      <label className="auth-clean-photo-action-btn">
                        <Upload size={13} />
                        <span>Trocar Foto</span>
                        <input type="file" accept="image/*" onChange={handlePhotoFileUpload} style={{ display: 'none' }} />
                      </label>
                      <button type="button" onClick={() => setRegPhoto(null)} className="auth-clean-photo-action-btn remove">
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="auth-clean-photo-upload-grid">
                  <label className="auth-clean-upload-box">
                    <Upload size={22} color="#00f5d4" />
                    <span className="upload-title">Fazer Upload da Foto</span>
                    <span className="upload-hint">Clique para selecionar da galeria ou PC (JPG, PNG)</span>
                    <input type="file" accept="image/*" onChange={handlePhotoFileUpload} style={{ display: 'none' }} />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setRegPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
                      soundFx.playLandmarkLock();
                    }}
                    className="auth-clean-demo-photo-btn"
                  >
                    <Camera size={14} />
                    <span>Usar Selfie de Teste</span>
                  </button>
                </div>
              )}
            </div>

            {/* Botão Criar Perfil */}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-clean-btn-primary register"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Criando Perfil...</span>
                </>
              ) : (
                <>
                  <span>Criar Perfil & Acessar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Alternar para Login */}
            <div className="auth-clean-switch-row">
              <span>Já possui cadastro?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError(null);
                  setRegError(null);
                }}
                className="auth-clean-switch-btn"
              >
                Entrar com Celular
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
