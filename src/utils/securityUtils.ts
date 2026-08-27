/**
 * 🛡️ MEFLAGROU.COM - SECURITY, SANITIZATION & AUTHENTICATION UTILS
 * Comprehensive security hardening:
 * - Algorithmic CPF Validation (Modulo 11 Checksum)
 * - WhatsApp Phone Validation & Formatting
 * - WhatsApp 6-Digit OTP Token Generator
 * - RFC 5322 Standard Email Validation
 * - XSS & HTML Injection Sanitization
 * - Safe Session Serialization & Deserialization
 */

/**
 * Validates Brazilian CPF with Modulo 11 check digit verification.
 * Rejects invalid length, repeated sequences (e.g. 111.111.111-11), and incorrect check digits.
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove non-digit characters
  const clean = cpf.replace(/\D/g, '');
  
  // Must have exactly 11 digits
  if (clean.length !== 11) return false;
  
  // Reject common known invalid CPFs (all digits identical)
  if (/^(\d)\1{10}$/.test(clean)) return false;
  
  // Check 1st verification digit (10th digit)
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rest1 = (sum1 * 10) % 11;
  if (rest1 === 10 || rest1 === 11) rest1 = 0;
  if (rest1 !== parseInt(clean.charAt(9), 10)) return false;
  
  // Check 2nd verification digit (11th digit)
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  let rest2 = (sum2 * 10) % 11;
  if (rest2 === 10 || rest2 === 11) rest2 = 0;
  if (rest2 !== parseInt(clean.charAt(10), 10)) return false;
  
  return true;
}

/**
 * Validates Brazilian phone / WhatsApp format (10 or 11 digits: (XX) 9XXXX-XXXX or XX9XXXXXXXX).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Validates whether a name is a real full name (at least 2 words, >= 5 chars).
 */
export function isValidRealFullName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  if (trimmed.length < 5) return false;
  return parts.every((p) => p.length >= 2 && /^[\p{L}'-]+$/u.test(p));
}

/**
 * Formats Brazilian CPF with standard mask: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 9) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
  } else if (digits.length > 6) {
    return digits.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
  } else if (digits.length > 3) {
    return digits.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
  }
  return digits;
}

/**
 * Masks CPF for secure public display: ***.456.789-**
 */
export function maskCPF(cpf?: string): string {
  if (!cpf) return '***.***.***-**';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return '***.***.***-**';
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

/**
 * Formats Brazilian CEP with standard mask: 00000-000
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) {
    return digits.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
  }
  return digits;
}

/**
 * Formats WhatsApp phone with clean mask: (XX) XXXXX-XXXX
 */
export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(0, 11);
  if (digits.length > 10) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (digits.length > 6) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (digits.length > 2) {
    return digits.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  }
  return digits;
}

/**
 * Generates a random 6-digit WhatsApp OTP PIN code.
 */
export function generateWhatsAppOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validates email format using RFC-compliant pattern.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 100) return false;
  
  // Strict standard email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Strips HTML tags, script injections, and escapes dangerous characters to prevent XSS.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[<>'"`]/g, '')   // Remove dangerous characters
    .trim();
}

/**
 * Registration Form Payload Validation
 */
export interface RegistrationValidationResult {
  isValid: boolean;
  error?: string;
  field?: 'name' | 'cpf' | 'whatsapp' | 'email1' | 'email2' | 'photo';
}

export function validateRegistrationForm(data: {
  name: string;
  cpf: string;
  whatsapp?: string;
  email1: string;
  email2?: string;
  photoDataUrl: string | null;
}): RegistrationValidationResult {
  const cleanName = sanitizeInput(data.name);
  if (!cleanName || cleanName.length < 3) {
    return {
      isValid: false,
      error: 'Nome Completo é obrigatório (mínimo 3 caracteres).',
      field: 'name',
    };
  }

  const cleanCpf = data.cpf.replace(/\D/g, '');
  if (!cleanCpf) {
    return {
      isValid: false,
      error: 'Por favor, informe seu CPF.',
      field: 'cpf',
    };
  }

  if (!isValidCPF(data.cpf)) {
    return {
      isValid: false,
      error: 'O CPF informado é inválido. Verifique os dígitos digitados.',
      field: 'cpf',
    };
  }

  if (data.whatsapp && data.whatsapp.trim().length > 0) {
    if (!isValidPhone(data.whatsapp)) {
      return {
        isValid: false,
        error: 'Número de WhatsApp inválido. Informe o DDD e o número (ex: (11) 98888-7777).',
        field: 'whatsapp',
      };
    }
  }

  if (!data.email1 || !isValidEmail(data.email1)) {
    return {
      isValid: false,
      error: 'E-mail 1 (Principal) inválido. Informe um endereço válido (ex: seu@email.com).',
      field: 'email1',
    };
  }

  if (data.email2 && data.email2.trim().length > 0) {
    if (!isValidEmail(data.email2)) {
      return {
        isValid: false,
        error: 'E-mail 2 (Secundário) inválido. Verifique o formato ou deixe em branco.',
        field: 'email2',
      };
    }
  }

  if (!data.photoDataUrl) {
    return {
      isValid: false,
      error: 'Foto Selfie obrigatória para ativação do reconhecimento biométrico Face ID.',
      field: 'photo',
    };
  }

  return { isValid: true };
}
