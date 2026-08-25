<?php
/**
 * Plugin Name: meflagrou Core
 * Plugin URI: https://meflagrou.com
 * Description: Plugin Oficial meflagrou.com - Motor de Custom Post Types, Autenticação por CPF e WhatsApp, Reconhecimento Facial Face ID 128-D, Proteção Anti-Print e Checkout PIX Instantâneo.
 * Version: 2.0.0
 * Author: DEUS Development Team
 * Author URI: https://meflagrou.com
 * License: GPLv2 or later
 * Text Domain: meflagrou-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MEFLAGROU_CORE_VERSION', '2.0.0');
define('MEFLAGROU_CORE_DIR', plugin_dir_path(__FILE__));
define('MEFLAGROU_CORE_URI', plugin_dir_url(__FILE__));

// Require Core Modules
require_once MEFLAGROU_CORE_DIR . 'includes/class-cpt-flagrantes.php';
require_once MEFLAGROU_CORE_DIR . 'includes/class-auth-cpf-whatsapp.php';
require_once MEFLAGROU_CORE_DIR . 'includes/class-biometrics-face-id.php';
require_once MEFLAGROU_CORE_DIR . 'includes/class-pix-checkout.php';

/**
 * Main Plugin Bootstrap Class
 */
class Meflagrou_Core {
    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }

    public function init() {
        // Initialize CPTs and Modules
        Meflagrou_CPT_Flagrantes::init();
        Meflagrou_Auth_WhatsApp_CPF::init();
        Meflagrou_Biometrics_Face_ID::init();
        Meflagrou_PIX_Checkout::init();
    }

    public function register_rest_routes() {
        register_rest_route('meflagrou/v1', '/feed', array(
            'methods'  => 'GET',
            'callback' => array($this, 'rest_get_feed'),
            'permission_callback' => '__return_true',
        ));
    }

    public function rest_get_feed($request) {
        $args = array(
            'post_type'      => 'flagrante',
            'posts_per_page' => 20,
            'post_status'    => 'publish',
        );

        $query = new WP_Query($args);
        $photos = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $photos[] = array(
                    'id'           => get_the_ID(),
                    'title'        => get_the_title(),
                    'image'        => get_the_post_thumbnail_url(get_the_ID(), 'meflagrou-hd') ?: '',
                    'photographer' => get_post_meta(get_the_ID(), '_meflagrou_photographer', true) ?: 'André Souza',
                    'price'        => get_post_meta(get_the_ID(), '_meflagrou_price', true) ?: 'R$ 19,90',
                    'event'        => get_post_meta(get_the_ID(), '_meflagrou_event', true) ?: 'Warung Beach Club',
                );
            }
            wp_reset_postdata();
        }

        return rest_ensure_response(array(
            'success' => true,
            'total'   => count($photos),
            'data'    => $photos,
        ));
    }
}

// Instantiate
Meflagrou_Core::get_instance();
