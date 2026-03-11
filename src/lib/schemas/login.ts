import { z } from 'zod';

export const passwordRegex = {
  min: (v: string) => v.length >= 8,
  upper: (v: string) => /[A-Z]/.test(v),
  lower: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
  special: (v: string) => /[!@#$*-+:;,'()\-%&_]/.test(v),
};

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Le mail est requis')
  .refine(
    (value) => {
      const normalized = value.trim();
      const emailValid = z.string().email().safeParse(normalized).success;
      return emailValid;
    },
    { message: 'Email invalide' },
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
});


export const resetSchema = z.object({
  email: emailSchema,
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Veuillez respecter les critères')
      .refine(passwordRegex.upper, 'Une majuscule requise')
      .refine(passwordRegex.lower, 'Une minuscule requise')
      .refine(passwordRegex.number, 'Un chiffre requis')
      .refine(passwordRegex.special, 'Un caractère spécial requis'),
    confirmPassword: z.string().min(8, 'Les mot de passe sont différents'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;