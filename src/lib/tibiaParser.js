import * as cheerio from 'cheerio';

const SKILL_NAMES = [
  'Axe Fighting',
  'Club Fighting',
  'Distance Fighting',
  'Fishing',
  'Fist Fighting',
  'Magic Level',
  'Shielding',
  'Sword Fighting',
];

const skillLineRe = new RegExp(
  `^(\\d+)\\s+(${SKILL_NAMES.join('|')})\\b`
);

function parseNumber(text) {
  if (!text) return null;
  const cleaned = text.replace(/[.,]/g, '');
  const n = parseInt(cleaned, 10);
  return Number.isNaN(n) ? null : n;
}

function parseHeader(headerText) {
  // "Level: 200 | Vocation: Knight | Male | World: Gentebra"
  const levelMatch = headerText.match(/Level:\s*([\d.,]+)/i);
  const vocationMatch = headerText.match(/Vocation:\s*([^|]+?)\s*\|/i);
  const sexMatch = headerText.match(/\|\s*(Male|Female)\s*\|/i);
  const worldMatch = headerText.match(/World:\s*([A-Za-z]+)/i);
  return {
    level: levelMatch ? parseNumber(levelMatch[1]) : null,
    vocation: vocationMatch ? vocationMatch[1].trim() : null,
    sex: sexMatch ? sexMatch[1] : null,
    world: worldMatch ? worldMatch[1].trim() : null,
  };
}

