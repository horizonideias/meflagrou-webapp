<?php
/**
 * PIX Instant Checkout Engine (Banco Central Standard)
 *
 * @package meflagrou-core
 */

if (!defined('ABSPATH')) exit;

class Meflagrou_PIX_Checkout {

    public static function init() {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
    }

    public static function register_routes() {
        register_rest_route('meflagrou/v1', '/checkout/pix', array(
            'methods'  => 'POST',
            'callback' => array(__CLASS__, 'rest_generate_pix'),
            'permission_callback' => '__return_true',
        ));
    }

    public static function rest_generate_pix($request) {
        $params = $request->get_json_params();
        $amount = sanitize_text_field($params['amount'] ?? '19.90');
        $photo_id = intval($params['photoId'] ?? 1);

        $payload = '00020126580014br.gov.bcb.pix0136meflagrou-pagamento-instantaneo-pix520400005303986540' . sprintf("%0.2f", floatval($amount)) . '5802BR5913MEFLAGROU COM6009SAO PAULO62070503***6304';
        
        return rest_ensure_response(array(
            'success'   => true,
            'txid'      => 'MF-PIX-' . uniqid(),
            'amount'    => $amount,
            'qrCodeUrl' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode($payload),
            'copyPaste' => $payload,
        ));
    }
}
