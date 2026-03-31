/**
 * Centralized OTP utilities.
 *
 * otplib is imported via require() due to known ESM/async compatibility issues
 * with the library in Next.js server-side contexts. This module centralizes
 * the workaround to a single location instead of scattering require() calls
 * across 5 different files.
 */

// otplib must be imported via require() due to ESM/async compatibility issues
// in Next.js server-side contexts. This is the only file that contains this workaround.
const otplib = globalThis.require('otplib');

/**
 * Synchronously verify a TOTP token against a secret.
 * Mirrors otplib's verifySync API: returns { valid: boolean }
 */
export function verifyOTP(params: { token: string; secret: string; window?: number }): {
  valid: boolean;
} {
  return otplib.verifySync(params);
}

/**
 * Generate a new TOTP secret.
 */
export function generateOTPSecret(): string {
  return otplib.generateSecret();
}

/**
 * Generate the otpauth:// URI for QR code generation.
 */
export function generateOTPUri(params: { label: string; issuer: string; secret: string }): string {
  return otplib.generateURI(params);
}
