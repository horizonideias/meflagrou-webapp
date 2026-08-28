import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Zap, 
  Receipt,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../services/biometricService';

interface PixSplitConfigModalProps {
  onClose: () => void;
}

export const PixSplitConfigModal: React.FC<PixSplitConfigModalProps> = ({
  onClose,
}) => {
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'>('email');
  const [pixKeyValue, setPixKeyValue] = useState<string>('contato@meflagrou.com');
  const [bankName, setBankName] = useState<string>('Banco Inter / Nubank / Itaú');
  const [holderName, setHolderName] = useState<string>('MEFLAGROU OFICIAL - MASTER');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [simulatedTransactions, setSimulatedTransactions] = useState<{
    id: string;
    photoTitle: string;
    total: number;
    ownerSplit: number;
    masterSplit: number;
    siteFee: number;
    time: string;
  }[]>([
    {
      id: 'pix_99182',
      photoTitle: 'Sunset Festival • VIP Mainstage',
      total: 999.99,
      ownerSplit: 899.99,
      masterSplit: 89.99,
      siteFee: 10.00,
      time: 'Há 2 min'
    },
    {
      id: 'pix_99181',
      photoTitle: 'Warung Beach Club • Frontstage',
      total: 999.99,
      ownerSplit: 899.99,
      masterSplit: 89.99,
      siteFee: 10.00,
      time: 'Há 8 min'
    },
    {
      id: 'pix_99180',
      photoTitle: 'Laroc Club • Sunset Glow',
      total: 999.99,
      ownerSplit: 899.99,
      masterSplit: 89.99,
      siteFee: 10.00,
      time: 'Há 15 min'
    }
  ]);

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    soundFx.playUnlockSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffb703', '#00f5d4', '#ffffff']
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSimulateSale = () => {
    soundFx.playUnlockSuccess();
    const newTx = {
      id: `pix_${Math.floor(10000 + Math.random() * 90000)}`,
      photoTitle: 'Tomorrowland Brasil • VIP Lounge',
      total: 999.99,
      ownerSplit: 899.99,
      masterSplit: 89.99,
      siteFee: 10.00,
      time: 'Agora'
    };
    setSimulatedTransactions([newTx, ...simulatedTransactions.slice(0, 4)]);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#ffb703', '#00f5d4']
    });
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
          border: '1.5px solid #ffb703',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(255, 183, 3, 0.3)',
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
            background: 'linear-gradient(135deg, #ffb703, #fb8500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(255, 183, 3, 0.6)'
          }}>
            <Crown size={24} color="#07080c" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Split Automático PIX // Conta Master (9%)
              </h2>
              <span style={{
                background: 'rgba(255, 183, 3, 0.2)',
                border: '1px solid #ffb703',
                color: '#ffb703',
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: '0.65rem',
                fontWeight: 900
              }}>
                SPLIT BANCÁRIO 90/9/1%
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Regra Oficial: 90% para o Dono da Foto • 9% para a Conta Master • 1% para a plataforma meflagrou.com.
            </p>
          </div>
        </div>

        {/* Breakdown Simulation Card */}
        <div style={{
          background: 'rgba(255, 183, 3, 0.08)',
          border: '1px solid rgba(255, 183, 3, 0.35)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffb703', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> Exemplo de Venda de Foto no Valor Padrão (R$ 999,99):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 10 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>90% Dono / Fotógrafo</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-teal)' }}>
                R$ 899,99
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cai na chave PIX do autor</span>
            </div>

            <div style={{ background: 'rgba(255, 183, 3, 0.15)', border: '1px solid #ffb703', borderRadius: 12, padding: 10 }}>
              <span style={{ fontSize: '0.7rem', color: '#ffb703', fontWeight: 800 }}>👑 9% Conta Master</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffb703' }}>
                R$ 89,99
              </div>
              <span style={{ fontSize: '0.65rem', color: '#ffffff' }}>Split instantâneo 24h</span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 10 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>1% meflagrou.com</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                R$ 10,00
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Taxa de infraestrutura</span>
            </div>
          </div>
        </div>

        {/* Chave PIX Configuration Form */}
        <form onSubmit={handleSavePix} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
            Configurar Chave PIX de Destino Master:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {(['email', 'cpf', 'cnpj', 'telefone', 'aleatoria'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPixKeyType(type)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: pixKeyType === type ? 'rgba(255, 183, 3, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: pixKeyType === type ? '1.5px solid #ffb703' : '1px solid var(--border-subtle)',
                  color: pixKeyType === type ? '#ffb703' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Chave PIX Master
            </label>
            <input
              type="text"
              value={pixKeyValue}
              onChange={(e) => setPixKeyValue(e.target.value)}
              placeholder="Digite a chave PIX..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Titular da Conta
              </label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '9px 12px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Instituição Bancária
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '9px 12px',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #ffb703, #fb8500)',
              color: '#07080c',
              padding: '11px',
              fontSize: '0.85rem',
              fontWeight: 900,
              boxShadow: '0 0 20px rgba(255, 183, 3, 0.4)'
            }}
          >
            <Check size={16} />
            {isSaved ? 'Chave PIX Master Atualizada!' : 'Salvar Chave PIX Master'}
          </button>
        </form>

        {/* Live Simulated Transactions Ledger */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={15} color="#ffb703" /> Extrato de Repasses em Tempo Real
            </span>

            <button
              onClick={handleSimulateSale}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} />
              Simular Nova Venda (R$ 999,99)
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {simulatedTransactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#ffffff' }}>{tx.photoTitle}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Total: R$ {tx.total.toFixed(2)} • {tx.time}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, color: '#ffb703', fontSize: '0.88rem' }}>
                    + R$ {tx.masterSplit.toFixed(2).replace('.', ',')} (9%)
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-teal)' }}>
                    Autor: R$ {tx.ownerSplit.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

