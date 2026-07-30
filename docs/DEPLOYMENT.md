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

## 3. Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com) and click **Import Project**.
2. Connect `https://github.com/platepixelagency/platepixel` repository.
3. Select `client` as Root Directory.
4. Vercel automatically detects Vite settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Vercel will read `client/vercel.json` and proxy `/api/*` requests to your Railway API instance seamlessly.

---

## 4. Post-Deployment Verification
1. Visit your Vercel public URL (e.g., `https://platepixel.vercel.app`).
2. Submit a lead inquiry on the Contact page.
3. Log into `/login` with credentials (`admin@platepixel.com` / `Admin@123`) to access Admin Workspace.
4. Verify lead intake in CRM, invoice PDF generation, project boards, and client portal workspace.
