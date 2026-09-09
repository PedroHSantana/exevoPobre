// Fetches the individual auction detail page for every auction in Firestore
// that hasn't been enriched yet, and merges in the richer fields the
// overview list doesn't expose: full 8-skill list, mounts/outfits/blessings
// counts, and Soul War / Primal Ordeal quest-line completion.
//
// Detail pages don't change once an auction is scraped (a character's
// stats are frozen for the auction's lifetime), so this only needs to run
// once per auctionId — cheap to re-run, it skips anything already enriched.
//
// Usage: node --env-file=.env scripts/enrichDetails.js --limit=300
import { getAdminDb } from '../api/_lib/firebaseAdmin.js';
import { fetchAuctionDetail, sleep } from '../src/lib/tibiaClient.js';

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 300;

const db = getAdminDb();

// Firestore can't query for "field is missing", so we pull just the
// enrichment marker for every doc and filter client-side. Prioritize
// auctions ending soonest — that's what a bargain hunter actually looks at.
const allSnap = await db.collection('auctions').select('detailEnrichedAt', 'auctionEndIso').get();
const pending = allSnap.docs
  .filter((doc) => !doc.get('detailEnrichedAt'))
  .sort((a, b) => (a.get('auctionEndIso') || '').localeCompare(b.get('auctionEndIso') || ''))
  .slice(0, limit);
console.log(`Encontrados ${pending.length} leilões sem detalhe (de ${allSnap.size} total, limite ${limit}).`);

let done = 0;
let failed = 0;

for (const doc of pending) {
  const auctionId = doc.id;
  try {
    const detail = await fetchAuctionDetail(auctionId);
    await doc.ref.set({ ...detail, detailEnrichedAt: new Date().toISOString() }, { merge: true });
    done += 1;
  } catch (err) {
    console.error(`Falhou auctionId=${auctionId}: ${err.message}`);
    failed += 1;
  }
  if (done % 25 === 0 && done > 0) console.log(`Progresso: ${done}/${pending.length}`);
  await sleep(1200);
}

console.log(`Concluído. Enriquecidos: ${done}. Falhas: ${failed}.`);
process.exit(0);
