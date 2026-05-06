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

      if (isProtectedApiAdminPath && !isLoggedIn) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (isProtectedAdminPath) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/admin-login', nextUrl));
      }

      if (isLoginPath) {
        // Break infinite loop if the server component rejected the session
        const hasError = nextUrl.searchParams.has('error');
        if (isLoggedIn && !hasError) {
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  session: { strategy: 'jwt' },
  providers: [],
} satisfies NextAuthConfig;
