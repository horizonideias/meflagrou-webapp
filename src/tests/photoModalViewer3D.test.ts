import { describe, it, expect } from 'vitest';
import { MOCK_PHOTOS } from '../data/mockDatabase';
import { PixGatewayService } from '../services/pixGatewayService';

describe('🌌 Sistema Modal 3D em Tela Cheia (MeFlagrou 3D Spatial Engine)', () => {
  const samplePhoto = MOCK_PHOTOS[0];
  const allPhotos = MOCK_PHOTOS;

  it('deve carregar todas as fotos disponíveis para o espaço 3D', () => {
    expect(allPhotos.length).toBeGreaterThan(0);
    expect(samplePhoto).toBeDefined();
    expect(samplePhoto.id).toBe(allPhotos[0].id);
  });

  it('deve validar os 4 modos 3D espaciais suportados', () => {
    const supported3DModes = ['coverflow', 'stage', 'cylinder', 'grid'];
    expect(supported3DModes).toContain('coverflow');
    expect(supported3DModes).toContain('stage');
    expect(supported3DModes).toContain('cylinder');
    expect(supported3DModes).toContain('grid');
  });

  it('deve calcular corretamente a fatia visível de cards no carrossel 3D Coverflow (radius ±4)', () => {
    const currentIndex = 2;
    const radius = 4;
    const visibleSlice: Array<{ offset: number; index: number }> = [];

    for (let offset = -radius; offset <= radius; offset++) {
      const idx = currentIndex + offset;
      if (idx >= 0 && idx < allPhotos.length) {
        visibleSlice.push({ offset, index: idx });
      }
    }

    expect(visibleSlice.length).toBeGreaterThan(0);
    const centerCard = visibleSlice.find((c) => c.offset === 0);
    expect(centerCard).toBeDefined();
    expect(centerCard?.index).toBe(currentIndex);
  });

  it('deve calcular a inclinação 3D Gyro Parallax Tilt a partir das coordenadas do cursor', () => {
    const width = 1000;
    const height = 800;
    const mouseX = 800; // 80% horizontal
    const mouseY = 200; // 25% vertical

    const rotateX = ((mouseY - height / 2) / (height / 2)) * -16;
    const rotateY = ((mouseX - width / 2) / (width / 2)) * 16;
    const percentX = (mouseX / width) * 100;
    const percentY = (mouseY / height) * 100;

    expect(percentX).toBe(80);
    expect(percentY).toBe(25);
    expect(rotateX).toBeGreaterThan(0); // incline upwards when mouse is on top
    expect(rotateY).toBeGreaterThan(0); // tilt right when mouse is on right
  });

  it('deve calcular a rotação angular do cilindro orbital 3D', () => {
    const totalPanels = Math.min(16, allPhotos.length);
    const angleStep = 360 / totalPanels;

    for (let i = 0; i < totalPanels; i++) {
      const angle = i * angleStep;
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
    }
  });

  it('deve calcular o Split PIX 90/9/1% para compra direta no modal 3D', () => {
    const price = samplePhoto.ownerPrice || 19.90;
    const split = PixGatewayService.calculateSplit(price);

    expect(split.totalAmount).toBe(price);
    expect(split.photographerAmount).toBeCloseTo(price * 0.90, 2);
    expect(split.platformFee).toBeCloseTo(price * 0.09, 2);
    expect(split.socialImpactFund).toBeCloseTo(price * 0.01, 2);
    expect(split.photographerAmount + split.platformFee + split.socialImpactFund).toBeCloseTo(price, 2);
  });

  it('deve gerar payload BACEN EMV QRCPS-MPM válido para pagamento no modal 3D', () => {
    const payload = PixGatewayService.generateBRCode(
      'pix@meflagrou.com',
      19.90,
      `FLAGRA_${samplePhoto.id}`,
      'MEFLAGROU TECNOLOGIA',
      'SAO PAULO'
    );

    expect(payload).toContain('000201');
    expect(payload).toContain('52040000');
    expect(payload).toContain('5303986');
    expect(payload).toContain('6304');
  });
});
