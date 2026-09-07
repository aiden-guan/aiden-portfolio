# Aiden Guan — the meadow

An interactive portfolio that turns project browsing into a small 3D pixel
meadow. Explore the field, drag to look around, uncover buried projects, and
open their live or source links.

[Open the live portfolio](https://aiden-portfolio-rouge.vercel.app)

## What you can find

- A real-time Three.js meadow with pixelation, sky, rain, grass, and project
  relics.
- Hover and drag exploration, with buried work revealed as you move through the
  scene.
- An accessible HUD with discovery progress and a “Show all” list for a direct
  path to every project.
- Inspect panels for project descriptions, source repositories, the founder
  profile, email, and LinkedIn.
- Reduced-motion handling that disables camera damping and scene motion when the
  user's system preference requests it.

## Getting started

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then use the mouse or
trackpad to look around the meadow. Project copy and outbound links are defined
in `lib/content.ts`.

## Verify the repository

```bash
npm run lint
npm run build
```

The project currently has no automated test script. The live link above is the
portfolio homepage configured on GitHub; deployment behavior is not asserted by
the local checks in this repository.

## How it works

```text
app/page.tsx
  -> discovery state, HUD state, and inspect interactions
  -> client-only MeadowCanvas
       -> MeadowScene and Three.js primitives
       -> buried relics, founder, mailbox, camera controls
  -> DialogueBox for project and contact details
```

The page keeps the portfolio content in one typed data module and separates the
scene from the overlay UI. The canvas is loaded client-side because WebGL is a
browser concern; the loading state gives the page a graceful entry while the
scene initializes. The “Show all” control and semantic buttons provide a direct
alternative to finding every object by exploration.

## Built with

- Next.js 16 and React 19 for the application shell.
- TypeScript for content and component contracts.
- Three.js, React Three Fiber, and Drei for the interactive scene.
- Tailwind CSS and custom CSS for the HUD, typography, and responsive layout.
- `next/font` with Fraunces and Tiny5 for the visual identity.

## Project map

- `app/` — Next.js layout, page, and global styles.
- `components/scene/` — meadow, camera, weather, pixelation, and relics.
- `components/hud/` — project discovery controls and inspect dialogue.
- `lib/content.ts` — founder copy, project records, and outbound links.
- `lib/use-reduced-motion.ts` — system motion-preference hook.

## Status and limits

This is a personal portfolio site and interactive presentation piece. Project
content is currently static and compiled into the app; this repository has no
backend, database, or authentication layer. It does not include a bundled
screenshot or automated test suite, and there is currently no license file.
