// One-off local seed: scrapes real auctions from tibia.com and writes them
// straight into your Firestore `auctions` collection, using the same logic
// the production cron (api/cron/scrape.js) uses. Useful to populate data for
// local testing before the scraper is deployed and scheduled.
//
// Usage: node --env-file=.env scripts/seedFirestore.js --pages=10
import { getAdminDb } from '../api/_lib/firebaseAdmin.js';
import { fetchAuctionPages, ORDER_COLUMN, totalPages } from '../src/lib/tibiaClient.js';

const pagesArg = process.argv.find((a) => a.startsWith('--pages='));
const pageCount = pagesArg ? parseInt(pagesArg.split('=')[1], 10) : 10;
const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

console.log(`Buscando ${pageCount} páginas do tibia.com...`);
const { auctions, totalResults } = await fetchAuctionPages(pages, {
  orderColumn: ORDER_COLUMN.END_DATE,
  orderDirection: 1,
});
console.log(`Total de leilões no site: ${totalResults}`);
console.log(`Leilões buscados nessa rodada: ${auctions.length}`);

const db = getAdminDb();
const now = new Date().toISOString();
const batchSize = 400;

for (let i = 0; i < auctions.length; i += batchSize) {
  const batch = db.batch();
  for (const auction of auctions.slice(i, i + batchSize)) {
    const ref = db.collection('auctions').doc(String(auction.auctionId));
    batch.set(ref, { ...auction, lastSeenAt: now }, { merge: true });
  }
  await batch.commit();
  console.log(`Gravados ${Math.min(i + batchSize, auctions.length)}/${auctions.length}`);
}

await db.collection('scrapeState').doc('cursor').set({
  nextPage: pageCount + 1,
  knownTotalPages: totalResults ? totalPages(totalResults) : 1,
  lastRunAt: now,
});

console.log('Seed concluído. Confira a coleção "auctions" no Firestore.');
process.exit(0);
