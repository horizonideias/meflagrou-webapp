<?php
/**
 * Template Part: Modal Carrinho & Checkout Instantâneo PIX
 *
 * @package meflagrou
 */
?>

<div id="mf-cart-modal" class="mf-modal-backdrop" style="display: none;">
    <div class="mf-modal-dialog mf-cart-card">
        
        <button type="button" class="mf-modal-close-btn" id="mf-close-cart-modal">
            <i data-lucide="x"></i>
        </button>

        <div class="mf-cart-header">
            <div class="mf-cart-icon-badge">
                <i data-lucide="shopping-bag"></i>
            </div>
            <div>
                <h2 class="mf-modal-title">Carrinho de Compras & Checkout PIX</h2>
                <p class="mf-modal-subtitle">Receba o link de download em alta resolução (50.1 MP) imediatamente no seu WhatsApp e E-mail</p>
            </div>
        </div>

        <div class="mf-cart-body" id="mf-cart-items-container">
            <!-- Items rendered via JS -->
            <div class="mf-cart-empty-state" id="mf-cart-empty-state">
                <i data-lucide="camera-off" class="mf-empty-icon"></i>
                <p>Seu carrinho está vazio.</p>
                <span class="mf-empty-hint">Escolha suas fotos no feed para comprar em alta definição.</span>
            </div>

            <div class="mf-cart-list" id="mf-cart-items-list" style="display: none;"></div>
        </div>

        <!-- PIX QR Code & Copia e Cola View (Initially hidden) -->
        <div class="mf-pix-stage" id="mf-pix-stage" style="display: none;">
            <div class="mf-pix-badge">
                <i data-lucide="zap"></i>
                <span>PIX GERADO COM SUCESSO</span>
            </div>
            <div class="mf-pix-qr-box">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136meflagrou-pagamento-instantaneo-pix" alt="QR Code PIX" class="mf-pix-qr-img" />
            </div>
            <div class="mf-pix-copy-box">
                <input type="text" readonly value="00020126580014br.gov.bcb.pix0136meflagrou-pagamento-instantaneo-pix" id="mf-pix-copy-input" class="mf-form-input" />
                <button type="button" class="mf-btn-copy-pix" id="mf-btn-copy-pix-code">
                    <i data-lucide="copy"></i>
                    <span>Copiar Código</span>
                </button>
            </div>
            <button type="button" class="mf-btn-confirm-payment" id="mf-btn-simulate-pix-paid">
                <i data-lucide="check-circle-2"></i>
                <span>Simular Pagamento Aprovado</span>
            </button>
        </div>

        <div class="mf-cart-footer" id="mf-cart-footer-controls" style="display: none;">
            <div class="mf-cart-total-row">
                <span>Total a Pagar:</span>
                <strong id="mf-cart-total-value">R$ 0,00</strong>
            </div>
            <button type="button" class="mf-btn-checkout-pix" id="mf-btn-generate-pix">
                <i data-lucide="zap"></i>
                <span>Gerar Chave PIX & Concluir</span>
            </button>
        </div>

    </div>
</div>
