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

function initReveal() {
  addStyle(`
    .fade-in, .slide-in-left, .slide-in-right, .scale-in {
      opacity: 0;
      transition: opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1);
    }
    .fade-in { transform: translateY(40px); }
    .slide-in-left { transform: translateX(-60px); }
    .slide-in-right { transform: translateX(60px); }
    .scale-in { transform: scale(0.88); }
    .revealed { opacity: 1; transform: none; }
  `);
  const elements = $$('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
  if (!elements.length) return;

  const groups = new Map();
  elements.forEach(el => {
    const parent = el.parentElement;
    if (!parent) return;
    const list = groups.get(parent) || [];
    list.push(el);
    groups.set(parent, list);
  });
  
  groups.forEach(list => {
    list.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.12}s`;
    });
  });
  
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}
function initParallax() {
  const heroContent = $('.hero-content');
  const heroImage = $('.hero-image');
  const aboutImage = $('.about-image');
  const expImage = $('.experience-image');
  if (!heroContent && !heroImage && !aboutImage && !expImage) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroContent) heroContent.style.transform = `translateY(${y * 0.25}px)`;
    if (heroImage) heroImage.style.transform = `translateY(${y * 0.15}px)`;

    [aboutImage, expImage].forEach(el => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = (rect.top + rect.height * 0.5) / window.innerHeight - 0.5;
      el.style.backgroundPositionY = `${50 + ratio * 20}%`;
    });
  }, { passive: true });
}

function initTypewriter() {
  const heading = $('.hero h1');
  if (!heading) return;

  const phrases = [
    'Experience the Art of Coffee',
    'Crafted Cup by Cup',
    'Where Ritual Meets Flavour',
    'Every Sip, a Story',
  ];
  addStyle(`@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`);

  const cursor = document.createElement('span');
  Object.assign(cursor.style, {
    borderRight: '4px solid #d4c0a1',
    marginLeft: '2px',
    animation: 'blink 0.75s step-end infinite',
  });
  
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  heading.textContent = '';
  heading.appendChild(cursor);

  function tick() {
    const phrase = phrases[phraseIndex];

    if (!deleting) {
      charIndex += 1;
      heading.textContent = phrase.slice(0, charIndex);
      heading.appendChild(cursor);
      if (charIndex === phrase.length) {
        deleting = true;
        return setTimeout(tick, 1800);
      }
    } else {
      charIndex -= 1;
      heading.textContent = phrase.slice(0, charIndex);
      heading.appendChild(cursor);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        return setTimeout(tick, 400);
      }
    }
    
    setTimeout(tick, deleting ? 45 : 90);
  }

  setTimeout(tick, 800);
}

function initMagneticButtons() {
  const buttons = $$('.btn, .submit-btn, .hero-btn');
  buttons.forEach(button => {
    button.addEventListener('mousemove', event => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
      button.style.transition = 'transform 0.5s cubic-bezier(.16,1,.3,1)';
    });

    button.addEventListener('mouseenter', () => {
      button.style.transition = 'transform 0.1s';
    });
  });
}
function initTiltCards() {
  $$('.menu-item').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = clamp(-y * 14, -14, 14);
      const rotateY = clamp(x * 14, -14, 14);
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      card.style.transition = 'transform 0.08s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(.16,1,.3,1)';
    });
  });
}

function initSteam() {
  const hero = $('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
    opacity: '0.55',
  });

  hero.style.position = 'relative';
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  
  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }

  class SteamParticle {
    constructor(fromTop) {
      this.reset(fromTop);
    }
  }
}
    reset(fromTop) {
      this.x = width * 0.55 + (Math.random() - 0.5) * width * 0.6;
      this.y = fromTop ? Math.random() * height : height + 20;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(0.4 + Math.random() * 0.6);
      this.life = 0;
      this.maxLife = 160 + Math.random() * 120;
      this.radius = 1.5 + Math.random() * 3;
    }

    update() {
      this.x += this.vx + Math.sin(this.life * 0.04) * 0.4;
      this.y += this.vy;
      this.life += 1;
      if (this.life > this.maxLife || this.y < -20) {
        this.reset(false);
      }
    }
    
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.18;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,192,161,${alpha})`;
      ctx.fill();
    }
  }
    const particles = Array.from({ length: 120 }, () => new SteamParticle(true));

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);
  animate();
}
    