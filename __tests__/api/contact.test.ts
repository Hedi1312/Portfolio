/**
 * Integration tests for POST /api/contact
 *
 * Tests cover:
 * - Rate limiting (429)
 * - Honeypot detection (silent 200)
 * - Zod validation (400 on missing/invalid fields)
 * - File security (type, size, count limits)
 * - Happy path (contact upsert, message create, emails sent)
 * - Server error handling (500)
 */

// ── Mocks ─────────────────────────────────────────────────

jest.mock('@/lib/prisma', () => ({
  prisma: {
    contact: { upsert: jest.fn() },
    contactMessage: { create: jest.fn() },
  },
}));

jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn().mockReturnValue({
    check: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('@/lib/mailer', () => ({
  transporter: {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
  },
  getEmailSubjectPrefix: jest.fn().mockReturnValue('[LOCAL] '),
}));

jest.mock('@/lib/cloudinary', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/test/file.jpg',
    public_id: 'test/file',
    resource_type: 'image',
  }),
}));

jest.mock('@react-email/components', () => ({
  render: jest.fn().mockResolvedValue('<html>mock email</html>'),
}));

jest.mock('@/emails/AdminNotification', () => ({
  AdminNotification: jest.fn().mockReturnValue('admin-html'),
}));

jest.mock('@/emails/UserConfirmation', () => ({
  UserConfirmation: jest.fn().mockReturnValue('user-html'),
}));

import { POST } from '@/app/api/contact/route';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

// ── Helpers ───────────────────────────────────────────────

function createFormData(
  fields: Record<string, string>,
  files?: { name: string; type: string; size: number }[],
): FormData {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  if (files) {
    files.forEach((f) => {
      const content = new Uint8Array(f.size);
      const blob = new Blob([content], { type: f.type });
      formData.append('files', blob, f.name);
    });
  }
  return formData;
}

function createRequest(formData: FormData): Request {
  return new Request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: formData,
  });
}

const validFields = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'Hello, this is a test message.',
};

// ── Tests ─────────────────────────────────────────────────

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.contact.upsert as jest.Mock).mockResolvedValue({
      id: 'contact-1',
      email: 'john@example.com',
      name: 'John Doe',
    });
    (prisma.contactMessage.create as jest.Mock).mockResolvedValue({ id: 'msg-1' });
  });

  // ── Rate Limiting ─────────────────────────────────────

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      jest.resetModules();
      jest.mock('@/lib/prisma', () => ({
        prisma: { contact: { upsert: jest.fn() }, contactMessage: { create: jest.fn() } },
      }));
      jest.mock('@/lib/rate-limit', () => ({
        rateLimit: jest.fn().mockReturnValue({
          check: jest.fn().mockResolvedValue({ success: false, retryAfter: 30 }),
        }),
      }));
      jest.mock('@/lib/mailer', () => ({
        transporter: { sendMail: jest.fn() },
        getEmailSubjectPrefix: jest.fn().mockReturnValue(''),
      }));
      jest.mock('@react-email/components', () => ({ render: jest.fn() }));
      jest.mock('@/emails/AdminNotification', () => ({ AdminNotification: jest.fn() }));
      jest.mock('@/emails/UserConfirmation', () => ({ UserConfirmation: jest.fn() }));

      const { POST: freshPOST } = await import('@/app/api/contact/route');
      const formData = createFormData(validFields);
      const req = createRequest(formData);
      const res = await freshPOST(req);

      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.error).toContain('tentatives');
    });
  });

  // ── Honeypot ──────────────────────────────────────────

  describe('honeypot', () => {
    it('should return 200 silently when honeypot field is filled (bot detection)', async () => {
      const formData = createFormData({ ...validFields, company: 'I am a bot' });
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // No DB writes should have occurred
      expect(prisma.contact.upsert).not.toHaveBeenCalled();
      expect(prisma.contactMessage.create).not.toHaveBeenCalled();
      // No emails should have been sent
      expect(transporter.sendMail).not.toHaveBeenCalled();
    });
  });

  // ── Validation ────────────────────────────────────────

  describe('input validation', () => {
    it('should return 400 when name is missing', async () => {
      const formData = createFormData({ email: 'test@test.com', subject: 'Sub', message: 'Msg' });
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is invalid', async () => {
      const formData = createFormData({ ...validFields, email: 'not-an-email' });
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 when message is empty', async () => {
      const formData = createFormData({ ...validFields, message: '' });
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 when subject exceeds 150 characters', async () => {
      const formData = createFormData({ ...validFields, subject: 'x'.repeat(151) });
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });

  // ── File security ─────────────────────────────────────

  describe('file security', () => {
    it('should return 400 for disallowed MIME type', async () => {
      const formData = createFormData(validFields, [
        { name: 'malware.exe', type: 'application/x-executable', size: 1024 },
      ]);
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('autorisé');
    });

    it('should return 400 when file exceeds 10MB', async () => {
      const formData = createFormData(validFields, [
        { name: 'huge.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024 },
      ]);
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('10 Mo');
    });

    it('should accept allowed MIME types (image/jpeg, image/png, application/pdf)', async () => {
      const formData = createFormData(validFields, [
        { name: 'photo.jpg', type: 'image/jpeg', size: 1024 },
      ]);
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(200);
    });
  });

  // ── Happy path ────────────────────────────────────────

  describe('happy path', () => {
    it('should upsert contact, create message, and send 2 emails', async () => {
      const formData = createFormData(validFields);
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Contact upserted
      expect(prisma.contact.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'john@example.com' },
          create: expect.objectContaining({ email: 'john@example.com', name: 'John Doe' }),
        }),
      );

      // Message created
      expect(prisma.contactMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'john@example.com',
            subject: 'Test Subject',
            message: 'Hello, this is a test message.',
          }),
        }),
      );

      // 2 emails sent (admin notification + user confirmation)
      expect(transporter.sendMail).toHaveBeenCalledTimes(2);
    });
  });

  // ── Server error ──────────────────────────────────────

  describe('error handling', () => {
    it('should return 500 on unexpected server error', async () => {
      (prisma.contact.upsert as jest.Mock).mockRejectedValue(new Error('DB crashed'));

      const formData = createFormData(validFields);
      const req = createRequest(formData);
      const res = await POST(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain('Erreur');
    });
  });
});
