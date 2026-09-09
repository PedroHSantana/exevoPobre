export const DEFAULT_FILTERS = {
  levelMin: null,
  levelMax: null,
  vocations: [], // e.g. ['Knight', 'Elite Knight']
  worlds: [],
  pvpTypes: [], // matched against world metadata if available; otherwise ignored
  bidMax: null,
  skillMins: {}, // { 'Axe Fighting': 100 }
  charmPointsMin: null,
  imbuementsMin: null,
  questsCompletedMin: null,
  bossPointsMin: null,
  achievementPointsMin: null,
};

export function matchesFilters(auction, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };

  if (f.levelMin != null && (auction.level ?? 0) < f.levelMin) return false;
  if (f.levelMax != null && (auction.level ?? Infinity) > f.levelMax) return false;

  if (f.vocations.length > 0 && !f.vocations.includes(auction.vocation)) return false;
  if (f.worlds.length > 0 && !f.worlds.includes(auction.world)) return false;

  if (f.bidMax != null && (auction.bid ?? Infinity) > f.bidMax) return false;

  for (const [skill, min] of Object.entries(f.skillMins)) {
    if (min == null) continue;
    const value = auction.skills?.[skill] ?? 0;
    if (value < min) return false;
  }

  if (f.charmPointsMin != null && (auction.charmPoints ?? 0) < f.charmPointsMin) return false;
  if (f.imbuementsMin != null && (auction.imbuements ?? 0) < f.imbuementsMin) return false;
  if (f.questsCompletedMin != null && (auction.questsCompleted ?? 0) < f.questsCompletedMin) return false;
  if (f.bossPointsMin != null && (auction.bossPoints ?? 0) < f.bossPointsMin) return false;
  if (f.achievementPointsMin != null && (auction.achievementPoints ?? 0) < f.achievementPointsMin) return false;

  return true;
}

export function filterAuctions(auctions, filters) {
  return auctions.filter((a) => matchesFilters(a, filters));
}
