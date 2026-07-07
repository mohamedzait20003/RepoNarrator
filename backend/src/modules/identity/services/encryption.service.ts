import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce, the GCM standard
const KEY_HEX_LENGTH = 64; // 32 bytes -> AES-256

/**
 * Symmetric encryption for secrets at rest — currently the stored GitHub OAuth
 * token (`users.github_oauth_token_enc`). Lives inside the identity module
 * because that's the only owner of the ciphertext; expose it via a contract
 * (like `TOKEN_SERVICE`) only if another module ever needs it directly.
 *
 * Uses AES-256-GCM, which is authenticated: tampering with the ciphertext is
 * detected on decrypt. Each call uses a fresh random IV. The serialized form is
 * `iv:authTag:ciphertext`, all base64.
 *
 * The 32-byte key comes from `TOKEN_ENCRYPTION_KEY` (64 hex chars). The service
 * fails fast at construction if the key is missing or malformed.
 */
@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const hex = config.get<string>('auth.tokenEncryptionKey') ?? '';
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error(
        `TOKEN_ENCRYPTION_KEY must be ${KEY_HEX_LENGTH} hex characters (32 bytes) for AES-256.`,
      );
    }
    this.key = Buffer.from(hex, 'hex');
  }

  /** Encrypts UTF-8 plaintext, returning `iv:authTag:ciphertext` (base64). */
  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext.toString('base64'),
    ].join(':');
  }

  /** Reverses {@link encrypt}. Throws if the payload was tampered with. */
  decrypt(payload: string): string {
    const [ivB64, tagB64, dataB64] = payload.split(':');
    if (!ivB64 || !tagB64 || !dataB64) {
      throw new Error('Malformed encrypted payload.');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(ivB64, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }

  /** Constant-time comparison helper for equal-length secrets. */
  safeEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
  }
}
