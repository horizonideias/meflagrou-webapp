<?php
/**
 * Face ID Biometrics Recognition Engine
 *
 * @package meflagrou-core
 */

if (!defined('ABSPATH')) exit;

class Meflagrou_Biometrics_Face_ID {

    public static function init() {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
    }

    public static function register_routes() {
        register_rest_route('meflagrou/v1', '/biometrics/search', array(
            'methods'  => 'POST',
            'callback' => array(__CLASS__, 'rest_search_by_face'),
            'permission_callback' => '__return_true',
        ));
    }

    public static function rest_search_by_face($request) {
        $params = $request->get_json_params();
        $user_id = $params['userId'] ?? 1;

        // Simulated matches
        return rest_ensure_response(array(
            'success' => true,
            'matchesCount' => 4,
            'confidence' => 99.4,
            'message' => 'Encontradas 4 fotos com sua assinatura biométrica facial!',
        ));
    }
}
