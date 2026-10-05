# Consolatio

*A Reformed pastoral companion for the care of souls.*

Consolatio is a small, private, mobile-first web app for bringing what is on your heart between Sundays. It holds a conversation in the idiom of the historic Reformed and Lutheran church — formed by Scripture, shaped by the confessions, animated by the grace of Jesus Christ — and it is honest about what it is and is not.

> *Soli Deo gloria.*

---

## What it is

A single-page React app that talks to an LLM through **OpenRouter**, plus two optional integrations:

| Integration | What it adds |
|---|---|
| **OpenRouter** | Required. Every conversation. Any model they offer. |
| **ESV Bible API** | Optional. Detects references in the AI's replies and renders the actual ESV text inline. |
| **Tavily** | Optional. Searches a fixed list of Reformed and evangelical sites for sermons, articles, and books. |

The pastoral voice is not hardcoded into a string of ad-hoc instructions. It is distilled from [`SOUL.md`](./SOUL.md) — a full system prompt covering the theological commitments (Westminster, Heidelberg, Luther's Small Catechism), the tone, how to handle grief and despair, how to use Scripture, and what the app explicitly is not.

## Features

- **Six-step onboarding** — name, church background, current season, recurring struggles, language, confession. Every answer feeds into the system prompt, so the AI knows who it is talking to.
- **Session check-in** — pick a topic (grief, doubt, anxiety, sin, depression, vocation, joy, prayer…) and a weight (*Light* / *Carrying something* / *Heavy*). Both go into the prompt as context.
- **Any model on OpenRouter** — the live catalogue is fetched at startup and grouped by provider, with search and star-bookmarks. Ten curated defaults cover you if the fetch fails.
- **Inline Scripture** — references in the AI's replies are pulled as real ESV text cards, dismissible per card.
- **Reformed Resources** — after your first reply, an optional Tavily search across Ligonier, Desiring God, TGC, 9Marks, Challies, Tabletalk, Crossway, Banner of Truth, WTS, RTS and others.
- **Session history** — sessions persist in `localStorage`, titled from your first message.
- **⚡ Compress** — when a conversation grows past roughly 6,000 tokens, replace the transcript with a summary (themes, Scripture surfaced, key insights, open threads). You will be asked to confirm first.
- **Crisis support notice** — if you check in on grief, depression, doubt, anxiety, or sin with a heavy weight, the app shows a small dismissible block with real helplines (Telefonseelsorge and 988). It will not pretend to be able to take an emergency call.
- **Dark and light themes**, live token readout, bilingual conversation (English / Deutsch), installable as a PWA on iOS and Android.

## Tech stack

- React 18 + Vite 5
- No CSS framework — inline `style` objects and one injected stylesheet, with ~40 theme tokens in one object
- No backend. The browser talks to OpenRouter, ESV, and Tavily directly
- Fonts: IM Fell English and Lato

## Getting started

Requires Node 18+.

```bash
git clone https://github.com/nautilusmare/consolatio.git
cd consolatio
npm install
npm run dev
```

Then open http://localhost:5173.

> **Note on `npm install`:** `sharp` is a devDependency used only by `generate-icons.mjs`, and it has no prebuilt binary for every platform. If it fails to compile and you do not need to regenerate icons, install with `npm install --ignore-scripts` — the app itself does not use `sharp` at runtime. The committed PNG icons are already generated.

### First run without a key

You can click all the way through the app before configuring anything. With no OpenRouter key, Consolatio runs in **preview mode** and answers with a canned excerpt of Heidelberg Catechism Q&A 1 instead of calling a model.

## API keys

All keys are entered at runtime in **Settings → API Keys** and stored in your browser's `localStorage`. There are **no environment variables** — nothing to put in a `.env` file, and no secret to commit.

| Key | Where to get it | Needed? |
|---|---|---|
| OpenRouter | https://openrouter.ai/keys | **Yes**, for conversations |
| ESV | https://api.esv.org/ | No, for inline Scripture |
| Tavily | https://app.tavily.com/ | No, for resource search |

The model defaults to `anthropic/claude-sonnet-4-5` and can be changed from the pill above the transcript or in **Settings → AI**.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `node generate-icons.mjs` | Regenerate PNG icons from `public/icons/icon.svg` (needs `sharp`) |

There is no test suite, linter, or typechecker configured.

## Deploying

`npm run build` outputs a fully static `dist/`. Serve it from any static host.

- **Netlify** — `public/_redirects` already contains `/* /index.html 200`, so client-side routing works out of the box.
- **Vercel / Cloudflare Pages / GitHub Pages** — add an equivalent SPA rewrite.
- **PWA** — `public/manifest.json` declares a standalone, portrait app with 180/192/512 icons. Serve over HTTPS and the browser will offer installation. There is no service worker, so there is no offline caching; add one if you need it.

## Project structure

```
consolatio/
├── index.html              # App shell, font links, PWA meta, safe-area insets
├── vite.config.js          # React plugin, dist output, __APP_VERSION__ injection
├── generate-icons.mjs      # One-shot SVG -> PNG icon generator (sharp)
├── SOUL.md                 # The pastoral system prompt, in full
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── _redirects          # Netlify SPA fallback
│   └── icons/              # icon.svg + generated PNGs
└── src/
    ├── main.jsx            # React root
    └── App.jsx             # Everything else: UI, prompts, API calls, storage
```

## Where your data lives

Everything is in `localStorage` on your own device. Nothing is sent to a Consolatio server, because there isn't one. The keys are stored **unencrypted**.

| Key | Contents |
|---|---|
| `consolatio_key` | OpenRouter API key |
| `consolatio_esv` | ESV API key |
| `consolatio_tavily` | Tavily API key |
| `consolatio_model` | Selected model id |
| `consolatio_dark` | Theme |
| `consolatio_onboarded` | Whether onboarding is done |
| `consolatio_profile` | Your onboarding answers |
| `consolatio_bookmarks` | Bookmarked model ids |
| `consolatio_sessions` | All conversation history |

### Privacy and security, plainly

The OpenRouter key is sent from your browser straight to `openrouter.ai`, and it sits unencrypted in `localStorage`. Anyone with devtools access to your machine — or any malicious script that manages to run on the page — can read it. That is an acceptable trade for a personal, single-user app you run on your own phone. It is **not** an acceptable pattern for a hosted service shared by other people, where you'd want a server-side proxy and per-user secret handling. If you deploy this publicly, treat the key handling as work to be done.

**Settings → App → Clear all sessions** deletes conversation history. It does not delete your API keys or profile.

## A pastoral note, and a limit

Consolatio is a supplement. It is not a church, not a pastor, not a therapist, and not the preached Word. It cannot baptize, administer the Lord's Supper, or know your situation. Where it matters most — real crisis — it is not a substitute for a human being: 988 in the US, Telefonseelsorge at 0800 111 0 111 or 0800 111 0 222 (free, anonymous, 24/7), and your own pastor.

## Known limitations

Honest list of what this does not do yet:

- **No streaming.** Replies arrive all at once after a loading indicator, not token by token.
- **No markdown rendering.** Messages are plain text, so any `**bold**` from the model shows as literal asterisks.
- **Full transcript resent each turn.** No server-side history or context windowing. Long conversations need ⚡ Compress or a larger-context model.
- **UI language is English.** Choosing Deutsch changes how the model writes, not the app's interface.
- **Overlays have no focus trap.** They close on Escape and on tap-outside, and carry `role="dialog"`, but keyboard focus is not cycled inside them.
- **The book icon is a placeholder.** It toggles a hard-coded Romans 8:38–39 rather than fetching anything.
- **The whole app is one component.** ~19 props are drilled into `SettingsPage`. It works; it is not maintainable at size.
- **No tests, no linter, no CI.**

## Contributing

Pull requests welcome. Please keep the pastoral voice intact — if you change the AI's instructions, update [`SOUL.md`](./SOUL.md) alongside the code so the prompt in the repository stays the source of truth.

## License

No license file yet. All rights reserved until one is added — please ask before reusing this.