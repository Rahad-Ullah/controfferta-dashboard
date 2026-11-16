# Performance and SEO

The site is Controfferta Admin. The canonical origin is `https://admin.controfferta.it`. Use that as `metadataBase`. Do not use `https://controfferta.it`, The Cloud Salon, or any other product name.

This app is the private admin dashboard. Every route stays out of search indexes. The app must stay fast, light, and responsive. Read this before changing UI, data loading, or metadata.

One cache. Admin data changes per signed-in user (users, leads, credits, transactions, profile).

| Data | Cache | Where |
|---|---|---|
| Admin data that changes per user | SWR in the browser | Client components. See `docs/swr.md`. |

Do not cache admin or personal data with the Next.js fetch cache. Those requests stay on the client with SWR. Until an endpoint exists, read static data from `lib/placeholders.ts`.

## Keep the UI light

- Add `"use client"` only for a leaf that needs state, events, or SWR.
- Do not add a library for something CSS or a small component can do.
- Images use `next/image` with real `width` and `height` or `fill` plus `sizes`. Always set `alt`.
- Fonts load with `next/font` and `display: "swap"`. Do not add a second font loader.
- Animations stay on the element that needs them. Do not mark a whole page as a client component so one button can animate.
- Layouts must work at a phone width and at a desktop width. Use the existing Tailwind breakpoints. Do not fix a layout with a fixed pixel width that overflows a phone.

## SEO

This origin is private. The root `app/layout.tsx` sets `metadataBase` to `https://admin.controfferta.it` and blocks indexing for every screen:

```ts
export const metadata = {
  metadataBase: new URL("https://admin.controfferta.it"),
  title: {
    default: "Admin",
    template: "%s | Controfferta Admin",
  },
  description: "Controfferta admin dashboard.",
  robots: { index: false, follow: false },
};
```

- `title` is unique and names the screen. The root template appends `| Controfferta Admin`, so page titles should not repeat the brand.
- `description` stays short. These pages are not search landing pages.
- One `h1` per page. It matches the screen. Sections use `h2` and `h3` in order.
- Links use `<Link>` for in-app URLs and a real `<a>` for off-site URLs. The href is a path, not a click handler that navigates.
- Images that convey information have a specific `alt`. Decorative images use `alt=""`.
- Set `lang` on `<html>`. The root layout already uses `en`. Change it only when a page is in another language.
- Do not add `sitemap.xml` or a robots rule that allows crawling. `robots.txt` disallows `/`.
- Auth screens, when added, stay `noindex` as well. They inherit the root `robots` rule.

## What not to do

- Do not allow indexing of any route on `admin.controfferta.it`.
- Do not cache per-user data in the Next.js fetch cache.
- Do not set `metadataBase` to the public site.
- Do not add weight (extra animation libraries, icon packs, or UI kits) for a single screen.
- Do not add Redux or RTK Query. SWR is the client cache.
