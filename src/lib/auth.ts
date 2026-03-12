import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { loginSchema } from '@/lib/schemas/login';
import { authConfig } from '@/lib/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);
          const admin = await prisma.admin.findUnique({ where: { email } });

          if (!admin || !admin.passwordHash) return null;

          const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
          if (!isPasswordValid) return null;

          return { id: admin.id, email: admin.email };
        } catch {
          return null;
        }
      },
    }),
  ],
});
