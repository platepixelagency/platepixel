# PlatePixel Agency Management Platform — Production Deployment Guide

This guide outlines the production deployment setup for the **PlatePixel** agency management system.

---

## Architecture Overview
- **Frontend**: Hosted on [Vercel](https://vercel.com) (React 19 + Vite + Tailwind CSS v4).
- **Backend API**: Hosted on [Railway](https://railway.app) / Render (Node.js + Express + TypeScript).
- **Database**: Managed PostgreSQL on [Supabase](https://supabase.com).
- **Email Notifications**: [Resend](https://resend.com) API for transactional automated emails.
- **Monitoring**: Sentry error tracking & logging.

---

## 1. Database Setup (Supabase PostgreSQL)
1. Log into [Supabase Console](https://supabase.com) and create a new project named `PlatePixel`.
2. Retrieve your PostgreSQL connection string under **Project Settings → Database → Connection String**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
3. Update `prisma/schema.prisma` provider to `postgresql` when deploying:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

---

## 2. Backend Deployment (Railway / Render)
1. Push repository to GitHub (`https://github.com/platepixelagency/platepixel`).
2. Log into [Railway](https://railway.app) and select **New Project → Deploy from GitHub repo**.
3. Select the `server` directory as root directory.
4. Set Environment Variables in Railway Dashboard:
   - `DATABASE_URL`: Supabase PostgreSQL URL
   - `JWT_SECRET`: Random 64-character secret
   - `NODE_ENV`: `production`
   - `RESEND_API_KEY`: Resend API key
5. Railway will automatically execute `npx prisma db push && npm start` as configured in `server/railway.json`.

---

## 3. Full-Stack Deployment on Vercel (Frontend + Express Serverless API)

Your repository is now pre-configured to deploy **both Frontend and Express Backend API** on a single Vercel domain (e.g. `https://platepixel-zpyy.vercel.app`).

### Steps to Deploy on Vercel:

1. **Root Directory**:
   - In Vercel Project Settings → **General**, set **Root Directory** to `./` (the root of the repo).
2. **Build Settings**:
   - **Framework Preset**: Other / Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/dist`
3. **Environment Variables**:
   In Vercel Project Settings → **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase PostgreSQL URL (`postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`)
   - `JWT_SECRET`: `platepixel_super_secret_jwt_key_2026_huly_cosmic`
   - `NODE_ENV`: `production`

---

## 4. Verification

1. Visit your Vercel deployment URL (e.g. `https://platepixel-zpyy.vercel.app`).
2. Test backend API health check at `/api/health` (`https://platepixel-zpyy.vercel.app/api/health`).
3. Sign in to your workspace at `/login` with credentials (`admin@platepixel.com` / `Admin@123`).
