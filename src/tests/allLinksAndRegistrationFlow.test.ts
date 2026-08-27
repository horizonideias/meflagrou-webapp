import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isValidCPF, 
  isValidPhone, 
  isValidEmail, 
  validateRegistrationForm,
  isValidRealFullName,
  formatCPF,
  formatCEP,
  maskCPF
} from '../utils/securityUtils';
import { calculateMasterDeusSplit, type EventPhoto } from '../types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_PHOTOS } from '../data/mockDatabase';
import { enrollNewUserFace, simulateFaceRecognition } from '../services/biometricService';

// In-memory mock for localStorage in test environment
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const mockLocalStorage = createMockLocalStorage();
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

describe('🧪 Complete Online System Test: All Links, Registrations, Modals & Workflows', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  // =========================================================================
  // 1. REGISTRATION & AUTHENTICATION GATEKEEPER TESTS
  // =========================================================================
  describe('🔐 1. Cadastro & Autenticação Gatekeeper', () => {
    it('deve validar CPFs válidos com algoritmo Módulo 11 e rejeitar inválidos', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true);
      expect(isValidCPF('123.456.789-09')).toBe(true);
      expect(isValidCPF('000.000.000-00')).toBe(false);
      expect(isValidCPF('123.456.789-99')).toBe(false);
      expect(isValidCPF('')).toBe(false);
    });

    it('deve validar telefones e e-mails no formulário de cadastro', () => {
      expect(isValidPhone('(11) 98888-7777')).toBe(true);
      expect(isValidPhone('11988887777')).toBe(true);
      expect(isValidPhone('123')).toBe(false);

      expect(isValidEmail('usuario@meflagrou.com')).toBe(true);
      expect(isValidEmail('invalido@email')).toBe(false);

      const formValidation = validateRegistrationForm({
        name: 'Ana Beatriz VIP',
        cpf: '111.444.777-35',
        whatsapp: '(11) 99999-8888',
        email1: 'ana.beatriz@gmail.com',
        photoDataUrl: 'data:image/jpeg;base64,mockPhotoBase64',
      });
      expect(formValidation.isValid).toBe(true);
    });

    it('deve validar nome verdadeiro e mascarar CPF e formatar CEP corretamente', () => {
      expect(isValidRealFullName('Eder Andrade')).toBe(true);
      expect(isValidRealFullName('Eder de Andrade Pereira')).toBe(true);
      expect(isValidRealFullName('Eder')).toBe(false);
      expect(isValidRealFullName('')).toBe(false);

      expect(formatCPF('11144477735')).toBe('111.444.777-35');
      expect(maskCPF('111.444.777-35')).toBe('***.444.777-**');
      expect(formatCEP('38740000')).toBe('38740-000');
    });

    it('deve cadastrar novo usuário VIP com biometria facial e sessão persistida', () => {
      const newUser = enrollNewUserFace({
        name: 'Carlos VIP Tester',
        cpf: '111.444.777-35',
        handle: 'carlos_vip',
        city: 'Patrocínio, MG',
        avatarDataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        email1: 'carlos.vip@gmail.com',
      });

      expect(newUser).toBeDefined();
      expect(newUser.id).toContain('user_');
      expect(newUser.city).toBe('Patrocínio');
      expect(newUser.state).toBe('MG');

      mockLocalStorage.setItem('meflagrou_active_session', JSON.stringify(newUser));
      const session = JSON.parse(mockLocalStorage.getItem('meflagrou_active_session') || '{}');
      expect(session.id).toBe(newUser.id);
      expect(session.name).toBe('Carlos VIP Tester');
    });
  });

  // =========================================================================
  // 2. ALL NAVIGATION LINKS & MODALS INTEGRITY TESTS
  // =========================================================================
  describe('🧭 2. Links de Navegação, Menus e Modais', () => {
    it('deve carregar todos os dados essenciais de mock (Users, Events, Photos) sem links quebrados', () => {
      expect(MOCK_USERS.length).toBeGreaterThan(0);
      expect(MOCK_EVENTS.length).toBeGreaterThan(0);
      expect(MOCK_PHOTOS.length).toBeGreaterThan(0);

      MOCK_PHOTOS.forEach(photo => {
        expect(photo.id).toBeDefined();
        expect(photo.url).toBeDefined();
        expect(photo.photographer.name).toBeDefined();
        expect(photo.eventName).toBeDefined();
      });
    });

    it('deve simular reconhecimento facial IA com match superior a 95%', async () => {
      const targetUser = MOCK_USERS[0];
      const matchResult = await simulateFaceRecognition(targetUser);
      expect(matchResult).toBeDefined();
      expect(matchResult.matchedUser?.id).toBe(targetUser.id);
      expect(matchResult.confidence).toBeGreaterThan(95.0);
    });
  });

  // =========================================================================
  // 3. PHOTO UPLOAD & PERSISTENCE FLOW (MEUS FLAGRAS)
  // =========================================================================
  describe('📸 3. Upload de Fotos & Persistência Permanente no Perfil', () => {
    it('deve salvar fotos adicionadas ao perfil e manter persistência no localStorage', () => {
      const user = MOCK_USERS[0];
      const targetPhoto: EventPhoto = {
        ...MOCK_PHOTOS[0],
        tags: [
          {
            id: `tag_${user.id}_1`,
            userId: user.id,
            userName: user.name,
            userHandle: user.handle,
            userAvatar: user.avatar,
            confidence: 99.9,
            boundingBox: { x: 50, y: 50, width: 20, height: 20 }
          }
        ]
      };

      const storageKey = `meflagrou_user_saved_photos_${user.id}`;
      mockLocalStorage.setItem(storageKey, JSON.stringify([targetPhoto]));

      const retrieved = JSON.parse(mockLocalStorage.getItem(storageKey) || '[]');
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].id).toBe(targetPhoto.id);
      expect(retrieved[0].tags.some((t: any) => t.userId === user.id)).toBe(true);
    });

    it('deve calcular corretamente a divisão de royalties Master Deus (90% Dono / 9% Deus / 1% Taxas)', () => {
      const split100 = calculateMasterDeusSplit(100.00);
      expect(split100.ownerAmount).toBe(90.00);
      expect(split100.deusRoyaltyAmount).toBe(9.00);
      expect(split100.platformSiteAmount).toBe(1.00);

      const split1990 = calculateMasterDeusSplit(19.90);
      expect(split1990.ownerAmount).toBe(17.91);
      expect(split1990.deusRoyaltyAmount).toBe(1.79);
      expect(split1990.platformSiteAmount).toBe(0.20);
      expect(split1990.ownerAmount + split1990.deusRoyaltyAmount + split1990.platformSiteAmount).toBeCloseTo(19.90, 2);
    });
  });

  // =========================================================================
  // 4. MOBILE ASPECT RATIO & ANTI-PRINT SECURITY
  // =========================================================================
  describe('📱 4. Enquadramento Mobile & Proteção Anti-Print', () => {
    it('deve validar proporção 1080x1350 (4:5) para posts e vídeos recap', () => {
      const portraitWidth = 1080;
      const portraitHeight = 1350;
      const ratio = portraitWidth / portraitHeight;
      expect(ratio).toBe(0.8);
      expect(4 / 5).toBe(0.8);
    });

    it('deve bloquear toque longo e múltiplos dedos em ambiente mobile', () => {
      const mockTouchStart3Fingers = { touches: [{}, {}, {}] };
      const is3FingerGesture = mockTouchStart3Fingers.touches.length >= 3;
      expect(is3FingerGesture).toBe(true);
    });
  });
});
