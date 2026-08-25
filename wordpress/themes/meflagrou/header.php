<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#07080c">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class('meflagrou-cyberpunk-body'); ?>>
<?php wp_body_open(); ?>

<!-- 🛡️ CORTINA DE PRIVACIDADE ANTI-PRINT & FOCO DE JANELA -->
<div id="mf-privacy-curtain" class="mf-privacy-curtain" style="display: none;">
    <div class="mf-curtain-shield-card">
        <i data-lucide="shield-alert" class="mf-curtain-icon"></i>
        <h3>Modo Protegido Ativado</h3>
        <p>A tela foi ocultada para proteção de direitos autorais do meflagrou.com.</p>
        <span class="mf-curtain-hint">Clique na janela para retomar</span>
    </div>
</div>

<!-- 🛡️ AVISO FLUTUANTE DE BLOQUEIO DE CAPTURA (PRINT SCREEN / SNIPPING TOOL) -->
<div id="mf-print-shield-toast" class="mf-print-shield-toast" style="display: none;">
    <div class="mf-print-shield-icon">
        <i data-lucide="shield-check"></i>
    </div>
    <div class="mf-print-shield-info">
        <strong>MEFLAGROU DIGITAL SHIELD</strong>
        <p>Capturas de tela bloqueadas. Adquira sua foto original em alta resolução (50.1 MP).</p>
    </div>
    <button type="button" class="mf-print-shield-buy-btn" id="mf-toast-buy-btn">
        Comprar Foto HD
    </button>
</div>

<!-- 📱 SIMULADOR DE NOTIFICAÇÃO PUSH WHATSAPP (TOKEN 6 DÍGITOS) -->
<div id="mf-whatsapp-push-toast" class="mf-whatsapp-push-toast" style="display: none;">
    <div class="mf-whatsapp-push-icon">
        <i data-lucide="message-square"></i>
    </div>
    <div class="mf-whatsapp-push-text">
        <span class="mf-whatsapp-push-sender">WhatsApp • meflagrou Security</span>
        <span class="mf-whatsapp-push-body" id="mf-whatsapp-push-code">Seu código de acesso é [ 000 000 ]</span>
        <span class="mf-whatsapp-push-autofill">Toque para preencher automaticamente ⚡</span>
    </div>
</div>

<!-- 🌐 CABEÇALHO GLOBAL MEFLAGROU -->
<header class="mf-header-sticky">
    <div class="mf-header-inner mf-container">
        <!-- Logo Neon -->
        <div class="mf-brand-wrapper">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="mf-logo-link">
                <div class="mf-logo-icon-box">
                    <i data-lucide="camera" class="mf-logo-svg"></i>
                </div>
                <span class="mf-logo-text">meflagrou<span>.com</span></span>
            </a>
            <div class="mf-live-badge-desktop">
                <span class="mf-pulse-dot"></span>
                <span>24 Fotógrafos Ao Vivo</span>
            </div>
        </div>

        <!-- Navigation Links -->
        <nav class="mf-desktop-nav">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="mf-nav-item <?php echo is_front_page() ? 'active' : ''; ?>">
                <i data-lucide="compass"></i>
                <span>Feed</span>
            </a>
            <button type="button" class="mf-nav-item" id="mf-open-radar-btn">
                <i data-lucide="radar"></i>
                <span>Radar GPS</span>
            </button>
            <button type="button" class="mf-nav-item" id="mf-open-slideshow-btn">
                <i data-lucide="layers"></i>
                <span>Mosaico HD</span>
            </button>
            <button type="button" class="mf-nav-item" id="mf-open-vip-btn">
                <i data-lucide="crown"></i>
                <span>Clube VIP</span>
            </button>
        </nav>

        <!-- Right User Actions -->
        <div class="mf-header-actions">
            <!-- Face ID Trigger -->
            <button type="button" class="mf-faceid-quick-btn" id="mf-header-faceid-btn" title="Buscar por Face ID">
                <i data-lucide="scan-face"></i>
                <span class="mf-hide-mobile">Face ID</span>
            </button>

            <!-- User Auth Profile Button -->
            <button type="button" class="mf-user-auth-btn" id="mf-header-auth-btn">
                <i data-lucide="user-check" class="mf-auth-icon-state"></i>
                <span id="mf-user-name-display">Entrar com WhatsApp</span>
            </button>

            <!-- Cart Trigger -->
            <button type="button" class="mf-cart-pill-btn" id="mf-header-cart-btn">
                <i data-lucide="shopping-bag"></i>
                <span class="mf-cart-count-badge" id="mf-cart-count">0</span>
            </button>
        </div>
    </div>
</header>
