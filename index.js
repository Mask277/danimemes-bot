/* ================================================================
   DANIMEMES — index.js
   Handles:
     1. DarkMode() — Arrakis ↔ Night City toggle (glitch theme)
     2. Sticky nav: auto-hide on scroll-down, reveal on scroll-up
     3. Nav color-flip via IntersectionObserver on page sections
     4. Parallax display words: translateY at ~30–40% of scroll delta
   ================================================================ */

/* ----------------------------------------------------------------
   1. DARK MODE / NIGHT CITY TOGGLE
   ----------------------------------------------------------------
   Body class:  'arrakis'    (default, Arrakis cream+crimson theme)
                'night-city' (glitch cyberpunk theme)

   Elements that change:
     - body class
     - #lightSwitch button class + label
     - #descText1, #descText2, #descText3 — data-text swap for glitch layers
     - #dan1 / #dan2 image visibility swap
     - #cBg video visibility (hidden in Arrakis, shown in Night City)
   ---------------------------------------------------------------- */

  function glitchStyle() {
    const dBody = document.getElementById('dModeBody');
    dBody.classList.toggle('arrakis');
    dBody.classList.toggle('night-city');
  }

  function glitchText() {
    const lgtDrk = document.getElementById('lightSwitch');
    const isNightCity = document.getElementById('dModeBody').classList.contains('night-city');

    if (isNightCity) {
      lgtDrk.textContent = 'BACK TO ARRAKIS';
      lgtDrk.classList.remove('btnJp');
      lgtDrk.classList.add('btn-night-city');
    } else {
      lgtDrk.textContent = 'ENTER NIGHT CITY';
      lgtDrk.classList.remove('btn-night-city');
      lgtDrk.classList.add('btnJp');
    }
  }

  function cyberBg() {
    const cyber = document.getElementById('cBg');
    if (!cyber) return;
    cyber.classList.toggle('cBgHide');
  }

  function vacation() {
    const dan1 = document.getElementById('dan1');
    const dan2 = document.getElementById('dan2');
    if (dan1) dan1.classList.toggle('danPicTog');
    if (dan2) dan2.classList.toggle('danPicTog');
  }

  function glitchText2() {
    const descT1 = document.getElementById('descText1');
    const descT2 = document.getElementById('descText2');
    const jpKicker = document.getElementById('jpKicker');

    const content = {
      arrakis: {
        t1: 'WELCOME TO THE DANIEL BOT.',
        t1Data: 'ようこそ　ダンニエルのボットへ',
        t2: 'YOU CAN INTERACT WITH ME USING THE CHATBOX IN THE BOTTOM RIGHT.',
        t2Data: 'Save us Daniel',
        jp: 'ようこそ　ダンニエルのボットへ'
      },
      cyber: {
        t1: '欢迎来到丹尼尔机器人',
        t1Data: 'ようこそ　ダンニエルのボットへ',
        t2: 'WELCOME TO NIGHT CITY',
        t2Data: 'Welcome to Night City',
        jp: 'ようこそ　ダンニエルのボットへ'
      }
    };

    const isArrakis = descT1 && descT1.textContent.trim() === content.arrakis.t1;
    const theme = isArrakis ? 'cyber' : 'arrakis';
    const c = content[theme];

    if (descT1) {
      descT1.textContent = c.t1;
      descT1.setAttribute('data-text', c.t1Data);
    }
    if (descT2) {
      descT2.textContent = c.t2;
      descT2.setAttribute('data-text', c.t2Data);
    }
    if (jpKicker) {
      jpKicker.textContent = c.jp;
    }
  }

  function playAudio() {
    const fadeAudio = document.getElementById('fade');
    if (!fadeAudio) return;
    if (fadeAudio.paused) {
      fadeAudio.play().catch(() => { /* autoplay blocked — silent fail */ });
    } else {
      fadeAudio.pause();
    }
  }

  /* Main toggle — called by onclick="DarkMode()" on #lightSwitch */
  function DarkMode() {
    glitchStyle();
    glitchText();
    cyberBg();
    vacation();
    glitchText2();
    playAudio();
  }

