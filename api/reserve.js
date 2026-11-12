// Vercel serverless function: Reservation → E-Mail an Restaurant + Bestätigung an Gast (via Resend)
const RESTAURANT = 'info@lavista-arosa.ch';
const PHONE = '+41 77 940 52 08';

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function clean(s, n) { return String(s || '').trim().slice(0, n); }

async function send(key, mail) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  });
  if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()));
}

function wrap(inner) {
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#111">
<div style="text-align:center;border-bottom:2px solid #EC008C;padding:18px 0 12px">
<div style="font-size:12px;letter-spacing:3px;color:#666">RISTORANTE · PIZZERIA</div>
<div style="font-size:28px;letter-spacing:6px;color:#EC008C;font-weight:bold">LA VISTA</div></div>
<div style="padding:22px 6px;font-size:16px;line-height:1.5">${inner}</div>
<div style="border-top:1px solid #ddd;padding:12px 0;font-size:13px;color:#666;text-align:center">
Ristorante Pizzeria La Vista · im Hotel Cristallo · Poststrasse 103 · 7050 Arosa<br>
${PHONE} · <a href="mailto:${RESTAURANT}" style="color:#EC008C">${RESTAURANT}</a> · <a href="https://www.lavista-arosa.ch" style="color:#EC008C">www.lavista-arosa.ch</a></div></div>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'not configured' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.botcheck) return res.status(200).json({ ok: true });
  const v = {
    name: clean(b.name, 100), tel: clean(b.tel, 40), email: clean(b.email, 120),
    date: clean(b.date, 10), time: clean(b.time, 5), pers: clean(b.pers, 3), msg: clean(b.msg, 1000),
  };
  const de = b.lang !== 'en';
  if (!v.name || !v.tel || !v.date || !v.time || !v.pers || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }
  const [y, m, d] = v.date.split('-');
  const dd = `${d}.${m}.${y}`;

  const rows = [['Name', v.name], ['Telefon', v.tel], ['E-Mail', v.email], ['Datum', dd], ['Uhrzeit', v.time],
    ['Personen', v.pers], ['Bemerkung', v.msg || '–'], ['Sprache', de ? 'Deutsch' : 'English']]
    .map(([k, x]) => `<tr><td style="padding:4px 14px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><b>${esc(x)}</b></td></tr>`).join('');

  try {
    await send(key, {
      from: 'La Vista Website <reservation@lavista-arosa.ch>',
      to: [RESTAURANT],
      reply_to: v.email,
      subject: `Reservation ${dd} ${v.time} – ${v.pers} Pers. – ${v.name}`,
      html: wrap(`<p><b>Neue Reservationsanfrage über die Website</b></p><table>${rows}</table>
<p style="color:#666;font-size:14px">Der Gast hat automatisch eine Eingangsbestätigung erhalten. «Antworten» schreibt direkt an den Gast.</p>`),
    });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false });
  }

  const g = de
    ? { s: `Ihre Reservationsanfrage – La Vista Arosa, ${dd} um ${v.time}`,
        h: `<p>Guten Tag ${esc(v.name)}</p>
<p>Vielen Dank für Ihre Reservationsanfrage. Wir haben folgende Angaben erhalten:</p>
<p style="font-size:18px"><b>${dd} · ${esc(v.time)} Uhr · ${esc(v.pers)} Personen</b></p>
${v.msg ? `<p>Ihre Bemerkung: ${esc(v.msg)}</p>` : ''}
<p>Wir melden uns in Kürze, um Ihre Reservation zu bestätigen. Für Änderungen antworten Sie einfach auf diese E-Mail oder rufen Sie uns an: ${PHONE}.</p>
<p>Wir freuen uns auf Ihren Besuch!<br>Ihr Team La Vista</p>` }
    : { s: `Your booking request – La Vista Arosa, ${dd} at ${v.time}`,
        h: `<p>Hello ${esc(v.name)}</p>
<p>Thank you for your booking request. We have received the following details:</p>
<p style="font-size:18px"><b>${dd} · ${esc(v.time)} · ${esc(v.pers)} guests</b></p>
${v.msg ? `<p>Your message: ${esc(v.msg)}</p>` : ''}
<p>We will get back to you shortly to confirm your table. For changes, simply reply to this e-mail or call us: ${PHONE}.</p>
<p>We look forward to welcoming you!<br>Your La Vista team</p>` };
  try {
    await send(key, {
      from: 'Ristorante La Vista <info@lavista-arosa.ch>',
      to: [v.email],
      reply_to: RESTAURANT,
      subject: g.s,
      html: wrap(g.h),
    });
  } catch (e) { console.error(e); }

  return res.status(200).json({ ok: true });
};
