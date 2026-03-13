import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/admin-login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPath = nextUrl.pathname === '/admin-login';
      const isProtectedAdminPath = nextUrl.pathname.startsWith('/admin') && !isLoginPath;

      console.log('[PROXY LOG] Intercepted:', nextUrl.pathname, '| User Auth:', isLoggedIn);

      // Si l'utilisateur tente d'accéder à l'espace admin sans être connecté
      if (isProtectedAdminPath) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/admin-login', nextUrl));
      }

      // Si l'utilisateur est déjà connecté et tente d'aller sur la page de login
      if (isLoginPath) {
        if (isLoggedIn) return Response.redirect(new URL('/admin/dashboard', nextUrl));
        return true; // Laisse passer s'il n'est pas connecté
      }

      return true;
    },
  },
  session: { strategy: 'jwt' },
  providers: [],
} satisfies NextAuthConfig;
