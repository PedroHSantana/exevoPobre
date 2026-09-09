import { getAdminDb } from '../_lib/firebaseAdmin.js';
import { fetchAuctionPages, ORDER_COLUMN, totalPages } from '../../src/lib/tibiaClient.js';
import { runAlertMatcher } from '../_lib/alertMatcher.js';

const PAGES_PER_TICK = 6;
const PRIORITY_PAGES = 1; // always re-scrape page 1 (ending soonest) every tick

async function loadCursor(db) {
  const doc = await db.collection('scrapeState').doc('cursor').get();
  return doc.exists ? doc.data() : { nextPage: 1, knownTotalPages: 1 };
}

async function saveCursor(db, cursor) {
  await db.collection('scrapeState').doc('cursor').set(cursor);
}

async function upsertAuctions(db, auctions) {
  const now = new Date().toISOString();
  const batchSize = 400; // Firestore batch write limit is 500 ops
  for (let i = 0; i < auctions.length; i += batchSize) {
    const batch = db.batch();
    for (const auction of auctions.slice(i, i + batchSize)) {
      const ref = db.collection('auctions').doc(String(auction.auctionId));
      batch.set(ref, { ...auction, lastSeenAt: now }, { merge: true });
    }
    await batch.commit();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Vercel Cron requests carry this header; reject direct calls in production.
  if (process.env.VERCEL_ENV === 'production') {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const db = getAdminDb();
  const cursor = await loadCursor(db);

  const pagesToFetch = new Set();
  for (let p = 1; p <= PRIORITY_PAGES; p++) pagesToFetch.add(p);

  let nextPage = cursor.nextPage || 1;
  for (let i = 0; i < PAGES_PER_TICK; i++) {
    pagesToFetch.add(nextPage);
    nextPage += 1;
    if (nextPage > (cursor.knownTotalPages || 1)) nextPage = 1;
  }

  try {
    const { auctions, totalResults } = await fetchAuctionPages([...pagesToFetch], {
      orderColumn: ORDER_COLUMN.END_DATE,
      orderDirection: 1,
    });

    await upsertAuctions(db, auctions);

    const knownTotalPages = totalResults ? totalPages(totalResults) : cursor.knownTotalPages || 1;
    await saveCursor(db, { nextPage, knownTotalPages, lastRunAt: new Date().toISOString() });

    const { notified } = await runAlertMatcher(auctions);

    res.status(200).json({
      pagesFetched: [...pagesToFetch],
      auctionsUpserted: auctions.length,
      totalResults,
      knownTotalPages,
      notified,
    });
  } catch (err) {
    console.error('Scrape cron failed:', err);
    res.status(500).json({ error: err.message });
  }
}
