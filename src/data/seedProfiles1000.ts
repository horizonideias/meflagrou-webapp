import type { UserProfile } from '../types';

// Roster of First Names, Last Names, Bios, Avatars, Cities and Events for 1,000 AI Profiles
const FIRST_NAMES = [
  'Sophia', 'Gabriel', 'Valentina', 'Thiago', 'Beatriz', 'Lucas', 'Camila', 'Matheus',
  'Isabela', 'Rafael', 'Helena', 'Rodrigo', 'Juliana', 'Felipe', 'Mariana', 'Enzo',
  'Larissa', 'Bruno', 'Manuela', 'Guilherme', 'Carolina', 'Gustavo', 'Amanda', 'Leonardo',
  'Bianca', 'Diego', 'Leticia', 'Vinicius', 'Laura', 'Vitor', 'Giovanna', 'Murilo',
  'Luiza', 'Caio', 'Fernanda', 'Danilo', 'Gabriela', 'Arthur', 'Alice', 'Renan',
  'Eduarda', 'Igor', 'Patricia', 'Marcelo', 'Lorena', 'Henrique', 'Clara', 'Danielle',
  'Tatiane', 'Alexandre', 'Vanessa', 'Andre', 'Yasmin', 'Breno', 'Jessica', 'Cesar',
  'Priscila', 'Hugo', 'Barbara', 'Samuel', 'Renata', 'Tiago', 'Bruna', 'Joao'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
  'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade',
  'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos',
  'Goncalves', 'Santana', 'Teixeira', 'Moura', 'Valente', 'Alencar', 'Rossi', 'Sampaio',
  'Duarte', 'Castilho', 'Ferraz', 'Bittencourt', 'Moraes', 'Fontes', 'Prado', 'Vasconcelos'
];

const CITIES_STATES = [
  { city: 'São Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Florianópolis', state: 'SC' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Brasília', state: 'DF' },
  { city: 'Goiânia', state: 'GO' },
  { city: 'Recife', state: 'PE' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Campinas', state: 'SP' },
  { city: 'Balneário Camboriú', state: 'SC' },
  { city: 'Vitória', state: 'ES' }
];

const AVATAR_POOLS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80'
];

const BIO_TEMPLATES = [
  'Apaixonado(a) por música eletrônica, festivais e pores do sol ✨🪩',
  'Clubber, apreciador(a) de fotografia 8K e boa gastronomia 🥂📸',
  'Front stage sempre garantido! Viciado(a) em registrar cada flagra da noite 🔥',
  'Fashion enthusiast, nightlife lover & embaixador(a) meflagrou 👑',
  'Se tem festival de música eletrônica ou funk chic, pode me procurar na pista ⚡🎧',
  'Produtor(a), viajante e fã das coberturas de alta resolução do meflagrou 🚀',
  'Vivendo intensamente cada fim de semana nas melhores pistas do Brasil 🍸🕺',
  'A vida é curta demais para perder os melhores flagras da noite 🌟'
];

const EVENT_POOL = [
  'Sunset Festival 2026',
  'Tomorrowland Brasil - Mainstage',
  'Privilège Club Neon Night',
  'Ultra Brasil 2026',
  'Baile do Copa Lux',
  'Techno Bunker Underground',
  'Warung Beach Club',
  'Green Valley Superclub',
  'Laroc Club Sunset',
  'Vintage Culture All Night Long',
  'Café de La Musique Guarujá',
  'Só Track Boa Festival',
  'Universo Paralello Festival',
  'Sutton São Paulo VIP'
];

export function generate1000AIProfiles(): UserProfile[] {
  const profiles: UserProfile[] = [];

  for (let i = 1; i <= 1000; i++) {
    const firstName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 13) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    
    // Clean handle for email & username
    const rawHandle = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 100 ? (i % 99) : ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._]/g, '');

    const email = `${rawHandle}@meflagrou.com`;
    const location = CITIES_STATES[i % CITIES_STATES.length];
    const avatar = AVATAR_POOLS[i % AVATAR_POOLS.length];
    const bio = BIO_TEMPLATES[i % BIO_TEMPLATES.length];

    // Pick 3-5 attended events
    const numEvents = 3 + (i % 4);
    const attendedEvents: string[] = [];
    for (let e = 0; e < numEvents; e++) {
      const ev = EVENT_POOL[(i + e * 3) % EVENT_POOL.length];
      if (!attendedEvents.includes(ev)) attendedEvents.push(ev);
    }

    // Generate deterministic 10-d facial descriptor embedding
    const facialDescriptor = [
      Math.sin(i * 0.31) * 0.8,
      Math.cos(i * 0.47) * 0.8,
      Math.sin(i * 0.19) * 0.7,
      Math.cos(i * 0.83) * 0.9,
      Math.sin(i * 0.65) * 0.6,
      Math.cos(i * 0.23) * 0.75,
      Math.sin(i * 0.91) * 0.85,
      Math.cos(i * 0.14) * 0.7,
      Math.sin(i * 0.58) * 0.65,
      Math.cos(i * 0.72) * 0.88
    ];

    const padId = String(i).padStart(4, '0');

    profiles.push({
      id: `user_ai_${padId}`,
      name: fullName,
      handle: rawHandle,
      email: email,
      avatar: avatar,
      bio: bio,
      city: location.city,
      state: location.state,
      verifiedAt: `2026-0${(i % 2) + 1}-${String((i % 28) + 1).padStart(2, '0')}`,
      facialDescriptor: facialDescriptor,
      faceSignatureId: `MF-BIO-AI-${padId}`,
      totalPhotosCount: 8 + (i % 35),
      eventsCount: attendedEvents.length,
      attendedEvents: attendedEvents,
      topFriends: [
        {
          userId: 'user_founder',
          name: 'Deus • Meflagrou',
          handle: 'meflagrou',
          avatar: '/founder_avatar.jpg',
          sharedPhotosCount: 4 + (i % 12)
        }
      ],
      socialLinks: {
        instagram: rawHandle,
        tiktok: `${rawHandle}_night`
      },
      privacySettings: {
        isPublic: true,
        allowTagging: true,
        notifyOnNewPhoto: true
      }
    });
  }

  return profiles;
}

export const SEED_PROFILES_1000: UserProfile[] = generate1000AIProfiles();
