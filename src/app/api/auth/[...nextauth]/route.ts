// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type Session } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import bcrypt from "bcrypt";

/** ----------------------------------------------------------------
 *  1. Auth configuration object – exported so others can import it
 * ----------------------------------------------------------------*/
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user) return null;
        const isValid = await bcrypt.compare(creds.password, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET!,

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.sub && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};

/** ----------------------------------------------------------------
 *  2. Create the handler from that object
 * ----------------------------------------------------------------*/
const handler = NextAuth(authOptions);

/** ----------------------------------------------------------------
 *  3. Export the same handler for both HTTP verbs that NextAuth needs
 * ----------------------------------------------------------------*/
export { handler as GET, handler as POST };
