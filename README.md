# Vitals Ledger

A private, offline-first health record: vitals, workouts, and medical history
(allergies, medications, conditions, surgeries, family history) in one place.
Everything is stored **only in your browser's local storage** — no account,
no server, no sync. There's also a one-tap "doctor summary" you can print or
save as a PDF before an appointment.

It's a PWA (Progressive Web App), so it installs like a normal app on Android
and works fully offline once loaded. It also runs as a regular web app in any
browser (desktop, iPhone, etc.).

## Run it in a GitHub Codespace

1. Push this folder to a new GitHub repo (or open this folder as a repo).
2. On the repo page, click **Code → Codespaces → Create codespace on main**.
3. Once the codespace loads, in the terminal run:
   ```bash
   npm install
   npm run dev
   ```
4. Codespaces will prompt you to open the forwarded port in a browser — open it.
   That's the app, live-reloading as you edit files.

### Project layout
```
index.html        entry HTML shell
src/main.js        app logic — tabs, rendering, event handlers
src/storage.js      local-storage data layer (the only place data is read/written)
src/style.css       design system (ledger paper + clinical-chart look)
public/icons/       app icons used for install/home-screen
vite.config.js      build + PWA (offline caching, installability) config
```

Everything is plain HTML/CSS/JS — no framework — so it's easy to extend.
`storage.js` is the one file to change if you want to swap local storage for
something else later (e.g. IndexedDB, or an optional sync backend).

## Installing on an Android phone

**Option A — plain PWA install (fastest, no build needed):**
1. Run `npm run build` then `npm run preview -- --host` in the Codespace,
   or deploy the `dist/` folder to any static host (GitHub Pages, Netlify,
   Vercel, Cloudflare Pages — all have free tiers).
2. Open the deployed URL in Chrome on the Android phone.
3. Tap the browser menu → **Install app** (or you'll see an automatic
   "Add to Home screen" prompt). It now behaves like a native app icon and
   works offline.

**Option B — real installable APK (for the Play Store or sideloading):**
Use [PWABuilder](https://www.pwabuilder.com) — paste your deployed URL in,
and it packages the PWA into a signed Android APK/AAB automatically, using
the manifest and service worker already configured in this project. No
native Android code needed.

## Using it on other devices

Since it's a standard web app, the same deployed URL works in Safari on
iPhone/iPad (add to home screen from the Share menu) and in any desktop
browser — no separate build required.

## Data & privacy

- All data is read/written only via `src/storage.js`, straight to
  `localStorage` on the device. There is no network call anywhere in the
  app for reading or writing your data.
- **Export JSON backup** (in the Summary tab) lets you save a copy of
  everything, e.g. before switching phones — and **Import backup** restores it.
- **Erase all data** permanently wipes local storage on that device.

## Next steps you might want help with
- Swapping `localStorage` for `IndexedDB` if your data grows large.
- Adding charts for weight/HR/VO2 trends over time.
- An optional, user-controlled end-to-end-encrypted sync between your own devices.
