// AI Human Engine - Simulação de Interação Social Automática Contínua
// meflagrou.com - Perfis de IA Humana com curtidas, comentários, votos em batalhas, criação de novos perfis e publicação de fotos a cada 10 min
import { SEED_PROFILES_1000 } from '../data/seedProfiles1000';
import { MOCK_PHOTOS, MOCK_USERS } from '../data/mockDatabase';
import type { EventPhoto, UserProfile } from '../types';

export interface AIHumanProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  vipTier: 'VIP Diamante' | 'Gold VIP' | 'Black VIP' | 'Top Influencer';
  personality: 'hype' | 'fashion' | 'photographer' | 'party_lover' | 'promoter';
  favoriteFestivals: string[];
}

export interface AIActivityEvent {
  id: string;
  aiUser: AIHumanProfile;
  type: 'photo_like' | 'photo_comment' | 'battle_vote' | 'battle_comment' | 'community_post' | 'contract_referral' | 'profile_created' | 'photo_published';
  targetTitle: string;
  content?: string;
  timestamp: string;
  createdAt: number;
}

const VIP_TIERS: AIHumanProfile['vipTier'][] = ['VIP Diamante', 'Gold VIP', 'Black VIP', 'Top Influencer'];
const PERSONALITIES: AIHumanProfile['personality'][] = ['hype', 'fashion', 'photographer', 'party_lover', 'promoter'];
const ROLES = ['DJ & VIP', 'Produtor de Eventos', 'Fashion Influencer', 'Fotógrafo Pro', 'Promoter VIP', 'Clubber'];

export const AI_HUMAN_PROFILES: AIHumanProfile[] = SEED_PROFILES_1000.map((p, idx) => ({
  id: p.id,
  name: p.name,
  handle: p.handle,
  email: p.email || `${p.handle}@meflagrou.com`,
  avatar: p.avatar,
  bio: p.bio,
  role: ROLES[idx % ROLES.length],
  vipTier: VIP_TIERS[idx % VIP_TIERS.length],
  personality: PERSONALITIES[idx % PERSONALITIES.length],
  favoriteFestivals: p.attendedEvents
}));

const PHOTO_COMMENTS = [
  'A iluminação dessa foto tá simplesmente surreal! 📸✨',
  'Que vibe incrível desse flagra, a pista tava pegando fogo! 🔥',
  'Look 10/10! Arrasou muito no camarote 👏',
  'A equipe do meflagrou nunca erram no clique!',
  'Essa energia é única, saudades desse dia! 😍',
  'O fotógrafo pegou o momento perfeito no ápice do drop! ⚡',
  'Parece capa de revista internacional, sensacional!',
  'Já salvei nos meus favoritos, foto histórica! 🚀'
];

const BATTLE_COMMENTS = [
  'Voto com certeza na Foto A, a expressão e o ângulo ficaram impecáveis! 🔥',
  'A Foto B tá muito estilosa, aquele jogo de luz neon ganhou meu voto! 😍',
  'Duelo de gigantes essa rodada! Mas meu voto foi computado! ⚔️',
  'Essa batalha da noite tá disputadíssima! Qualidade 8K total 👏',
  'A energia da Foto A tá no topo da semana!',
  'Batalha insana! O estilo da Foto B tá em outro patamar ✨'
];

const COMMUNITY_POSTS = [
  'Alguém mais indo no Sunset Festival no próximo fim de semana? Bora fechar um squad no camarote! 🎟️✨',
  'Dica de ouro: o reconhecimento facial com pulseira NFC do meflagrou agilizou 100% minhas fotos ontem!',
  'A nova premiação da Liga dos Fotógrafos tá sensacional, torcendo pela equipe bater o recorde esse mês 🏆',
  'Quem aí já testou o Passaporte VIP? Downloads ilimitados salvaram a cobertura inteira da minha turma! 👑',
  'A Batalha 1x1 tá viciante demais, já votei em mais de 20 rounds hoje haha 🔥'
];

const AUTO_PHOTO_URLS = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80'
];

