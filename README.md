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
├── js/app.js
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
  "last_verified": "2026-09-30"
}
```

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

**Step 5 — check it.** Open `index.html`, confirm the card appears, the filters find it,
and the detail dialog opens.

> Ordering, counts, the hero statistics, the "animals" dropdown, and the footer
> "last updated" date are all derived automatically from the data — there is nothing
> else to update.

---

## Design notes

- **Palette** — warm cream background, deep teal, coral and sunny yellow accents, all
  defined as CSS custom properties in `css/styles.css` under `:root`, and tuned to meet
  WCAG AA contrast.
- **Typography** — [Fredoka](https://fonts.google.com/specimen/Fredoka) for display and
  [Nunito](https://fonts.google.com/specimen/Nunito) for body, loaded from Google Fonts
  with full system-font fallbacks so the site still renders offline.
- **Illustrations** — every icon, the paw-print favicon, and the dividers are inline SVG.
  There are **no external images** anywhere.
- **Motion** — card hover lift, a wagging brand mark, a bouncing paw, and a walking paw
  divider. All of it is disabled under `prefers-reduced-motion: reduce`.
- **Accessibility** — semantic landmarks, a skip link, visible focus rings, labelled
  form controls, `aria-live` result counts, a native `<dialog>` with focus handling,
  and full keyboard operation.

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
