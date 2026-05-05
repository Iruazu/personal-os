import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

const allowedEmail = process.env.ALLOWED_EMAIL;

async function refreshIdToken(token: JWT): Promise<JWT> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to refresh token");
  return {
    ...token,
    idToken: data.id_token as string,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: { access_type: "offline", prompt: "consent" },
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user }) {
      if (!allowedEmail) {
        console.error("ALLOWED_EMAIL is not configured. Denying sign-in.");
        return false;
      }
      return user.email === allowedEmail;
    },
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
        };
      }
      if (Date.now() < (token.expiresAt as number) - 5 * 60 * 1000) {
        return token;
      }
      try {
        return await refreshIdToken(token);
      } catch {
        return { ...token, error: "RefreshTokenError" as const };
      }
    },
    async session({ session, token }) {
      const s = session as typeof session & { idToken?: string; error?: string };
      s.idToken = token.idToken as string | undefined;
      if (token.error) s.error = token.error as string;
      return s;
    },
  },
};
