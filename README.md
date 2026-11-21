# Collabcar - Next.js Project

This project was successfully migrated from a Horizons React Router export into a production-ready **Next.js (App Router)** application with integrated **PocketBase** backend.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Run the Development Server (Next.js + PocketBase)
To run both the PocketBase backend and Next.js frontend concurrently:
```bash
bun run dev
# or
npm run dev
```

- **Next.js Web App**: [http://localhost:3000](http://localhost:3000)
- **PocketBase Admin Dashboard**: [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)
- **PocketBase REST API**: [http://127.0.0.1:8090/api/](http://127.0.0.1:8090/api/)

*(Default Superuser: `admin@example.com` / `password123456`)*

### 3. Production Build
```bash
bun run build
# or
npm run build
```

Then start the production server:
```bash
bun run start
# or start both PocketBase and Next.js:
bun run start:all
```

---

## 🛠️ Project Structure

- `app/` - Next.js App Router
  - `page.tsx` - Home page (Hero, Destinations, Itinerary Preview, Process, Enquiries, FAQ)
  - `about/page.tsx` - About Collabcar & approach
  - `contact/page.tsx` - Contact form & details
  - `planner/page.tsx` - AI Travel Co-pilot & Itinerary Planner
  - `login/page.tsx` - User authentication & account management
  - `sitemap.ts` - Dynamic search engine sitemap
  - `robots.ts` - Robots.txt specification
  - `api/health/route.ts` - Health check route
  - `api/integrated-ai/stream/route.ts` - SSE streaming endpoint for itinerary generation
  - `layout.tsx` - Root layout with fonts, header, footer, and cookie banner
  - `globals.css` - Tailwind CSS + custom brand design system
- `src/`
  - `components/` - React components (`home/`, `about/`, `contact/`, `planner/`, `auth/`, `ui/`)
  - `constants/` - Brand configurations, assets, and AI system prompt
  - `data/` - Destination guides and data
  - `hooks/` - Form submissions, authentication, pocketbase records, disclosure, cookie consent
  - `lib/` - PocketBase client, API utilities, rate limiting, and SEO helpers
- `pocketbase/`
  - `pocketbase` - Native ARM64 PocketBase binary
  - `pb_migrations/` - Database schemas and migrations (`travel_enquiries`, `contact_messages`, `itinerary_drafts`, etc.)
  - `pb_hooks/` - Server-side hooks (auto-verify users, mailers, submissions)
  - `pb_data/` - Embedded SQLite database

---

## ✨ Features

- **Next.js 15 App Router** with full React 19 support and fast SSR/Static Prerendering
- **Tailwind CSS & Radix UI** design system matching original branding
- **PocketBase Proxy Rewrites**: Frontend calls to `/hcgi/platform/*` are automatically routed by Next.js to PocketBase with zero CORS issues
- **AI Trip Planner**: Real-time SSE streaming for customized India itineraries
- **Interactive Forms**: Working travel enquiry submissions, contact messages, and itinerary saving