const AUTO_EVENT_NAMES = [
  'Sunset Festival 2026 // Frontstage VIP',
  'Tomorrowland Brasil • Mainstage 8K',
  'Privilège Club Neon Night • Lounge',
  'Warung Beach Club • Underground Session',
  'Laroc Club Sunset • Golden Hour',
  'Ultra Brasil 2026 • VIP Stage'
];

class AIHumanService {
  private activities: AIActivityEvent[] = [];
  private listeners: ((event: AIActivityEvent) => void)[] = [];
  private interactionIntervalId: number | null = null;
  private photoPublishIntervalId: number | null = null;
  private isRunning: boolean = false;
  private generatedCount: number = 0;

  constructor() {
    this.loadInitialActivities();
    this.startAutoInteractionLoop();
    this.startAutoPhotoPublishLoop();
  }

  private loadInitialActivities() {
    this.activities = [
      {
        id: 'act_init_1',
        aiUser: AI_HUMAN_PROFILES[0],
        type: 'battle_vote',
        targetTitle: 'Batalha #1 • Sunset Festival',
        content: 'Votou na Foto A com +1 voto no placar!',
        timestamp: 'há 1 min',
        createdAt: Date.now() - 60000
      },
      {
        id: 'act_init_2',
        aiUser: AI_HUMAN_PROFILES[2],
        type: 'photo_comment',
        targetTitle: 'Sunset Festival 2026',
        content: 'Look 10/10! O enquadramento ficou impecável ✨',
        timestamp: 'há 2 min',
        createdAt: Date.now() - 120000
      },
      {
        id: 'act_init_3',
        aiUser: AI_HUMAN_PROFILES[1],
        type: 'community_post',
        targetTitle: 'Mural da Pista',
        content: 'Galera, as fotos de ontem do Privilège já subiram em 8K! Reconhecimento facial achou tudo em 1s 🚀',
        timestamp: 'há 4 min',
        createdAt: Date.now() - 240000
      }
    ];
  }

  // Minute-by-minute Social Interactions & Battles
  public startAutoInteractionLoop(intervalMs: number = 8000) {
    if (this.interactionIntervalId) return;
    this.isRunning = true;

    this.interactionIntervalId = window.setInterval(() => {
      // 10% chance to create a brand new dynamic AI profile automatically
      if (Math.random() < 0.12) {
        this.createDynamicAIProfile();
      } else {
        this.triggerRandomAIInteraction();
      }
    }, intervalMs);
  }

  // 10-Minute Photo Auto-Publish Loop
  public startAutoPhotoPublishLoop(intervalMs: number = 600000) { // 10 minutes = 600,000ms
    if (this.photoPublishIntervalId) return;

    this.photoPublishIntervalId = window.setInterval(() => {
      this.publishDynamicEventPhoto();
    }, intervalMs);
  }

  public stopAutoLoops() {
    if (this.interactionIntervalId) {
      clearInterval(this.interactionIntervalId);
      this.interactionIntervalId = null;
    }
    if (this.photoPublishIntervalId) {
      clearInterval(this.photoPublishIntervalId);
      this.photoPublishIntervalId = null;
    }
    this.isRunning = false;
  }

