import { createAuthClient } from "better-auth/react";

// En production, utiliser l'URL actuelle du site
const portfolioUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: portfolioUrl,
});

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: portfolioUrl,
});
