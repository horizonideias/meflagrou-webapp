import { describe, it, expect, vi, beforeEach } from 'vitest';
import { whatsappGatewayService } from '../services/whatsappGatewayService';

describe('Pilar 2: WhatsApp Omnichannel Automation (Evolution API)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should format Brazilian phone numbers to clean E.164 JID', () => {
    expect(whatsappGatewayService.formatToWhatsAppJid('(34) 99999-8888')).toBe('5534999998888');
    expect(whatsappGatewayService.formatToWhatsAppJid('5534988887777')).toBe('5534988887777');
    expect(whatsappGatewayService.formatToWhatsAppJid('11912345678')).toBe('5511912345678');
  });

  it('should format and dispatch automated Flagra alert notifications', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ key: { id: 'msg_flagra_123' } }),
    });

    const result = await whatsappGatewayService.sendFlagraAlertNotification(
      '5534999998888',
      'Sunset Festival 2026',
      3,
      'Rafael Clicks',
      'https://meflagrou.com/event/1',
      'Lucas Ferreira'
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg_flagra_123');
  });

  it('should format and dispatch purchase confirmations with 8K download link', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ key: { id: 'msg_purchase_456' } }),
    });

    const result = await whatsappGatewayService.sendPurchaseConfirmation(
      '5534999998888',
      'ORDER-9988',
      2,
      39.80,
      'https://meflagrou.com/vault',
      'Isabela Rocha'
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg_purchase_456');
  });

  it('should handle offline fallback gracefully when Evolution API is waiting for connection', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await whatsappGatewayService.send2FACode('5534999998888', '123456');
    expect(result.success).toBe(false);
    expect(result.isSimulated).toBe(true);
  });
});
