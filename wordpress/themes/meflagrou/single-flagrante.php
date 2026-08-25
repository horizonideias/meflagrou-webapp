<?php
/**
 * meflagrou.com - Single Flagrante Photo Template
 *
 * @package meflagrou
 * @version 2.0.0
 */

get_header(); ?>

<main id="primary" class="mf-single-photo-site">
    <div class="mf-container" style="padding-top: 30px; padding-bottom: 60px;">
        
        <?php while (have_posts()) : the_post(); 
            $photographer = get_post_meta(get_the_ID(), '_meflagrou_photographer', true) ?: 'André Souza';
            $event = get_post_meta(get_the_ID(), '_meflagrou_event', true) ?: 'Warung Beach Club 2026';
            $price = get_post_meta(get_the_ID(), '_meflagrou_price', true) ?: 'R$ 19,90';
            $resolution = get_post_meta(get_the_ID(), '_meflagrou_resolution', true) ?: '50.1 MP Sony Alpha 1';
        ?>
            <div class="mf-single-layout" style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 30px; align-items: start;">
                
                <!-- Left: Big Photo Stage with Protection -->
                <div class="mf-single-media-box" style="position: relative; border-radius: 20px; overflow: hidden; background: #0f111a; border: 1px solid var(--border-subtle);">
                    <?php if (has_post_thumbnail()) : ?>
                        <?php the_post_thumbnail('meflagrou-hd', array('class' => 'mf-single-img', 'style' => 'width: 100%; display: block;')); ?>
                    <?php else: ?>
                        <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85" alt="<?php the_title_attribute(); ?>" style="width: 100%; display: block;" />
                    <?php endif; ?>

                    <div class="mf-watermark-overlay">
                        <span>meflagrou.com • PREVIEW NÃO AUTORIZADO</span>
                    </div>
                </div>

                <!-- Right: Details & Purchase Card -->
                <div class="mf-single-details-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(0, 245, 212, 0.12); color: var(--accent-teal); font-size: 0.76rem; font-weight: 800; padding: 4px 10px; border-radius: 12px; align-self: flex-start;">
                        <i data-lucide="map-pin"></i>
                        <span><?php echo esc_html($event); ?></span>
                    </div>

                    <h1 style="font-size: 1.6rem; font-weight: 900; color: #ffffff; margin: 0; line-height: 1.3;">
                        <?php the_title(); ?>
                    </h1>

                    <div style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5;">
                        <?php the_content(); ?>
                    </div>

                    <!-- EXIF & Photo Specs -->
                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.78rem;">
                        <div>
                            <span style="color: var(--text-muted); display: block;">Fotógrafo:</span>
                            <strong style="color: #ffffff;"><?php echo esc_html($photographer); ?></strong>
                        </div>
                        <div>
                            <span style="color: var(--text-muted); display: block;">Resolução:</span>
                            <strong style="color: var(--accent-teal);"><?php echo esc_html($resolution); ?></strong>
                        </div>
                    </div>

                    <!-- Price & Buy PIX -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
                        <div>
                            <span style="font-size: 0.72rem; color: var(--text-muted);">Preço da Foto HD:</span>
                            <div style="font-size: 1.6rem; font-weight: 900; color: var(--accent-teal);"><?php echo esc_html($price); ?></div>
                        </div>
                        <button type="button" class="mf-btn-buy-pix" style="padding: 12px 24px; font-size: 0.92rem; border-radius: 14px;" onclick="window.mfInstantBuyPhoto(<?php the_ID(); ?>, '<?php the_title_attribute(); ?>', '<?php echo esc_js($price); ?>')">
                            <i data-lucide="zap"></i>
                            <span>Comprar com PIX</span>
                        </button>
                    </div>
                </div>

            </div>
        <?php endwhile; ?>

    </div>
</main>

<?php get_footer(); ?>
