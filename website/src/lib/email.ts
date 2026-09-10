import { Resend } from "resend";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromAddress = process.env.EMAIL_FROM?.trim() || "GhostSweep <alerts@ghostsweeper.info>";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const data = await resend.emails.send({
        from: fromAddress.includes("@") ? fromAddress : "GhostSweep <onboarding@resend.dev>",
        to: [to.trim().toLowerCase()],
        subject,
        html,
        text: text || subject,
      });

      if (data.error) {
        console.warn("[Email Service] Resend returned error:", data.error);
        return { success: false, error: data.error.message };
      }

      console.log("[Email Service] Successfully sent email via Resend to:", to, "ID:", data.data?.id);
      return { success: true, id: data.data?.id };
    } catch (err: any) {
      console.error("[Email Service] Exception sending via Resend:", err.message);
      return { success: false, error: err.message };
    }
  }

  console.log("[Email Service (Dev/Fallback)]", { to, subject });
  return { success: true, id: "sim_" + Date.now() };
}

export async function sendMagicLinkEmail(email: string, token: string, baseUrl: string = "https://www.ghostsweeper.info") {
  const loginUrl = `${baseUrl}/?auth_token=${token}&email=${encodeURIComponent(email)}`;
  const subject = "🔐 Your GhostSweep Login Link";
  const html = `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#09090b;color:#fff;border-radius:16px;"><h2 style="color:#38bdf8;text-align:center;">ghostsweep.info</h2><p style="text-align:center;color:#a1a1aa;">Click below to access your account:</p><div style="text-align:center;margin:24px 0;"><a href="${loginUrl}" style="background:#38bdf8;color:#09090b;padding:12px 24px;font-weight:bold;text-decoration:none;border-radius:8px;">Access My Audits →</a></div></div>`;
  return sendEmail({ to: email, subject, html, text: `Your login link: ${loginUrl}` });
}

export async function sendPurchaseConfirmationEmail(email: string, targetUsername: string, isPro: boolean = false, baseUrl: string = "https://www.ghostsweeper.info") {
  const cleanTarget = targetUsername.replace(/^@/, "").toLowerCase();
  const reportUrl = `${baseUrl}/?username=${cleanTarget}&unlocked=true&plan=${isPro ? "unlimited" : "standard"}`;
  const subject = `🔓 Report Unlocked: @${cleanTarget} (Full Access)`;
  const html = `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#09090b;color:#fff;border-radius:16px;"><h2 style="color:#38bdf8;text-align:center;">ghostsweep.info</h2><p style="color:#34d399;text-align:center;font-weight:bold;">✓ Payment Confirmed</p><p style="text-align:center;">Full audit access for <strong>@${cleanTarget}</strong> is now unlocked.</p><div style="text-align:center;margin:24px 0;"><a href="${reportUrl}" style="background:#38bdf8;color:#09090b;padding:12px 24px;font-weight:bold;text-decoration:none;border-radius:8px;">View Unlocked Report →</a></div></div>`;
  return sendEmail({ to: email, subject, html, text: `Report unlocked for @${cleanTarget}: ${reportUrl}` });
}

export async function sendNewFollowAlertEmail(
  email: string,
  targetUsername: string,
  newFollows: Array<{ username: string; name?: string; avatar?: string }>,
  baseUrl: string = "https://www.ghostsweeper.info"
) {
  const cleanTarget = targetUsername.replace(/^@/, "").toLowerCase();
  const reportUrl = `${baseUrl}/?username=${cleanTarget}&forceRefresh=true`;
  const count = newFollows.length;
  const subject = `🚨 GhostSweep Alert: @${cleanTarget} followed ${count} new account${count > 1 ? "s" : ""}`;
  const listHtml = newFollows.slice(0, 5).map((a, i) => `<div style="padding:8px;background:#18181b;margin-bottom:6px;border-radius:8px;"><strong>#${i + 1} @${a.username}</strong> ${a.name ? `(${a.name})` : ""}</div>`).join("");
  const html = `<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#09090b;color:#fff;border-radius:16px;"><h2 style="color:#ef4444;text-align:center;">🚨 New Follow Activity Detected</h2><p style="text-align:center;">@${cleanTarget} just followed ${count} new account(s):</p><div style="margin:16px 0;">${listHtml}</div><div style="text-align:center;margin:24px 0;"><a href="${reportUrl}" style="background:#38bdf8;color:#09090b;padding:12px 24px;font-weight:bold;text-decoration:none;border-radius:8px;">View Full Audit →</a></div></div>`;
  return sendEmail({ to: email, subject, html, text: `@${cleanTarget} followed ${count} new account(s): ${reportUrl}` });
}