import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  ArrowUpRight, 
  UploadCloud, 
  TrendingUp, 
  Check, 
  Sparkles, 
  Clock,
  Flame,
  Layers,
  Crown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { calculateCommissionCascade } from '../types';
import { MOCK_EVENTS } from '../data/mockDatabase';

export const PhotographerSalesDashboard: React.FC = () => {
  const { 
    isSellerDashboardOpen, 
    closeSellerDashboard, 
    sellerProfile, 
    requestSellerWithdraw, 
    updatePixKey 
  } = useCart();

  const [activeTab, setActiveTab] = useState<'overview' | 'cascade' | 'upload' | 'payout'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState<string>(sellerProfile.availableBalance.toFixed(2));
  const [pixInput, setPixInput] = useState<string>(sellerProfile.pixKey);
  const [pixType, setPixType] = useState<'cpf' | 'email' | 'telefone' | 'aleatoria'>(sellerProfile.pixKeyType);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Simulation state for cascade
  const [simulationPrice, setSimulationPrice] = useState<number>(59.60);

  // Upload Album state
  const [albumEventId, setAlbumEventId] = useState<string>(MOCK_EVENTS[0].id);
  const [pricePerPhoto, setPricePerPhoto] = useState<number>(14.90);
  const [selectedFileCount, setSelectedFileCount] = useState<number>(0);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  if (!isSellerDashboardOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Digite um valor válido para saque.');
      return;
    }

    const success = requestSellerWithdraw(amt, pixInput);
    if (success) {
      updatePixKey(pixInput, pixType);
      showToast(`Saque PIX de R$ ${amt.toFixed(2).replace('.', ',')} solicitado com sucesso! O valor será depositado na sua conta.`);
      setActiveTab('overview');
    } else {
      showToast('Saldo insuficiente para o valor solicitado.');
    }
  };

  const handlePublishAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFileCount === 0) {
      showToast('Selecione pelo menos 1 foto para colocar à venda.');
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      showToast(`Álbum publicado com sucesso! A IA indexou os rostos e os frequentadores da festa já podem comprar suas fotos a R$ ${pricePerPhoto.toFixed(2).replace('.', ',')}.`);
      setSelectedFileCount(0);
      setActiveTab('overview');
    }, 1800);
  };

  const simSplit = calculateCommissionCascade(simulationPrice);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeSellerDashboard(); }}>
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50)',
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
        maxWidth: 880,
        width: '100%',
        padding: 24,
        position: 'relative',
        maxHeight: '92vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        <button onClick={closeSellerDashboard} className="btn-icon" style={{ position: 'absolute', top: 16, right: 16 }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
          }}>
            <DollarSign size={24} color="#07080c" />
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>
              Painel de Vendas & Monetização
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Comissões, repasses em cascata, vendas diretas e saques instantâneos via PIX
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mobile-scroll-row" style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          overflowX: 'auto',
          width: '100%'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: activeTab === 'overview' ? 'var(--accent-teal)' : 'transparent',
              color: activeTab === 'overview' ? '#07080c' : '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('cascade')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: activeTab === 'cascade' ? 'linear-gradient(135deg, #ff007a, #7928ca)' : 'transparent',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Layers size={13} />
            Cascata de Repasses
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: activeTab === 'upload' ? 'var(--accent-teal)' : 'transparent',
              color: activeTab === 'upload' ? '#07080c' : '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            + Vender Fotos
          </button>

          <button
            onClick={() => setActiveTab('payout')}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              background: activeTab === 'payout' ? 'var(--accent-teal)' : 'transparent',
              color: activeTab === 'payout' ? '#07080c' : '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Resgates PIX
          </button>
        </div>

        {/* TAB 1: OVERVIEW & SALES METRICS */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              <div style={{
                background: 'rgba(0, 245, 212, 0.08)',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: 14,
                padding: 14
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Saldo Disponível</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: 4 }}>
                  R$ {sellerProfile.availableBalance.toFixed(2).replace('.', ',')}
                </div>
                <button
                  onClick={() => setActiveTab('payout')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-teal)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    marginTop: 6
                  }}
                >
                  Sacar PIX <ArrowUpRight size={12} />
                </button>
              </div>

              <div style={{
                background: 'rgba(255, 0, 122, 0.08)',
                border: '1px solid rgba(255, 0, 122, 0.3)',
                borderRadius: 14,
                padding: 14
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Royalties Passivos</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#ff007a', marginTop: 4 }}>
                  R$ {sellerProfile.passiveRoyaltyEarnings.toFixed(2).replace('.', ',')}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  15% por revenda 2x
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: 14
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Faturamento Total</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  R$ {sellerProfile.totalEarnings.toFixed(2).replace('.', ',')}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', marginTop: 6 }}>
                  Vendas + Cascata
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: 14
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Flagras Vendidos</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-magenta)', marginTop: 4 }}>
                  {sellerProfile.totalPhotosSold} fotos
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Cadeia de revenda ativa
                </div>
              </div>
            </div>

            {/* Sales & Royalties Feed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color="var(--accent-teal)" />
                  Extrato Detalhado de Vendas e Royalties
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Notificações instantâneas
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sellerProfile.salesHistory.map((sale: any) => (
                  <div
                    key={sale.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 14,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={sale.photoThumbnail}
                        alt="Venda"
                        style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{sale.buyerName}</span>
                          {sale.type === 'creator_royalty' && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(255, 0, 122, 0.2)', color: '#ff007a', padding: '2px 6px', borderRadius: 8, fontWeight: 800 }}>
                              Royalty 15%
                            </span>
                          )}
                          {sale.type === 'lineage_bonus' && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(0, 245, 212, 0.2)', color: 'var(--accent-teal)', padding: '2px 6px', borderRadius: 8, fontWeight: 800 }}>
                              Linhagem 10%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          📍 {sale.eventName} • <Clock size={11} style={{ display: 'inline' }} /> {sale.date}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: sale.type === 'creator_royalty' ? '#ff007a' : 'var(--accent-teal)', fontSize: '0.95rem' }}>
                        + R$ {sale.netAmount.toFixed(2).replace('.', ',')}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Bruto: R$ {sale.amount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CASCADE COMMISSION STRUCTURE & SIMULATOR */}
        {activeTab === 'cascade' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Explanatory Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.12), rgba(0, 245, 212, 0.12))',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              borderRadius: 16,
              padding: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Flame size={20} color="#ff007a" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Arquitetura de Repasses em Cascata & Royalties Perpétuos
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                A cada venda ou revenda 2x de uma foto na plataforma, o valor total é redistribuído automaticamente entre 5 níveis participantes.
              </p>
            </div>

            {/* Interactive Live Simulator */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              padding: 18
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Simulador de Repasse por Foto</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Ajuste o valor para ver a distribuição exata em cada nível</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 700 }}>Valor da Foto:</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[14.90, 29.80, 59.60, 119.20].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSimulationPrice(val)}
                        style={{
                          background: simulationPrice === val ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.05)',
                          color: simulationPrice === val ? '#07080c' : '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        R$ {val.toFixed(2).replace('.', ',')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5-Level Cascade Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Level 1 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0, 245, 212, 0.08)',
                  border: '1px solid rgba(0, 245, 212, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-teal)', color: '#07080c', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Vendedor Atual / Proprietário Imediato</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Usuário que colocou a foto para revenda no perfil</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 900, color: 'var(--accent-teal)', fontSize: '1.05rem' }}>
                      R$ {simSplit.sellerAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-teal)', fontWeight: 700 }}>60% do total</div>
                  </div>
                </div>

                {/* Level 2 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 0, 122, 0.08)',
                  border: '1px solid rgba(255, 0, 122, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ff007a', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Fotógrafo Criador (Royalty Perpétuo de Autor)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Quem capturou o flagra original recebe para sempre em cada revenda</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 900, color: '#ff007a', fontSize: '1.05rem' }}>
                      R$ {simSplit.creatorRoyaltyAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#ff007a', fontWeight: 700 }}>15% do total</div>
                  </div>
                </div>

                {/* Level 3 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(121, 40, 202, 0.08)',
                  border: '1px solid rgba(121, 40, 202, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7928ca', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>
                      3
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Donos Anteriores (Bônus de Linhagem)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ancestrais da foto que participaram da cadeia de valorização 2x</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 900, color: '#7928ca', fontSize: '1.05rem' }}>
                      R$ {simSplit.lineageAncestorsAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#7928ca', fontWeight: 700 }}>10% do total</div>
                  </div>
                </div>

                {/* Level 4 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 183, 3, 0.08)',
                  border: '1px solid rgba(255, 183, 3, 0.3)',
                  padding: '12px 16px',
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ffb703', color: '#07080c', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>
                      4
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Indicação / Afiliado meflagrou</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Usuário que convidou o comprador através do link social</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 900, color: '#ffb703', fontSize: '1.05rem' }}>
                      R$ {simSplit.affiliateReferralAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#ffb703', fontWeight: 700 }}>5% do total</div>
                  </div>
                </div>

                {/* Level 5 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px 16px',
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#334155', color: '#ffffff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>
                      5
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Taxa meflagrou.com (Plataforma)</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>IA de Reconhecimento Facial, Armazenamento RAW e Gateway PIX</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      R$ {simSplit.platformFeeAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>10% do total</div>
                  </div>
                </div>
                {/* Master Hub Breakdown Card (90% / 9% / 1%) */}
                <div style={{
                  background: 'rgba(255, 183, 3, 0.05)',
                  border: '1px solid rgba(255, 183, 3, 0.3)',
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Crown size={16} color="#ffb703" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      Regra Master de Curadoria Oficial Meflagrou (R$ 999,99)
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 14 }}>
                    Todas as fotos postadas no site são automaticamente catalogadas no <strong>Perfil Oficial Master</strong> com valor padrão de <strong>R$ 999,99</strong> e a seguinte divisão de repasse:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>90% Autor/Fotógrafo</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-teal)', marginTop: 4 }}>
                        R$ 899,99
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Quem postou</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255, 183, 3, 0.4)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#ffb703', fontWeight: 700 }}>9% Conta Master</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#ffb703', marginTop: 4 }}>
                        R$ 89,99
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Royalty Master</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>1% Plataforma</span>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                        R$ 10,00
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Infraestrutura & PIX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD PHOTOS & SET PRICE */}
        {activeTab === 'upload' && (
          <form onSubmit={handlePublishAlbum} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Selecione o Evento / Balada onde as fotos foram tiradas:
              </label>
              <select
                value={albumEventId}
                onChange={(e) => setAlbumEventId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                {MOCK_EVENTS.map((evt) => (
                  <option key={evt.id} value={evt.id} style={{ background: '#090b10' }}>
                    {evt.name} — {evt.city} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Preço por Foto Individual Ultra HD (R$):
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[9.90, 14.90, 19.90, 29.90].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPricePerPhoto(preset)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 12,
                      background: pricePerPhoto === preset ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: pricePerPhoto === preset ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                      color: pricePerPhoto === preset ? 'var(--accent-teal)' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    R$ {preset.toFixed(2).replace('.', ',')}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone mockup */}
            <div
              onClick={() => setSelectedFileCount((c) => (c === 0 ? 12 : 0))}
              style={{
                border: '2px dashed rgba(0, 245, 212, 0.4)',
                borderRadius: 16,
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: selectedFileCount > 0 ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              <UploadCloud size={40} color="var(--accent-teal)" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                {selectedFileCount > 0 ? `${selectedFileCount} fotos selecionadas do seu cartão SD / Câmera` : 'Arraste as fotos originais ou clique para selecionar'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Suporta RAW, JPEG e PNG em resolução total até 50 MP
              </div>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #00f5d4, #00b4d8)' }}
            >
              <Sparkles size={16} />
              {isPublishing ? 'Indexando Rostos por IA...' : 'Publicar e Iniciar Vendas'}
            </button>
          </form>
        )}

        {/* TAB 4: PAYOUT VIA PIX */}
        {activeTab === 'payout' && (
          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgba(0, 245, 212, 0.08)',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disponível para Resgate Imediato</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                  R$ {sellerProfile.availableBalance.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmount(sellerProfile.availableBalance.toFixed(2))}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                Sacar Tudo
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Valor do Saque (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Tipo de Chave PIX:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                {(['cpf', 'email', 'telefone', 'aleatoria'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPixType(t)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 10,
                      background: pixType === t ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: pixType === t ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                      color: pixType === t ? 'var(--accent-teal)' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={pixInput}
                onChange={(e) => setPixInput(e.target.value)}
                placeholder="Insira sua chave PIX..."
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12,
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #00f5d4, #00b4d8)' }}
            >
              Confirmar Transferência PIX Imediata
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
