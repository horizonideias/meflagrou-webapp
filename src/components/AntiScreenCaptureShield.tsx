import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldAlert, Lock, ShoppingBag, X, Check, EyeOff } from 'lucide-react';
import { soundFx } from '../services/biometricService';

interface AntiScreenCaptureShieldProps {
  onOpenCart?: () => void;
}

export const AntiScreenCaptureShield: React.FC<AntiScreenCaptureShieldProps> = ({
  onOpenCart,
}) => {
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [shieldReason, setShieldReason] = useState<string>('Tentativa de captura de tela detectada.');
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerShield = useCallback((reason: string) => {
    setShieldReason(reason);
    setIsShieldActive(true);
    soundFx.playRadarTick();

    // Overwrite clipboard with copyright protection notice
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(
        '🔒 MEFLAGROU.COM • CONTEÚDO PROTEGIDO POR DIREITOS AUTORAIS\nCapturas e prints não autorizados são bloqueados. Compre sua foto digital oficial em alta definição no site.'
      ).catch(() => {});
    }

    if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    dismissTimeoutRef.current = setTimeout(() => {
      setIsShieldActive(false);
    }, 4500);
  }, []);

  useEffect(() => {
    // 1. Intercept PrintScreen and shortcut keys (Windows Snipping Tool, Mac Screen Capture, DevTools, Save, Print)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerShield('📸 PrintScreen Bloqueado: As fotos do meflagrou.com são protegidas por direitos autorais.');
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Mac Screenshots (Cmd + Shift + 3 / 4 / 5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        triggerShield('✂️ Ferramenta de Captura Bloqueada: Para garantir a exclusividade dos flagrantes, adquira a foto digital original.');
        return;
      }

      // Ctrl + P (Print / Salvar como PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        triggerShield('🖨️ Impressão e exportação PDF desativadas para proteção do acervo.');
        return;
      }

      // Ctrl + S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's') && !e.shiftKey) {
        e.preventDefault();
        triggerShield('💾 Download direto de página desativado. Utilize o download oficial em alta resolução.');
        return;
      }

      // Ctrl + U (View source code)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        triggerShield('🔒 Código-fonte e acervo criptografados.');
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            '🔒 MEFLAGROU.COM • FOTO PROTEGIDA\nCompre sua foto oficial em resolução original no site.'
          ).catch(() => {});
        }
      }
    };

    // 2. Window Blur / Tab change protection (Snipping tool focus steal or background window capture)
    const handleWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    // 3. Right Click context menu protection on images
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'IMG' || target.closest('.instagram-post-card') || target.closest('.fullscreen-modal-root') || target.closest('.photo-viewer-stage'))) {
        e.preventDefault();
        triggerShield('🛡️ Clique com botão direito bloqueado para proteção do acervo fotográfico.');
      }
    };

    // 4. Drag & Drop image protection
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
    };
  }, [triggerShield]);

  return (
    <>
      {/* 1. Backdrop Blur when Window Loses Focus (Prevents background screen snips) */}
      {isWindowBlurred && (
        <div className="screen-protection-privacy-curtain">
          <div className="privacy-curtain-content">
            <EyeOff size={32} color="var(--accent-teal)" />
            <span>meflagrou.com • Proteção de Tela Ativa</span>
          </div>
        </div>
      )}

      {/* 2. Floating Anti-PrintShield Alert Notification Modal */}
      {isShieldActive && (
        <div className="anti-print-shield-overlay" role="alert">
          <div className="anti-print-shield-card">
            <div className="shield-icon-badge">
              <ShieldAlert size={28} color="#ff007a" />
            </div>

            <div className="shield-card-body">
              <div className="shield-card-header">
                <span className="shield-badge-tag">
                  <Lock size={12} /> MEFLAGROU DIGITAL SHIELD
                </span>
                <button 
                  onClick={() => setIsShieldActive(false)} 
                  className="shield-close-btn"
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="shield-card-title">Proteção de Imagem & Direitos Autorais</h3>
              <p className="shield-card-desc">{shieldReason}</p>

              <div className="shield-perks-row">
                <div className="shield-perk-item">
                  <Check size={12} color="var(--accent-teal)" />
                  <span>Foto sem marca d'água</span>
                </div>
                <div className="shield-perk-item">
                  <Check size={12} color="var(--accent-teal)" />
                  <span>Resolução original 50.1 MP</span>
                </div>
                <div className="shield-perk-item">
                  <Check size={12} color="var(--accent-teal)" />
                  <span>Download instantâneo</span>
                </div>
              </div>

              <div className="shield-actions-row">
                <button 
                  onClick={() => setIsShieldActive(false)} 
                  className="shield-dismiss-btn"
                >
                  Entendi
                </button>

                {onOpenCart && (
                  <button 
                    onClick={() => {
                      setIsShieldActive(false);
                      onOpenCart();
                    }} 
                    className="shield-buy-btn"
                  >
                    <ShoppingBag size={15} />
                    <span>Ver Carrinho / Comprar HD</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
