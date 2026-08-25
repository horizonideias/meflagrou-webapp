import { describe, it, expect } from 'vitest';
import { 
  simulateFaceRecognition, 
  findPhotosForUser, 
  enrollNewUserFace 
} from '../services/biometricService';
import { MOCK_USERS } from '../data/mockDatabase';

describe('Biometric Face ID Engine & AI Recognition', () => {
  it('should recognize and match user with high biometric confidence (>95%)', async () => {
    const founder = MOCK_USERS[0];
    expect(founder).toBeDefined();

    const result = await simulateFaceRecognition(founder);
    expect(result).toBeDefined();
    expect(result.matchedUser?.id).toBe(founder.id);
    expect(result.confidence).toBeGreaterThan(95.0);
    expect(result.faceMetrics.symmetry).toBeGreaterThan(0.9);
  });

  it('should find tagged photos for a given user', () => {
    const founder = MOCK_USERS[0];
    const photos = findPhotosForUser(founder.id);
    expect(Array.isArray(photos)).toBe(true);
    expect(photos.length).toBeGreaterThan(0);
    
    // Each photo returned should contain a tag for this user
    photos.forEach(photo => {
      const hasTag = photo.tags.some(t => t.userId === founder.id);
      expect(hasTag).toBe(true);
    });
  });

  it('should enroll a new user profile with full registration fields (Nome, CPF, Endereço, E-mails, Selfie)', () => {
    const newProfile = enrollNewUserFace({
      name: 'Gabriel Alencar Rocha',
      cpf: '123.456.789-00',
      address: 'Av. Paulista, 1500 - Bela Vista',
      email1: 'gabriel.principal@gmail.com',
      email2: 'gabriel.backup@outlook.com',
      handle: 'gabriel_alencar_vip',
      city: 'São Paulo, SP',
      avatarDataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    expect(newProfile).toBeDefined();
    expect(newProfile.id).toContain('user_');
    expect(newProfile.name).toBe('Gabriel Alencar Rocha');
    expect(newProfile.cpf).toBe('123.456.789-00');
    expect(newProfile.address).toBe('Av. Paulista, 1500 - Bela Vista');
    expect(newProfile.email1).toBe('gabriel.principal@gmail.com');
    expect(newProfile.email2).toBe('gabriel.backup@outlook.com');
    expect(newProfile.email).toBe('gabriel.principal@gmail.com');
    expect(newProfile.handle).toBe('gabriel_alencar_vip');
    expect(newProfile.city).toBe('São Paulo');
    expect(newProfile.state).toBe('SP');
    expect(newProfile.faceSignatureId).toBeDefined();
    expect(newProfile.faceSignatureId).toContain('MF-BIO-');
    expect(newProfile.facialDescriptor).toBeDefined();
    expect(newProfile.facialDescriptor.length).toBe(10);
  });
});
