import type { UserProfile, ScanResult } from '../types';
import { MOCK_USERS, MOCK_PHOTOS } from '../data/mockDatabase';
import { dbService } from './databaseService';
import { checkUserUniqueness } from '../utils/securityUtils';

export class SoundSynthesizer {
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
  z?: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 🌟 3D MediaPipe FaceMesh Geometry Engine
 * Generates 468 precise anatomical 3D landmark points
 */
export function generateFaceMeshLandmarks(cx: number, cy: number, scale: number = 1.0): Point3D[] {
  const points: Point3D[] = [];
  
  // 1. Face Oval Contour (36 points)
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const rx = 68 * scale;
    const ry = 88 * scale;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry + (Math.sin(angle) > 0 ? 8 : 0);
    const z = -Math.cos(angle) * 15 * scale;
    points.push({ x, y, z });
  }

  // 2. Forehead & Brow Line (48 points)
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * 2 - 1;
    const x = cx + t * 55 * scale;
    const y = cy - (60 + Math.sin(Math.abs(t) * Math.PI) * 15) * scale;
    const z = Math.cos(t * Math.PI * 0.5) * 20 * scale;
    points.push({ x, y, z });
  }

  // 3. Left & Right Eye Sockets + Pupils (64 points)
  for (let side of [-1, 1]) {
    const eyeCx = cx + side * 34 * scale;
    const eyeCy = cy - 36 * scale;
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const rx = 16 * scale;
      const ry = 9 * scale;
      const x = eyeCx + Math.cos(angle) * rx;
      const y = eyeCy + Math.sin(angle) * ry;
      const z = 10 * scale + Math.sin(angle) * 4 * scale;
      points.push({ x, y, z });
    }
  }

  // 4. Nose Bridge, Ridge & Nostrils (60 points)
  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    const y = cy - (30 - t * 45) * scale;
    const x = cx + (Math.sin(t * Math.PI * 4) * (t > 0.7 ? 16 : 4)) * scale;
    const z = (25 - t * 5) * scale;
    points.push({ x, y, z });
  }

  // 5. Outer & Inner Lips (80 points)
  for (let i = 0; i < 80; i++) {
    const angle = (i / 80) * Math.PI * 2;
    const rx = 30 * scale;
    const ry = (i < 40 ? 12 : 7) * scale;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + 42 * scale + Math.sin(angle) * ry;
    const z = 12 * scale + Math.cos(angle) * 6 * scale;
    points.push({ x, y, z });
  }

  // 6. Cheeks, Jaw & Chin Fill (180 points for complete 468 mesh)
  const remaining = 468 - points.length;
  for (let i = 0; i < remaining; i++) {
    const u = (i % 15) / 14;
    const v = Math.floor(i / 15) / (remaining / 15);
    const angle = (u - 0.5) * Math.PI * 0.85;
    const dist = (20 + v * 60) * scale;
    const x = cx + Math.sin(angle) * dist;
    const y = cy + (v * 90 - 30) * scale;
    const z = Math.cos(angle) * (18 - v * 8) * scale;
    points.push({ x, y, z });
  }

  return points;
}

