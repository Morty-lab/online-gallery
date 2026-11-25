# Appwrite setup

The gallery stores photo files in an Appwrite Storage bucket and photo records in an Appwrite table. Do this once in the [Appwrite Cloud console](https://cloud.appwrite.io).

## 1. Project and web platform

1. Create a project (any name, e.g. `online-gallery`).
2. From the project's **Overview → Integrations / Settings**, copy the **Project ID** and **API endpoint** (looks like `https://<region>.cloud.appwrite.io/v1`).
3. **Add platform → Web**, and add each hostname the app runs on: `localhost` and your Netlify domain (e.g. `your-site.netlify.app`). Requests from any other host are rejected (CORS).

## 2. Database table

1. **Databases → Create database**, ID `gallery`.
2. Inside it, **Create table**, ID `photos`.
3. Add columns:

   | Column | Type | Settings |
   |---|---|---|
   | `fileId` | String (varchar) | size 36, required |
   | `albumDate` | Datetime | required |
   | `dedicatedImage` | Boolean | not required, default `false` |

4. **Indexes → Create index**: type *Key*, column `albumDate`, order ASC.
5. **Settings → Permissions**: role **Any** → Read only. Role **Label** `admin` → Create, Read, Update, Delete. Leave row security off.

## 3. Storage bucket

1. **Storage → Create bucket**, ID `photos`.
2. **Settings → Permissions**: role **Any** → Read only. Role **Label** `admin` → Create, Read, Update, Delete. Leave file security off.
3. **Allowed file extensions**: `jpg, jpeg, png, webp, gif, avif`. HEIC can't be shown by most browsers, so set iPhones to "Most Compatible" or export as JPEG.
4. **Maximum file size**: as high as your plan allows (phone photos run 3–15 MB).

## 4. Environment variables

Copy `.env.example` to `.env.local` (already done locally) and fill in the endpoint and project ID. The database, table and bucket IDs default to `gallery`, `photos` and `photos`.

Netlify reads the same `VITE_APPWRITE_*` values from `netlify.toml` (they are public, baked into the bundle at build time), so deploys need no dashboard setup. Never put the API key there.

Set `VITE_APPWRITE_PREVIEWS=true` only if your plan includes image transformations; then the strips and contact sheet load resized thumbnails instead of full images.

## 5. Bring over the old photos (optional)

The old photo records are still in Firestore, but Firebase Storage refuses to serve the files (HTTP 402) unless the Firebase project is on the Blaze plan. To rescue them:

1. Switch the Firebase project to Blaze temporarily (light use normally costs nothing).
2. The script runs without signing in, so temporarily add **Any → Create** to the table and the bucket permissions.
3. Run `node --env-file=.env.local scripts/migrate-firebase-to-appwrite.mjs`. It copies each file and record, keeps cover choices and dates, and skips anything already copied, so it is safe to re-run.
4. Remove the temporary **Any → Create** permissions again.
5. Check the gallery, then downgrade or delete the Firebase project.

## Accounts (sign-in)

The public site at `/` is view only and has no link to sign in. You manage photos at `/sign-in` → `/dashboard`.

1. **Auth → Users → Create user** for each of you (email + password).
2. Open each user and add the label **`admin`**. Signing in alone does nothing: only accounts with this label can open the dashboard, and the table/bucket permissions above enforce the same rule on Appwrite's side.
3. **Auth → Settings**: set the **Users limit** to 2 (or turn off email/password sign-ups) so nobody else can create accounts. They would have no access anyway, but this keeps the user list clean.

Appwrite Cloud keeps the session in a cookie on its own domain. Browsers that block third-party cookies (Safari, Brave) fall back to local storage, which the SDK handles. If sign-in ever fails to stick, add a custom domain for Appwrite under the same domain as the site (e.g. `api.yourdomain.com`).

## Routes

| URL | Who | What |
|---|---|---|
| `/`, `/album/:month_year` | everyone | View-only gallery |
| `/sign-in` | you | Sign in (not linked from anywhere, marked noindex) |
| `/dashboard` | admin | Albums with editing: open a month to make covers, change dates, delete |
| `/dashboard/upload` | admin | Add photos |
| `/dashboard/preview` | admin | The public site exactly as visitors see it, with a bar to return |

`public/_redirects` sends every path to the app so these URLs work when opened directly on Netlify.
