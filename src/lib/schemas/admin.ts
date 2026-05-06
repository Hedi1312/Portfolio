import { z } from 'zod';

// ─── Project Schemas ────────────────────────────────────

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
  icon: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(5000),
  gradient: z.string().max(200).optional(),
  link: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  github: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  visible: z.boolean().optional(),
  useGradientBanner: z.boolean().optional(),
  skills: z.array(skillSchema).optional(),
});

export const updateProjectSchema = createProjectSchema.extend({
  order: z.number().int().min(0).optional(),
});

// ─── About Schemas ──────────────────────────────────────

const statSchema = z.object({
  value: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
});

const aboutTechSchema = z.object({
  name: z.string().min(1, 'Tech name is required').max(100),
  icon: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
});

export const updateAboutSchema = z.object({
  bio: z.string().max(10000).optional(),
  stats: z.array(statSchema).optional(),
  techs: z.array(aboutTechSchema).optional(),
});

// ─── CV Schemas ─────────────────────────────────────────

export const createCvSchema = z.object({
  url: z.string().url('Invalid URL'),
  public_id: z.string().min(1, 'public_id is required'),
  resource_type: z.string().max(50).optional(),
  size: z.string().max(100).optional(),
});

// ─── Project Images Schemas ─────────────────────────────

const uploadedImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  public_id: z.string().min(1, 'public_id is required'),
  resource_type: z.string().max(50).optional(),
});

export const addProjectImagesSchema = z.object({
  images: z.array(uploadedImageSchema).min(1, 'At least one image is required'),
});

export const updateImageOrderSchema = z.object({
  order: z.number().int().min(0),
});

// ─── Cloudinary Sign Schema ─────────────────────────────

export const cloudinarySignSchema = z.object({
  subfolder: z.string().min(1, 'subfolder is required').max(100),
  public_id: z.string().max(200).optional(),
});

// ─── Reply Schema ───────────────────────────────────────

export const replyMessageSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(10000),
});
