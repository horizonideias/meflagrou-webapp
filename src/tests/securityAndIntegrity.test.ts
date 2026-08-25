import { describe, it, expect } from 'vitest';
import { 
  isValidCPF, 
  isValidEmail, 
  isValidPhone,
  formatWhatsAppPhone,
  generateWhatsAppOTP,
  sanitizeInput, 
  validateRegistrationForm 
} from '../utils/securityUtils';

describe('🛡️ Security & Authentication Hardening Tests', () => {
  describe('1. Brazilian CPF Modulo 11 Algorithm', () => {
    it('should validate correctly formatted and unformatted valid CPFs', () => {
      // Valid algorithmic CPFs
      expect(isValidCPF('52998224725')).toBe(true);
      expect(isValidCPF('529.982.247-25')).toBe(true);
      expect(isValidCPF('11144477735')).toBe(true);
      expect(isValidCPF('111.444.777-35')).toBe(true);
    });

    it('should reject CPFs with invalid lengths', () => {
      expect(isValidCPF('123')).toBe(false);
      expect(isValidCPF('1234567890')).toBe(false);
      expect(isValidCPF('123456789012')).toBe(false);
      expect(isValidCPF('')).toBe(false);
    });

    it('should reject repeated digit sequences (fraud prevention)', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
      expect(isValidCPF('000.000.000-00')).toBe(false);
      expect(isValidCPF('999.999.999-99')).toBe(false);
      expect(isValidCPF('222.222.222-22')).toBe(false);
    });

    it('should reject CPFs with wrong checksum digits', () => {
      expect(isValidCPF('123.456.789-00')).toBe(false);
      expect(isValidCPF('529.982.247-99')).toBe(false);
      expect(isValidCPF('111.444.777-00')).toBe(false);
    });
  });

  describe('2. WhatsApp Phone Validation & OTP Security', () => {
    it('should validate 10 and 11 digit Brazilian phone numbers', () => {
      expect(isValidPhone('(11) 98888-7777')).toBe(true);
      expect(isValidPhone('11988887777')).toBe(true);
      expect(isValidPhone('2122334455')).toBe(true);
    });

    it('should reject short or malformed phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('1199999')).toBe(false);
    });

    it('should format WhatsApp phone numbers with standard mask', () => {
      expect(formatWhatsAppPhone('11988887777')).toBe('(11) 98888-7777');
    });

    it('should generate valid 6-digit WhatsApp OTP tokens', () => {
      const otp = generateWhatsAppOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });
  });

  describe('3. Email RFC Standard Validation', () => {
    it('should accept valid email formats', () => {
      expect(isValidEmail('usuario@meflagrou.com')).toBe(true);
      expect(isValidEmail('contato.vip@festas.com.br')).toBe(true);
      expect(isValidEmail('fotografo_pro+tag@studio.io')).toBe(true);
    });

    it('should reject malformed emails', () => {
      expect(isValidEmail('usuario@')).toBe(false);
      expect(isValidEmail('@meflagrou.com')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('usuario@meflagrou')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('4. XSS & HTML Injection Sanitization', () => {
    it('should strip dangerous tags and script tags', () => {
      const malicious = '<script>alert("hacked")</script>Gabriel Santos';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toBe('alert(hacked)Gabriel Santos');
    });

    it('should strip HTML formatting tags', () => {
      const htmlInput = '<b>São Paulo</b> <i>SP</i>';
      expect(sanitizeInput(htmlInput)).toBe('São Paulo SP');
    });
  });

  describe('5. Registration Payload Integrity', () => {
    it('should reject missing or short names', () => {
      const res = validateRegistrationForm({
        name: 'G',
        cpf: '529.982.247-25',
        whatsapp: '(11) 98888-7777',
        email1: 'g@meflagrou.com',
        photoDataUrl: 'data:image/jpeg;base64,sample',
      });
      expect(res.isValid).toBe(false);
      expect(res.field).toBe('name');
    });

    it('should reject invalid CPFs in registration', () => {
      const res = validateRegistrationForm({
        name: 'Gabriel Santos',
        cpf: '111.111.111-11',
        whatsapp: '(11) 98888-7777',
        email1: 'gabriel@meflagrou.com',
        photoDataUrl: 'data:image/jpeg;base64,sample',
      });
      expect(res.isValid).toBe(false);
      expect(res.field).toBe('cpf');
    });

    it('should reject invalid WhatsApp phone numbers in registration', () => {
      const res = validateRegistrationForm({
        name: 'Gabriel Santos',
        cpf: '529.982.247-25',
        whatsapp: '1234',
        email1: 'gabriel@meflagrou.com',
        photoDataUrl: 'data:image/jpeg;base64,sample',
      });
      expect(res.isValid).toBe(false);
      expect(res.field).toBe('whatsapp');
    });

    it('should reject invalid email1 in registration', () => {
      const res = validateRegistrationForm({
        name: 'Gabriel Santos',
        cpf: '529.982.247-25',
        whatsapp: '(11) 98888-7777',
        email1: 'invalid-email',
        photoDataUrl: 'data:image/jpeg;base64,sample',
      });
      expect(res.isValid).toBe(false);
      expect(res.field).toBe('email1');
    });

    it('should reject missing selfie photo', () => {
      const res = validateRegistrationForm({
        name: 'Gabriel Santos',
        cpf: '529.982.247-25',
        whatsapp: '(11) 98888-7777',
        email1: 'gabriel@meflagrou.com',
        photoDataUrl: null,
      });
      expect(res.isValid).toBe(false);
      expect(res.field).toBe('photo');
    });

    it('should pass with complete, valid data', () => {
      const res = validateRegistrationForm({
        name: 'Gabriel Santos',
        cpf: '529.982.247-25',
        whatsapp: '(11) 98888-7777',
        email1: 'gabriel@meflagrou.com',
        email2: 'gabriel.secundario@gmail.com',
        photoDataUrl: 'data:image/jpeg;base64,sample',
      });
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });
});
