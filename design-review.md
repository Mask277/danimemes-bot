Design Audit — unifiersofjapan.framer.website
Below is the implementable spec, captured from computed styles and direct page inspection. Viewport tested: 1039 × 915. Total document height: ~7900 px (collapsed) / ~9235 px (with an accordion expanded). The layout is a single-column, full-bleed canvas (no fixed grid container — sections span the full 1039 px page width). All major sections butt directly against one another (margin: 0, padding: 0 on the outer section wrapper); rhythm is created by internal padding inside each section.

1. Layout & structure
The page is a vertically stacked sequence of full-bleed, alternating-background sections. There are no margins between sections — colors and decorative motifs do the separating.
Page wrapper

Full-bleed: each top-level section is 1039 px wide (the viewport / page width). Internal content is typically constrained to roughly 930–990 px (the recurring inner-content widths I measured: 943 px for accordion rows, 935 px for stat blocks, 906 px for the map content, 966 px for image-card rows). Treat the design's content max-width as ~960 px centered with ~40 px gutters.

Section-by-section (top → bottom):

Hero — section "1" (top: 0, height: 1280 px, bg #e40038 crimson)
Contains: top nav (overlay), Japanese kanji subtitle 織田信長, giant masked headline "ODA NOBUNAGA" (broken by the samurai illustration foreground), full-bleed samurai SVG illustration, "01 / 05" page counter (cream, F37 Blanka, 15 px). Single-column, vertically centered.
Profile / Crest — section "2" (top: 1280, height: 1049 px, bg #faf3e9 cream)
Contains: [ CREST OF THE ODA CLAN ] small label, large crimson crest illustration (~332 px tall), then a vertical stack of label/value stat pairs (POSITION / TIMELINE / CAPITAL / CONTROL / POWER / LEGACY). Single centered column, content width ~935 px. Each stat block is ~83 px tall, spaced ~25 px vertically.
Bio card — section "3" (top: 2329, height: 810 px, bg #faf3e9)
Contains: small sakura/cloud crest motif, large uppercase paragraph headline in crimson ("ODA NOBUNAGA IS KNOWN AS THE FIRST GREAT UNIFIER…"), and a body paragraph below. Wrapped in a single decorative cartouche/ornamental SVG frame (concave rounded inner corners, crimson hairline outline). Frame width 1039 px (full bleed) with inner content padded ~50 px.
Territory Map — section "Map" (top: 3139, height: 650 px, bg #e40038)
Two-column composition on desktop: left = stylized prefecture map of Japan with city labels (KYOTO, OSAKA, NAGOYA, AICHI, etc.), right = a cream cartouche card (same decorative frame as section 3) containing an uppercase H4 title and body text. The right card is ~470 px wide, vertically centered.
Strategy / Battle / Innovation — section "4" (top: 3789, height: 1534 px, bg #faf3e9)
Multiple sub-blocks:

Massive display word (STRATEGY, BATTLE, INNOVATION, EXPLORE) rendered as a scroll-triggered marquee/parallax band in Anton 181 px–248 px crimson, partially clipped by the section edges.
Section title + body paragraph in crimson, centered, max-width ~520 px.
2-column × 2-row grid of square image tiles (~410 px square each, ~30 px gap). Each tile wrapped in the same cartouche frame with concave corners and a hairline crimson outline.


Pivotal Moments + Timeline accordion — section "5" (top: 5323, height: 2505 px collapsed, bg #faf3e9)

Section header: small uppercase "PIVOTAL" + a giant Anton word "MOMENTS" (~248 px) + a 3-line subhead body, all centered.
Accordion list: 5 rows, each row = year (38 px PP Nikkei) + battle title (36 px PP Nikkei) + "+" icon on the right. Row height 80 px, hairline crimson divider between rows. Inner content width 943 px.
Expanded row: row background flips to crimson #e40038, "+" rotates to "—", and a body block reveals beneath with a 2-column layout: left text column (~280 px), right historical image (~590 × 590 px, no border, no radius, no shadow).


CTA + Footer block (top: ~7800)

2 image tiles (Nobunaga & Hideyoshi illustrations) in cartouche frames.
"VISIT US" label + giant link WWW.TOFUDESIGN.CO, centered.
Thin divider (1 px crimson rule).
"MORE FROM US" small label + three large social links (INSTA · BEHANCE · DRIBBBLE), centered horizontally with ~40 px spacing.
"TOFU DESIGN © 2024" copyright bar at the very bottom.



Vertical rhythm between major sections: 0 px (sections butt together). Internal section padding-top/padding-bottom is roughly 120–160 px on the cream sections and 80–120 px on the red sections, but it isn't a fixed token — it's hand-tuned per section.
Sticky nav: Yes, there's a fixed-position nav (position: fixed; top: 0; left: 0; width: 100vw; height: 82px) that auto-hides on scroll-down and reveals on scroll-up. It also adapts its color to the section behind it (cream-on-crimson over red sections, crimson-on-cream over cream sections — the page contains both red-nav and light-nav variants).
Modular section markers: Yes — a small "01 / 05" pagination counter appears in the corners of certain sections (cream #faf3e9, F37 Blanka Bold, 15 px), reinforcing the modular structure.
Floating elements:

Bottom-left: circular "SITE OF THE MONTH ✦" Framer badge, fixed-position, ~84 × 84 px.
Bottom-right: "Made in Framer" pill (Framer's free-plan branding).


2. Color palette
Pulled from getComputedStyle across all visible elements:
TokenHexRGBWhere usedCrimson (primary accent)#e40038rgb(228, 0, 56)Red section backgrounds, all headings on cream sections, all body copy on cream sections, accordion hover/active fill, dividers, the crest illustrationCream (page bg)#faf3e9rgb(250, 243, 233)Default body background, alternating section backgrounds, all text on red sectionsCrimson (alt, near-duplicate)#e30037rgb(227, 0, 55)Appears on one nested element — visually identical to #e40038, treat as the sameOff-white variant#faf9f5rgb(250, 249, 245)One inner element; visually identical to the cream — treat as sameNear-black#201408rgb(32, 20, 8)A very dark warm brown used in some illustration fills (samurai hair, vase, etc.) — not body textPure black#000000rgb(0, 0, 0)Used in some SVG illustration fills only (not text)Pure white#ffffffrgb(255, 255, 255)Used in illustration highlights only
Practical usage rule: This is essentially a two-color system — #e40038 and #faf3e9 — that swap roles every section (foreground ↔ background). Black is reserved for illustration fills, never for text or UI.

3. Typography
Four typefaces are loaded:

PP Nikkei Pacific Ultrabold — primary display/UI typeface (uppercase, condensed-feel, sharp brutalist serif/sans hybrid).
Anton — secondary display, used for the giant scroll-headline words (ODA, STRATEGY, MOMENTS, EXPLORE).
F37 Blanka Trial — small label/metadata typeface. Two cuts in use:

F37 Blanka Trial Bold for small uppercase labels.
F37 Blanka Trial Medium for body paragraphs.


Mochiy Pop One — used exclusively for the Japanese kanji (織田信長).

All declared font-weight: 400 (the weight is baked into the font file name — these are display fonts, not weight-variable).
Type ramp (CSS-ready)
RoleSampleFontSizeLine-heightLetter-spacingColortext-transformMega display (scroll headlines)"STRATEGY"Anton248 px248 px-4.96 px#e40038uppercaseMega display (hero word)"ODA NOBUNAGA" lettersAnton181 px162.9 px-5.43 px#faf3e9uppercaseJapanese kanji織田信長Mochiy Pop One52 px42.64 px-1.04 px#faf3e9uppercaseH1 large"STRATEGY" inlineAnton248 px248 px-0.02em#e40038uppercaseSection H4 / paragraph headline"ODA NOBUNAGA IS KNOWN AS…"PP Nikkei Pacific Ultrabold36 px31.68 px-0.72 px#e40038 (or #faf3e9 on red)uppercaseStat headline / accordion title"ODA CLAN LEADER", "BATTLE OF OKEHAZAMA"PP Nikkei Pacific Ultrabold34 px31.96 px-0.68 px#e40038uppercaseAccordion year"1560"PP Nikkei Pacific Ultrabold38 px36.48 px-0.76 px#e40038uppercaseNav links"MENU / ABOUT / STUDIO"PP Nikkei Pacific Ultrabold32 px30.08 px-0.64 px#e40038 (or #faf3e9)uppercaseFooter social links"INSTA / BEHANCE / DRIBBBLE"PP Nikkei Pacific Ultrabold32 px30.08 px-0.64 px#e40038uppercaseStat label (small uppercase)"POSITION", "TIMELINE", "CAPITAL"PP Nikkei Pacific Ultrabold16 px18.24 pxnormal#e40038uppercaseMetadata / footer label"VISIT US", "[ CREST OF THE ODA CLAN ]", "01 / 05", "TOFU DESIGN © 2024", "WWW.TOFUDESIGN.CO"F37 Blanka Trial Bold15 px17.1 pxnormal#e40038 (or #faf3e9 on red)uppercaseBody paragraph"He is said to be a tall, thin…"F37 Blanka Trial Medium19 px25.84 px-0.57 px#e40038 (or #faf3e9 on red)none (mixed case)
Observations:

Almost everything is uppercase. The only mixed-case text on the entire page is the body-copy paragraphs in F37 Blanka Trial Medium.
Negative letter-spacing is applied systematically (~-0.02em on display, ~-0.03em on body) — gives the type its tight, brutalist feel.
Line-heights run tight (display: ~0.88×, body: ~1.36×).


4. Components
Navigation (top bar)

Container: position: fixed; top: 0; left: 0; width: 100%; height: 82px.
Background: none (transparent over hero) — visually picks up the underlying section color. There are two coordinated nav variants (red-nav shown on red sections with cream type, light-nav shown on cream sections with crimson type).
A 1 px hairline rule sits at the bottom edge of the nav (matching the type color: cream over red, crimson over cream).
3 items, evenly distributed horizontally with justify-content: space-between across the full width: MENU (no href) / ABOUT (./about) / STUDIO (https://www.tofudesign.co/).
Each link wrapper: padding: 8px 12px;, no background, no border, no border-radius. Type styling comes from the inner H5 (see table above).
Hover state: a single hairline underline appears below the hovered link (color matches the link color — crimson on cream, cream on red). No color change, no background change, no scale. The underline reveals instantly (no easing observable, ~0–80 ms).

Accordion rows (Pivotal Moments timeline)

Row dimensions: full width (1039 px), height 80 px, content width 943 px centered.
Default state: cream background #faf3e9, crimson text #e40038, "+" icon on the right (crimson, ~30 px), 1 px crimson hairline divider at bottom.
Hover state: entire row background fills with crimson #e40038, text and "+" icon flip to cream #faf3e9. No border-radius (the fill is a sharp rectangle that meets the dividers exactly). Transition feels ~150–200 ms, ease-out.
Expanded/active state: same crimson fill as hover; the "+" rotates 45° to become "—" (or is swapped for a minus SVG); the row expands downward to reveal a body block on a cream background containing: left column text (F37 Blanka Trial Medium, 19 px) and right-column historical image (no border, no shadow, no border-radius, sharp corners). Expansion transition ~300–400 ms.

Decorative image frame (the recurring cartouche)
Every illustrated image tile and the bio block share one decorative frame, drawn as an inline SVG (not CSS borders — it's <svg viewBox="0 0 292 286"><use href="#..."/></svg> so the same symbol is reused). Visually:

Rectangle with concave (inward-curved) rounded notches at each of the 4 corners, ~24 px notch radius.
Stroke: 1 px solid crimson #e40038.
Fill: transparent (the section background shows through).
No drop-shadow, no glow, no inner shadow — purely a flat outlined frame.
Inner content sits with ~20 px of padding from the SVG outline.

For CSS-only replication you can fake the concave-corner effect with a single SVG path overlay or with mask-image + radial gradients at the four corners. There is no border-radius value to copy — it's a custom path.
Buttons
Strictly speaking there are no traditional buttons on the page. The only button-like element is the floating "Made in Framer" pill (Framer's branding, not part of the design system) and the floating "SITE OF THE MONTH" circular badge.
All other interactive elements are text-links (nav items, social links, the "WWW.TOFUDESIGN.CO" wordmark) with text-only styling and an underline-on-hover affordance.
Text-link hover (e.g., WWW.TOFUDESIGN.CO, INSTA/BEHANCE/DRIBBBLE): I observed an underline-reveal on the nav links; I'd expect the same treatment on the footer links by design consistency but I couldn't 100% confirm a visual change on every individual footer link in my hover captures — flag this as not 100% verified, assume text-decoration: underline on hover with the same color as the text.
Dividers / rules

Hairline rules, 1 px solid #e40038 (crimson) on cream sections, 1 px solid #faf3e9 (cream) on red sections.
Used: under the nav, between accordion rows, separating the "VISIT US" block from the social block in the footer.
No dashed or dotted variants observed.

Decorative motifs (non-text graphics)

Stylized samurai portrait SVGs (hero + footer cards), flat 2–3 color illustration style.
The Oda clan crest (medallion icon ~330 px in section 2).
A small "rising sun + clouds" emblem (~80 px) above the bio block.
Tile illustrations (4-tile grid in section 5): each a flat geometric composition in crimson/cream/dark.
Map of Japan in section 4 (flat crimson silhouette with cream prefecture labels).
Scattered sakura (cherry blossom) petal motifs floating around the samurai figures.


5. Motion
Observed behaviors:

Sticky nav reveal/hide: auto-hides on scroll-down (translates -100px upward, hidden), reveals on scroll-up. Movement feels ~250 ms, ease-out. Color of the nav also flips to match the section it's overlaying (cream-on-red ↔ crimson-on-cream).
Giant scroll-headline parallax: the huge Anton words (STRATEGY, BATTLE, INNOVATION, MOMENTS, EXPLORE) appear partially clipped above/below the section edges and scroll at a slower rate than the surrounding content — classic vertical parallax. The amount of parallax felt moderate (~30–50% of the scroll delta).
Hero illustration entrance: on initial load the samurai illustration assembles/reveals; the kanji and giant English wordmark appear together. Duration feels ~600–800 ms total.
Accordion expand: ~300–400 ms ease-out for the height transition; "+" → "—" rotation/swap happens on the same beat; background fill transition ~150 ms.
Link hover underline: very fast, ~0–80 ms (feels instantaneous).
I did not observe any character-by-character text reveals, fade-in-on-view animations, marquee text loops, or hover scale transforms on images.

Exact CSS easing/durations are not exposed via getComputedStyle for Framer's JS-driven animations — values above are observational estimates. Flag these as approximate.

Things I could NOT determine with full confidence (please re-check or accept as approximations)

The Framer/JS-driven animation durations and easings (parallax, accordion, nav reveal). My values are timing-by-eye approximations.
The exact section internal padding values — sections butt together with margin/padding: 0 on the outer wrapper, and the spacing is created by inner-element offsets which vary section to section. The 120–160 px figure is a measurement off the screenshots, not a token.
Whether the footer social links (INSTA / BEHANCE / DRIBBBLE) and WWW.TOFUDESIGN.CO use the same underline-on-hover as the nav. Consistent with the design language but not 100% verified in my hover captures.
The cartouche frame's exact path metrics (notch radius, exact stroke width) — it's a custom SVG, so the "1 px crimson stroke, ~24 px concave notch" values are read off rendered output, not from a border-radius token.
PP Nikkei Pacific is a custom commercial font from Pangram Pangram; F37 Blanka is from F37 Foundry; both are licensed. Anton (Google Fonts) and Mochiy Pop One (Google Fonts) are free. Make sure you have the right licenses for the two commercial ones in production.