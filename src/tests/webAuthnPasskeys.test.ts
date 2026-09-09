import { describe, it, expect, beforeEach } from 'vitest';
import { webAuthnService } from '../services/webAuthnService';

describe('Pilar 6: WebAuthn & Passkeys Biometric Authentication', () => {
  beforeEach(() => {
    webAuthnService.clearStorage();
  });

  it('should register a new Passkey credential for a user', async () => {
    const passkey = await webAuthnService.registerPasskey('user_teste_1', 'Teste VIP');
    expect(passkey.id).toBeDefined();
    expect(passkey.type).toBe('public-key');
    expect(passkey.algorithm).toContain('ES256');

    const enrolled = webAuthnService.getEnrolledPasskeys('user_teste_1');
    expect(enrolled).toHaveLength(1);
    expect(enrolled[0].id).toBe(passkey.id);
  });

  it('should authenticate user successfully via Passkey', async () => {
    const authOk = await webAuthnService.authenticateWithPasskey('user_teste_2');
    expect(authOk).toBe(true);
  });
});
