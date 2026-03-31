import '@testing-library/jest-dom';

// Prevent error "Not implemented: window.scrollTo" from jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(global.window, 'scrollTo', { value: jest.fn() });
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    contact: { upsert: jest.fn() },
    contactMessage: { create: jest.fn() },
    aboutMe: { findFirst: jest.fn() },
    cv: { findFirst: jest.fn() },
    project: { findMany: jest.fn() },
  },
}));
