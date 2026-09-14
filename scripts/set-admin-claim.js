/**
 * One-off script to grant a Firebase user the `admin` custom claim.
 * firestore.rules and netlify/functions/postex.js both check
 * `request.auth.token.admin == true` / `decodedToken.admin === true` to
 * gate admin-only reads/writes and courier actions — without this claim
 * set, no account can pass those checks.
 *
 * Usage (run once per admin account, from the project root):
 *   FIREBASE_SERVICE_ACCOUNT='<contents of your service account JSON>' node scripts/set-admin-claim.js <uid>
 *
 * Where <uid> is the target user's Firebase Auth UID (Firebase Console →
 * Authentication → Users → copy the "User UID" column for your admin
 * account). The service account JSON is the same one used for
 * FIREBASE_SERVICE_ACCOUNT in Netlify (Firebase Console → Project Settings
 * → Service Accounts → Generate new private key).
 *
 * After running this, the user must sign out and back in (or otherwise
 * force-refresh their ID token) for the new claim to take effect.
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const uid = process.argv[2];

if (!uid) {
  console.log("Usage: FIREBASE_SERVICE_ACCOUNT='<json>' node scripts/set-admin-claim.js <uid>");
  process.exit(1);
}

const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!sa) {
  console.error("FIREBASE_SERVICE_ACCOUNT env var is missing.");
  process.exit(1);
}

(async () => {
  initializeApp({ credential: cert(JSON.parse(sa)) });

  await getAuth().setCustomUserClaims(uid, { admin: true });
  const user = await getAuth().getUser(uid);

  console.log(`Admin claim set for ${user.email ?? uid}.`);
  console.log("Sign out and back in on that account for it to take effect.");
})().catch((err) => {
  console.error("Failed to set admin claim:", err);
  process.exit(1);
});
