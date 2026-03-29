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

      // Block unauthenticated Admin APIs
      if (isProtectedApiAdminPath && !isLoggedIn) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Redirect to login if unauthenticated
      if (isProtectedAdminPath) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/admin-login', nextUrl));
      }

      // Block login access if logged in
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
