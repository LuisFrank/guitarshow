# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at localhost:4200
npm run build      # production build to dist/guitarshow
npm test           # run unit tests (Karma + Jasmine + Chrome)
npm run watch      # watch mode build (development config)
```

Generate new component:
```bash
ng generate component components/<name>
```

## Architecture

Angular 12 SPA with **no client-side routing** — `AppRoutingModule` has an empty routes array. All sections are composed sequentially in `AppComponent` template.

`AppComponent` uses `ViewEncapsulation.None`, so its styles cascade globally to all child components.

### Core guitar features

**Fretboard visualizer** (`src/app/components/social-feed/`)  
Built imperatively using `Renderer2` — creates 6 strings × 20 frets as DOM nodes, not Angular template syntax. Each `.note-fret` element carries `data-note` and `data-chroma` attributes. Uses the `tonal` v2 library (`Scale.notes()`, `Note.chroma()`) to highlight scale notes by toggling `note-show` / `note-show-root` / `note-hide` CSS classes. Sets CSS custom properties (`--notepacity`, `--number-of-strings`) on `:root` via `Renderer2.setProperty`.

**Chord progression panel** (`src/app/components/our-products/`)  
Subscribes to `SocialFeedService` to receive the selected root note + scale name. Uses `@tonaljs/tonal` `Progression.fromRomanNumerals()` to convert the roman-numeral data from `src/app/mocks/progressions.ts` into actual chord names. The 7 modes (Ionian→Locrian) with their diatonic roman numerals live in that mock file.

**Metronome** (`src/app/metronome/`)  
Uses a custom `Timer` class from `src/assets/js/timer.js` loaded as a **global script** (not an ES module). Accessed via `declare var Timer: any`. The timer corrects for drift each tick. BPM range: 20–260. Audio via `src/assets/audio/click1.mp3` (downbeat) and `click2.mp3` (beat).

### Communication pattern

`SocialFeedService` (`src/app/components/social-feed/social-feed.service.ts`) is the single state bridge:
- `SocialFeedComponent` calls `changeCurrentNote()` / `changeCurrentScaleName()` when user selects a root/scale on the fretboard
- `OurProductsComponent` subscribes to `currentNote` / `currentScaleName` observables to recompute progressions

### Global scripts (angular.json)

Loaded in order before app code:
1. `ml5.js` — machine learning (CREPE pitch detection; models in `src/assets/crepe_models*/`)
2. `p5.js` + `p5.sound.js` — creative coding / audio
3. `src/assets/js/timer.js` — metronome timer

These are globals; components access them with `declare var <name>: any`.

### Styling

- `src/vars.scss` — CSS custom properties for typography (IM Fell English for titles, Overpass for body)
- `src/styles.scss` — global styles
- Bootstrap 5 loaded as a CSS file (not ng-bootstrap)
- FontAwesome via `@fortawesome/angular-fontawesome`
- Component SCSS files use the global variables directly since encapsulation is disabled on root

### Mock data (`src/app/mocks/`)

All data is static:
- `progressions.ts` — 7 modes with diatonic roman numeral chords
- `products.ts`, `featured.ts`, `chefs.ts` — landing page section content
