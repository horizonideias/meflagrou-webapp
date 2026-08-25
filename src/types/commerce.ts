import type { EventPhoto } from './index';

export type LicenseType = 'single_hd' | 'event_pack' | 'vip_unlimited' | 'fine_art_print';

export interface CartItem {
  id: string;
  photo: EventPhoto;
  licenseType: LicenseType;
  title: string;
  price: number;
  originalPrice: number;
  photographerName: string;
  photographerHandle: string;
}

export interface MasterDeusSplit {
  totalAmount: number; // 999.99
  ownerAmount: number; // 90% -> R$ 899,99 para o Dono Oficial da Foto
  ownerPercent: number;
  deusRoyaltyAmount: number; // 9% -> R$ 90,00 para a Conta de Deus
  deusPercent: number;
  platformSiteAmount: number; // 1% -> R$ 10,00 para o Site meflagrou.com
  platformPercent: number;
}

export interface CommissionCascadeSplit {
  sellerAmount: number; // 60% - Vendedor atual / Dono da foto
  sellerPercent: number;
  creatorRoyaltyAmount: number; // 15% - Fotógrafo/Criador Original (Royalty perpétuo de autor)
  creatorPercent: number;
  lineageAncestorsAmount: number; // 10% - Donos anteriores da cadeia de valorização (Linhagem)
  lineagePercent: number;
  affiliateReferralAmount: number; // 5% - Indicação / Afiliado
  affiliatePercent: number;
  platformFeeAmount: number; // 10% - Taxa meflagrou.com (IA, Biometria e Gateway PIX)
  platformPercent: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'apple_pay';
  status: 'pending' | 'completed' | 'refunded';
  pixCopiaECola?: string;
  pixQrCodeUrl?: string;
  customerHandle: string;
  commissionSplit?: CommissionCascadeSplit;
  masterDeusSplit?: MasterDeusSplit;
}

export interface SellerProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'telefone' | 'aleatoria';
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  passiveRoyaltyEarnings: number; // Royalties perpétuos recebidos de revendas da linhagem e do pool de 9%
  totalPhotosSold: number;
  commissionRate: number; // 0.85 = 85%
  salesHistory: {
    id: string;
    photoId: string;
    photoThumbnail: string;
    eventName: string;
    buyerName: string;
    amount: number;
    netAmount: number;
    type?: 'direct_sale' | 'creator_royalty' | 'lineage_bonus' | 'affiliate_referral' | 'deus_master_royalty' | 'master_owner_share';
    date: string;
  }[];
}

export interface PhotoPriceListing {
  photoId: string;
  singleHdPrice: number;
  eventPackPrice: number;
  allowFineArtPrint: boolean;
}

export const calculateMasterDeusSplit = (totalAmount: number = 999.99): MasterDeusSplit => {
  return {
    totalAmount,
    ownerAmount: Number((totalAmount * 0.90).toFixed(2)),
    ownerPercent: 90,
    deusRoyaltyAmount: Number((totalAmount * 0.09).toFixed(2)),
    deusPercent: 9,
    platformSiteAmount: Number((totalAmount * 0.01).toFixed(2)),
    platformPercent: 1,
  };
};

export const calculateCommissionCascade = (totalAmount: number): CommissionCascadeSplit => {
  return {
    sellerAmount: Number((totalAmount * 0.60).toFixed(2)),
    sellerPercent: 60,
    creatorRoyaltyAmount: Number((totalAmount * 0.15).toFixed(2)),
    creatorPercent: 15,
    lineageAncestorsAmount: Number((totalAmount * 0.10).toFixed(2)),
    lineagePercent: 10,
    affiliateReferralAmount: Number((totalAmount * 0.05).toFixed(2)),
    affiliatePercent: 5,
    platformFeeAmount: Number((totalAmount * 0.10).toFixed(2)),
    platformPercent: 10,
  };
};
