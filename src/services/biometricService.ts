import type { UserProfile, ScanResult } from '../types';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import { dbService } from './databaseService';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playRadarTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  playLandmarkLock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  playScanSweep() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(850, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  playUnlockSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  playErrorBuzz() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(120, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  private beatIntervalId: number | null = null;

  startNightclubBeat() {
    this.stopNightclubBeat();
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    let beatCount = 0;
    const bpm = 124;
    const intervalMs = (60 / bpm) * 1000;

    this.beatIntervalId = window.setInterval(() => {
      try {
        if (this.isMuted) return;
        const c = this.getContext();
        if (!c) return;

        // Kick drum on beats
        const kickOsc = c.createOscillator();
        const kickGain = c.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(130, c.currentTime);
        kickOsc.frequency.exponentialRampToValueAtTime(38, c.currentTime + 0.08);
        kickGain.gain.setValueAtTime(0.08, c.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
        kickOsc.connect(kickGain);
        kickGain.connect(c.destination);
        kickOsc.start();
        kickOsc.stop(c.currentTime + 0.08);

        // Hi-hat on offbeats
        if (beatCount % 2 === 1) {
          const hatOsc = c.createOscillator();
          const hatGain = c.createGain();
          hatOsc.type = 'triangle';
          hatOsc.frequency.setValueAtTime(8000, c.currentTime);
          hatGain.gain.setValueAtTime(0.012, c.currentTime);
          hatGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
          hatOsc.connect(hatGain);
          hatGain.connect(c.destination);
          hatOsc.start();
          hatOsc.stop(c.currentTime + 0.04);
        }

        // Synth pulse every 4 beats
        if (beatCount % 4 === 0) {
          const synthOsc = c.createOscillator();
          const synthGain = c.createGain();
          synthOsc.type = 'sine';
          synthOsc.frequency.setValueAtTime(330, c.currentTime);
          synthOsc.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.25);
          synthGain.gain.setValueAtTime(0.025, c.currentTime);
          synthGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
          synthOsc.connect(synthGain);
          synthGain.connect(c.destination);
          synthOsc.start();
          synthOsc.stop(c.currentTime + 0.25);
        }

        beatCount++;
      } catch {
        // ignore
      }
    }, intervalMs);
  }

  stopNightclubBeat() {
    if (this.beatIntervalId) {
      clearInterval(this.beatIntervalId);
      this.beatIntervalId = null;
    }
  }
}

export const soundFx = new SoundSynthesizer();

export interface Point2D {
  x: number;
  y: number;
}

export function drawBiometricHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scanProgress: number, // 0 to 1
  isFaceLocked: boolean,
  currentStatus: string,
  userConfidence: number = 0
) {
  ctx.clearRect(0, 0, width, height);

  // Center coordinates
  const cx = width / 2;
  const cy = height / 2;
  const boxW = Math.min(width * 0.65, 320);
  const boxH = boxW * 1.25;
  const left = cx - boxW / 2;
  const top = cy - boxH / 2;
  const right = left + boxW;
  const bottom = top + boxH;

  // 1. Futuristic corner brackets
  const cornerLen = 30;
  const mainColor = isFaceLocked ? '#00f5d4' : '#00e5ff';
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 3;
  ctx.shadowColor = mainColor;
  ctx.shadowBlur = 10;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(left, top + cornerLen);
  ctx.lineTo(left, top);
  ctx.lineTo(left + cornerLen, top);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(right - cornerLen, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, top + cornerLen);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(right, bottom - cornerLen);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right - cornerLen, bottom);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(left + cornerLen, bottom);
  ctx.lineTo(left, bottom);
  ctx.lineTo(left, bottom - cornerLen);
  ctx.stroke();

  // 2. Oval face guide contour
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, boxW * 0.42, boxH * 0.44, 0, 0, Math.PI * 2);
  ctx.strokeStyle = isFaceLocked ? 'rgba(0, 245, 212, 0.4)' : 'rgba(0, 229, 255, 0.2)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // 3. Animated Biometric Landmark Mesh (Forehead, Eyes, Nose, Lips, Jaw)
  if (isFaceLocked) {
    const meshPoints: Point2D[] = [
      // Eyebrows / Forehead
      { x: cx - 45, y: cy - 65 },
      { x: cx - 25, y: cy - 75 },
      { x: cx, y: cy - 78 },
      { x: cx + 25, y: cy - 75 },
      { x: cx + 45, y: cy - 65 },

      // Left Eye
      { x: cx - 50, y: cy - 40 },
      { x: cx - 35, y: cy - 45 },
      { x: cx - 20, y: cy - 40 },
      { x: cx - 35, y: cy - 35 },

      // Right Eye
      { x: cx + 20, y: cy - 40 },
      { x: cx + 35, y: cy - 45 },
      { x: cx + 50, y: cy - 40 },
      { x: cx + 35, y: cy - 35 },

      // Nose Bridge & Tip
      { x: cx, y: cy - 30 },
      { x: cx, y: cy - 10 },
      { x: cx - 15, y: cy + 5 },
      { x: cx, y: cy + 10 },
      { x: cx + 15, y: cy + 5 },

      // Mouth
      { x: cx - 30, y: cy + 40 },
      { x: cx - 15, y: cy + 35 },
      { x: cx, y: cy + 36 },
      { x: cx + 15, y: cy + 35 },
      { x: cx + 30, y: cy + 40 },
      { x: cx + 15, y: cy + 48 },
      { x: cx, y: cy + 50 },
      { x: cx - 15, y: cy + 48 },

      // Jawline
      { x: cx - 70, y: cy - 20 },
      { x: cx - 65, y: cy + 30 },
      { x: cx - 40, y: cy + 75 },
      { x: cx, y: cy + 90 },
      { x: cx + 40, y: cy + 75 },
      { x: cx + 65, y: cy + 30 },
      { x: cx + 70, y: cy - 20 },
    ];

    // Draw triangles / wireframe lines
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < meshPoints.length - 1; i++) {
      ctx.moveTo(meshPoints[i].x, meshPoints[i].y);
      ctx.lineTo(meshPoints[i + 1].x, meshPoints[i + 1].y);
    }
    // Connect center points for triangulation look
    meshPoints.forEach((p, idx) => {
      if (idx % 3 === 0) {
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
      }
    });
    ctx.stroke();

    // Draw glowing landmark dots
    ctx.fillStyle = '#00f5d4';
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 8;
    meshPoints.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 4. Moving Laser Scan Bar
  const laserY = top + (boxH * ((scanProgress * 1.5) % 1));
  const gradient = ctx.createLinearGradient(0, laserY - 15, 0, laserY + 15);
  gradient.addColorStop(0, 'rgba(0, 245, 212, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 245, 212, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 245, 212, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(left, laserY - 15, boxW, 30);

  // Laser beam core line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(left - 5, laserY);
  ctx.lineTo(right + 5, laserY);
  ctx.stroke();

  // 5. Telemetry text overlay
  ctx.shadowBlur = 0;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(0, 245, 212, 0.85)';
  ctx.fillText(`BIOMETRIC_SYS // meflagrou.com`, left, top - 12);
  ctx.fillText(`FPS: 60  |  PTS: 68`, right - 95, top - 12);

  ctx.fillText(`STATUS: ${currentStatus.toUpperCase()}`, left, bottom + 20);
  if (userConfidence > 0) {
    ctx.fillText(`CONFIDENCE: ${userConfidence.toFixed(1)}%`, right - 115, bottom + 20);
  } else {
    ctx.fillText(`SCANNING...`, right - 75, bottom + 20);
  }
}

