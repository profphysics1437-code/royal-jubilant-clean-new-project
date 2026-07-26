# Royal Jubilant Real Estate LLC

Dubai luxury property advisory platform with admin and agent portals.

## Architecture

```
User → Royal Jubilant Website (Next.js)
         ↓
      Next.js Application (Hostinger)
         ↓
      Supabase PostgreSQL (Database)
      Supabase Storage (Images/Media)
```

### Tech Stack
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (JWT, role-based)
- **Storage**: Supabase Storage
- **Hosting**: Hostinger Web Apps
- **Source Control**: GitHub

## Local Development (Windows)

### Prerequisites
- Node.js 22+
- npm
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/profphysics1437-code/royal-jubilant-live.git
cd royal-jubilant-live

# 2. Install dependencies
npm install

# 3. Copy environment file
copy .env.example .env
# Edit .env with your Supabase credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Start development server
npm run dev
```

Visit `http://localhost:3000`

### Default Admin Login
- Email: `admin@royaljubilant.ae`
- Password: `admin123`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |
| `NEXTAUTH_URL` | App URL (localhost or production domain) | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |

## Database

### Schema
- **Provider**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Schema file**: `prisma/schema.prisma`

### Tables
- User (admin, agent, customer roles)
- Property (listings with images, amenities, features)
- Agent (agent profiles)
- Lead (inquiries)
- SiteSetting (website configuration)
- MenuItem (navigation)
- Testimonial, Community, Developer, BlogPost, Faq
- HeroSlide, Video, Award, Popup, SeoMeta
- LandingPage, MediaFile, NewsletterSubscriber

## Authentication

### Flow
1. User submits login form
2. NextAuth CredentialsProvider calls `authorize()`
3. Prisma queries Supabase for user by email
4. bcrypt compares password hash
5. JWT token created with user role
6. Session cookie set
7. Role-based access enforced via `requireAdmin()` / `requireAgent()`

### Roles
- **admin**: Full access to admin portal
- **agent**: Access to agent portal only
- **customer**: No portal access (public site only)

## Media Storage

- Property images and videos upload to **Supabase Storage** (`media` bucket)
- Upload routes: `/api/admin/upload` and `/api/admin/media`
- Supabase keys are hardcoded in upload routes for reliability
- Public URLs are stored in `MediaFile` table and `Property.images` JSON field

## Deployment (Hostinger)

### Automatic Deployment
1. Push to GitHub `main` branch
2. Hostinger auto-deploys via GitHub integration
3. Build: `npm install && npm run build`
4. Start: `next start`
5. Environment variables loaded from `.env` file

### Manual Redeploy
1. hPanel → Web Apps → royaljubilant.com
2. Deployments → Redeploy

## Build Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build for production
npm run build

# Start production server
npm start

# Push schema to database
npx prisma db push
```

## Project Structure

```
royal-jubilant-live/
├── prisma/
│   └── schema.prisma          # PostgreSQL schema
├── public/                     # Static assets (logo, team photos)
├── src/
│   ├── app/
│   │   ├── admin/             # Admin portal (34 pages)
│   │   ├── agent/             # Agent portal (9 pages)
│   │   ├── api/               # API routes (96 routes)
│   │   └── p/                 # Public property pages
│   ├── components/            # UI components (86 files)
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Auth, DB, AI, utilities
├── .env                        # Environment (gitignored in production)
├── .env.example                # Template
├── .gitignore
├── next.config.ts
├── package.json
└── README.md
```

## Known Issues

- RJ AI chat uses Z-AI internal API (may not work on all hosting environments)
- Some property images use Unsplash URLs (placeholder data)
- Google Reviews auto-fetch requires Google Places API key (optional)

## License

© 2026 Royal Jubilant Real Estate LLC. All rights reserved.
