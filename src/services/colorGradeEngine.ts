export interface FilmPreset {
  id: string;
  name: string;
  brand: string;
  year: string;
  description: string;
  cssFilter: string;
  overlayGradient?: string;
  grainIntensity: number; // 0 to 1
  colorTone: string;
  badgeColor: string;
}

export const FILM_PRESETS: FilmPreset[] = [
  {
    id: 'raw',
    name: 'RAW Original',
    brand: 'Sensor Nativo',
    year: '2026',
    description: 'Captura sem alterações direto do sensor ótico da câmera.',
    cssFilter: 'none',
    grainIntensity: 0,
    colorTone: '#ffffff',
    badgeColor: '#94a3b8',
  },
  {
    id: 'portra400',
    name: 'Kodak Portra 400',
    brand: 'Kodak Professional',
    year: '1998',
    description: 'O lendário filme de retrato. Tons de pele quentes e dourados com sombras suaves.',
    cssFilter: 'contrast(1.05) saturate(1.15) brightness(1.03) sepia(0.12)',
    overlayGradient: 'linear-gradient(rgba(255, 215, 0, 0.05), rgba(255, 140, 0, 0.04))',
    grainIntensity: 0.25,
    colorTone: '#ffb703',
    badgeColor: '#ffb703',
  },
  {
    id: 'cinestill800t',
    name: 'CineStill 800T',
    brand: 'CineStill Film',
    year: '2012',
    description: 'Estética cinematográfica noturna com halation avermelhado nas fontes de luz de néon.',
    cssFilter: 'contrast(1.18) saturate(1.25) hue-rotate(-6deg) brightness(0.98)',
    overlayGradient: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.05), rgba(255, 0, 122, 0.08))',
    grainIntensity: 0.35,
    colorTone: '#00e5ff',
    badgeColor: '#00e5ff',
  },
  {
    id: 'fuji_provia',
    name: 'Fujifilm Provia 100F',
    brand: 'Fujifilm Chrome',
    year: '2000',
    description: 'Cromogêneo de saturação ultra vívida, azuis profundos e contraste cristalino.',
    cssFilter: 'contrast(1.2) saturate(1.35) brightness(1.02) hue-rotate(4deg)',
    grainIntensity: 0.15,
    colorTone: '#00f5d4',
    badgeColor: '#00f5d4',
  },
  {
    id: 'leica_mono',
    name: 'Leica Monochrom M11',
    brand: 'Leica Silver',
    year: '2023',
    description: 'Preto e branco com nitidez cirúrgica, alcance dinâmico profundo e grão de prata.',
    cssFilter: 'grayscale(1) contrast(1.3) brightness(0.96)',
    grainIntensity: 0.3,
    colorTone: '#e2e8f0',
    badgeColor: '#ffffff',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Vibe',
    brand: 'LUMEN Custom',
    year: '2026',
    description: 'Sombras azul-petróleo e realces magenta vibrantes para festivais noturnos.',
    cssFilter: 'contrast(1.25) saturate(1.4) hue-rotate(-15deg)',
    overlayGradient: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(255, 0, 122, 0.1))',
    grainIntensity: 0.2,
    colorTone: '#ff007a',
    badgeColor: '#ff007a',
  },
];

export interface ColorSwatch {
  hex: string;
  name: string;
  percentage: number;
}

export function extractPhotoColorPalette(photoId: string): ColorSwatch[] {
  const palettes: { [key: string]: ColorSwatch[] } = {
    photo_isa_01: [
      { hex: '#160a2b', name: 'Obsidian Night', percentage: 38 },
      { hex: '#00f5d4', name: 'Electric Cyan', percentage: 24 },
      { hex: '#ff007a', name: 'Neon Magenta', percentage: 18 },
      { hex: '#7928ca', name: 'Club Violet', percentage: 12 },
      { hex: '#ffffff', name: 'Laser Glare', percentage: 8 },
    ],
    photo_isa_02: [
      { hex: '#ff8c38', name: 'Sunset Glow', percentage: 35 },
      { hex: '#3d1b09', name: 'Dusk Brown', percentage: 25 },
      { hex: '#ffd166', name: 'Golden Hour', percentage: 20 },
      { hex: '#06d6a0', name: 'Sea Foam', percentage: 12 },
      { hex: '#118ab2', name: 'Ocean Blue', percentage: 8 },
    ],
    photo_isa_03: [
      { hex: '#070913', name: 'Mainstage Shadow', percentage: 40 },
      { hex: '#7b2cbf', name: 'Laser Beam Purple', percentage: 26 },
      { hex: '#3a0ca3', name: 'Deep Trance', percentage: 16 },
      { hex: '#4cc9f0', name: 'Strobe Cyan', percentage: 12 },
      { hex: '#f72585', name: 'Festival Spark', percentage: 6 },
    ],
    photo_isa_04: [
      { hex: '#2b1b04', name: 'Copacabana Walnut', percentage: 36 },
      { hex: '#ffbe0b', name: 'Champagne Gold', percentage: 28 },
      { hex: '#fb5607', name: 'Warm Amber', percentage: 18 },
      { hex: '#3a2010', name: 'Velvet Noir', percentage: 10 },
      { hex: '#ffffff', name: 'Crystal Highlight', percentage: 8 },
    ],
  };

  return palettes[photoId] || [
    { hex: '#090a0f', name: 'Deep Space', percentage: 35 },
    { hex: '#00f5d4', name: 'Neon Mint', percentage: 25 },
    { hex: '#7928ca', name: 'Electric Purple', percentage: 20 },
    { hex: '#ff007a', name: 'Vibrant Rose', percentage: 12 },
    { hex: '#00e5ff', name: 'Cyan Highlight', percentage: 8 },
  ];
}

export function getPhotoCinematicScore(_photoId: string) {
  return {
    colorHarmony: 'Tríade Complementar Perfeita',
    colorTemperature: '4800K (Luz Quente de Boate)',
    dynamicRange: '14.8 Stops (Sony Full-Frame)',
    sharpnessIndex: '98.7% (Foco nos Olhos)',
    moodRating: 'Altamente Energético & Sofisticado',
  };
}
