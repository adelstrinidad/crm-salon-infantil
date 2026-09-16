// Outgoing email. Resend's HTTP API is called with plain `fetch` — no SDK
// dependency for a single POST.
//
// Configuration (.env): RESEND_API_KEY + MAIL_FROM (e.g. "Salón Infantil
// <no-reply@tu-dominio.com>", a domain verified in Resend).
//
// Unconfigured, the message is logged to the server console instead of being
// sent. That keeps local development working with no account, and makes a
// misconfigured production install loud in the logs rather than silently
// dropping mail. Callers never learn whether delivery happened — the reset
// flow always answers the user the same way, so the form cannot be used to
// discover which addresses exist.
export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type MailOutcome = { delivered: boolean; reason?: string };

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendMail(message: MailMessage): Promise<MailOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[mail] RESEND_API_KEY/MAIL_FROM not set — message not sent.\n` +
        `       to: ${message.to}\n       subject: ${message.subject}\n${message.text}`
    );
    return { delivered: false, reason: "not-configured" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text }),
    });

    if (!res.ok) {
      // Body may carry the provider's reason; it never contains the API key.
      console.error(`[mail] send failed (${res.status}): ${await res.text()}`);
      return { delivered: false, reason: `http-${res.status}` };
    }

    // Confirm the hand-off explicitly — "no log line" is a bad success signal
    // when you are trying to tell a working install from an unconfigured one.
    // The provider's message id is logged; the recipient address is not.
    const id = await res
      .json()
      .then((body: { id?: string }) => body?.id)
      .catch(() => undefined);
    console.info(`[mail] sent${id ? ` (id ${id})` : ""}: ${message.subject}`);
    return { delivered: true };
  } catch (err) {
    console.error("[mail] send threw:", err);
    return { delivered: false, reason: "exception" };
  }
}
