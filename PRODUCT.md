# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two people, AJ and Cha, a couple. Both browse and upload. Nobody else uses the gallery; it is private to the two of them.

## Product Purpose
A shared photo journal of the couple's life together, organized by year and month. They upload photos regularly after dates and trips, and come back to browse earlier months. Success means uploading takes a few seconds and opening any month brings back that time at a glance.

## Positioning
Not a general photo library. It is one relationship's timeline: every photo belongs to a month, and each month has one chosen cover photo standing for it.

## Operating Context
- Used equally on phones and desktop. Uploads often happen from a phone right after an outing.
- Uploading and browsing matter equally (an ongoing journal, not a finished showpiece).

## Capabilities and Constraints
- Stack: React 18, Vite 5, Tailwind 3.4, React Router 6, Appwrite (TablesDB + Storage; moved off Firebase in Nov 2026 after Firebase Storage required the Blaze plan). Deployed via Netlify build hook on push to `main`. Setup in APPWRITE_SETUP.md.
- Data: Appwrite table `photos`; each row has `fileId` (Storage file), `albumDate` (datetime), `dedicatedImage` (bool = the month's cover).
- Routes: `/` year selector and 12-month grid; `/album/:month_year` photos for one month (set cover, delete); `/upload` multi-file upload with a single date.
- No authentication exists today.
- Undecided: captions, per-photo dates beyond the album date, and sharing are not features.

## Brand Commitments
- Name shown in the tab: "AJ + CHA". Logo at `public/assets/logo.png`.

## Evidence on Hand
- Real photos live in Firebase Storage. No captions, stories, or metadata beyond date. Do not invent captions or memories.

## Product Principles
1. The photos are the interface; chrome stays out of the way.
2. Time is the navigation: year, then month, then photo.
3. Uploading must be fast and forgiving on a phone.
4. Private and personal, never presented like a public portfolio or social feed.
