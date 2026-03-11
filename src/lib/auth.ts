import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
// 🚀 1. On importe TON schéma
import { loginSchema } from "@/lib/schemas/login" 
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", 
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          // 🚀 2. On utilise TON schéma pour valider les données entrantes
          const { email, password } = await loginSchema.parseAsync(credentials);

          // 3. On cherche l'admin
          const admin = await prisma.admin.findUnique({
            where: { email },
          });

          if (!admin || !admin.passwordHash) return null;

          // 4. On vérifie le mot de passe avec Bcrypt
          const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

          if (!isPasswordValid) return null;

          return { id: admin.id, email: admin.email };
        } catch (error) {
          // Si ton Zod échoue (ex: format email invalide), on refuse silencieusement
          return null; 
        }
      },
    }),
  ],
})