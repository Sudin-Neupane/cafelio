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