function parseEntry(rawEntry) {
  const text = rawEntry.replace(/\s+/g, ' ').trim();

  const skillMatch = text.match(skillLineRe);
  if (skillMatch) {
    return { type: 'skill', skill: skillMatch[2], value: parseNumber(skillMatch[1]), raw: text };
  }

  const charmMatch = text.match(
    /^Charm Points:\s*([\d.,]+)\s*\(Unused:\s*([\d.,]+)\)(?:,\s*Minor Charm Echoes:\s*([\d.,]+)\s*\(Unused:\s*([\d.,]+)\))?/i
  );
  if (charmMatch) {
    return {
      type: 'charmPoints',
      value: parseNumber(charmMatch[1]),
      unused: parseNumber(charmMatch[2]),
      minorCharmEchoes: charmMatch[3] ? parseNumber(charmMatch[3]) : null,
      raw: text,
    };
  }

  const imbuementsMatch = text.match(/^Unlocked Powerful Imbuements:\s*([\d.,]+)/i);
  if (imbuementsMatch) {
    return { type: 'imbuements', value: parseNumber(imbuementsMatch[1]), raw: text };
  }

  const questsMatch = text.match(/^([\d.,]+)\s+Quests completed/i);
  if (questsMatch) {
    return { type: 'questsCompleted', value: parseNumber(questsMatch[1]), raw: text };
  }

  const bossPointsMatch = text.match(/^Total Boss Points:\s*([\d.,]+)/i);
  if (bossPointsMatch) {
    return { type: 'bossPoints', value: parseNumber(bossPointsMatch[1]), raw: text };
  }

  const achievementMatch = text.match(/^([\d.,]+)\s+Achievement Points/i);
  if (achievementMatch) {
    return { type: 'achievementPoints', value: parseNumber(achievementMatch[1]), raw: text };
  }

  const huntingTaskMatch = text.match(/^Unused Hunting Task Points:\s*([\d.,]+)/i);
  if (huntingTaskMatch) {
    return { type: 'huntingTaskPoints', value: parseNumber(huntingTaskMatch[1]), raw: text };
  }

  const storeOutfitsMatch = text.match(/^Store Outfits:\s*([\d.,]+)/i);
  if (storeOutfitsMatch) {
    return { type: 'storeOutfits', value: parseNumber(storeOutfitsMatch[1]), raw: text };
  }

  const storeMountsMatch = text.match(/^Store Mounts:\s*([\d.,]+)/i);
  if (storeMountsMatch) {
    return { type: 'storeMounts', value: parseNumber(storeMountsMatch[1]), raw: text };
  }

  const decorationMatch = text.match(/^Store Decoration Items:\s*([\d.,]+)/i);
  if (decorationMatch) {
    return { type: 'storeDecorationItems', value: parseNumber(decorationMatch[1]), raw: text };
  }

  const promotionMatch = text.match(/^Bonus Promotion Points:\s*([\d.,]+)/i);
  if (promotionMatch) {
    return { type: 'bonusPromotionPoints', value: parseNumber(promotionMatch[1]), raw: text };
  }

  const goldMatch = text.match(/^([\d.,]+)\s+Gold total/i);
  if (goldMatch) {
    return { type: 'goldTotal', value: parseNumber(goldMatch[1]), raw: text };
  }

  const additionalSlotsMatch = text.match(/^Additional Slots:\s*(.+)/i);
  if (additionalSlotsMatch) {
    return {
      type: 'additionalSlots',
      value: additionalSlotsMatch[1].split(',').map((s) => s.trim()),
      raw: text,
    };
  }

  const levelLineMatch = text.match(/^([\d.,]+)\s+Level$/i);
  if (levelLineMatch) {
    return { type: 'levelHighlight', value: parseNumber(levelLineMatch[1]), raw: text };
  }

  if (/^Regular World Transfer can be purchased/i.test(text)) {
    return { type: 'worldTransfer', value: true, raw: text };
  }

  const itemMatch = text.match(/^(\d+)x\s+(.+?)\s*\(Store Item\)/i);
  if (itemMatch) {
    return { type: 'storeItem', quantity: parseNumber(itemMatch[1]), item: itemMatch[2], raw: text };
  }

  const achievementNamedMatch = text.match(/^Achievement\s+"(.+)"\s+accomplished/i);
  if (achievementNamedMatch) {
    return { type: 'achievementNamed', name: achievementNamedMatch[1], raw: text };
  }

  return { type: 'other', raw: text };
}

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Tibia.com timestamps look like "Sep 08 2026, 22:15 CEST" (Central European
// time, CEST=UTC+2 / CET=UTC+1). Converts to an ISO string so the frontend
// can compute an accurate countdown instead of parsing free text.
function parseTibiaDateToIso(text) {
  const match = text.match(/^(\w{3})\s+(\d{1,2})\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(CEST|CET)$/);
  if (!match) return null;
  const [, monStr, day, year, hour, minute, tz] = match;
  const month = MONTHS[monStr];
  if (month == null) return null;
  const offsetHours = tz === 'CEST' ? 2 : 1;
  const utcMs = Date.UTC(Number(year), month, Number(day), Number(hour) - offsetHours, Number(minute));
  return new Date(utcMs).toISOString();
}

function parseAuctionCard($, el) {
  const $auction = $(el);

  const auctionUrl = $auction.find('.AuctionCharacterName a').attr('href') || '';
  const auctionIdMatch = auctionUrl.match(/auctionid=(\d+)/);
  const auctionId = auctionIdMatch ? parseInt(auctionIdMatch[1], 10) : null;

  const name = $auction.find('.AuctionCharacterName a').first().text().trim();
  const headerText = $auction
    .find('.AuctionHeader')
    .first()
    .clone()
    .find('.AuctionCharacterName, .AuctionLinks')
    .remove()
    .end()
    .text()
    .replace(/\s+/g, ' ')
    .trim();
  const { level, vocation, sex, world } = parseHeader(headerText);

  const outfitImageUrl = $auction.find('.AuctionOutfitImage').attr('src') || null;
  const isNew = $auction.find('.AuctionNewIcon').length > 0;

  const startDate = $auction
    .find('.ShortAuctionData .ShortAuctionDataLabel')
    .filter((i, e) => /Auction Start/i.test($(e).text()))
    .first()
    .next('.ShortAuctionDataValue')
    .text()
    .trim();
  const endDate = $auction
    .find('.ShortAuctionData .ShortAuctionDataLabel')
    .filter((i, e) => /Auction End/i.test($(e).text()))
    .first()
    .next('.ShortAuctionDataValue')
    .text()
    .trim();

  const bidLabel = $auction.find('.ShortAuctionDataBidRow .ShortAuctionDataLabel').text().trim();
  const bidValueText = $auction.find('.ShortAuctionDataBidRow .ShortAuctionDataValue b').first().text().trim();
  const bidValue = parseNumber(bidValueText);
  const bidType = /Minimum/i.test(bidLabel) ? 'minimum' : 'current';

  const entries = $auction
    .find('.SpecialCharacterFeatures .Entry')
    .map((i, e) => $(e).clone().find('img').remove().end().text().trim())
    .get()
    .filter(Boolean);

  const parsedEntries = entries.map(parseEntry);

  const skills = {};
  let charmPoints = null;
  let unusedCharmPoints = null;
  let imbuements = null;
  let questsCompleted = null;
  let bossPoints = null;
  let achievementPoints = null;
  let huntingTaskPoints = null;
  let storeOutfits = null;
  let storeMounts = null;

  for (const entry of parsedEntries) {
    switch (entry.type) {
      case 'skill':
        skills[entry.skill] = entry.value;
        break;
      case 'charmPoints':
        charmPoints = entry.value;
        unusedCharmPoints = entry.unused;
        break;
      case 'imbuements':
        imbuements = entry.value;
        break;
      case 'questsCompleted':
        questsCompleted = entry.value;
        break;
      case 'bossPoints':
        bossPoints = entry.value;
        break;
      case 'achievementPoints':
        achievementPoints = entry.value;
        break;
      case 'huntingTaskPoints':
        huntingTaskPoints = entry.value;
        break;
      case 'storeOutfits':
        storeOutfits = entry.value;
        break;
      case 'storeMounts':
        storeMounts = entry.value;
        break;
      default:
        break;
    }
  }

  return {
    auctionId,
    name,
    level,
    vocation,
    sex,
    world,
    outfitImageUrl,
    isNew,
    auctionStart: startDate || null,
    auctionEnd: endDate || null,
    auctionStartIso: startDate ? parseTibiaDateToIso(startDate) : null,
    auctionEndIso: endDate ? parseTibiaDateToIso(endDate) : null,
    bid: bidValue,
    bidType,
    skills,
    charmPoints,
    unusedCharmPoints,
    imbuements,
    questsCompleted,
    bossPoints,
    achievementPoints,
    huntingTaskPoints,
    storeOutfits,
    storeMounts,
    entries: parsedEntries,
    officialUrl: `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&page=details&auctionid=${auctionId}`,
  };
}

function findDetailsBlock($, label) {
  return $('.CharacterDetailsBlock')
    .filter((i, el) => $(el).find('.Text').first().text().trim() === label)
    .first();
}

function parseLeafRows($, block, { maxCols = 1 } = {}) {
  // Tibia's markup nests the same table 2-3 times for its box-border
  // styling, so the same row text appears duplicated at multiple depths.
  // The innermost (leaf) <tr>s are the ones with no further nested table,
  // which is what we want to read once each.
  const rows = [];
  block.find('table tr').each((i, tr) => {
    const $tr = $(tr);
    if ($tr.find('table').length > 0) return; // not a leaf row
    const tds = $tr
      .find('td')
      .map((j, td) => $(td).text().trim())
      .get();
    if (tds.length > 0 && tds.length <= maxCols) rows.push(tds);
  });
  return rows;
}

const DETAIL_SKILL_NAMES = SKILL_NAMES;

/**
 * Parses an individual auction's detail page (?page=details&auctionid=N),
 * which — unlike the overview list — exposes every skill (not just the
 * "noteworthy" ones) plus quest lines, mounts/outfits counts and blessings.
 * Used to enrich an auction already found via parseAuctionListHtml.
 */
export function parseAuctionDetailHtml(html) {
  const $ = cheerio.load(html);

  const fullSkills = {};
  const generalBlock = findDetailsBlock($, 'General');
  generalBlock.find('table tr').each((i, tr) => {
    const $tr = $(tr);
    if ($tr.find('table').length > 0) return;
    const tds = $tr
      .find('td')
      .map((j, td) => $(td).text().trim())
      .get();
    if (tds.length >= 2 && DETAIL_SKILL_NAMES.includes(tds[0])) {
      fullSkills[tds[0]] = parseNumber(tds[1]);
    }
  });

  const singleStat = (label) => {
    const row = parseLeafRows($, generalBlock, { maxCols: 1 }).find((r) =>
      r[0].startsWith(`${label}:`)
    );
    return row ? row[0].slice(label.length + 1).trim() : null;
  };

  const mountsCount = parseNumber(singleStat('Mounts'));
  const outfitsCount = parseNumber(singleStat('Outfits'));
  const titlesCount = parseNumber(singleStat('Titles'));
  const blessingsRaw = singleStat('Blessings'); // e.g. "7/7"
  const blessingsMatch = blessingsRaw ? blessingsRaw.match(/(\d+)\/(\d+)/) : null;

  const questLinesBlock = findDetailsBlock($, 'Completed Quest Lines');
  const completedQuestLines = parseLeafRows($, questLinesBlock, { maxCols: 1 })
    .map((r) => r[0])
    .filter((name) => name && name !== 'Quest Line Name');

  const hasSoulWar = completedQuestLines.some((q) => /soul war/i.test(q));
  const hasPrimalOrdeal = completedQuestLines.some((q) => /primal ordeal/i.test(q));

  return {
    fullSkills,
    mountsCount,
    outfitsCount,
    titlesCount,
    blessingsActive: blessingsMatch ? parseNumber(blessingsMatch[1]) : null,
    blessingsTotal: blessingsMatch ? parseNumber(blessingsMatch[2]) : null,
    completedQuestLines,
    hasSoulWar,
    hasPrimalOrdeal,
  };
}

export function parseAuctionListHtml(html) {
  const $ = cheerio.load(html);
  const auctions = $('.Auction')
    .map((i, el) => parseAuctionCard($, el))
    .get()
    .filter((a) => a.auctionId != null && a.name);

  const resultsMatch = $('body')
    .text()
    .match(/Results:\s*([\d.,]+)/i);
  const totalResults = resultsMatch ? parseNumber(resultsMatch[1]) : null;

  return { auctions, totalResults };
}
