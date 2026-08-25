import type { EventPhoto, UserProfile } from '../types';
import type { MagazineTemplate } from '../components/MagazineCoverStudio';

// Helper to load an image into an HTMLImageElement asynchronously
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If CORS or local image error, resolve with placeholder or proceed
      resolve(img);
    };
    img.src = src;
  });
}

/**
 * Real 4K / High-Resolution Magazine Cover Exporter using Canvas 2D
 */
export async function renderMagazineCoverCanvas(
  photo: EventPhoto,
  user: UserProfile,
  template: MagazineTemplate,
  mainHeadline: string,
  subHeadline: string,
  sideTagline: string,
  aspectRatio: '9:16' | '4:5' | '1:1'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Set resolution based on aspect ratio
  if (aspectRatio === '9:16') {
    canvas.width = 1080;
    canvas.height = 1920;
  } else if (aspectRatio === '4:5') {
    canvas.width = 1080;
    canvas.height = 1350;
  } else {
    canvas.width = 1080;
    canvas.height = 1080;
  }

  const { width, height } = canvas;

  // 1. Draw Background Photo (Cover mode)
  try {
    const photoImg = await loadImage(photo.highResUrl || photo.url);
    if (photoImg.width > 0) {
      const imgRatio = photoImg.width / photoImg.height;
      const targetRatio = width / height;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > targetRatio) {
        drawH = height;
        drawW = height * imgRatio;
        drawX = (width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / imgRatio;
        drawX = 0;
        drawY = (height - drawH) / 2;
      }

      ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = '#07080c';
      ctx.fillRect(0, 0, width, height);
    }
  } catch {
    ctx.fillStyle = '#07080c';
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Cinematic Vignette Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.05)');
  grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Masthead Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  if (template === 'vogue') {
    ctx.font = 'bold 90px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('V O G U E', width / 2, 70);
    ctx.font = '600 20px "Outfit", sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.fillText('VIP EDITION // SPECIAL FESTIVAL REPORT', width / 2, 175);
  } else if (template === 'mixmag') {
    ctx.font = '900 100px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffb703';
    ctx.fillText('MIXMAG', width / 2, 60);
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DANCE MUSIC & CLUB CULTURE WORLDWIDE', width / 2, 170);
  } else if (template === 'dazed') {
    ctx.font = '900 110px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('D A Z E D', width / 2, 60);
    ctx.font = '800 22px "Outfit", sans-serif';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('UNDERGROUND SOUNDS & HIGH FASHION', width / 2, 175);
  } else if (template === 'rollingstone') {
    ctx.font = '900 78px Impact, sans-serif';
    ctx.fillStyle = '#ff007a';
    ctx.fillText('ROLLING STONE', width / 2, 70);
    ctx.font = '700 20px "Outfit", sans-serif';
    ctx.fillStyle = '#ffbe0b';
    ctx.fillText('FESTIVAL LIVE CHRONICLES 2026', width / 2, 160);
  } else {
    // LUMEN
    ctx.font = '900 110px "Outfit", sans-serif';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('LUMEN', width / 2, 60);
    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('THE VISUAL CULTURE & NIGHTLIFE GAZETTE', width / 2, 180);
  }

  // 4. Draw Side Tagline Box
  if (sideTagline) {
    ctx.textAlign = 'left';
    const tagX = 50;
    const tagY = height * 0.45;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(tagX, tagY, 320, 48);
    ctx.fillStyle = '#00f5d4';
    ctx.fillRect(tagX, tagY, 6, 48);
    ctx.font = '800 18px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sideTagline.toUpperCase(), tagX + 18, tagY + 14);
  }

  // 5. Draw Bottom Headlines
  const bottomMargin = 80;
  const startTextY = height - 280;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px "Outfit", sans-serif';
  ctx.fillText(mainHeadline.toUpperCase(), 50, startTextY);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 24px "Outfit", sans-serif';
  ctx.fillText(subHeadline, 50, startTextY + 56);

  // 6. Draw Bottom Footer Bar (User credit, event date & meflagrou stamp)
  const lineY = height - bottomMargin - 30;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, lineY);
  ctx.lineTo(width - 50, lineY);
  ctx.stroke();

  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillStyle = '#00f5d4';
  ctx.fillText(`STAR: @${user.handle.toUpperCase()}`, 50, lineY + 16);

  ctx.font = '500 18px "Outfit", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`${photo.eventName} • ${photo.eventDate}`, 50, lineY + 46);

  // Watermark stamp on right
  ctx.textAlign = 'right';
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('meflagrou.com', width - 50, lineY + 16);
  ctx.font = '500 16px monospace';
  ctx.fillStyle = '#00e5ff';
  ctx.fillText('ISSUE NO. 26 // VIP', width - 50, lineY + 46);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Real Instagram Story 9:16 Canvas Exporter
 */
