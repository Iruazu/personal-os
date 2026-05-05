import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const allowedEmail = process.env.ALLOWED_EMAIL;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as typeof session & { idToken?: string };
      s.idToken = token.idToken as string | undefined;
      return s;
    },
  },
};
