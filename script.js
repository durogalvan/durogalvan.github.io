const STOCK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4fbmrL9nbqJB6uZZHfQEKbb1CDMkSni92noF12c2RcTpW9yThKobb7owXp4GZsV74/exec?action=getStock';

let stock = {
  Blanca: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
  Negra: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
};

const LATEST_VIDEO_ID = 'iBCWB5ifwJo';
const DOSSIER_SKIP = new Set([1, 5]);

let dossierSlides = [];
let dossierIndex = 0;
let dossierLightbox = null;
let dossierLightboxImage = null;
let dossierCounter = null;
let dossierPreviousOverflow = '';
let dossierPointerStart = null;

document.addEventListener('DOMContentLoaded', () => {
  setupLoader();
  setupMobileMenu();
  setupReveals();
  setupDossierDrag();
  setupDossier();
  setupNavigation();
  setupProductRouting();
  setupYouTube();
  colorMalavida();
  syncStock();
});

function setupLoader() {
  const loader = document.querySelector('.page-loader');
  setTimeout(() => loader?.classList.add('is-done'), 500);
}

function setupMobileMenu() {
  const menu = document.querySelector('.fullscreen-menu');
  const toggle = document.querySelector('.menu-toggle');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('is-open');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

function setupReveals() {
  const elements = document.querySelectorAll('.reveal, .reveal-text');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

/* ---------------- DOSSIER ---------------- */

function setupDossierDrag() {
  const dossier = document.querySelector('.dossier-frame');
  if (!dossier) return;

  let down = false;
  let startX = 0;
  let scrollLeft = 0;

  dossier.addEventListener('mousedown', e => {
    if (e.target.closest('.dossier-track figure') && e.detail === 1) {
      dossierPointerStart = { x: e.pageX, y: e.pageY, time: Date.now() };
    }
    down = true;
    startX = e.pageX - dossier.offsetLeft;
    scrollLeft = dossier.scrollLeft;
    dossier.classList.add('dragging');
  });

  ['mouseleave', 'mouseup'].forEach(type => dossier.addEventListener(type, e => {
    down = false;
    dossier.classList.remove('dragging');

    if (dossierPointerStart && type === 'mouseup') {
      const moved = Math.abs(e.pageX - dossierPointerStart.x);
      dossierPointerStart.moved = moved > 8;
    }
  }));

  dossier.addEventListener('mousemove', e => {
    if (!down) return;
    const x = e.pageX - dossier.offsetLeft;
    if (Math.abs(e.pageX - startX - dossier.offsetLeft) > 8) {
      dossierPointerStart = dossierPointerStart || {};
      dossierPointerStart.moved = true;
    }
    e.preventDefault();
    dossier.scrollLeft = scrollLeft - (x - startX) * 1.4;
  });

  dossier.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      dossier.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
}

function setupDossier() {
  const figures = [...document.querySelectorAll('.dossier-track figure')];

  // El HTML ya viene limpio, pero conservamos esta comprobación por seguridad.
  dossierSlides = figures.filter((figure, originalIndex) => {
    const pageNumber = originalIndex + 1;
    if (DOSSIER_SKIP.has(pageNumber)) {
      figure.remove();
      return false;
    }
    return true;
  });

  dossierSlides.forEach((figure, index) => {
    figure.dataset.dossierIndex = String(index);

    figure.addEventListener('click', e => {
      if (dossierPointerStart?.moved) {
        dossierPointerStart = null;
        return;
      }
      openDossier(index);
    });
  });

  updateDossierCount();
  buildDossierLightbox();
}

function updateDossierCount() {
  const counter = document.querySelector('.dossier-section .scroll-caption span:last-child');
  if (counter) counter.textContent = `${dossierSlides.length} PÁGINAS`;
}

function buildDossierLightbox() {
  if (dossierLightbox) return;

  dossierLightbox = document.createElement('div');
  dossierLightbox.className = 'dossier-lightbox';
  dossierLightbox.setAttribute('role', 'dialog');
  dossierLightbox.setAttribute('aria-modal', 'true');
  dossierLightbox.setAttribute('aria-label', 'Dossier Duro Galván');

  dossierLightbox.innerHTML = `
    <button class="dossier-close" type="button" aria-label="Cerrar dossier">×</button>
    <div class="dossier-zone left" aria-label="Página anterior"></div>
    <img alt="">
    <div class="dossier-zone right" aria-label="Página siguiente"></div>
    <div class="dossier-counter"></div>
  `;

  document.body.appendChild(dossierLightbox);

  dossierLightboxImage = dossierLightbox.querySelector('img');
  dossierCounter = dossierLightbox.querySelector('.dossier-counter');

  dossierLightbox.querySelector('.dossier-close')
    .addEventListener('click', closeDossier);

  dossierLightbox.querySelector('.dossier-zone.left')
    .addEventListener('click', e => {
      e.stopPropagation();
      previousDossier();
    });

  dossierLightbox.querySelector('.dossier-zone.right')
    .addEventListener('click', e => {
      e.stopPropagation();
      nextDossier();
    });

  dossierLightbox.addEventListener('click', e => {
    if (e.target === dossierLightbox) closeDossier();
  });

  dossierLightbox.addEventListener('wheel', e => {
    if (!dossierLightbox.classList.contains('is-open')) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) < 5) return;
    e.deltaY > 0 ? nextDossier() : previousDossier();
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (!dossierLightbox?.classList.contains('is-open')) return;

    if (e.key === 'Escape') closeDossier();
    if (e.key === 'ArrowLeft') previousDossier();
    if (e.key === 'ArrowRight') nextDossier();
  });
}

