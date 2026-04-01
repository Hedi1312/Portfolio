/**
 * Integration tests for POST /api/auth/reset-password
 *
 * Tests cover:
 * - Rate limiting (429)
 * - Input validation (missing token, weak password, mismatch)
 * - Token verification (invalid, expired with cleanup)
 * - 2FA gate (OTP required when otpSecret exists)
 * - Happy path (password hashed, token deleted)
 * - Server error handling (500)
 */

// ── Mocks ─────────────────────────────────────────────────

jest.mock('@/lib/prisma', () => ({
  prisma: {
    passwordReset: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    admin: {
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/rate-limit', () => ({
  authRateLimit: jest.fn().mockReturnValue({
    check: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('@/lib/otp', () => ({
  verifyOTP: jest.fn(),
}));

jest.mock('@/lib/crypto', () => ({
  decrypt: jest.fn().mockReturnValue('decrypted-secret'),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashed-password'),
}));

import { POST } from '@/app/api/auth/reset-password/route';
import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { verifyOTP } from '@/lib/otp';
import bcrypt from 'bcrypt';

// ── Helpers ───────────────────────────────────────────────

function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  token: 'valid-uuid-token',
  password: 'MyStr0ng!Pass',
  confirmPassword: 'MyStr0ng!Pass',
};

const mockAdmin = {
  id: 'admin-1',
  email: 'admin@test.com',
  passwordHash: '$2b$12$old-hash',
  otpSecret: null,
  pendingOtpSecret: null,
};

const mockResetRecord = {
  id: 'reset-1',
  token: 'valid-uuid-token',
  expiresAt: new Date(Date.now() + 10 * 60_000), // 10 min from now
  adminId: 'admin-1',
  admin: mockAdmin,
};

// ── Tests ─────────────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: rate limit passes
    const limiterMock = (authRateLimit as jest.Mock).mock.results[0]?.value;
    if (limiterMock) {
      limiterMock.check.mockResolvedValue({ success: true });
    }
  });

  // ── Rate Limiting ─────────────────────────────────────

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      // Override the rate limiter to fail
      (authRateLimit as jest.Mock).mockReturnValue({
        check: jest.fn().mockResolvedValue({ success: false, retryAfter: 45 }),
      });

      // Re-import to get fresh module with new mock
      jest.resetModules();
      jest.mock('@/lib/prisma', () => ({
        prisma: {
          passwordReset: { findUnique: jest.fn(), delete: jest.fn() },
          admin: { update: jest.fn() },
        },
      }));
      jest.mock('@/lib/rate-limit', () => ({
        authRateLimit: jest.fn().mockReturnValue({
          check: jest.fn().mockResolvedValue({ success: false, retryAfter: 45 }),
        }),
      }));
      jest.mock('@/lib/otp', () => ({ verifyOTP: jest.fn() }));
      jest.mock('@/lib/crypto', () => ({ decrypt: jest.fn() }));
      jest.mock('bcrypt', () => ({ hash: jest.fn() }));

      const { POST: freshPOST } = await import('@/app/api/auth/reset-password/route');
      const req = createRequest(validBody);
      const res = await freshPOST(req);

      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toContain('tentatives');
    });
  });

  // ── Validation ────────────────────────────────────────

  describe('input validation', () => {
    it('should return 400 when token is missing', async () => {
      const req = createRequest({ password: 'MyStr0ng!Pass', confirmPassword: 'MyStr0ng!Pass' });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Token');
    });

    it('should return 400 when token is not a string', async () => {
      const req = createRequest({
        token: 123,
        password: 'MyStr0ng!Pass',
        confirmPassword: 'MyStr0ng!Pass',
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 for weak password (no uppercase)', async () => {
      const req = createRequest({
        token: 'valid-token',
        password: 'mystr0ng!pass',
        confirmPassword: 'mystr0ng!pass',
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 for weak password (no special char)', async () => {
      const req = createRequest({
        token: 'valid-token',
        password: 'MyStr0ngPass',
        confirmPassword: 'MyStr0ngPass',
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 when passwords do not match', async () => {
      const req = createRequest({
        token: 'valid-token',
        password: 'MyStr0ng!Pass',
        confirmPassword: 'DifferentP@ss1',
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('correspondent');
    });
  });

  // ── Token verification ────────────────────────────────

  describe('token verification', () => {
    it('should return 400 for an invalid/unknown token', async () => {
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(null);

      const req = createRequest(validBody);
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('invalide');
    });

    it('should return 400 and delete the token when it is expired', async () => {
      const expiredRecord = {
        ...mockResetRecord,
        expiresAt: new Date(Date.now() - 60_000), // 1 min ago
      };
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(expiredRecord);

      const req = createRequest(validBody);
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('expiré');
      // Verify cleanup
      expect(prisma.passwordReset.delete).toHaveBeenCalledWith({
        where: { id: expiredRecord.id },
      });
    });
  });

  // ── 2FA Gate ──────────────────────────────────────────

  describe('2FA verification', () => {
    it('should return 400 when OTP is required but not provided', async () => {
      const adminWith2FA = { ...mockAdmin, otpSecret: 'encrypted-secret' };
      const recordWith2FA = { ...mockResetRecord, admin: adminWith2FA };
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(recordWith2FA);

      const req = createRequest(validBody); // no otpCode
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('OTP');
    });

    it('should return 400 when OTP code is invalid', async () => {
      const adminWith2FA = { ...mockAdmin, otpSecret: 'encrypted-secret' };
      const recordWith2FA = { ...mockResetRecord, admin: adminWith2FA };
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(recordWith2FA);
      (verifyOTP as jest.Mock).mockReturnValue({ valid: false });

      const req = createRequest({ ...validBody, otpCode: '000000' });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('OTP');
    });
  });

  // ── Happy path ────────────────────────────────────────

  describe('happy path', () => {
    it('should hash password, update admin, and delete token on success', async () => {
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(mockResetRecord);
      (prisma.admin.update as jest.Mock).mockResolvedValue({});
      (prisma.passwordReset.delete as jest.Mock).mockResolvedValue({});

      const req = createRequest(validBody);
      const res = await POST(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toContain('succès');

      // Verify bcrypt was called
      expect(bcrypt.hash).toHaveBeenCalledWith('MyStr0ng!Pass', 12);

      // Verify admin was updated
      expect(prisma.admin.update).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
        data: expect.objectContaining({
          passwordHash: '$2b$12$hashed-password',
          passwordUpdatedAt: expect.any(Date),
        }),
      });

      // Verify token was deleted
      expect(prisma.passwordReset.delete).toHaveBeenCalledWith({
        where: { id: 'reset-1' },
      });
    });

    it('should succeed with valid OTP when 2FA is active', async () => {
      const adminWith2FA = { ...mockAdmin, otpSecret: 'encrypted-secret' };
      const recordWith2FA = { ...mockResetRecord, admin: adminWith2FA };
      (prisma.passwordReset.findUnique as jest.Mock).mockResolvedValue(recordWith2FA);
      (verifyOTP as jest.Mock).mockReturnValue({ valid: true });
      (prisma.admin.update as jest.Mock).mockResolvedValue({});
      (prisma.passwordReset.delete as jest.Mock).mockResolvedValue({});

      const req = createRequest({ ...validBody, otpCode: '123456' });
      const res = await POST(req);

      expect(res.status).toBe(200);
    });
  });

  // ── Server error ──────────────────────────────────────

  describe('error handling', () => {
    it('should return 500 on unexpected server error', async () => {
      (prisma.passwordReset.findUnique as jest.Mock).mockRejectedValue(new Error('DB crashed'));

      const req = createRequest(validBody);
      const res = await POST(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain('Erreur');
    });
  });
});
