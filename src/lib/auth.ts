import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas/auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
const { verifySync } = require('otplib');

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, otpCode: {} },
      authorize: async (credentials) => {
        try {
          const { email, password, otpCode } = await loginSchema.parseAsync(credentials);
          const admin = await prisma.admin.findUnique({ where: { email } });

          if (!admin || !admin.passwordHash) return null;

          const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
          if (!isPasswordValid) return null;

          // A2F TOTP Verification
          if (!otpCode) return null;
          if (admin.otpSecret) {
            // A2F active: verify real TOTP code
            const result = verifySync({
              token: String(otpCode),
              secret: admin.otpSecret,
              window: 1,
            });
            if (!result.valid) return null;
          } else {
            // A2F inactive: only accept '000000'
            if (String(otpCode) !== '000000') return null;
          }

          return { id: admin.id, email: admin.email };
        } catch {
          return null;
        }
      },
    }),
  ],
});
