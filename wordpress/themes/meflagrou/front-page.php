<?php
/**
 * meflagrou.com - Front Page Template
 *
 * @package meflagrou
 * @version 2.0.0
 */

get_header(); ?>

<main id="primary" class="mf-main-feed-site">
    <div class="mf-container">
        
        <!-- 1. STORIES CAROUSEL (RÁPIDO NO DESKTOP, NATURAL NO TOUCH MOBILE) -->
        <section class="mf-stories-section">
            <?php get_template_part('template-parts/content', 'story-bar'); ?>
        </section>

        <!-- 2. BLOCO DE DESTAQUE EMPARELHADO (VINTAGE CULTURE & RADAR AO VIVO) -->
        <section class="mf-featured-paired-section">
            <?php get_template_part('template-parts/content', 'paired-blocks'); ?>
        </section>

        <!-- 3. BARRA DE FILTROS & AÇÕES RÁPIDAS (CHIPS NEON) -->
        <section class="mf-filter-chips-section">
            <div class="mf-filter-chips-scroll">
                <button type="button" class="mf-chip-btn active" data-filter="all">
                    <i data-lucide="sparkles"></i>
                    <span>Todos os Flagrantes (8.420)</span>
                </button>
                <button type="button" class="mf-chip-btn" data-filter="warung">
                    <span class="mf-chip-dot green"></span>
                    <span>Warung Beach Club</span>
                </button>
                <button type="button" class="mf-chip-btn" data-filter="laroc">
                    <span class="mf-chip-dot blue"></span>
                    <span>Laroc Club Open Air</span>
                </button>
                <button type="button" class="mf-chip-btn" data-filter="green-valley">
                    <span class="mf-chip-dot pink"></span>
                    <span>Green Valley Camboriú</span>
                </button>
                <button type="button" class="mf-chip-btn" data-filter="privilege">
                    <span class="mf-chip-dot gold"></span>
                    <span>Privilège Sunset</span>
                </button>
                <button type="button" class="mf-chip-btn mf-chip-faceid" id="mf-chip-my-flags">
                    <i data-lucide="scan-face"></i>
                    <span>Meus Flagrantes (Face ID)</span>
                </button>
            </div>

            <!-- Fullscreen Slideshow Fast Action Button -->
            <div class="mf-filter-right-action">
                <button type="button" class="mf-btn-fullscreen-trigger" id="mf-trigger-mosaico-btn">
                    <i data-lucide="maximize"></i>
                    <span>Ver em Mosaico & Slideshow</span>
                </button>
            </div>
        </section>

        <!-- 4. FEED DE FOTOS & CARDS COM DETECÇÃO FACIAL E COMPRA RÁPIDA -->
        <section class="mf-feed-grid-section">
            <?php get_template_part('template-parts/content', 'feed-grid'); ?>
        </section>

    </div>
</main>

<?php get_footer(); ?>
