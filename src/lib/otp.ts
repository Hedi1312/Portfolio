import { generateSecret, generateURI, verifySync } from 'otplib';

/**
 * Locally mapped authenticator to preserve legacy signatures
 * while using ESM-compatible functional exports from otplib v13.
 */
const authenticator = {
  verify: (params: { token: string; secret: string; window?: number }) => {
    return verifySync({
      token: params.token,
      secret: params.secret,
      epochTolerance: params.window || 0,
    });
  },
  generateSecret: () => generateSecret(),
  keyuri: (label: string, issuer: string, secret: string) => {
    return generateURI({
      label,
      issuer,
      secret,
    });
  },
};

/**
 * Synchronously verify a TOTP token against a secret.
 * Mirrors otplib's verifySync API: returns { valid: boolean }
 */
export function verifyOTP(params: { token: string; secret: string; window?: number }): {
  valid: boolean;
} {
  try {
    const result = authenticator.verify(params);
    return { valid: result.valid };
  } catch (_err) {
    return { valid: false };
  }
}

/**
 * Generate a new TOTP secret.
 */
export function generateOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate the otpauth:// URI for QR code generation.
 */
export function generateOTPUri(params: { label: string; issuer: string; secret: string }): string {
  return authenticator.keyuri(params.label, params.issuer, params.secret);
}
