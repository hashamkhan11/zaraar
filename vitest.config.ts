import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    // lib/orders.ts and lib/finance.ts import lib/firebase.ts, which calls
    // getAuth() at module load time. That throws in a test environment where
    // the real NEXT_PUBLIC_FIREBASE_* vars aren't set — these are dummy
    // placeholders just to let the SDK initialize; no network call is ever
    // made since the tests only exercise plain business-logic functions.
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:0000000000000000000000",
    },
  },
});
