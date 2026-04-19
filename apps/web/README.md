# Wayfind

Next.js (App Router) + Firebase Auth + Firestore, styled with Tailwind.
Currently implements the **login** and **sign-up** flows; `/home` is a stub
that will be built out next.

## Stack

- **Next.js 14** — App Router
- **React 18** + **TypeScript** (strict)
- **Tailwind CSS** — all styling lives in utility classes; no component CSS files
- **Firebase** — Authentication (email/password + Google), Firestore
- **next/font** — Outfit (display/body) + JetBrains Mono (reserved for the map UI)

## Quick start

```bash
# 1. install
npm install

# 2. create a Firebase project at https://console.firebase.google.com
#    then copy the web app config into .env.local
cp .env.local.example .env.local
# edit .env.local and fill in the NEXT_PUBLIC_FIREBASE_* values

# 3. in the Firebase Console, enable auth providers:
#    Authentication → Sign-in method → enable Email/Password AND Google

# 4. create a Firestore database:
#    Firestore Database → Create database → start in production mode

# 5. deploy the starter security rules:
#    npm install -g firebase-tools
#    firebase login
#    firebase use --add   # pick your project
#    firebase deploy --only firestore:rules

# 6. run
npm run dev
# → http://localhost:3000
```

## API-key protection — what's safe and what isn't

A common misconception is that `NEXT_PUBLIC_FIREBASE_API_KEY` needs to be
hidden. It doesn't. The web-app config identifies your Firebase project to
Firebase — it's not a secret, and Firebase's own docs say so.

**Real protection comes from:**

1. **Firebase Authentication** — unauthenticated requests can't reach data.
2. **Firestore Security Rules** — see `firestore.rules`. The starter ruleset
   only allows a user to read/write their own `users/{uid}` document and
   denies everything else by default.
3. **App Check** (optional, recommended for production) — verifies requests
   come from your real app, not a scraper. Enable in Firebase Console.
4. **Authorized domains** in Auth settings — restrict where sign-in can be
   initiated from.

**What MUST stay server-only** (not used yet, but for when you add admin
features):

- Firebase Admin SDK service-account JSON
- Any third-party API key (Maps, Stripe, etc.)

Store those in non-`NEXT_PUBLIC_` env vars and only import them from Route
Handlers, Server Actions, or Server Components. They will never be shipped
to the browser.

## Project structure

```
app/
  layout.tsx               # fonts + <AuthProvider>
  page.tsx                 # root redirect (→ /login or /home)
  globals.css              # Tailwind directives + .bg-grid utility
  login/page.tsx           # composes generic components
  signup/page.tsx          # composes generic components
  home/page.tsx            # stub, auth-guarded

components/ui/             # generic base components — ALL styling lives here
  AuthShell.tsx            # centered layout + grid background
  Button.tsx               # primary / secondary variants, loading, leftIcon
  Card.tsx                 # translucent panel with shadow + fade-up
  Divider.tsx              # "or" separator
  GoogleIcon.tsx
  Input.tsx                # label, error, hint, rightSlot, a11y attrs
  PasswordStrength.tsx
  Spinner.tsx
  Wordmark.tsx             # "wayfind" lockup

contexts/
  AuthContext.tsx          # onAuthStateChanged provider + useAuth()

lib/
  cn.ts                    # clsx + tailwind-merge helper
  firebase/
    client.ts              # app/auth/db init, Google provider
    auth.ts                # signUp/signIn/signOut + Firestore user upsert
    errors.ts              # maps Firebase codes → human copy

firestore.rules            # starter security rules
tailwind.config.ts         # design tokens (colors, shadows, animations)
```

## Design-system contract

The Tailwind config maps every color, shadow, and animation from the design
handoff to a semantic class. **Pages compose components — they do not restyle
them.** If you find yourself writing, for example,
`<Button className="h-12 bg-blue-500">`, that's a signal to add a new variant
to `Button.tsx` instead.

Tokens available:

| Purpose          | Class                                                |
|------------------|------------------------------------------------------|
| Page background  | `bg-bg` (#FAF8F5)                                    |
| Raised surface   | `bg-surface` (#F2EBE0)                               |
| Border           | `border-border`, focus: `border-border-focus`        |
| Text             | `text-fg-1` / `text-fg-2` / `text-fg-3`              |
| Brand primary    | `bg-primary`, `bg-primary-hover`, `bg-primary-disabled`, `text-primary` |
| Danger           | `bg-danger`, `text-danger`                           |
| Card shadow      | `shadow-card`                                        |
| Focus ring       | `shadow-ring-primary` / `shadow-ring-danger`         |
| Grid background  | `bg-grid`                                            |
| Entrance anim    | `animate-fade-up`                                    |

## Routes

| Path       | Status      | Notes                                          |
|------------|-------------|------------------------------------------------|
| `/`        | ✅ done     | Redirects based on auth state                  |
| `/login`   | ✅ done     | Email + Google                                 |
| `/signup`  | ✅ done     | Email + Google, password strength meter        |
| `/home`    | 🟡 stub     | Auth-guarded, shows user + sign-out            |
| `/forgot-password` | ❌ not built | Linked from `/login`                      |

## Next steps

- Build out `/home` using the `map-web-app/project/home.html` design
- Add `sendPasswordResetEmail` flow at `/forgot-password`
- Add server-side session cookies + Next.js middleware for a proper auth
  guard (the current `/home` guard is client-side only)
- Enable App Check in production
