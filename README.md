# Kupon

Kupon is a Vite + React application backed by Supabase for managing, sharing, and tracking coupons across personal and family groups. The project is PWA-ready and designed to run both on desktop and mobile via the browser.

## Getting Started

```bash
npm install
npm run dev
```

Provide the Supabase URL and anon key via `.env` (already expected in this repo):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Available Scripts

- `npm run dev` – start the development server
- `npm run build` – build the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint
- `npm run test` – run the Vitest suite

## Project Structure

- `src/components/` – presentational React components grouped by domain (e.g. `auth`, `coupons`, `groups`) plus shared UI primitives.
- `src/contexts/` – React context providers such as `auth/` and `ThemeContext`.
- `src/hooks/` – reusable stateful hooks (`useAuth`, `useCoupons`, `useGroups`, `useWeeklyReminder`, etc.).
- `src/lib/` – Supabase-facing data access helpers (`coupons.ts`, `groups.ts`, storage utilities, client).
- `src/routes/` – router definitions and page-level screens.
- `src/styles/` – Tailwind entry point and custom global styles.
- `src/types/` – shared TypeScript types for coupons, groups, auth, and themes.
- `src/utils/` – framework-agnostic helpers (ID generation, etc.).

## Supabase Schema Notes

Expected tables and storage:

- `coupons`: coupon metadata (`title`, `description`, `code_text`, `image_url`, `expiration_date`, `is_used`, `owner_id`, `group_id`, `share_slug`, `created_at`, `updated_at`, `used_at`)
- `groups`: group metadata (`name`, `owner_id`, `join_code`, timestamps)
- `group_members`: membership join table (`group_id`, `user_id`, `role`)
- Storage bucket `coupon-images` for uploaded coupon visuals

### Supabase bootstrap

Everything the app expects from Supabase is scripted in `supabase/schema.sql`.

1. Open the Supabase dashboard and launch the SQL editor (or use `supabase db remote commit`).
2. Paste the contents of `supabase/schema.sql` and run it in your project. You can safely re-run it to pick up policy tweaks (for example, owners can now read their newly created groups immediately).
   - Creates `groups`, `group_members`, and `coupons` tables with triggers.
   - Enables and configures RLS so that users only see personal coupons or group coupons they belong to.
   - Provisions the `coupon-images` storage bucket plus read/write policies.
3. In Storage → Buckets, confirm `coupon-images` exists (and toggle “Public” if you want CDN delivery for images).

Once that script has been applied you can start recording data directly from the UI.

Row-level security should allow:

- Owners to manage their personal coupons (`group_id IS NULL`)
- Group members to read/write coupons associated with groups they belong to
- Users to read groups where they are members and manage memberships they own

### Google sign-in

- In Supabase Auth settings, enable the Google provider, supply the OAuth credentials, and set the redirect URL to your deployment origin (for local development you can use `http://localhost:5173`).
- Users can choose a magic link or the “Continue with Google” option on the login screen.

## Testing

- Unit tests live under `src/**/*.test.ts`. Hook behavior (such as `useWeeklyReminder`) and data-layer interactions are covered.
- `npm run test` executes the Vitest suite; it stubs Supabase so you can run it offline.

## PWA

A lightweight service worker (`public/sw.js`) precaches the shell and provides offline-first fetching. The manifest lives at `public/manifest.webmanifest` and the main entry point registers the service worker on load.
