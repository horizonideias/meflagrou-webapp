<?php
/**
 * meflagrou.com - Theme Functions and Definitions
 *
 * @package meflagrou
 * @version 2.0.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('MEFLAGROU_THEME_VERSION', '2.0.0');
define('MEFLAGROU_THEME_DIR', get_template_directory());
define('MEFLAGROU_THEME_URI', get_template_directory_uri());

/**
 * 1. Theme Setup
 */
function meflagrou_theme_setup() {
    // Make theme available for translation
    load_theme_textdomain('meflagrou', MEFLAGROU_THEME_DIR . '/languages');

    // Add default posts and comments RSS feed links to head
    add_theme_support('automatic-feed-links');

    // Title tag management
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and custom post types
    add_theme_support('post-thumbnails');

    // Custom image sizes for event photography
    add_image_size('meflagrou-story', 400, 700, true);
    add_image_size('meflagrou-card', 600, 750, true);
    add_image_size('meflagrou-hd', 1920, 1080, false);
    add_image_size('meflagrou-avatar', 150, 150, true);

    // Register primary navigation
    register_nav_menus(array(
        'primary-nav' => __('Menu Superior Principal', 'meflagrou'),
        'mobile-nav'  => __('Menu Flutuante Mobile', 'meflagrou'),
        'footer-nav'  => __('Menu do Rodapé', 'meflagrou'),
    ));

    // HTML5 markup support
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ));

    // Custom Logo support
    add_theme_support('custom-logo', array(
        'height'      => 80,
        'width'       => 280,
        'flex-height' => true,
        'flex-width'  => true,
    ));
}
add_action('after_setup_theme', 'meflagrou_theme_setup');

/**
 * 2. Enqueue Styles and Scripts
 */
function meflagrou_enqueue_assets() {
    // Google Fonts (Inter)
    wp_enqueue_style(
        'meflagrou-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
        array(),
        null
    );

    // Lucide Icons (CDN)
    wp_enqueue_script(
        'lucide-icons',
        'https://unpkg.com/lucide@latest',
        array(),
        '0.470.0',
        false
    );

    // Canvas Confetti for celebrations
    wp_enqueue_script(
        'canvas-confetti',
        'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
        array(),
        '1.9.3',
        true
    );

    // Theme Main Stylesheet
    wp_enqueue_style(
        'meflagrou-style',
        get_stylesheet_uri(),
        array(),
        MEFLAGROU_THEME_VERSION
    );

    // Theme Custom Cyberpunk CSS
    wp_enqueue_style(
        'meflagrou-app-css',
        MEFLAGROU_THEME_URI . '/assets/css/meflagrou.css',
        array('meflagrou-style'),
        MEFLAGROU_THEME_VERSION
    );

    // Theme Interactive JavaScript App
    wp_enqueue_script(
        'meflagrou-app-js',
        MEFLAGROU_THEME_URI . '/assets/js/meflagrou-app.js',
        array('jquery', 'lucide-icons', 'canvas-confetti'),
        MEFLAGROU_THEME_VERSION,
        true
    );

    // Pass Dynamic Data to Frontend JS
    $current_user = wp_get_current_user();
    $is_logged_in = is_user_logged_in();

    $user_data = array(
        'isLoggedIn' => $is_logged_in,
        'id'         => $is_logged_in ? $current_user->ID : null,
        'name'       => $is_logged_in ? $current_user->display_name : 'Convidado VIP',
        'handle'     => $is_logged_in ? $current_user->user_login : 'convidado',
        'avatar'     => $is_logged_in ? get_avatar_url($current_user->ID) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        'cpf'        => $is_logged_in ? get_user_meta($current_user->ID, 'meflagrou_cpf', true) : '',
        'whatsapp'   => $is_logged_in ? get_user_meta($current_user->ID, 'meflagrou_whatsapp', true) : '',
    );

    wp_localize_script('meflagrou-app-js', 'meflagrouConfig', array(
        'ajaxUrl'   => admin_url('admin-ajax.php'),
        'restUrl'   => esc_url_raw(rest_url('meflagrou/v1/')),
        'nonce'     => wp_create_nonce('wp_rest'),
        'siteUrl'   => home_url(),
        'themeUrl'  => MEFLAGROU_THEME_URI,
        'user'      => $user_data,
        'security'  => array(
            'antiPrintEnabled' => true,
            'privacyCurtain'   => true,
        ),
    ));
}
add_action('wp_enqueue_scripts', 'meflagrou_enqueue_assets');

