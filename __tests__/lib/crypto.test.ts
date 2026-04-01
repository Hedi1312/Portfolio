/**
 * Unit tests for src/lib/crypto.ts — AES-256-GCM encryption/decryption.
 *
 * These tests verify the core cryptographic functions that protect
 * OTP secrets at rest. A regression here would expose all 2FA secrets.
 */

import { encrypt, decrypt } from '@/lib/crypto';

// Valid 256-bit key (64 hex chars)
const VALID_KEY = 'a'.repeat(64);

describe('crypto — AES-256-GCM', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OTP_ENCRYPTION_KEY: VALID_KEY };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ── Format ──────────────────────────────────────────────

  describe('encrypt()', () => {
    it('should return a string in iv:authTag:ciphertext format (3 hex segments)', () => {
      const result = encrypt('my-secret');
      const parts = result.split(':');

      expect(parts).toHaveLength(3);
      // Each part should be valid hex
      parts.forEach((part) => {
        expect(part).toMatch(/^[0-9a-f]+$/i);
      });
    });

    it('should produce a 24-char hex IV (12 bytes = 96-bit)', () => {
      const result = encrypt('test');
      const iv = result.split(':')[0];

      expect(iv).toHaveLength(24); // 12 bytes × 2 hex chars
    });

    it('should produce a 32-char hex auth tag (16 bytes = 128-bit)', () => {
      const result = encrypt('test');
      const authTag = result.split(':')[1];

      expect(authTag).toHaveLength(32); // 16 bytes × 2 hex chars
    });
  });

  // ── Roundtrip ───────────────────────────────────────────

  describe('encrypt() → decrypt() roundtrip', () => {
    it('should return the original plaintext after encrypt then decrypt', () => {
      const plaintext = 'JBSWY3DPEHPK3PXP';
      expect(decrypt(encrypt(plaintext))).toBe(plaintext);
    });

    it('should handle empty string', () => {
      expect(decrypt(encrypt(''))).toBe('');
    });

    it('should handle unicode characters', () => {
      const unicode = '日本語テスト 🔐';
      expect(decrypt(encrypt(unicode))).toBe(unicode);
    });

    it('should handle long strings', () => {
      const longString = 'x'.repeat(10_000);
      expect(decrypt(encrypt(longString))).toBe(longString);
    });
  });

  // ── Unique IV ───────────────────────────────────────────

  describe('IV uniqueness', () => {
    it('should produce different ciphertexts for the same plaintext (random IV)', () => {
      const a = encrypt('same-input');
      const b = encrypt('same-input');

      expect(a).not.toBe(b);
    });
  });

  // ── Key validation ──────────────────────────────────────

  describe('key validation', () => {
    it('should throw when OTP_ENCRYPTION_KEY is missing', () => {
      delete process.env.OTP_ENCRYPTION_KEY;
      expect(() => encrypt('test')).toThrow('OTP_ENCRYPTION_KEY');
    });

    it('should throw when OTP_ENCRYPTION_KEY is too short', () => {
      process.env.OTP_ENCRYPTION_KEY = 'abc123';
      expect(() => encrypt('test')).toThrow('64-character hex string');
    });

    it('should throw when OTP_ENCRYPTION_KEY is too long', () => {
      process.env.OTP_ENCRYPTION_KEY = 'a'.repeat(128);
      expect(() => encrypt('test')).toThrow('64-character hex string');
    });
  });

  // ── Tamper detection (GCM integrity) ────────────────────

  describe('GCM integrity', () => {
    it('should throw when ciphertext is tampered with', () => {
      const encrypted = encrypt('secret');
      const parts = encrypted.split(':');

      // Flip a character in the ciphertext
      const tampered = parts[2].replace(/[0-9a-f]/, (c) => (c === '0' ? '1' : '0'));
      const tamperedValue = `${parts[0]}:${parts[1]}:${tampered}`;

      expect(() => decrypt(tamperedValue)).toThrow();
    });

    it('should throw when auth tag is tampered with', () => {
      const encrypted = encrypt('secret');
      const parts = encrypted.split(':');

      const tamperedTag = parts[1].replace(/[0-9a-f]/, (c) => (c === '0' ? '1' : '0'));
      const tamperedValue = `${parts[0]}:${tamperedTag}:${parts[2]}`;

      expect(() => decrypt(tamperedValue)).toThrow();
    });
  });

  // ── Malformed input ─────────────────────────────────────

  describe('malformed input to decrypt()', () => {
    it('should throw when format has too few segments', () => {
      expect(() => decrypt('onlyone')).toThrow('Invalid encrypted value format');
    });

    it('should throw when format has too many segments', () => {
      expect(() => decrypt('a:b:c:d')).toThrow('Invalid encrypted value format');
    });

    it('should throw for empty string', () => {
      expect(() => decrypt('')).toThrow();
    });
  });
});
