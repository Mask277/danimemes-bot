# Fifth Realm easter egg — work-in-progress notes

A hidden "fifth realm" portal in `danimemes-bot` that links to the D&D web app
`https://github.com/Echan-277-s-org/dnd-claude`. Built/iterated interactively;
**nothing is committed yet** — all changes live in the working tree.

Last verified working in Chrome on the local server (Night City glitch slices
rendering on the headline). Resume from here.

---

## What it does

- **Trigger:** on the first-load **entry screen**, click the centre DANIEL
  medallion **7 times rapidly** (each click within 600 ms of the last; a longer
  gap resets the count). A scale-pulse on the portrait gives feedback from
  click 2 onward.
- **Payoff:** a full-screen portal overlay (`#fifthRealmPortal`, `z-index:10000`)
  sweeps in, themed to whichever of the 4 worlds is active, with a
  **CROSS OVER →** button linking to the dnd-claude repo (`target="_blank"`).
- Close via the × button, the Escape key, or clicking the backdrop.

## Effects on the portal (all theme-aware via `var(--bg)`/`var(--fg)`)

- **Headline glitch** on "THE FIFTH REALM" — this is the active area of work.
- 3 concentric **rune rings** (`.frp-rune-ring--outer/mid/inner`) rotating.
- 12 drifting **motes** (`.frp-motes i`).
- Pulsing **d20 halo** (`.frp-d20-halo`).
- **CRT scanlines** (`.frp-panel::after`).
- **Iris** scale-in reveal + one-shot **shimmer sweep** + panel glow box-shadow.
- The old swirling **vortex was removed** (replaced by the panel/headline glitch).

---

## The headline glitch (current technique)

Target: the `<h2 class="frp-headline frp-glitch-text" data-text="THE FIFTH&#10;REALM">`
in `index.html`. The `data-text` carries a newline (`&#10;`) so the pseudo-clones
break into two lines like the visible `<br>` (pseudos use `white-space: pre`).

Technique = the **second** CodePen the user supplied (CSS-variable-driven
`clip-path: polygon` slice glitch + `scaleX` wobble), NOT the first
(chrisunderdown KzEEJQ clip-rect) one, which was replaced.

Keyframes (in `styles.css`): `frp-glitch-p` (scaleX wobble, 11s on the headline),
`frp-glitch-a` (3.1s, on `::after`), `frp-glitch-b` (1.7s, on `::before`). They
step the custom props `--top` / `--left` / `--v-height`, which feed
`clip-path: polygon(...)`, `transform: translateX(calc(var(--left)*100%))`, and a
two-layer chromatic `text-shadow`. (Unregistered custom props animate discretely
in Chrome — that stepping IS the glitch.)

### Per-world accent channels (kept from the earlier request)

The two text-shadow channels use `--frp-ch1` / `--frp-ch2`, set per world. The
demo's literal `lime` / `#ff00e1` were intentionally **replaced** with these:

| World        | `--frp-ch1`        | `--frp-ch2`        |
|--------------|--------------------|--------------------|
| Arrakis      | `var(--crimson)` (#c8541a, spice orange) | `#1f4e7a` (Fremen blue) |
| Night City   | `var(--nc-cyan)` (#00E6F6) | `var(--nc-pink)` (#e0287d) |
| Old World    | `#7a3aa0` (dark-elf violet) | `#3f9fb0` (moonlit teal) |
| Grim Future  | `var(--gf-brass)` (gold) | `var(--gf-ember)` (cardinal) |

---

## Open questions / decisions to revisit

1. **Per-world accents vs the demo's lime/magenta** — I kept per-world accents
   (the user asked for that one turn earlier). If they actually want the literal
   `lime` + `#ff00e1`, just swap the two `text-shadow` colors back.
2. **Font** — the supplied snippet imported **Bungee Shade**; I kept the site's
   **Anton** headline font for cohesion. Switch the `.frp-headline` font-family if
   the Bungee Shade look is wanted.
3. **"Glitch should apply to the fifth realm panel"** — currently applied to the
   *THE FIFTH REALM headline text* (the panel's centrepiece). If they meant the
   whole panel/all copy, that needs a different approach (the technique is
   inherently text + `data-text`).
4. Not committed to git yet.

---

## Files & key locations

- `index.html`
  - Stylesheet link: `styles.css?v=5` (line ~11). **Bump the `?v=` each time
    `styles.css` changes** — it has no other cache-busting and the browser will
    otherwise serve stale CSS. (`index.js` is `index.js?v=3`.)
  - Portal markup: `#fifthRealmPortal` (~line 250+). Headline at ~line 308.
- `styles.css`
  - Easter-egg/portal section is near the **end** of the file
    (search `EASTER EGG — FIFTH REALM PORTAL`).
  - Headline glitch rules: search `.frp-glitch-text`.
  - Glitch keyframes: `@keyframes frp-glitch-p` / `-a` / `-b`.
  - Per-world channel vars: `body.<world> .frp-glitch-text { --frp-ch1/--frp-ch2 }`.
  - `prefers-reduced-motion` block disables all of it and hides the glitch clones.
- `index.js`
  - `initEasterEgg()` (~line 1027), called from `boot()`. Click counter targets
    `.entry-medallion`; pulse feedback on `.med-frame`.
  - Entry-screen Escape handler defers to the portal when it's open (~line 990).

## How to test

- A local static server is running at `http://localhost:8777/index.html`.
- Open it, then click the medallion 7× fast.
- **Cache gotcha:** a plain reload may serve cached `styles.css`. Either bump
  `?v=` in `index.html`, or load `index.html?cb=<n>` to force a fresh fetch of
  the HTML (which then pulls the current `?v=` CSS).
- To inspect a glitch frame in a still screenshot, seek the Web Animations:
  `document.getAnimations().forEach(a=>{ if(a.animationName==='frp-glitch-a'){a.pause();a.currentTime=3100*0.8;} ... })`.
