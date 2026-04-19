/**
 * Firebase client SDK initialization.
 *
 * The NEXT_PUBLIC_FIREBASE_* values are shipped to the browser by design —
 * they identify your project to Firebase, but they do NOT grant access.
 * Access is gated by Firebase Auth + Firestore Security Rules, which MUST
 * be configured before production. See firestore.rules for starter rules.
 *
 * Any truly private credential (Admin SDK service account) must live in a
 * non-public env var and only be imported from server code.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fail loudly in development if config is missing.
if (process.env.NODE_ENV !== "production") {
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value) {
      // eslint-disable-next-line no-console
      console.warn(`[firebase] Missing env var for ${key}. Check .env.local`);
    }
  }
}

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
