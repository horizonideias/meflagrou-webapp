import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Check, 
  Sparkles, 
  ShieldCheck
} from 'lucide-react';
import type { EventPhoto } from '../types';

interface DirectSaleModalProps {
  photo: EventPhoto;
  onClose: () => void;
  onSavePrice: (photoId: string, isForSale: boolean, price: number) => void;
}

export const DirectSaleModal: React.FC<DirectSaleModalProps> = ({
  photo,
  onClose,
  onSavePrice,
}) => {
  const [isForSale, setIsForSale] = useState<boolean>(photo.forSaleByOwner ?? true);
  const [price, setPrice] = useState<number>(photo.ownerPrice ?? 14.90);
  const [customPrice, setCustomPrice] = useState<string>(price.toFixed(2));
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const netEarnings = price * 0.85;

  const handleSelectPreset = (p: number) => {
    setPrice(p);
    setCustomPrice(p.toFixed(2));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrice(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed) && parsed > 0) {
      setPrice(parsed);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePrice(photo.id, isForSale, price);
    setToastMsg(isForSale ? `Foto colocada à venda por R$ ${price.toFixed(2).replace('.', ',')} no seu perfil!` : 'Venda da foto desativada.');
    setTimeout(() => {
      setToastMsg(null);
      onClose();
    }, 1200);
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
        maxWidth: 480,
        width: '100%',
        padding: 24,
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 35px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
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
            <DollarSign size={20} color="var(--accent-teal)" />
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
              Vender Foto no Meu Perfil
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Monetize seus momentos de festas e receba via PIX
            </span>
          </div>
        </div>

        {/* Photo Mini Card */}
        <div style={{
          display: 'flex',
          gap: 12,
          padding: 10,
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 18
        }}>
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.eventName}
            style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 2 }}>
              {photo.eventName}
            </h4>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {photo.eventDate} • {photo.city}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-teal)', marginTop: 2 }}>
              {photo.tags.length} pessoas marcadas
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Sale Status Switch */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                Disponibilizar para Venda
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Visitantes do seu perfil poderão comprar a versão Ultra HD Clean
              </div>
            </div>

            <input
              type="checkbox"
              checked={isForSale}
              onChange={(e) => setIsForSale(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
            />
          </div>

          {isForSale && (
            <>
              {/* Preset Prices */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Defina o Valor da Foto
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {[9.90, 14.90, 19.90, 29.90].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handleSelectPreset(p)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 10,
                        background: price === p ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: price === p ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                        color: price === p ? 'var(--accent-teal)' : '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      R$ {p.toFixed(2).replace('.', ',')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Price Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, color: 'var(--text-secondary)' }}>
                  Ou Digite um Preço Personalizado (R$)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="5.00"
                  max="199.00"
                  value={customPrice}
                  onChange={handleCustomChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 10,
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Earnings Breakdown Box */}
              <div style={{
                background: 'rgba(0, 245, 212, 0.08)',
                borderRadius: 12,
                padding: '12px 14px',
                border: '1px solid rgba(0, 245, 212, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Seu Repasse Líquido por Venda (85%)
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                    R$ {netEarnings.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
                  <div>💸 Pagamento direto via PIX</div>
                  <div>15% taxa da plataforma</div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.88rem', marginTop: 6 }}
          >
            <Sparkles size={16} />
            {isForSale ? 'Salvar e Publicar na Minha Loja' : 'Salvar Alterações'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={12} /> Seus direitos autorais e licença pessoal estão protegidos
          </div>
        </form>
      </div>
    </div>
  );
};
