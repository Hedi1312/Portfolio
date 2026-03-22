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
      const isProtectedApiAdminPath = nextUrl.pathname.startsWith('/api/admin');

      console.log('[PROXY LOG] Intercepted:', nextUrl.pathname, '| User Auth:', isLoggedIn);

      // Bloquer les APIs Admin non authentifiées (401 direct, sans redirection client)
      if (isProtectedApiAdminPath && !isLoggedIn) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Rediriger vers le login si on accède aux pages Admin sans être connecté
      if (isProtectedAdminPath) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/admin-login', nextUrl));
      }

      // Si l'utilisateur est déjà connecté et tente d'aller sur la page de login
      if (isLoginPath) {
        if (isLoggedIn) return Response.redirect(new URL('/admin/dashboard', nextUrl));
        return true;
      }

      return true;
    },
  },
  session: { strategy: 'jwt' },
  providers: [],
} satisfies NextAuthConfig;
