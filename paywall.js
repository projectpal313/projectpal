/* ProjectPal paywall: workspace pages stay locked until the student has paid.
   Add <script src="paywall.js"></script> inside <head> of any page that should be locked. */
(function () {
  var CFG = {
    url: 'https://qhcponrxumfnomkgverb.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoY3BvbnJ4dW1mbm9ta2d2ZXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMDMyNzUsImV4cCI6MjEwNTc3OTI3NX0.PWiYx_f-yPLgdCQRz12cU4IazliOhb6W7klWTnGqT_U',
    paystackKey: 'pk_test_a5281f0e364da4a6c92a54faaebf455db5412fb1',
    amount: 2500000, // in kobo = N25,000
    price: '\u20a625,000'
  };
  var sb, user, session;
  function load(src) { return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function unlock() { var g = document.getElementById('ppGate'); if (g) g.remove(); document.documentElement.style.overflow = ''; }
  function gate(html) {
    var g = document.getElementById('ppGate');
    if (!g) { g = document.createElement('div'); g.id = 'ppGate'; g.style.cssText = 'visibility:visible;position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:1rem;background:rgba(16,42,67,.6);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);font-family:system-ui,-apple-system,"Segoe UI",sans-serif'; document.body.appendChild(g); document.documentElement.style.overflow = 'hidden'; }
    g.innerHTML = '<div style="background:#fff;color:#334155;max-width:26rem;width:100%;border-radius:1.2rem;padding:2rem;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.35)">' + html + '</div>';
  }
  var btn = 'display:block;width:100%;margin-top:1rem;padding:.85rem;border:0;border-radius:.75rem;background:#0F766E;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;text-decoration:none';
  function showPay(msg) {
    gate('<h2 style="font-size:1.3rem;font-weight:800;color:#102A43">Access denied</h2><p style="margin-top:.6rem">You can look around, but you need to pay <b>' + CFG.price + '</b> once to use the workspace, resources and final chapter lab.</p><button id="ppPay" style="' + btn + '">Pay ' + CFG.price + '</button><button id="ppCheck" style="' + btn.replace('background:#0F766E;color:#fff', 'background:#fff;color:#0F766E;border:1px solid #0F766E') + '">I have already paid</button><a href="home.html" style="display:block;margin-top:1rem;font-size:.9rem;color:#0F766E">Back to Home</a><p id="ppMsg" style="margin-top:.8rem;font-size:.85rem;color:#B91C1C" role="alert">' + (msg || '') + '</p>');
    document.getElementById('ppPay').onclick = pay;
    document.getElementById('ppCheck').onclick = function () { check('We could not see your payment yet. Wait a minute and try again.'); };
  }
  function say(m) { var e = document.getElementById('ppMsg'); if (e) e.textContent = m; }
  async function check(failMsg) {
    try {
      var r = await sb.from('user_access').select('paid').eq('user_id', user.id).maybeSingle();
      if (r.data && r.data.paid) return unlock();
    } catch (e) {}
    showPay(failMsg);
  }
  async function pay() {
    say('');
    try { if (!window.PaystackPop) await load('https://js.paystack.co/v1/inline.js'); } catch (e) { return say('Could not load the payment window. Check your internet and try again.'); }
    var ref = 'PP' + Date.now() + user.id.slice(0, 6);
    window.PaystackPop.setup({
      key: CFG.paystackKey, email: user.email, amount: CFG.amount, currency: 'NGN', ref: ref,
      metadata: { user_id: user.id },
      callback: function (res) { confirm(res.reference); },
      onClose: function () {}
    }).openIframe();
  }
  async function confirm(ref) {
    say('Confirming your payment...');
    try {
      var r = await fetch('/.netlify/functions/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({ reference: ref }) });
      var j = await r.json();
      if (r.ok && j.success) return unlock();
      say(j.error || 'Payment not confirmed yet.');
    } catch (e) { say('Could not confirm yet. Tap "I have already paid" in a minute.'); }
  }
  async function start() {
    gate('<p>Checking your account...</p>');
    try {
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      sb = window.supabase.createClient(CFG.url, CFG.anon);
      var s = await sb.auth.getSession(); session = s.data && s.data.session;
      user = session && session.user;
    } catch (e) {}
    if (!user) return gate('<h2 style="font-size:1.3rem;font-weight:800;color:#102A43">Access denied</h2><p style="margin-top:.6rem">Log in with your account to use the workspace.</p><a href="login.html" style="' + btn + '">Go to login</a><a href="home.html" style="display:block;margin-top:1rem;font-size:.9rem;color:#0F766E">Back to Home</a>');
    check('');
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
