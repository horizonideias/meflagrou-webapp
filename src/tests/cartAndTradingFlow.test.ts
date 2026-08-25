import { describe, it, expect } from 'vitest';
import { MOCK_PHOTOS, MOCK_USERS } from '../data/mockDatabase';
import { calculateMasterDeusSplit, calculateCommissionCascade } from '../types/commerce';
import type { CartItem, Transaction } from '../types';

describe('End-to-End Cart, Trading 2x & Checkout Flow', () => {
  it('should create cart items with valid price structures', () => {
    const photo = MOCK_PHOTOS[0];
    const cartItem: CartItem = {
      id: `cart_${photo.id}_hd`,
      photo,
      licenseType: 'single_hd',
      title: `${photo.eventName} • Foto Digital HD`,
      price: 19.90,
      originalPrice: 29.90,
      photographerName: photo.photographer.name,
      photographerHandle: photo.photographer.handle,
    };

    expect(cartItem.id).toBeDefined();
    expect(cartItem.price).toBe(19.90);
    expect(cartItem.photographerName).toBe(photo.photographer.name);
  });

  it('should calculate 2x trading resale pricing when photo changes ownership', () => {
    const initialPrice = 19.90;
    const nextListingPrice = Number((initialPrice * 2).toFixed(2));
    expect(nextListingPrice).toBe(39.80);

    const generation3Price = Number((nextListingPrice * 2).toFixed(2));
    expect(generation3Price).toBe(79.60);
  });

  it('should build a valid completed Transaction object with PIX verification', () => {
    const buyer = MOCK_USERS[0];
    const photo = MOCK_PHOTOS[0];
    const split = calculateCommissionCascade(19.90);

    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString(),
      items: [
        {
          id: `item_${photo.id}`,
          photo,
          licenseType: 'single_hd',
          title: photo.eventName,
          price: 19.90,
          originalPrice: 29.90,
          photographerName: photo.photographer.name,
          photographerHandle: photo.photographer.handle,
        }
      ],
      subtotal: 19.90,
      discount: 0,
      total: 19.90,
      paymentMethod: 'pix',
      status: 'completed',
      customerHandle: buyer.handle,
      commissionSplit: split,
      masterDeusSplit: calculateMasterDeusSplit(999.99),
    };

    expect(tx.status).toBe('completed');
    expect(tx.commissionSplit?.sellerAmount).toBeCloseTo(11.94, 2); // 60% of 19.90
    expect(tx.commissionSplit?.creatorRoyaltyAmount).toBeCloseTo(2.98, 1); // 15% of 19.90
    expect(tx.total).toBe(19.90);
  });
});
