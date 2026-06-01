/* ============================================================
   WEDDING INVITATION — script.js
   Dynamic interactions, animations, countdown, gallery, RSVP
   ============================================================ */

(function () {
  'use strict';

  /* ────────────────────────────────
     CONFIG — edit these values
  ──────────────────────────────── */
  const CONFIG = {
    weddingDate: '2025-09-14T18:00:00',
    rsvpDeadline: 'August 1, 2025',
    coupleNames: { bride: 'Layla', groom: 'Karim' },
    venue: {
      name: 'The Grand Rose Palace',
      address: '12 Al-Ahram Boulevard, Cairo, Egypt',
      mapsUrl: 'https://maps.google.com/?q=The+Grand+Rose+Palace+Cairo',
      embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27604.65!2d31.22!3d30.04!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sCairo!5e0!3m2!1sen!2seg!4v1680000000000'
    },
    musicUrl: null, // set to your .mp3 URL to enable music
    galleryItems: [
      /* Add your own photos like:
         { src: 'photos/hero.jpg',    caption: 'The Beginning' },
         { src: 'photos/photo2.jpg',  caption: 'Our Journey' },
      */
      { src: null, caption: 'Our Beginning' },
      { src: null, caption: 'A Perfect Day' },
      { src: null, caption: 'Forever Yours' },
      { src: null, caption: 'Together' },
      { src: null, caption: 'Our Story' },
    ]
  };

  /* ────────────────────────────────
     UTILS
  ──────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const pad = n => String(Math.floor(n)).padStart(2, '0');

  function showToast(msg, duration = 3000) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  /* ────────────────────────────────
     PRELOADER
  ──────────────────────────────── */
  function initPreloader() {
    const loader = $('#preloader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.transition = 'opacity .7s ease';
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          document.body.style.overflow = '';
        }, 700);
      }, 1400);
    });
    document.body.style.overflow = 'hidden';
  }

  /* ────────────────────────────────
     CUSTOM CURSOR (desktop only)
  ──────────────────────────────── */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    const dot = $('#cursor');
    const ring = $('#cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function animateCursor() {
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hovers = $$('a, button, .gallery-item, .attend-opt, .map-btn');
    hovers.forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hovered'); ring.classList.add('hovered'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hovered'); ring.classList.remove('hovered'); });
    });
  }

  /* ────────────────────────────────
     SCROLL PROGRESS BAR
  ──────────────────────────────── */
  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ────────────────────────────────
     NAV — scroll-aware + mobile menu
  ──────────────────────────────── */
  function initNav() {
    const nav = $('#nav');
    const toggle = $('#nav-toggle');
    const mobileMenu = $('#nav-mobile');
    if (!nav) return;

    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 60);
      // hide nav on fast scroll down, show on scroll up
      if (y > 300) {
        nav.style.transform = y > lastY + 5 ? 'translateY(-100%)' : 'translateY(0)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
      lastY = y;
    }, { passive: true });

    nav.style.transition = 'background .4s, padding .4s, box-shadow .4s, transform .35s ease';

    // Mobile toggle
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        const open = toggle.classList.toggle('open');

        mobileMenu.classList.toggle('open', open);

        toggle.setAttribute('aria-expanded', open);

        document.body.style.overflow = open ? 'hidden' : '';
      });

      $$('#nav-mobile a').forEach(a => {
        a.addEventListener('click', () => {
          toggle.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Smooth active link highlight
    const sections = $$('section[id]');
    const navLinks = $$('#nav .nav-links a');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    sections.forEach(s => observer.observe(s));
  }

  /* ────────────────────────────────
     REVEAL ON SCROLL
  ──────────────────────────────── */
  function initReveal() {
    const items = $$('.reveal, .reveal-left, .reveal-right, .reveal-group');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ────────────────────────────────
     COUNTDOWN TIMER
  ──────────────────────────────── */
  function initCountdown() {
    const target = new Date(CONFIG.weddingDate).getTime();
    const els = {
      d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s')
    };
    if (!els.d) return;

    let prev = {};
    function tick() {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
        clearInterval(timer);
        return;
      }

      const vals = {
        d: diff / 86400000,
        h: (diff % 86400000) / 3600000,
        m: (diff % 3600000) / 60000,
        s: (diff % 60000) / 1000
      };

      Object.entries(vals).forEach(([k, v]) => {
        const el = els[k];
        if (!el) return;
        const str = pad(v);
        if (str !== prev[k]) {
          el.classList.add('flip');
          el.textContent = str;
          setTimeout(() => el.classList.remove('flip'), 200);
          prev[k] = str;
        }
      });
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ────────────────────────────────
     GALLERY & LIGHTBOX
  ──────────────────────────────── */
  function initGallery() {
    const grid = $('#gallery-grid');
    if (!grid) return;

    // Build gallery items
    CONFIG.galleryItems.forEach((item, i) => {
      const div = grid.children[i];
      if (!div) return;
      if (item.src) {
        div.innerHTML = `
          <img src="${item.src}" alt="${item.caption}" loading="lazy"/>
          <div class="gallery-overlay">
            <span class="gallery-overlay-text">${item.caption}</span>
          </div>`;
      }
    });

    // Lightbox
    const lb = $('#lightbox');
    const lbImg = $('#lightbox-img');
    const lbClose = $('#lightbox-close');
    const lbPrev = $('#lightbox-prev');
    const lbNext = $('#lightbox-next');
    if (!lb) return;

    const images = CONFIG.galleryItems.filter(i => i.src);
    let current = 0;

    function openLightbox(idx) {
      if (!images.length) return;
      current = idx;
      lbImg.src = images[current].src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    function navigate(dir) {
      current = (current + dir + images.length) % images.length;
      lbImg.style.opacity = '0';
      setTimeout(() => {
        lbImg.src = images[current].src;
        lbImg.style.opacity = '1';
      }, 200);
    }

    $$('.gallery-item', grid).forEach((el, i) => {
      el.addEventListener('click', () => {
        const hasImg = CONFIG.galleryItems[i]?.src;
        if (hasImg) openLightbox(i);
      });
    });

    lbClose && lbClose.addEventListener('click', closeLightbox);
    lbPrev && lbPrev.addEventListener('click', () => navigate(-1));
    lbNext && lbNext.addEventListener('click', () => navigate(1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Touch swipe
    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    });
  }

  /* ────────────────────────────────
     RSVP FORM
  ──────────────────────────────── */
  function initRSVP() {
    const form = $('#rsvp-form');
    const thanks = $('#rsvp-thanks');
    const attendBtns = $$('.attend-opt');
    const attendInput = $('#attend-val');

    if (!form) return;

    // Attend toggle
    attendBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); // Good practice to prevent any default button action

        attendBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });

        this.classList.add('active');
        this.setAttribute('aria-checked', 'true');

        if (attendInput) {
          attendInput.value = this.dataset.val;
        }
      });
    });

    // Form submit
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.rsvp-submit');
      const progress = btn.querySelector('.btn-progress');

      btn.disabled = true;
      btn.textContent = 'Sending...';
      if (progress) {
        progress.style.width = '100%';
      }

      // Simulate submission (replace with real fetch/formspree/etc.)
      setTimeout(() => {
        const attending = attendInput?.value !== 'declines';
        if (form.parentElement) form.parentElement.style.display = 'none';
        if (thanks) {
          thanks.style.display = 'block';
          const msg = thanks.querySelector('.rsvp-thanks-msg');
          if (msg) {
            msg.textContent = attending
              ? "We can't wait to celebrate with you!"
              : "We'll miss you, but we understand.";
          }
        }
        showToast(attending ? '✦  Reply received — see you soon!' : '✦  Reply received — thank you!');
      }, 1000);
    });

    // Real-time field validation glow
    $$('.field input, .field textarea, .field select', form).forEach(el => {
      el.addEventListener('input', () => {
        const valid = el.checkValidity();
        el.style.borderBottomColor = el.value ? (valid ? 'var(--sage)' : 'var(--blush)') : '';
      });
    });
  }

  /* ────────────────────────────────
     BACKGROUND MUSIC
  ──────────────────────────────── */
  function initMusic() {
    const player = $('#music-player');
    const btn = $('#music-btn');
    const audio = $('#bg-music');
    if (!player || !btn) return;

    if (!CONFIG.musicUrl || !audio) {
      player.style.display = 'none';
      return;
    }

    audio.src = CONFIG.musicUrl;
    audio.volume = 0.35;

    btn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          btn.classList.add('playing');
          showToast('♪  Music playing');
        }).catch(() => showToast('Could not play audio'));
      } else {
        audio.pause();
        btn.classList.remove('playing');
        showToast('♪  Music paused');
      }
    });
  }

  /* ────────────────────────────────
     PARALLAX HERO ORNAMENT
  ──────────────────────────────── */
  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ornament = $('.hero-ornament');
    const heroNames = $('.hero-names');
    if (!ornament) return;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        ornament.style.transform = `translateY(${y * 0.15}px)`;
        if (heroNames) heroNames.style.transform = `translateY(${y * 0.08}px)`;
      }
    }, { passive: true });
  }

  /* ────────────────────────────────
     MAP BUTTON RIPPLE
  ──────────────────────────────── */
  function initMapButton() {
    const btn = $('.map-btn');
    if (!btn) return;
    btn.href = CONFIG.venue.mapsUrl;
    // Update iframe src
    const iframe = $('.map-frame iframe');
    if (iframe) iframe.src = CONFIG.venue.embedUrl;
  }

  /* ────────────────────────────────
     INJECT DYNAMIC CONTENT
  ──────────────────────────────── */
  function populateContent() {
    // Bride & groom names
    $$('.bride-name').forEach(el => { el.textContent = CONFIG.coupleNames.bride; });
    $$('.groom-name').forEach(el => { el.textContent = CONFIG.coupleNames.groom; });
    $$('.couple-names').forEach(el => {
      el.textContent = `${CONFIG.coupleNames.bride} & ${CONFIG.coupleNames.groom}`;
    });
    // Venue
    $$('.venue-name-text').forEach(el => { el.textContent = CONFIG.venue.name; });
    $$('.venue-address-text').forEach(el => { el.textContent = CONFIG.venue.address; });
    // RSVP deadline
    $$('.rsvp-deadline').forEach(el => { el.textContent = CONFIG.rsvpDeadline; });
    // Wedding date text
    const target = new Date(CONFIG.weddingDate);
    $$('.wedding-date-text').forEach(el => {
      el.textContent = target.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    });
  }

  /* ────────────────────────────────
     HERO NAME LETTER ANIMATION
  ──────────────────────────────── */
  function animateHeroNames() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ['.hero-names .bride', '.hero-names .groom'].forEach((sel, si) => {
      const el = $(sel);
      if (!el) return;
      const text = el.textContent;
      el.textContent = '';
      el.style.opacity = '1';
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.cssText = `display:inline-block; opacity:0; transform:translateY(18px);
          transition: opacity .5s ${(si * 0.3 + i * 0.05)}s ease, transform .5s ${(si * 0.3 + i * 0.05)}s ease;`;
        el.appendChild(span);
        // trigger
        setTimeout(() => { span.style.opacity = '1'; span.style.transform = 'translateY(0)'; },
          600 + si * 300 + i * 50);
      });
    });
  }

  /* ────────────────────────────────
     INIT ALL
  ──────────────────────────────── */
  function init() {
    populateContent();
    initPreloader();
    initCursor();
    initScrollProgress();
    initNav();
    initReveal();
    initCountdown();
    initGallery();
    initRSVP();
    initMusic();
    initParallax();
    initMapButton();
    animateHeroNames();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
