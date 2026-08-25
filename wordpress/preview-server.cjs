/**
 * meflagrou.com - Local WordPress Preview Server (CommonJS)
 * Executes and serves the WordPress theme templates, assets, and REST API locally.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const THEME_DIR = path.join(__dirname, 'themes', 'meflagrou');
const PLUGINS_DIR = path.join(__dirname, 'plugins', 'meflagrou-core');

// Sample mock data matching WordPress database
const mockPhotos = [
  {
    id: 1,
    title: 'Vintage Culture Live Set @ Warung Beach Club',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
    photographer: 'André Souza',
    photographerHandle: '@andresouza.photo',
    price: 'R$ 19,90',
    resolution: '50.1 MP RAW Sony A1',
    event: 'Warung Beach Club Neon 2026',
    tags: [
      { name: 'Isabela Rocha', x: 45, y: 30 },
      { name: 'Lucas Ferreira', x: 70, y: 35 }
    ]
  },
  {
    id: 2,
    title: 'Mainstage Lights & Laser @ Laroc Club Valinhos',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    photographer: 'Marina Silva',
    photographerHandle: '@marina.lens',
    price: 'R$ 22,90',
    resolution: '61.0 MP Canon R5C',
    event: 'Laroc Club Open Air',
    tags: [
      { name: 'Camila Santos', x: 52, y: 28 }
    ]
  },
  {
    id: 3,
    title: 'Green Valley Stage Pyro & Crowd @ Camboriú',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
    photographer: 'Thiago Lima',
    photographerHandle: '@thiagolima.raw',
    price: 'R$ 18,90',
    resolution: '45.7 MP Nikon Z9',
    event: 'Green Valley Festival',
    tags: [
      { name: 'Rafael Silva', x: 38, y: 40 }
    ]
  },
  {
    id: 4,
    title: 'Privilège Sunset Session @ Ilhabela SP',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    photographer: 'Beatriz Costa',
    photographerHandle: '@biacosta_click',
    price: 'R$ 19,90',
    resolution: '50.1 MP Sony A1',
    event: 'Sunset Privilège VIP',
    tags: [
      { name: 'DEUS Master', x: 50, y: 32 }
    ]
  }
];

const mockStories = [
  { id: 'st_1', title: 'Warung Beach', thumb: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=250&q=80', active: true },
  { id: 'st_2', title: 'Laroc Club', thumb: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=250&q=80', active: true },
  { id: 'st_3', title: 'Green Valley', thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=250&q=80', active: false },
  { id: 'st_4', title: 'Privilège Sunset', thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=250&q=80', active: true },
  { id: 'st_5', title: 'Cafe de La Musique', thumb: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=250&q=80', active: false }
];

function renderWordPressTemplate() {
  const headerHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#07080c">
    <title>meflagrou.com • WordPress 6.7 Preview Local</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
    <link rel="stylesheet" href="/assets/css/meflagrou.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
</head>
<body class="meflagrou-cyberpunk-body">
    <!-- CORTINA DE PRIVACIDADE ANTI-PRINT -->
    <div id="mf-privacy-curtain" class="mf-privacy-curtain" style="display: none;">
        <div class="mf-curtain-shield-card">
            <i data-lucide="shield-alert" class="mf-curtain-icon"></i>
            <h3>Modo Protegido Ativado</h3>
            <p>A tela foi ocultada para proteção de direitos autorais do meflagrou.com.</p>
            <span class="mf-curtain-hint">Clique na janela para retomar</span>
        </div>
    </div>

    <!-- AVISO ANTI-PRINT -->
    <div id="mf-print-shield-toast" class="mf-print-shield-toast" style="display: none;">
        <div class="mf-print-shield-icon"><i data-lucide="shield-check"></i></div>
        <div class="mf-print-shield-info">
            <strong>MEFLAGROU DIGITAL SHIELD</strong>
            <p>Capturas de tela bloqueadas. Adquira sua foto original em alta resolução (50.1 MP).</p>
        </div>
        <button type="button" class="mf-print-shield-buy-btn" id="mf-toast-buy-btn">Comprar Foto HD</button>
    </div>

    <!-- PUSH WHATSAPP -->
    <div id="mf-whatsapp-push-toast" class="mf-whatsapp-push-toast" style="display: none;">
        <div class="mf-whatsapp-push-icon"><i data-lucide="message-square"></i></div>
        <div class="mf-whatsapp-push-text">
            <span class="mf-whatsapp-push-sender">WhatsApp • meflagrou Security</span>
            <span class="mf-whatsapp-push-body" id="mf-whatsapp-push-code">Seu código de acesso é [ 000 000 ]</span>
            <span class="mf-whatsapp-push-autofill">Toque para preencher automaticamente ⚡</span>
        </div>
    </div>

    <!-- CABEÇALHO GLOBAL -->
    <header class="mf-header-sticky">
        <div class="mf-header-inner mf-container">
            <div class="mf-brand-wrapper">
                <a href="/" class="mf-logo-link">
                    <div class="mf-logo-icon-box"><i data-lucide="camera" class="mf-logo-svg"></i></div>
                    <span class="mf-logo-text">meflagrou<span>.com</span></span>
                </a>
                <div class="mf-live-badge-desktop">
                    <span class="mf-pulse-dot"></span>
                    <span>24 Fotógrafos Ao Vivo</span>
                </div>
            </div>

            <nav class="mf-desktop-nav">
                <a href="/" class="mf-nav-item active"><i data-lucide="compass"></i><span>Feed</span></a>
                <button type="button" class="mf-nav-item" id="mf-open-radar-btn"><i data-lucide="radar"></i><span>Radar GPS</span></button>
                <button type="button" class="mf-nav-item" id="mf-open-slideshow-btn"><i data-lucide="layers"></i><span>Mosaico HD</span></button>
                <button type="button" class="mf-nav-item" id="mf-open-vip-btn"><i data-lucide="crown"></i><span>Clube VIP</span></button>
            </nav>

            <div class="mf-header-actions">
                <button type="button" class="mf-faceid-quick-btn" id="mf-header-faceid-btn"><i data-lucide="scan-face"></i><span class="mf-hide-mobile">Face ID</span></button>
                <button type="button" class="mf-user-auth-btn" id="mf-header-auth-btn"><i data-lucide="user-check"></i><span id="mf-user-name-display">Entrar com WhatsApp</span></button>
                <button type="button" class="mf-cart-pill-btn" id="mf-header-cart-btn"><i data-lucide="shopping-bag"></i><span class="mf-cart-count-badge" id="mf-cart-count">0</span></button>
            </div>
        </div>
    </header>
  `;

  const storiesHtml = `
    <div class="mf-stories-carousel-container">
        <div class="mf-stories-track" id="mf-stories-track">
            <div class="mf-story-card mf-story-upload-card" id="mf-add-story-btn">
                <div class="mf-story-thumb-box"><div class="mf-story-plus-circle"><i data-lucide="plus"></i></div></div>
                <span class="mf-story-title">Seu Flagrante</span>
            </div>
            ${mockStories.map(s => `
                <div class="mf-story-card ${s.active ? 'has-active-border' : ''}">
                    <div class="mf-story-thumb-box">
                        <img src="${s.thumb}" alt="${s.title}" class="mf-story-img" />
                        ${s.active ? '<span class="mf-story-live-tag">AO VIVO</span>' : ''}
                    </div>
                    <span class="mf-story-title">${s.title}</span>
                </div>
            `).join('')}
        </div>
    </div>
  `;

  const pairedBlocksHtml = `
    <div class="mf-paired-blocks-grid">
        <div class="mf-paired-card mf-paired-featured" id="mf-paired-vintage-card">
            <div class="mf-paired-bg-overlay" style="background-image: url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="mf-paired-content">
                <div class="mf-paired-badge"><i data-lucide="flame"></i><span>FLAGRANTE EXCLUSIVO • VINTAGE CULTURE</span></div>
                <h3 class="mf-paired-title">Vintage Culture Live Set @ Warung</h3>
                <p class="mf-paired-desc">Mais de 420 fotos capturadas na cabine principal. Reconhecimento facial ativo para encontrar você na pista!</p>
                <div class="mf-paired-actions">
                    <button type="button" class="mf-btn-neon-primary" id="mf-btn-open-vintage"><i data-lucide="sparkles"></i><span>Ver Álbum Completo</span></button>
                    <button type="button" class="mf-btn-ghost-icon"><i data-lucide="share-2"></i></button>
                </div>
            </div>
        </div>

        <div class="mf-paired-card mf-paired-radar" id="mf-paired-radar-card">
            <div class="mf-paired-bg-overlay" style="background-image: url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80');"></div>
            <div class="mf-paired-content">
                <div class="mf-paired-badge green"><span class="mf-radar-ping"></span><span>RADAR EM TEMPO REAL • GPS ATIVO</span></div>
                <h3 class="mf-paired-title">Warung, Laroc & Green Valley</h3>
                <p class="mf-paired-desc">24 fotógrafos credenciados enviando fotos a cada 5 minutos direto das melhores baladas do Brasil.</p>
                <div class="mf-paired-actions">
                    <button type="button" class="mf-btn-neon-green" id="mf-btn-open-radar-card"><i data-lucide="radar"></i><span>Abrir Radar de Eventos</span></button>
                    <button type="button" class="mf-btn-ghost-wa" id="mf-btn-alert-wa-card"><i data-lucide="message-square"></i><span>Alertas no WhatsApp</span></button>
                </div>
            </div>
        </div>
    </div>
  `;

  const feedHtml = `
    <div class="mf-feed-cards-grid" id="mf-feed-cards-grid">
        ${mockPhotos.map(p => `
            <article class="mf-photo-card" data-photo-id="${p.id}">
                <div class="mf-photo-media-wrapper">
                    <img src="${p.image}" alt="${p.title}" class="mf-photo-main-img" loading="lazy" />
                    <div class="mf-watermark-overlay"><span>meflagrou.com • PREVIEW NÃO AUTORIZADO</span></div>
                    <div class="mf-face-tags-layer">
                        ${p.tags.map(t => `
                            <div class="mf-face-box" style="left: ${t.x}%; top: ${t.y}%;">
                                <div class="mf-face-marker-pulse"></div>
                                <span class="mf-face-pill"><i data-lucide="check" class="mf-tag-check"></i>${t.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mf-photo-hover-actions">
                        <button type="button" class="mf-photo-zoom-btn" title="Visualizar em Tela Cheia" onclick="window.mfOpenSlideshowAtIndex(${p.id})"><i data-lucide="maximize-2"></i></button>
                        <button type="button" class="mf-photo-faceid-btn" title="Buscar Pessoas nesta Foto" onclick="$('#mf-header-faceid-btn').trigger('click')"><i data-lucide="scan"></i></button>
                    </div>
                    <span class="mf-event-badge-pill"><i data-lucide="map-pin"></i>${p.event}</span>
                </div>

                <div class="mf-photo-card-body">
                    <div class="mf-photo-photog-row">
                        <div class="mf-photog-info">
                            <div class="mf-photog-avatar-sm"><i data-lucide="camera"></i></div>
                            <div>
                                <span class="mf-photog-name">${p.photographer}</span>
                                <span class="mf-photog-handle">${p.photographerHandle}</span>
                            </div>
                        </div>
                        <span class="mf-photo-res-badge">${p.resolution}</span>
                    </div>

                    <h4 class="mf-photo-title">${p.title}</h4>

                    <div class="mf-photo-bottom-row">
                        <div class="mf-photo-price-box">
                            <span class="mf-price-label">Foto Original HD</span>
                            <span class="mf-price-val">${p.price}</span>
                        </div>
                        <div class="mf-photo-btn-group">
                            <button type="button" class="mf-btn-buy-pix" onclick="window.mfInstantBuyPhoto(${p.id}, '${p.title}', '${p.price}')">
                                <i data-lucide="zap"></i><span>Comprar PIX</span>
                            </button>
                            <button type="button" class="mf-btn-add-cart" onclick="window.mfAddToCart(${p.id})" title="Adicionar ao Carrinho">
                                <i data-lucide="shopping-bag"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `).join('')}
    </div>
  `;

  // Read template part files
  const authModalPhp = fs.readFileSync(path.join(THEME_DIR, 'template-parts', 'modal-auth-gatekeeper.php'), 'utf8')
    .replace(/<\?php[\s\S]*?\?>/g, '');
  const slideshowModalPhp = fs.readFileSync(path.join(THEME_DIR, 'template-parts', 'modal-slideshow.php'), 'utf8')
    .replace(/<\?php[\s\S]*?\?>/g, '');
  const radarModalPhp = fs.readFileSync(path.join(THEME_DIR, 'template-parts', 'modal-radar.php'), 'utf8')
    .replace(/<\?php[\s\S]*?\?>/g, '');
  const vipModalPhp = fs.readFileSync(path.join(THEME_DIR, 'template-parts', 'modal-vip.php'), 'utf8')
    .replace(/<\?php[\s\S]*?\?>/g, '');
  const cartModalPhp = fs.readFileSync(path.join(THEME_DIR, 'template-parts', 'modal-cart.php'), 'utf8')
    .replace(/<\?php[\s\S]*?\?>/g, '');

  const footerHtml = `
    <!-- BARRA MOBILE -->
    <nav class="mf-mobile-bottom-nav">
        <a href="/" class="mf-mobile-tab-btn active"><i data-lucide="compass"></i><span>Feed</span></a>
        <button type="button" class="mf-mobile-tab-btn" id="mf-mobile-radar-btn"><i data-lucide="radar"></i><span>Radar</span></button>
        <button type="button" class="mf-mobile-tab-btn mf-mobile-faceid-highlight" id="mf-mobile-faceid-btn">
            <div class="mf-faceid-glow-ring"><i data-lucide="scan-face"></i></div><span>Face ID</span>
        </button>
        <button type="button" class="mf-mobile-tab-btn" id="mf-mobile-slideshow-btn"><i data-lucide="layers"></i><span>Mosaico</span></button>
        <button type="button" class="mf-mobile-tab-btn" id="mf-mobile-auth-btn"><i data-lucide="user"></i><span>Conta</span></button>
    </nav>

    <!-- RODAPÉ -->
    <footer class="mf-footer-section">
        <div class="mf-container">
            <div class="mf-footer-grid">
                <div class="mf-footer-col-brand">
                    <div class="mf-logo-text mf-footer-logo">meflagrou<span>.com</span></div>
                    <p class="mf-footer-desc">A plataforma número 1 de cobertura fotográfica inteligente de festivais e baladas no Brasil.</p>
                    <div class="mf-security-badges-row">
                        <span class="mf-badge-item"><i data-lucide="shield-check"></i> SSL 256-Bit</span>
                        <span class="mf-badge-item"><i data-lucide="lock"></i> LGPD Compliant</span>
                        <span class="mf-badge-item"><i data-lucide="file-check"></i> CPF Módulo 11</span>
                    </div>
                </div>
                <div class="mf-footer-col">
                    <h4 class="mf-footer-col-title">Navegação</h4>
                    <ul class="mf-footer-links">
                        <li><a href="/">Feed de Flagrantes</a></li>
                        <li><a href="#" id="mf-footer-radar-link">Radar de Festivais</a></li>
                        <li><a href="#" id="mf-footer-slideshow-link">Mosaico em Tela Cheia</a></li>
                        <li><a href="#" id="mf-footer-vip-link">Passe VIP 8K</a></li>
                    </ul>
                </div>
                <div class="mf-footer-col">
                    <h4 class="mf-footer-col-title">Atendimento</h4>
                    <div class="mf-whatsapp-support-card">
                        <i data-lucide="message-circle" class="mf-wa-icon"></i>
                        <div><strong>Suporte WhatsApp 24/7</strong><span>(11) 98888-7777</span></div>
                    </div>
                    <p class="mf-footer-copy">&copy; 2026 meflagrou.com • Tema WordPress Oficial.</p>
                </div>
            </div>
        </div>
    </footer>

    ${authModalPhp}
    ${slideshowModalPhp}
    ${radarModalPhp}
    ${vipModalPhp}
    ${cartModalPhp}

    <script src="/assets/js/meflagrou-app.js"></script>
</body>
</html>
  `;

  return `
    ${headerHtml}
    <main id="primary" class="mf-main-feed-site">
        <div class="mf-container">
            <section class="mf-stories-section">${storiesHtml}</section>
            <section class="mf-featured-paired-section">${pairedBlocksHtml}</section>
            <section class="mf-filter-chips-section">
                <div class="mf-filter-chips-scroll">
                    <button type="button" class="mf-chip-btn active"><i data-lucide="sparkles"></i><span>Todos os Flagrantes (8.420)</span></button>
                    <button type="button" class="mf-chip-btn"><span class="mf-chip-dot green"></span><span>Warung Beach Club</span></button>
                    <button type="button" class="mf-chip-btn"><span class="mf-chip-dot blue"></span><span>Laroc Club Open Air</span></button>
                    <button type="button" class="mf-chip-btn"><span class="mf-chip-dot pink"></span><span>Green Valley Camboriú</span></button>
                    <button type="button" class="mf-chip-btn"><span class="mf-chip-dot gold"></span><span>Privilège Sunset</span></button>
                    <button type="button" class="mf-chip-btn mf-chip-faceid" id="mf-chip-my-flags"><i data-lucide="scan-face"></i><span>Meus Flagrantes (Face ID)</span></button>
                </div>
                <div class="mf-filter-right-action">
                    <button type="button" class="mf-btn-fullscreen-trigger" id="mf-trigger-mosaico-btn"><i data-lucide="maximize"></i><span>Ver em Mosaico & Slideshow</span></button>
                </div>
            </section>
            <section class="mf-feed-grid-section">${feedHtml}</section>
        </div>
    </main>
    ${footerHtml}
  `;
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Static Assets
  if (url === '/assets/css/meflagrou.css') {
    const css = fs.readFileSync(path.join(THEME_DIR, 'assets', 'css', 'meflagrou.css'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/css' });
    return res.end(css);
  }

  if (url === '/assets/js/meflagrou-app.js') {
    const js = fs.readFileSync(path.join(THEME_DIR, 'assets', 'js', 'meflagrou-app.js'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    return res.end(js);
  }

  // REST API Endpoints
  if (url.startsWith('/wp-json/meflagrou/v1/feed')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, data: mockPhotos }));
  }

  // Main WordPress HTML Output
  const html = renderWordPressTemplate();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 meflagrou WordPress Local Server running on http://localhost:${PORT}/`);
});
