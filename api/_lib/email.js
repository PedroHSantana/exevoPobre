import { Resend } from 'resend';

let resendClient = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY env var is not set');
  }
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendAlertEmail({ to, auction, filterName }) {
  const resend = getResend();
  const fromAddress = process.env.ALERT_EMAIL_FROM || 'Tibia Bazaar Finder <alerts@resend.dev>';

  await resend.emails.send({
    from: fromAddress,
    to,
    subject: `Novo leilão bate com "${filterName}": ${auction.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>${auction.name}</h2>
        <p>Level ${auction.level} · ${auction.vocation} · Mundo ${auction.world}</p>
        <p><strong>Bid atual:</strong> ${auction.bid ?? '—'}</p>
        <p><a href="${auction.officialUrl}">Ver leilão no bazar oficial do Tibia</a></p>
        <hr />
        <p style="color:#888; font-size:12px;">Você recebeu este e-mail porque salvou o filtro "${filterName}" no Tibia Bazaar Finder.</p>
      </div>
    `,
  });
}
