# DANIMEMES Redesign Plan — 4-World Expansion (v2 handoff)

> Pre-implementation design review by `design-bridge`. **Status: review only — not yet implemented.**
> Sources: `danimemes (2).zip` handoff vs. current build at `H:\Claude\danimemes-bot\`.
> **Owner decision locked:** Meme gallery → **2 tiles** (match prototype).

---

## 1. What changed between the previous and updated handoff

Previous handoff was a **2-world** site (Arrakis + Night City). The update expands it to **4 worlds**, adds a **first-load entry screen**, and converts the single Night City toggle into a **4-way world picker**. Most sections are structurally unchanged; changes are additive plus token/copy revisions.

**New worlds**
- **OLD WORLD** (`oldworld`, key `ow`) — dark-elf/corsair coded; midnight violet + moonstone serif.
- **GRIM FUTURE** (`grimfuture`, key `gf`) — sister-of-battle/chapel coded; sanctified gold on pitch black, Cinzel caps.

**New structural elements (in prototype, absent from current build)**
- `#entryScreen` full-viewport first-load overlay: `.entry-grid` with a center `.entry-medallion` (FixedDan portrait + four stacked ornament SVGs) surrounded by four `.entry-card`s. Hover peek-in, `:has()`-driven medallion symbol swap, Arrakis-only `.card-spice-field`. Session-gated via `sessionStorage danimemes.entered.v2`.
- `.world-picker` in the nav replacing `#ncToggle`: four `.world-btn` tabs, each with `.lbl-full`/`.lbl-short` spans (ARR / N.C. / O.W. / G.F.). Old `#ncToggle` button gone entirely.
- Footer `#reopenEntry` "↻ CHANGE WORLD" link in the bottom bar.
- Per-world hero ornament container `.hero-ornament` holding four `.orn` SVGs (`orn-arr/nc/ow/gf`), only active world's shown.

**Typography changes**
- Font link adds **Cinzel (500/700/900)**, **Cormorant SC (500/700)**, **Cormorant Garamond (ital)**, **IM Fell English (SC + italic)**. Old World uses IM Fell/Cormorant serif stack; Grim Future uses Cinzel; Arrakis/Night City keep Anton+Inter+JetBrains Mono. Mochiy Pop One still loaded, still unused.

