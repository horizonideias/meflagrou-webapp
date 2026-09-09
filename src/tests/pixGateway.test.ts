import { describe, it, expect } from 'vitest';
import { pixGatewayService } from '../services/pixGatewayService';

describe('Pilar 3: Gateway PIX Dinâmico & Split 90/9/1%', () => {
  it('should calculate exact 90% / 9% / 1% split breakdown', () => {
    const split = pixGatewayService.calculateSplit(100.00);
    expect(split.photographerAmount).toBe(90.00);
    expect(split.platformFee).toBe(9.00);
    expect(split.socialImpactFund).toBe(1.00);
    expect(split.photographerAmount + split.platformFee + split.socialImpactFund).toBe(100.00);
  });

  it('should calculate accurate split for irregular amounts', () => {
    const split = pixGatewayService.calculateSplit(19.90);
    expect(split.photographerAmount).toBe(17.91);
    expect(split.platformFee).toBe(1.79);
    expect(split.socialImpactFund).toBe(0.20);
    expect(Number((split.photographerAmount + split.platformFee + split.socialImpactFund).toFixed(2))).toBe(19.90);
  });

  it('should compute valid 4-character CRC16-CCITT checksum for EMV payloads', () => {
    const payload = '00020126360014br.gov.bcb.pix0114+5534999998888520400005303986540510.005802BR5916MEFLAGROU STUDIO6009SAO PAULO62070503***6304';
    const crc = pixGatewayService.computeCRC16(payload);
    expect(crc).toHaveLength(4);
    expect(/^[0-9A-F]{4}$/.test(crc)).toBe(true);
  });

  it('should generate a complete dynamic Pix transaction with valid QR code', () => {
    const tx = pixGatewayService.createDynamicPixTransaction(49.90);
    expect(tx.amount).toBe(49.90);
    expect(tx.status).toBe('pending');
    expect(tx.payload).toContain('br.gov.bcb.pix');
    expect(tx.qrCodeUrl).toContain('api.qrserver.com');
  });
});
