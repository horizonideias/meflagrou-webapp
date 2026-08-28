import type { EventPhoto, UserProfile } from '../types';

// Curated pool of high-resolution scene images for candidate categories
const FESTIVAL_SCENES = [
  {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Sunset Festival 2026 // Frontstage VIP',
    location: 'Cafe de La Musique - Palco Principal',
    category: 'Festival'
  },
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Tomorrowland Brasil • Mainstage 8K',
    location: 'Parque Maeda - Camarote VIP',
    category: 'Festival'
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Warung Beach Club • Underground Session',
    location: 'Itajaí - Pista Garden',
    category: 'Balada / Club'
  },
  {
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Privilège Club Neon Night',
    location: 'Privilège Lounge Exclusivo',
    category: 'Club / Balada'
  }
];

const BAR_LOUNGE_SCENES = [
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Bar Brahma VIP • Camarote Musical',
    location: 'Bar Brahma Centro Histórico - Deck VIP',
    category: 'Bar & Lounge'
  },
  {
    url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Tetto Rooftop Lounge • Sunset Cocktails',
    location: 'Tetto Rooftop Jardins - Lounge 360°',
    category: 'Rooftop & Bar'
  },
  {
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Boteco Chic Premium & Drinks',
    location: 'Vila Madalena - Mesa de Honra',
    category: 'Bar & Gastronomia'
  },
  {
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Café de La Musique Sunset Bar',
    location: 'Guarujá - Lounge Praia VIP',
    category: 'Beach Lounge'
  }
];

const FOOTBALL_ARENA_SCENES = [
  {
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Camarote Allianz Parque • Matchday VIP',
    location: 'Allianz Parque - Camarote FanZone',
    category: 'Futebol & Estádio'
  },
  {
    url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Maracanã VIP Lounge • Noite de Clássico',
    location: 'Estádio do Maracanã - Setor Maracanã Mais',
    category: 'Futebol & Estádio'
  },
  {
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Neo Química Arena • Camarote Fiel Premium',
    location: 'Arena Corinthians - Camarote Panorâmico',
    category: 'Futebol & Estádio'
  },
  {
    url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
    eventName: 'Arena MRV • Lounge dos Campeões',
    location: 'Arena MRV - Camarote Ouro',
    category: 'Futebol & Estádio'
  }
];

const PHOTOGRAPHERS = [
  {
    name: 'Studio meflagrou.com',
    handle: 'meflagrou_creator',
    avatar: '/founder_avatar.jpg',
    camera: 'Sony Alpha 1 (50.1 MP)',
    lens: 'FE 85mm f/1.4 GM II'
  },
  {
    name: 'Rafael Clicks',
    handle: 'rafael_clicks',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    camera: 'Sony A7R V (61 MP)',
    lens: 'FE 24-70mm f/2.8 GM'
  },
  {
    name: 'Beatriz Lens',
    handle: 'bia_lens',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    camera: 'Canon EOS R5 (45 MP)',
    lens: 'RF 50mm f/1.2L USM'
  }
];

/**
 * Returns at least 3 distinct candid photos tagged with the given user in:
 * 1. Festas e Festivais
 * 2. Bares e Lounges
 * 3. Futebol e Estádios
 */
export function generateUserSamplePhotos(user: UserProfile): EventPhoto[] {
  // Deterministic seed based on user id or handle
  let seed = 0;
  for (let i = 0; i < user.id.length; i++) {
    seed += user.id.charCodeAt(i);
  }

  const festScene = FESTIVAL_SCENES[seed % FESTIVAL_SCENES.length];
  const barScene = BAR_LOUNGE_SCENES[(seed + 1) % BAR_LOUNGE_SCENES.length];
  const soccerScene = FOOTBALL_ARENA_SCENES[(seed + 2) % FOOTBALL_ARENA_SCENES.length];

  const scenes = [festScene, barScene, soccerScene];

  return scenes.map((sc, idx) => {
    const photog = PHOTOGRAPHERS[(seed + idx) % PHOTOGRAPHERS.length];
    const photoId = `user_photo_${user.id}_${idx + 1}`;

    return {
      id: photoId,
      url: sc.url,
      thumbnailUrl: sc.url,
      highResUrl: sc.url,
      eventId: `evt_gen_${seed}_${idx}`,
      eventName: sc.eventName,
      eventDate: idx === 0 ? '14 de Fevereiro, 2026' : idx === 1 ? 'Ontem às 22:30' : 'Fim de Semana Passado',
      location: sc.location,
      city: user.city ? `${user.city}, ${user.state}` : 'São Paulo, SP',
      time: idx === 0 ? '04:15 AM' : idx === 1 ? '10:45 PM' : '06:30 PM',
      photographer: photog,
      exif: {
        iso: '400',
        shutter: '1/800s',
        aperture: 'f/1.4',
        focalLength: '85mm',
        camera: photog.camera
      },
      tags: [
        {
          id: `tag_${photoId}_user`,
          userId: user.id,
          userName: user.name,
          userHandle: user.handle,
          userAvatar: user.avatar,
          confidence: 99.4,
          boundingBox: { x: 30 + (idx * 5), y: 18, width: 35, height: 42 }
        },
        {
          id: `tag_${photoId}_founder`,
          userId: 'user_founder',
          userName: 'Meflagrou Oficial',
          userHandle: 'meflagrou',
          userAvatar: '/founder_avatar.jpg',
          confidence: 98.6,
          boundingBox: { x: 68, y: 22, width: 26, height: 32 }
        }
      ],
      aspectRatio: 'landscape',
      likesCount: 38 + ((seed + idx * 17) % 180),
      isFeatured: idx === 0,
      resolution: '8192 x 5464 (45 MP Ultra HD)',
      fileSize: '12.4 MB',
      forSaleByOwner: true,
      ownerPrice: 29.80,
      ownerSellerId: user.id,
      tradingData: {
        generation: 1 + (idx % 2),
        currentOwnerId: user.id,
        currentOwnerName: user.name,
        currentOwnerHandle: user.handle,
        currentOwnerAvatar: user.avatar,
        boughtAtPrice: 14.90,
        currentListingPrice: 29.80,
        trades: []
      }
    };
  });
}
