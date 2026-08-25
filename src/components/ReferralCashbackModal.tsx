import React, { useState } from 'react';
import { 
  X, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight, 
  DollarSign, 
  Sparkles,
  Zap
} from 'lucide-react';
import { soundFx } from '../services/biometricService';

interface ReferralCashbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const ReferralCashbackModal: React.FC<ReferralCashbackModalProps> = ({
  isOpen,
  onClose,
  userName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [pixKey, setPixKey] = useState<string>('');
  const [isWithdrawn, setIsWithdrawn] = useState<boolean>(false);
  const [accumulatedBalance, setAccumulatedBalance] = useState<number>(14.00);

  if (!isOpen) return null;

  const referralCode = userName.toLowerCase().replace(/\s+/g, '') + '10';
  const referralLink = `https://meflagrou.com/ref/${referralCode}`;

  const handleCopyLink = () => {
    soundFx.playRadarTick();
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    soundFx.playRadarTick();
    const message = encodeURIComponent(
      `📸 Achei nossas fotos em 8K no meflagrou! Usa meu link para achar seu rosto com IA e ganhe 10% de desconto: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleWithdrawPix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey.trim() || accumulatedBalance <= 0) return;
    soundFx.playRadarTick();
    setIsWithdrawn(true);
    setTimeout(() => {
      setAccumulatedBalance(0);
    }, 1500);
  };

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div 
        className="instagram-modal-container referral-cashback-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="referral-modal-header">
          <div className="referral-header-title-wrap">
            <div className="referral-badge-icon">
              <Gift size={20} color="#07080c" />
            </div>
            <div>
              <h3 className="referral-title">Indique Amigos & Ganhe PIX</h3>
              <p className="referral-subtitle">Ganhe R$ 2,00 direto na sua conta para cada amigo que desbloquear um flagra</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="referral-modal-body">
          {/* Card de Saldo Acumulado */}
          <div className="referral-balance-card">
            <div className="balance-info-left">
              <span className="balance-label">Seu Saldo Acumulado</span>
              <div className="balance-amount-row">
                <span className="balance-currency">R$</span>
                <span className="balance-value">{accumulatedBalance.toFixed(2).replace('.', ',')}</span>
                <span className="balance-pill-badge">
                  <Sparkles size={11} />
                  7 Indicações Ativas
                </span>
              </div>
            </div>

            <div className="balance-actions-right">
              {isWithdrawn ? (
                <div className="withdraw-success-chip">
                  <Check size={14} />
                  <span>PIX Solicitado!</span>
                </div>
              ) : (
                <div className="instant-pix-tag">
                  <Zap size={13} color="var(--accent-teal)" />
                  <span>Saque Instantâneo</span>
                </div>
              )}
            </div>
          </div>

          {/* Link de Indicação Pessoal */}
          <div className="referral-link-section">
            <label className="referral-input-label">Seu Link de Convite Único:</label>
            <div className="referral-link-input-row">
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="referral-link-field" 
              />
              <button 
                onClick={handleCopyLink}
                className="btn-secondary copy-link-btn"
                title="Copiar Link"
              >
                {copied ? <Check size={16} color="var(--accent-teal)" /> : <Copy size={16} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Botão de Compartilhar no WhatsApp */}
          <button 
            onClick={handleShareWhatsApp}
            className="referral-whatsapp-share-btn"
          >
            <Share2 size={18} />
            <span>Compartilhar no WhatsApp com os Amigos do Rolê</span>
          </button>

          {/* Formulário de Saque via Chave PIX */}
          <div className="referral-withdraw-box">
            <h4 className="withdraw-box-title">
              <DollarSign size={15} color="var(--accent-teal)" />
              <span>Receber Saldo via Chave PIX</span>
            </h4>
            <form onSubmit={handleWithdrawPix} className="withdraw-form-row">
              <input
                type="text"
                placeholder="Insira seu CPF, E-mail ou Telefone PIX"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                disabled={accumulatedBalance <= 0 || isWithdrawn}
                className="withdraw-pix-input"
                required
              />
              <button
                type="submit"
                disabled={accumulatedBalance <= 0 || isWithdrawn}
                className="btn-primary withdraw-submit-btn"
              >
                <span>Sacar R$ {accumulatedBalance.toFixed(2).replace('.', ',')}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Como Funciona - 3 Passos */}
          <div className="referral-steps-grid">
            <div className="referral-step-item">
              <span className="step-number">1</span>
              <div>
                <strong>Envie o Link</strong>
                <p>Mande no grupo da balada ou festival.</p>
              </div>
            </div>
            <div className="referral-step-item">
              <span className="step-number">2</span>
              <div>
                <strong>Amigo Acha a Foto</strong>
                <p>Ele usa o Face ID com 10% de desconto.</p>
              </div>
            </div>
            <div className="referral-step-item">
              <span className="step-number">3</span>
              <div>
                <strong>PIX na sua Conta</strong>
                <p>Você ganha R$ 2,00 por foto desbloqueada.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