/* ----------------------------------------------------------------
   SCROLL UTILITIES
   ---------------------------------------------------------------- */
  const reducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------------
   2. STICKY NAV — hide on scroll-down, reveal on scroll-up
   ---------------------------------------------------------------- */
  (function initNavBehavior() {
    const nav = document.getElementById('siteNav');
    if (!nav || reducedMotion) return;

    let lastScrollY = window.scrollY;
    let rafPending = false;

    function updateNav() {
      rafPending = false;
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY < 60) {
        /* Near the top — always show nav */
        nav.classList.remove('nav-hidden');
      } else if (delta > 0) {
        /* Scrolling down — hide */
        nav.classList.add('nav-hidden');
      } else if (delta < 0) {
        /* Scrolling up — reveal */
        nav.classList.remove('nav-hidden');
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', function() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateNav);
      }
    }, { passive: true });
  }());

/* ----------------------------------------------------------------
   3. NAV COLOR-FLIP via IntersectionObserver
   Watches each .page-section; whichever section's top edge is
   closest to the top of the viewport sets the nav theme.
   ---------------------------------------------------------------- */
  (function initNavColorFlip() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    const sections = document.querySelectorAll('.page-section[data-section-theme]');

    /* Track which section is currently "active" (topmost visible) */
    const visibleSections = new Map(); // sectionEl → intersectionRatio

    function pickTopSection() {
      /* Among all intersecting sections, pick the one whose top
         is closest to y=82 (bottom of nav) from above */
      let best = null;
      let bestTop = Infinity;

      visibleSections.forEach(function(ratio, el) {
        const rect = el.getBoundingClientRect();
        /* The section that started earliest from the top wins */
        if (rect.top <= 82 && rect.bottom > 82) {
          /* Section straddles the nav bottom edge — it's the active one */
          if (rect.top < bestTop) {
            bestTop = rect.top;
            best = el;
          }
        }
      });

      /* Fallback: first visible section */
      if (!best) {
        sections.forEach(function(el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < bestTop && rect.bottom > 0) {
            bestTop = rect.top;
            best = el;
          }
        });
      }

      if (best) {
        nav.setAttribute('data-theme', best.dataset.sectionTheme || 'crimson');
      }
    }

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target, entry.intersectionRatio);
        } else {
          visibleSections.delete(entry.target);
        }
      });
      pickTopSection();
    }, {
      root: null,
      rootMargin: '-82px 0px 0px 0px', /* account for nav height */
      threshold: [0, 0.1, 0.5, 1.0]
    });

    sections.forEach(function(s) { observer.observe(s); });

    /* Also update on scroll for more precise tracking */
    window.addEventListener('scroll', function() {
      requestAnimationFrame(pickTopSection);
    }, { passive: true });
  }());

/* ----------------------------------------------------------------
   4. PARALLAX DISPLAY WORDS
   Each .parallax-word lives inside its parent .page-section.
   On scroll, we offset it by (scrollY - sectionTop) * (1 - speed)
   so it moves slower than the rest of the content.
   speed = data-parallax-speed attribute (0.0 = stationary, 1.0 = normal scroll)
   ---------------------------------------------------------------- */
  (function initParallax() {
    if (reducedMotion) return;

    const words = document.querySelectorAll('.parallax-word[data-parallax-speed]');
    if (!words.length) return;

    let rafPending = false;

    /* Store per-element data */
    const items = Array.from(words).map(function(el) {
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0.35;
      const section = el.closest('.page-section');
      return { el: el, speed: speed, section: section };
    });

    function updateParallax() {
      rafPending = false;
      const scrollY = window.scrollY;

      items.forEach(function(item) {
        if (!item.section) return;

        const sectionRect = item.section.getBoundingClientRect();
        const sectionTop = sectionRect.top + scrollY;
        const sectionH = item.section.offsetHeight;
        const viewH = window.innerHeight;

        /* Only update when the section is near the viewport */
        if (sectionRect.bottom < -viewH || sectionRect.top > viewH * 2) return;

        /* Offset relative to section's natural scroll position.
           When scrollY == sectionTop the word is centered (translateY 0).
           As user scrolls, the word moves at (speed) fraction of the delta,
           making it appear to slide slower than the surrounding content.    */
        const relativeScroll = scrollY - sectionTop + viewH * 0.5;
        const parallaxOffset = relativeScroll * (item.speed - 1); /* negative = slower */

        item.el.style.transform =
          'translate(-50%, calc(-50% + ' + parallaxOffset.toFixed(2) + 'px))';
      });
    }

    window.addEventListener('scroll', function() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });

    /* Initial paint */
    updateParallax();
  }());
