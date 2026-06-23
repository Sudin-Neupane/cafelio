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
function initMarquee() {
  const menu = $('#menu');
  if (!menu || !menu.parentNode) return;

  const words = ['Espresso', '✦', 'Ritual', '✦', 'Single Origin', '✦', 'Terroir', '✦', 'Barista Craft', '✦', 'Pour Over', '✦', 'Cold Brew', '✦', 'Reserve Blend', '✦'];
  const track = document.createElement('div');
  track.className = 'marquee-track';
  track.innerHTML = `<div class="marquee-inner">${words.concat(words).map(word => `<span class="marquee-word">${word}</span>`).join('')}</div>`;
  menu.parentNode.insertBefore(track, menu.nextElementSibling);

  addStyle(`
    .marquee-track { overflow: hidden; background: #8b4513; padding: 18px 0; position: relative; z-index: 10; }
    .marquee-inner { display: flex; white-space: nowrap; animation: marquee-scroll 28s linear infinite; }
    .marquee-word { font-family: 'Playfair Display', serif; font-size: 1.05rem; color: #f8f4f0; letter-spacing: 3px; text-transform: uppercase; padding: 0 30px; opacity: 0.9; }
    @keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  `);
}

    
function initActiveNav() {
  const sections = $$('section[id]');
  const links = $$('header nav a');
  if (!sections.length || !links.length) return;

  addStyle(`
    header nav a.nav-active { color: #d4c0a1 !important; }
    header nav a.nav-active::after { content: ''; display: block; position: absolute; bottom: -3px; left: 0; width: 100%; height: 1px; background: #d4c0a1; }
  `);

  window.addEventListener('scroll', () => {
    let activeId = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 200) {
        activeId = section.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle('nav-active', link.getAttribute('href') === `#${activeId}`);
    });
  }, { passive: true });
}

function initCounters() {
  const about = $('.about-text');
  if (!about) return;

  const strip = document.createElement('div');
  strip.className = 'stat-strip';
  strip.innerHTML = `
    <div class="stat-item"><span class="stat-num" data-target="14">0</span><span class="stat-label">Years of Craft</span></div>
    <div class="stat-item"><span class="stat-num" data-target="32">0</span><span class="stat-label">Origin Countries</span></div>
    <div class="stat-item"><span class="stat-num" data-target="98">0</span><span class="stat-label">% Arabica Beans</span></div>
  `;
    addStyle(`
    .stat-strip { display: flex; gap: 32px; margin-top: 40px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 700; color: #8b4513; line-height: 1; }
    .stat-label { font-size: 0.78rem; letter-spacing: 2px; text-transform: uppercase; opacity: 0.65; margin-top: 4px; }
  `);
  about.appendChild(strip);

  let started = false;
  const observer = new IntersectionObserver(entries => {
    if (started) return;
    if (!entries[0].isIntersecting) return;
    started = true;

    $$('.stat-num').forEach(el => {
      const target = Number(el.dataset.target) || 0;
      let current = 0;
      const step = () => {
        current = Math.min(current + Math.ceil(target / 40), target);
        el.textContent = current;
        if (current < target) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  observer.observe(strip);
}  

function initScrambleTitles() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  class Scrambler {
    constructor(el) {
      this.el = el;
      this.text = el.textContent.trim();
      this.run();
    }

    run() {
      let progress = 0;
      const interval = setInterval(() => {
        this.el.textContent = this.text.split('').map((char, index) => {
          if (char === ' ' || index < progress) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        if (progress >= this.text.length) {
          clearInterval(interval);
        }
        progress += 0.6;
      }, 35);
    }
  }
  
 const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      new Scrambler(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  $$('.section-title h2').forEach(el => observer.observe(el));
}

function initContactForm() {
  const form = $('.contact-form form');
  if (!form) return;

  const button = $('.submit-btn', form);
  addStyle(`
    .form-success { text-align: center; padding: 40px; color: #d4c0a1; }
    .form-success svg { width: 60px; height: 60px; margin-bottom: 16px; stroke: #d4c0a1; }
    .form-success h3 { font-family: 'Playfair Display', serif; font-size: 2rem; }
    .form-success p { opacity: 0.7; margin-top: 8px; }
    .field-shake { animation: shake 0.4s; }
    @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
  `);

  
  form.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;

    $$('.contact-form input, .contact-form textarea').forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.classList.remove('field-shake');
        void field.offsetWidth;
        field.classList.add('field-shake');
        field.style.borderColor = '#c0392b';
        setTimeout(() => { field.style.borderColor = ''; }, 800);
      }
    });

    
    if (!valid) return;

    button.textContent = 'Sending…';
    button.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <h3>Message Sent</h3>
          <p>We'll be in touch over a cup of something warm.</p>
        </div>`;
    }, 1200);
  });
}
function initLoader() {
  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.innerHTML = `
    <div style="position: relative;">
      <div class="loader-ring"></div>
      <div class="loader-dot"></div>
    </div>`;

  addStyle(`
    #page-loader { position: fixed; inset: 0; background: #0a0a0a; display: flex; align-items: center; justify-content: center; z-index: 99999; transition: opacity 0.7s ease, visibility 0.7s; }
    #page-loader.hidden { opacity: 0; visibility: hidden; }
    .loader-ring { width: 60px; height: 60px; border-radius: 50%; border: 2px solid rgba(212,192,161,0.15); border-top-color: #d4c0a1; animation: spin 0.9s linear infinite; }
    .loader-dot { position: absolute; width: 8px; height: 8px; background: #8b4513; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    @keyframes spin { to { transform: rotate(360deg); } }
  `);

  document.body.prepend(loader);
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 600);
  });
}

