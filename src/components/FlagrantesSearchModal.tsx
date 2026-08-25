import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  User, 
  Users, 
  Camera, 
  Sparkles, 
  Calendar,
  Crown,
  MapPin,
  ArrowRight
} from 'lucide-react';
import type { UserProfile, EventPhoto } from '../types';
import { MOCK_USERS, MOCK_PHOTOS, MOCK_EVENTS } from '../data/mockDatabase';
import { soundFx } from '../services/biometricService';

interface FlagrantesSearchModalProps {
  isOpen: boolean;
  allUsers?: UserProfile[];
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  onSelectPhoto: (photo: EventPhoto) => void;
}

export const FlagrantesSearchModal: React.FC<FlagrantesSearchModalProps> = ({
  isOpen,
  allUsers,
  onClose,
  onSelectUser,
  onSelectPhoto,
}) => {
  const [query, setQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'flagrantes' | 'fotos' | 'eventos' | 'fotografos'>('flagrantes');
  const [selectedCity, setSelectedCity] = useState<string>('todas');

  // Filter Flagrantes (Users)
  const matchedUsers = useMemo(() => {
    let list = allUsers && allUsers.length > 0 ? allUsers : MOCK_USERS;
    if (selectedCity !== 'todas') {
      list = list.filter((u) => u.city.toLowerCase().includes(selectedCity.toLowerCase()));
    }
    if (!query.trim()) return list.slice(0, 30);

    const q = query.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q)
    );
  }, [query, selectedCity, allUsers]);

  // Filter Photos
  const matchedPhotos = useMemo(() => {
    if (!query.trim()) return MOCK_PHOTOS.slice(0, 18);
    const q = query.toLowerCase();
    return MOCK_PHOTOS.filter(
      (p) =>
        p.eventName.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.photographer.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.userName.toLowerCase().includes(q) || t.userHandle.toLowerCase().includes(q))
    );
  }, [query]);

  // Filter Events
  const matchedEvents = useMemo(() => {
    if (!query.trim()) return MOCK_EVENTS;
    const q = query.toLowerCase();
    return MOCK_EVENTS.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }, [query]);

  // Filter Photographers
  const matchedPhotographers = useMemo(() => {
    const photographersMap = new Map<string, { name: string; handle: string; avatar: string; photosCount: number; city: string }>();
    MOCK_PHOTOS.forEach((p) => {
      const h = p.photographer.handle;
      if (!photographersMap.has(h)) {
        photographersMap.set(h, {
          name: p.photographer.name,
          handle: p.photographer.handle,
          avatar: p.photographer.avatar,
          photosCount: 1,
          city: p.city,
        });
      } else {
        const item = photographersMap.get(h)!;
        item.photosCount += 1;
      }
    });

    const list = Array.from(photographersMap.values());
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  const handleUserClick = (user: UserProfile) => {
    soundFx.playRadarTick();
    onSelectUser(user);
    onClose();
  };

  const handlePhotoClick = (photo: EventPhoto) => {
    soundFx.playRadarTick();
    onSelectPhoto(photo);
    onClose();
  };

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div 
        className="flagrantes-search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="search-modal-header">
          <div className="search-input-field-wrap">
            <Search size={18} color="var(--accent-teal)" className="search-input-icon" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar flagrantes (usuários), festas, cidades ou fotógrafos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-modal-input"
            />
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="search-clear-query-btn"
                title="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button onClick={onClose} className="modal-close-btn" title="Fechar busca">
            <X size={20} />
          </button>
        </div>

        {/* Categories Tabs Bar */}
        <div className="search-categories-tabs-bar no-scrollbar">
          <button
            onClick={() => setActiveTab('flagrantes')}
            className={`search-tab-btn ${activeTab === 'flagrantes' ? 'active' : ''}`}
          >
            <Users size={14} />
            <span>Flagrantes / Usuários ({matchedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fotos')}
            className={`search-tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
          >
            <Camera size={14} />
            <span>Fotos & Flagras ({matchedPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('eventos')}
            className={`search-tab-btn ${activeTab === 'eventos' ? 'active' : ''}`}
          >
            <Calendar size={14} />
            <span>Festas & Baladas ({matchedEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fotografos')}
            className={`search-tab-btn ${activeTab === 'fotografos' ? 'active' : ''}`}
          >
            <Sparkles size={14} />
            <span>Fotógrafos ({matchedPhotographers.length})</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="search-city-filter-strip no-scrollbar">
          {['todas', 'São Paulo', 'Rio de Janeiro', 'Florianópolis', 'Itajaí', 'Campinas', 'Belo Horizonte'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`search-city-chip ${selectedCity === city ? 'active' : ''}`}
            >
              {city === 'todas' ? 'Todas as Cidades' : city}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="search-modal-results-body no-scrollbar">
          {/* TAB 1: FLAGRANTES (USUÁRIOS DO SITE) */}
          {activeTab === 'flagrantes' && (
            <div className="search-flagrantes-grid">
              {matchedUsers.length === 0 ? (
                <div className="search-empty-state">
                  <User size={38} color="var(--text-muted)" />
                  <p>Nenhum flagrante encontrado com o termo "{query}".</p>
                </div>
              ) : (
                matchedUsers.map((user) => {
                  const isFounder = user.id === 'user_founder';
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flagrante-user-card"
                    >
                      <div className="flagrante-avatar-wrapper">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="flagrante-avatar-img"
                        />
                        {isFounder ? (
                          <div className="flagrante-founder-badge" title="DEUS • Fundador">
                            <Crown size={10} color="#07080c" />
                          </div>
                        ) : (
                          <div className="flagrante-vip-badge">VIP</div>
                        )}
                      </div>

                      <div className="flagrante-details">
                        <div className="flagrante-name-row">
                          <h4 className="flagrante-name">{user.name}</h4>
                          <span className="flagrante-handle">@{user.handle}</span>
                        </div>
                        <div className="flagrante-city-row">
                          <MapPin size={11} color="var(--text-muted)" />
                          <span>{user.city}, {user.state}</span>
                          <span className="flagrante-dot-sep">•</span>
                          <span className="flagrante-photos-count">{user.totalPhotosCount} flagras</span>
                        </div>
                        {user.bio && (
                          <p className="flagrante-bio-snippet">{user.bio}</p>
                        )}
                      </div>

                      <button className="flagrante-view-profile-btn" title="Ver perfil e fotos">
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: FOTOS */}
          {activeTab === 'fotos' && (
            <div className="search-photos-grid">
              {matchedPhotos.length === 0 ? (
                <div className="search-empty-state">
                  <Camera size={38} color="var(--text-muted)" />
                  <p>Nenhum flagra fotográfico encontrado para "{query}".</p>
                </div>
              ) : (
                matchedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo)}
                    className="search-photo-card"
                  >
                    <img src={photo.thumbnailUrl || photo.url} alt={photo.eventName} className="search-photo-img" />
                    <div className="search-photo-overlay">
                      <span className="search-photo-event">{photo.eventName}</span>
                      <span className="search-photo-price">R$ {(photo.ownerPrice || 19.90).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: EVENTOS */}
          {activeTab === 'eventos' && (
            <div className="search-events-list">
              {matchedEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  className="search-event-card"
                  onClick={() => {
                    setQuery(evt.name);
                    setActiveTab('fotos');
                  }}
                >
                  <img src={evt.coverUrl} alt={evt.name} className="search-event-img" />
                  <div className="search-event-info">
                    <h4 className="search-event-title">{evt.name}</h4>
                    <span className="search-event-city">{evt.location} • {evt.city}</span>
                    <span className="search-event-date">{evt.date}</span>
                  </div>
                  <button className="btn-secondary search-event-view-btn">
                    Ver Flagras
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: FOTÓGRAFOS */}
          {activeTab === 'fotografos' && (
            <div className="search-flagrantes-grid">
              {matchedPhotographers.map((photog) => (
                <div
                  key={photog.handle}
                  className="flagrante-user-card"
                  onClick={() => {
                    setQuery(photog.name);
                    setActiveTab('fotos');
                  }}
                >
                  <div className="flagrante-avatar-wrapper">
                    <img src={photog.avatar} alt={photog.name} className="flagrante-avatar-img" />
                  </div>
                  <div className="flagrante-details">
                    <div className="flagrante-name-row">
                      <h4 className="flagrante-name">{photog.name}</h4>
                      <span className="flagrante-handle">{photog.handle}</span>
                    </div>
                    <div className="flagrante-city-row">
                      <Camera size={11} color="var(--accent-teal)" />
                      <span>Fotógrafo Credenciado</span>
                      <span className="flagrante-dot-sep">•</span>
                      <span className="flagrante-photos-count">{photog.photosCount} fotos postadas</span>
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    Ver Galeria
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