**Token / layout changes vs old README**
- `--section-pad-x` default tightened: `clamp(28px, 6vw, 100px)` → `clamp(20px, 5vw, 56px)`.
- `--content-max` reduced: `1280px` → `1080px`.
- `.bio-body` reservation changed from `min-height: 8lh` → `min-height: 204px` (absolute units — see Learnings #14). **Current build still has old `8lh`.**
- `localStorage` key stays `danimemes.state.v2`; `theme` enum widens to 4 values; `accent` becomes theme-namespaced (per-theme accent sets).

**Copy revisions** (owner re-tuned — preserve in rebuild)
- Accordion row /01 retitled **MECHANICAL KEYBOARDS → CAST IRON COOKERY** (per-world: KITCHEN STEEL / BLADE & POT / FIRE & BREAD).
- Bio headline tail changed from "ARGUE ABOUT KEYBOARDS" to "ARGUE ABOUT PASTA WATER SALINITY"; stat "STILLSUIT KIT / HHKB" became "KITCHEN KIT / CAST IRON / WOK".
- Meme gallery reduced from **4 tiles to 2** (001 DanGlas, 002 Cypher). FixedDan now the entry medallion; Cyber.gif dropped. **[DECISION LOCKED: 2 tiles]**
- Chat pitch copy rewritten to acknowledge the Dialogflow→"smarter oracle" swap, per world.

---

## 2. The two new themes

### Old World (`oldworld`, key `ow`)
- Tokens: `--ow-oxblood #1f1430` (bg, midnight violet), `--ow-vellum #c4bccc` (fg, moonstone), `--ow-iron #06030a` (deep panels), `--ow-gold #6e5a82` (cold silver-violet decoration), `--ow-blood #7a1626` (sparing accent).
- Mood: cruel courtesy, moonlight, kin-strife. Calm candle-flicker replaces glitch. Spice field hidden.
- Typography: IM Fell English SC / Cormorant stack on **content only** (headlines, body) — display fonts shrunk ~25-30% per Learnings #7 so wrap-count matches Anton. Italic serif headline with underline "crack."
- Accents: `oxblood | forest | iron | royal` → write `--ow-oxblood` + `--ow-vellum`.

### Grim Future (`grimfuture`, key `gf`)
- Tokens: `--gf-void #0a0608` (bg), `--gf-brass #c89a3a` (fg, gold), `--gf-bone #efe4cc` (ivory light), `--gf-ember #b81628` (cardinal accent), `--gf-blood #5a0a12` (shadow).
- Mood: faith, fire, battle-litany. Glitch becomes ember-red drop-shadow variant.
- Typography: Cinzel engraved caps. Gold cartouche tint on portrait, pitch-black hero, gold serif caps.
- Accents: `brass | ember | bone | void` → write `--gf-brass` + `--gf-void` (note `bone` inverts to cardinal-on-ivory).

### How the theme mechanism must extend (vs current 2-theme model)
Current build uses `body.arrakis` / `body.night-city`, a single `#ncToggle` flipping between two, copy via `data-arr`/`data-nc` only, `applyTheme` hardcoded to two classes. The 4-way model requires:

- **Body class**: exactly one of `arrakis | night-city | oldworld | grimfuture`, set by toggling all four (`ALL_THEME_CLASSES.forEach(toggle)`), not a binary flip.
- **Data attributes**: every copy element gains `data-ow` / `data-gf` siblings (and `-html` / `-text` / `-placeholder` variants). `applyCopy` keys off `THEME_KEY = {arrakis:'arr', 'night-city':'nc', oldworld:'ow', grimfuture:'gf'}` and reads `data-<key>...`.
- **Toggle UI**: `#ncToggle` button **replaced** by `.world-picker` (four tablist buttons). Direct selection, not a cycle — clicking jumps straight to that world. (Tweaks WORLD segmented control gains all four buttons too.)
- **Persisted state shape**: same `localStorage danimemes.state.v2` object, but `theme` widens to 4 values and `accent` is per-theme. On every world switch, `accent` resets to `DEFAULT_ACCENT_FOR_THEME[next]` so a stale accent never writes to an OW/GF variable. `applyAccent` must branch on which keys an accent defines (`crimson/cream` vs `owOxblood/owVellum` vs `gfBrass/gfVoid`).
- **New session flag**: `sessionStorage danimemes.entered.v2` gates entry screen.
- **Per-world-only visuals must hide outside their world**: spice field, glitch, three non-active ornaments (Learnings #8).

---

## 3. Key takeaways from STYLING_LEARNINGS.md

New doc adds items 7-21. Load-bearing ones:

- **#7 Cross-font reflow**: serif/Cinzel render *wider*, so same string wraps to more lines, doubling `bio-headline`/`chat-pitch h2` height and shifting stat-grid ~275px. Fix = per-theme `font-size` shrink (OW/GF ~25-30% smaller display) **plus** min-height reservations.
- **#14 (supersedes old #4)**: `min-height` reservations **must be absolute px or pinned to largest variant's clamp**, never `em`/`lh` — those shrink with smaller per-theme font. `bio-body` is now `204px`, not `8lh`. **Direct correction the current build has not adopted.**
- **#13 Nav chrome fonts must be identical across themes** — apply theme serif fonts only to in-flow content, never to `.brand`/`.world-picker`/nav links, or nav jerks horizontally on switch.
- **#11 `background: currentColor` + `color:` on same element = invisible** — world-picker `.active` state must set explicit bg+fg per theme/section, never `currentColor`.
- **#12 No `::before`/`::after content` text on `<button>`** — world-picker uses real `.lbl-full`/`.lbl-short` spans toggled by media query.
- **#9 Scroll-anchor is theme-count-agnostic** — keep `findScrollAnchor`/`restoreScrollAnchor`; bigger font-metric deltas between worlds make it *more* important.
- **#16 Entry overlay** = `sessionStorage` (not localStorage), `display:none` only *after* fade, `void offsetWidth` reflow on reopen, `z-index:9999`.
- **#17/#18/#19/#20/#21** govern entry screen: `:has()` for hover-card→medallion symbol; grid-level `:hover` for sibling-dim peek-in; `:nth-of-type` (not `:nth-child`) for card borders because the absolutely-positioned medallion still counts in `:nth-child`; tall-pill medallion with `object-fit: contain` for transparent FixedDan cutout; symbol overlaid on blurred face.
- **#15 Audit playbook**: after any copy/font change, loop all four themes measuring `getBoundingClientRect().height`; any drift >2px needs a reservation or font shrink.

---

## 4. Gap analysis vs current build (`H:\Claude\danimemes-bot\`)

### Already correct / aligned
- `LS_KEY = 'danimemes.state.v2'` already matches new state key.
- `injectCartouches`, `initNav` (hide/show + section color flip), `initParallax`, `initAccordion`, `initTweaks`, density/glitch logic, `findScrollAnchor`/`restoreScrollAnchor` all present and structurally identical to prototype — carry over with minimal change.
- All Arrakis + Night City `data-arr`/`data-nc` copy and section structure present.
- Assets in `image/` (DanGlas, Cypher, FixedDan, Cyber.gif) plus extras (mp4, mp3, custom fonts).
- Chat **section markup** (`#chat`, `.chat-window`, `#chatLog`, `#chatInput`, `#chatSend`, chips) already matches prototype's chat shell.

### Must be added
- Entry screen markup + all entry CSS (medallion, cards, peek-in, `:has()`, spice field).
- `.world-picker` markup + CSS; **remove** `#ncToggle` and its `initNCToggle()` handler (replace with `initWorldPicker` + `initEntryScreen`).
- `data-ow` / `data-gf` attributes on every copy element (hero, about, skills, memes, chat, footer, parallax words).
- Hero `.hero-ornament` with four `.orn` SVGs (currently single inline `.worm-ring`).
- Font link: add Cinzel / Cormorant SC / Cormorant Garamond / IM Fell English.
- Full OW + GF CSS theme blocks (~1100 lines new CSS — prototype 2243 lines vs current 1155): section bg/fg overrides, font overrides, ornament show/hide, candle-flicker (OW) and ember glitch (GF), cartouche tints, per-theme display font-size shrinks.
- JS: widen `accents`, add `THEME_ORDER/THEME_LABELS/THEME_KEY/ALL_THEME_CLASSES`, `DEFAULT_ACCENT_FOR_THEME`, `ACCENTS_FOR_THEME`; rewrite `applyTheme`/`applyAccent`/`applyCopy` for 4 worlds; add `initWorldPicker` + `initEntryScreen`.
- Tweaks panel: OW/GF palette rows (`data-tweak-show`), four-button WORLD seg, `data-tweak-show` visibility wiring.

### Must be changed
- `.bio-body` CSS `min-height: 8lh` → `204px` (Learnings #14).
- Meme gallery → **2 tiles** (DECISION LOCKED). DanGlas 001, Cypher 002. FixedDan → entry medallion, Cyber.gif dropped from gallery.
- `applyTheme` two-class flip → four-class toggle.

### 🚩 CRITICAL RISK — Dialogflow shadow-DOM chat mirror
**The prototype `index.js` does NOT contain the Dialogflow integration.** Its `initChat` uses `window.claude.complete` with canned fallbacks (prototype lines 280-385). The current build's `initChat` (lines 217-668) is an entirely different, hand-built **shadow-DOM mirror** of a hidden `df-messenger`: `hideDfMessengerChrome`, `ensureDfChatOpen`, `getDfInput`/`getDfMessageList` (traverse `df-messenger → df-messenger-chat → df-message-list → div.df-message-list`), `extractBotText`, `startSendPoll` polling + `MutationObserver` with `_seenBotNodes`, and `scheduleDfHide` in `boot()`. The `<df-messenger>` element and bootstrap `<script>` live in current `index.html`.

If a rebuild naively copies the prototype's `index.js`, **the entire Dialogflow integration is destroyed.** Guardrails:
- Ignore prototype's `initChat`, `SYSTEM`, `CANNED`, and `window.claude.complete` call. Keep current build's `initChat` and all `df-*` helpers verbatim.
- Keep `<df-messenger>` and bootstrap `<script>` in `<head>` of `index.html`.
- Keep `scheduleDfHide()` in `boot()`.
- Chat is **not** world-aware in current build (Dialogflow agent is fixed). Prototype's per-world chat copy (titlebar name, status, placeholder, chips, pitch) is *display* copy and can still swap via `data-*` — but bot's actual voice/system prompt does **not** switch. Do not attempt to wire per-world system prompts into Dialogflow.

---

## 5. Staged implementation plan (for frontend-developer)

**Guardrails for EVERY stage:**
- **Do not touch** `initChat`, the `df-*` helper functions, `scheduleDfHide`, the `<df-messenger>` element, or the bootstrap `<script>`. Chat mirror stays byte-for-byte.
- Keep `findScrollAnchor`/`restoreScrollAnchor` and call around every world switch.
- Keep all borders at `--hair: 1px`.
- Keep accordion CSS-grid `0fr→1fr` trick and `+`-rotates-to-`×`.
- Keep parallax `data-parallax-speed` + `prefers-reduced-motion` guard.
- After each stage, run Learnings #15 height-drift audit across all 4 worlds.

**Stage 0 — Snapshot & branch.** Create a feature branch off `master`. Meme decision = 2 tiles (locked).

**Stage 1 — Fonts & tokens** (`index.html` head + `styles.css` `:root`). Add Cinzel/Cormorant/IM Fell font link. Add `--ow-*` and `--gf-*` token blocks. Change `--content-max` to `1080px` and `--section-pad-x` default to `clamp(20px,5vw,56px)`. Fix `.bio-body` to `min-height: 204px`. No behavior change; verify Arrakis/NC still pixel-match.

**Stage 2 — Copy attributes** (`index.html`). Add `data-ow`/`data-gf` (+ `-html`/`-text`/`-placeholder`) to every element that has `data-arr`/`data-nc`: parallax words, hero kicker/headline/sub/CTAs/scroll-cue, about meta/label/bio-headline/bio-body/all 6 stats, skills file/blurb/acc-titles/acc /02 body, meme file/label/captions, chat file/pitch/chips/titlebar/status/placeholder/send, footer label/bar. Use prototype's exact strings. Apply revised Arrakis/NC copy (cast iron, pasta water, etc.). No JS change yet.

**Stage 3 — 4-way theme engine** (`index.js` + Tweaks markup).
- Add `THEME_ORDER`, `THEME_LABELS`, `THEME_KEY`, `ALL_THEME_CLASSES`, expanded `accents`, `DEFAULT_ACCENT_FOR_THEME`, `ACCENTS_FOR_THEME`.
- Rewrite `applyTheme` (4-class toggle + paint world-picker active states), `applyCopy` (key-driven), `applyAccent` (branch on key presence).
- Replace `#ncToggle` markup with `.world-picker` (four buttons, `.lbl-full`/`.lbl-short`); delete `initNCToggle`, add `initWorldPicker` (with scroll-anchor) and register in `boot()`.
- Expand Tweaks: four-button WORLD seg, OW/GF palette rows with `data-tweak-show`, `paintTweaks` helper.
- **Do not remove** `scheduleDfHide()` from `boot()`.

**Stage 4 — OW + GF visual CSS** (`styles.css`). Port prototype's `body.oldworld` / `body.grimfuture` blocks: section bg/fg overrides, theme serif fonts on **content only** (#13), per-theme display `font-size` shrinks (#7), absolute min-height reservations (#14), ornament show/hide (#8), spice-field hidden in OW/GF, candle-flicker (OW) / ember glitch (GF) variants, cartouche tints, world-picker `.active` explicit bg+fg per theme (#11). Meme = 2 tiles.

**Stage 5 — Hero ornament** (`index.html` + CSS). Replace single `.worm-ring` with `.hero-ornament` containing four `.orn` SVGs; CSS shows only active world's glyph.

**Stage 6 — Entry screen** (`index.html` + CSS + `index.js`). Add `#entryScreen` markup (medallion w/ FixedDan + four ornament SVGs, four `.entry-card`s with idle/peek layers, Arrakis spice field, foot bar). Port entry CSS (`:has()` medallion swap #17, grid-`:hover` peek-in #18, `:nth-of-type` borders #19, tall-pill medallion `object-fit: contain` #20, face-overlay #21). Add `initEntryScreen` (sessionStorage gating, card-click sets theme+accent+saves, SKIP, Esc, `#reopenEntry` footer link) and register in `boot()`. Add `#reopenEntry` link to footer bottom bar.

**Stage 7 — Audit & verify.** Run #15 drift loop across all four worlds; resolve any >2px drift. Manually verify: world switch preserves scroll position; **chat still sends to Dialogflow and mirrors replies (test a live message)**; accordion single-open; parallax under reduced-motion; 1px hairlines at zoom; entry screen shows once per session and reopens from footer; no horizontal nav jerk on switch (#13).

---

## Relevant files (absolute paths)

**New handoff (read-only reference):**
- `C:\Users\Mask277\Downloads\danimemes2_extract\design_handoff_danimemes\README.md`
- `C:\Users\Mask277\Downloads\danimemes2_extract\design_handoff_danimemes\design-reference\STYLING_LEARNINGS.md`
- `...\design-reference\index.html` / `styles.css` / `index.js`
- `...\screenshots\` — arrakis-*, nightcity-*, grimfuture-*, oldworld-* (01-hero … 05-chat)

**Current build to modify:**
- `H:\Claude\danimemes-bot\index.html`
- `H:\Claude\danimemes-bot\styles.css`
- `H:\Claude\danimemes-bot\index.js`

**Chat code to preserve UNTOUCHED:**
- `H:\Claude\danimemes-bot\index.js` lines ~217-668 (the `df-*` helpers + `initChat`)
- `index.html` bootstrap `<script>` (head) and the `<df-messenger>` element
