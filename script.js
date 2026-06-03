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
