import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@/generated/client";
import bcrypt from "bcryptjs";

// Create a local instance dedicated to auth to ensure it has the latest models
const localPrisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(localPrisma as any),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Credenciales incompletas.");
        }
        
        // Remove @ if user typed it
        const normalizedUsername = credentials.username.startsWith('@') 
          ? credentials.username 
          : `@${credentials.username}`;

        console.log("[Auth] Attempting login for:", normalizedUsername);
        
        if (!localPrisma.user) {
          console.error("[Auth] User model is MISSING in localPrisma instance!");
          throw new Error("Sistema de base de datos desactualizado.");
        }

        const user = await localPrisma.user.findUnique({
          where: { username: normalizedUsername },
        });

        if (!user || !user.password) {
          throw new Error("Usuario o contraseña incorrectos");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Usuario o contraseña incorrectos");
        }
        
        if (user.passwordExpiresAt && new Date(user.passwordExpiresAt) < new Date()) {
          throw new Error("Contraseña expirada. Contacte al administrador.");
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
