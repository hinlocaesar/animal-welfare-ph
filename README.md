# Paws & Hearts PH 🐾

A curated, hand-verified static directory of places in the Philippines where you can
volunteer to help animals — shelters, rescues, wildlife and marine conservation programs,
farm sanctuaries, and spay/neuter drives across **Luzon, Visayas and Mindanao**.

No framework. No build step. No backend. No database.

---

## Open it

Just double-click **`index.html`**. It works straight from the file system (`file://`).

There is no server, no install, and no `npm install`. The listing data is loaded with a
plain `<script>` tag precisely so that `fetch()` is never needed — `fetch()` of a local
JSON file is blocked by browsers on `file://`.

```
index.html
├── css/styles.css
├── js/app.js            ← rendering, filtering, URL sync, detail dialog
├── js/motion.js         ← animation layer (progressive enhancement)
├── js/vendor/           ← GSAP, ScrollTrigger and Lenis, vendored locally
├── img/                 ← organization photos (local, see Photos)
├── data/organizations.js   ← loaded by <script> (window.ORGANIZATIONS)
├── data/organizations.json ← identical copy, for reference/tooling
├── data/SOURCES.md         ← every source used to verify a listing
├── favicon.svg
└── README.md
```

---

## Deploy

### GitHub Pages

1. Push this repository to GitHub.
2. Open the repo on GitHub → **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   **Branch** to `main`, folder to `/ (root)`, then **Save**.
4. Wait ~1 minute. The site appears at
   `https://<your-username>.github.io/<repo-name>/`.

Nothing needs to be built — GitHub Pages serves the files exactly as they are.

### Netlify

- Drag and drop this folder onto <https://app.netlify.com/drop>, **or**
- Connect the repo and leave the build command empty and the publish directory as `/`.

### Any other static host

Upload the folder as-is. Every path in the project is relative
(`css/styles.css`, `data/organizations.js`, …), so it works from a subdirectory too.

---

## How to add a new organization

**Step 1 — verify it first.** Find the organization's official website or official
Facebook page. Confirm it exists and is active. If you cannot find a primary source,
do not add it. Never invent a name, URL, email address or phone number.

**Step 2 — open `data/organizations.json`** and append an object to the array:

```json
{
  "id": "my-organization-slug",
  "name": "My Organization",
  "category": "dogs-cats",
  "animals": ["dogs", "cats"],
  "region": "Visayas",
  "city": "Cebu City",
  "province": "Cebu",
  "description": "Two or three sentences describing what the organization does, written in your own words.",
  "volunteer_activities": ["dog walking", "feeding", "clinic assistance"],
  "how_to_join": "How someone actually signs up, based on what the organization says.",
  "requirements": "What they require of volunteers, or null if it is not published.",
  "website": "https://example.org/",
  "facebook": "https://www.facebook.com/example",
  "email": null,
  "source_url": "https://example.org/about",
  "last_verified": "2026-09-30",
  "photo": {
    "thumb": "img/my-organization-slug.jpg",
    "large": "img/my-organization-slug-lg.jpg",
    "width": 960,
    "height": 540,
    "credit_url": "https://www.facebook.com/example",
    "credit_label": "Official Facebook page"
  }
}
```

`photo` is optional — use `null` when the organization has no image you can legitimately
use, and the row falls back to its category icon.

**Field rules**

| Field | Allowed values |
| --- | --- |
| `id` | kebab-case slug, **unique** across the file |
| `category` | `dogs-cats`, `wildlife`, `marine`, `farm`, `drives`, `mixed` |
| `region` | `Luzon`, `Visayas`, `Mindanao` |
| `animals` | short lowercase labels, e.g. `dogs`, `cats`, `sea turtles`, `Philippine eagle` |
| `email` | a real address, or `null` — never a guessed one |
| `website` / `facebook` | a real `https://` URL, or `""` if unknown |
| `source_url` | **required** — the URL where you verified the entry |
| `last_verified` | `YYYY-MM-DD` |
| `photo` | an object with `thumb`, `large`, `width`, `height`, `credit_url`, `credit_label` — or `null` |

Unknown fields should be `null` (email) or `""` (other strings) rather than fabricated.
Any field that is not a usable `https://` link is simply not rendered as a button by the UI.

**Step 3 — copy the exact same object into `data/organizations.js`** so the array in
`window.ORGANIZATIONS` matches. Keep the two files identical:

```js
window.ORGANIZATIONS = [
  // …existing entries…
  { "id": "my-organization-slug", "name": "My Organization", /* … */ }
];
```

**Step 4 — add the source** to `data/SOURCES.md`, and set `last_verified` to today.

**Step 5 — check it.** Open `index.html`, confirm the row appears, the filters find it,
and the detail dialog opens.

> Ordering, counts, the hero statistics, the "animals" dropdown, and the footer
> "last updated" date are all derived automatically from the data — there is nothing
> else to update.

---

