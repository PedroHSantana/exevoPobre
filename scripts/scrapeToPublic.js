// Local-only helper: scrapes real auctions from tibia.com and writes them to
// public/dev-auctions.json so BazaarPage can show real data during local
// development, before Firebase is configured. Not used in production —
// once VITE_FIREBASE_PROJECT_ID is set, BazaarPage reads from Firestore.
import { writeFileSync } from 'fs';
import { fetchAuctionPages, ORDER_COLUMN } from '../src/lib/tibiaClient.js';

const pagesArg = process.argv.find((a) => a.startsWith('--pages='));
const pageCount = pagesArg ? parseInt(pagesArg.split('=')[1], 10) : 10;
const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

console.log(`Fetching ${pageCount} pages from tibia.com...`);
const { auctions, totalResults } = await fetchAuctionPages(pages, {
  orderColumn: ORDER_COLUMN.END_DATE,
  orderDirection: 1,
});

console.log(`Total results on site: ${totalResults}`);
console.log(`Auctions fetched: ${auctions.length}`);

writeFileSync('public/dev-auctions.json', JSON.stringify(auctions, null, 2));
console.log('Saved to public/dev-auctions.json');
