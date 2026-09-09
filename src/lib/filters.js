import { VOCATION_FAMILIES } from './constants.js';

export const DEFAULT_FILTERS = {
  levelMin: null,
  levelMax: null,
  vocations: [], // family labels, e.g. ['Knight'] — matches Knight + Elite Knight
  worlds: [],
  pvpTypes: [], // matched against world metadata if available; otherwise ignored
  bidMax: null,
  skillMins: {}, // { 'Axe Fighting': 100 }
  skillMinsMode: 'all', // 'all' = every skill listed must meet its min (AND); 'any' = at least one does (OR)
  charmPointsMin: null,
  imbuementsMin: null,
  questsCompletedMin: null,
  bossPointsMin: null,
  achievementPointsMin: null,
  characterName: null, // exact/substring alert on one specific character
  endingWithinMinutes: null, // only match auctions ending within this many minutes from now
};

function getSkills(auction) {
  return auction.fullSkills && Object.keys(auction.fullSkills).length > 0
    ? auction.fullSkills
    : auction.skills || {};
}

export function matchesFilters(auction, filters, { now = Date.now() } = {}) {
  const f = { ...DEFAULT_FILTERS, ...filters };

  if (f.characterName) {
    return auction.name?.toLowerCase().includes(f.characterName.toLowerCase()) && matchesBidAndTime(auction, f, now);
  }

  if (f.levelMin != null && (auction.level ?? 0) < f.levelMin) return false;
  if (f.levelMax != null && (auction.level ?? Infinity) > f.levelMax) return false;

  if (f.vocations.length > 0) {
    const allowedVocations = VOCATION_FAMILIES.filter((fam) => f.vocations.includes(fam.label)).flatMap(
      (fam) => fam.vocations
    );
    if (!allowedVocations.includes(auction.vocation)) return false;
  }
  if (f.worlds.length > 0 && !f.worlds.includes(auction.world)) return false;

  const activeSkillMins = Object.entries(f.skillMins).filter(([, min]) => min != null);
  if (activeSkillMins.length > 0) {
    const skills = getSkills(auction);
    const results = activeSkillMins.map(([skill, min]) => (skills[skill] ?? 0) >= min);
    const passes = f.skillMinsMode === 'any' ? results.some(Boolean) : results.every(Boolean);
    if (!passes) return false;
  }

  if (f.charmPointsMin != null && (auction.charmPoints ?? 0) < f.charmPointsMin) return false;
  if (f.imbuementsMin != null && (auction.imbuements ?? 0) < f.imbuementsMin) return false;
  if (f.questsCompletedMin != null && (auction.questsCompleted ?? 0) < f.questsCompletedMin) return false;
  if (f.bossPointsMin != null && (auction.bossPoints ?? 0) < f.bossPointsMin) return false;
  if (f.achievementPointsMin != null && (auction.achievementPoints ?? 0) < f.achievementPointsMin) return false;

  return matchesBidAndTime(auction, f, now);
}

function matchesBidAndTime(auction, f, now) {
  if (f.bidMax != null && (auction.bid ?? Infinity) > f.bidMax) return false;

  if (f.endingWithinMinutes != null) {
    const endMs = auction.auctionEndIso ? new Date(auction.auctionEndIso).getTime() : null;
    if (endMs == null) return false;
    const remainingMinutes = (endMs - now) / 60000;
    if (remainingMinutes <= 0 || remainingMinutes > f.endingWithinMinutes) return false;
  }

  return true;
}

export function filterAuctions(auctions, filters, opts) {
  return auctions.filter((a) => matchesFilters(a, filters, opts));
}
