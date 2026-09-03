import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

import { haptics } from '../utils/haptics';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, openCheckout, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const rawSubtotal = cart.reduce((acc, item) => acc + item.originalPrice, 0);
  const currentTotal = cart.reduce((acc, item) => acc + item.price, 0);
  const isComboActive = cart.length >= 3;
  const comboDiscount = isComboActive ? currentTotal * 0.05 : 0;
  const bundleDiscount = (rawSubtotal - currentTotal) + comboDiscount;
  const finalTotal = Math.max(0, currentTotal - couponDiscount - comboDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const clean = couponCode.trim().toUpperCase();
    if (clean === 'VIP10' || clean === 'MEFLAGROU10' || clean === 'BALADA10' || clean === 'FESTIVAL') {
      const disc = currentTotal * 0.1;
      setCouponDiscount(disc);
      setCouponSuccess('Cupom de 10% OFF aplicado com sucesso! 🎉');
      haptics.success();
    } else if (clean === 'MEFLAGROUVIP') {
      const disc = currentTotal * 0.15;
      setCouponDiscount(disc);
      setCouponSuccess('Cupom VIP Master de 15% OFF aplicado com sucesso! 👑');
      haptics.success();
    } else if (clean === 'FESTIVAL20' || clean === 'MASTER20') {
      const disc = currentTotal * 0.2;
      setCouponDiscount(disc);
      setCouponSuccess('Super Cupom de 20% OFF aplicado com sucesso! 🔥');
      haptics.success();
    } else {
      setCouponError('Cupom inválido. Tente: MEFLAGROUVIP, BALADA10 ou FESTIVAL20');
      haptics.error();
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeCart(); }}>
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 440,
        background: '#090b10',
        borderLeft: '1px solid var(--border-glass)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.9)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: 24,
        animation: 'slideInRight 0.25s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(0, 245, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--accent-teal)'
            }}>
              <ShoppingBag size={20} color="var(--accent-teal)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                Carrinho de Flagras
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </div>
          </div>

          <button onClick={closeCart} className="btn-icon" style={{ width: 34, height: 34 }}>
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        {cart.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            padding: 20
          }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>
              Seu carrinho está vazio
            </h3>
            <p style={{ fontSize: '0.8rem', maxWidth: 260 }}>
              Navegue pelas suas fotos de eventos e adicione seus flagras favoritos em Ultra HD.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <img
                  src={item.photo.thumbnailUrl || item.photo.url}
                  alt={item.photo.eventName}
                  style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 2 }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', marginBottom: 4 }}>
                    {item.photo.eventName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    📸 {item.photographerName}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                      R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                    alignSelf: 'flex-start'
                  }}
                  title="Remover do carrinho"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              onClick={clearCart}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textAlign: 'right',
                marginTop: 4
              }}
            >
              Esvaziar carrinho
            </button>
          </div>
        )}

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 12 }}>
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Tag size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Cupom (ex: VIP10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 10,
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.78rem' }}
              >
                Aplicar
              </button>
            </form>

            {couponSuccess && (
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={12} /> {couponSuccess}
              </div>
            )}
            {couponError && (
              <div style={{ fontSize: '0.72rem', color: '#ff007a', marginBottom: 8 }}>
                {couponError}
              </div>
            )}

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>R$ {rawSubtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-teal)' }}>
                <span>Desconto de Pacote</span>
                <span>- R$ {bundleDiscount.toFixed(2).replace('.', ',')}</span>
              </div>
              {isComboActive && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffb703', fontWeight: 700, fontSize: '0.74rem' }}>
                  <span>🔥 Combo 3+ Flagras</span>
                  <span>BÔNUS ATIVO</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
                  <span>Cupom Promocional</span>
                  <span>- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#ffffff',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 8,
                marginTop: 4
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-teal)' }}>
                  R$ {finalTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => openCheckout()}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.92rem',
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                boxShadow: '0 4px 20px rgba(0, 245, 212, 0.4)'
              }}
            >
              <span>Finalizar Compra via PIX / Cartão</span>
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={12} /> Pagamento Criptografado & Desbloqueio Instantâneo
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
