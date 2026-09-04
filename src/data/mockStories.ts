import { SEED_PROFILES_1000 } from './seedProfiles1000';
import { MOCK_PHOTOS } from './mockDatabase';

export interface StorySlide {
  id: string;
  mediaUrl: string;
  caption: string;
  location: string;
  timestamp: string;
  likesCount: number;
  eventName: string;
}

export interface StoryItem {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorType: 'founder' | 'photographer' | 'client';
  badge: string;
  isDeus?: boolean;
  isLive?: boolean;
  liveViewerCount?: number;
  liveChannelId?: string;
  rankPosition?: number; // 1 = #1 DEUS, 2 = #2 Top Fotografo, 3 = #3 Top VIP
  isPinnedTop?: boolean;
  slides: StorySlide[];
}

// TOP 3 PINNED STORIES IN THE RANKING
const PINNED_TOP_3_STORIES: StoryItem[] = [
  {
    id: 'story_rank_1_deus',
    authorId: 'user_founder',
    authorName: 'Meflagrou Oficial',
    authorHandle: 'meflagrou',
    authorAvatar: '/founder_avatar.jpg',
    authorType: 'founder',
    badge: '👑 RANK #1 • Fundador & VIP Master',
    isDeus: true,
    isLive: true,
    liveViewerCount: 2480,
    liveChannelId: 'live_sunset_01',
    rankPosition: 1,
    isPinnedTop: true,
    slides: [
      {
        id: 'deus_slide_1',
        mediaUrl: MOCK_PHOTOS[0]?.url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Sunset Festival no frontstage exclusivo! Acervo 999,99 ativo ✨',
        location: 'São Paulo, SP',
        timestamp: 'Há 12 min',
        likesCount: 980,
        eventName: 'Sunset Festival 2026'
      },
      {
        id: 'deus_slide_2',
        mediaUrl: MOCK_PHOTOS[1]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        caption: 'Privilège Club Neon Night! Todos os flagras indexados com IA 🚀',
        location: 'Itajaí, SC',
        timestamp: 'Há 45 min',
        likesCount: 840,
        eventName: 'Privilège Club Neon Night'
      },
      {
        id: 'deus_slide_3',
        mediaUrl: MOCK_PHOTOS[2]?.url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tomorrowland Brasil Mainstage • A maior cobertura do ano! 💥',
        location: 'Itu, SP',
        timestamp: 'Há 2 horas',
        likesCount: 1250,
        eventName: 'Tomorrowland Brasil'
      }
    ]
  },
  {
    id: 'story_rank_2_studio',
    authorId: 'photog_studio_meflagrou',
    authorName: 'Studio meflagrou',
    authorHandle: 'meflagrou_creator',
    authorAvatar: '/founder_avatar.jpg',
    authorType: 'photographer',
    badge: '🥈 RANK #2 • Fotógrafo Criador Master',
    rankPosition: 2,
    isPinnedTop: true,
    slides: [
      {
        id: 'studio_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        caption: 'Lentes Sony G-Master 85mm f/1.4 prontas para o backstage!',
        location: 'Warung Beach Club',
        timestamp: 'Há 30 min',
        likesCount: 620,
        eventName: 'Warung Beach Club'
      },
      {
        id: 'studio_slide_2',
        mediaUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
        caption: 'Iluminação virtual IA em ação nos flagras de hoje! ✨',
        location: 'Laroc Club',
        timestamp: 'Há 1 hora',
        likesCount: 540,
        eventName: 'Laroc Club'
      }
    ]
  },
  {
    id: 'story_rank_3_isabela',
    authorId: 'user_isabela_rocha',
    authorName: 'Isabela Rocha',
    authorHandle: 'isa_rocha',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    authorType: 'client',
    badge: '🥉 RANK #3 • Top VIP Diamante Brasil',
    rankPosition: 3,
    isPinnedTop: true,
    slides: [
      {
        id: 'isa_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Encontrei todos os meus flagras da noite com 1 olhar na câmera! 💖',
        location: 'São Paulo, SP',
        timestamp: 'Há 18 min',
        likesCount: 510,
        eventName: 'Privilège Neon Night'
      }
    ]
  }
];

// TOP PHOTOGRAPHERS STORIES
const TOP_PHOTOGRAPHERS_STORIES: StoryItem[] = [
  {
    id: 'story_photog_rafael',
    authorId: 'photog_rafael_clicks',
    authorName: 'Rafael Clicks',
    authorHandle: 'rafael_clicks',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    authorType: 'photographer',
    badge: '📸 Top Pro Fotógrafo 8K',
    slides: [
      {
        id: 'rafa_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
        caption: '1.420 flagras disparados e enviados para o servidor em tempo real 📸🔥',
        location: 'Green Valley',
        timestamp: 'Há 40 min',
        likesCount: 380,
        eventName: 'Green Valley Night'
      }
    ]
  },
  {
    id: 'story_photog_beatriz',
    authorId: 'photog_bia_lens',
    authorName: 'Beatriz Lens',
    authorHandle: 'bia_lens',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    authorType: 'photographer',
    badge: '📸 Fotógrafa Sunset Especialista',
    slides: [
      {
        id: 'bia_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pôr do sol incrível no rooftop! Fotos sem compressão já no ar 🌅',
        location: 'Rio de Janeiro, RJ',
        timestamp: 'Há 1 hora',
        likesCount: 420,
        eventName: 'Rooftop Sunset'
      }
    ]
  },
  {
    id: 'story_photog_thiago',
    authorId: 'photog_thiago_lens',
    authorName: 'Thiago Sampaio',
    authorHandle: 'thiago.lens',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    authorType: 'photographer',
    badge: '📸 Fotógrafo Master Clubbing',
    slides: [
      {
        id: 'thiago_slide_1',
        mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cobertura completa do frontstage com biometria facial ativada ⚡',
        location: 'Laroc Club',
        timestamp: 'Há 1 hora',
        likesCount: 360,
        eventName: 'Laroc Club Sunset'
      }
    ]
  }
];

