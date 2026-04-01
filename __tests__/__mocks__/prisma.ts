/**
 * Prisma mock — uses Jest manual mocking.
 *
 * Every model method is auto-mocked via jest.fn().
 * Tests can override return values per-test with mockResolvedValue/mockRejectedValue.
 */

const mockPrisma = {
  admin: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  passwordReset: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  },
  contact: {
    upsert: jest.fn(),
  },
  contactMessage: {
    create: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  rateLimit: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

export { mockPrisma as prisma };
