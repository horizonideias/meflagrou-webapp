import React, { useState } from 'react';
import { Plus, Crown, Video, Radio } from 'lucide-react';
import type { UserProfile } from '../types';
import { type StoryItem } from '../data/mockStories';
import { haptics } from '../utils/haptics';

interface InstagramStoriesTrayProps {
  currentUser: UserProfile;
  stories: StoryItem[];
  onOpenStory: (story: StoryItem) => void;
  onOpenUpload?: () => void;
  onOpenLive?: (channelId?: string) => void;
}

export const InstagramStoriesTray: React.FC<InstagramStoriesTrayProps> = ({
  currentUser,
  stories,
  onOpenStory,
  onOpenUpload,
  onOpenLive,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // 1. Fixed Logged-in User Story on the Left
  const userStory = stories.find(s => s.authorId === currentUser.id) || {
    id: `story_user_${currentUser.id}`,
    authorId: currentUser.id,
    authorName: currentUser.name,
    authorHandle: currentUser.handle,
    authorAvatar: currentUser.avatar,
    authorType: currentUser.id === 'user_founder' ? 'founder' : 'client',
    badge: currentUser.id === 'user_founder' ? '👑 Master Oficial' : 'VIP Member',
    isDeus: currentUser.id === 'user_founder',
    slides: [],
  };

  // Filter out current user and take a curated set of other stories
  const otherStories = stories.filter(s => s.authorId !== currentUser.id).slice(0, 18);
  // Duplicate exactly once for an ultra-smooth, lightweight infinite GPU marquee loop
  const loopStories = [...otherStories, ...otherStories];

  const isFounder = currentUser.id === 'user_founder';

  return (
    <div className="instagram-stories-wrapper">
      {/* ========================================================================= */}
      {/* 📌 1. FIXED USER STORY (PINNED PERMANENTLY ON THE LEFT) */}
      {/* ========================================================================= */}
      <div className="stories-fixed-user-section">
        <div
          onClick={() => onOpenStory(userStory as StoryItem)}
          className="story-avatar-item fixed-user-item"
          title="Seu Story (Clique para ver ou postar)"
        >
          <div className={`story-ring ${isFounder ? 'ring-founder' : 'ring-user'} ring-pulse-glow`}>
            <div className="story-ring-inner">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="story-avatar-image story-animated-video-avatar motion-drift-0"
              />
            </div>

            {/* Post Story Plus Badge */}
            <div
              className="story-add-badge"
              onClick={(e) => {
                if (onOpenUpload) {
                  e.stopPropagation();
                  onOpenUpload();
                }
              }}
              title="Adicionar novo Flagra aos Stories"
            >
              <Plus size={12} color="#07080c" strokeWidth={3} />
            </div>

            {isFounder && (
              <div className="story-crown-badge">
                <Crown size={10} color="#07080c" />
              </div>
            )}
          </div>

          <span className="story-username-label font-bold user-fixed-label">
            Seu Story
          </span>
        </div>

        {/* Vertical Neon Divider */}
        <div className="stories-vertical-neon-divider" />
      </div>

      {/* ========================================================================= */}
      {/* 🔄 2. FAST & SILKY GPU-ACCELERATED MARQUEE OF ANIMATED STORIES */}
      {/* ========================================================================= */}
      <div 
        className="stories-marquee-track-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
      >
        <div className={`stories-marquee-track ${isPaused ? 'paused' : ''}`}>
          {loopStories.map((story, index) => {
            const isStoryFounder = story.isDeus || story.authorId === 'user_founder';
            const driftVariant = index % 3;

            return (
              <div
                key={`${story.id}_${index}`}
                onClick={() => {
                  haptics.lightTick();
                  if (story.isLive && onOpenLive) {
                    onOpenLive(story.liveChannelId);
                  } else {
                    onOpenStory(story);
                  }
                }}
                className="story-avatar-item animated-video-story-item"
              >
                {/* Conic Ring */}
                <div
                  className={`story-ring story-animated-video-ring ${
                    story.isLive ? 'ring-live' : isStoryFounder ? 'ring-founder' : 'ring-active'
                  }`}
                  style={story.isLive ? {
                    background: 'conic-gradient(from 0deg, #ff0055, #ff007a, #ffb703, #ff0055)',
                    boxShadow: '0 0 16px rgba(255, 0, 122, 0.7)'
                  } : undefined}
                >
                  <div className="story-ring-inner">
                    <img
                      src={story.authorAvatar}
                      alt={story.authorName}
                      className={`story-avatar-image story-animated-video-avatar motion-drift-${driftVariant}`}
                    />
                  </div>

                  {/* Equalizer Audio Bars */}
                  {!story.isLive && (
                    <div className="story-video-equalizer-pill">
                      <span className="eq-bar bar-1" />
                      <span className="eq-bar bar-2" />
                      <span className="eq-bar bar-3" />
                    </div>
                  )}

                  {story.isLive ? (
                    <div style={{
                      position: 'absolute',
                      bottom: -4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#ff0055',
                      color: '#fff',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      padding: '1px 5px',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      boxShadow: '0 0 8px rgba(255,0,85,0.8)'
                    }}>
                      <Radio size={8} className="animate-pulse" />
                      <span>AO VIVO</span>
                    </div>
                  ) : isStoryFounder ? (
                    <div className="story-crown-badge">
                      <Crown size={10} color="#07080c" />
                    </div>
                  ) : (
                    <div className="story-video-tag-badge" title="Vídeo Animado">
                      <Video size={9} color="#ffffff" />
                    </div>
                  )}
                </div>

                {/* Username label */}
                <span className="story-username-label" style={story.isLive ? { color: '#ff007a', fontWeight: 800 } : undefined}>
                  {story.authorName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
