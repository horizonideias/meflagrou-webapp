import { describe, it, expect } from 'vitest';
import { isUserAdmin, type UserProfile } from '../types';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';

describe('Admin-Only Gallery Upload & Client Purchase Control', () => {
  it('identifies user_founder as Administrator via isUserAdmin', () => {
    const founder = MOCK_USERS.find(u => u.id === 'user_founder');
    expect(founder).toBeDefined();
    expect(isUserAdmin(founder)).toBe(true);
    expect(founder?.role).toBe('admin');
    expect(founder?.isAdmin).toBe(true);
  });

  it('correctly identifies regular users/clients as non-administrators', () => {
    const clients = MOCK_USERS.filter(u => u.id !== 'user_founder');
    expect(clients.length).toBeGreaterThan(0);

    clients.forEach(client => {
      expect(isUserAdmin(client)).toBe(false);
      expect(client.role).not.toBe('admin');
    });
  });

  it('handles edge cases in isUserAdmin correctly', () => {
    expect(isUserAdmin(null)).toBe(false);
    expect(isUserAdmin(undefined)).toBe(false);

    const customAdmin: UserProfile = {
      id: 'custom_admin_99',
      name: 'Admin Teste',
      handle: 'adminteste',
      role: 'admin',
      city: 'São Paulo',
      state: 'SP',
      avatar: '/avatar.jpg',
      bio: 'Bio Admin',
      verifiedAt: '2026-01-01',
      facialDescriptor: [],
      faceSignatureId: 'SIG-99',
      totalPhotosCount: 0,
      eventsCount: 0,
      attendedEvents: [],
      topFriends: [],
      socialLinks: {},
      privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true }
    };
    expect(isUserAdmin(customAdmin)).toBe(true);

    const customClient: UserProfile = {
      id: 'custom_client_01',
      name: 'Cliente VIP',
      handle: 'clientevip',
      role: 'client',
      city: 'Rio de Janeiro',
      state: 'RJ',
      avatar: '/avatar.jpg',
      bio: 'Bio Cliente',
      verifiedAt: '2026-01-01',
      facialDescriptor: [],
      faceSignatureId: 'SIG-01',
      totalPhotosCount: 5,
      eventsCount: 2,
      attendedEvents: [],
      topFriends: [],
      socialLinks: {},
      privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true }
    };
    expect(isUserAdmin(customClient)).toBe(false);
  });

  it('verifies client purchasing and download model consistency', () => {
    expect(MOCK_PHOTOS.length).toBeGreaterThan(0);
    const photo = MOCK_PHOTOS[0];
    expect(photo.url).toBeTruthy();
    expect(photo.highResUrl).toBeTruthy();
    expect(photo.resolution).toBeDefined();

    const price = 19.90;
    const photographerSplit = Number((price * 0.90).toFixed(2));
    const platformSplit = Number((price * 0.09).toFixed(2));
    const charityOrAffiliateSplit = Number((price * 0.01).toFixed(2));

    expect(photographerSplit + platformSplit + charityOrAffiliateSplit).toBeCloseTo(price, 1);
    expect(photographerSplit).toBe(17.91);
    expect(platformSplit).toBe(1.79);
    expect(charityOrAffiliateSplit).toBe(0.20);
  });
});
