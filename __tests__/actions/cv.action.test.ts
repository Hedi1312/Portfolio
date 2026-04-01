import { uploadCvAction, deleteCvAction } from '@/actions/cv.action';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteFromCloudinary } from '@/lib/cloudinary';
jest.mock('@/lib/prisma', () => ({
  prisma: {
    cv: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

jest.mock('@/lib/auth-guard', () => ({
  requireAdmin: jest.fn(),
}));

jest.mock('@/lib/cloudinary', () => ({
  deleteFromCloudinary: jest.fn(),
  uploadToCloudinary: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('CV Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadCvAction', () => {
    it('1. Returns { error: "Non autorisé" } if unauthorized', async () => {
      (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: true });
      const res = await uploadCvAction({});
      expect(res).toEqual({ error: 'Non autorisé' });
    });

    it('2. Fails if payload is invalid (Zod validation)', async () => {
      (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: false });
      const res = await uploadCvAction({ url: '' }); // Invalid payload missing public_id
      expect(res.error).toBeDefined();
    });

    it('3. Clears old CVs and creates a new one on success', async () => {
      (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: false });

      // Mock old CVs
      (prisma.cv.findMany as jest.Mock).mockResolvedValueOnce([
        { id: '1', public_id: 'old-1', resource_type: 'image' },
      ]);

      // Mock tx
      const mockTx = {
        cv: {
          deleteMany: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockResolvedValue({ id: 'new' }),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb(mockTx);
      });

      const payload = {
        url: 'http://res.cloudinary.com/test/pdf',
        public_id: 'test/pdf',
        resource_type: 'image',
        size: '1.2 MB',
      };

      const res = await uploadCvAction(payload);

      expect(res.success).toBe(true);
      expect(deleteFromCloudinary).toHaveBeenCalledWith('old-1', 'image');
      expect(mockTx.cv.deleteMany).toHaveBeenCalled();
      expect(mockTx.cv.create).toHaveBeenCalled();
    });
  });

  describe('deleteCvAction', () => {
    it('1. Returns { error: "Non autorisé" } if unauthorized', async () => {
      (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: true });
      const res = await deleteCvAction();
      expect(res).toEqual({ error: 'Non autorisé' });
    });

    it('2. Deletes from Cloudinary and DB', async () => {
      (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: false });
      (prisma.cv.findMany as jest.Mock).mockResolvedValueOnce([
        { id: '1', public_id: 'old-2', resource_type: 'image' },
      ]);

      const res = await deleteCvAction();

      expect(res.success).toBe(true);
      expect(deleteFromCloudinary).toHaveBeenCalledWith('old-2', 'image');
      expect(prisma.cv.deleteMany).toHaveBeenCalled();
    });
  });
});
