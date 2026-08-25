<?php
/**
 * Template Part: Modal Slideshow & Fullscreen Mosaico (100% Screen)
 *
 * @package meflagrou
 */

$photos = meflagrou_get_sample_photos();
?>

<div id="mf-slideshow-modal" class="mf-slideshow-root" style="display: none;">
    
    <!-- Top Global Bar -->
    <div class="mf-slideshow-topbar">
        <div class="mf-slideshow-brand">
            <i data-lucide="camera" class="mf-slide-cam"></i>
            <span id="mf-slideshow-mode-title">Mosaico em Tela Cheia</span>
        </div>

        <div class="mf-slideshow-controls">
            <!-- Mode Switcher (Mosaico vs Slideshow) -->
            <button type="button" class="mf-btn-mode-toggle" id="mf-btn-toggle-slide-mode">
                <i data-lucide="play" id="mf-toggle-mode-icon"></i>
                <span id="mf-toggle-mode-label">Iniciar Slideshow Automático</span>
            </button>

            <!-- Close Fullscreen -->
            <button type="button" class="mf-btn-close-fullscreen" id="mf-btn-close-slideshow">
                <i data-lucide="x"></i>
            </button>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 1: MOSAICO GRID VIEW -->
    <!-- ========================================================================= -->
    <div class="mf-mosaico-stage" id="mf-mosaico-stage">
        <div class="mf-mosaico-grid">
            <?php foreach ($photos as $index => $photo): ?>
                <div class="mf-mosaico-tile" onclick="window.mfOpenSlideshowAtIndex(<?php echo esc_js($photo['id']); ?>)">
                    <img src="<?php echo esc_url($photo['image']); ?>" alt="<?php echo esc_attr($photo['title']); ?>" />
                    <div class="mf-mosaico-tile-overlay">
                        <i data-lucide="play-circle" class="mf-mosaico-play-btn"></i>
                        <div class="mf-mosaico-tile-info">
                            <span class="mf-mosaico-tile-event"><?php echo esc_html($photo['event']); ?></span>
                            <span class="mf-mosaico-tile-price"><?php echo esc_html($photo['price']); ?></span>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: CONTINUOUS KEN BURNS SLIDESHOW VIEW -->
    <!-- ========================================================================= -->
    <div class="mf-continuous-slide-stage" id="mf-continuous-slide-stage" style="display: none;">
        <!-- Progress Bar -->
        <div class="mf-slide-progress-track">
            <div class="mf-slide-progress-fill" id="mf-slide-progress-fill"></div>
        </div>

        <!-- Slide Stage & Backdrop Blur -->
        <div class="mf-slide-blur-backdrop" id="mf-slide-blur-bg"></div>
        <img src="" alt="Slide Ativo" class="mf-slide-main-image ken-burns" id="mf-slide-active-img" />

        <!-- Navigation Arrows -->
        <button type="button" class="mf-slide-arrow left" id="mf-slide-prev-btn">
            <i data-lucide="chevron-left"></i>
        </button>
        <button type="button" class="mf-slide-arrow right" id="mf-slide-next-btn">
            <i data-lucide="chevron-right"></i>
        </button>

        <!-- Slide Floating Info Card -->
        <div class="mf-slide-floating-card">
            <div class="mf-slide-info-meta">
                <span class="mf-slide-event-tag" id="mf-slide-event-text">Warung Beach Club</span>
                <h3 class="mf-slide-title-text" id="mf-slide-title-text">Vintage Culture Live Set</h3>
                <span class="mf-slide-photog-text" id="mf-slide-photog-text">Fotógrafo: André Souza</span>
            </div>
            <button type="button" class="mf-btn-buy-pix" id="mf-slide-buy-btn">
                <i data-lucide="zap"></i>
                <span id="mf-slide-price-text">Comprar por R$ 19,90</span>
            </button>
        </div>
    </div>

</div>
