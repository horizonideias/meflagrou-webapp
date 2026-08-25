<?php
/**
 * meflagrou.com - Index Archive Template
 *
 * @package meflagrou
 * @version 2.0.0
 */

get_header(); ?>

<main id="primary" class="mf-archive-site">
    <div class="mf-container" style="padding-top: 30px; padding-bottom: 50px;">
        
        <header class="mf-archive-header" style="margin-bottom: 24px;">
            <h1 class="mf-archive-title" style="font-size: 1.6rem; font-weight: 900; color: #ffffff;">
                <?php single_post_title(); ?>
            </h1>
            <p style="color: var(--text-secondary); font-size: 0.86rem;">
                Explore nossa cobertura completa de flagrantes em alta definição.
            </p>
        </header>

        <div class="mf-feed-cards-grid">
            <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class('mf-photo-card'); ?>>
                    <div class="mf-photo-media-wrapper">
                        <?php if (has_post_thumbnail()) : ?>
                            <?php the_post_thumbnail('meflagrou-card', array('class' => 'mf-photo-main-img')); ?>
                        <?php else: ?>
                            <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" class="mf-photo-main-img" alt="<?php the_title_attribute(); ?>" />
                        <?php endif; ?>
                    </div>
                    <div class="mf-photo-card-body">
                        <h4 class="mf-photo-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
                        <div class="mf-photo-bottom-row">
                            <span class="mf-price-val">R$ 19,90</span>
                            <a href="<?php the_permalink(); ?>" class="mf-btn-buy-pix">Ver Detalhes</a>
                        </div>
                    </div>
                </article>
            <?php endwhile; else: ?>
                <?php get_template_part('template-parts/content', 'feed-grid'); ?>
            <?php endif; ?>
        </div>

    </div>
</main>

<?php get_footer(); ?>
