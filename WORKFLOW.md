# WORKFLOW.md — 4-World Redesign Orchestration Spec

> **Workflow owner:** `workflow-orchestrator` (this spec). **Executor:** main Claude thread dispatches agents per stage; it cannot be skipped or reordered.
> **Source of truth for scope:** `H:\Claude\danimemes-bot\REDESIGN-PLAN-v2.md` (section 5 = stages, section 4 = critical risk).
> **Branch:** `feature/4-world-redesign` (Stage 0 already committed — baseline snapshot exists).
> **No build step.** Verification = git diff/grep + `claude-in-chrome` visual/live checks by the main thread.

---

## 0. Roles & dispatch rules

| Agent | Owns | Files it may touch |
|-------|------|--------------------|
| `javascript-pro` | ALL `index.js` work | `H:\Claude\danimemes-bot\index.js` |
| `frontend-developer` | markup + CSS | `H:\Claude\danimemes-bot\index.html`, `H:\Claude\danimemes-bot\styles.css` |
| main thread (`claude-in-chrome`) | every gate's visual + live verification, all git commits/rollbacks | (no source edits) |

Dispatch brief template (always include): **project path** `H:\Claude\danimemes-bot\`, **exact files**, **the stage's scope from REDESIGN-PLAN-v2.md §5**, and **the verbatim Dialogflow guardrail (§3 below)**.

Stages 1, 2, 4, 5 → `frontend-developer` only.
Stage 3 → `javascript-pro` (JS) + `frontend-developer` (Tweaks/world-picker markup) — JS lands first, then markup.
Stage 6 → `frontend-developer` (markup + CSS) then `javascript-pro` (`initEntryScreen`).
Stage 7 → main thread audit (no agent edits unless a drift fix is found, then route the fix to the owning agent).

---

## 1. Stage state machine

Each stage moves through:

```
pending ──▶ in_progress ──▶ gate_check ──┬─▶ committed   (gate PASS → git commit on feature branch)
                                          └─▶ rolled_back (gate FAIL → git restore, return to pending)
```

- A stage may enter `in_progress` only when the previous stage is `committed` (strict linear dependency — see order below).
- `gate_check` runs the **two mandatory checks every stage**: (A) the Dialogflow invariant (§3) and (B) the stage's own acceptance criteria (§4).
- `committed` = `git add -A && git commit` with the stage tag. The commit IS the rollback point for the next stage.
- `rolled_back` = `git restore .` (or `git checkout -- .`) discarding the working tree back to the last committed stage; the stage returns to `pending` and is re-dispatched with the failure noted in the brief.

### Dependency order (strict linear; no parallelism)

```
[0 done] ─▶ 1 fonts/tokens ─▶ 2 copy attrs ─▶ 3 theme engine ─▶ 4 OW/GF CSS ─▶ 5 hero ornament ─▶ 6 entry screen ─▶ 7 audit
```

Rationale for linearity: Stage 3's `applyCopy` reads the `data-ow`/`data-gf` attributes Stage 2 adds; Stage 4's CSS targets `body.oldworld`/`body.grimfuture` only set by Stage 3; Stage 6 entry cards call the theme engine from Stage 3. Files also overlap (`index.html` touched by 1,2,5,6; `styles.css` by 1,4,5,6), so concurrent edits would collide.

---

## 2. The HARD INVARIANT (transaction-critical) — Dialogflow shadow-DOM chat mirror

The following must survive **every** stage byte-for-byte. This is gate check (A) after every stage, run by the main thread.

**`index.js` — these 8 function signatures must be unchanged (baseline line refs in parens):**
- `function initChat()` (459)
- `function hideDfMessengerChrome()` (352)
- `function ensureDfChatOpen()` (406)
- `function getDfInput()` (272)
- `function getDfMessageList()` (297)
- `function extractBotText(dfMessageEl)` (446)
- `function startSendPoll()` (566, nested in initChat)
- `function scheduleDfHide()` (388) — and it MUST still be called inside `boot()` (baseline line ~803)

**`index.html` — must remain present and unmodified:**
- bootstrap `<script src="...messenger/bootstrap.js?v=1">` in `<head>` (line 14)
- the `<df-messenger ... agent-id="faea3bb6-8fff-429c-bed0-8013a4b52021" ...>` element (lines 517-524)

### Invariant gate command (run from `H:\Claude\danimemes-bot\`)

PowerShell — confirm NO df-* code changed vs the previous committed stage:

```powershell
# 1. The df-* region of index.js must be identical to last commit.
git diff HEAD -- index.js | Select-String -Pattern 'initChat|hideDfMessengerChrome|ensureDfChatOpen|getDfInput|getDfMessageList|extractBotText|startSendPoll|scheduleDfHide|df-message|_seenBotNodes|_hidePollCount'
#   EXPECTED: no output. ANY line = FAIL → rollback.

