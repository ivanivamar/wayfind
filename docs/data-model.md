# Firestore data model

## `users/{uid}`

| Field        | Type       | Notes                                    |
|--------------|------------|------------------------------------------|
| uid          | string     | Firebase Auth UID (matches doc ID)       |
| email        | string     | From Auth                                |
| displayName  | string?    | Null if not set                          |
| photoURL     | string?    | Null if not set                          |
| createdAt    | timestamp  | serverTimestamp on first auth            |
| lastLoginAt  | timestamp  | serverTimestamp on every sign-in         |

Written by `apps/web/lib/firebase/auth.ts::upsertUserDoc` (and the Flutter
equivalent when it lands).

Rules: `firebase/firestore.rules` — user can only read/write their own doc.