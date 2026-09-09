import { getAdminDb } from '../_lib/firebaseAdmin.js';
import { runAlertMatcher } from '../_lib/alertMatcher.js';

// Unlike /api/cron/scrape, this endpoint never talks to tibia.com — it only
// re-checks already-stored auctions against saved filters, so it's safe to
// run frequently from the cloud (GitHub Actions, Vercel Cron) without
// hitting tibia.com's IP block. This is what makes the "alert me when an
// auction has less than X minutes left and is still underpriced" alerts
// actually work, since that condition can become true well after the
// auction was first scraped.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (process.env.VERCEL_ENV === 'production') {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const db = getAdminDb();
  const nowIso = new Date().toISOString();

  try {
    const snap = await db.collection('auctions').where('auctionEndIso', '>', nowIso).get();
    const auctions = snap.docs.map((d) => d.data());

    const { notified } = await runAlertMatcher(auctions, { now: Date.now() });

    res.status(200).json({ activeAuctionsChecked: auctions.length, notified });
  } catch (err) {
    console.error('check-alerts failed:', err);
    res.status(500).json({ error: err.message });
  }
}
