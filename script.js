/* cafelio script */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, t) => start + (end - start) * t;

function addStyle(css) {
  const node = document.createElement('style');
  node.textContent = css;
  document.head.appendChild(node);
  return node;
}

function initGrain() {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.id = 'grain';
  canvas.width = canvas.height = size;

  Object.assign(canvas.style, {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 9998,
    opacity: '0.055',
    mixBlendMode: 'overlay',
  });

  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function paint() {
    const image = ctx.createImageData(size, size);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
      const grey = (Math.random() * 255) | 0;
      data[i] = data[i + 1] = data[i + 2] = grey;
      data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    requestAnimationFrame(paint);
  }

  paint();
}

function initCursor() {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.id = 'cur-dot';
  ring.id = 'cur-ring';

  Object.assign(dot.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#d4c0a1',
    pointerEvents: 'none',
    zIndex: 10000,
    transform: 'translate(-50%, -50%)',
    transition: 'background 0.2s',
  });

  Object.assign(ring.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1.5px solid #d4c0a1',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s',
  });

  document.body.append(dot, ring);
  
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener('mousemove', event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });
  
  function updateRing() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(updateRing);
  }


  
  updateRing();

  document.addEventListener('mouseover', event => {
    const target = event.target.closest('a, button, .menu-item, .btn, .submit-btn');
    const hovered = Boolean(target);
    ring.style.width = hovered ? '60px' : '36px';
    ring.style.height = hovered ? '60px' : '36px';
    ring.style.borderColor = hovered ? '#8b4513' : '#d4c0a1';
    dot.style.background = hovered ? '#8b4513' : '#d4c0a1';
  });

  document.documentElement.style.cursor = 'none';
}

function initHeader() {
  const header = $('header');
  if (!header) return;

  Object.assign(header.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: '1000',
    padding: '28px 0',
    transition: 'padding 0.4s, background 0.4s, box-shadow 0.4s, backdrop-filter 0.4s',
    background: 'transparent',
  });
  window.addEventListener('scroll', () => {
    const compact = window.scrollY > 80;
    header.style.padding = compact ? '14px 0' : '28px 0';
    header.style.background = compact ? 'rgba(10, 10, 10, 0.92)' : 'transparent';
    header.style.boxShadow = compact ? '0 2px 40px rgba(0,0,0,0.5)' : 'none';
    header.style.backdropFilter = compact ? 'blur(12px)' : 'none';
  }, { passive: true });
}
function initSmoothScroll() {
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = $(anchor.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
}
