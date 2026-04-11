/* =============================================
   AXIS — Main JS
   GSAP + Canvas particle system + ScrollTrigger
   ============================================= */

'use strict';

/* ----------------------------
   Loader
   ---------------------------- */
(function buildLoader() {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.innerHTML = `
    <span class="loader-logo">AXIS</span>
    <div class="loader-bar-track"><div class="loader-bar" id="loader-bar"></div></div>
  `;
  document.body.prepend(loader);

  let progress = 0;
  const bar = document.getElementById('loader-bar');
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      bar.style.width = '100%';
      setTimeout(dismissLoader, 300);
    } else {
      bar.style.width = progress + '%';
    }
  }, 60);

  function dismissLoader() {
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: () => {
        loader.remove();
        initAll();
      }
    });
  }
})();

/* ----------------------------
   GSAP plugins
   ---------------------------- */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ----------------------------
   Custom Cursor
   ---------------------------- */
function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    gsap.to(cursor, { x: mx, y: my, duration: 0.08, ease: 'none' });
  });

  (function followLoop() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    gsap.set(follower, { x: fx, y: fy });
    requestAnimationFrame(followLoop);
  })();
}

/* ----------------------------
   Canvas Particle System
   ---------------------------- */
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], shapes = [];

  const RUST       = [196, 66, 26];
  const RUST_LIGHT = [224, 85, 37];
  const CREAM      = [240, 230, 211];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildParticles(); buildShapes(); });

  /* ---- Particles (dust/ember trails) ---- */
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.life   = 0;
      this.maxLife = 180 + Math.random() * 200;
      this.size   = Math.random() * 2.5 + 0.5;
      const t = Math.random();
      if (t < 0.5) {
        this.r = RUST[0]; this.g = RUST[1]; this.b = RUST[2];
      } else if (t < 0.8) {
        this.r = RUST_LIGHT[0]; this.g = RUST_LIGHT[1]; this.b = RUST_LIGHT[2];
      } else {
        this.r = CREAM[0]; this.g = CREAM[1]; this.b = CREAM[2];
      }
    }

    update() {
      this.x  += this.vx + Math.sin(this.life * 0.03) * 0.3;
      this.y  += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.7;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${alpha})`;
      ctx.fill();
    }
  }

  /* ---- Geometric floating shapes ---- */
  class Shape {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 80;
      this.size = Math.random() * 80 + 30;
      this.vx   = (Math.random() - 0.5) * 0.15;
      this.vy   = -(Math.random() * 0.12 + 0.04);
      this.rot  = Math.random() * Math.PI * 2;
      this.rspd = (Math.random() - 0.5) * 0.003;
      this.life    = 0;
      this.maxLife = 600 + Math.random() * 400;
      this.sides   = [3, 4, 6][Math.floor(Math.random() * 3)];
      this.alpha   = Math.random() * 0.08 + 0.02;
      this.stroke  = Math.random() > 0.5;
    }

    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.rspd;
      this.life++;
      if (this.life > this.maxLife || this.y < -this.size * 2) this.reset();
    }

    draw() {
      const progress = this.life / this.maxLife;
      const a = Math.sin(progress * Math.PI) * this.alpha;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.beginPath();
      for (let i = 0; i < this.sides; i++) {
        const angle = (i / this.sides) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      if (this.stroke) {
        ctx.strokeStyle = `rgba(${RUST[0]},${RUST[1]},${RUST[2]},${a * 2})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${RUST[0]},${RUST[1]},${RUST[2]},${a})`;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ---- Scan lines ---- */
  function drawScanlines() {
    ctx.save();
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = `rgba(0,0,0,0.03)`;
      ctx.fillRect(0, y, W, 1);
    }
    ctx.restore();
  }

  /* ---- Radial glow ---- */
  function drawGlow() {
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.6, 0, W * 0.5, H * 0.6, W * 0.55);
    grd.addColorStop(0,   'rgba(196,66,26,0.08)');
    grd.addColorStop(0.5, 'rgba(139,58,30,0.03)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  function buildParticles() {
    particles = Array.from({ length: 120 }, () => new Particle());
  }
  function buildShapes() {
    shapes = Array.from({ length: 14 }, () => new Shape());
  }
  buildParticles();
  buildShapes();

  /* ---- Animation loop ---- */
  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Deep dark background with slight gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0C0A08');
    bg.addColorStop(1, '#080705');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawGlow();

    shapes.forEach(s => { s.update(); s.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });

    drawScanlines();

    requestAnimationFrame(tick);
  }
  tick();
}

/* ----------------------------
   Nav scroll behavior
   ---------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -80',
    onEnter:      () => nav.classList.add('scrolled'),
    onLeaveBack:  () => nav.classList.remove('scrolled'),
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) gsap.to(window, { scrollTo: target, duration: 1.2, ease: 'power3.inOut' });
    });
  });
}

/* ----------------------------
   Hero entrance
   ---------------------------- */
function initHero() {
  const tl = gsap.timeline({ delay: 0.1 });

  tl.to('.hero-eyebrow', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  });

  // Words slide up one by one
  gsap.utils.toArray('.word').forEach((word, i) => {
    tl.to(word, {
      y: '0%',
      duration: 0.9,
      ease: 'expo.out',
    }, i * 0.08 + 0.2);
  });

  tl.to('.hero-sub', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.3');

  tl.to('.hero-badge', {
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
  }, '-=0.5');
}

/* ----------------------------
   About section
   ---------------------------- */
function initAbout() {
  gsap.to('.reveal-left', {
    opacity: 1, x: 0,
    duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#about', start: 'top 75%' }
  });

  gsap.to('.reveal-right', {
    opacity: 1, x: 0,
    duration: 1.1, ease: 'power3.out',
    delay: 0.15,
    scrollTrigger: { trigger: '#about', start: 'top 75%' }
  });

  // Count-up numbers
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].val); }
        });
      }
    });
  });
}

/* ----------------------------
   Work grid
   ---------------------------- */
function initWork() {
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  gsap.utils.toArray('.reveal-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, scale: 1,
      duration: 1, ease: 'power3.out',
      delay: (i % 3) * 0.1,
      scrollTrigger: { trigger: card, start: 'top 88%' }
    });
  });

  // Tilt effect
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const inner = card.querySelector('.card-inner');
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);
      gsap.to(inner, {
        rotateY:  dx * 6,
        rotateX: -dy * 6,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 900,
        transformOrigin: 'center center',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(inner, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.8)' });
    });
  });
}

/* ----------------------------
   Services
   ---------------------------- */
function initServices() {
  gsap.utils.toArray('.reveal-service').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.8, ease: 'power3.out',
      delay: i * 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
}

/* ----------------------------
   Statement
   ---------------------------- */
function initStatement() {
  gsap.to('.reveal-statement', {
    opacity: 1, y: 0,
    duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.statement-section', start: 'top 70%' }
  });

  // Parallax on the text
  gsap.to('.statement-text', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.statement-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5
    }
  });
}

/* ----------------------------
   Contact
   ---------------------------- */
function initContact() {
  gsap.utils.toArray('#contact .reveal-up').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out',
      delay: i * 0.12,
      scrollTrigger: { trigger: '#contact', start: 'top 75%' }
    });
  });

  gsap.fromTo('.contact-bg-text',
    { xPercent: 10, opacity: 0 },
    {
      xPercent: 0, opacity: 1,
      duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-section', start: 'top 80%' }
    }
  );
}

/* ----------------------------
   Horizontal marquee speed boost on scroll
   ---------------------------- */
function initMarquee() {
  const inner = document.querySelector('.marquee-inner');
  let speed   = 28; // base animation duration (s)

  ScrollTrigger.create({
    trigger: '.marquee-track',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: self => {
      const v = Math.abs(self.getVelocity()) / 800;
      const dur = Math.max(6, 28 - v * 4);
      gsap.to(inner, { '--duration': dur + 's' });
      inner.style.animationDuration = dur + 's';
    }
  });
}

/* ----------------------------
   Init all
   ---------------------------- */
function initAll() {
  initCursor();
  initCanvas();
  initNav();
  initHero();
  initAbout();
  initWork();
  initServices();
  initStatement();
  initContact();
  initMarquee();
  ScrollTrigger.refresh();
}
