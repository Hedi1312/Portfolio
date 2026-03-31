import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import CvClient from './CvClient';

export default async function AdminCVPage() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) {
    redirect('/admin-login');
  }

  const cv = await prisma.cv.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  const initialCv = cv
    ? {
        url: cv.url,
        size: cv.size || 'Document PDF',
        name: 'CV_OKBA_Hedi.pdf',
      }
    : null;

  return <CvClient initialCv={initialCv} />;
}
