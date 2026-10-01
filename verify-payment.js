import { createClient } from '@supabase/supabase-js';

const PRICE_KOBO = 2500000; // N25,000
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const H = { 'Content-Type': 'application/json' };
const out = (code, obj) => ({ statusCode: code, headers: H, body: JSON.stringify(obj) });

export async function handler(event) {
  if (event.httpMethod !== 'POST') return out(405, { error: 'Method not allowed' });
  try {
    const token = (event.headers.authorization || '').replace('Bearer ', '');
    const { data: u } = await supabase.auth.getUser(token);
    if (!u || !u.user) return out(401, { error: 'Please log in again.' });

    const { reference } = JSON.parse(event.body || '{}');
    if (!reference) return out(400, { error: 'Missing payment reference.' });

    const r = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference), {
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY }
    });
    const j = await r.json();
    const d = j.data;
    if (!j.status || !d || d.status !== 'success' || d.currency !== 'NGN' || d.amount < PRICE_KOBO) {
      return out(402, { error: 'Payment not confirmed yet.' });
    }
    if (!d.metadata || d.metadata.user_id !== u.user.id) return out(403, { error: 'This payment belongs to another account.' });

    const { error } = await supabase.from('user_access').upsert({ user_id: u.user.id, paid: true, reference, amount: d.amount, paid_at: new Date().toISOString() });
    if (error) return out(500, { error: 'Could not unlock your account. Contact support with your reference: ' + reference });
    return out(200, { success: true });
  } catch (e) {
    return out(500, { error: 'Something went wrong. Try again.' });
  }
}
