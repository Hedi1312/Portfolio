import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/schemas/auth';
import { verifyOTP } from '@/lib/otp';
import { decrypt } from '@/lib/crypto';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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

          // TOTP verification (only when 2FA is active)
          if (admin.otpSecret) {
            if (!otpCode) return null;
            const result = verifyOTP({
              token: String(otpCode),
              secret: decrypt(admin.otpSecret),
              window: 1,
            });
            if (!result.valid) return null;
          }

          return { id: admin.id, email: admin.email };
        } catch {
          return null;
        }
      },
    }),
  ],
});
