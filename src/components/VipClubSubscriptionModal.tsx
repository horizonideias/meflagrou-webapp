import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  CreditCard, 
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import type { UserProfile } from '../types';

interface VipClubSubscriptionModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubscribed: (tierName: string) => void;
}

interface TierConfig {
  name: string;
  badge: string;
  color: string;
  gradient: string;
  popular?: boolean;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

export const VipClubSubscriptionModal: React.FC<VipClubSubscriptionModalProps> = ({
  currentUser,
  onClose,
  onSubscribed,
}) => {
  const [selectedTier, setSelectedTier] = useState<'silver' | 'gold' | 'diamond'>('gold');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const TIERS: Record<'silver' | 'gold' | 'diamond', TierConfig> = {
    silver: {
      name: 'VIP Silver Pass',
      badge: '🥈 VIP Silver',
      color: '#cbd5e1',
      gradient: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
      popular: false,
      priceMonthly: 29.90,
      priceYearly: 299.00,
      features: [
        '5 Downloads Ultra HD sem marca d’água / mês',
        'Notificação instantânea no WhatsApp de novos flagras',
        'Selo Silver exclusivo no perfil meflagrou',
        'Acesso antecipado aos álbuns de balada'
      ]
    },
    gold: {
      name: 'Passaporte Balada Gold',
      badge: '👑 VIP Gold Passaporte',
      color: '#ffb703',
      gradient: 'linear-gradient(135deg, #ffb703, #fb8500)',
      popular: true,
      priceMonthly: 49.90,
      priceYearly: 499.00,
      features: [
        'Downloads ILIMITADOS de todas as suas fotos em qualquer festa',
        'Prioridade máxima no Hall da Fama VIP do Brasil',
        '10% de Cashback em revendas 2x na plataforma',
        'Acesso VIP ao estúdio de retoque com IA (Glow Up Pro)',
        'Selo Dourado VIP Diamond no avatar e stories'
      ]
    },
    diamond: {
      name: 'Black Diamond Club',
      badge: '💎 Black Diamond VIP',
      color: '#00f5d4',
      gradient: 'linear-gradient(135deg, #00f5d4, #7928ca)',
      popular: false,
      priceMonthly: 99.90,
      priceYearly: 990.00,
      features: [
        'Tudo do Plano Gold + Downloads ilimitados em 8K RAW',
        'Entrada em listas VIP e descontos em camarotes parceiros',
        'Vaga garantida na Batalha de Flagras da Noite',
        'Suporte Concierge 24h via WhatsApp',
        'Repasse VIP de 95% nas suas revendas 2x'
      ]
    }
  };

  const currentPlan = TIERS[selectedTier];
  const price = billingPeriod === 'monthly' ? currentPlan.priceMonthly : currentPlan.priceYearly;

  const handleSubscribe = () => {
    setIsProcessing(true);
    soundFx.playRadarTick();

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      soundFx.playUnlockSuccess();

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffb703', '#00f5d4', '#ff007a', '#ffffff']
      });

      setTimeout(() => {
        onSubscribed(currentPlan.badge);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid rgba(255, 183, 3, 0.4)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 183, 3, 0.2)',
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

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffb703, #fb8500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px rgba(255, 183, 3, 0.6)'
            }}>
              <Crown size={40} color="#07080c" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
              Assinatura VIP Ativada!
            </h2>
            <p style={{ color: 'var(--accent-teal)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>
              Bem-vindo ao {currentPlan.name} • {currentUser?.name || 'Membro VIP'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 460, margin: '0 auto' }}>
              Todos os seus flagras agora possuem download ilimitado sem marcas d'água e seu perfil já está destacado no Hall da Fama.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 183, 3, 0.15)',
                border: '1px solid #ffb703',
                padding: '4px 14px',
                borderRadius: 20,
                color: '#ffb703',
                fontSize: '0.76rem',
                fontWeight: 800,
                marginBottom: 8
              }}>
                <Crown size={14} />
                CLUBE EXCLUSIVO DE FLAGRAS MEFLAGROU
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                Passaporte Balada VIP
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '4px auto 0 auto' }}>
                Nunca mais compre fotos avulsas. Tenha acesso ilimitado a todos os seus cliques em qualquer balada ou festival do Brasil.
              </p>

              {/* Billing Toggle (Monthly vs Yearly) */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 20,
                padding: 3,
                marginTop: 14,
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  style={{
                    background: billingPeriod === 'monthly' ? '#ffb703' : 'transparent',
                    color: billingPeriod === 'monthly' ? '#07080c' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 16,
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  style={{
                    background: billingPeriod === 'yearly' ? '#ffb703' : 'transparent',
                    color: billingPeriod === 'yearly' ? '#07080c' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 16,
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Anual</span>
                  <span style={{ fontSize: '0.62rem', background: '#07080c', color: '#ffb703', padding: '1px 5px', borderRadius: 8, fontWeight: 900 }}>
                    2 MESES GRÁTIS
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Tiers Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {(Object.keys(TIERS) as Array<'silver' | 'gold' | 'diamond'>).map((key) => {
                const tier = TIERS[key];
                const isSelected = selectedTier === key;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    style={{
                      background: isSelected ? 'rgba(255, 183, 3, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? `2px solid ${tier.color}` : '1px solid var(--border-subtle)',
                      borderRadius: 18,
                      padding: 16,
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${tier.color}33` : 'none'
                    }}
                  >
                    {tier.popular && (
                      <div style={{
                        position: 'absolute',
                        top: -10,
                        right: 12,
                        background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                        color: '#07080c',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: 10,
                        boxShadow: '0 2px 8px rgba(255, 183, 3, 0.5)'
                      }}>
                        MAIS ESCOLHIDO
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: tier.color, marginBottom: 4 }}>
                        {tier.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>R$</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
                          {(billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly).toFixed(2).replace('.', ',')}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {tier.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.72rem', color: '#cbd5e1' }}>
                            <Check size={13} color={tier.color} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTier(key);
                      }}
                      style={{
                        marginTop: 14,
                        width: '100%',
                        background: isSelected ? tier.gradient : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#07080c' : '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        padding: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? 'Plano Selecionado' : 'Escolher Este'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector & CTA */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 16,
              padding: 16,
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Método de Pagamento</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    style={{
                      background: paymentMethod === 'pix' ? 'rgba(0, 245, 212, 0.15)' : 'transparent',
                      border: paymentMethod === 'pix' ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                      color: paymentMethod === 'pix' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      borderRadius: 10,
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <QrCode size={13} /> PIX Instantâneo
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    style={{
                      background: paymentMethod === 'credit_card' ? 'rgba(0, 245, 212, 0.15)' : 'transparent',
                      border: paymentMethod === 'credit_card' ? '1px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                      color: paymentMethod === 'credit_card' ? 'var(--accent-teal)' : 'var(--text-secondary)',
                      borderRadius: 10,
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <CreditCard size={13} /> Cartão de Crédito
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #ffb703, #fb8500)',
                  color: '#07080c',
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  boxShadow: '0 0 25px rgba(255, 183, 3, 0.4)'
                }}
              >
                <Sparkles size={16} />
                {isProcessing ? 'Processando Assinatura...' : `Assinar ${currentPlan.name} • R$ ${price.toFixed(2).replace('.', ',')}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
