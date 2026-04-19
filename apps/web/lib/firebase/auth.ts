import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./client";

async function upsertUserDoc(user: User, extra?: { displayName?: string }) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await setDoc(
      ref,
      { lastLoginAt: serverTimestamp() },
      { merge: true },
    );
  } else {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: extra?.displayName ?? user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  await upsertUserDoc(cred.user, { displayName: name });
  return cred.user;
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserDoc(cred.user);
  return cred.user;
}

export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await upsertUserDoc(cred.user);
  return cred.user;
}

export async function signOut() {
  await fbSignOut(auth);
}
