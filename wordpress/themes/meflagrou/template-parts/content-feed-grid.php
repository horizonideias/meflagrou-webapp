<?php
/**
 * Template Part: Feed Grid Photos
 *
 * @package meflagrou
 */

$photos = meflagrou_get_sample_photos();
?>

<div class="mf-feed-cards-grid" id="mf-feed-cards-grid">
    <?php foreach ($photos as $photo): ?>
        <article class="mf-photo-card" data-photo-id="<?php echo esc_attr($photo['id']); ?>" data-event="<?php echo esc_attr($photo['event']); ?>">
            <!-- Photo Media Container with Protection and Face Tags -->
            <div class="mf-photo-media-wrapper">
                <img 
                    src="<?php echo esc_url($photo['image']); ?>" 
                    alt="<?php echo esc_attr($photo['title']); ?>" 
                    class="mf-photo-main-img" 
                    loading="lazy"
                />
                
                <!-- Watermark Overlay Shield -->
                <div class="mf-watermark-overlay">
                    <span>meflagrou.com • PREVIEW NÃO AUTORIZADO</span>
                </div>

                <!-- Face Tags Overlay -->
                <?php if (!empty($photo['tags'])): ?>
                    <div class="mf-face-tags-layer">
                        <?php foreach ($photo['tags'] as $tag): ?>
                            <div class="mf-face-box" style="left: <?php echo esc_attr($tag['x']); ?>%; top: <?php echo esc_attr($tag['y']); ?>%;">
                                <div class="mf-face-marker-pulse"></div>
                                <span class="mf-face-pill">
                                    <i data-lucide="check" class="mf-tag-check"></i>
                                    <?php echo esc_html($tag['name']); ?>
                                </span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <!-- Fast Action Hover Controls -->
                <div class="mf-photo-hover-actions">
                    <button type="button" class="mf-photo-zoom-btn" title="Visualizar em Tela Cheia" onclick="window.mfOpenSlideshowAtIndex(<?php echo esc_js($photo['id']); ?>)">
                        <i data-lucide="maximize-2"></i>
                    </button>
                    <button type="button" class="mf-photo-faceid-btn" title="Buscar Pessoas nesta Foto" onclick="window.mfTriggerFaceScan()">
                        <i data-lucide="scan"></i>
                    </button>
                </div>

                <!-- Event Tag Badge -->
                <span class="mf-event-badge-pill">
                    <i data-lucide="map-pin"></i>
                    <?php echo esc_html($photo['event']); ?>
                </span>
            </div>

            <!-- Card Body & Metadata -->
            <div class="mf-photo-card-body">
                <div class="mf-photo-photog-row">
                    <div class="mf-photog-info">
                        <div class="mf-photog-avatar-sm">
                            <i data-lucide="camera"></i>
                        </div>
                        <div>
                            <span class="mf-photog-name"><?php echo esc_html($photo['photographer']); ?></span>
                            <span class="mf-photog-handle"><?php echo esc_html($photo['photographerHandle']); ?></span>
                        </div>
                    </div>
                    <span class="mf-photo-res-badge"><?php echo esc_html($photo['resolution']); ?></span>
                </div>

                <h4 class="mf-photo-title"><?php echo esc_html($photo['title']); ?></h4>

                <!-- Bottom Purchase & Details Row -->
                <div class="mf-photo-bottom-row">
                    <div class="mf-photo-price-box">
                        <span class="mf-price-label">Foto Original HD</span>
                        <span class="mf-price-val"><?php echo esc_html($photo['price']); ?></span>
                    </div>

                    <div class="mf-photo-btn-group">
                        <button type="button" class="mf-btn-buy-pix" onclick="window.mfInstantBuyPhoto(<?php echo esc_js($photo['id']); ?>, '<?php echo esc_js($photo['title']); ?>', '<?php echo esc_js($photo['price']); ?>')">
                            <i data-lucide="zap"></i>
                            <span>Comprar PIX</span>
                        </button>
                        <button type="button" class="mf-btn-add-cart" onclick="window.mfAddToCart(<?php echo esc_js($photo['id']); ?>)" title="Adicionar ao Carrinho">
                            <i data-lucide="shopping-bag"></i>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    <?php endforeach; ?>
</div>
