# AIESEC in Suez — Executive Board Application

A complete Next.js App Router + TypeScript application with an editable public microsite, a dedicated questionnaire page, and one password-protected administrator. Styling uses Tailwind CSS and custom responsive styles, Space Grotesk and Inter are self-hosted, animation uses Framer Motion, and icons use Lucide.

## Run locally

Use Node.js 22.18+ or Node.js 24 LTS and npm.

```sh
npm install
```

Copy `.env.example` to `.env.local` and start:

```sh
npm run dev
```

Open **http://127.0.0.1:3000**. Open **/admin/login** to edit the website.

The initial **local development only** password is `ana borio`. It is used only on the server and is never included in client JavaScript. Production intentionally refuses this password.

```dotenv
ADMIN_PASSWORD=ana borio
BLOB_READ_WRITE_TOKEN=
SESSION_SECRET=
SITE_URL=
```

- `ADMIN_PASSWORD`: the single admin password. Set a strong unique value on Vercel.
- `BLOB_READ_WRITE_TOKEN`: a token from a **public** Vercel Blob store. Public assets and JSON contain website content only, never passwords or session secrets.
- `SESSION_SECRET`: at least 32 characters for production. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `SITE_URL`: your canonical HTTPS site origin in production, with no path. Leave blank locally so the request origin is used. Set the matching preview origin in preview environments, or leave it unset there to use the request origin.

Do not commit `.env.local` or any tokens.

## Vercel deployment

1. Push this project directory to your Git repository and import it into Vercel as a **Next.js** project. Use Node.js 24 and the default build/output detection (`npm run build`). The project uses webpack for portable builds.
2. In Vercel Storage, create a **public Blob store** and connect it to the project. Vercel supplies `BLOB_READ_WRITE_TOKEN` to the selected environments.
3. Add a strong `ADMIN_PASSWORD`, generated `SESSION_SECRET`, and the correct `SITE_URL` in Project Settings → Environment Variables. Set them for the appropriate Production/Preview environments.
4. Deploy, open `/admin/login`, and add the official photos, LCP message, dates, functional questions and assessment links.
5. Save Changes, then check the public website and test an upload.

No public accounts or application forms exist. Candidates follow the editable email submission instructions.

## Editing

The administrator can edit general settings, SEO, navigation, home, hero, LCP Word, About, timeline, commitments, package, questionnaire, direction, functions, assessments, CV, submission instructions, custom sections, media and footer.

Use **Save Changes** to publish content. The top bar shows unsaved/saving/success states. A failed save retains edits. Navigating away warns about unsaved changes. Session expiry offers a sign-in link in a new tab so your draft stays on screen.

Repeatable lists support Add, Duplicate, Delete (with confirmation), Enabled toggles, and Up/Down ordering. Newly duplicated items get new IDs. Expand an item to edit it. Custom section IDs are stable anchor targets shown in the editor; use `#ID` in navigation. Enable the “Custom Sections” menu item when you add content there.

Use `{year}` in title, subtitle, description and term fields to follow `settings.applicationYear`. The supplied `27.28` is stored once as the global year; the supplied AIESEC 2030 question retains its explicit strategic reference.

LCP message and other multiline fields render as safe paragraphs with preserved line breaks; raw HTML is not accepted. Separate paragraphs with a blank line. Neutral photo placeholders are intentional and replaceable. Timeline dates, official naming rules, endorsement details, LCP identity/message, assessment URLs and functional questions were not supplied; they are explicitly pending rather than invented. The old site/screenshots were not attached, so the information architecture follows the written brief.

## Content storage and fallback

