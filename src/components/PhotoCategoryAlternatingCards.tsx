import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Crown, 
  Sun, 
  Radio, 
  ChevronRight, 
  Sparkles, 
  Wine, 
  Camera, 
  Music, 
  PartyPopper, 
  Users, 
  Glasses, 
  Zap, 
  Compass, 
  Disc, 
  Waves, 
  Gem 
} from 'lucide-react';
import type { EventPhoto } from '../types';
import { soundFx } from '../services/biometricService';

interface CategoryCardData {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  filterKey: 'todos' | 'vip' | 'festivais' | 'sp' | 'rio';
  photos: string[];
  eventNames: string[];
}

interface PhotoCategoryAlternatingCardsProps {
  allPhotos: EventPhoto[];
  selectedCategory: string;
  onSelectCategory: (category: 'todos' | 'vip' | 'festivais' | 'sp' | 'rio') => void;
  onOpenPhotoModal?: (photo: EventPhoto) => void;
}

// 🌟 18 Mini Cards de Categorias em Formato Story (9:16 / 1080x1920)
const CATEGORIES: CategoryCardData[] = [
    {
      id: 'cat_sunset',
      title: 'Sunset & Beach',
      badge: 'Pôr do Sol',
      icon: <Sun size={12} color="#ffb703" />,
      filterKey: 'sp',
      photos: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Sunset Festival', 'Cafe de La Musique', 'Warung Beach'],
    },
    {
      id: 'cat_rooftop',
      title: 'Rooftop Lounge',
      badge: 'Cocktails',
      icon: <Wine size={12} color="var(--accent-cyan)" />,
      filterKey: 'rio',
      photos: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Tetto Rooftop SP', 'Copacabana Skyline', 'Fasano Lounge'],
    },
    {
      id: 'cat_vip',
      title: 'Camarotes VIP',
      badge: 'Backstage',
      icon: <Crown size={12} color="var(--accent-gold)" />,
      filterKey: 'vip',
      photos: [
        '/founder_avatar.jpg',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Camarote Master', 'Privilège Gold', 'Copacabana VIP'],
    },
    {
      id: 'cat_portraits',
      title: 'Retratos 8K',
      badge: 'Looks da Noite',
      icon: <Camera size={12} color="var(--accent-teal)" />,
      filterKey: 'vip',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Close-up 8K', 'Fashion Look', 'VIP Glamour'],
    },
    {
      id: 'cat_festivais',
      title: 'Mainstage 8K',
      badge: 'Festivais',
      icon: <Flame size={12} color="var(--accent-magenta)" />,
      filterKey: 'festivais',
      photos: [
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Tomorrowland Brasil', 'Ultra Brasil 2026', 'Electric Stage'],
    },
    {
      id: 'cat_after',
      title: 'After & Techno',
      badge: 'Underground',
      icon: <Radio size={12} color="var(--accent-teal)" />,
      filterKey: 'rio',
      photos: [
        'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Techno Bunker SP', 'Galpão 52 After', 'Neon Rave 06h'],
    },
    {
      id: 'cat_beach_clubs',
      title: 'Beach Clubs',
      badge: 'Day Party',
      icon: <Waves size={12} color="var(--accent-cyan)" />,
      filterKey: 'sp',
      photos: [
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Bora Bora Club', 'Parador 12', 'P12 Jurerê'],
    },
    {
      id: 'cat_lasers',
      title: 'Laser & Pyro',
      badge: 'Efeitos 8K',
      icon: <Zap size={12} color="#ff007a" />,
      filterKey: 'festivais',
      photos: [
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Pyro Stage', 'Laser Beam Night', 'CO2 Blast Arena'],
    },
    {
      id: 'cat_champagne',
      title: 'Champagne VIP',
      badge: 'Brindes',
      icon: <PartyPopper size={12} color="var(--accent-gold)" />,
      filterKey: 'vip',
      photos: [
        'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&h=1920&q=80',
        '/founder_avatar.jpg',
      ],
      eventNames: ['Bagatelle Showers', 'Dom Pérignon Deck', 'Armand de Brignac'],
    },
    {
      id: 'cat_open_air',
      title: 'Open Air Vibes',
      badge: 'Pistas Abertas',
      icon: <Compass size={12} color="var(--accent-teal)" />,
      filterKey: 'sp',
      photos: [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Laroc Open Air', 'Green Valley Deck', 'Warung Garden'],
    },
    {
      id: 'cat_groups',
      title: 'Flagras em Grupo',
      badge: 'Galera VIP',
      icon: <Users size={12} color="var(--accent-cyan)" />,
      filterKey: 'todos',
      photos: [
        'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Mesa 01 Camarote', 'Backstage Crew', 'Amigos de Balada'],
    },
    {
      id: 'cat_fashion',
      title: 'Night Fashion',
      badge: 'Estilo & Look',
      icon: <Glasses size={12} color="#ff007a" />,
      filterKey: 'vip',
      photos: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Copa Red Carpet', 'Festival Outfit', 'Club Glamour'],
    },
    {
      id: 'cat_djs',
      title: 'DJs & Stage Sets',
      badge: 'Line-up PRO',
      icon: <Music size={12} color="var(--accent-teal)" />,
      filterKey: 'festivais',
      photos: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Vintage Culture', 'Alok Infinite', 'Mochakk Live'],
    },
    {
      id: 'cat_sunrise',
      title: 'Amanhecer 06h',
      badge: 'Sunrise Vibes',
      icon: <Sun size={12} color="#fb8500" />,
      filterKey: 'sp',
      photos: [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['D-EDGE Sunrise', 'Privilège 06h', 'Warung Morning'],
    },
    {
      id: 'cat_disco',
      title: 'Club & House',
      badge: 'Clubbing',
      icon: <Disc size={12} color="var(--accent-cyan)" />,
      filterKey: 'rio',
      photos: [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Privilège Neon', 'Ame Club House', 'Festa Disco 80s'],
    },
    {
      id: 'cat_pool',
      title: 'Pool Parties',
      badge: 'Verão VIP',
      icon: <Waves size={12} color="#00f5d4" />,
      filterKey: 'sp',
      photos: [
        'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Pool Sunset Party', 'Guarujá Day Club', 'Floripa Summer'],
    },
    {
      id: 'cat_gala',
      title: 'Gala & Black Tie',
      badge: 'Luxo Nobre',
      icon: <Gem size={12} color="var(--accent-gold)" />,
      filterKey: 'rio',
      photos: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&h=1920&q=80',
        '/founder_avatar.jpg',
      ],
      eventNames: ['Copacabana Palace', 'Baile Glamour', 'Salão Nobre VIP'],
    },
    {
      id: 'cat_vault',
      title: 'Master Vault',
      badge: 'Exclusivo Master',
      icon: <Sparkles size={12} color="#ffb703" />,
      filterKey: 'vip',
      photos: [
        '/founder_avatar.jpg',
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1080&h=1920&q=80',
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1080&h=1920&q=80',
      ],
      eventNames: ['Meflagrou Founder', 'Tetto Master Room', 'Tomorrowland 8K'],
    },
  ];

export const PhotoCategoryAlternatingCards: React.FC<PhotoCategoryAlternatingCardsProps> = ({
  allPhotos,
  selectedCategory,
  onSelectCategory,
  onOpenPhotoModal,
}) => {
  // 18 slide indexes with staggered intervals
  const [slideIndexes, setSlideIndexes] = useState<number[]>(new Array(18).fill(0));

  useEffect(() => {
    // 18 staggered intervals so all 18 cards alternate slides in a rhythmic, organic wave
    const intervals = CATEGORIES.map((cat, idx) => {
      const delay = 2800 + (idx % 6) * 450 + Math.floor(idx / 6) * 300;
      return setInterval(() => {
        setSlideIndexes((prev) => {
          const next = [...prev];
          next[idx] = (next[idx] + 1) % cat.photos.length;
          return next;
        });
      }, delay);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, []);

  const handleCardClick = (cat: CategoryCardData) => {
    soundFx.playRadarTick();
    onSelectCategory(cat.filterKey);
  };

  const handleCardDoubleTap = (activePhotoUrl: string) => {
    soundFx.playRadarTick();
    if (onOpenPhotoModal && allPhotos.length > 0) {
      const match = allPhotos.find(
        (p) => p.url === activePhotoUrl || p.highResUrl === activePhotoUrl
      );
      if (match) {
        onOpenPhotoModal(match);
      }
    }
  };

  return (
    <div className="category-alternating-grid-18">
      {CATEGORIES.map((cat, idx) => {
        const activeIdx = slideIndexes[idx];
        const activePhoto = cat.photos[activeIdx];
        const activeEvent = cat.eventNames[activeIdx];
        const isSelected = selectedCategory === cat.filterKey;

        return (
          <div
            key={cat.id}
            onClick={() => handleCardClick(cat)}
            onDoubleClick={() => handleCardDoubleTap(activePhoto)}
            className={`category-alternating-card-mini ${isSelected ? 'selected' : ''}`}
            title={`Filtrar por ${cat.title} • 2 toques para abrir galeria`}
          >
            {/* Background Sliding Photo */}
            <div className="cat-photo-slider">
              {cat.photos.map((photoUrl, pIdx) => (
                <img
                  key={pIdx}
                  src={photoUrl}
                  alt={cat.title}
                  className={`cat-slide-img ${pIdx === activeIdx ? 'active' : ''}`}
                  loading="lazy"
                />
              ))}
            </div>

            {/* Dark Gradient Backdrop */}
            <div className="cat-gradient-overlay" />

            {/* Top Indicator Bars (Story Progress Style) */}
            <div className="cat-story-indicators">
              {cat.photos.map((_, pIdx) => (
                <div
                  key={pIdx}
                  className={`cat-indicator-bar ${pIdx === activeIdx ? 'active' : ''}`}
                />
              ))}
            </div>

            {/* Top Badge */}
            <div className="cat-card-top-badge-mini">
              <span className="cat-icon-wrap">{cat.icon}</span>
              <span className="cat-badge-label-mini">{cat.badge}</span>
            </div>

            {/* Bottom Content */}
            <div className="cat-card-bottom-info-mini">
              <span className="cat-active-event-mini">{activeEvent}</span>
              <div className="cat-title-row-mini">
                <span className="cat-main-title-mini">{cat.title}</span>
                <ChevronRight size={12} className="cat-chevron" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
