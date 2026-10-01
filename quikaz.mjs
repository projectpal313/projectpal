// QuikAz AI function. Keeps your AI key secret on the server.
const MODELS = { '1': 'claude-haiku-4-5-20251001', '1.5': 'claude-sonnet-5-5', '2.5': 'claude-opus-5-5' };
const SB = process.env.SUPABASE_URL || 'https://qhcponrxumfnomkgverb.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoY3BvbnJ4dW1mbm9ta2d2ZXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMDMyNzUsImV4cCI6MjEwNTc3OTI3NX0.PWiYx_f-yPLgdCQRz12cU4IazliOhb6W7klWTnGqT_U';
const KIND = {
  quick: 'Give a short, direct answer.',
  essay: 'Write a well-structured academic essay with an introduction, body and conclusion.',
  research: 'Give a research-style answer with background, key ideas and suggested sources. Only name real, well-known sources and say when unsure.',
  science: 'Explain scientifically with clear steps, units and formulas.',
  calc: 'Solve step by step and show the working.',
  case: 'Analyse the case: context, issues, options and a recommendation.',
  report: 'Write in a clear academic report style with headings.',
  summary: 'Summarise the text accurately and briefly.',
  image: 'The text was read from a student\'s image of notes or a diagram. Interpret it and answer.'
};
const TASK = {
  brainstorm: 'Give topic outlines, thesis ideas and literature angles.',
  audit: 'Review the text for logical flow and citation problems. List the issues, then suggest fixes.',
  expand: 'Expand the answer in much more depth.'
};
const json = (o, s = 200) => Response.json(o, { status: s });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Not allowed.' }, 405);
  const tok = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const u = tok && await fetch(SB + '/auth/v1/user', { headers: { apikey: ANON, Authorization: 'Bearer ' + tok } }).catch(() => null);
  if (!u || !u.ok) return json({ error: 'Please log in again to use QuikAz.' }, 401);
  let p; try { p = await req.json(); } catch (e) { return json({ error: 'Bad request.' }, 400); }
  const text = String(p.text || '').slice(0, 12000);
  if (!text.trim()) return json({ error: 'Type a question first.' }, 400);
  const system = 'You are QuikAz, an academic assistant for university students. ' + (KIND[p.kind] || KIND.quick) + ' ' + (TASK[p.task] || '') +
    (p.mode === 'advanced' ? ' Be in-depth with background context.' : ' Be concise and direct.') +
    ' Format with Markdown (## headings, - lists, | tables |). Write maths in LaTeX between $ signs. Never invent citations. Help the student understand.';
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODELS[p.model] || MODELS['1.5'], max_tokens: p.mode === 'advanced' || p.task === 'expand' ? 3000 : 1500, system, messages: [{ role: 'user', content: text }] })
  }).catch(() => null);
  if (!r || !r.ok) return json({ error: 'The AI is not available right now. Try again soon.' }, 502);
  const d = await r.json();
  return json({ answer: (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n') });
};
