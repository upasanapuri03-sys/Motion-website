/* ============================================
   MOTION WEBSITE — main.js
   GSAP + Canvas particle system
   ============================================ */

gsap.registerPlugin(ScrollTrigger);

/* ============================================
   HERO CANVAS — Particle / Trail System
   ============================================ */
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [], mouse = { x: -9999, y: -9999 };

function resize() {
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

/* ---- Geometric shapes in background ---- */
const shapes = Array.from({ length: 9 }, (_, i) => ({
  x: Math.random() * 100,   // % of W
  y: Math.random() * 100,   // % of H
  r: 60 + Math.random() * 120,
  vx: (Math.random() - 0.5) * 0.18,
  vy: (Math.random() - 0.5) * 0.14,
  rot: Math.random() * Math.PI * 2,
  rotV: (Math.random() - 0.5) * 0.004,
  sides: [3, 4, 6][Math.floor(Math.random() * 3)],
  alpha: 0.04 + Math.random() * 0.06,
  color: ['#00FFB2', '#7B2FBE', '#FF2D55', '#00D4FF', '#FFB800'][i % 5],
}));

/* ---- Trail particles ---- */
class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
    this.alpha = 0.6 + Math.random() * 0.4;
    this.size = 1.5 + Math.random() * 2.5;
    this.life = 1;
    this.decay = 0.012 + Math.random() * 0.018;
    this.color = ['#00FFB2', '#7B2FBE', '#00D4FF'][Math.floor(Math.random() * 3)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy -= 0.015;
    this.life -= this.decay;
    this.alpha = this.life * 0.7;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ---- Connection lines between nearby particles ---- */
const staticDots = Array.from({ length: 80 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  vx: (Math.random() - 0.5) * 0.06,
  vy: (Math.random() - 0.5) * 0.06,
  r: 1 + Math.random() * 1.5,
}));

function drawPolygon(x, y, r, sides, rot, alpha, color) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rot + (i / sides) * Math.PI * 2;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

let frameCount = 0;

function loop() {
  ctx.clearRect(0, 0, W, H);

  /* faint gradient radial at center */
  const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.7);
  grd.addColorStop(0, 'rgba(0,255,178,0.03)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  /* floating shapes */
  shapes.forEach(s => {
    s.x += s.vx; s.y += s.vy; s.rot += s.rotV;
    if (s.x < -10) s.x = 110; if (s.x > 110) s.x = -10;
    if (s.y < -10) s.y = 110; if (s.y > 110) s.y = -10;
    drawPolygon(s.x / 100 * W, s.y / 100 * H, s.r, s.sides, s.rot, s.alpha, s.color);
  });

  /* static dots + connections */
  staticDots.forEach(d => {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > 100) d.vx *= -1;
    if (d.y < 0 || d.y > 100) d.vy *= -1;
    const dx = mouse.x - (d.x / 100 * W);
    const dy = mouse.y - (d.y / 100 * H);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = dist < 120 ? (1 - dist / 120) * 0.5 : 0;

    ctx.save();
    ctx.globalAlpha = 0.15 + glow;
    ctx.fillStyle = '#00FFB2';
    ctx.shadowBlur = glow > 0 ? 12 : 0;
    ctx.shadowColor = '#00FFB2';
    ctx.beginPath();
    ctx.arc(d.x / 100 * W, d.y / 100 * H, d.r + glow * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  /* connection lines */
  ctx.save();
  ctx.strokeStyle = 'rgba(0,255,178,0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < staticDots.length; i++) {
    for (let j = i + 1; j < staticDots.length; j++) {
      const ax = staticDots[i].x / 100 * W, ay = staticDots[i].y / 100 * H;
      const bx = staticDots[j].x / 100 * W, by = staticDots[j].y / 100 * H;
      const d = Math.hypot(ax - bx, ay - by);
      if (d < 120) {
        ctx.globalAlpha = (1 - d / 120) * 0.12;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
    }
  }
  ctx.restore();

  /* spawn mouse trail particles */
  if (mouse.x > 0 && frameCount % 3 === 0) {
    particles.push(new Particle(mouse.x, mouse.y));
  }
  frameCount++;

  /* update + draw trail particles */
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => { p.update(); p.draw(); });

  requestAnimationFrame(loop);
}
loop();

/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let cursorX = 0, cursorY = 0, fX = 0, fY = 0;

document.addEventListener('mousemove', e => {
  cursorX = e.clientX; cursorY = e.clientY;
  gsap.to(cursor, { duration: 0.08, x: cursorX, y: cursorY, ease: 'none' });
});

function animateFollower() {
  fX += (cursorX - fX) * 0.1;
  fY += (cursorY - fY) * 0.1;
  gsap.set(follower, { x: fX, y: fY });
  requestAnimationFrame(animateFollower);
}
animateFollower();

/* ============================================
   NAV SCROLL STYLE
   ============================================ */
const nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 'top top-=80',
  onEnter: () => nav.classList.add('scrolled'),
  onLeaveBack: () => nav.classList.remove('scrolled'),
});

