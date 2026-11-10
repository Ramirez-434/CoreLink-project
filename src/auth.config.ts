import type { NextAuthConfig } from "next-auth";

/**
 * Configuração base do NextAuth compatível com Edge / Proxy Middleware (sem dependências Node nativas)
 * para inspeção estrita de sessão e controle de acesso baseado em papéis (RBAC).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
