import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Check, 
  Copy, 
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';
import type { UserProfile } from '../types';

interface PhotographerAffiliateModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
}

export const PhotographerAffiliateModal: React.FC<PhotographerAffiliateModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [affiliatePixKey, setAffiliatePixKey] = useState<string>('seu-pix@email.com');
  const [isPixSaved, setIsPixSaved] = useState<boolean>(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<string>('Studio meflagrou');

  const referralCode = currentUser ? currentUser.handle.toUpperCase() : 'MEFLAGROU_VIP';
  const referralLink = `https://meflagrou.com/pro/${selectedPhotographer.toLowerCase().replace(/\s+/g, '')}?ref=${referralCode}`;

  const [contractsClosed] = useState<{
    id: string;
    clientName: string;
    eventType: string;
    contractValue: number;
    commissionValue: number;
    status: 'pago' | 'processando';
    date: string;
  }[]>([
    {
      id: 'ctr_01',
      clientName: 'Mariana Costa',
      eventType: 'Casamento Destination VIP (Guarujá)',
      contractValue: 3500.00,
      commissionValue: 350.00, // 10%
      status: 'pago',
      date: '14/08/2026'
    },
    {
      id: 'ctr_02',
      clientName: 'Felipe Albuquerque',
      eventType: 'Aniversário VIP & After Party (SP)',
      contractValue: 1800.00,
      commissionValue: 180.00, // 10%
      status: 'pago',
      date: '10/08/2026'
    },
    {
      id: 'ctr_03',
      clientName: 'Camarote Sunset Club',
      eventType: 'Cobertura Festival Eletrônico',
      contractValue: 2500.00,
      commissionValue: 250.00, // 10%
      status: 'processando',
      date: 'Hoje'
    }
  ]);

  const totalEarned = contractsClosed
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  const pendingEarned = contractsClosed
    .filter(c => c.status === 'processando')
    .reduce((sum, c) => sum + c.commissionValue, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5d4', '#00e5ff', '#ffffff']
    });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPixSaved(true);
    soundFx.playUnlockSuccess();
    setTimeout(() => setIsPixSaved(false), 3000);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 760,
          maxHeight: '92vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 245, 212, 0.6)'
          }}>
            <Users size={24} color="#07080c" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Programa de Indicação de Fotógrafos (10% de Comissão)
              </h2>
              <span style={{
                background: 'rgba(0, 245, 212, 0.2)',
                border: '1px solid var(--accent-teal)',
                color: 'var(--accent-teal)',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: '0.65rem',
                fontWeight: 900
              }}>
                GANHE NO PIX
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Indique os perfis dos melhores fotógrafos para eventos, casamentos ou festas e ganhe 10% do valor total do contrato fechado.
            </p>
          </div>
        </div>

        {/* Top Earnings Metrics (2 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 18 }}>
          <div style={{
            background: 'rgba(0, 245, 212, 0.08)',
            border: '1px solid rgba(0, 245, 212, 0.35)',
            borderRadius: 16,
            padding: 14
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Comissões Recebidas no PIX</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-teal)', marginTop: 2 }}>
              R$ {totalEarned.toFixed(2).replace('.', ',')}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>✓ 2 contratos quitados</span>
          </div>

          <div style={{
            background: 'rgba(255, 183, 3, 0.08)',
            border: '1px solid rgba(255, 183, 3, 0.35)',
            borderRadius: 16,
            padding: 14
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Comissão em Processamento</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: '#ffb703', marginTop: 2 }}>
              R$ {pendingEarned.toFixed(2).replace('.', ',')}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#ffb703' }}>⏳ Liberação após a festa</span>
          </div>
        </div>

        {/* Referral Link Generator Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Share2 size={15} color="var(--accent-teal)" />
            Seu Link Exclusivo de Indicação de Fotógrafo:
          </div>

          {/* Select photographer to refer */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Escolha o Fotógrafo que Você Deseja Indicar:
            </label>
            <select
              value={selectedPhotographer}
              onChange={(e) => setSelectedPhotographer(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '8px 10px',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="Studio meflagrou" style={{ background: '#07080c' }}>Studio meflagrou (Festivais & Grandes Eventos)</option>
              <option value="Rafael Clicks" style={{ background: '#07080c' }}>Rafael Clicks (Baladas & Clubs Noturnos)</option>
              <option value="Beatriz Lens" style={{ background: '#07080c' }}>Beatriz Lens (Casamentos VIP & Sunsets)</option>
              <option value="Lucas Drone" style={{ background: '#07080c' }}>Lucas Drone (Imagens Aéreas 8K & Festivais)</option>
            </select>
          </div>

          {/* Shareable Link Input with Copy Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '4px 6px 4px 12px',
            gap: 8
          }}>
            <span style={{
              flex: 1,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--accent-teal)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {referralLink}
            </span>

            <button
              onClick={handleCopyLink}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* Chave PIX for Receiving Commissions */}
        <form onSubmit={handleSavePix} style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Sua Chave PIX para Receber Comissões de Indicação
            </label>
            <input
              type="text"
              value={affiliatePixKey}
              onChange={(e) => setAffiliatePixKey(e.target.value)}
              placeholder="Digite seu CPF, e-mail ou telefone..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '8px 12px',
                color: '#ffffff',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-secondary"
            style={{
              padding: '9px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Check size={14} />
            {isPixSaved ? 'PIX Atualizado!' : 'Salvar Chave PIX'}
          </button>
        </form>

        {/* History of Closed Contracts via Referral */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
            Histórico de Contratos Fechados por Sua Indicação:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contractsClosed.map((ctr) => (
              <div
                key={ctr.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  flexWrap: 'wrap',
                  gap: 8
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff' }}>
                    {ctr.eventType}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Cliente: {ctr.clientName} • Contrato Total: R$ {ctr.contractValue.toFixed(2).replace('.', ',')} • {ctr.date}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: 'var(--accent-teal)', fontSize: '0.92rem' }}>
                    + R$ {ctr.commissionValue.toFixed(2).replace('.', ',')} (10%)
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: ctr.status === 'pago' ? '#00f5d4' : '#ffb703',
                    background: ctr.status === 'pago' ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 183, 3, 0.15)',
                    padding: '2px 6px',
                    borderRadius: 6
                  }}>
                    {ctr.status === 'pago' ? '✓ PAGO NO PIX' : '⏳ EM ANDAMENTO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
