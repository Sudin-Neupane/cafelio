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
  