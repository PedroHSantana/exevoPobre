import { parseAuctionListHtml, parseAuctionDetailHtml } from './tibiaParser.js';

const BASE_URL = 'https://www.tibia.com/charactertrade/';
// tibia.com's WAF returns 403 to non-browser-looking requests (a custom
// User-Agent alone was enough to get blocked from Vercel's IP ranges).
// Mimic a normal desktop Chrome request instead.
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
};

export const ORDER_COLUMN = {
  BID: 100,
  END_DATE: 101,
  START_DATE: 103,
  LEVEL: 102,
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('retry-after');
    const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null;
    const err = new Error('Tibia bazaar rate-limited the request (429)');
    err.status = 429;
    err.retryAfterMs = retryAfterMs;
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Tibia bazaar request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchHtmlWithRetry(url, { maxRetries = 4 } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fetchHtml(url);
    } catch (err) {
      if (err.status !== 429 || attempt >= maxRetries) throw err;
      const backoffMs = err.retryAfterMs ?? 2000 * 2 ** attempt;
      await sleep(backoffMs);
      attempt += 1;
    }
  }
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

  const html = await fetchHtmlWithRetry(url.toString());
  return parseAuctionListHtml(html);
}

export async function fetchAuctionDetail(auctionId) {
  const url = new URL(BASE_URL);
  url.searchParams.set('subtopic', 'currentcharactertrades');
  url.searchParams.set('page', 'details');
  url.searchParams.set('auctionid', String(auctionId));

  const html = await fetchHtmlWithRetry(url.toString());
  return parseAuctionDetailHtml(html);
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
export async function fetchAuctionPages(pageNumbers, { delayMs = 700, ...orderOpts } = {}) {
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
