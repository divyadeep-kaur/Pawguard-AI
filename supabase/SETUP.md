# Connecting the PawGuard portal to Supabase

The portal (`/portal`) needs a Supabase project. The deployed site shows
**"Accounts backend not connected"** until the two values below reach the build.
Do these steps once; they take about 10 minutes.

## 1. Create the Supabase project
1. Go to <https://supabase.com> → **Sign in** → **New project**.
2. Pick an organisation, name it `pawguard`, choose a strong database password (save it somewhere safe; you won't need it in the app) and the region closest to your users (e.g. *Mumbai* for India).
3. Wait for the project to finish provisioning (about a minute).

## 2. Install the database schema
1. In the project open **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this repository, copy **all** of it, paste, press **Run**.
   You should see *Success. No rows returned*. (Safe to run again. It is idempotent.)
   - Equivalent: run `supabase/migrations/0001_initial_schema.sql` then `0002_ngo_admin_requests.sql`.
3. Optional demo content (clearly labelled "Demo listing", delete before going live):
   run `supabase/seed_demo.sql` the same way.
4. Check **Table Editor**: you should see `profiles`, `animals`, `applications`, `centres`, `favourites`, `rescue_requests`, `rescue_updates`, each with **RLS enabled**.

## 3. Configure sign-in
**Authentication → Providers → Email** is on by default. Then:
1. **Authentication → URL Configuration**
   - **Site URL**: your production address, e.g. `https://<your-app>.vercel.app`
   - **Redirect URLs**: add `https://<your-app>.vercel.app/portal` (and `https://*-<your-team>.vercel.app/portal` if you want preview deployments to work, and `http://localhost:3000/portal` for local work).
   Without this, e-mail confirmation and password-reset links will not land back on the portal.
2. **Authentication → Providers → Email → "Confirm email"**: leave **on** for production (users confirm via e-mail, then sign in). Switch it off only while testing, if you want sign-up to log in instantly.
3. For real volume, set up custom SMTP (**Project Settings → Authentication → SMTP**). Supabase's built-in mailer is rate-limited to a few e-mails per hour.

## 4. Copy the two public values
**Project Settings → API** (or **API Keys**):
- **Project URL** → looks like `https://abcdefghijklmnop.supabase.co`
- **anon / publishable key** → the one labelled `anon` `public` (a long `eyJ…` token) or `sb_publishable_…`

> ⚠️ **Never** use the `service_role` / `sb_secret_…` key anywhere in this project.
> It bypasses Row Level Security. The build refuses to publish it.

## 5. Add them to Vercel and redeploy
1. Vercel → your project → **Settings → Environment Variables**.
2. Add (tick **Production** and **Preview**):
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL |
   | `SUPABASE_ANON_KEY` | the anon / publishable key |
3. **Deployments → ⋯ on the latest → Redeploy** (environment variables only apply to *new* builds).
4. In the build log you should see: `[build-config] Supabase configured for <ref>.supabase.co`.
   If the log shows a `WARNING … not set`, the variables did not reach the build (check spelling and the Production/Preview tick boxes).
   If the log shows `ERROR … service_role`, you pasted the wrong key. Use the anon key.

## 6. Create the first NGO administrator
Admin rights can **never** be self-assigned (enforced in the database).
1. Open `https://<your-app>/portal#/login` → **Create account** → sign up with the organisation's e-mail (choose *NGO / organisation admin*, or any role) and confirm the e-mail if asked.
2. In Supabase **SQL Editor** run (with that person's e-mail):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'ngo@example.org');
   ```
3. Sign out and back in. You land on **Overview** (admin dashboard).
4. From now on, other organisations who sign up with *NGO / organisation admin* appear under **Overview → NGO admin requests**, where an existing admin can **Approve** or **Decline** them.

## 7. Verify (2 minutes)
- `/portal` shows *Animals looking for a home* (not the "not connected" screen).
- Create an adopter account → you land on **Adopt**; **My applications** and **Profile** work; edit your name, reload, it persists.
- Create a volunteer account → lands on **Nearby requests**.
- As admin: **Animals → Add animal** (status *Available*) → it appears in the public marketplace; an adopter applies → admin sees it under **Applications** and approves.
- As an adopter, open `/portal#/admin` → "Not available for your account".

## Troubleshooting
The portal tells you which problem it hit:
| Message | Cause | Fix |
|---|---|---|
| Accounts backend not connected | `SUPABASE_URL`/`SUPABASE_ANON_KEY` not set at build time | Step 5, then redeploy |
| Database tables are not installed | URL + key OK, schema not run | Step 2 |
| Supabase rejected the API key | Wrong/revoked key or key from another project | Step 4 |
| Cannot reach the Supabase project | Wrong URL, or free project **paused** after inactivity | Restore it in the dashboard; check the URL |
| We couldn't load your profile | Signed in but no `profiles` row (schema/trigger missing) | Re-run `schema.sql`; the sign-up trigger creates profiles |
| Confirmation e-mail link goes to the wrong site | Site URL / Redirect URLs not set | Step 3 |

## Running the checks locally
```bash
npm run test:config                 # build-script tests (rejects service_role keys etc.)
SUPABASE_URL=… SUPABASE_ANON_KEY=… node scripts/build-config.mjs   # writes public/config.js from env
```
Do **not** commit a generated `public/config.js` containing your values. The committed copy is an empty placeholder and Vercel regenerates it on every build.
