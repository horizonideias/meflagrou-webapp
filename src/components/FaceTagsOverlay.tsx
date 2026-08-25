import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';
import type { EventPhoto, UserProfile } from '../types';

interface FaceTagsOverlayProps {
  photo: EventPhoto;
  isVisible: boolean;
  onSelectUser?: (user: UserProfile) => void;
}

export const FaceTagsOverlay: React.FC<FaceTagsOverlayProps> = ({
  photo,
  isVisible,
  onSelectUser,
}) => {
  if (!isVisible || !photo.tags || photo.tags.length === 0) return null;

  return (
    <div className="face-tags-overlay-layer" aria-hidden="false">
      {photo.tags.map((tag, idx) => {
        const defaultPositions = [
          { top: '38%', left: '42%' },
          { top: '44%', left: '68%' },
          { top: '32%', left: '26%' },
        ];
        const pos = defaultPositions[idx % defaultPositions.length];

        return (
          <div
            key={tag.userId}
            className="face-detected-pin"
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectUser) {
                onSelectUser({
                  id: tag.userId,
                  name: tag.userName,
                  handle: tag.userName.toLowerCase().replace(/\s+/g, '.'),
                  avatar: `https://images.unsplash.com/photo-${1534528741775 + idx}?w=150&auto=format&fit=crop&q=80`,
                  city: 'São Paulo',
                  state: 'SP',
                  bio: 'Amante de festivais e música eletrônica.',
                  eventsCount: 12,
                  totalPhotosCount: 24,
                  verifiedAt: '2026-08-01',
                  facialDescriptor: [],
                  faceSignatureId: `sig_${tag.userId}`,
                  attendedEvents: [photo.eventName],
                  socialLinks: { instagram: `@${tag.userName.toLowerCase().replace(/\s+/g, '.')}` },
                  privacySettings: { isPublic: true, allowTagging: true, notifyOnNewPhoto: true },
                  topFriends: [],
                });
              }
            }}
          >
            {/* Holographic Face Frame Box */}
            <div className="face-bounding-box-ai">
              <span className="ai-corner top-left" />
              <span className="ai-corner top-right" />
              <span className="ai-corner bottom-left" />
              <span className="ai-corner bottom-right" />
              
              <div className="ai-confidence-indicator">
                <Sparkles size={8} />
                <span>99.4% IA Match</span>
              </div>
            </div>

            {/* Profile Avatar & Tag Pill */}
            <div className="face-tag-profile-pill">
              <div className="face-tag-avatar-wrap">
                <UserCheck size={11} color="var(--accent-teal)" />
              </div>
              <span className="face-tag-name">@{tag.userName.toLowerCase().replace(/\s+/g, '.')}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