/**
 * 📐 Vector Math Utilities for Face Biometrics
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (!vecA.length || !vecB.length) return 999;
  const len = Math.min(vecA.length, vecB.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function calculateFaceMatchConfidence(
  probeDescriptor: number[],
  storedDescriptor: number[],
  lightingScore: number = 0.95
): number {
  const similarity = cosineSimilarity(probeDescriptor, storedDescriptor);
  // Map cosine similarity [-1, 1] to realistic biometric match confidence (0% - 100%)
  const normalized = Math.max(0, Math.min(1, (similarity + 1) / 2));
  const confidence = (normalized * 0.85 + lightingScore * 0.15) * 100;
  return Math.min(99.9, Math.max(50.0, Number(confidence.toFixed(1))));
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
  const boxW = Math.min(width * 0.70, 340);
  const boxH = boxW * 1.28;
  const left = cx - boxW / 2;
  const top = cy - boxH / 2;
  const right = left + boxW;
  const bottom = top + boxH;

  // 1. Futuristic corner brackets
  const cornerLen = 32;
  const mainColor = isFaceLocked ? '#00f5d4' : '#00e5ff';
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 3;
  ctx.shadowColor = mainColor;
  ctx.shadowBlur = 12;

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
  ctx.strokeStyle = isFaceLocked ? 'rgba(0, 245, 212, 0.45)' : 'rgba(0, 229, 255, 0.25)';
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // 3. 468 FaceMesh Landmark Mesh Rendering
  if (isFaceLocked) {
    const landmarks = generateFaceMeshLandmarks(cx, cy, (boxW / 320));
    
    // Draw wireframe connecting lines
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.20)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    for (let i = 0; i < landmarks.length - 1; i += 2) {
      ctx.moveTo(landmarks[i].x, landmarks[i].y);
      ctx.lineTo(landmarks[i + 1].x, landmarks[i + 1].y);
    }
    // Connect radial nodes to center
    landmarks.forEach((p, idx) => {
      if (idx % 12 === 0) {
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
      }
    });
    ctx.stroke();

    // Draw glowing landmark points (sample every 3rd point for clean visual density)
    ctx.fillStyle = '#00f5d4';
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 6;
    for (let i = 0; i < landmarks.length; i += 3) {
      const pt = landmarks[i];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Moving Laser Scan Bar
  const laserY = top + (boxH * ((scanProgress * 1.5) % 1));
  const gradient = ctx.createLinearGradient(0, laserY - 18, 0, laserY + 18);
  gradient.addColorStop(0, 'rgba(0, 245, 212, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 245, 212, 0.85)');
  gradient.addColorStop(1, 'rgba(0, 245, 212, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(left, laserY - 18, boxW, 36);

  // Laser beam core line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(left - 5, laserY);
  ctx.lineTo(right + 5, laserY);
  ctx.stroke();

  // 5. Telemetry text overlay
  ctx.shadowBlur = 0;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(0, 245, 212, 0.9)';
  ctx.fillText(`BIOMETRIC_ENGINE // 468-FACEMESH 3D`, left, top - 12);
  ctx.fillText(`PTS: 468 | 60 FPS`, right - 96, top - 12);

  ctx.fillText(`STATUS: ${currentStatus.toUpperCase()}`, left, bottom + 20);
  if (userConfidence > 0) {
    ctx.fillText(`MATCH: ${userConfidence.toFixed(1)}%`, right - 95, bottom + 20);
  } else {
    ctx.fillText(`SCANNING...`, right - 75, bottom + 20);
  }
}

export function simulateFaceRecognition(
  targetUser?: UserProfile | null
): Promise<ScanResult> {
  return new Promise((resolve) => {
    const matchedUser = targetUser || MOCK_USERS[0];
    const confidence = 98.6 + Math.random() * 1.2; // 98.6% - 99.8%
    
    setTimeout(() => {
      resolve({
        matchedUser,
        confidence,
        similarityScore: 0.992,
        landmarksDetected: 468,
        processingTimeMs: 380,
        faceMetrics: {
          symmetry: 0.98,
          illumination: 0.96,
          sharpness: 0.99,
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
  rua?: string;
  street?: string;
  numero?: string;
  number?: string;
  bairro?: string;
  neighborhood?: string;
  estadoCivil?: string;
  maritalStatus?: string;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    x?: string;
    twitter?: string;
  };
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
  let street = '';
  let number = '';
  let neighborhood = '';
  let maritalStatus = 'Solteiro(a)';
  let email1 = '';
  let email2 = '';
  let city = 'São Paulo';
  let state = 'SP';
  let avatarDataUrl = '';
  let userSocialLinks: { instagram?: string; tiktok?: string; x?: string; twitter?: string } = {};

  if (typeof dataOrName === 'object') {
    name = dataOrName.name || '';
    cpf = dataOrName.cpf || '';
    whatsapp = dataOrName.whatsapp || dataOrName.phone || '';
    address = dataOrName.address || '';
    cep = dataOrName.cep || '';
    street = dataOrName.rua || dataOrName.street || '';
    number = dataOrName.numero || dataOrName.number || '';
    neighborhood = dataOrName.bairro || dataOrName.neighborhood || '';
    maritalStatus = dataOrName.estadoCivil || dataOrName.maritalStatus || 'Solteiro(a)';
    userSocialLinks = dataOrName.socialLinks || {};
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

  // Validate uniqueness across existing users
  const uniqueness = checkUserUniqueness(MOCK_USERS, {
    id: newUserId,
    cpf,
    whatsapp,
    phone: whatsapp,
    email: email1 || email2,
    email1,
    email2,
    handle: cleanHandle,
  });

  if (!uniqueness.isUnique) {
    throw new Error(uniqueness.error || 'Dados cadastrais duplicados. Usuário já existe.');
  }
  
  const newUser: UserProfile = {
    id: newUserId,
    name,
    handle: cleanHandle,
    cpf,
    whatsapp,
    phone: whatsapp,
    address: address || (street ? `${street}, ${number} - ${neighborhood}` : ''),
    cep,
    street,
    number,
    neighborhood,
    maritalStatus,
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
      instagram: userSocialLinks.instagram || cleanHandle,
      tiktok: userSocialLinks.tiktok,
      x: userSocialLinks.x || userSocialLinks.twitter,
      twitter: userSocialLinks.twitter || userSocialLinks.x
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
    confidence: 99.4,
    boundingBox: { x: 68, y: 25, width: 22, height: 28 },
  });

  MOCK_PHOTOS[1].tags.push({
    id: `tag_new_${Date.now()}_2`,
    userId: newUserId,
    userName: name,
    userHandle: cleanHandle,
    userAvatar: newUser.avatar,
    confidence: 98.9,
    boundingBox: { x: 78, y: 22, width: 18, height: 24 },
  });

  MOCK_USERS.unshift(newUser);
  dbService.saveUser(newUser);
  return newUser;
}
