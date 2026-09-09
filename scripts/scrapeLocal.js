// Quick manual check of the scraper against the real tibia.com bazaar,
// without touching Firestore. Useful while developing the parser.
// Usage: npm run scrape:local -- --pages=3
import { writeFileSync } from 'fs';
import { fetchAuctionPages, ORDER_COLUMN } from '../src/lib/tibiaClient.js';

const pagesArg = process.argv.find((a) => a.startsWith('--pages='));
const pageCount = pagesArg ? parseInt(pagesArg.split('=')[1], 10) : 2;
const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

const { auctions, totalResults } = await fetchAuctionPages(pages, {
  orderColumn: ORDER_COLUMN.END_DATE,
  orderDirection: 1,
});

console.log(`Total results on site: ${totalResults}`);
console.log(`Auctions fetched: ${auctions.length}`);

writeFileSync('scripts/last-scrape-output.json', JSON.stringify(auctions, null, 2));
console.log('Saved to scripts/last-scrape-output.json');