/* ============================================
   HERO ENTRANCE ANIMATION
   ============================================ */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.9, delay: 0.3 })
  .from('.hero-headline .line', {
    y: '110%',
    duration: 1,
    stagger: 0.12,
    ease: 'power4.out',
  }, '-=0.5')
  .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
  .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5');

/* ============================================
   LETTER-BY-LETTER HEADLINE — Manual SplitText
   ============================================ */
function splitIntoLetters(el) {
  const text = el.textContent;
  el.innerHTML = '';
  text.split('').forEach(ch => {
    const span = document.createElement('span');
    span.classList.add('char');
    span.style.display = 'inline-block';
    span.style.overflow = 'hidden';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
  });
  return el.querySelectorAll('.char');
}

document.querySelectorAll('.reveal-title').forEach(title => {
  const chars = splitIntoLetters(title);

  gsap.from(chars, {
    scrollTrigger: {
      trigger: title,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
    y: '100%',
    opacity: 0,
    stagger: 0.04,
    duration: 0.8,
    ease: 'power3.out',
  });
});

/* ============================================
   FADE UP ELEMENTS
   ============================================ */
document.querySelectorAll('.fade-up').forEach(el => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
  });
});

/* ============================================
   WORK CARDS ENTRANCE
   ============================================ */
gsap.from('.work-card', {
  scrollTrigger: {
    trigger: '.work-grid',
    start: 'top 75%',
    toggleActions: 'play none none none',
  },
  opacity: 0,
  y: 60,
  stagger: 0.1,
  duration: 0.9,
  ease: 'power3.out',
});

/* ============================================
   CARD TILT EFFECT
   ============================================ */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = (e.clientY - cy) / (rect.height / 2) * 6;
    const ry = -(e.clientX - cx) / (rect.width / 2) * 6;
    gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.4, ease: 'power2.out', transformPerspective: 800 });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
  });
});

/* ============================================
   SERVICE ITEMS ENTRANCE
   ============================================ */
document.querySelectorAll('.service-item').forEach((item, i) => {
  gsap.from(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 88%',
      toggleActions: 'play none none none',
    },
    opacity: 0,
    x: -40,
    duration: 0.7,
    delay: i * 0.08,
    ease: 'power3.out',
  });
});

/* ============================================
   ABOUT SECTION — parallax numbers
   ============================================ */
gsap.from('.about-title', {
  scrollTrigger: {
    trigger: '#about',
    start: 'top 75%',
    toggleActions: 'play none none none',
  },
  opacity: 0,
  x: -60,
  duration: 1,
  ease: 'power3.out',
});

/* Stat number count-up */
document.querySelectorAll('.stat-num').forEach(el => {
  const target = parseInt(el.textContent.replace(/\D/g, ''));
  const suffix = el.textContent.replace(/[\d]/g, '');
  el.textContent = '0' + suffix;

  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].val) + suffix;
        },
      });
    },
  });
});

/* ============================================
   CONTACT BG TEXT PARALLAX
   ============================================ */
gsap.to('.contact-bg-text', {
  scrollTrigger: {
    trigger: '#contact',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.5,
  },
  y: -80,
  ease: 'none',
});

/* ============================================
   HORIZONTAL SCROLL HINT FADE
   ============================================ */
gsap.to('.hero-scroll-hint', {
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: '30% top',
    scrub: true,
  },
  opacity: 0,
  y: 20,
});

/* ============================================
   MARQUEE PAUSE ON HOVER
   ============================================ */
const track = document.querySelector('.marquee-track');
track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
