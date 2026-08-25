<?php
/**
 * Template Part: Modal Clube VIP & Black Pass
 *
 * @package meflagrou
 */
?>

<div id="mf-vip-modal" class="mf-modal-backdrop" style="display: none;">
    <div class="mf-modal-dialog mf-vip-card">
        
        <button type="button" class="mf-modal-close-btn" id="mf-close-vip-modal">
            <i data-lucide="x"></i>
        </button>

        <div class="mf-vip-header">
            <div class="mf-vip-crown-badge">
                <i data-lucide="crown"></i>
            </div>
            <h2 class="mf-modal-title">Clube VIP meflagrou Black Pass</h2>
            <p class="mf-modal-subtitle">Downloads Ilimitados em 8K, Acesso Imediato sem Marca d'Água e Prioridade no Radar</p>
        </div>

        <div class="mf-vip-plans-grid">
            <!-- Plan 1: Passe Temporada -->
            <div class="mf-vip-plan-tile">
                <span class="mf-plan-tag">Mais Popular</span>
                <h3>Passe Temporada 2026</h3>
                <div class="mf-plan-price">R$ 49,90<span>/mês</span></div>
                <ul class="mf-plan-features">
                    <li><i data-lucide="check"></i> Downloads ilimitados de todas as suas fotos</li>
                    <li><i data-lucide="check"></i> Resolução original 50.1 MP RAW sem compressão</li>
                    <li><i data-lucide="check"></i> Alerta imediato no WhatsApp a cada flagrante</li>
                    <li><i data-lucide="check"></i> Badge VIP no seu perfil @meflagrou</li>
                </ul>
                <button type="button" class="mf-btn-vip-checkout" onclick="window.mfInstantBuyPlan('Passe Temporada', 'R$ 49,90')">
                    Assinar com PIX
                </button>
            </div>

            <!-- Plan 2: Black Pass Anual -->
            <div class="mf-vip-plan-tile highlight">
                <span class="mf-plan-tag gold">👑 Vitalício / Anual</span>
                <h3>Clube Black Pass Anual</h3>
                <div class="mf-plan-price">R$ 299,00<span>/ano</span></div>
                <ul class="mf-plan-features">
                    <li><i data-lucide="check"></i> Acesso a todos os festivais do Brasil</li>
                    <li><i data-lucide="check"></i> Acesso antecipado 2h antes de publicar no feed</li>
                    <li><i data-lucide="check"></i> Álbum privativo protegido por senha e Face ID</li>
                    <li><i data-lucide="check"></i> Suporte prioritário via WhatsApp direto da cabine</li>
                </ul>
                <button type="button" class="mf-btn-vip-gold-checkout" onclick="window.mfInstantBuyPlan('Black Pass Anual', 'R$ 299,00')">
                    Garantir Black Pass VIP
                </button>
            </div>
        </div>

    </div>
</div>
