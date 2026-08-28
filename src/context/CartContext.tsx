import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  calculateMasterDeusSplit, 
  calculateCommissionCascade,
  type CartItem, 
  type EventPhoto, 
  type LicenseType, 
  type Transaction, 
  type SellerProfile, 
  type UserProfile, 
  type PhotoTradingHistory,
  type CommissionCascadeSplit,
  type MasterDeusSplit
} from '../types';
import { dbService } from '../services/databaseService';

interface CartContextType {
  cart: CartItem[];
  purchasedPhotoIds: string[];
  sellerProfile: SellerProfile;
  transactions: Transaction[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isSellerDashboardOpen: boolean;
  activeCheckoutItems: CartItem[];
  clientPublishedPhotos: EventPhoto[];
  ownerCustomPrices: Record<string, { isForSale: boolean; price: number }>;
  photoTradings: Record<string, PhotoTradingHistory>;
  addToCart: (photo: EventPhoto, licenseType?: LicenseType) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: (items?: CartItem[]) => void;
  closeCheckout: () => void;
  openSellerDashboard: () => void;
  closeSellerDashboard: () => void;
  isPhotoPurchased: (photoId: string) => boolean;
  completePurchase: (paymentMethod: 'pix' | 'credit_card' | 'apple_pay', buyer: UserProfile) => Transaction;
  requestSellerWithdraw: (amount: number, pixKey: string) => boolean;
  publishPhotosForSale: (photos: EventPhoto[], pricePerPhoto: number) => void;
  updatePixKey: (key: string, type: 'cpf' | 'email' | 'telefone' | 'aleatoria') => void;
  setPhotoSaleConfig: (photoId: string, isForSale: boolean, price: number) => void;
  getPhotoSaleConfig: (photo: EventPhoto) => { isForSale: boolean; price: number };
  getPhotoTradingInfo: (photo: EventPhoto) => PhotoTradingHistory;
  addClientPublishedPhoto: (photo: EventPhoto) => void;
  addPhotoToUserProfile: (photo: EventPhoto, user: UserProfile) => void;
  removePhotoFromUserProfile: (photoId: string, userId: string) => void;
  isPhotoInUserProfile: (photoId: string, userId: string) => boolean;
  getUserSavedPhotos: (userId: string) => EventPhoto[];
  calculateCommissionCascade: (totalAmount: number) => CommissionCascadeSplit;
  calculateMasterDeusSplit: (totalAmount?: number) => MasterDeusSplit;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_SELLER_PROFILE: SellerProfile = {
  id: 'seller_current',
  name: 'Meflagrou Oficial',
  handle: 'meflagrou',
  avatar: '/founder_avatar.jpg',
  pixKey: 'contato.meflagrou@gmail.com',
  pixKeyType: 'email',
  totalEarnings: 12480.50,
  availableBalance: 4890.00,
  pendingBalance: 499.00,
  passiveRoyaltyEarnings: 1980.00, // Royalties de 9% da conta de Deus
  totalPhotosSold: 342,
  commissionRate: 0.90,
  salesHistory: [
    {
      id: 'sale_deus_01',
      photoId: 'photo_founder_01',
      photoThumbnail: '/founder_avatar.jpg',
      eventName: 'Sunset Festival 2026 // Lounge VIP',
      buyerName: 'Isabela Rocha (@isabelarocha)',
      amount: 999.99,
      netAmount: 899.99, // 90% para o dono oficial
      type: 'master_owner_share',
      date: 'Hoje às 08:30',
    },
    {
      id: 'sale_deus_royalty_01',
      photoId: 'photo_isa_01',
      photoThumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
      eventName: 'Privilège Club // Neon Night',
      buyerName: 'Camila Duarte (@camiladuarte)',
      amount: 999.99,
      netAmount: 89.99, // 9% para a conta de Deus
      type: 'deus_master_royalty',
      date: 'Hoje às 06:15',
    },
    {
      id: 'sale_royalty_02',
      photoId: 'photo_lucas_01',
      photoThumbnail: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=400&q=80',
      eventName: 'Tomorrowland Brasil 2026',
      buyerName: 'Rafael Guimarães (@rafaelg)',
      amount: 999.99,
      netAmount: 89.99, // 9% para a conta de Deus
      type: 'deus_master_royalty',
      date: 'Ontem às 23:15',
    },
  ],
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('meflagrou_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchasedPhotoIds, setPurchasedPhotoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('meflagrou_purchased_ids');
    return saved ? JSON.parse(saved) : ['photo_isa_03'];
  });

  const [photoTradings, setPhotoTradings] = useState<Record<string, PhotoTradingHistory>>(() => {
    const saved = localStorage.getItem('meflagrou_tradings');
    return saved ? JSON.parse(saved) : {
      photo_founder_01: {
        generation: 2,
        currentOwnerId: 'user_founder',
        currentOwnerName: 'Deus • Meflagrou',
        currentOwnerHandle: 'meflagrou',
        currentOwnerAvatar: '/founder_avatar.jpg',
        boughtAtPrice: 499.99,
        currentListingPrice: 999.99,
        trades: [
          {
            generation: 1,
            ownerId: 'creator_studio',
            ownerName: 'Studio meflagrou.com',
            ownerHandle: 'meflagrou_creator',
            ownerAvatar: '/founder_avatar.jpg',
            pricePaid: 499.99,
            date: 'Foto Original de Capa',
          }
        ]
      }
    };
  });

  const [ownerCustomPrices, setOwnerCustomPrices] = useState<Record<string, { isForSale: boolean; price: number }>>(() => {
    const saved = localStorage.getItem('meflagrou_owner_prices');
    return saved ? JSON.parse(saved) : {
      photo_founder_01: { isForSale: true, price: 999.99 },
      photo_founder_02: { isForSale: true, price: 999.99 },
    };
  });

  const [clientPublishedPhotos, setClientPublishedPhotos] = useState<EventPhoto[]>(() => {
    const saved = localStorage.getItem('meflagrou_client_photos');
    return saved ? JSON.parse(saved) : [];
  });

  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(INITIAL_SELLER_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState<boolean>(false);
  const [activeCheckoutItems, setActiveCheckoutItems] = useState<CartItem[]>([]);

  useEffect(() => {
    localStorage.setItem('meflagrou_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('meflagrou_purchased_ids', JSON.stringify(purchasedPhotoIds));
  }, [purchasedPhotoIds]);

  useEffect(() => {
    localStorage.setItem('meflagrou_tradings', JSON.stringify(photoTradings));
  }, [photoTradings]);

  useEffect(() => {
    localStorage.setItem('meflagrou_owner_prices', JSON.stringify(ownerCustomPrices));
  }, [ownerCustomPrices]);

  useEffect(() => {
    localStorage.setItem('meflagrou_client_photos', JSON.stringify(clientPublishedPhotos));
  }, [clientPublishedPhotos]);

  const setPhotoSaleConfig = (photoId: string, isForSale: boolean, price: number) => {
    setOwnerCustomPrices((prev) => ({
      ...prev,
      [photoId]: { isForSale, price },
    }));
  };

  const getPhotoTradingInfo = (photo: EventPhoto): PhotoTradingHistory => {
    if (photoTradings[photo.id]) {
      return photoTradings[photo.id];
    }
    const basePrice = photo.ownerPrice || 999.99;
    return {
      generation: 1,
      currentOwnerId: photo.ownerSellerId || 'user_founder',
      currentOwnerName: photo.photographer.name || 'Deus • Meflagrou',
      currentOwnerHandle: photo.photographer.handle.replace('@', ''),
      currentOwnerAvatar: photo.photographer.avatar || '/founder_avatar.jpg',
      boughtAtPrice: basePrice,
      currentListingPrice: basePrice,
      trades: [
        {
          generation: 1,
          ownerId: photo.photographer.handle,
          ownerName: photo.photographer.name,
          ownerHandle: photo.photographer.handle,
          ownerAvatar: photo.photographer.avatar,
          pricePaid: basePrice,
          date: 'Curadoria Oficial meflagrou',
        }
      ]
    };
  };

  const getPhotoSaleConfig = (photo: EventPhoto) => {
    if (ownerCustomPrices[photo.id]) {
      return ownerCustomPrices[photo.id];
    }
    if (photoTradings[photo.id]) {
      return {
        isForSale: true,
        price: photoTradings[photo.id].currentListingPrice,
      };
    }
    return {
      isForSale: photo.forSaleByOwner ?? true,
      price: photo.ownerPrice ?? 999.99,
    };
  };

  const addClientPublishedPhoto = (newPhoto: EventPhoto) => {
    // Automatically list in Client's profile AND replicate to Deus Master Profile at 999.99
    const masterSyncedPhoto: EventPhoto = {
      ...newPhoto,
      forSaleByOwner: true,
      ownerPrice: 999.99,
    };

    setClientPublishedPhotos((prev) => [masterSyncedPhoto, ...prev]);
    setPhotoSaleConfig(newPhoto.id, true, 999.99);
    dbService.savePhoto(masterSyncedPhoto);
  };

  const addPhotoToUserProfile = (photo: EventPhoto, user: UserProfile) => {
    const existingTags = photo.tags || [];
    const isAlreadyTagged = existingTags.some((t) => t.userId === user.id);
    const updatedTags = isAlreadyTagged
      ? existingTags
      : [
          ...existingTags,
          {
            id: `tag_${user.id}_${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userHandle: user.handle,
            userAvatar: user.avatar,
            confidence: 99.9,
            boundingBox: { x: 50, y: 50, width: 20, height: 20 },
          },
        ];

    const updatedPhoto: EventPhoto = {
      ...photo,
      tags: updatedTags,
      ownerSellerId: photo.ownerSellerId || user.id,
    };

    // Save to user's dedicated local storage list
    try {
      const storageKey = `meflagrou_user_saved_photos_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      const userList: EventPhoto[] = saved ? JSON.parse(saved) : [];
      const filtered = userList.filter((p) => p.id !== updatedPhoto.id);
      filtered.unshift(updatedPhoto);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch {
      // fallback
    }

    setClientPublishedPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedPhoto.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedPhoto;
        return next;
      }
      return [updatedPhoto, ...prev];
    });

    dbService.savePhoto(updatedPhoto);
  };

  const removePhotoFromUserProfile = (photoId: string, userId: string) => {
    try {
      const storageKey = `meflagrou_user_saved_photos_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const userList: EventPhoto[] = JSON.parse(saved);
        const filtered = userList.filter((p) => p.id !== photoId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
      }
    } catch {
      // fallback
    }

    setClientPublishedPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          return {
            ...p,
            tags: (p.tags || []).filter((t) => t.userId !== userId),
          };
        }
        return p;
      })
    );
  };

  const isPhotoInUserProfile = (photoId: string, userId: string): boolean => {
    try {
      const storageKey = `meflagrou_user_saved_photos_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const userList: EventPhoto[] = JSON.parse(saved);
        if (userList.some((p) => p.id === photoId)) return true;
      }
    } catch {
      // fallback
    }
    const inClient = clientPublishedPhotos.some((p) => p.id === photoId && (p.ownerSellerId === userId || (p.tags || []).some((t) => t.userId === userId)));
    return inClient;
  };

  const getUserSavedPhotos = (userId: string): EventPhoto[] => {
    try {
      const storageKey = `meflagrou_user_saved_photos_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  };

  const addToCart = (photo: EventPhoto, licenseType: LicenseType = 'single_hd') => {
    const saleConfig = getPhotoSaleConfig(photo);
    const effectivePrice = saleConfig.price;

    const priceMap: { [key in LicenseType]: { title: string; price: number; originalPrice: number } } = {
      single_hd: { title: 'Edição Master 4K Ultra HD (Clean)', price: effectivePrice, originalPrice: effectivePrice * 1.5 },
      event_pack: { title: `Pacote Completo Master: ${photo.eventName}`, price: 1499.90, originalPrice: 2999.90 },
      vip_unlimited: { title: 'Passe Vitalício VIP Diamond Founder', price: 2999.90, originalPrice: 5999.90 },
      fine_art_print: { title: 'Quadro Fine Art Impresso Acrílico 60x90cm', price: 1890.00, originalPrice: 2500.00 },
    };

    const config = priceMap[licenseType];
    const cartItemId = `${photo.id}_${licenseType}`;

    if (cart.some((item) => item.id === cartItemId)) {
      setIsCartOpen(true);
      return;
    }

    const newItem: CartItem = {
      id: cartItemId,
      photo,
      licenseType,
      title: config.title,
      price: config.price,
      originalPrice: config.originalPrice,
      photographerName: photo.photographer.name,
      photographerHandle: photo.photographer.handle,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isPhotoPurchased = (photoId: string) => {
    return purchasedPhotoIds.includes(photoId);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = (items?: CartItem[]) => {
    setActiveCheckoutItems(items && items.length > 0 ? items : cart);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => setIsCheckoutOpen(false);

  const openSellerDashboard = () => setIsSellerDashboardOpen(true);
  const closeSellerDashboard = () => setIsSellerDashboardOpen(false);

  const completePurchase = (
    paymentMethod: 'pix' | 'credit_card' | 'apple_pay',
    buyer: UserProfile
  ): Transaction => {
    const itemsToProcess = activeCheckoutItems.length > 0 ? activeCheckoutItems : cart;
    const subtotal = itemsToProcess.reduce((sum, item) => sum + item.originalPrice, 0);
    const total = itemsToProcess.reduce((sum, item) => sum + item.price, 0);
    const discount = subtotal - total;
    
    // Master 90% / 9% / 1% Split Rule
    const masterSplit = calculateMasterDeusSplit(total);
    const cascadeSplit = calculateCommissionCascade(total);

    const newTransaction: Transaction = {
      id: `TX-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items: [...itemsToProcess],
      subtotal,
      discount,
      total,
      paymentMethod,
      status: 'completed',
      customerHandle: buyer.handle,
      commissionSplit: cascadeSplit,
      masterDeusSplit: masterSplit,
    };

    // 1. Unlock purchased photo IDs
    const newUnlockedIds = itemsToProcess.map((item) => item.photo.id);
    setPurchasedPhotoIds((prev) => Array.from(new Set([...prev, ...newUnlockedIds])));

    // 2. Progressive 2x Resale & Ownership Transfer Chain
    const updatedTradings = { ...photoTradings };
    const updatedPrices = { ...ownerCustomPrices };
    const newClientPhotos: EventPhoto[] = [...clientPublishedPhotos];

    itemsToProcess.forEach((item) => {
      const p = item.photo;
      const currentTrade = getPhotoTradingInfo(p);
      const nextGen = currentTrade.generation + 1;
      const next2xPrice = Number((item.price * 2).toFixed(2));

      const newRecord = {
        generation: nextGen,
        ownerId: buyer.id,
        ownerName: buyer.name,
        ownerHandle: buyer.handle,
        ownerAvatar: buyer.avatar,
        pricePaid: item.price,
        date: 'Hoje (Compra Confirmada)',
      };

      updatedTradings[p.id] = {
        generation: nextGen,
        currentOwnerId: buyer.id,
        currentOwnerName: buyer.name,
        currentOwnerHandle: buyer.handle,
        currentOwnerAvatar: buyer.avatar,
        boughtAtPrice: item.price,
        currentListingPrice: next2xPrice,
        trades: [newRecord, ...currentTrade.trades],
      };

      updatedPrices[p.id] = {
        isForSale: true,
        price: next2xPrice,
      };

      // Ensure photo is in the buyer's personal gallery and listed for sale at 2x
      const existingIdx = newClientPhotos.findIndex((cp) => cp.id === p.id);
      const transferredPhoto: EventPhoto = {
        ...p,
        ownerSellerId: buyer.id,
        forSaleByOwner: true,
        ownerPrice: next2xPrice,
        tradingData: updatedTradings[p.id],
      };

      if (existingIdx >= 0) {
        newClientPhotos[existingIdx] = transferredPhoto;
      } else {
        newClientPhotos.unshift(transferredPhoto);
      }

      // Automatically add to buyer's dedicated gallery
      try {
        const storageKey = `meflagrou_user_saved_photos_${buyer.id}`;
        const saved = localStorage.getItem(storageKey);
        const userList: EventPhoto[] = saved ? JSON.parse(saved) : [];
        const filtered = userList.filter((itemPhoto) => itemPhoto.id !== transferredPhoto.id);
        filtered.unshift(transferredPhoto);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
      } catch {
        // fallback
      }
    });

    // Automatically set the first purchased photo as the buyer's profile photo
    const firstPurchasedPhoto = itemsToProcess[0]?.photo;
    if (firstPurchasedPhoto && buyer && buyer.id) {
      try {
        const session = localStorage.getItem('meflagrou_active_session');
        if (session) {
          const currentSessionUser = JSON.parse(session);
          if (currentSessionUser.id === buyer.id) {
            currentSessionUser.avatar = firstPurchasedPhoto.url;
            localStorage.setItem('meflagrou_active_session', JSON.stringify(currentSessionUser));
            dbService.saveUser(currentSessionUser);
          }
        }
      } catch {
        // fallback
      }
    }

    setPhotoTradings(updatedTradings);
    setOwnerCustomPrices(updatedPrices);
    setClientPublishedPhotos(newClientPhotos);

    // Update transactions history
    setTransactions((prev) => [newTransaction, ...prev]);

    // Credit Deus account with 9% Royalty on EVERY purchase + 90% if Deus is the official owner
    const netOwnerEarnings = masterSplit.ownerAmount;
    const netDeusRoyalty = masterSplit.deusRoyaltyAmount;

    setSellerProfile((prev: SellerProfile) => ({
      ...prev,
      totalEarnings: prev.totalEarnings + total,
      availableBalance: prev.availableBalance + netDeusRoyalty + (buyer.id === 'user_founder' ? netOwnerEarnings : 0),
      passiveRoyaltyEarnings: prev.passiveRoyaltyEarnings + netDeusRoyalty,
      totalPhotosSold: prev.totalPhotosSold + itemsToProcess.length,
      salesHistory: [
        {
          id: `deus_royalty_${Date.now()}`,
          photoId: itemsToProcess[0]?.photo.id || 'photo',
          photoThumbnail: itemsToProcess[0]?.photo.thumbnailUrl || itemsToProcess[0]?.photo.url || '/founder_avatar.jpg',
          eventName: itemsToProcess[0]?.photo.eventName || 'Festival',
          buyerName: `@${buyer.handle} comprou flagra (9% Royalty Master)`,
          amount: total,
          netAmount: netDeusRoyalty,
          type: 'deus_master_royalty' as const,
          date: 'Agora mesmo',
        },
        ...itemsToProcess.map((item) => ({
          id: `sale_${Date.now()}_${item.photo.id}`,
          photoId: item.photo.id,
          photoThumbnail: item.photo.thumbnailUrl || item.photo.url,
          eventName: item.photo.eventName,
          buyerName: `@${buyer.handle}`,
          amount: item.price,
          netAmount: Number((item.price * 0.90).toFixed(2)),
          type: 'master_owner_share' as const,
          date: 'Agora mesmo',
        })),
        ...prev.salesHistory,
      ],
    }));

    // Remove purchased items from cart
    setCart((prev) => prev.filter((item) => !itemsToProcess.some((p) => p.id === item.id)));

    dbService.saveTransaction(newTransaction);
    return newTransaction;
  };

  const requestSellerWithdraw = (amount: number, pixKey: string) => {
    if (amount > sellerProfile.availableBalance || amount <= 0) return false;

    setSellerProfile((prev: SellerProfile) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      pixKey,
    }));