/**
 * 3. Fallback Mock Data Provider (If Database is freshly installed)
 */
function meflagrou_get_sample_photos() {
    return array(
        array(
            'id' => 1,
            'title' => 'Vintage Culture Live Set @ Warung Beach Club',
            'image' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
            'photographer' => 'André Souza',
            'photographerHandle' => '@andresouza.photo',
            'price' => 'R$ 19,90',
            'resolution' => '50.1 MP RAW Sony A1',
            'event' => 'Warung Beach Club Neon 2026',
            'date' => '23 de Agosto de 2026',
            'likes' => 384,
            'tags' => array(
                array('name' => 'Isabela Rocha', 'handle' => 'isa_rocha', 'x' => 45, 'y' => 30),
                array('name' => 'Lucas Ferreira', 'handle' => 'lucas.flg', 'x' => 70, 'y' => 35),
            ),
        ),
        array(
            'id' => 2,
            'title' => 'Mainstage Lights & Laser @ Laroc Club Valinhos',
            'image' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
            'photographer' => 'Marina Silva',
            'photographerHandle' => '@marina.lens',
            'price' => 'R$ 22,90',
            'resolution' => '61.0 MP Canon R5C',
            'event' => 'Laroc Club Open Air',
            'date' => '22 de Agosto de 2026',
            'likes' => 512,
            'tags' => array(
                array('name' => 'Camila Santos', 'handle' => 'camilasantos', 'x' => 52, 'y' => 28),
            ),
        ),
        array(
            'id' => 3,
            'title' => 'Green Valley Stage Pyro & Crowd @ Camboriú',
            'image' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
            'photographer' => 'Thiago Lima',
            'photographerHandle' => '@thiagolima.raw',
            'price' => 'R$ 18,90',
            'resolution' => '45.7 MP Nikon Z9',
            'event' => 'Green Valley Festival',
            'date' => '21 de Agosto de 2026',
            'likes' => 297,
            'tags' => array(
                array('name' => 'Rafael Silva', 'handle' => 'rafaelsilva', 'x' => 38, 'y' => 40),
            ),
        ),
        array(
            'id' => 4,
            'title' => 'Privilège Sunset Session @ Ilhabela SP',
            'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
            'photographer' => 'Beatriz Costa',
            'photographerHandle' => '@biacosta_click',
            'price' => 'R$ 19,90',
            'resolution' => '50.1 MP Sony A1',
            'event' => 'Sunset Privilège VIP',
            'date' => '20 de Agosto de 2026',
            'likes' => 420,
            'tags' => array(
                array('name' => 'DEUS Master', 'handle' => 'deus_official', 'x' => 50, 'y' => 32),
            ),
        ),
    );
}

/**
 * 4. Helper to get stories data
 */
function meflagrou_get_stories() {
    return array(
        array(
            'id' => 'st_1',
            'title' => 'Warung Beach',
            'thumb' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=250&q=80',
            'photog' => 'André Souza',
            'active' => true,
        ),
        array(
            'id' => 'st_2',
            'title' => 'Laroc Club',
            'thumb' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=250&q=80',
            'photog' => 'Marina Silva',
            'active' => true,
        ),
        array(
            'id' => 'st_3',
            'title' => 'Green Valley',
            'thumb' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=250&q=80',
            'photog' => 'Thiago Lima',
            'active' => false,
        ),
        array(
            'id' => 'st_4',
            'title' => 'Privilège Sunset',
            'thumb' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=250&q=80',
            'photog' => 'Beatriz Costa',
            'active' => true,
        ),
        array(
            'id' => 'st_5',
            'title' => 'Cafe de La Musique',
            'thumb' => 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=250&q=80',
            'photog' => 'Felipe Prado',
            'active' => false,
        ),
    );
}