export async function renderStoryCanvas(
  photo: EventPhoto,
  user: UserProfile,
  gradientKey: string,
  stickerKey: string,
  captionText: string,
  showLocation: boolean,
  showPhotographer: boolean
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  const { width, height } = canvas;

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  if (gradientKey === 'sunset') {
    grad.addColorStop(0, '#1f0814');
    grad.addColorStop(0.5, '#381204');
    grad.addColorStop(1, '#0b1120');
  } else if (gradientKey === 'cyberpunk') {
    grad.addColorStop(0, '#001220');
    grad.addColorStop(0.5, '#090b16');
    grad.addColorStop(1, '#20002c');
  } else if (gradientKey === 'obsidian') {
    grad.addColorStop(0, '#050507');
    grad.addColorStop(1, '#11141c');
  } else {
    // Neon
    grad.addColorStop(0, '#090a0f');
    grad.addColorStop(0.5, '#1a0b2e');
    grad.addColorStop(1, '#002b28');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Top User Bar
  const topY = 100;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 32px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`@${user.handle}`, 100, topY);

  ctx.fillStyle = '#00f5d4';
  ctx.font = '600 22px "Outfit", sans-serif';
  ctx.fillText('meflagrou.com', 100, topY + 36);

  // Draw Sticker on Top Right
  const stickerLabels: { [key: string]: { label: string; color: string; bg: string } } = {
    flagrado: { label: 'ME FLAGROU! 📸', color: '#07080c', bg: '#00f5d4' },
    vip: { label: 'VIP ACCESS ✨', color: '#ffffff', bg: '#ff007a' },
    front: { label: 'FRONT STAGE 🎧', color: '#ffffff', bg: '#7928ca' },
    sunset: { label: 'SUNSET VIBES 🌴', color: '#07080c', bg: '#ffb703' },
  };
  const stk = stickerLabels[stickerKey] || stickerLabels.flagrado;

  ctx.fillStyle = stk.bg;
  ctx.beginPath();
  ctx.roundRect(width - 340, topY - 15, 260, 56, 16);
  ctx.fill();

  ctx.fillStyle = stk.color;
  ctx.font = '900 24px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stk.label, width - 210, topY + 22);

  // 3. Draw Center Photo in 4:5 Card
  const cardX = 80;
  const cardY = 220;
  const cardW = width - 160;
  const cardH = cardW * (5 / 4);

  try {
    const photoImg = await loadImage(photo.highResUrl || photo.url);
    if (photoImg.width > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 28);
      ctx.clip();
      ctx.drawImage(photoImg, cardX, cardY, cardW, cardH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#11141c';
      ctx.fillRect(cardX, cardY, cardW, cardH);
    }
  } catch {
    ctx.fillStyle = '#11141c';
    ctx.fillRect(cardX, cardY, cardW, cardH);
  }

  // Draw Photo Card Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  ctx.stroke();

  // Draw Corner Watermark in photo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  ctx.roundRect(cardX + cardW - 240, cardY + cardH - 60, 220, 44, 12);
  ctx.fill();

  ctx.font = '800 20px "Outfit", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('meflagrou.com', cardX + cardW - 130, cardY + cardH - 30);

  // 4. Draw Caption Box below photo
  const captionY = cardY + cardH + 40;
  if (captionText) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(cardX, captionY, cardW, 70, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 28px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(captionText, width / 2, captionY + 45);
  }

  // 5. Draw Footer (Event & Photographer)
  const footY = height - 100;
  ctx.textAlign = 'left';
  ctx.font = '600 24px "Outfit", sans-serif';
  ctx.fillStyle = '#e2e8f0';

  if (showLocation) {
    ctx.fillText(`📍 ${photo.eventName}`, 100, footY);
  }

  if (showPhotographer) {
    ctx.textAlign = 'right';
    ctx.fillText(`📸 ${photo.photographer.name}`, width - 100, footY);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
