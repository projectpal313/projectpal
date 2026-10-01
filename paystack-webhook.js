// Backup unlock: Paystack calls this even if the student closes the page after paying.
// Paystack dashboard > Settings > API Keys & Webhooks > Webhook URL:
//   https://YOUR-SITE.netlify.app/.netlify/functions/paystack-webhook
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PRICE_KOBO = 2500000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function handler(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body || '');
  const sig = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(raw).digest('hex');
  if (sig !== event.headers['x-paystack-signature']) return { statusCode: 401, body: 'Bad signature' };

  const ev = JSON.parse(raw);
  const d = ev.data;
  if (ev.event === 'charge.success' && d && d.status === 'success' && d.currency === 'NGN' && d.amount >= PRICE_KOBO && d.metadata && d.metadata.user_id) {
    await supabase.from('user_access').upsert({ user_id: d.metadata.user_id, paid: true, reference: d.reference, amount: d.amount, paid_at: new Date().toISOString() });
  }
  return { statusCode: 200, body: 'ok' };
}
