import { describe, it, expect } from 'vitest';
import { calculateMasterDeusSplit, calculateCommissionCascade } from '../types/commerce';

describe('Commerce & Financial Commission Cascade Engine', () => {
  it('should accurately calculate Master Deus Split on R$ 999,99 (90% Owner / 9% Deus / 1% Site)', () => {
    const split = calculateMasterDeusSplit(999.99);

    expect(split.totalAmount).toBe(999.99);
    // 90% of 999.99 = 899.991 -> 899.99
    expect(split.ownerPercent).toBe(90);
    expect(split.ownerAmount).toBe(899.99);

    // 9% of 999.99 = 89.9991 -> 90.00
    expect(split.deusPercent).toBe(9);
    expect(split.deusRoyaltyAmount).toBe(90.00);

    // 1% of 999.99 = 9.9999 -> 10.00
    expect(split.platformPercent).toBe(1);
    expect(split.platformSiteAmount).toBe(10.00);

    // Sum verification (899.99 + 90.00 + 10.00 = 999.99)
    const sum = Number((split.ownerAmount + split.deusRoyaltyAmount + split.platformSiteAmount).toFixed(2));
    expect(sum).toBe(999.99);
  });

  it('should accurately calculate 5-tier Commission Cascade Split (60/15/10/5/10)', () => {
    const split = calculateCommissionCascade(100.00);

    expect(split.sellerPercent).toBe(60);
    expect(split.sellerAmount).toBe(60.00);

    expect(split.creatorPercent).toBe(15);
    expect(split.creatorRoyaltyAmount).toBe(15.00);

    expect(split.lineagePercent).toBe(10);
    expect(split.lineageAncestorsAmount).toBe(10.00);

    expect(split.affiliatePercent).toBe(5);
    expect(split.affiliateReferralAmount).toBe(5.00);

    expect(split.platformPercent).toBe(10);
    expect(split.platformFeeAmount).toBe(10.00);

    // Total percentages should equal 100%
    const totalPercent = split.sellerPercent + split.creatorPercent + split.lineagePercent + split.affiliatePercent + split.platformPercent;
    expect(totalPercent).toBe(100);
  });
});
