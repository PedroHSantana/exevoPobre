// Our own thresholds for "notable" badges — not copied from any other site,
// just reasonable eyeballed cutoffs for what counts as "a lot".
export function computeBadges(auction) {
  const badges = [];
  if (auction.isNew) badges.push({ key: 'new', label: 'Novo', tone: 'new' });
  if ((auction.charmPoints ?? 0) >= 5000) badges.push({ key: 'charms', label: 'Muitos charms', tone: 'neutral' });
  if ((auction.questsCompleted ?? 0) >= 30) badges.push({ key: 'quests', label: 'Muitas quests', tone: 'neutral' });
  if ((auction.mountsCount ?? 0) >= 20) badges.push({ key: 'mounts', label: 'Mounts raras ✨', tone: 'neutral' });
  if ((auction.outfitsCount ?? 0) >= 20) badges.push({ key: 'outfits', label: 'Outfits raras 💎', tone: 'neutral' });
  if (auction.hasSoulWar) badges.push({ key: 'soulwar', label: 'Soul War disponível 💀', tone: 'rare' });
  if (auction.hasPrimalOrdeal) badges.push({ key: 'primal', label: 'Primal Ordeal disponível 🦖', tone: 'rare' });
  return badges;
}
