/**
 * NextAuth mock for both server-side (auth function) and client-side (useSession, signIn).
 */

// Server-side: mock the auth() function from @/lib/auth
export const auth = jest.fn();
export const signIn = jest.fn();
export const signOut = jest.fn();
export const handlers = { GET: jest.fn(), POST: jest.fn() };
