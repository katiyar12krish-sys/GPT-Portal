// Loads .env.local / .env for CLI scripts (Next loads them itself for the app).
import fs from 'node:fs';
for (const f of ['.env.local', '.env']) {
  if (fs.existsSync(f)) {
    try {
      (process as any).loadEnvFile(f);
    } catch {
      /* older Node: set variables in your shell instead */
    }
  }
}
