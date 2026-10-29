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
- `dist/free-audit.css`, `dist/free-audit.js`: Free Digital Audit section and validated WhatsApp handoff.
- `dist/proof-comparison.js`: audit Before/After values and interactions.
- `dist/owner-story.js`: scroll position, scene copy and desktop video loading.
- `dist/story-frames.js`: mobile/iPhone scroll animation.
- `dist/motion/scroll-frames/`: 60 JPEG sheets used by the mobile animation.

After changing the animation, keep the desktop video and mobile frame sheets in sync. Bump asset/script URL versions when replacing files to refresh browser caches.

Once the final custom domain is chosen, add a canonical URL for it to `dist/index.html`. The export omits the old Sites canonical URL so it can be deployed under a new domain.

Future pushes to the connected production branch can trigger Vercel deployments.

## Analytics

Tracking is configured in `dist/analytics.js` and loaded once by `dist/index.html`.

- Google Tag Manager container: `GTM-KVN7J89R`. It loads on the production-host allowlist below; use the container to configure TikTok tags.
- Direct GA4 loading and event delivery are disabled. The previous GA4 Measurement ID (`G-QG2PF4R7XE`) is not configured in this code. If GA4 should remain off, do not add or leave an active GA4 tag in the GTM container.
- Microsoft Clarity Project ID: `z0k8cdui58`.
- Meta dataset/Pixel ID: `2555957918204878`.
- GTM, Clarity and Meta Pixel are enabled on `digital-presence.toruslabs.my` and the existing `torus-virtual-human-partner.josiahsoh.chatgpt.site` publication. Localhost and Vercel preview URLs are excluded. Add a new production hostname to the allowlist if the domain changes.
- The site pushes fixed-label custom events into GTM's `dataLayer` and Clarity. These events are available for GTM triggers, but are not sent directly to GA4.

### Custom events

| GTM `dataLayer` event | Meaning / event parameters |
| --- | --- |
| `section_view` | A section has been meaningfully visible for at least one second. `section_id`: `problem` (hero), `presence` (services), `results`, `audit` (Free Digital Audit), `pricing`. Once per section per page load. |
| `hero_stage_view` | A drawn animation stage has been visible for at least half a second. `stage_name`: `customer_search`, `business_missing`, `owner_workload`, `seo_aeo_geo`, `take_care_of_this`. Rapid jumps do not backfill skipped stages. |
| `whatsapp_click` | WhatsApp intent, not a confirmed sent message or sale. `button_name`: `pricing_subscribe`, `contact`, `mobile_sticky`, `free_digital_audit`, `new_website_enquiry`. `billing_option`: selected annual/monthly mode for the plan CTA, otherwise `not_selected`. |
| `billing_option_click` | `billing_option`: annual or monthly. |
| `audit_snapshot_click` | `snapshot`: before or after. |
| `navigation_click` | `section_id`: destination; `button_name`: journey guide or back to top. |
| `story_fallback_click` | Visitor selects the static story after an animation load error. |
| `scroll_depth` | Whole-page scroll milestones at 25, 50, 75, 90 and 100 percent. `scroll_percent`: milestone reached. |

Clarity receives corresponding API events such as `view_pricing`, `hero_seo_aeo_geo`, `whatsapp_pricing_subscribe`, `billing_monthly`, `audit_before` and `scroll_75`. These help filter recordings. Clarity's heatmaps and recordings collect automatically, but the inside of the canvas animation is not replayed; use the hero-stage events for its progression.

Custom events use fixed UI labels; they do not include enquiry text, WhatsApp URLs, visitor names or phone numbers. Clarity's default content masking remains enabled. The installation does not override consent settings or send a synthetic consent grant. If adding a consent manager, connect the actual visitor choices to Clarity's consentv2 API and any tags configured in GTM.


### Meta Pixel

The browser Pixel is connected to dataset/Pixel ID `2555957918204878`. It uses the same production-host allowlist as GTM and Clarity, loads asynchronously, and sends events only to this dataset:

- `PageView`: once per page load.
- `WhatsAppClick` (custom event): when a pricing Subscribe, contact, mobile sticky, free audit request or new-website enquiry button is used. Parameters: `button_name`, `section_id`, `billing_option`. It does not send a completed `Lead` or `Purchase` event.

No Conversions API, advanced matching identifiers or server access token are included. No event sends the WhatsApp URL, prefilled enquiry text, names or phone numbers. The site does not assert visitor consent on their behalf.

After the GitHub push and Vercel deployment, open Meta Events Manager > this dataset > Test events. Visit `https://digital-presence.toruslabs.my/` using the test option, then click a WhatsApp button. Look for `PageView` and `WhatsAppClick`. Make sure the intended Instagram ad account has access to this dataset. Account connections, custom conversions and ad campaign settings are managed in Meta, not changed by this code installation. Live receipt of events was not checked, as requested.

### Deployment and verification

Commit and push the updated files to the GitHub branch connected to Vercel. GTM and tracking on the custom domain start only after that deployment. Use GTM Preview/Tag Assistant to verify the container and configured TikTok tags, and check Clarity and Meta Events Manager after a production visit. Browser consent, blockers and account settings can affect collection. Live collection was not checked.

## Free Digital Audit and WhatsApp messages

The Free Digital Audit section is fourth (`#audit`), before pricing. Its heading has no number badge. The form validates an existing website and opens WhatsApp to `60175693237` with a Free Digital Audit request and the website origin. It does not run an automated audit or send a message automatically. The entered website is masked in Clarity and is not included in custom analytics parameters.

Each action keeps its own message:

- **Free audit:** “Hi Torus, I’d like to request a Free Digital Audit for my website: [website]”
- **No website yet / Talk to us:** “Hi Torus, I need a new website for my business. Could you tell me more about your packages?”
- **Subscribe now:** a subscription request for Digital Presence Management, including the selected RM649/month annual option (billed monthly, 12-month contract) or RM749/month monthly option (cancel anytime).
- **General contact / mobile WhatsApp:** “Hi Torus, I’d like help with my website and digital presence. I want to know more.”

The audit request is tracked only after validation. The new-website link is tracked separately from the other enquiry buttons. Tracking records click intent, not a completed enquiry or sale.
