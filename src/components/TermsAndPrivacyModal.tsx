import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface TermsAndPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 100000, padding: 14 }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          borderRadius: 24,
          overflowY: 'auto',
          background: 'rgba(10, 12, 18, 0.98)',
          border: '1.5px solid var(--accent-cyan)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(0, 240, 255, 0.25)',
          padding: 24,
          position: 'relative',
          animation: 'modalFadeIn 0.25s ease'
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
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Termos de Uso & Política de Privacidade
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
              Regulamento Oficial da Plataforma <strong>meflagrou.com</strong>.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          <button
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '9px',
              borderRadius: 10,
              background: activeTab === 'terms' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: activeTab === 'terms' ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: activeTab === 'terms' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <FileText size={15} /> Termos de Uso
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '9px',
              borderRadius: 10,
              background: activeTab === 'privacy' ? 'rgba(0, 255, 178, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: activeTab === 'privacy' ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
              color: activeTab === 'privacy' ? 'var(--accent-teal)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <Lock size={15} /> Privacidade & LGPD
          </button>
        </div>

        {/* Content */}
        {activeTab === 'terms' ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                1. Objeto e Propriedade de Imagens
              </strong>
              O <strong>meflagrou.com</strong> é uma plataforma digital de curadoria, catalogação inteligente e comercialização de fotografias capturadas em eventos, baladas, festivais e clubes por fotógrafos credenciados e usuários participantes.
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                2. Divisão de Pagamento e Split PIX (90% / 9% / 1%)
              </strong>
              Ao comprar qualquer fotografia na plataforma, o repasse financeiro é distribuído instantaneamente:
              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                <li><strong>90%</strong> para o Dono / Fotógrafo autor da fotografia.</li>
                <li><strong>9%</strong> para a Curadoria e Conta Master Oficial.</li>
                <li><strong>1%</strong> para custos de infraestrutura, gateway PIX e servidores.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                3. Compra e Regra de Foto de Perfil
              </strong>
              O usuário tem direito a utilizar em seu perfil público qualquer foto adquirida legitimamente no acervo da plataforma. Fotos sem marca d'água são disponibilizadas em ultra resolução 8K imediatamente após a confirmação do pagamento via PIX.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(0, 255, 178, 0.05)', padding: 14, borderRadius: 12, border: '1px solid rgba(0, 255, 178, 0.25)' }}>
              <strong style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                1. Conformidade com a LGPD (Lei nº 13.709/2018)
              </strong>
              O meflagrou.com opera em estrita conformidade com a legislação brasileira de proteção de dados e direito de imagem. Seus dados cadastrais (como CPF) são estritamente sigilosos e nunca compartilhados com terceiros.
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                2. Direito de Desfoque ou Exclusão Imediata (Art. 18)
              </strong>
              Qualquer titular que não deseje ter sua imagem vinculada publicamente a um evento pode solicitar a qualquer momento o <strong>desfoque facial automatizado</strong> ou a <strong>remoção da foto</strong> diretamente no botão "Solicitar Desfoque / Remoção (LGPD)" presente no visualizador da foto.
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: 4 }}>
                3. Segurança Biométrica Face ID
              </strong>
              Os algoritmos de reconhecimento facial realizam o cruzamento de vetores matemáticos para identificação de flagras sem armazenar cópias não criptografadas de dados biométricos sensíveis em servidores abertos.
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
