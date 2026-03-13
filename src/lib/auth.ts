import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas/auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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
