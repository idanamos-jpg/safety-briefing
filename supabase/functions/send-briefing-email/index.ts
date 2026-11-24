// Supabase Edge Function: send-briefing-email
// שולח את ה-PDF של תדריך סגור לנמענים דרך Resend.
// סודות נדרשים (Project Settings → Edge Functions → Secrets):
//   RESEND_API_KEY  — מפתח מ-resend.com
//   MAIL_FROM       — למשל: "תדריך בטיחות <safety@your-domain.co.il>" (דומיין מאומת ב-Resend)
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const RESEND = Deno.env.get("RESEND_API_KEY");
  const FROM = Deno.env.get("MAIL_FROM");
  if (!RESEND || !FROM) return json({ status: "not_configured" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("Authorization") ?? "";

  // לקוח בהרשאות המשתמש — RLS מבטיח שרק בעל התדריך יכול לשלוח אותו
  const userDb = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const admin = createClient(url, service);

  let body: { briefing_id?: string; pdf_base64?: string; filename?: string };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
  const { briefing_id, pdf_base64, filename } = body;
  if (!briefing_id || !pdf_base64) return json({ error: "missing_fields" }, 400);
  if (pdf_base64.length > 14_000_000) return json({ error: "pdf_too_large" }, 413);

  const { data: b, error } = await userDb
    .from("briefings")
    .select("id,status,recipients,briefing_date,foreman_name,manager_name,sites(name)")
    .eq("id", briefing_id)
    .single();
  if (error || !b) return json({ error: "not_found_or_forbidden" }, 403); // לא 404 — הלקוח מפרש 404 כ"לא הוגדר"
  if (b.status !== "closed") return json({ error: "briefing_not_closed" }, 400);
  const to: string[] = b.recipients ?? [];
  if (!to.length) {
    await admin.from("briefings").update({ email_status: "no_recipients", email_error: null }).eq("id", b.id);
    return json({ status: "no_recipients" });
  }

  // deno-lint-ignore no-explicit-any
  const siteName = (b as any).sites?.name ?? "";
  const [y, m, d] = String(b.briefing_date).split("-");
  const dateIL = `${d}.${m}.${y}`;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to,
      subject: `תדריך בטיחות — ${siteName} — ${dateIL}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif">
        <p>שלום,</p>
        <p>מצורף תדריך הבטיחות היומי שנסגר באתר <b>${esc(siteName)}</b> בתאריך ${dateIL}.</p>
        <p>מנהל עבודה מתדרך: ${esc(b.foreman_name ?? "")}<br>אושר ונסגר ע"י: ${esc(b.manager_name ?? "")}</p>
        <p style="color:#777;font-size:12px">הודעה זו נשלחה אוטומטית ממערכת תדריכי הבטיחות.</p></div>`,
      attachments: [{ filename: filename || `briefing-${dateIL}.pdf`, content: pdf_base64 }],
    }),
  });

  if (!res.ok) {
    const txt = (await res.text()).slice(0, 300);
    await admin.from("briefings").update({ email_status: "failed", email_error: txt }).eq("id", b.id);
    return json({ status: "failed", error: txt }, 502);
  }
  await admin.from("briefings").update({ email_status: "sent", email_error: null }).eq("id", b.id);
  return json({ status: "sent" });
});
