<?php
/**
 * Custom Post Types for meflagrou Core
 *
 * @package meflagrou-core
 */

if (!defined('ABSPATH')) exit;

class Meflagrou_CPT_Flagrantes {

    public static function init() {
        self::register_post_types();
        self::register_taxonomies();
    }

    public static function register_post_types() {
        // 1. CPT Flagrantes (Photos)
        register_post_type('flagrante', array(
            'labels' => array(
                'name'               => __('Flagrantes', 'meflagrou-core'),
                'singular_name'      => __('Flagrante', 'meflagrou-core'),
                'add_new_item'       => __('Adicionar Novo Flagrante', 'meflagrou-core'),
                'edit_item'          => __('Editar Flagrante', 'meflagrou-core'),
                'all_items'          => __('Todos os Flagrantes', 'meflagrou-core'),
            ),
            'public'       => true,
            'has_archive'  => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-camera',
            'supports'     => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'rewrite'      => array('slug' => 'flagrantes'),
        ));

        // 2. CPT Eventos (Festivals & Clubs)
        register_post_type('evento_balada', array(
            'labels' => array(
                'name'          => __('Festivais & Clubs', 'meflagrou-core'),
                'singular_name' => __('Evento / Club', 'meflagrou-core'),
            ),
            'public'       => true,
            'has_archive'  => true,
            'show_in_rest' => true,
            'menu_icon'    => 'dashicons-location-alt',
            'supports'     => array('title', 'editor', 'thumbnail'),
            'rewrite'      => array('slug' => 'eventos'),
        ));
    }

    public static function register_taxonomies() {
        register_taxonomy('categoria_evento', array('flagrante'), array(
            'labels' => array(
                'name'          => __('Categorias de Evento', 'meflagrou-core'),
                'singular_name' => __('Categoria', 'meflagrou-core'),
            ),
            'hierarchical' => true,
            'show_in_rest' => true,
        ));
    }
}
