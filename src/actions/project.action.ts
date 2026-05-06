'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import {
  updateProjectSchema,
  createProjectSchema,
  addProjectImagesSchema,
  updateImageOrderSchema,
} from '@/lib/schemas/admin';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

// Projects CRUD

export async function createProjectAction(payload: Record<string, unknown>): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

  try {
    const validation = createProjectSchema.safeParse(payload);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { title, description, gradient, link, github, visible, useGradientBanner, skills } =
      validation.data;

    const maxOrder = await prisma.project.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        gradient: gradient || undefined,
        link: link || null,
        github: github || null,
        visible: visible ?? true,
        useGradientBanner: useGradientBanner ?? false,
        order: nextOrder,
        skills: {
          create:
            skills?.map((s) => ({
              name: s.name,
              icon: s.icon || null,
              color: s.color || '#00D5BE',
            })) ?? [],
        },
      },
      include: { skills: true, images: { orderBy: { order: 'asc' } } },
    });

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('[actions/project:create]', error);
    return { error: 'Server error.' };
  }
}

export async function updateProjectAction(
  id: string,
  payload: Record<string, unknown>,
): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

  try {
    const validation = updateProjectSchema.safeParse(payload);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const {
      title,
      description,
      gradient,
      link,
      github,
      visible,
      useGradientBanner,
      order,
      skills,
    } = validation.data;

    // Atomic skill replacement
    const project = await prisma.$transaction(async (tx) => {
      await tx.projectSkill.deleteMany({ where: { projectId: id } });

      return tx.project.update({
        where: { id },
        data: {
          title,
          description,
          gradient: gradient || undefined,
          link: link || null,
          github: github || null,
          visible: visible ?? true,
          useGradientBanner: useGradientBanner ?? false,
          order: order ?? undefined,
          skills: {
            create:
              skills?.map((s) => ({
                name: s.name,
                icon: s.icon || null,
                color: s.color || '#00D5BE',
              })) ?? [],
          },
        },
        include: { skills: true, images: { orderBy: { order: 'asc' } } },
      });
    });

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error) {
    console.error('[actions/project:update]', error);
    return { error: 'Server error.' };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!project) return { error: 'Project not found.' };

    if (project.images.length > 0) {
      await Promise.all(
        project.images.map((img) => {
          const isVideo = /\.(mp4|webm|mov|avi)$/i.test(img.url);
          return deleteFromCloudinary(img.public_id, isVideo ? 'video' : 'image');
        }),
      );
    }

    await prisma.project.delete({ where: { id } });

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('[actions/project:delete]', error);
    return { error: 'Server error.' };
  }
}

// Project Images

export async function addProjectImagesAction(
  projectId: string,
  payload: Record<string, unknown>,
): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: 'Project not found' };

    const validation = addProjectImagesSchema.safeParse(payload);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { images } = validation.data;
    const uploadedImages = [];

    const maxOrderRes = await prisma.projectImage.aggregate({
      where: { projectId },
      _max: { order: true },
    });
    let nextOrder = (maxOrderRes._max.order ?? -1) + 1;

    for (const img of images) {
      const projectImage = await prisma.projectImage.create({
        data: {
          url: img.url,
          public_id: img.public_id,
          order: nextOrder++,
          projectId,
        },
      });
      uploadedImages.push(projectImage);
    }

    revalidatePath('/admin/projects');
    return { success: true, data: uploadedImages };
  } catch (error) {
    console.error('[actions/project:addImages]', error);
    return { error: 'Server error.' };
  }
}

export async function deleteProjectImageAction(
  projectId: string,
  imageId: string,
): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

  try {
    const image = await prisma.projectImage.findUnique({
      where: { id: imageId, projectId },
    });

    if (!image) return { error: 'Image not found' };

    const isVideo = image.url.match(/\.(mp4|webm|mov|avi|mkv)$/i);
    const resourceType = isVideo ? 'video' : 'image';

    await deleteFromCloudinary(image.public_id, resourceType);

    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error) {
    console.error('[actions/project:deleteImage]', error);
    return { error: 'Server error.' };
  }
}

export async function updateProjectImageOrderAction(
  projectId: string,
  imageId: string,
  order: number,
): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

  try {
    const validation = updateImageOrderSchema.safeParse({ order });
    if (!validation.success) return { error: validation.error.issues[0].message };

    const image = await prisma.projectImage.update({
      where: { id: imageId, projectId },
      data: { order: validation.data.order },
    });

    // Skip revalidatePath to avoid spamming during bulk optimistic updates
    return { success: true, data: image };
  } catch (error) {
    console.error('[actions/project:updateImageOrder]', error);
    return { error: 'Server error.' };
  }
}
