<?php
/**
 * Template Part: Story Bar
 *
 * @package meflagrou
 */

$stories = meflagrou_get_stories();
?>

<div class="mf-stories-carousel-container">
    <div class="mf-stories-track" id="mf-stories-track">
        <!-- New Story Upload Pill -->
        <div class="mf-story-card mf-story-upload-card" id="mf-add-story-btn">
            <div class="mf-story-thumb-box">
                <div class="mf-story-plus-circle">
                    <i data-lucide="plus"></i>
                </div>
            </div>
            <span class="mf-story-title">Seu Flagrante</span>
        </div>

        <?php foreach ($stories as $story): ?>
            <div class="mf-story-card <?php echo $story['active'] ? 'has-active-border' : ''; ?>" data-story-id="<?php echo esc_attr($story['id']); ?>">
                <div class="mf-story-thumb-box">
                    <img src="<?php echo esc_url($story['thumb']); ?>" alt="<?php echo esc_attr($story['title']); ?>" class="mf-story-img" />
                    <?php if ($story['active']): ?>
                        <span class="mf-story-live-tag">AO VIVO</span>
                    <?php endif; ?>
                </div>
                <span class="mf-story-title"><?php echo esc_html($story['title']); ?></span>
            </div>
        <?php endforeach; ?>
    </div>
</div>
