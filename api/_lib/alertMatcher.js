import { getAdminDb, getAdminMessaging } from './firebaseAdmin.js';
import { matchesFilters, encodeCriteriaParam } from '../../src/lib/filters.js';
import { sendAlertEmail } from './email.js';

const MAX_NOTIFICATIONS_PER_FILTER_PER_RUN = 20;
const SITE_URL = process.env.SITE_URL || 'https://tibia-bazaar.vercel.app';

/**
 * Checks freshly scraped (or currently active) auctions against every saved
 * alert filter and notifies (push and/or email) once per (filter, auction)
 * pair. Reads the whole "already notified" set for a filter in one query
 * instead of one Firestore read per matching auction — with a broad filter
 * that can match hundreds of auctions, per-match reads/writes made this
 * endpoint time out.
 */
export async function runAlertMatcher(auctions, { now = Date.now() } = {}) {
  if (auctions.length === 0) return { notified: 0 };

  const db = getAdminDb();
  const messaging = getAdminMessaging();

  const filtersSnap = await db.collection('savedFilters').get();
  if (filtersSnap.empty) return { notified: 0 };

  let notified = 0;

  for (const filterDoc of filtersSnap.docs) {
    const filter = filterDoc.data();
    const matches = auctions.filter((a) => matchesFilters(a, filter.criteria || {}, { now }));
    if (matches.length === 0) continue;

    const notifiedRef = db.collection('savedFilters').doc(filterDoc.id).collection('notifiedAuctions');
    const notifiedSnap = await notifiedRef.select().get();
    const alreadyNotified = new Set(notifiedSnap.docs.map((d) => d.id));

    const newMatches = matches
      .filter((a) => !alreadyNotified.has(String(a.auctionId)))
      .slice(0, MAX_NOTIFICATIONS_PER_FILTER_PER_RUN);
    if (newMatches.length === 0) continue;

    await Promise.all(
      newMatches.map(async (auction) => {
        const notifiedDocId = String(auction.auctionId);

        await Promise.all([
          notifiedRef.doc(notifiedDocId).set({
            notifiedAt: new Date().toISOString(),
            auctionName: auction.name,
          }),
          sendPush(messaging, filter, auction, now),
          sendEmail(filter, auction),
        ]);

        notified += 1;
      })
    );
  }

  return { notified };
}

async function sendPush(messaging, filter, auction, now) {
  if (!filter.pushToken) return;
  try {
    const minutesLeft = auction.auctionEndIso
      ? Math.max(0, Math.round((new Date(auction.auctionEndIso).getTime() - now) / 60000))
      : null;
    const timeInfo = minutesLeft != null ? ` · faltam ${minutesLeft} min` : '';
    // Points back at OUR bazaar, pre-filtered with this alert's own
    // criteria, so clicking the notification shows exactly the matching
    // characters instead of just the one auction that triggered it.
    const link = `${SITE_URL}/?f=${encodeCriteriaParam(filter.criteria || {})}`;
    await messaging.send({
      token: filter.pushToken,
      notification: {
        title: `${auction.name} bate com "${filter.name || 'seu filtro'}"`,
        body: `Level ${auction.level} ${auction.vocation} em ${auction.world} — bid ${auction.bid} TC${timeInfo}`,
      },
      data: { link },
      webpush: { fcmOptions: { link } },
    });
  } catch (err) {
    console.error(`Push falhou para leilão ${auction.auctionId}:`, err.message);
  }
}

async function sendEmail(filter, auction) {
  if (!filter.email) return;
  try {
    await sendAlertEmail({ to: filter.email, auction, filterName: filter.name || 'seu filtro salvo' });
  } catch (err) {
    console.error(`E-mail falhou para leilão ${auction.auctionId}:`, err.message);
  }
}
