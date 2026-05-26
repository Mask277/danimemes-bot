/* ================================================================
   DANIMEMES — index.js
   - 4-way world theme engine (Arrakis / Night City / Old World / Grim Future)
   - Sticky nav hide/reveal + section color flip via IO
   - Parallax marquee words
   - Accordion expand
   - Chat — delegates to Dialogflow df-messenger floating widget
   - Tweaks panel
   ================================================================ */

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LS_KEY = 'danimemes.state.v2';

  // -----------------------------------------------------------------
  // Theme constants
  // -----------------------------------------------------------------
  const THEME_ORDER = ['arrakis', 'night-city', 'oldworld', 'grimfuture'];
  const THEME_LABELS = {
    'arrakis':    'ARRAKIS',
    'night-city': 'NIGHT CITY',
    'oldworld':   'OLD WORLD',
    'grimfuture': 'GRIM FUTURE',
  };
  // Map each theme to the data-* key used on copy elements.
  const THEME_KEY = {
    'arrakis':    'arr',
    'night-city': 'nc',
    'oldworld':   'ow',
    'grimfuture': 'gf',
  };
  const ALL_THEME_CLASSES = ['arrakis', 'night-city', 'oldworld', 'grimfuture'];

  // -----------------------------------------------------------------
  // Persisted state
  // -----------------------------------------------------------------
  const defaults = {
    theme: 'arrakis',        // 'arrakis' | 'night-city' | 'oldworld' | 'grimfuture'
    accent: 'crimson',       // arrakis accents OR theme-specific accents
    density: 'comfortable',  // 'compact' | 'comfortable' | 'spacious'
    glitch: 1,
  };

  // Per-theme accent palettes.
  // Arrakis/Night City entries set crimson+cream CSS vars.
  // Old World entries set --ow-oxblood + --ow-vellum.
  // Grim Future entries set --gf-brass + --gf-void.
  const accents = {
    // Arrakis palette
    crimson: { crimson: '#c8541a', cream: '#ede0bc' }, // Spice & Sand — Dune default
    classic: { crimson: '#e40038', cream: '#faf3e9' }, // Original crimson/cream
    ink:     { crimson: '#1c130a', cream: '#e6d3a3' }, // Sietch ink on sand
    navy:    { crimson: '#1f4e7a', cream: '#ede0bc' }, // Fremen blue on sand
    olive:   { crimson: '#3a4a1e', cream: '#f0e6c2' },
    // Old World palette — dark-elf coded (midnight violet, moonstone, cruel blood)
    oxblood: { owOxblood: '#1f1430', owVellum: '#c4bccc' }, // Midnight violet & moonstone (default)
    forest:  { owOxblood: '#0e1d18', owVellum: '#b8c4b8' }, // Deep sea-elf green
    iron:    { owOxblood: '#06030a', owVellum: '#b0a8ba' }, // Obsidian black
    royal:   { owOxblood: '#161a3a', owVellum: '#c0c8d4' }, // Sapphire dark
    // Grim Future palette — sororitas coded (pitch, cardinal red, gold, ivory)
    brass:   { gfBrass: '#c89a3a', gfVoid: '#0a0608' }, // Sanctified gold on pitch (default)
    ember:   { gfBrass: '#b81628', gfVoid: '#0a0408' }, // Cardinal red on pitch
    bone:    { gfBrass: '#5a0a12', gfVoid: '#efe4cc' }, // Cardinal on ivory (inverted)
    void:    { gfBrass: '#7894b8', gfVoid: '#06080e' }, // Cold ice-blue (rare order)
  };

  // Default accent per theme (applied when switching worlds).
  const DEFAULT_ACCENT_FOR_THEME = {
    'arrakis':    'crimson',
    'night-city': 'crimson', // night city ignores accents mostly
    'oldworld':   'oxblood',
    'grimfuture': 'brass',
  };
  const ACCENTS_FOR_THEME = {
    'arrakis':    ['crimson', 'classic', 'ink', 'navy', 'olive'],
    'night-city': ['crimson'],
    'oldworld':   ['oxblood', 'forest', 'iron', 'royal'],
    'grimfuture': ['brass', 'ember', 'bone', 'void'],
  };

  function loadState() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); }
    catch { return { ...defaults }; }
  }
  function saveState(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
  const state = loadState();

  function applyAccent(name) {
    const a = accents[name];
    if (!a) return;
    // Branch on which keys the accent defines so a stale accent from another
    // theme never writes to the wrong set of CSS custom properties.
    if (a.crimson)    document.documentElement.style.setProperty('--crimson', a.crimson);
    if (a.cream)      document.documentElement.style.setProperty('--cream', a.cream);
    if (a.owOxblood)  document.documentElement.style.setProperty('--ow-oxblood', a.owOxblood);
    if (a.owVellum)   document.documentElement.style.setProperty('--ow-vellum', a.owVellum);
    if (a.gfBrass)    document.documentElement.style.setProperty('--gf-brass', a.gfBrass);
    if (a.gfVoid)     document.documentElement.style.setProperty('--gf-void', a.gfVoid);
  }

  function applyDensity(name) {
    const map = {
      compact:      { y: 'clamp(56px, 8vw, 110px)', x: 'clamp(16px, 4vw, 40px)' },
      comfortable:  { y: 'clamp(80px, 11vw, 160px)', x: 'clamp(20px, 5vw, 56px)' },
      spacious:     { y: 'clamp(120px, 14vw, 220px)', x: 'clamp(24px, 6vw, 72px)' },
    };
    const v = map[name] || map.comfortable;
    document.documentElement.style.setProperty('--section-pad-y', v.y);
    document.documentElement.style.setProperty('--section-pad-x', v.x);
  }

  function applyGlitch(v) {
    document.documentElement.style.setProperty('--glitch-amount', String(v));
  }

  function applyTheme(t) {
    if (!THEME_KEY[t]) t = 'arrakis';
    // Swap body class — exactly one theme class active at a time.
    ALL_THEME_CLASSES.forEach((c) => document.body.classList.toggle(c, c === t));

    // Paint the world picker — exactly one button .active / aria-selected.
    document.querySelectorAll('.world-picker .world-btn').forEach((b) => {
      const match = b.dataset.world === t;
      b.classList.toggle('active', match);
      b.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    // Copy swap — every element tagged data-arr/data-nc/data-ow/data-gf updates.
    applyCopy(t);
  }

  function applyCopy(theme) {
    const key = THEME_KEY[theme] || 'arr';
    const sel = [
      '[data-arr], [data-nc], [data-ow], [data-gf]',
      '[data-arr-html], [data-nc-html], [data-ow-html], [data-gf-html]',
      '[data-arr-text], [data-nc-text], [data-ow-text], [data-gf-text]',
      '[data-arr-placeholder], [data-nc-placeholder], [data-ow-placeholder], [data-gf-placeholder]',
    ].join(', ');
    document.querySelectorAll(sel).forEach((el) => {
      // Prefer keyed value; fall back to arr so elements missing ow/gf attrs
      // degrade gracefully before Stage 2 copy attributes are added.
      const html = el.getAttribute('data-' + key + '-html') ?? el.getAttribute('data-arr-html');
      if (html != null) {
        el.innerHTML = html;
      } else {
        const txt = el.getAttribute('data-' + key) ?? el.getAttribute('data-arr');
        if (txt != null) el.textContent = txt;
      }
      const dt = el.getAttribute('data-' + key + '-text') ?? el.getAttribute('data-arr-text');
      if (dt != null) el.setAttribute('data-text', dt);
      const ph = el.getAttribute('data-' + key + '-placeholder') ?? el.getAttribute('data-arr-placeholder');
      if (ph != null) el.setAttribute('placeholder', ph);
    });
  }

  // Initial paint of persisted state
  applyAccent(state.accent);
  applyDensity(state.density);
  applyGlitch(state.glitch);
  applyTheme(state.theme);

  // -----------------------------------------------------------------
  // Cartouche frame SVG injector
  // Concave-corner outline frame with hairline crimson stroke.
  // -----------------------------------------------------------------
  function injectCartouches() {
    document.querySelectorAll('.cartouche').forEach((el) => {
      if (el.querySelector('.cartouche-svg')) return;
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'cartouche-svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');

      // Outer rect with concave (inward) corners.
      // Path: rect that arcs INWARD at each corner
      const r = 6; // concave notch radius
      const path = document.createElementNS(svgNS, 'path');
      const d = [
        `M ${r} 0`,
        `L ${100 - r} 0`,
        `A ${r} ${r} 0 0 0 100 ${r}`,
        `L 100 ${100 - r}`,
        `A ${r} ${r} 0 0 0 ${100 - r} 100`,
        `L ${r} 100`,
        `A ${r} ${r} 0 0 0 0 ${100 - r}`,
        `L 0 ${r}`,
        `A ${r} ${r} 0 0 0 ${r} 0`,
        'Z',
      ].join(' ');
      path.setAttribute('d', d);
      svg.appendChild(path);
      el.prepend(svg);
    });
  }

  // -----------------------------------------------------------------
  // Sticky nav hide/reveal + color flip
  // -----------------------------------------------------------------
  function initNav() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;
    let lastY = window.scrollY;
    let raf = false;

    function update() {
      raf = false;
      const y = window.scrollY;
      if (y < 60) nav.classList.remove('nav-hidden');
      else if (y > lastY) nav.classList.add('nav-hidden');
      else nav.classList.remove('nav-hidden');
      lastY = y;
      pickTopSection();
    }
    window.addEventListener('scroll', () => {
      if (!raf) { raf = true; requestAnimationFrame(update); }
    }, { passive: true });

    const sections = document.querySelectorAll('.page-section[data-section-theme]');
    function pickTopSection() {
      let best = null, bestTop = Infinity;
      sections.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= 90 && r.bottom > 90 && r.top < bestTop) {
          bestTop = r.top; best = el;
        }
      });
      if (best) nav.setAttribute('data-theme', best.dataset.sectionTheme);
    }
    pickTopSection();
  }

  // -----------------------------------------------------------------
  // Parallax marquee words
  // -----------------------------------------------------------------
  function initParallax() {
    if (reducedMotion) return;
    const words = document.querySelectorAll('.parallax-word[data-parallax-speed]');
    if (!words.length) return;
    const items = Array.from(words).map((el) => ({
      el,
      speed: parseFloat(el.dataset.parallaxSpeed) || 0.35,
      section: el.closest('.page-section'),
    }));
    let raf = false;
    function update() {
      raf = false;
      const sy = window.scrollY;
      const vh = window.innerHeight;
      items.forEach((it) => {
        if (!it.section) return;
        const r = it.section.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const sTop = r.top + sy;
        const rel = sy - sTop + vh * 0.5;
        const off = rel * (it.speed - 1);
        it.el.style.transform = `translate(-50%, calc(-50% + ${off.toFixed(2)}px))`;
      });
    }
    window.addEventListener('scroll', () => {
      if (!raf) { raf = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // -----------------------------------------------------------------
  // Accordion
  // -----------------------------------------------------------------
  function initAccordion() {
    document.querySelectorAll('.acc-row').forEach((row) => {
      const head = row.querySelector('.acc-head');
      if (!head) return;
      head.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        // close siblings
        row.parentElement.querySelectorAll('.acc-row.open').forEach((r) => r.classList.remove('open'));
        if (!isOpen) row.classList.add('open');
      });
    });
  }

  // -----------------------------------------------------------------
  // Chat — Option C: shadow-DOM mirror
  //
  // FRAGILITY WARNING — last verified against df-messenger bootstrap.js?v=1
  // as loaded by Google's CDN circa 2025. This code traverses df-messenger's
  // UNDOCUMENTED internal shadow DOM tree:
  //
  //   df-messenger (shadowRoot)
  //     └─ df-messenger-chat (shadowRoot)
  //          ├─ df-message-list (shadowRoot)
  //          │    └─ div.df-message-list  (bot reply nodes live here)
  //          └─ df-messenger-user-input (shadowRoot)
  //               └─ input
  //
  // Google can change any of these element names or DOM structure at any
  // time without notice. If the widget silently updates:
  //   - user messages will still render (we build them locally)
  //   - bot replies will stop mirroring; a console.warn fires
  //   - the input stays usable; nothing throws to the user
  //
  // To fix after a Google widget update: open DevTools, expand
  // df-messenger's shadow root, and update the selectors below.
  // -----------------------------------------------------------------

  // Unique key per rendered bot node so we don't double-mirror.
  const _seenBotNodes = new WeakSet();

  function appendMsg(log, who, text) {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-' + who;
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = who === 'bot' ? 'DAN-BOT' : 'YOU';
    const body = document.createElement('div');
    body.className = 'msg-body';
    body.textContent = text;
    wrap.appendChild(meta);
    wrap.appendChild(body);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function appendTyping(log) {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-bot msg-typing';
    wrap.innerHTML =
      '<div class="msg-meta">DAN-BOT</div>' +
      '<div class="msg-body"><span></span><span></span><span></span></div>';
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  // Traverse into df-messenger's shadow DOM to get the user-input element
  // and its submit button. Returns null if the tree isn't ready yet.
  function getDfInput() {
    try {
      const dfm = document.querySelector('df-messenger');
      if (!dfm || !dfm.shadowRoot) return null;
      const chat = dfm.shadowRoot.querySelector('df-messenger-chat');
      if (!chat || !chat.shadowRoot) return null;
      const uiEl = chat.shadowRoot.querySelector('df-messenger-user-input');
      if (!uiEl || !uiEl.shadowRoot) return null;
      const inputEl  = uiEl.shadowRoot.querySelector('input, textarea');
      const submitEl = uiEl.shadowRoot.querySelector('button[type="submit"], .send-icon, button');
      if (!inputEl || !submitEl) return null;
      return { inputEl, submitEl };
    } catch (e) {
      return null;
    }
  }

  // Locate the message-list's content container in the shadow DOM.
  // Returns null if not yet rendered.
  //
  // Actual structure (verified 2025):
  //   df-messenger.shadowRoot
  //     df-messenger-chat.shadowRoot
  //       df-message-list.shadowRoot        ← NOTE: "df-message-list", NOT "df-messenger-message-list"
  //         div.df-message-list             ← observe THIS node
  function getDfMessageList() {
    try {
      const dfm = document.querySelector('df-messenger');
      if (!dfm || !dfm.shadowRoot) return null;
      const chat = dfm.shadowRoot.querySelector('df-messenger-chat');
      if (!chat || !chat.shadowRoot) return null;
      const ml = chat.shadowRoot.querySelector('df-message-list');
      if (!ml || !ml.shadowRoot) return null;
      return ml.shadowRoot.querySelector('div.df-message-list') || null;
    } catch (e) {
      return null;
    }
  }

  // -----------------------------------------------------------------
  // Shadow-DOM CSS injection — hides ALL df-messenger visible chrome
  // (the FAB launcher bubble AND the expanded chat panel) while keeping
  // the widget fully initialised and functional for our mirror.
  //
  // We cannot use display:none (that would prevent rendering / messaging).
  // Instead we inject visibility:hidden + pointer-events:none into every
  // shadow root that renders visible UI.
  //
  // df-messenger shadow tree (as of bootstrap.js?v=1, 2025):
  //   df-messenger (shadowRoot)          ← root; contains the FAB / bubble
  //     └─ df-messenger-chat (shadowRoot) ← chat panel wrapper
  //          ├─ df-message-list (shadowRoot)
  //          └─ df-messenger-user-input   (shadowRoot)
  // -----------------------------------------------------------------

  const DF_HIDE_CSS = `
    :host, *, *::before, *::after {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;

  function injectStyleIntoShadowRoot(sr) {
    if (!sr) return;
    // Avoid double-injection
    if (sr.__dfHideInjected) return;
    sr.__dfHideInjected = true;
    try {
      const s = document.createElement('style');
      s.setAttribute('data-df-hide', '1');
      s.textContent = DF_HIDE_CSS;
      sr.appendChild(s);
    } catch (e) {
      console.warn('[danimemes] Could not inject hide-style into shadow root:', e);
    }
  }

  // Walk the entire df-messenger shadow tree and inject hide CSS into
  // every shadow root we can reach. Safe to call multiple times.
  function hideDfMessengerChrome() {
    try {
      const dfm = document.querySelector('df-messenger');
      if (!dfm) return;

      // Level 0 — df-messenger itself
      if (dfm.shadowRoot) {
        injectStyleIntoShadowRoot(dfm.shadowRoot);

        // Level 1 — df-messenger-chat
        const chat = dfm.shadowRoot.querySelector('df-messenger-chat');
        if (chat && chat.shadowRoot) {
          injectStyleIntoShadowRoot(chat.shadowRoot);

          // Level 2 — message list and user input
          ['df-message-list', 'df-messenger-user-input'].forEach((sel) => {
            const el = chat.shadowRoot.querySelector(sel);
            if (el && el.shadowRoot) injectStyleIntoShadowRoot(el.shadowRoot);
          });
        }

        // Also target df-messenger-chat-bubble if it exists as a sibling/child
        const bubble = dfm.shadowRoot.querySelector('df-messenger-chat-bubble');
        if (bubble && bubble.shadowRoot) injectStyleIntoShadowRoot(bubble.shadowRoot);
      }
    } catch (e) {
      console.warn('[danimemes] hideDfMessengerChrome error (non-fatal):', e);
    }
  }

  // Poll until df-messenger's shadow root exists, inject hide CSS,
  // then re-inject once more after the chat pane is opened (the pane
  // stamps new shadow roots lazily after first open).
  let _hideApplied = false;
  let _hidePollCount = 0;

  function scheduleDfHide() {
    _hidePollCount++;
    const dfm = document.querySelector('df-messenger');
    if (!dfm || !dfm.shadowRoot) {
      if (_hidePollCount < 60) setTimeout(scheduleDfHide, 200);
      return;
    }
    hideDfMessengerChrome();
    // Re-apply 1 s later to catch lazily-stamped inner shadow roots
    // (they appear only after the first openChat call).
    setTimeout(hideDfMessengerChrome, 1000);
    setTimeout(hideDfMessengerChrome, 2500);
  }

  // Force the hidden df-messenger chat pane open so it initialises its DOM.
  // We do this once on page load, quietly, because the pane's inner elements
  // (message-list, user-input) only get stamped into the shadow DOM AFTER the
  // chat is opened at least once.
  function ensureDfChatOpen() {
    try {
      const dfm = document.querySelector('df-messenger');
      if (!dfm || !dfm.shadowRoot) return;
      // Try public openChat() on the bubble element first
      const bubble = dfm.shadowRoot.querySelector('df-messenger-chat-bubble');
      if (bubble && typeof bubble.openChat === 'function') {
        bubble.openChat();
        return;
      }
      // Fallback: click the first button in the root shadow (the FAB)
      const btn = dfm.shadowRoot.querySelector('button');
      if (btn) btn.click();
    } catch (e) { /* silent */ }
  }

  // Inject text into the hidden widget and submit it.
  function sendToDialogflow(text) {
    try {
      const els = getDfInput();
      if (!els) {
        console.warn('[danimemes] df-messenger input not found — message not dispatched to Dialogflow.');
        return false;
      }
      els.inputEl.value = text;
      els.inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      setTimeout(() => {
        try { els.submitEl.click(); } catch (e) { /* silent */ }
      }, 60);
      return true;
    } catch (e) {
      console.warn('[danimemes] Failed to inject into df-messenger shadow DOM:', e);
      return false;
    }
  }

  // Extract reply text from a bot df-message element.
  // Structure: df-message[isbot] > div.message.bot-message
  //              > span.visually-hidden ("Agent Says:") + text node
  // We clone the message div, strip the visually-hidden child, then read innerText.
  function extractBotText(dfMessageEl) {
    try {
      const msgDiv = dfMessageEl.querySelector('div.message.bot-message');
      if (!msgDiv) return null;
      const clone = msgDiv.cloneNode(true);
      clone.querySelectorAll('.visually-hidden').forEach((n) => n.remove());
      const t = clone.innerText ? clone.innerText.trim() : clone.textContent.trim();
      return t || null;
    } catch (e) {
      return null;
    }
  }

  function initChat() {
    const input  = document.getElementById('chatInput');
    const send   = document.getElementById('chatSend');
    const log    = document.getElementById('chatLog');

    if (!log) return;

    // Initial greeting bubble
    appendMsg(log, 'bot', 'Bi-la kaifa. Type a message or pick a chip — the oracle is listening.');

    if (!input || !send) return;

    let typingIndicator = null;

    // ------------------------------------------------------------------
    // Mirror infrastructure.
    //
    // Design: the df-messenger inner div.df-message-list is only stamped
    // into the shadow DOM AFTER the chat pane is opened for the first time
    // (lazy stamping). We therefore cannot rely on an observer attached at
    // page load.
    //
    // Primary mechanism: send-time polling.
    //   After every submitted message we start a setInterval that scans the
    //   message list every 400 ms for up to ~20 s. On first discovery we
    //   seed _seenBotNodes with whatever is already there (greetings /
    //   pre-existing turns) so they are never mirrored. Subsequent new
    //   df-message[isbot] nodes (the real reply) are mirrored immediately.
    //
    // Secondary mechanism: MutationObserver.
    //   The first time getDfMessageList() returns a non-null node we attach
    //   an observer (guarded by _observerAttached). This catches replies
    //   that arrive between poll ticks.
    //
    // Both paths share _seenBotNodes and mirrorBotNode(), so there is no
    // risk of double-rendering even if both fire for the same node.
    // ------------------------------------------------------------------

    let _observerAttached = false;
    let _listSeedDone = false;          // true once we have seeded the greeting nodes
    let _activePollInterval = null;     // current send-time poll interval handle

    // Mirror a single bot df-message element into #chatLog.
    // Safe to call multiple times for the same node — WeakSet guards it.
    function mirrorBotNode(dfMsg) {
      if (_seenBotNodes.has(dfMsg)) return;
      _seenBotNodes.add(dfMsg);

      const text = extractBotText(dfMsg);
      if (!text) return;

      // Remove typing indicator if present
      if (typingIndicator && typingIndicator.parentNode === log) {
        log.removeChild(typingIndicator);
        typingIndicator = null;
      }

      appendMsg(log, 'bot', text);
    }

    // Seed all currently-present bot nodes so they are never mirrored.
    // Call this exactly once, the first time we discover the list.
    function seedExistingBotNodes(listRoot) {
      if (_listSeedDone) return;
      _listSeedDone = true;
      listRoot.querySelectorAll('df-message[isbot]').forEach((n) => {
        _seenBotNodes.add(n);
      });
    }

    // Attach the MutationObserver to listRoot (once only).
    function maybeAttachObserver(listRoot) {
      if (_observerAttached) return;
      _observerAttached = true;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('df-message[isbot]')) {
              mirrorBotNode(node);
              return;
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('df-message[isbot]').forEach(mirrorBotNode);
            }
          });
        });
      });

      observer.observe(listRoot, { childList: true, subtree: true });
    }

    // Stop the active send-time poll interval.
    function stopSendPoll() {
      if (_activePollInterval !== null) {
        clearInterval(_activePollInterval);
        _activePollInterval = null;
      }
    }

    // Start a send-time polling loop that:
    //  - scans for the message list (handles lazy stamping)
    //  - seeds pre-existing bot nodes on first discovery
    //  - attaches the observer on first discovery
    //  - mirrors any new bot replies
    //  - clears itself after a reply is found OR after ~20 s timeout
    function startSendPoll() {
      stopSendPoll(); // cancel any previous loop

      let ticks = 0;
      const MAX_TICKS = 50; // 50 × 400 ms ≈ 20 s

      _activePollInterval = setInterval(() => {
        ticks++;

        const listRoot = getDfMessageList();

        if (listRoot) {
          // First discovery: seed greetings and attach observer
          seedExistingBotNodes(listRoot);
          maybeAttachObserver(listRoot);

          // Scan for any new bot nodes (catches replies the observer may
          // have missed, and is the reliable primary path)
          let mirrored = false;
          listRoot.querySelectorAll('df-message[isbot]').forEach((node) => {
            if (!_seenBotNodes.has(node)) {
              mirrorBotNode(node);
              mirrored = true;
            }
          });

          if (mirrored) {
            stopSendPoll();
            return;
          }
        }

        // Timeout — no reply arrived; clean up the typing indicator
        if (ticks >= MAX_TICKS) {
          stopSendPoll();
          if (typingIndicator && typingIndicator.parentNode === log) {
            log.removeChild(typingIndicator);
            typingIndicator = null;
          }
          appendMsg(log, 'bot', '[No response — the oracle is silent. Try again.]');
        }
      }, 400);
    }

    // Kick off: open the hidden chat pane so the shadow tree populates.
    window.addEventListener('df-messenger-loaded', () => {
      ensureDfChatOpen();
      // Re-apply hide after openChat stamps the inner shadow roots
      setTimeout(hideDfMessengerChrome, 300);
      setTimeout(hideDfMessengerChrome, 1000);
    });

    // Also try immediately in case the event already fired.
    if (document.querySelector('df-messenger')) {
      ensureDfChatOpen();
    }

    // ------------------------------------------------------------------
    // Submit handler — render user bubble immediately, then dispatch.
    // ------------------------------------------------------------------
    function submit(text) {
      const v = (text || input.value).trim();
      if (!v) return;
      input.value = '';

      // Render user bubble
      appendMsg(log, 'user', v);

      // Typing indicator
      typingIndicator = appendTyping(log);

      // Dispatch to Dialogflow
      const dispatched = sendToDialogflow(v);
      if (!dispatched) {
        // Couldn't send — remove typing indicator, show error bubble
        if (typingIndicator && typingIndicator.parentNode === log) {
          log.removeChild(typingIndicator);
          typingIndicator = null;
        }
        appendMsg(log, 'bot', '[Oracle unreachable — the widget hasn\'t initialised yet. Try again in a moment.]');
        return;
      }

      // Start the send-time polling loop that will mirror the bot reply
      // once Dialogflow responds (handles lazy shadow DOM stamping).
      startSendPoll();

      input.focus();
    }

    send.addEventListener('click', () => submit());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });

    // Suggestion chips
    document.querySelectorAll('.chat-chip').forEach((c) => {
      c.addEventListener('click', () => {
        const q = c.dataset.q || c.textContent.trim();
        submit(q);
      });
    });
  }

  // -----------------------------------------------------------------
  // Tweaks panel — protocol with host editor
  // -----------------------------------------------------------------
  function initTweaks() {
    const panel = document.getElementById('tweaks');
    if (!panel) return;
    let active = false;

    function show() { panel.classList.add('open'); active = true; }
    function hide() {
      panel.classList.remove('open'); active = false;
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch {}
    }

    window.addEventListener('message', (ev) => {
      const t = ev.data && ev.data.type;
      if (t === '__activate_edit_mode') show();
      if (t === '__deactivate_edit_mode') hide();
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}

    panel.querySelector('.x').addEventListener('click', hide);

    // Theme segmented control
    function paintSeg(sel, value) {
      panel.querySelectorAll(`${sel} button`).forEach((b) => {
        b.classList.toggle('active', b.dataset.val === value);
      });
    }
    panel.querySelectorAll('[data-seg]').forEach((seg) => {
      const key = seg.dataset.seg;
      paintSeg(`[data-seg="${key}"]`, state[key]);
      seg.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          const v = b.dataset.val;
          state[key] = v;
          // When the user picks a new world via the Tweaks panel, also
          // snap to that world's default accent so swatches make sense.
          if (key === 'theme') {
            state.accent = DEFAULT_ACCENT_FOR_THEME[v] || 'crimson';
          }
          saveState(state);
          if (key === 'theme') {
            applyTheme(v);
            applyAccent(state.accent);
            // Refresh accent active-state after the theme swap.
            panel.querySelectorAll('[data-accent]').forEach((x) => x.classList.toggle('active', x.dataset.accent === state.accent));
          }
          if (key === 'density') applyDensity(v);
          paintSeg(`[data-seg="${key}"]`, v);
        });
      });
    });

    // Accent swatches — applies whichever swatch is in the visible palette
    panel.querySelectorAll('[data-accent]').forEach((sw) => {
      sw.classList.toggle('active', sw.dataset.accent === state.accent);
      sw.addEventListener('click', () => {
        state.accent = sw.dataset.accent;
        saveState(state);
        applyAccent(state.accent);
        panel.querySelectorAll('[data-accent]').forEach((x) => x.classList.toggle('active', x.dataset.accent === state.accent));
      });
    });

    // Repaint helper used by initWorldPicker — keeps active states in sync
    // after a theme change triggered outside the Tweaks panel.
    paintTweaks = () => {
      paintSeg('[data-seg="theme"]', state.theme);
      paintSeg('[data-seg="density"]', state.density);
      panel.querySelectorAll('[data-accent]').forEach((x) => {
        x.classList.toggle('active', x.dataset.accent === state.accent);
      });
    };

    // Glitch slider
    const slider = panel.querySelector('#glitchSlider');
    if (slider) {
      slider.value = state.glitch;
      slider.addEventListener('input', () => {
        state.glitch = parseFloat(slider.value);
        saveState(state);
        applyGlitch(state.glitch);
      });
    }
  }

  // -----------------------------------------------------------------
  // 4-way world picker — any of 4 worlds, selectable at any time
  // -----------------------------------------------------------------
  function initWorldPicker() {
    const buttons = document.querySelectorAll('.world-picker .world-btn');
    if (!buttons.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.world;
        if (!next || next === state.theme) return;
        // Capture viewport scroll anchor BEFORE the swap so copy-swap reflow
        // (which can shift hero/bio heights across themes) doesn't jerk scroll.
        const anchor = findScrollAnchor();
        state.theme = next;
        // Reset to the new theme's default accent so a stale accent from
        // the previous world never writes to the wrong CSS custom properties.
        state.accent = DEFAULT_ACCENT_FOR_THEME[next] || 'crimson';
        saveState(state);
        applyTheme(state.theme);
        applyAccent(state.accent);
        paintTweaks();
        restoreScrollAnchor(anchor);
      });
    });
  }

  // Stub populated by initTweaks; called by initWorldPicker to keep the
  // Tweaks panel active-states in sync after an external world switch.
  let paintTweaks = () => {};

  // Pick whichever .page-section currently intersects the viewport,
  // and record how far its top sits from the top of the viewport.
  function findScrollAnchor() {
    const sections = document.querySelectorAll('.page-section');
    let best = null;
    let bestArea = -1;
    const vh = window.innerHeight;
    sections.forEach((s) => {
      const r = s.getBoundingClientRect();
      const top = Math.max(0, r.top);
      const bot = Math.min(vh, r.bottom);
      const area = Math.max(0, bot - top);
      if (area > bestArea) { bestArea = area; best = s; }
    });
    if (!best) return null;
    return { el: best, offset: best.getBoundingClientRect().top };
  }

  function restoreScrollAnchor(anchor) {
    if (!anchor || !anchor.el) return;
    // Wait one frame so the reflow from data-arr/data-nc copy swap
    // (and the body class toggle) lands before we measure.
    requestAnimationFrame(() => {
      const newTop = anchor.el.getBoundingClientRect().top;
      const delta = newTop - anchor.offset;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, left: 0, behavior: 'instant' });
      }
    });
  }

  // -----------------------------------------------------------------
  // Boot
  // -----------------------------------------------------------------
  function boot() {
    injectCartouches();
    initNav();
    initParallax();
    initAccordion();
    initChat();
    initTweaks();
    initWorldPicker();
    // Start hiding df-messenger chrome as early as possible.
    // This runs in parallel with initChat's openChat call; the
    // re-injection timeouts inside scheduleDfHide + hideDfMessengerChrome
    // ensure we catch shadow roots stamped lazily after the pane opens.
    scheduleDfHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
