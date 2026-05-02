# WatchesByFahad

Personal eCommerce website for selling watches in Pakistan — built and owned by **Hasham Mubarak**.

Live at [watchesbyfahad.com](https://watchesbyfahad.com)

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) — App Router, server-side rendering
- [Firebase](https://firebase.google.com/) — Firestore (orders), Auth (admin login)
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript

## Features

- Product catalog with color/variant selection
- Cash on Delivery order form
- WhatsApp order confirmation
- Admin dashboard for managing orders
- TikTok Pixel event tracking

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in your Firebase config in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.

Find your Firebase config at: Firebase Console → Project Settings → Your apps → SDK setup

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — product grid |
| `/product/[id]` | Product detail + order form |
| `/admin` | Admin login |
| `/admin/dashboard` | Orders management |

## License

Personal project — all rights reserved. © Hasham Mubarak
