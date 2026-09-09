import AuctionCountdown from './AuctionCountdown';
import { SKILL_SHORT, VOCATION_ICON } from '../lib/constants';

function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

export default function AuctionCard({ auction }) {
  const skillSource = auction.fullSkills && Object.keys(auction.fullSkills).length > 0
    ? auction.fullSkills
    : auction.skills || {};
  const skillEntries = Object.entries(skillSource).sort((a, b) => b[1] - a[1]);

  const badges = [];
  if (auction.isNew) badges.push({ key: 'new', label: 'Novo', tone: 'new' });
  if (auction.hasSoulWar) badges.push({ key: 'soulwar', label: 'Soul War 💀', tone: 'rare' });
  if (auction.hasPrimalOrdeal) badges.push({ key: 'primal', label: 'Primal Ordeal 🦖', tone: 'rare' });

  return (
    <article className="auction-card">
      <header className="auction-card-header">
        {auction.outfitImageUrl && (
          <div className="auction-outfit-frame">
            <img src={auction.outfitImageUrl} alt={auction.name} />
          </div>
        )}
        <div className="auction-header-info">
          <h3>{auction.name}</h3>
          <p className="auction-meta">
            <span className="vocation-icon">{VOCATION_ICON[auction.vocation] ?? ''}</span>
            Level {formatNumber(auction.level)} · {auction.vocation} · {auction.world}
          </p>
          <AuctionCountdown endIso={auction.auctionEndIso} />
        </div>
      </header>

      {badges.length > 0 && (
        <div className="badge-row">
          {badges.map((b) => (
            <span key={b.key} className={`badge badge-${b.tone}`}>
              {b.label}
            </span>
          ))}
        </div>
      )}

      <div className="auction-card-body">
        <div className="auction-bid">
          <span>{auction.bidType === 'minimum' ? 'Bid mínimo' : 'Bid atual'}</span>
          <strong>{formatNumber(auction.bid)} TC</strong>
        </div>

        {skillEntries.length > 0 && (
          <div className="skill-grid">
            {skillEntries.map(([skill, value]) => (
              <div className="skill-cell" key={skill}>
                <span className="skill-value">{value}</span>
                <span className="skill-name">{SKILL_SHORT[skill] ?? skill}</span>
              </div>
            ))}
          </div>
        )}

        <div className="stat-chip-row">
          {auction.charmPoints != null && (
            <span className="stat-chip">Charms {formatNumber(auction.charmPoints)}</span>
          )}
          {auction.imbuements != null && <span className="stat-chip">Imbue {auction.imbuements}/23</span>}
          {auction.questsCompleted != null && (
            <span className="stat-chip">Quests {auction.questsCompleted}/42</span>
          )}
          {auction.bossPoints != null && (
            <span className="stat-chip">Boss {formatNumber(auction.bossPoints)}</span>
          )}
          {auction.achievementPoints != null && (
            <span className="stat-chip">Achiev. {auction.achievementPoints}</span>
          )}
          {auction.mountsCount != null && <span className="stat-chip">Mounts {auction.mountsCount}</span>}
          {auction.outfitsCount != null && <span className="stat-chip">Outfits {auction.outfitsCount}</span>}
          {auction.blessingsActive != null && (
            <span className="stat-chip">
              Bless {auction.blessingsActive}/{auction.blessingsTotal}
            </span>
          )}
        </div>
      </div>

      <footer className="auction-card-footer">
        <a href={auction.officialUrl} target="_blank" rel="noreferrer">
          Ver leilão oficial →
        </a>
      </footer>
    </article>
  );
}