- With a Blob token: saves create immutable timestamped JSON revisions in `content/`. Reads discover the newest revision, avoiding overwrite cache staleness. Previous revisions are retained for recovery. A single admin should avoid simultaneous edits in multiple tabs; the last completed save wins.
- Without a token locally: saves persist atomically to `.local/content.json`; uploads persist under `.local/media/`. These survive local restarts.
- Without a token on Vercel: public pages use `data/default-content.json`, but saving/uploading reports a configuration error instead of pretending to persist.
- If stored JSON fails validation or storage cannot be reached: public pages use the validated bundled default. The admin receives a warning. Avoid saving fallback content over an unavailable store until connectivity is restored.
- For rollback, obtain a previous Blob revision from the store, review it, then copy its content into `data/default-content.json` for a new deploy or apply the values through the editor. No secrets are in content files.

Local edits are intentionally not committed. To promote local copy to the initial deployment, copy `.local/content.json` to `data/default-content.json`, validate it with the tests, and commit it. Local `/api/media/...` URLs are for local development only: re-upload those files to Blob and update their fields before publishing. Alternatively, connect Blob locally before making production content edits.

## Images

Upload from Media or any image field. JPG, JPEG, PNG and WebP are accepted, up to 4 MB. File signatures are checked server-side. SVG uploads are intentionally disabled. Media deletion requires confirmation and refuses to delete an image referenced in saved content. Uploading is immediate; assigning it to a visible field requires Save Changes.

Blob photos use Next.js Image optimization. Manually entered external image URLs are displayed without server-side optimization to avoid arbitrary remote fetching. Self-hosted fonts avoid external font requests. Provide descriptive alt text for collage and About images. Logo, favicon, pattern and social image fields are editable; no social image is fabricated.

## Authentication and security

Authentication is server-side. Sessions are HMAC-signed, expire in eight hours, use HTTP-only SameSite=Strict cookies, and use Secure cookies in production. Every protected page checks authentication. Every mutation checks authentication and request origin. Password changes invalidate existing sessions. Logout removes the browser session cookie. Never share session tokens.

Login has basic in-memory throttling (8 attempts per address / 10 minutes, with an additional per-instance global limit). This resets with a process restart and is not a distributed rate limiter. For an internet-facing deployment, configure Vercel Firewall rate limiting for `/api/auth/login` if stronger multi-instance abuse protection is required. No external authentication service or database is needed.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Security/content tests check session tampering, expiration, password rotation, production configuration, fallback validation, unsafe URLs, global year replacement, visibility and ordering. See `VERIFICATION.md` for the results achieved in the build environment and any outstanding deployment checks.

## Structure

```text
app/                 Public pages, admin pages and protected API routes
components/          Public layout, animation, photos and accordion
components/admin/    Login, form-based editor and media library
lib/auth/            Signed sessions, origin and authorization checks
lib/content.ts       Blob/local persistence and fallback
lib/media.ts         Validated image storage and deletion
lib/schema.ts        TypeScript content model and runtime validation
data/default-content.json
public/favicon.svg
tests/               Security and content tests
```

Footer credit: **Developed by Mohammed Tamer** (editable under Footer).

## Refinement update

Functional editing now has one expandable block per function and a vertical list of individually editable questions. Use **Add Question**, Enabled, Duplicate, Delete and Up/Down; numbering is automatic. Public functional headers show only the title and expand/collapse icon. Questionnaire categories retain their existing layout.

Existing functional descriptions are upgraded on read: numbered/bulleted prompts become separate questions, clear paragraphs are kept, and existing question items are preserved. Ambiguous prose is retained as one question rather than discarded. Blank numbered drafts remain editable but hidden. The old placeholder notice is removed. **Save Changes** persists the upgraded structure to the same local file or Blob store.

Submission contacts are displayed inside the selected guideline (initially Step 04). In Submission Guidelines, the **Guideline containing submission contacts** selector keeps that association stable when cards are reordered. Contact labels and addresses remain editable. The first three guideline cards are unchanged.

To update an existing extracted project, stop its development server, merge the new source files, and keep your existing `.env.local` and `.local/` folder. Run `npm install` and `npm run dev` again. The ZIP intentionally excludes credentials, uploaded local media and saved local content. No manual database or storage migration is required.
