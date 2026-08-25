import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Clock,
  TrendingUp,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { soundFx } from '../services/biometricService';
import type { UserProfile } from '../types';

interface CheckoutModalProps {
  currentUser: UserProfile | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  currentUser,
}) => {
  const { isCheckoutOpen, closeCheckout, activeCheckoutItems, completePurchase } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'apple_pay'>('pix');
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Credit Card Form
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState<string>('ISABELA ROCHA');
  const [cardExpiry, setCardExpiry] = useState<string>('12/29');
  const [cardCvv, setCardCvv] = useState<string>('888');
  const [installments, setInstallments] = useState<string>('1');

  if (!isCheckoutOpen) return null;

  const totalAmount = activeCheckoutItems.reduce((acc, item) => acc + item.price, 0);
  const nextResaleTotal = totalAmount * 2;
  const pixCode = `00020126580014br.gov.bcb.pix0136meflagrou-${Date.now()}-checkout520400005303986540${totalAmount.toFixed(2)}5802BR5916MEFLAGROU STUDIO6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);

    const buyerUser: UserProfile = currentUser || {
      id: 'buyer_guest',
      name: 'Visitante VIP',
      handle: 'visitante_vip',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Amante de festas e festivais.',
      city: 'São Paulo',
      state: 'SP',
      verifiedAt: 'Hoje',
      facialDescriptor: [],
      faceSignatureId: 'FACE-GUEST',
      totalPhotosCount: 1,
      eventsCount: 1,
      attendedEvents: [],
      topFriends: [],
      socialLinks: {},
      privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true },
    };

    setTimeout(() => {
      completePurchase(paymentMethod, buyerUser);
      setIsProcessing(false);
      setIsSuccess(true);
      soundFx.playUnlockSuccess();

      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#00f5d4', '#00e5ff', '#ff007a', '#ffbe0b'],
      });
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) closeCheckout(); }}>
      <div className="glass-panel" style={{
        maxWidth: 580,
        width: '100%',
        padding: 28,
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.3)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        {!isProcessing && (
          <button onClick={closeCheckout} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
            <X size={18} />
          </button>
        )}

        {isSuccess ? (
          /* Payment Success & 2x Progressive Resale Activation Screen */
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
              margin: '0 auto 14px auto',
              boxShadow: '0 0 30px rgba(0, 245, 212, 0.5)'
            }}>
              <Check size={36} color="var(--accent-teal)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
              Pagamento Confirmado! 🎉
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: 440, margin: '0 auto 16px auto' }}>
              Seus flagras foram liberados em Ultra HD Clean (sem marca d'água) e transferidos para sua galeria.
            </p>

            {/* Progressive 2x Resale Highlight Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.15), rgba(0, 245, 212, 0.15))',
              borderRadius: 16,
              padding: '16px 18px',
              border: '1.5px solid rgba(0, 245, 212, 0.4)',
              marginBottom: 20,
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontWeight: 800, fontSize: '0.92rem', marginBottom: 6 }}>
                <Flame size={18} color="#ff007a" />
                <span>Valorização Automática 2x Ativada!</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>
                A foto foi adicionada à sua galeria e já está disponível para revenda pelo <strong>dobro do valor</strong> no seu perfil.
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.5)',
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: '0.78rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Novo Preço no seu Perfil (2x)</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-teal)', fontSize: '1.1rem' }}>
                    R$ {nextResaleTotal.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Seu Lucro Líquido na Revenda</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
                    + R$ {(nextResaleTotal * 0.85).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            </div>

            {/* Unlocked Items Mini Row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {activeCheckoutItems.map((item) => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <img
                    src={item.photo.thumbnailUrl || item.photo.url}
                    alt={item.photo.eventName}
                    style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--accent-teal)' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    background: 'var(--accent-teal)',
                    color: '#07080c',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 900
                  }}>
                    2x
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                closeCheckout();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.9rem' }}
            >
              <Sparkles size={16} />
              Acessar Minha Galeria & Flagras
            </button>
          </div>
        ) : (
          /* Main Checkout Form */
          <div>
            {/* Header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Lock size={18} color="var(--accent-teal)" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
                  Checkout Seguro meflagrou
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Desbloqueio imediato + transferência de posse para sua galeria.
              </p>
            </div>

            {/* Order Summary & Resale Preview Pill */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 14,
              padding: '12px 16px',
              border: '1px solid var(--border-subtle)',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Total a Pagar ({activeCheckoutItems.length} itens)
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', fontWeight: 700, color: '#ffb703' }}>
                  <TrendingUp size={13} /> Revenda 2x Ativa
                </span>
                <span>Relistada por R$ {nextResaleTotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 8,
              marginBottom: 20
            }}>
              <button
                onClick={() => setPaymentMethod('pix')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 12,
                  background: paymentMethod === 'pix' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: paymentMethod === 'pix' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                  color: paymentMethod === 'pix' ? 'var(--accent-teal)' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <QrCode size={15} />
                PIX
              </button>

              <button
                onClick={() => setPaymentMethod('credit_card')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 12,
                  background: paymentMethod === 'credit_card' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: paymentMethod === 'credit_card' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                  color: paymentMethod === 'credit_card' ? 'var(--accent-teal)' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <CreditCard size={15} />
                Cartão
              </button>

              <button
                onClick={() => setPaymentMethod('apple_pay')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 12,
                  background: paymentMethod === 'apple_pay' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: paymentMethod === 'apple_pay' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                  color: paymentMethod === 'apple_pay' ? 'var(--accent-teal)' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                Apple Pay / GPay
              </button>
            </div>

            {/* TAB 1: PIX Flow */}
            {paymentMethod === 'pix' && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{
                  padding: 14,
                  background: '#ffffff',
                  borderRadius: 16,
                  display: 'inline-block',
                  boxShadow: '0 8px 25px rgba(0, 245, 212, 0.3)'
                }}>
                  <div style={{
                    width: 170,
                    height: 170,
                    background: 'radial-gradient(circle, #07080c 20%, transparent 20%), radial-gradient(circle, #07080c 20%, transparent 20%)',
                    backgroundSize: '16px 16px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: '2px solid #000'
                  }}>
                    <QrCode size={130} color="#07080c" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#ffb703' }}>
                  <Clock size={14} />
                  PIX expira em 14:59 min
                </div>

                <button
                  onClick={handleCopyPix}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.82rem' }}
                >
                  {copiedPix ? <Check size={16} color="var(--accent-teal)" /> : <Copy size={16} />}
                  {copiedPix ? 'Código PIX Copiado com Sucesso!' : 'Copiar Código PIX (Copia e Cola)'}
                </button>

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #00f5d4, #00b4d8)'
                  }}
                >
                  {isProcessing ? 'Verificando Pagamento PIX...' : 'Simular Pagamento Confirmado'}
                </button>
              </div>
            )}

            {/* TAB 2: Credit Card Flow */}
            {paymentMethod === 'credit_card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 10,
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                    Nome Impresso no Cartão
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 10,
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                      Validade (MM/AA)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 10,
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 10,
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-secondary)' }}>
                    Parcelamento
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 10,
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value="1" style={{ background: '#090b10' }}>1x de R$ {totalAmount.toFixed(2).replace('.', ',')} (à vista)</option>
                    <option value="2" style={{ background: '#090b10' }}>2x de R$ {(totalAmount / 2).toFixed(2).replace('.', ',')} sem juros</option>
                    <option value="3" style={{ background: '#090b10' }}>3x de R$ {(totalAmount / 3).toFixed(2).replace('.', ',')} sem juros</option>
                  </select>
                </div>

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                    marginTop: 8
                  }}
                >
                  {isProcessing ? 'Processando Cartão...' : `Pagar R$ ${totalAmount.toFixed(2).replace('.', ',')}`}
                </button>
              </div>
            )}

            {/* TAB 3: Apple Pay / GPay */}
            {paymentMethod === 'apple_pay' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                  Pague com segurança e biometria digital em 1 toque no seu iPhone ou dispositivo Android.
                </p>

                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    background: '#ffffff',
                    color: '#07080c',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 20px rgba(255,255,255,0.3)'
                  }}
                >
                  {isProcessing ? 'Confirmando Biometria...' : ' Pagar com Apple Pay'}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} /> Transação protegida por criptografia SSL 256-bits
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
