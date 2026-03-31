import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { createProjectSchema } from '@/lib/schemas/admin';

// GET → All projects (with skills), ordered
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const projects = await prisma.project.findMany({
      include: {
        skills: true,
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('[api/admin/projects:GET]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST → Create a project
export async function POST(req: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();

    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { title, description, gradient, link, github, visible, skills } = validation.data;

    // Get current highest order
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

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('[api/admin/projects:POST]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
