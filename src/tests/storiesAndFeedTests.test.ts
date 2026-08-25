import { describe, it, expect } from 'vitest';
import { getOrderedStories, MOCK_STORIES } from '../data/mockStories';
import { MOCK_USERS, MOCK_PHOTOS, MOCK_EVENTS } from '../data/mockDatabase';
import { SEED_PROFILES_1000 } from '../data/seedProfiles1000';

describe('Feed, Stories & Seed Data Integrity', () => {
  it('should have 1,000+ realistic seed profiles with valid metadata', () => {
    expect(SEED_PROFILES_1000.length).toBeGreaterThanOrEqual(1000);
    
    // Check first 100 profiles for data completeness
    SEED_PROFILES_1000.slice(0, 100).forEach((profile) => {
      expect(profile.id).toBeDefined();
      expect(profile.name.length).toBeGreaterThan(2);
      expect(profile.handle.length).toBeGreaterThan(1);
      expect(profile.avatar).toBeDefined();
      expect(profile.city).toBeDefined();
      expect(profile.bio).toBeDefined();
    });
  });

  it('should guarantee logged-in user is ALWAYS at index 0 of Stories Tray', () => {
    const randomUser = MOCK_USERS[15];
    const ordered = getOrderedStories(randomUser, MOCK_STORIES);

    expect(ordered.length).toBeGreaterThan(0);
    expect(ordered[0].authorId).toBe(randomUser.id);
    expect(ordered[0].authorName).toContain(randomUser.name);
  });

  it('should have properly structured Mock Photos with valid metadata and photographers', () => {
    expect(MOCK_PHOTOS.length).toBeGreaterThan(0);

    MOCK_PHOTOS.forEach((photo) => {
      expect(photo.id).toBeDefined();
      expect(photo.url).toBeDefined();
      expect(photo.photographer).toBeDefined();
      expect(photo.photographer.name).toBeDefined();
      expect(photo.photographer.handle).toBeDefined();
      expect(photo.eventName).toBeDefined();
    });
  });

  it('should have valid Event Catalog items', () => {
    expect(MOCK_EVENTS.length).toBeGreaterThan(0);

    MOCK_EVENTS.forEach((ev) => {
      expect(ev.id).toBeDefined();
      expect(ev.name).toBeDefined();
      expect(ev.location).toBeDefined();
      expect(ev.city).toBeDefined();
    });
  });
});