const STORY_MEDIA_POOL = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80'
];

const STORY_CAPTIONS = [
  'A vibe dessa pista tá surreal! Encontrei todos os meus flagras no meflagrou ✨🪩',
  'Front stage garantido com a galera! Flagras 8K sem compressão 🔥',
  'Noite inesquecível no camarote, reconhecimento facial achou minhas fotos em 1 segundo! 😍',
  'Look aprovado! Já baixei minhas fotos em Ultra HD 👑📸',
  'Melhor festa do ano! Voto em todas as batalhas da noite ⚔️⚡',
  'Curtindo o som no front, foto oficial já disponível no app 🚀',
  'Energia surreal até o amanhecer 🌅🍸'
];

// Generate Stories for the 1,000 AI Profiles
export function generate1000ProfileStories(): StoryItem[] {
  const profileStories: StoryItem[] = [];

  // Generate stories for the 1,000 profiles
  SEED_PROFILES_1000.forEach((profile, index) => {
    const media = STORY_MEDIA_POOL[index % STORY_MEDIA_POOL.length];
    const caption = STORY_CAPTIONS[index % STORY_CAPTIONS.length];
    const eventName = profile.attendedEvents[0] || 'Sunset Festival 2026';
    const timestamp = `Há ${15 + (index % 55)} min`;

    profileStories.push({
      id: `story_ai_${profile.id}`,
      authorId: profile.id,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorAvatar: profile.avatar,
      authorType: 'client',
      badge: `✨ VIP • ${profile.city}, ${profile.state}`,
      slides: [
        {
          id: `slide_ai_${profile.id}_1`,
          mediaUrl: media,
          caption: caption,
          location: `${profile.city}, ${profile.state}`,
          timestamp: timestamp,
          likesCount: 45 + (index % 250),
          eventName: eventName
        }
      ]
    });
  });

  return profileStories;
}

// Export all stories: Top 3 Fixed in Rank + Top Photographers + 1,000 Profiles
export const MOCK_STORIES: StoryItem[] = [
  ...PINNED_TOP_3_STORIES,
  ...TOP_PHOTOGRAPHERS_STORIES,
  ...generate1000ProfileStories()
];

/**
 * Returns stories with the logged-in user's story ALWAYS at index 0 (Seu Story),
 * followed by other users, photographers, and VIPs.
 */
export function getOrderedStories(
  currentUser: { id: string; name: string; handle: string; avatar: string; attendedEvents?: string[] } | null,
  baseStories: StoryItem[] = MOCK_STORIES
): StoryItem[] {
  if (!currentUser) return baseStories;

  // Check if currentUser already has a story in baseStories
  const existingIndex = baseStories.findIndex((s) => s.authorId === currentUser.id);

  let userStory: StoryItem;

  if (existingIndex >= 0) {
    const existing = baseStories[existingIndex];
    userStory = {
      ...existing,
      authorName: `${currentUser.name} (Você)`,
      isPinnedTop: true,
      badge: '👑 Seu Story • Flagras Ativos'
    };
  } else {
    // Synthesize a story for the logged-in user with their profile and mock photos
    userStory = {
      id: `story_logged_user_${currentUser.id}`,
      authorId: currentUser.id,
      authorName: `${currentUser.name} (Você)`,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      authorType: currentUser.id === 'user_founder' ? 'founder' : 'client',
      badge: '👑 Seu Story • Flagras Ativos',
      isDeus: currentUser.id === 'user_founder',
      isPinnedTop: true,
      slides: [
        {
          id: `slide_logged_${currentUser.id}_1`,
          mediaUrl: MOCK_PHOTOS[0]?.url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
          caption: 'Flagra exclusivo no Sunset Festival! Foto 8K disponível ✨',
          location: 'São Paulo, SP',
          timestamp: 'Agora mesmo',
          likesCount: 128,
          eventName: 'Sunset Festival 2026'
        },
        {
          id: `slide_logged_${currentUser.id}_2`,
          mediaUrl: MOCK_PHOTOS[1]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
          caption: 'Privilège Club Neon Night! Todos os flagras indexados 🚀',
          location: 'Itajaí, SC',
          timestamp: 'Há 15 min',
          likesCount: 94,
          eventName: 'Privilège Club Neon Night'
        }
      ]
    };
  }

  // Filter out the user story from the rest and place it at index 0
  const otherStories = baseStories.filter((s) => s.authorId !== currentUser.id && s.id !== userStory.id);

  return [userStory, ...otherStories];
}
