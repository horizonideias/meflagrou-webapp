import React from 'react';
import { 
  X, 
  Crown, 
  MessageSquare, 
  Radio, 
  MapPin, 
  Users, 
  QrCode, 
  Trophy, 
  Camera, 
  Swords, 
  DollarSign, 
  Sparkles,
  Smartphone,
  Download,
  Bot
} from 'lucide-react';
import { soundFx } from '../services/biometricService';

interface FeaturesHubMenuModalProps {
  onClose: () => void;
  onOpenBattle: () => void;
  onOpenVipClub: () => void;
  onOpenWhatsAppAlert: () => void;
  onOpenLiveTether: () => void;
  onOpenAffiliate: () => void;
  onOpenPortfolio: () => void;
  onOpenPingModal: () => void;
  onOpenSquadMatch: () => void;
  onOpenWristband: () => void;
  onOpenLeague: () => void;
  onOpenRadar?: () => void;
  onOpenHallOfFame?: () => void;
  onOpenInstallApp?: () => void;
  onOpenAICommunity?: () => void;
}

export const FeaturesHubMenuModal: React.FC<FeaturesHubMenuModalProps> = ({
  onClose,
  onOpenBattle,
  onOpenVipClub,
  onOpenWhatsAppAlert,
  onOpenLiveTether,
  onOpenAffiliate,
  onOpenPortfolio,
  onOpenPingModal,
  onOpenSquadMatch,
  onOpenWristband,
  onOpenLeague,
  onOpenRadar,
  onOpenHallOfFame,
  onOpenInstallApp,
  onOpenAICommunity,
}) => {
  const handleItemClick = (action: () => void) => {
    soundFx.playRadarTick();
    onClose();
    action();
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
          border: '1.5px solid var(--accent-teal)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(0, 245, 212, 0.25)',
          animation: 'modalFadeIn 0.25s ease',
          padding: 22,
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #00f5d4, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 245, 212, 0.6)'
          }}>
            <Sparkles size={22} color="#07080c" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Recursos & Experiências VIP
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2, marginBottom: 0 }}>
              Todas as ferramentas inteligentes, camarotes e serviços do <strong>meflagrou.com</strong>.
            </p>
          </div>
        </div>

        {/* 📲 PWA App Installation Spotlight Card */}
        {onOpenInstallApp && (
          <div
            onClick={() => handleItemClick(onOpenInstallApp)}
            className="hub-menu-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.15), rgba(121, 40, 202, 0.2))',
              border: '1.5px solid var(--accent-teal)',
              borderRadius: 16,
              padding: '12px 16px',
              marginBottom: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 0 25px rgba(0, 245, 212, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                color: '#07080c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(0, 245, 212, 0.5)'
              }}>
                <Smartphone size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📲 Baixar App meflagrou</span>
                  <span style={{ fontSize: '0.62rem', background: '#00f5d4', color: '#07080c', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>
                    1-TOQUE
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                  Acesso rápido em tela cheia na sua tela de início
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00f5d4, #00b4d8)',
                color: '#07080c',
                border: 'none',
                borderRadius: 10,
                pointerEvents: 'none'
              }}
            >
              <Download size={14} />
              Instalar
            </button>
          </div>
        )}

        {/* SECTION 1: ÁREA VIP & EXCLUSIVIDADES */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#ffb703',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Crown size={14} /> Área VIP & Assinaturas
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {/* Passaporte VIP */}
            <div
              onClick={() => handleItemClick(onOpenVipClub)}
              className="hub-menu-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.1), rgba(251, 133, 0, 0.05))',
                border: '1px solid rgba(255, 183, 3, 0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 183, 3, 0.2)',
                color: '#ffb703',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Crown size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Passaporte Balada VIP</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Downloads ilimitados 8K</div>
              </div>
            </div>

            {/* Alerta WhatsApp */}
            <div
              onClick={() => handleItemClick(onOpenWhatsAppAlert)}
              className="hub-menu-card"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(18, 140, 126, 0.05))',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(37, 211, 102, 0.2)',
                color: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageSquare size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Alerta no WhatsApp</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Receba fotos na hora</div>
              </div>
            </div>

            {/* Pulseira NFC */}
            <div
              onClick={() => handleItemClick(onOpenWristband)}
              className="hub-menu-card"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <QrCode size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Pulseira NFC / QR</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Check-in de 1 toque</div>
              </div>
            </div>

            {/* Hall da Fama */}
            {onOpenHallOfFame && (
              <div
                onClick={() => handleItemClick(onOpenHallOfFame)}
                className="hub-menu-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255, 183, 3, 0.15)',
                  color: '#ffb703',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trophy size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Hall da Fama VIP</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Ranking dos mais votados</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: EXPERIÊNCIAS NA PISTA & CAMAROTES */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: 'var(--accent-magenta)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Sparkles size={14} /> Pista, Camarotes & Diversão
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {/* Chamar Fotógrafo no Camarote */}
            <div
              onClick={() => handleItemClick(onOpenPingModal)}
              className="hub-menu-card"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.1), rgba(121, 40, 202, 0.05))',
                border: '1px solid rgba(255, 0, 122, 0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 0, 122, 0.2)',
                color: '#ff007a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Chamar no Camarote</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>"Me Flagre Aqui!" + Gorjeta</div>
              </div>
            </div>

            {/* Squad Match */}
            <div
              onClick={() => handleItemClick(onOpenSquadMatch)}
              className="hub-menu-card"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 180, 216, 0.05))',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0, 245, 212, 0.2)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Squad Match (Combo)</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>10 fotos + Divisão PIX</div>
              </div>
            </div>

            {/* Batalha 1x1 */}
            <div
              onClick={() => handleItemClick(onOpenBattle)}
              className="hub-menu-card"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 0, 122, 0.15)',
                color: '#ff007a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Swords size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Batalha de Flagras 1x1</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Vote no melhor look da noite</div>
              </div>
            </div>

            {/* Comunidade & IAs Humanas */}
            {onOpenAICommunity && (
              <div
                onClick={() => handleItemClick(onOpenAICommunity)}
                className="hub-menu-card"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 180, 216, 0.05))',
                  border: '1px solid rgba(0, 245, 212, 0.3)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(0, 245, 212, 0.2)',
                  color: 'var(--accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Comunidade & IAs</span>
                    <span style={{ fontSize: '0.58rem', background: '#00f5d4', color: '#07080c', padding: '1px 5px', borderRadius: 6, fontWeight: 900 }}>
                      AO VIVO
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Interações a cada minuto</div>
                </div>
              </div>
            )}

            {/* Radar GPS de Festas */}
            {onOpenRadar && (
              <div
                onClick={() => handleItemClick(onOpenRadar)}
                className="hub-menu-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(0, 229, 255, 0.15)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Radar GPS & Ingressos</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Mapa ao vivo de festivais</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: MÓDULO PROFISSIONAL & AFILIADOS */}
        <div>
          <div style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Camera size={14} /> Fotógrafos & Negócios
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {/* Indicar Fotógrafo */}
            <div
              onClick={() => handleItemClick(onOpenAffiliate)}
              className="hub-menu-card"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 180, 216, 0.05))',
                border: '1px solid rgba(0, 245, 212, 0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0, 245, 212, 0.2)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <DollarSign size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Indicar Fotógrafo (10%)</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Ganhe comissão no PIX</div>
              </div>
            </div>

            {/* Contratar Fotógrafo 8K */}
            <div
              onClick={() => handleItemClick(onOpenPortfolio)}
              className="hub-menu-card"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Camera size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Contratar Fotógrafo 8K</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Para festas e casamentos</div>
              </div>
            </div>

            {/* Liga dos Fotógrafos */}
            <div
              onClick={() => handleItemClick(onOpenLeague)}
              className="hub-menu-card"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 183, 3, 0.15)',
                color: '#ffb703',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trophy size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Liga dos Fotógrafos</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>R$ 5.000 em prêmios</div>
              </div>
            </div>

            {/* Modo Pista 5G */}
            <div
              onClick={() => handleItemClick(onOpenLiveTether)}
              className="hub-menu-card"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0, 245, 212, 0.15)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Radio size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff' }}>Modo Pista 5G (Tether)</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Transmissão sem fio de câmeras</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
