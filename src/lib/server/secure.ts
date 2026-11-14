import crypto from 'node:crypto';

/** Real AES-256-GCM. Key = 32 bytes, base64, from DATA_ENCRYPTION_KEY. */
function key(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  // Demo / preview mode only (no database): fixed local key so Aadhaar can still be stored encrypted.
  if (!raw && !process.env.DATABASE_URL) return crypto.createHash('sha256').update('gpt-demo-mode-local-key').digest();
  if (!raw) throw new Error('DATA_ENCRYPTION_KEY is not set. Generate: openssl rand -base64 32');
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) throw new Error('DATA_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  return buf;
}

export function encrypt(plain: string): string {
  if (!plain) return '';
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64'), enc.toString('base64'), c.getAuthTag().toString('base64')].join(':');
}

export function decrypt(blob: string): string {
  if (!blob) return '';
  const [v, iv, enc, tag] = blob.split(':');
  if (v !== 'v1') throw new Error('Unknown ciphertext version');
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(enc, 'base64')), d.final()]).toString('utf8');
}

export function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export function randomOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function randomPassword(len = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[crypto.randomInt(chars.length)];
  return out + '#7';
}

export function maskAadhar(n: string): string {
  const d = n.replace(/\D/g, '');
  return d.length >= 4 ? `XXXX-XXXX-${d.slice(-4)}` : 'XXXX-XXXX-XXXX';
}
