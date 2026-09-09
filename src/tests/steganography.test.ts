import { describe, it, expect } from 'vitest';
import { steganographyService } from '../services/steganographyService';

describe('Pilar 6: Invisible Steganography & Forensic Watermarking', () => {
  it('should generate a valid forensic watermark session token', () => {
    const token = steganographyService.generateWatermarkToken('user_isa_rocha');
    expect(token).toContain('MF-SIG-');
    expect(steganographyService.verifyWatermarkToken(token)).toBe(true);
  });

  it('should reject invalid or truncated tokens', () => {
    expect(steganographyService.verifyWatermarkToken('INVALID')).toBe(false);
    expect(steganographyService.verifyWatermarkToken('MF-SIG-')).toBe(false);
  });
});
