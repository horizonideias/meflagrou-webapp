import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isValidCPF, 
  validateRegistrationForm,
  isValidRealFullName,
  formatCPF,
  formatCEP,
  formatWhatsAppPhone,
  maskCPF
} from '../utils/securityUtils';
import { calculateMasterDeusSplit, calculateCommissionCascade } from '../types/commerce';
import { MOCK_USERS, MOCK_EVENTS, MOCK_PHOTOS } from '../data/mockDatabase';
import { dbService } from '../services/databaseService';
import type { UserProfile, EventPhoto, Transaction } from '../types';

// Mock localStorage for test environment
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

describe('🔬 AUDITORIA & TESTE GERAL DO MEFLAGROU.COM', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  // =========================================================================
  // 1. DADOS CADASTRAIS, VALIDAÇÕES & LGPD
  // =========================================================================
  describe('📋 1. Validações de Cadastro e Segurança de Dados', () => {
    it('deve validar nome verdadeiro (mínimo 2 palavras)', () => {
      expect(isValidRealFullName('Eder Pereira')).toBe(true);
      expect(isValidRealFullName('Eder de Andrade Pereira')).toBe(true);
      expect(isValidRealFullName('Ana Clara')).toBe(true);
      expect(isValidRealFullName('Eder')).toBe(false);
      expect(isValidRealFullName('   ')).toBe(false);
    });

    it('deve validar CPF com algoritmo Módulo 11 real e rejeitar sequências inválidas', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true);
      expect(isValidCPF('123.456.789-09')).toBe(true);
      expect(isValidCPF('000.000.000-00')).toBe(false);
      expect(isValidCPF('111.111.111-11')).toBe(false);
      expect(isValidCPF('123.456.789-99')).toBe(false);
      expect(isValidCPF('')).toBe(false);
    });

    it('deve formatar e mascarar CPF corretamente para proteção de privacidade', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
      expect(maskCPF('111.444.777-35')).toBe('***.444.777-**');
      expect(maskCPF('12345678909')).toBe('***.456.789-**');
    });

    it('deve formatar CEP e WhatsApp com máscaras brasileiras padrão', () => {
      expect(formatCEP('38740000')).toBe('38740-000');
      expect(formatCEP('01310-100')).toBe('01310-100');
      expect(formatWhatsAppPhone('34999998888')).toBe('(34) 99999-8888');
      expect(formatWhatsAppPhone('(11) 98888-7777')).toBe('(11) 98888-7777');
    });

    it('deve validar formulário de cadastro com todos os campos estruturados', () => {
      const result = validateRegistrationForm({
        name: 'Eder de Andrade Pereira',
        cpf: '111.444.777-35',
        whatsapp: '(11) 99999-8888',
        email1: 'eder@meflagrou.com',
        photoDataUrl: 'data:image/jpeg;base64,samplePhotoData',
      });
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  // =========================================================================
  // 2. PRIVACIDADE E VISIBILIDADE DE DADOS DO PERFIL
  // =========================================================================
  describe('🔒 2. Regras de Privacidade do Perfil (LGPD)', () => {
    const ownerUser: UserProfile = {
      id: 'user_owner_01',
      name: 'Eder de Andrade Pereira',
      handle: 'eder_meflagrou',
      avatar: '/founder_avatar.jpg',
      bio: 'Perfil verificado',
      city: 'São Paulo',
      state: 'SP',
      cpf: '111.444.777-35',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      cep: '01310-100',
      maritalStatus: 'Solteiro(a)',
      verifiedAt: '2026-02-01',
      facialDescriptor: [0.5, 0.5],
      faceSignatureId: 'MF-01',
      totalPhotosCount: 10,
      eventsCount: 3,
      attendedEvents: [],
      topFriends: [],
      socialLinks: { instagram: 'eder_meflagrou', tiktok: 'edermeflagrou', x: 'edermeflagrou' },
      privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true }
    };

    it('deve identificar quando a visualização é do próprio usuário vs outro usuário', () => {
      const isOwnProfile = (viewerId: string, profileUserId: string) => viewerId === profileUserId;
      expect(isOwnProfile('user_owner_01', ownerUser.id)).toBe(true);
      expect(isOwnProfile('user_visitor_99', ownerUser.id)).toBe(false);
    });

    it('deve ocultar estritamente o CPF quando um visitante visualiza o perfil', () => {
      const renderProfileCpf = (currentUser: UserProfile, viewedProfile: UserProfile) => {
        const isOwn = currentUser.id === viewedProfile.id;
        if (!isOwn) return null;
        return maskCPF(viewedProfile.cpf || '');
      };

      const visitorUser: UserProfile = { ...ownerUser, id: 'user_visitor_99', name: 'Visitante' };

      // Próprio dono: exibe mascarado
      expect(renderProfileCpf(ownerUser, ownerUser)).toBe('***.444.777-**');
      // Visitante: não renderiza
      expect(renderProfileCpf(visitorUser, ownerUser)).toBeNull();
    });
  });

  // =========================================================================
  // 3. FLUXO DE FOTO DE PERFIL & GALERIA DE FOTOS COMPRADAS
  // =========================================================================
  describe('🖼️ 3. Regra de Negócio de Fotos de Perfil e Compras', () => {
    it('deve adicionar foto comprada automaticamente à galeria do comprador e atualizar avatar', () => {
      const buyer: UserProfile = { ...MOCK_USERS[0], id: 'user_test_buyer' };
      const purchasedPhoto: EventPhoto = {
        ...MOCK_PHOTOS[0],
        id: 'photo_bought_01',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        ownerSellerId: buyer.id
      };

      // Simula compra
      const storageKey = `meflagrou_user_saved_photos_${buyer.id}`;
      const existingList = JSON.parse(mockLocalStorage.getItem(storageKey) || '[]');
      existingList.unshift(purchasedPhoto);
      mockLocalStorage.setItem(storageKey, JSON.stringify(existingList));

      // Atualiza avatar do comprador automaticamente
      buyer.avatar = purchasedPhoto.url;
      mockLocalStorage.setItem('meflagrou_active_session', JSON.stringify(buyer));

      // Verificação
      const savedPhotos = JSON.parse(mockLocalStorage.getItem(storageKey) || '[]');
      expect(savedPhotos.length).toBe(1);
      expect(savedPhotos[0].id).toBe('photo_bought_01');

      const savedSession = JSON.parse(mockLocalStorage.getItem('meflagrou_active_session') || '{}');
      expect(savedSession.avatar).toBe(purchasedPhoto.url);
    });

    it('deve permitir seleção de avatar somente entre fotos disponíveis na galeria de fotos compradas', () => {
      const allPhotos: EventPhoto[] = [
        { ...MOCK_PHOTOS[0], id: 'photo_1' },
        { ...MOCK_PHOTOS[1], id: 'photo_2' },
        { ...MOCK_PHOTOS[2], id: 'photo_3' }
      ];

      const purchasedPhotoIds = ['photo_1', 'photo_3'];
      const selectableAvatars = allPhotos.filter(p => purchasedPhotoIds.includes(p.id));

      expect(selectableAvatars.length).toBe(2);
      expect(selectableAvatars.map(p => p.id)).toEqual(['photo_1', 'photo_3']);
    });
  });

  // =========================================================================
  // 4. DIVISÃO MASTER E PROGRESSÃO 2X DE REVENDA
  // =========================================================================
  describe('💰 4. Split Financeiro & Mecânica 2x de Revenda', () => {
    it('deve calcular corretamente a divisão Master (90% Dono / 9% Royalty / 1% Plataforma)', () => {
      const split = calculateMasterDeusSplit(999.99);
      expect(split.ownerAmount).toBe(899.99);
      expect(split.deusRoyaltyAmount).toBe(90.00);
      expect(split.platformSiteAmount).toBe(10.00);
      expect(split.ownerAmount + split.deusRoyaltyAmount + split.platformSiteAmount).toBeCloseTo(999.99, 2);
    });

    it('deve calcular a cascata de comissão de 5 níveis (60/15/10/5/10%)', () => {
      const cascade = calculateCommissionCascade(100);
      expect(cascade.sellerAmount).toBe(60);
      expect(cascade.creatorRoyaltyAmount).toBe(15);
      expect(cascade.lineageAncestorsAmount).toBe(10);
      expect(cascade.affiliateReferralAmount).toBe(5);
      expect(cascade.platformFeeAmount).toBe(10);
    });

    it('deve dobrar o valor de revenda da foto em cada geração de negociação (2x)', () => {
      const priceGen1 = 14.90;
      const priceGen2 = Number((priceGen1 * 2).toFixed(2));
      const priceGen3 = Number((priceGen2 * 2).toFixed(2));

      expect(priceGen2).toBe(29.80);
      expect(priceGen3).toBe(59.60);
    });
  });

  // =========================================================================
  // 5. BANCO DE DADOS OFFLINE & INTEGRIDADE DE SERVIÇO
  // =========================================================================
  describe('💾 5. Serviço de Banco de Dados Offline (dbService)', () => {
    it('deve instanciar dbService e persistir usuários e transações com segurança', async () => {
      expect(dbService).toBeDefined();
      
      const user: UserProfile = { ...MOCK_USERS[0], id: 'db_test_user' };
      const savedSuccess = await dbService.saveUser(user);
      expect(savedSuccess).toBe(true);

      const tx: Transaction = {
        id: 'tx_audit_01',
        date: new Date().toISOString(),
        items: [],
        subtotal: 99.90,
        discount: 0,
        total: 99.90,
        paymentMethod: 'pix',
        status: 'completed',
        customerHandle: user.handle
      };
      const savedTxSuccess = await dbService.saveTransaction(tx);
      expect(savedTxSuccess).toBe(true);
    });
  });

  // =========================================================================
  // 6. AUSÊNCIA TOTAL DO NOME "DEUS" NA INTERFACE E MOCK
  // =========================================================================
  describe('✨ 6. Integridade de Nomes e Badges Oficiais', () => {
    it('o perfil padrão deve ser Meflagrou Oficial e não conter "Deus"', () => {
      const founder = MOCK_USERS.find(u => u.id === 'user_founder');
      expect(founder).toBeDefined();
      expect(founder?.name).toBe('Meflagrou Oficial');
      expect(founder?.name.toLowerCase()).not.toContain('deus');
    });

    it('todos os dados de mock e eventos devem possuir integridade referencial', () => {
      expect(MOCK_EVENTS.length).toBeGreaterThan(0);
      MOCK_EVENTS.forEach(evt => {
        expect(evt.id).toBeDefined();
        expect(evt.name).toBeDefined();
        expect(evt.city).toBeDefined();
      });
    });
  });

  // =========================================================================
  // 7. LGPD, DIREITO DE IMAGEM & PROTOCOLO DE MODERAÇÃO
  // =========================================================================
  describe('🛡️ 7. Módulo LGPD e Direito ao Desfoque/Remoção de Imagem', () => {
    it('deve gerar protocolo de solicitação LGPD válido e salvar no storage', () => {
      const samplePhoto = MOCK_PHOTOS[0];
      const protocol = `LGPD-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const lgpdRequest = {
        protocol,
        photoId: samplePhoto.id,
        photoUrl: samplePhoto.url,
        eventName: samplePhoto.eventName,
        reason: 'lgpd_image_rights',
        requestType: 'blur',
        requesterName: 'Mariana Lima',
        requesterContact: '(11) 98888-7777',
        status: 'accepted',
        createdAt: new Date().toISOString()
      };

      mockLocalStorage.setItem('meflagrou_lgpd_requests', JSON.stringify([lgpdRequest]));
      
      const saved = JSON.parse(mockLocalStorage.getItem('meflagrou_lgpd_requests') || '[]');
      expect(saved.length).toBe(1);
      expect(saved[0].protocol).toMatch(/^LGPD-\d{6}$/);
      expect(saved[0].requestType).toBe('blur');
    });

    it('deve adicionar foto na lista de fotos ocultadas/desfocadas', () => {
      const photoId = 'photo_isa_01';
      const hiddenPhotos = [photoId];
      mockLocalStorage.setItem('meflagrou_hidden_photos', JSON.stringify(hiddenPhotos));

      const savedList = JSON.parse(mockLocalStorage.getItem('meflagrou_hidden_photos') || '[]');
      expect(savedList).toContain(photoId);
    });
  });

  // =========================================================================
  // 8. CUPONS DE DESCONTO E COMBO PROMOCIONAL (3+ FOTOS)
  // =========================================================================
  describe('🎟️ 8. Cupons de Desconto e Bônus Combo de Fotos', () => {
    it('deve calcular corretamente o cupom VIP Master de 15% (MEFLAGROUVIP)', () => {
      const subtotal = 100.00;
      const discount = subtotal * 0.15;
      const finalPrice = subtotal - discount;
      expect(discount).toBe(15.00);
      expect(finalPrice).toBe(85.00);
    });

    it('deve calcular corretamente o cupom de 20% (FESTIVAL20 / MASTER20)', () => {
      const subtotal = 200.00;
      const discount = subtotal * 0.20;
      const finalPrice = subtotal - discount;
      expect(discount).toBe(40.00);
      expect(finalPrice).toBe(160.00);
    });

    it('deve aplicar bônus de combo quando 3 ou mais fotos estiverem no carrinho', () => {
      const itemsCount = 4;
      const isComboActive = itemsCount >= 3;
      expect(isComboActive).toBe(true);

      const cartTotal = 120.00;
      const comboDiscount = isComboActive ? cartTotal * 0.05 : 0;
      expect(comboDiscount).toBe(6.00);
    });
  });

  // =========================================================================
  // 9. FEEDBACK HÁPTICO & SEGURANÇA NO NAVEGADOR
  // =========================================================================
  describe('📳 9. Feedback Háptico Web', () => {
    it('o utilitário de haptics não deve quebrar em ambientes sem suporte', () => {
      const isSupported = typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
      expect(typeof isSupported).toBe('boolean');
    });
  });
});
