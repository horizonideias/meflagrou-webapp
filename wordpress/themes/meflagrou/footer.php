<?php
/**
 * meflagrou.com - Footer Template
 *
 * @package meflagrou
 * @version 2.0.0
 */
?>

<!-- 📱 BARRA DE NAVEGAÇÃO FLUTUANTE MOBILE (TOUCH COMPATIBLE) -->
<nav class="mf-mobile-bottom-nav">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="mf-mobile-tab-btn <?php echo is_front_page() ? 'active' : ''; ?>">
        <i data-lucide="compass"></i>
        <span>Feed</span>
    </a>
    <button type="button" class="mf-mobile-tab-btn" id="mf-mobile-radar-btn">
        <i data-lucide="radar"></i>
        <span>Radar</span>
    </button>
    <button type="button" class="mf-mobile-tab-btn mf-mobile-faceid-highlight" id="mf-mobile-faceid-btn">
        <div class="mf-faceid-glow-ring">
            <i data-lucide="scan-face"></i>
        </div>
        <span>Face ID</span>
    </button>
    <button type="button" class="mf-mobile-tab-btn" id="mf-mobile-slideshow-btn">
        <i data-lucide="layers"></i>
        <span>Mosaico</span>
    </button>
    <button type="button" class="mf-mobile-tab-btn" id="mf-mobile-auth-btn">
        <i data-lucide="user"></i>
        <span>Conta</span>
    </button>
</nav>

<!-- 🌐 RODAPÉ DESKTOP & ASSINATURA CYBERPUNK -->
<footer class="mf-footer-section">
    <div class="mf-container">
        <div class="mf-footer-grid">
            <div class="mf-footer-col-brand">
                <div class="mf-logo-text mf-footer-logo">meflagrou<span>.com</span></div>
                <p class="mf-footer-desc">
                    A plataforma número 1 de cobertura fotográfica inteligente de festivais, baladas e clubs no Brasil.
                    Reconhecimento facial com IA e autenticação segura via WhatsApp & CPF.
                </p>
                <div class="mf-security-badges-row">
                    <span class="mf-badge-item"><i data-lucide="shield-check"></i> SSL 256-Bit</span>
                    <span class="mf-badge-item"><i data-lucide="lock"></i> LGPD Compliant</span>
                    <span class="mf-badge-item"><i data-lucide="file-check"></i> CPF Módulo 11</span>
                </div>
            </div>

            <div class="mf-footer-col">
                <h4 class="mf-footer-col-title">Navegação</h4>
                <ul class="mf-footer-links">
                    <li><a href="<?php echo esc_url(home_url('/')); ?>">Feed de Flagrantes</a></li>
                    <li><a href="#" id="mf-footer-radar-link">Radar de Festivais</a></li>
                    <li><a href="#" id="mf-footer-slideshow-link">Mosaico em Tela Cheia</a></li>
                    <li><a href="#" id="mf-footer-vip-link">Passe VIP 8K & Black Pass</a></li>
                </ul>
            </div>

            <div class="mf-footer-col">
                <h4 class="mf-footer-col-title">Para Fotógrafos</h4>
                <ul class="mf-footer-links">
                    <li><a href="#" id="mf-footer-pro-link">Credenciamento de Eventos</a></li>
                    <li><a href="#" id="mf-footer-upload-link">Painel do Fotógrafo Pro</a></li>
                    <li><a href="#" id="mf-footer-payout-link">Tabela de Repasse & PIX</a></li>
                    <li><a href="#" id="mf-footer-guidelines-link">Diretrizes de Direitos Autorais</a></li>
                </ul>
            </div>

            <div class="mf-footer-col">
                <h4 class="mf-footer-col-title">Atendimento & Suporte</h4>
                <div class="mf-whatsapp-support-card">
                    <i data-lucide="message-circle" class="mf-wa-icon"></i>
                    <div>
                        <strong>Suporte WhatsApp 24/7</strong>
                        <span>(11) 98888-7777</span>
                    </div>
                </div>
                <p class="mf-footer-copy">
                    &copy; <?php echo date('Y'); ?> meflagrou.com • Todos os direitos reservados.
                </p>
            </div>
        </div>
    </div>
</footer>

<!-- =========================================================================
     MODAIS GLOBAIS DO MEFLAGROU (SLIDESHOW, AUTH, RADAR, VIP, CARRINHO)
     ========================================================================= -->
<?php get_template_part('template-parts/modal', 'auth-gatekeeper'); ?>
<?php get_template_part('template-parts/modal', 'slideshow'); ?>
<?php get_template_part('template-parts/modal', 'radar'); ?>
<?php get_template_part('template-parts/modal', 'vip'); ?>
<?php get_template_part('template-parts/modal', 'cart'); ?>

<?php wp_footer(); ?>
</body>
</html>
