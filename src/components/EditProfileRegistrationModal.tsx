import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Phone, 
  Check, 
  AlertCircle, 
  Search, 
  Save, 
  Home
} from 'lucide-react';
import type { UserProfile } from '../types';
import { InstagramIcon, TikTokIcon, XIcon } from './Icons';
import { 
  isValidCPF, 
  formatCPF, 
  formatWhatsAppPhone, 
  isValidPhone, 
  isValidRealFullName, 
  formatCEP, 
  sanitizeInput 
} from '../utils/securityUtils';

interface EditProfileRegistrationModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const MARITAL_STATUS_OPTIONS = [
  'Solteiro(a)',
  'Casado(a)',
  'União Estável',
  'Divorciado(a)',
  'Viúvo(a)',
  'Separado(a)'
];

export const EditProfileRegistrationModal: React.FC<EditProfileRegistrationModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>(user.name || '');
  const [cpf, setCpf] = useState<string>(formatCPF(user.cpf || ''));
  const [cep, setCep] = useState<string>(formatCEP(user.cep || ''));
  const [street, setStreet] = useState<string>(user.street || '');
  const [number, setNumber] = useState<string>(user.number || '');
  const [neighborhood, setNeighborhood] = useState<string>(user.neighborhood || '');
  const [city, setCity] = useState<string>(user.city || 'São Paulo');
  const [state, setState] = useState<string>(user.state || 'SP');
  const [whatsapp, setWhatsapp] = useState<string>(formatWhatsAppPhone(user.whatsapp || user.phone || ''));
  const [instagram, setInstagram] = useState<string>(user.socialLinks?.instagram || user.handle || '');
  const [tiktok, setTiktok] = useState<string>(user.socialLinks?.tiktok || '');
  const [xSocial, setXSocial] = useState<string>(user.socialLinks?.x || user.socialLinks?.twitter || '');
  const [maritalStatus, setMaritalStatus] = useState<string>(user.maritalStatus || 'Solteiro(a)');
  const [bio, setBio] = useState<string>(user.bio || '');

  // UI States
  const [isSearchingCep, setIsSearchingCep] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real-time validations
  const isNameValid = isValidRealFullName(name);
  const isCpfValid = isValidCPF(cpf);

  // Auto-fill address via ViaCEP API
  const handleLookupCep = async (cleanCepValue?: string) => {
    const rawDigits = (cleanCepValue || cep).replace(/\D/g, '');
    if (rawDigits.length !== 8) {
      setErrorMessage('Informe um CEP com 8 dígitos para autocompletar.');
      return;
    }

    setIsSearchingCep(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${rawDigits}/json/`);
      const data = await response.json();
      if (data && !data.erro) {
        if (data.logradouro) setStreet(data.logradouro);
        if (data.bairro) setNeighborhood(data.bairro);
        if (data.localidade) setCity(data.localidade);
        if (data.uf && BRAZILIAN_STATES.includes(data.uf)) setState(data.uf);
      } else {
        setErrorMessage('CEP não encontrado. Preencha os campos de endereço manualmente.');
      }
    } catch {
      setErrorMessage('Não foi possível consultar o CEP no momento.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      handleLookupCep(digits);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsAppPhone(e.target.value);
    setWhatsapp(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validar Nome Verdadeiro
    if (!isValidRealFullName(name)) {
      setErrorMessage('Por favor, informe seu Nome Completo Verdadeiro (Nome e Sobrenome oficial).');
      return;
    }

    // 2. Validar CPF
    if (!isValidCPF(cpf)) {
      setErrorMessage('O CPF informado é inválido. Verifique os dígitos digitados.');
      return;
    }

    // 3. Validar WhatsApp se preenchido
    if (whatsapp && !isValidPhone(whatsapp)) {
      setErrorMessage('WhatsApp inválido. Informe DDD + 9 dígitos (ex: (11) 98888-7777).');
      return;
    }

    // 4. Validar Cidade e Estado
    if (!city.trim() || !state.trim()) {
      setErrorMessage('Cidade e Estado são obrigatórios no cadastro.');
      return;
    }

    const cleanInstagram = instagram.replace(/^@/, '').trim();
    const cleanTiktok = tiktok.replace(/^@/, '').trim();
    const cleanX = xSocial.replace(/^@/, '').trim();

    // Format combined address string
    const addressFormatted = [
      street.trim(),
      number.trim() ? `nº ${number.trim()}` : '',
      neighborhood.trim(),
      city.trim() ? `${city.trim()} - ${state}` : '',
      cep.trim() ? `CEP: ${cep.trim()}` : ''
    ].filter(Boolean).join(', ');

    const updatedUser: UserProfile = {
      ...user,
      name: sanitizeInput(name),
      cpf: cpf.replace(/\D/g, '').length === 11 ? formatCPF(cpf) : user.cpf,
      cep: cep.trim(),
      street: sanitizeInput(street),
      number: sanitizeInput(number),
      neighborhood: sanitizeInput(neighborhood),
      city: sanitizeInput(city),
      state: state.toUpperCase(),
      address: addressFormatted || user.address,
      whatsapp: formatWhatsAppPhone(whatsapp) || user.whatsapp,
      phone: formatWhatsAppPhone(whatsapp) || user.phone,
      maritalStatus: maritalStatus,
      bio: sanitizeInput(bio) || user.bio,
      socialLinks: {
        ...user.socialLinks,
        instagram: cleanInstagram || user.socialLinks?.instagram,
        tiktok: cleanTiktok || user.socialLinks?.tiktok,
        x: cleanX || user.socialLinks?.x || user.socialLinks?.twitter,
        twitter: cleanX || user.socialLinks?.twitter,
      }
    };

    onSave(updatedUser);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="modal-content-card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #0e121e 0%, #080a10 100%)',
          borderRadius: 20,
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 240, 255, 0.1)',
          color: '#fff',
          padding: '24px 28px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            color: '#aaa',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div 
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 122, 0.2))',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
              Cadastro & Dados Pessoais
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0' }}>
              Atualize seus dados oficiais para validação biométrica e vendas no meflagrou.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div 
            style={{
              background: 'rgba(255, 0, 68, 0.15)',
              border: '1px solid rgba(255, 0, 68, 0.4)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
              color: '#ff4d6d',
              fontSize: '0.85rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div 
            style={{
              background: 'rgba(0, 255, 178, 0.2)',
              border: '1px solid rgba(0, 255, 178, 0.5)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
              color: 'var(--accent-teal)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            <Check size={20} />
            <span>Cadastro atualizado e salvo com sucesso!</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Section 1: Identificação Obrigatória */}
          <div style={{ marginBottom: 22 }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} />
              <span>1. Identificação Oficial (Dados Reais)</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Nome Verdadeiro */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  Nome Completo Verdadeiro <span style={{ color: '#ff007a' }}>* (Obrigatório)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Eder de Andrade Pereira"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${name ? (isNameValid ? 'rgba(0, 255, 178, 0.4)' : 'rgba(255, 0, 68, 0.4)') : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: 10,
                      padding: '11px 14px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {name && (
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: isNameValid ? 'var(--accent-teal)' : '#ff4d6d' }}>
                      {isNameValid ? '✅ Nome Válido' : '⚠️ Informe nome e sobrenome'}
                    </span>
                  )}
                </div>
              </div>

              {/* CPF */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  CPF <span style={{ color: '#ff007a' }}>* (Validado Módulo 11)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cpf}
                    onChange={handleCpfChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${cpf ? (isCpfValid ? 'rgba(0, 255, 178, 0.4)' : 'rgba(255, 0, 68, 0.4)') : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: 10,
                      padding: '11px 14px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {cpf && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: isCpfValid ? 'var(--accent-teal)' : '#ff4d6d' }}>
                      {isCpfValid ? '✅ Válido' : '❌ Inválido'}
                    </span>
                  )}
                </div>
              </div>

              {/* Estado Civil */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  Estado Civil <span style={{ color: 'rgba(255,255,255,0.5)' }}>*</span>
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#151928',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {MARITAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Endereço Residencial */}
          <div style={{ marginBottom: 22 }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-teal)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Home size={14} />
              <span>2. Endereço Completo</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10, marginBottom: 10 }}>
              {/* CEP */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  CEP
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 10,
                      padding: '11px 14px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Botão Buscar CEP */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => handleLookupCep()}
                  disabled={isSearchingCep}
                  style={{
                    height: 44,
                    padding: '0 16px',
                    background: 'rgba(0, 240, 255, 0.12)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: 10,
                    color: 'var(--accent-cyan)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Search size={14} />
                  <span>{isSearchingCep ? 'Buscando...' : 'Autocompletar CEP'}</span>
                </button>
              </div>
            </div>

            {/* Rua e Número */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  Rua / Logradouro
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Av. Paulista, Rua das Flores"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  Nº
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Bairro, Cidade e Estado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  Bairro
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Jardins, Centro"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  Cidade
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  UF
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#151928',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: WhatsApp & Redes Sociais */}
          <div style={{ marginBottom: 22 }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ff007a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} />
              <span>3. WhatsApp & Redes Sociais</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
              {/* WhatsApp */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  WhatsApp com DDD
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  placeholder="(11) 98888-7777"
                  maxLength={15}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Instagram */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  <InstagramIcon size={13} color="var(--accent-cyan)" />
                  <span>Instagram</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                    placeholder="usuario"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 10,
                      padding: '11px 14px 11px 28px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* TikTok */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  <TikTokIcon size={13} color="#ff007a" />
                  <span>TikTok</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>@</span>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value.replace(/^@/, ''))}
                    placeholder="usuario"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 10,
                      padding: '11px 14px 11px 28px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* X (Twitter) */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                  <XIcon size={12} color="#fff" />
                  <span>X (antigo Twitter)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>@</span>
                  <input
                    type="text"
                    value={xSocial}
                    onChange={(e) => setXSocial(e.target.value.replace(/^@/, ''))}
                    placeholder="usuario"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 10,
                      padding: '11px 14px 11px 28px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Bio / Mensagem VIP */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
              Bio / Descrição do Perfil
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Ex: Apaixonado por música eletrônica, festivais e fotos 8K."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 12,
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #ff007a 100%)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(0, 240, 255, 0.3)'
              }}
            >
              <Save size={16} />
              <span>Salvar Dados Oficiais</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
