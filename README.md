# Torus Virtual landing page

This repository contains the complete static website: HTML, CSS, client-side JavaScript, images, the desktop story video, and the mobile scroll animation frames.

## Deploy with Vercel

1. Import this GitHub repository into a Vercel project.
2. Use the repository root as the Root Directory.
3. The included `vercel.json` selects the Other framework preset, skips the build, and serves `dist/`.
4. Deploy, then add the chosen hostname under Project Settings > Domains.
5. Add the DNS records supplied by Vercel through the domain's DNS provider.

No environment variables, server, database, or dependency installation are required to serve this website. Google Fonts loads from Google's CDN; WhatsApp links open the business enquiry chat.

## Local preview

From the repository root:

```sh
python3 -m http.server 8765 --directory dist
```

Open `http://localhost:8765`.

## Editing

- `dist/index.html`: page content and layout.
- `dist/styles.css`, `dist/solution-team.css`, `dist/owner-story.css`: site styles.
- `dist/responsive-layout.css`: equal mobile and tablet page gutters.
- `dist/pricing-palette.css`: offer colours and WhatsApp button spacing.
- `dist/proof-comparison.js`: audit Before/After values and interactions.
- `dist/owner-story.js`: scroll position, scene copy and desktop video loading.
- `dist/story-frames.js`: mobile/iPhone scroll animation.
- `dist/motion/scroll-frames/`: 60 JPEG sheets used by the mobile animation.

After changing the animation, keep the desktop video and mobile frame sheets in sync. Bump asset/script URL versions when replacing files to refresh browser caches.

Once the final custom domain is chosen, add a canonical URL for it to `dist/index.html`. The export omits the old Sites canonical URL so it can be deployed under a new domain.

Future pushes to the connected production branch can trigger Vercel deployments.
