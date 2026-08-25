import type { UserProfile, EventPhoto, EventData, Transaction } from '../types';
import { MOCK_USERS, MOCK_PHOTOS, MOCK_EVENTS } from '../data/mockDatabase';

const DB_NAME = 'meflagrou_database';
const DB_VERSION = 1;

// Storage Keys
const LOCAL_STORAGE_USERS_KEY = 'meflagrou_db_users';
const LOCAL_STORAGE_PHOTOS_KEY = 'meflagrou_db_photos';
const LOCAL_STORAGE_EVENTS_KEY = 'meflagrou_db_events';
const LOCAL_STORAGE_TXS_KEY = 'meflagrou_db_transactions';

class MeflagrouDatabaseService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private memoryStore = new Map<string, string>();

  private getItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch {
        // storage disabled or quota
      }
    }
    return this.memoryStore.get(key) || null;
  }

  private setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // storage disabled or quota
      }
    }
    this.memoryStore.set(key, value);
  }

  // 1. Initialize IndexedDB with schema fallback to LocalStorage
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('[MeflagrouDB] IndexedDB não suportado neste ambiente. Usando LocalStorage / MemoryStorage.');
        this.hydrateInitialLocalStorage();
        this.isInitialized = true;
        resolve(true);
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', { keyPath: 'id' });
            userStore.createIndex('handle', 'handle', { unique: false });
            userStore.createIndex('city', 'city', { unique: false });
          }

          if (!db.objectStoreNames.contains('photos')) {
            const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
            photoStore.createIndex('eventId', 'eventId', { unique: false });
            photoStore.createIndex('ownerSellerId', 'ownerSellerId', { unique: false });
          }

          if (!db.objectStoreNames.contains('events')) {
            db.createObjectStore('events', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('transactions')) {
            const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
            txStore.createIndex('customerHandle', 'customerHandle', { unique: false });
          }
        };

        request.onsuccess = async (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.isInitialized = true;
          await this.seedDefaultDataIfEmpty();
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('[MeflagrouDB] Erro ao abrir IndexedDB:', event);
          this.hydrateInitialLocalStorage();
          this.isInitialized = true;
          resolve(true);
        };
      } catch (err) {
        console.error('[MeflagrouDB] Exceção ao inicializar banco de dados:', err);
        this.hydrateInitialLocalStorage();
        this.isInitialized = true;
        resolve(true);
      }
    });
  }

  // Hydrate initial LocalStorage data
  private hydrateInitialLocalStorage() {
    if (!this.getItem(LOCAL_STORAGE_USERS_KEY)) {
      this.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(MOCK_USERS.slice(0, 50)));
    }
    if (!this.getItem(LOCAL_STORAGE_PHOTOS_KEY)) {
      this.setItem(LOCAL_STORAGE_PHOTOS_KEY, JSON.stringify(MOCK_PHOTOS));
    }
    if (!this.getItem(LOCAL_STORAGE_EVENTS_KEY)) {
      this.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(MOCK_EVENTS));
    }
  }

  // Seed default data if database is brand new
  private async seedDefaultDataIfEmpty() {
    if (!this.db) return;

    const existingUsers = await this.getAllFromStore<UserProfile>('users');
    if (existingUsers.length === 0) {
      // Seed first batch of users
      for (const u of MOCK_USERS.slice(0, 50)) {
        await this.putInStore('users', u);
      }
    }

    const existingPhotos = await this.getAllFromStore<EventPhoto>('photos');
    if (existingPhotos.length === 0) {
      for (const p of MOCK_PHOTOS) {
        await this.putInStore('photos', p);
      }
    }

    const existingEvents = await this.getAllFromStore<EventData>('events');
    if (existingEvents.length === 0) {
      for (const e of MOCK_EVENTS) {
        await this.putInStore('events', e);
      }
    }
  }

  // Generic IndexedDB Helper
  private async putInStore<T>(storeName: string, item: T): Promise<boolean> {
    if (!this.db) return false;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    if (!this.db) return [];
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  // ==========================================
  // 👤 USER PROFILE METHODS
  // ==========================================

  // Save or update user (persist in IndexedDB + LocalStorage + in-memory array)
  async saveUser(user: UserProfile): Promise<boolean> {
    await this.init();

    // 1. In-memory
    const idx = MOCK_USERS.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      MOCK_USERS[idx] = user;
    } else {
      MOCK_USERS.unshift(user);
    }

    // 2. LocalStorage / MemoryStorage
    try {
      const storedUsersRaw = this.getItem(LOCAL_STORAGE_USERS_KEY);
      let list: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      list = list.filter((u) => u.id !== user.id);
      list.unshift(user);
      this.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(list));
    } catch {
      // Storage quota safety
    }

    // 3. IndexedDB
    if (this.db) {
      return this.putInStore('users', user);
    }
    return true;
  }

  // Get all registered users
  async getAllUsers(): Promise<UserProfile[]> {
    await this.init();

    if (this.db) {
      const dbUsers = await this.getAllFromStore<UserProfile>('users');
      if (dbUsers.length > 0) return dbUsers;
    }

    try {
      const localUsers = this.getItem(LOCAL_STORAGE_USERS_KEY);
      if (localUsers) {
        return JSON.parse(localUsers);
      }
    } catch {
      // ignore
    }

    return MOCK_USERS;
  }

  // Find user by ID
  async getUserById(id: string): Promise<UserProfile | null> {
    const users = await this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }

  // Find user by Instagram handle
  async getUserByHandle(handle: string): Promise<UserProfile | null> {
    const cleanHandle = handle.replace('@', '').toLowerCase();
    const users = await this.getAllUsers();
    return users.find((u) => u.handle.toLowerCase() === cleanHandle) || null;
  }

  // ==========================================
  // 📸 PHOTO METHODS
  // ==========================================

  // Save new photo
  async savePhoto(photo: EventPhoto): Promise<boolean> {
    await this.init();

    // 1. In-memory
    const idx = MOCK_PHOTOS.findIndex((p) => p.id === photo.id);
    if (idx >= 0) {
      MOCK_PHOTOS[idx] = photo;
    } else {
      MOCK_PHOTOS.unshift(photo);
    }

    // 2. LocalStorage / MemoryStorage
    try {
      const storedRaw = this.getItem(LOCAL_STORAGE_PHOTOS_KEY);
      let list: EventPhoto[] = storedRaw ? JSON.parse(storedRaw) : [];
      list = list.filter((p) => p.id !== photo.id);
      list.unshift(photo);
      this.setItem(LOCAL_STORAGE_PHOTOS_KEY, JSON.stringify(list));
    } catch {
      // safe fallback
    }

    // 3. IndexedDB
    if (this.db) {
      return this.putInStore('photos', photo);
    }
    return true;
  }

  async getAllPhotos(): Promise<EventPhoto[]> {
    await this.init();

    if (this.db) {
      const dbPhotos = await this.getAllFromStore<EventPhoto>('photos');
      if (dbPhotos.length > 0) return dbPhotos;
    }

    try {
      const localPhotos = this.getItem(LOCAL_STORAGE_PHOTOS_KEY);
      if (localPhotos) {
        return JSON.parse(localPhotos);
      }
    } catch {
      // ignore
    }

    return MOCK_PHOTOS;
  }

  // Find photo by ID
  async getPhotoById(id: string): Promise<EventPhoto | null> {
    const photos = await this.getAllPhotos();
    return photos.find((p) => p.id === id) || null;
  }

  // ==========================================
  // 💸 TRANSACTION & COMMISSIONS METHODS
  // ==========================================

  async saveTransaction(tx: Transaction): Promise<boolean> {
    await this.init();

    try {
      const storedRaw = this.getItem(LOCAL_STORAGE_TXS_KEY);
      const list: Transaction[] = storedRaw ? JSON.parse(storedRaw) : [];
      list.unshift(tx);
      this.setItem(LOCAL_STORAGE_TXS_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }

    if (this.db) {
      return this.putInStore('transactions', tx);
    }
    return true;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    await this.init();

    if (this.db) {
      const dbTxs = await this.getAllFromStore<Transaction>('transactions');
      if (dbTxs.length > 0) return dbTxs;
    }

    try {
      const localTxs = this.getItem(LOCAL_STORAGE_TXS_KEY);
      if (localTxs) {
        return JSON.parse(localTxs);
      }
    } catch {
      // ignore
    }

    return [];
  }

  // ==========================================
  // 💾 BACKUP, RESTORE & EXPORT
  // ==========================================

  async exportDatabaseSnapshot(): Promise<string> {
    const users = await this.getAllUsers();
    const photos = await this.getAllPhotos();
    const transactions = await this.getAllTransactions();

    const snapshot = {
      version: DB_VERSION,
      timestamp: new Date().toISOString(),
      platform: 'meflagrou.com',
      usersCount: users.length,
      photosCount: photos.length,
      transactionsCount: transactions.length,
      data: {
        users,
        photos,
        transactions,
      },
    };

    return JSON.stringify(snapshot, null, 2);
  }
}

export const dbService = new MeflagrouDatabaseService();
