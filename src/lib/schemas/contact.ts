import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  email: z.string().trim().min(1, "L'email est requis").email('Email invalide'),
  subject: z
    .string()
    .trim()
    .min(1, 'Le sujet est requis')
    .max(150, 'Le sujet ne doit pas dépasser 150 caractères'),
  message: z
    .string()
    .trim()
    .min(1, 'Le message est requis')
    .max(5000, 'Le message ne doit pas dépasser 5000 caractères'),
});

export type ContactValues = z.infer<typeof contactSchema>;
