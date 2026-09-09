import { getAdminDb, getAdminMessaging } from './firebaseAdmin.js';
import { matchesFilters } from '../../src/lib/filters.js';
import { sendAlertEmail } from './email.js';

/**
 * Checks freshly scraped auctions against every saved alert filter and
 * notifies (push and/or email) once per (filter, auction) pair.
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

    const notifiedRef = db
      .collection('savedFilters')
      .doc(filterDoc.id)
      .collection('notifiedAuctions');

    for (const auction of matches) {
      const notifiedDocId = String(auction.auctionId);
      const notifiedDoc = await notifiedRef.doc(notifiedDocId).get();
      if (notifiedDoc.exists) continue;

      await notifiedRef.doc(notifiedDocId).set({
        notifiedAt: new Date().toISOString(),
        auctionName: auction.name,
      });

      if (filter.pushToken) {
        try {
          const minutesLeft = auction.auctionEndIso
            ? Math.max(0, Math.round((new Date(auction.auctionEndIso).getTime() - now) / 60000))
            : null;
          const timeInfo = minutesLeft != null ? ` · faltam ${minutesLeft} min` : '';
          await messaging.send({
            token: filter.pushToken,
            notification: {
              title: `${auction.name} bate com "${filter.name || 'seu filtro'}"`,
              body: `Level ${auction.level} ${auction.vocation} em ${auction.world} — bid ${auction.bid} TC${timeInfo}`,
            },
            webpush: {
              fcmOptions: { link: auction.officialUrl },
            },
          });
        } catch (err) {
          console.error(`Push falhou para filtro ${filterDoc.id}:`, err.message);
        }
      }

      if (filter.email) {
        try {
          await sendAlertEmail({
            to: filter.email,
            auction,
            filterName: filter.name || 'seu filtro salvo',
          });
        } catch (err) {
          console.error(`E-mail falhou para filtro ${filterDoc.id}:`, err.message);
        }
      }

      notified += 1;
    }
  }

  return { notified };
}
