export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  cpf?: string;
  whatsapp?: string;
  phone?: string;
  street?: string; // Rua / Logradouro
  number?: string; // Número
  neighborhood?: string; // Bairro
  address?: string; // Endereço formatado / resumo
  cep?: string; // CEP
  city: string; // Cidade
  state: string; // Estado
  maritalStatus?: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável' | 'Separado(a)' | string; // Estado Civil
  email1?: string;
  email2?: string;
  email?: string;
  avatar: string;
  bio: string;
  verifiedAt: string;
  facialDescriptor: number[]; // 128-d simulated facial vector embedding
  faceSignatureId: string;
  totalPhotosCount: number;
  eventsCount: number;
  attendedEvents: string[];
  topFriends: {
    userId: string;
    name: string;
    handle: string;
    avatar: string;
    sharedPhotosCount: number;
  }[];
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    x?: string;
  };
  achievements?: {
    id: string;
    title: string;
    icon: string;
    description: string;
    unlockedAt?: string;
  }[];
  privacySettings: {
    isPublic: boolean;
    allowTagging: boolean;
    notifyOnNewPhoto: boolean;
  };
}

export interface PhotoBoundingBox {
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  width: number; // percentage width (0 to 100)
  height: number; // percentage height (0 to 100)
}

export interface PhotoTag {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  confidence: number; // e.g. 98.6%
  boundingBox: PhotoBoundingBox;
}

export interface PhotographerInfo {
  name: string;
  handle: string;
  avatar: string;
  camera: string;
  lens: string;
}

export interface ExifData {
  iso: string;
  shutter: string;
  aperture: string;
  focalLength: string;
  camera: string;
}

export interface PhotoTradeRecord {
  generation: number;
  ownerId: string;
  ownerName: string;
  ownerHandle: string;
  ownerAvatar: string;
  pricePaid: number;
  date: string;
}

export interface PhotoTradingHistory {
  generation: number;
  currentOwnerId: string;
  currentOwnerName: string;
  currentOwnerHandle: string;
  currentOwnerAvatar: string;
  boughtAtPrice: number;
  currentListingPrice: number; // boughtAtPrice * 2
  trades: PhotoTradeRecord[];
}

export interface EventPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  highResUrl: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  city: string;
  time: string; // e.g. "02:45 AM"
  photographer: PhotographerInfo;
  exif: ExifData;
  tags: PhotoTag[];
  aspectRatio: 'portrait' | 'landscape' | 'square';
  likesCount: number;
  isLiked?: boolean;
  isFeatured?: boolean;
  isGroup?: boolean;
  resolution: string; // e.g. "6000 x 4000 (24 MP)"
  fileSize: string; // e.g. "8.4 MB"
  commentsCount?: number;
  salesCount?: number;
  forSaleByOwner?: boolean;
  ownerPrice?: number;
  ownerSellerId?: string;
  tradingData?: PhotoTradingHistory;
  vibeTag?: 'dancing' | 'cheers' | 'fashion' | 'frontstage' | 'goal' | 'lounge';
  vibeLabel?: string;
}

export interface EventData {
  id: string;
  name: string;
  category: 'Festival' | 'Club / Balada' | 'Sunset / Rooftop' | 'Baile / Funk' | 'Rave / Techno' | 'Casamento VIP';
  date: string;
  location: string;
  city: string;
  coverUrl: string;
  totalPhotos: number;
  photographers: string[];
}

export type ScanStatus = 
  | 'idle' 
  | 'requesting_camera' 
  | 'camera_ready' 
  | 'scanning' 
  | 'analyzing_landmarks' 
  | 'matching' 
  | 'matched' 
  | 'not_found' 
  | 'error';

export interface ScanResult {
  matchedUser: UserProfile | null;
  confidence: number;
  similarityScore: number;
  landmarksDetected: number;
  processingTimeMs: number;
  faceMetrics: {
    symmetry: number;
    illumination: number;
    sharpness: number;
  };
}

export * from './commerce';
