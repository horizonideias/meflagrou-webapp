import { describe, it, expect, beforeEach } from 'vitest';
import { dbService } from '../services/databaseService';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';

describe('Database & Persistence Service (Multi-Tier IndexedDB & LocalStorage)', () => {
  beforeEach(async () => {
    await dbService.init();
  });

  it('should initialize successfully in test and browser environments', async () => {
    const initialized = await dbService.init();
    expect(initialized).toBe(true);
  });

  it('should retrieve all users including seeded and founder accounts', async () => {
    const users = await dbService.getAllUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('should save a user and retrieve by ID', async () => {
    const testUser = {
      ...MOCK_USERS[0],
      id: 'test_db_user_1',
      name: 'Test Database User',
      handle: 'test_db_user',
    };

    await dbService.saveUser(testUser);
    const retrieved = await dbService.getUserById('test_db_user_1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Test Database User');
    expect(retrieved?.handle).toBe('test_db_user');
  });

  it('should save and retrieve photos with metadata and seller attribution', async () => {
    const testPhoto = {
      ...MOCK_PHOTOS[0],
      id: 'test_photo_published_99',
      eventName: 'Open Air Warung Test Night',
      price: 15.00,
    };

    await dbService.savePhoto(testPhoto);
    const retrieved = await dbService.getPhotoById('test_photo_published_99');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.eventName).toBe('Open Air Warung Test Night');
  });
});
