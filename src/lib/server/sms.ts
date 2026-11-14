/**
 * SMS sender. Uses Fast2SMS (India) if FAST2SMS_API_KEY is set.
 * In development (no key) the message is printed to the server console only.
 * In production with no provider configured, sending fails loudly instead of pretending.
 */
export async function sendSms(mobile: string, message: string): Promise<boolean> {
  const key = process.env.FAST2SMS_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV SMS -> ${mobile}] ${message}`);
      return true;
    }
    console.error('SMS provider not configured (FAST2SMS_API_KEY).');
    return false;
  }
  try {
    const r = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: { authorization: key, 'content-type': 'application/json' },
      body: JSON.stringify({ route: 'q', message, numbers: mobile.replace(/\D/g, '').slice(-10) }),
    });
    const j: any = await r.json().catch(() => ({}));
    return r.ok && j.return !== false;
  } catch (e) {
    console.error('SMS send failed', e);
    return false;
  }
}