function dossierImageFor(index) {
  const figure = dossierSlides[index];
  return figure?.querySelector('img');
}

async function openDossier(index) {
  if (!dossierSlides[index]) return;

  dossierIndex = index;
  const image = dossierImageFor(index);
  if (!image) return;

  dossierLightboxImage.src = image.currentSrc || image.src;
  dossierLightboxImage.alt = image.alt || `Dossier página ${index + 1}`;
  dossierCounter.textContent = `${index + 1} / ${dossierSlides.length}`;

  dossierPreviousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dossierLightbox.classList.add('is-open');

  // Intentamos fullscreen real. Si el navegador lo bloquea,
  // el overlay sigue funcionando como visor a pantalla completa.
  try {
    if (!document.fullscreenElement && dossierLightbox.requestFullscreen) {
      await dossierLightbox.requestFullscreen();
    }
  } catch (_) {}
}

async function closeDossier() {
  if (!dossierLightbox) return;

  dossierLightbox.classList.remove('is-open');
  document.body.style.overflow = dossierPreviousOverflow;

  if (document.fullscreenElement) {
    try { await document.exitFullscreen(); } catch (_) {}
  }
}

function nextDossier() {
  if (dossierIndex >= dossierSlides.length - 1) return;
  openDossier(dossierIndex + 1);
}

function previousDossier() {
  if (dossierIndex <= 0) return;
  openDossier(dossierIndex - 1);
}

/* ---------------- NAVEGACIÓN ---------------- */

function setupNavigation() {
  const links = [...document.querySelectorAll('.desktop-nav a[href^="#"], .fullscreen-menu a[href^="#"]')];

  links.forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href')?.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      closeProductPages(false);

      document.querySelectorAll('.desktop-nav a').forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
      });

      history.replaceState(null, '', `#${id}`);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  handleInitialHash();
}

function handleInitialHash() {
  const id = window.location.hash.slice(1);
  if (id === 'camiseta-blanca' || id === 'camiseta-negra') {
    showProductPage(id);
    return;
  }

  const target = document.getElementById(id || 'inicio');
  if (target && id) {
    setTimeout(() => target.scrollIntoView({ block: 'start' }), 0);
  }
}

function setupProductRouting() {
  document.querySelectorAll('[onclick^="showProductPage"]').forEach(button => {
    button.addEventListener('click', () => {
      const match = button.getAttribute('onclick')?.match(/showProductPage\('([^']+)'\)/);
      if (match) history.replaceState(null, '', `#${match[1]}`);
    });
  });

  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => closeProductPages(true));
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash === 'camiseta-blanca' || hash === 'camiseta-negra') {
      showProductPage(hash);
    } else {
      closeProductPages(false);
    }
  });
}

function showProductPage(id) {
  document.querySelectorAll('main > section').forEach(section => {
    section.hidden = section.id !== id;
  });

  document.querySelector('.site-header')?.classList.add('on-product');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeProductPages(updateHash = true) {
  document.querySelectorAll('main > section').forEach(section => {
    section.hidden = false;
  });
  document.querySelectorAll('.product-page').forEach(section => {
    section.hidden = true;
  });
  document.querySelector('.site-header')?.classList.remove('on-product');

  if (updateHash) {
    history.replaceState(null, '', '#tienda');
    document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ---------------- YOUTUBE ---------------- */

function setupYouTube() {
  if (!document.querySelector('meta[name="referrer"]')) {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(meta);
  }

  document.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach((frame, index) => {
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );

    if (index === 0) {
      const base = `https://www.youtube.com/embed/${LATEST_VIDEO_ID}`;
      const params = new URLSearchParams({ rel: '0' });
      if (/^https?:$/.test(location.protocol)) {
        params.set('origin', location.origin);
      }
      frame.src = `${base}?${params.toString()}`;
      frame.title = 'Duro Galván — Hijos de un Caballo';
    }
  });
}

/* ---------------- CONCIERTOS ---------------- */

function colorMalavida() {
  document.querySelectorAll('.concert-details h2, .concert-details h2 i').forEach(el => {
    if (/malavida/i.test(el.textContent || '')) {
      el.style.setProperty('color', '#ffffff', 'important');
    }
  });
}

/* ---------------- STOCK / TIENDA ---------------- */

async function syncStock() {
  try {
    const response = await fetch(STOCK_SCRIPT_URL);
    const data = await response.json();
    if (data.success && data.stock) stock = data.stock;
  } catch (_) {}
  updateStockDisplay();
}

function stockText(product) {
  const data = stock[product] || {};
  return Object.entries(data)
    .map(([size, qty]) => `${size}: ${qty}`)
    .join('  ·  ');
}

function updateStockDisplay() {
  const white = document.getElementById('white-stock-detail');
  const black = document.getElementById('black-stock-detail');
  if (white) white.textContent = `STOCK / ${stockText('Blanca')}`;
  if (black) black.textContent = `STOCK / ${stockText('Negra')}`;
}

// Mantiene compatibilidad con los onclick existentes del HTML.
window.showProductPage = showProductPage;
window.closeProductPage = () => closeProductPages(true);
