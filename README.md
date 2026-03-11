This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend features for movie users (MongoDB)

This project now includes user-centric backend APIs (inside `src/app/api/user`) for:

- User session bootstrap (`POST /api/user/session`)
- Favorites (`GET/POST /api/user/favorites`, `DELETE /api/user/favorites/:movieId`)
- Watch history (`GET/POST/DELETE /api/user/history`)
- Ratings (`GET/POST /api/user/ratings`)
- Personalized recommendations (`GET /api/user/recommendations`)
- User-facing pages using personalization: `/de-xuat`, `/lich-su`, rating widget in movie detail

## Self-hosted movie data (no runtime dependency on third-party)

The public movie APIs now read from your own MongoDB collections (`movies`, `categories`, `countries`).

### Crawl/sync command

```bash
npm run sync:ophim
```

This command pulls movie data from OPhim source and upserts to your MongoDB.

### Auth + Roles + Admin APIs

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/bootstrap-admin` (for initial admin setup)
- Admin:
  - `POST /api/admin/sync` (crawl trigger)
  - `GET/POST /api/admin/movies`
  - `GET/PUT/DELETE /api/admin/movies/:id`
  - `GET/PATCH /api/admin/users`
  - `GET/PUT /api/admin/taxonomies`
  - `GET/DELETE /api/admin/comments`
  - `GET /api/admin/stats`
  - `GET/POST /api/admin/banners`
  - `PUT/DELETE /api/admin/banners/:id`
  - `GET /api/cron/sync-ophim` (cron sync with secret)
 - Taxonomy/public filters:
  - `GET /api/years`
  - `GET /api/years/movies?year=2024&page=1`
  - `GET /api/nam-phat-hanh`
  - `GET /api/nam-phat-hanh/:year?page=1`
  - `GET /api/quoc-gia`
  - `GET /api/quoc-gia/:slug?page=1`

### Cronjob auto sync

If you deploy on Vercel, this repo already includes `vercel.json` cron schedule:

- Every 2 hours: `/api/cron/sync-ophim`

Set environment variables:

```bash
CRON_SECRET=your_strong_secret
CRON_CRAWL_MAX_PAGES_PER_TYPE=6
CRON_CRAWL_MAX_DETAIL_FETCH=500
```

Cron request must include either:

- `Authorization: Bearer <CRON_SECRET>`
- or header `x-cron-secret: <CRON_SECRET>`

### Environment variables

Set these values in `.env`:

```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=ULTIMATE_store
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