# 2. The 8 signatures + boot() call still exist exactly.
Select-String -Path index.js -Pattern 'function getDfInput\(\)','function getDfMessageList\(\)','function hideDfMessengerChrome\(\)','function scheduleDfHide\(\)','function ensureDfChatOpen\(\)','function extractBotText\(dfMessageEl\)','function initChat\(\)','function startSendPoll\(\)'
#   EXPECTED: 8 matches.
Select-String -Path index.js -Pattern 'scheduleDfHide\(\);'
#   EXPECTED: >=1 match (the boot() call).

# 3. df-messenger element + bootstrap untouched in index.html.
git diff HEAD -- index.html | Select-String -Pattern 'df-messenger|bootstrap.js|agent-id'
#   EXPECTED: no output (element/bootstrap lines unchanged). Additive markup elsewhere is fine.
Select-String -Path index.html -Pattern 'agent-id="faea3bb6-8fff-429c-bed0-8013a4b52021"','messenger/bootstrap.js'
#   EXPECTED: both present.
```

Gate (A) PASSES only if: check 1 empty, check 2 = 8 matches + boot call present, check 3 empty + both present. Otherwise **rollback the stage**.

> Note on Stage 3/6: those stages legitimately edit `index.js`. Check 1's git-diff filter targets ONLY df-* tokens, so legitimate theme-engine/entry edits won't trip it — but any diff line containing a df-* token DOES trip it, which is exactly the intent. If a stage 3/6 edit must sit textually adjacent to a df-* line, the agent must keep df-* lines themselves untouched so check 1 stays empty.

---

## 3. Verbatim guardrail to paste into every agent brief

> Do NOT modify or remove `initChat`, `hideDfMessengerChrome`, `ensureDfChatOpen`, `getDfInput`, `getDfMessageList`, `extractBotText`, `startSendPoll`, or `scheduleDfHide` in `index.js`. Do NOT touch the `<df-messenger>` element or the Dialogflow bootstrap `<script>` in `index.html`. Do NOT remove the `scheduleDfHide()` call from `boot()`. Chat is NOT world-aware — per-world chat copy is display-only via `data-*`; never wire per-world prompts into Dialogflow. Also keep `findScrollAnchor`/`restoreScrollAnchor` (call around every world switch), `--hair: 1px` borders, the accordion `0fr→1fr` grid trick, and parallax `prefers-reduced-motion` guard.

---

## 4. Per-stage spec

> **Common exit gate for stages 1-6:** invariant gate (A) PASS **and** Learnings #15 height-drift loop run for all worlds available at that stage (drift <2px), unless the stage note says otherwise.

### Stage 1 — Fonts & tokens
- **Owner:** `frontend-developer`
- **Files:** `index.html` (`<head>`), `styles.css` (`:root`, `.bio-body`)
- **Entry:** Stage 0 committed; on `feature/4-world-redesign`.
- **Scope:** Add Cinzel/Cormorant SC/Cormorant Garamond/IM Fell English font link. Add `--ow-*` + `--gf-*` token blocks. `--content-max` → `1080px`. `--section-pad-x` default → `clamp(20px,5vw,56px)`. `.bio-body` `min-height: 8lh` → `204px`. No behavior change.
- **Exit/acceptance:** Arrakis + Night City render pixel-unchanged (Chrome visual check, hero/about/chat). No new body classes referenced. df-* invariant PASS.
- **Stage gate checks:** (A) invariant. (B) `Select-String styles.css -Pattern 'min-height:\s*204px'` present and `8lh` gone from `.bio-body`; `--content-max` = `1080px`; OW/GF token blocks present; font link includes `Cinzel` and `IM+Fell`. Chrome: Arrakis & NC visually identical to baseline screenshots.

### Stage 2 — Copy attributes
- **Owner:** `frontend-developer`
- **Files:** `index.html`
- **Entry:** Stage 1 committed.
- **Scope:** Add `data-ow`/`data-gf` (+ `-html`/`-text`/`-placeholder` variants) to every element that already has `data-arr`/`data-nc` (parallax words, hero, about meta/stats, skills, memes, chat copy, footer). Use prototype's exact strings; apply revised Arrakis/NC copy (CAST IRON COOKERY, "ARGUE ABOUT PASTA WATER SALINITY", KITCHEN KIT). No JS change.
- **Exit/acceptance:** Every `data-arr` element now also has `data-ow` and `data-gf`. df-messenger untouched. Page still renders Arrakis/NC unchanged (JS only reads arr/nc so far).
- **Stage gate checks:** (A) invariant. (B) count parity: `(Select-String index.html -Pattern 'data-arr').Count` ≈ `data-ow` count ≈ `data-gf` count (allowing for `-html`/`-text` variants); revised copy strings present. Chrome: Arrakis/NC unchanged.

### Stage 3 — 4-way theme engine
- **Owner:** `javascript-pro` (index.js) → then `frontend-developer` (world-picker + Tweaks markup)
- **Files:** `index.js`, `index.html` (nav `.world-picker` replacing `#ncToggle`, Tweaks panel)
- **Entry:** Stage 2 committed.
- **Scope:** Add `THEME_ORDER/THEME_LABELS/THEME_KEY/ALL_THEME_CLASSES`, expanded `accents`, `DEFAULT_ACCENT_FOR_THEME`, `ACCENTS_FOR_THEME`. Rewrite `applyTheme` (4-class toggle + paint world-picker active), `applyCopy` (key-driven off `THEME_KEY`), `applyAccent` (branch on key presence, reset accent on world switch). Replace `#ncToggle`+`initNCToggle` with `.world-picker` (four `.world-btn`, `.lbl-full`/`.lbl-short`) + `initWorldPicker` (wrap in scroll-anchor), register in `boot()`. Expand Tweaks: four-button WORLD seg, OW/GF palette rows (`data-tweak-show`), `paintTweaks`. **Keep `scheduleDfHide()` in `boot()`.**
- **Exit/acceptance:** Clicking each of 4 world buttons sets the correct `body.<class>` (exactly one), swaps copy, resets accent to that world's default; scroll position preserved across switch; no horizontal nav jerk (#13 — nav chrome fonts unchanged). df-* invariant PASS (theme edits must not touch df-* lines).
- **Stage gate checks:** (A) invariant — verify check 1 git-diff still empty for df-* tokens despite index.js edits. (B) `#ncToggle`/`initNCToggle` removed (`Select-String` → no match); `initWorldPicker` and `applyTheme`/`applyCopy`/`applyAccent` present; `scheduleDfHide();` still in boot. Chrome: all 4 buttons switch `body` class; accent never writes a stale var (no console errors). **Visual for OW/GF will be unstyled until Stage 4 — that is expected; gate only checks class/copy/state correctness here.**