  // Creates a brand new AI profile and registers in database
  public createDynamicAIProfile(): AIHumanProfile {
    this.generatedCount += 1;
    const firstNames = ['Camila', 'Felipe', 'Mariana', 'Enzo', 'Carolina', 'Gustavo', 'Leticia', 'Vinicius', 'Laura', 'Vitor'];
    const lastNames = ['Costa', 'Almeida', 'Martins', 'Ribeiro', 'Barbosa', 'Castilho', 'Ferraz', 'Moraes', 'Fontes'];
    const cities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Florianópolis', state: 'SC' },
      { city: 'Curitiba', state: 'PR' },
      { city: 'Belo Horizonte', state: 'MG' }
    ];

    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fn} ${ln}`;
    const handle = `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(Math.random() * 899) + 100}`;
    const email = `${handle}@meflagrou.com`;
    const loc = cities[Math.floor(Math.random() * cities.length)];
    const avatar = AI_HUMAN_PROFILES[Math.floor(Math.random() * AI_HUMAN_PROFILES.length)].avatar;

    const newProfile: AIHumanProfile = {
      id: `ai_dynamic_${Date.now()}_${this.generatedCount}`,
      name: fullName,
      handle: handle,
      email: email,
      avatar: avatar,
      bio: `Apaixonado(a) por música eletrônica e festivais! Novo membro VIP meflagrou ✨🪩`,
      role: 'VIP Member',
      vipTier: 'VIP Diamante',
      personality: 'party_lover',
      favoriteFestivals: ['Sunset Festival', 'Tomorrowland Brasil']
    };

    // Add to engine profiles list
    AI_HUMAN_PROFILES.unshift(newProfile);

    // Add to global User database
    const newDbUser: UserProfile = {
      id: newProfile.id,
      name: newProfile.name,
      handle: newProfile.handle,
      email: newProfile.email,
      avatar: newProfile.avatar,
      bio: newProfile.bio,
      city: loc.city,
      state: loc.state,
      verifiedAt: new Date().toISOString().split('T')[0],
      facialDescriptor: [0.5, 0.2, 0.8, -0.4, 0.3, 0.7, -0.2, 0.6, 0.1, 0.9],
      faceSignatureId: `MF-BIO-NEW-${this.generatedCount}`,
      totalPhotosCount: 4,
      eventsCount: 2,
      attendedEvents: ['Sunset Festival 2026'],
      topFriends: [{ userId: 'user_founder', name: 'Meflagrou Oficial', handle: 'meflagrou', avatar: '/founder_avatar.jpg', sharedPhotosCount: 2 }],
      socialLinks: { instagram: handle },
      privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true }
    };

    MOCK_USERS.unshift(newDbUser);

    // Emit event
    const event: AIActivityEvent = {
      id: `act_reg_${Date.now()}`,
      aiUser: newProfile,
      type: 'profile_created',
      targetTitle: 'Cadastro de Novo Membro VIP',
      content: `Novo perfil biométrico ativado: ${newProfile.name} (@${newProfile.handle}) com email ${newProfile.email}!`,
      timestamp: 'agora mesmo',
      createdAt: Date.now()
    };

    this.emitActivity(event);
    return newProfile;
  }

  // Publishes a brand new Event Photo in MOCK_PHOTOS every 10 minutes
  public publishDynamicEventPhoto(): EventPhoto {
    const photoId = `photo_auto_${Date.now()}`;
    const randomUrl = AUTO_PHOTO_URLS[Math.floor(Math.random() * AUTO_PHOTO_URLS.length)];
    const eventName = AUTO_EVENT_NAMES[Math.floor(Math.random() * AUTO_EVENT_NAMES.length)];
    const taggedAI = AI_HUMAN_PROFILES[Math.floor(Math.random() * AI_HUMAN_PROFILES.length)];

    const newPhoto: EventPhoto = {
      id: photoId,
      url: randomUrl,
      thumbnailUrl: randomUrl,
      highResUrl: randomUrl,
      eventId: 'evt_sunset_2026',
      eventName: eventName,
      eventDate: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      location: 'Palco Principal • Front Stage',
      city: 'São Paulo, SP',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      photographer: {
        name: 'Studio meflagrou.com',
        handle: 'meflagrou_creator',
        avatar: '/founder_avatar.jpg',
        camera: 'Sony Alpha 1 (50.1 MP)',
        lens: 'FE 85mm f/1.4 GM II',
      },
      exif: {
        iso: '400',
        shutter: '1/800s',
        aperture: 'f/1.4',
        focalLength: '85mm',
        camera: 'Sony Alpha 1',
      },
      tags: [
        {
          id: `tag_${photoId}_1`,
          userId: taggedAI.id,
          userName: taggedAI.name,
          userHandle: taggedAI.handle,
          userAvatar: taggedAI.avatar,
          confidence: 99.2,
          boundingBox: { x: 35, y: 20, width: 30, height: 40 },
        },
        {
          id: `tag_${photoId}_2`,
          userId: 'user_founder',
          userName: 'Meflagrou Oficial',
          userHandle: 'meflagrou',
          userAvatar: '/founder_avatar.jpg',
          confidence: 98.8,
          boundingBox: { x: 65, y: 22, width: 25, height: 35 },
        }
      ],
      aspectRatio: 'landscape',
      likesCount: 18,
      isFeatured: true,
      resolution: '8192 x 5464 (45 MP Ultra HD)',
      fileSize: '14.2 MB',
      forSaleByOwner: true,
      ownerPrice: 29.80,
      ownerSellerId: 'user_founder',
      tradingData: {
        generation: 1,
        currentOwnerId: 'user_founder',
        currentOwnerName: 'Meflagrou Oficial',
        currentOwnerHandle: 'meflagrou',
        currentOwnerAvatar: '/founder_avatar.jpg',
        boughtAtPrice: 14.90,
        currentListingPrice: 29.80,
        trades: []
      }
    };

    // Prepend to Global Photos
    MOCK_PHOTOS.unshift(newPhoto);

    // Emit event
    const event: AIActivityEvent = {
      id: `act_pub_${Date.now()}`,
      aiUser: taggedAI,
      type: 'photo_published',
      targetTitle: eventName,
      content: `📸 Nova foto 8K publicada no ${eventName}! Identificados: @${taggedAI.handle} e @meflagrou`,
      timestamp: 'agora mesmo',
      createdAt: Date.now()
    };

    this.emitActivity(event);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newPhotoPublished', { detail: newPhoto }));
    }

    return newPhoto;
  }

  public triggerRandomAIInteraction(): AIActivityEvent {
    const randomAI = AI_HUMAN_PROFILES[Math.floor(Math.random() * AI_HUMAN_PROFILES.length)];
    const types: AIActivityEvent['type'][] = [
      'photo_like', 
      'photo_comment', 
      'battle_vote', 
      'battle_comment', 
      'community_post'
    ];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let targetTitle = 'Sunset Festival 2026';
    let content = '';

    switch (chosenType) {
      case 'photo_like':
        targetTitle = 'Foto VIP na Pista Principal';
        content = 'Curtiu o flagra em alta resolução!';
        break;
      case 'photo_comment':
        targetTitle = 'Tomorrowland Brasil Mainstage';
        content = PHOTO_COMMENTS[Math.floor(Math.random() * PHOTO_COMMENTS.length)];
        break;
      case 'battle_vote':
        targetTitle = `Batalha 1x1 • Rodada #${Math.floor(Math.random() * 8) + 1}`;
        content = `Votou no look ${Math.random() > 0.5 ? 'Foto A' : 'Foto B'}!`;
        break;
      case 'battle_comment':
        targetTitle = 'Batalha de Flagras da Noite';
        content = BATTLE_COMMENTS[Math.floor(Math.random() * BATTLE_COMMENTS.length)];
        break;
      case 'community_post':
        targetTitle = 'Comunidade meflagrou';
        content = COMMUNITY_POSTS[Math.floor(Math.random() * COMMUNITY_POSTS.length)];
        break;
    }

    const newActivity: AIActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      aiUser: randomAI,
      type: chosenType,
      targetTitle,
      content,
      timestamp: 'agora mesmo',
      createdAt: Date.now()
    };

    this.emitActivity(newActivity);
    return newActivity;
  }

  private emitActivity(event: AIActivityEvent) {
    this.activities = [event, ...this.activities.slice(0, 40)];

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in AI activity listener:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aiHumanActivity', { detail: event }));
    }
  }

  public subscribe(listener: (event: AIActivityEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getActivities(): AIActivityEvent[] {
    return this.activities;
  }

  public getAIProfiles(): AIHumanProfile[] {
    return AI_HUMAN_PROFILES;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const aiHumanEngine = new AIHumanService();

