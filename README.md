# ZARAAR

eCommerce website for selling watches in Pakistan — built and owned by **Hasham Mubarak**.

Live at [zaraar.pk](https://zaraar.pk)

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) — App Router, server-side rendering
- [Firebase](https://firebase.google.com/) — Firestore (orders, stock, products), Auth (admin login)
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript
- Netlify Functions — PostEx/Leopard courier booking, TikTok events

## Features

- Product catalog with color/variant selection
- Cash on Delivery order form with WhatsApp confirmation
- Order tracking via PostEx/Leopard courier integration
- Admin dashboard for managing orders, stock, and finance
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
| `/about` | About page |
| `/product/[id]` | Product detail + order form |
| `/admin` | Admin login |
| `/admin/dashboard` | Orders, stock, and finance management |

## License

Personal project — all rights reserved. © Hasham Mubarak