## Photos

Every listing that shows a photo uses an **official image from that organization's own
Facebook page or website** — profile photos, cover photos, or the site's `og:image`.
They were downloaded once, resized, and are served from `img/` so nothing is hotlinked:

| File | Size | Used for |
| --- | --- | --- |
| `img/<id>.jpg` | 400 × 400 square | directory entry thumbnail |
| `img/<id>-lg.jpg` | max 1200 px wide | detail dialog, hero, tips strip |
| `img/photos.json` | — | machine-readable index of what came from where |

**Attribution.** Each photo is credited where it appears (dialog caption, tips strip,
about panel) and links back to the page it came from. Photos remain © their owners and
can be removed on request — delete the two files for that `id`, set `"photo": null` in
`data/organizations.json` + `data/organizations.js`, and the UI falls back to the SVG
category icon with no other change.

**Replacing a photo:** drop a better image over `img/<id>.jpg` / `img/<id>-lg.jpg` and
update `width`/`height` in the entry. Keep `width` and `height` accurate — they prevent
layout shift while the image loads.

**One listing has no photo:** `moalboal-animal-welfare-organization` has neither a
Facebook page nor a website, so there was no official image to source.

---

## Design notes

The site is designed as a **warm, cinematic night page with a playful streak**: a full-bleed
photograph of real volunteers behind the headline, a pile of tilted photo cards with tape
strips, a scrolling ticker of regions and animals, and colour-coded dots on every listing.

- **Palette** — warm charcoal (`#121110`), cream text (`#F7F2E8`), one gold accent
  (`#FFC24D`) for headings, links, buttons and the scroll rail, with coral, mint, sky and
  lilac used *only* as category codes (dogs & cats, farm, marine, wildlife, drives).
  Everything is a CSS custom property under `:root` in `css/styles.css`, and every
  text/background pair was tuned for WCAG AA — Lighthouse accessibility scores **100**.
- **Typography** — [Fraunces](https://fonts.google.com/specimen/Fraunces) as a variable font
  with its `SOFT` and `WONK` axes enabled, so display headings carry a slightly wonky,
  friendly personality and italic accent words (`animals`, `responsibly`) turn gold;
  [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) for body text and
  [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for labels, counts and
  captions, loaded from Google Fonts with system fallbacks so the site still renders offline.
- **Layout** — full-height hero with a copy/photo-stack split, a masked ticker band, then the
  43 listings as numbered rows (01–43) with hairline rules, thumbnails and colour-coded tags
  rather than a grid of identical cards. A two-column responsible-volunteering list, a plate
  strip of photographs, an about panel and a colophon footer follow.
- **Photography and illustrations** — every icon and the favicon are inline SVG (gold paw on
  a charcoal tile). The only raster assets are the organization photos in `img/` (see
  **Photos** above), stored locally, so the site makes **no external image requests**.
- **Motion** — scroll-linked and playful rather than decorative: a word-by-word headline
  reveal, slow hero parallax, a pointer tilt on the photo pile, staggered section reveals,
  counting statistics, the ticker, and a polaroid that trails the cursor while you hover the
  index. Everything lives in `js/motion.js` and is skipped entirely under
  `prefers-reduced-motion: reduce`.
- **Accessibility** — semantic landmarks, a skip link, visible focus rings, labelled form
  controls, `aria-live` result counts, a native `<dialog>` with focus handling, and full
  keyboard operation.

## Libraries

There is still no build step: three small animation libraries are **vendored** under
`js/vendor/` and loaded with plain `<script>` tags, so the page works from `file://` and
offline forever, with no CDN dependency.

| File | Project | Licence |
| --- | --- | --- |
| `js/vendor/gsap.min.js` | [GSAP](https://gsap.com/) | GreenSock standard licence (free for this use) |
| `js/vendor/ScrollTrigger.min.js` | [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | GreenSock standard licence |
| `js/vendor/lenis.min.js` | [Lenis](https://darkroom.engineering/lenis/) | MIT |

`js/motion.js` checks for all three before touching anything: if a file is missing, the
animation code never runs and the page renders as a complete, static document. To upgrade,
drop a newer build over the same filename.

## Features

- Search box plus **region**, **organization type** and **animal** filters.
- Live result count and a friendly empty state with a reset button.
- Filter state is written to the **URL hash** (`#q=turtle&region=Visayas`) so a filtered
  view can be shared or bookmarked — including from `file://`, where `history.replaceState`
  with a query string is blocked.
- Native `<dialog>` detail view per organization with description, activities,
  requirements and contact links.

---

## Data & disclaimer

Listing data was gathered from public web sources and recorded in
[`data/SOURCES.md`](data/SOURCES.md). This is an independent directory, is not affiliated
with or endorsed by any organization listed, and **makes no claim that an opportunity is
currently open** — programs pause, pages move, and requirements change.

**Always confirm details directly with the organization** before you travel, donate or
commit your time.