### Stage 4 — OW + GF visual CSS
- **Owner:** `frontend-developer`
- **Files:** `styles.css`
- **Entry:** Stage 3 committed.
- **Scope:** Port `body.oldworld`/`body.grimfuture` blocks: section bg/fg, theme serif fonts on **content only** (#13 — never `.brand`/`.world-picker`/nav), per-theme display `font-size` shrinks (#7), absolute min-height reservations (#14), ornament show/hide (#8), spice-field hidden OW/GF, candle-flicker (OW)/ember glitch (GF), cartouche tints, world-picker `.active` explicit bg+fg per theme/section (#11, never `currentColor`). Meme gallery = 2 tiles.
- **Exit/acceptance:** **All 4 worlds render** correctly (Chrome visual: hero/about/skills/memes/chat for each). Height-drift loop across all 4 <2px (#15). Nav doesn't jerk on switch. Meme section shows exactly 2 tiles.
- **Stage gate checks:** (A) invariant. (B) Chrome: switch through all 4 worlds, capture each — OW = midnight violet + serif, GF = gold-on-black Cinzel, no `currentColor` invisible text on active picker, spice field hidden in OW/GF. Run #15 drift loop now (first stage all 4 are styled).

### Stage 5 — Hero ornament
- **Owner:** `frontend-developer`
- **Files:** `index.html` (hero), `styles.css`
- **Entry:** Stage 4 committed.
- **Scope:** Replace single `.worm-ring` with `.hero-ornament` holding four `.orn` SVGs (`orn-arr/nc/ow/gf`); CSS shows only the active world's glyph.
- **Exit/acceptance:** Each world's hero shows its own ornament, the other three hidden. df-* untouched.
- **Stage gate checks:** (A) invariant. (B) `.hero-ornament` + four `.orn` present; old `.worm-ring` removed. Chrome: switch worlds, only active ornament visible. #15 drift loop (hero) <2px.

### Stage 6 — Entry screen
- **Owner:** `frontend-developer` (markup + CSS) → then `javascript-pro` (`initEntryScreen`)
- **Files:** `index.html`, `styles.css`, `index.js`
- **Entry:** Stage 5 committed.
- **Scope:** Add `#entryScreen` (medallion with FixedDan + four ornament SVGs, four `.entry-card`s idle/peek layers, Arrakis `.card-spice-field`, foot bar). Port entry CSS: `:has()` medallion swap (#17), grid-level `:hover` peek-in (#18), `:nth-of-type` card borders (#19), tall-pill medallion `object-fit: contain` (#20), face overlay (#21), `z-index:9999`, fade-then-`display:none`, `void offsetWidth` reflow on reopen (#16). Add `initEntryScreen` (sessionStorage `danimemes.entered.v2` gating, card-click → set theme+accent+save, SKIP, Esc, `#reopenEntry`), register in `boot()`. Add `#reopenEntry` "↻ CHANGE WORLD" link to footer bottom bar. **Keep `scheduleDfHide()` in `boot()`.**
- **Exit/acceptance:** Entry screen shows once per session (fresh session → shown; reload same session → hidden). Card click enters that world. `#reopenEntry` reopens it; Esc/SKIP dismiss. df-* invariant PASS.
- **Stage gate checks:** (A) invariant — index.js edits must not touch df-* lines; `scheduleDfHide();` still in boot. (B) Chrome: clear sessionStorage → entry shows; pick a card → correct world; reload → entry hidden; click footer `#reopenEntry` → entry reopens (verify `void offsetWidth` reflow makes fade replay). `sessionStorage` key is `danimemes.entered.v2` (NOT localStorage).

### Stage 7 — Audit & verify (no scope edits unless a fix is found)
- **Owner:** main thread (route any fix to the owning agent, then re-gate that fix).
- **Files:** none by default.
- **Entry:** Stage 6 committed.
- **Scope / full audit checklist:**
  1. **#15 height-drift loop across all 4 worlds** — measure `getBoundingClientRect().height` of hero/bio/stat-grid/chat-pitch per world; **drift must be <2px**; any larger → add reservation or font shrink (route to `frontend-developer`).
  2. **LIVE Dialogflow test** — type a real message in `#chatInput`, send, confirm a bot reply mirrors into `#chatLog` (proves the shadow-DOM mirror still works end-to-end). This is the ultimate invariant proof.
  3. World switch preserves scroll position (all worlds).
  4. Accordion single-open; `+`→`×` rotate.
  5. Parallax disabled under `prefers-reduced-motion`.
  6. 1px hairlines crisp at zoom.
  7. Entry screen: once/session + footer reopen.
  8. No horizontal nav jerk on switch (#13).
- **Stage gate checks:** (A) invariant. (B) all 8 audit items pass; live chat round-trip succeeds. On PASS → final commit. Workflow complete.

---

## 5. Rollback procedure (per stage, git-based)

Every stage's committed point is its own snapshot on `feature/4-world-redesign`. From `H:\Claude\danimemes-bot\`:

- **Gate FAIL, discard working changes (most common):**
  ```powershell
  git restore .            # or: git checkout -- .
  git status               # confirm clean tree == last committed stage
  ```
  Stage returns to `pending`; re-dispatch the owning agent with the failure noted.

- **Bad commit already made (gate slipped through):**
  ```powershell
  git reset --hard HEAD~1  # drop the bad stage commit; tree returns to prior stage
  ```

- **Selective revert (only one file went wrong):**
  ```powershell
  git checkout HEAD~1 -- index.js   # restore just index.js from the previous stage
  ```

- **Commit convention** (so HEAD~N maps to stages): tag each commit `stageN: <name>` e.g. `git commit -m "stage4: OW+GF visual CSS"`. Then HEAD always = last good stage, HEAD~1 = the rollback target.

> The df-* invariant gate (§2 check 1) uses `git diff HEAD`, so it compares the working tree to the **last committed stage** — meaning a failed stage is caught before it ever becomes a commit.

---

## 6. Main-thread per-stage checklist (tick through)

For stage N:

- [ ] Previous stage is `committed` (tree clean, `git log` shows `stage{N-1}`).
- [ ] Dispatch owning agent(s) with: path, files, §5 scope for stage N, verbatim §3 guardrail.
- [ ] Agent reports done → stage = `gate_check`.
- [ ] **Gate (A) — Dialogflow invariant:** run §2 PowerShell block. df-diff empty? 8 signatures present? `scheduleDfHide();` in boot? df-messenger + bootstrap intact?  → if any NO: `git restore .`, mark `rolled_back`, re-dispatch.
- [ ] **Gate (B) — stage acceptance:** run the stage's specific checks (§4) + Chrome visual/live check.
- [ ] #15 height-drift loop (stages 4-7; <2px).
- [ ] Both gates PASS → `git add -A && git commit -m "stageN: <name>"` → stage = `committed`.
- [ ] Proceed to stage N+1.

**Final (after Stage 7 commit):** all 7 stages `committed` on `feature/4-world-redesign`; 4 worlds render; entry screen once/session + reopen; live Dialogflow send/reply confirmed; height drift <2px across all worlds. Workflow done.