    return true;
  };

  const publishPhotosForSale = (photos: EventPhoto[], _pricePerPhoto: number) => {
    setSellerProfile((prev: SellerProfile) => ({
      ...prev,
      totalPhotosSold: prev.totalPhotosSold + photos.length,
    }));
  };

  const updatePixKey = (key: string, type: 'cpf' | 'email' | 'telefone' | 'aleatoria') => {
    setSellerProfile((prev: SellerProfile) => ({
      ...prev,
      pixKey: key,
      pixKeyType: type,
    }));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        purchasedPhotoIds,
        sellerProfile,
        transactions,
        isCartOpen,
        isCheckoutOpen,
        isSellerDashboardOpen,
        activeCheckoutItems,
        clientPublishedPhotos,
        ownerCustomPrices,
        photoTradings,
        addToCart,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        openSellerDashboard,
        closeSellerDashboard,
        isPhotoPurchased,
        completePurchase,
        requestSellerWithdraw,
        publishPhotosForSale,
        updatePixKey,
        setPhotoSaleConfig,
        getPhotoSaleConfig,
        getPhotoTradingInfo,
        addClientPublishedPhoto,
        addPhotoToUserProfile,
        removePhotoFromUserProfile,
        isPhotoInUserProfile,
        getUserSavedPhotos,
        calculateCommissionCascade,
        calculateMasterDeusSplit,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