export function simulateFaceRecognition(
  targetUser?: UserProfile | null
): Promise<ScanResult> {
  return new Promise((resolve) => {
    // If specific target user requested (e.g. demo profile 1-click), match them
    const matchedUser = targetUser || MOCK_USERS[0];
    const confidence = 98.4 + Math.random() * 1.4; // 98.4% - 99.8%
    
    setTimeout(() => {
      resolve({
        matchedUser,
        confidence,
        similarityScore: 0.985,
        landmarksDetected: 68,
        processingTimeMs: 420,
        faceMetrics: {
          symmetry: 0.96,
          illumination: 0.94,
          sharpness: 0.98,
        },
      });
    }, 1800);
  });
}

export function findPhotosForUser(userId: string) {
  return MOCK_PHOTOS.filter((photo) =>
    photo.tags.some((tag) => tag.userId === userId)
  );
}

export interface UserRegistrationParams {
  name: string;
  cpf?: string;
  whatsapp?: string;
  phone?: string;
  address?: string;
  cep?: string;
  email1?: string;
  email2?: string;
  email?: string;
  handle?: string;
  city?: string;
  state?: string;
  avatarDataUrl?: string;
}

export function enrollNewUserFace(
  dataOrName: UserRegistrationParams | string,
  handleArg?: string,
  cityArg?: string,
  avatarDataUrlArg?: string
): UserProfile {
  let name = '';
  let handle = '';
  let cpf = '';
  let whatsapp = '';
  let address = '';
  let cep = '';
  let email1 = '';
  let email2 = '';
  let city = 'São Paulo';
  let state = 'SP';
  let avatarDataUrl = '';

  if (typeof dataOrName === 'object') {
    name = dataOrName.name || '';
    cpf = dataOrName.cpf || '';
    whatsapp = dataOrName.whatsapp || dataOrName.phone || '';
    address = dataOrName.address || '';
    cep = (dataOrName as { cep?: string }).cep || '';
    email1 = dataOrName.email1 || '';
    email2 = dataOrName.email2 || '';
    handle = dataOrName.handle || name.toLowerCase().replace(/\s+/g, '_');
    
    // Parse City and State properly without duplicates
    const rawCity = dataOrName.city || 'São Paulo';
    if (rawCity.includes(',')) {
      const parts = rawCity.split(',');
      city = parts[0].trim();
      state = (dataOrName.state || parts[1]).trim();
    } else {
      city = rawCity.trim();
      state = (dataOrName.state || 'SP').trim();
    }

    avatarDataUrl = dataOrName.avatarDataUrl || '';
  } else {
    name = dataOrName;
    handle = handleArg || name.toLowerCase().replace(/\s+/g, '_');
    city = cityArg || 'São Paulo';
    state = 'SP';
    avatarDataUrl = avatarDataUrlArg || '';
  }

  const newUserId = `user_${Date.now()}`;
  const cleanHandle = (handle || name.toLowerCase().replace(/\s+/g, '_'))
    .replace('@', '')
    .trim()
    .toLowerCase();
  
  const newUser: UserProfile = {
    id: newUserId,
    name,
    handle: cleanHandle,
    cpf,
    whatsapp,
    phone: whatsapp,
    address,
    cep,
    email1,
    email2,
    email: email1 || email2,
    avatar: avatarDataUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Flagrado pelo meflagrou.com nos melhores eventos! Perfil recém-verificado por IA biométrica 📸✨',
    city: city || 'São Paulo',
    state: state || 'SP',
    verifiedAt: new Date().toISOString().split('T')[0],
    facialDescriptor: Array.from({ length: 10 }, () => Math.random() * 2 - 1),
    faceSignatureId: `MF-BIO-${Math.floor(10000 + Math.random() * 90000)}-${cleanHandle.slice(0, 3).toUpperCase()}`,
    totalPhotosCount: 4,
    eventsCount: 2,
    attendedEvents: ['Sunset Festival 2026', 'Privilège Club Neon Night'],
    topFriends: [
      {
        userId: 'user_isabela_rocha',
        name: 'Isabela Rocha',
        handle: 'isa_rocha',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        sharedPhotosCount: 3,
      },
      {
        userId: 'user_lucas_ferreira',
        name: 'Lucas Ferreira',
        handle: 'lucas.flg',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
        sharedPhotosCount: 2,
      },
    ],
    socialLinks: {
      instagram: cleanHandle,
    },
    privacySettings: {
      isPublic: true,
      allowTagging: true,
      notifyOnNewPhoto: true,
    },
  };

  // Associate new user tag to a couple of sample event photos so they have live photos right away!
  MOCK_PHOTOS[0].tags.push({
    id: `tag_new_${Date.now()}_1`,
    userId: newUserId,
    userName: name,
    userHandle: cleanHandle,
    userAvatar: newUser.avatar,
    confidence: 99.1,
    boundingBox: { x: 68, y: 25, width: 22, height: 28 },
  });

  MOCK_PHOTOS[1].tags.push({
    id: `tag_new_${Date.now()}_2`,
    userId: newUserId,
    userName: name,
    userHandle: cleanHandle,
    userAvatar: newUser.avatar,
    confidence: 98.4,
    boundingBox: { x: 78, y: 22, width: 18, height: 24 },
  });

  MOCK_USERS.unshift(newUser);
  dbService.saveUser(newUser);
  return newUser;
}
