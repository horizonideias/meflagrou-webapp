<?php
/**
 * Template Part: Modal Radar de Eventos
 *
 * @package meflagrou
 */
?>

<div id="mf-radar-modal" class="mf-modal-backdrop" style="display: none;">
    <div class="mf-modal-dialog mf-radar-card">
        
        <button type="button" class="mf-modal-close-btn" id="mf-close-radar-modal">
            <i data-lucide="x"></i>
        </button>

        <div class="mf-radar-modal-header">
            <div class="mf-radar-icon-badge">
                <span class="mf-radar-ping"></span>
                <i data-lucide="radar"></i>
            </div>
            <div>
                <h2 class="mf-modal-title">Radar de Festivais & Clubs Ao Vivo</h2>
                <p class="mf-modal-subtitle">Localize fotógrafos ativos em tempo real e ative alertas no seu WhatsApp</p>
            </div>
        </div>

        <!-- Active Events List -->
        <div class="mf-radar-events-list">
            <div class="mf-radar-event-row active">
                <div class="mf-radar-status-dot online"></div>
                <div class="mf-radar-event-details">
                    <strong>Warung Beach Club • Itajaí / SC</strong>
                    <span>8 Fotógrafos Ativos • 420 fotos enviadas hoje</span>
                </div>
                <button type="button" class="mf-btn-radar-action" onclick="window.mfFilterByEvent('Warung')">
                    Ver Fotos
                </button>
            </div>

            <div class="mf-radar-event-row active">
                <div class="mf-radar-status-dot online"></div>
                <div class="mf-radar-event-details">
                    <strong>Laroc Club • Valinhos / SP</strong>
                    <span>6 Fotógrafos Ativos • 310 fotos enviadas hoje</span>
                </div>
                <button type="button" class="mf-btn-radar-action" onclick="window.mfFilterByEvent('Laroc')">
                    Ver Fotos
                </button>
            </div>

            <div class="mf-radar-event-row active">
                <div class="mf-radar-status-dot online"></div>
                <div class="mf-radar-event-details">
                    <strong>Green Valley • Camboriú / SC</strong>
                    <span>5 Fotógrafos Ativos • 290 fotos enviadas hoje</span>
                </div>
                <button type="button" class="mf-btn-radar-action" onclick="window.mfFilterByEvent('Green Valley')">
                    Ver Fotos
                </button>
            </div>
        </div>

        <div class="mf-radar-footer-card">
            <i data-lucide="bell-ring" class="mf-bell-icon"></i>
            <div>
                <strong>Deseja ser avisado no WhatsApp quando novas fotos suas saírem?</strong>
                <p>Nossa IA biométrica envia o link direto no seu WhatsApp assim que o fotógrafo subir a foto.</p>
            </div>
            <button type="button" class="mf-btn-activate-wa-alert" id="mf-btn-activate-radar-wa">
                Ativar Alerta WhatsApp
            </button>
        </div>

    </div>
</div>
