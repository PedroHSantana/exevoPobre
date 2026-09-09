import { parseAuctionListHtml } from './tibiaParser.js';

const BASE_URL = 'https://www.tibia.com/charactertrade/';
const USER_AGENT = 'TibiaBazaarFinder/1.0 (+https://github.com/; contact via project owner)';

export const ORDER_COLUMN = {
  BID: 100,
  END_DATE: 101,
  START_DATE: 103,
  LEVEL: 102,
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAuctionPage({
  page = 1,
  orderColumn = ORDER_COLUMN.END_DATE,
  orderDirection = 1,
} = {}) {
  const url = new URL(BASE_URL);
  url.searchParams.set('subtopic', 'currentcharactertrades');
  url.searchParams.set('currentpage', String(page));
  url.searchParams.set('order_column', String(orderColumn));
  url.searchParams.set('order_direction', String(orderDirection));

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw new Error(`Tibia bazaar request failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseAuctionListHtml(html);
}

const RESULTS_PER_PAGE = 25;

export function totalPages(totalResults) {
  if (!totalResults) return 1;
  return Math.ceil(totalResults / RESULTS_PER_PAGE);
}

/**
 * Fetches a batch of pages sequentially with a small delay between requests,
 * to avoid hammering tibia.com. Returns the merged auction list plus the
 * total results reported by the site.
 */
export async function fetchAuctionPages(pageNumbers, { delayMs = 400, ...orderOpts } = {}) {
  const auctions = [];
  let totalResults = null;

  for (const page of pageNumbers) {
    const result = await fetchAuctionPage({ page, ...orderOpts });
    auctions.push(...result.auctions);
    if (result.totalResults != null) totalResults = result.totalResults;
    if (page !== pageNumbers[pageNumbers.length - 1]) {
      await sleep(delayMs);
    }
  }

  return { auctions, totalResults };
}
