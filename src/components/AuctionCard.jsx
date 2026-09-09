function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

export default function AuctionCard({ auction }) {
  const skillEntries = Object.entries(auction.skills || {}).sort((a, b) => b[1] - a[1]);

  return (
    <article className="auction-card">
      <header className="auction-card-header">
        {auction.outfitImageUrl && <img src={auction.outfitImageUrl} alt={auction.name} />}
        <div>
          <h3>{auction.name}</h3>
          <p className="auction-meta">
            Level {formatNumber(auction.level)} · {auction.vocation} · {auction.world}
          </p>
        </div>
      </header>

      <div className="auction-card-body">
        <div className="auction-bid">
          <span>{auction.bidType === 'minimum' ? 'Bid mínimo' : 'Bid atual'}</span>
          <strong>{formatNumber(auction.bid)} TC</strong>
        </div>

        {skillEntries.length > 0 && (
          <ul className="skill-list">
            {skillEntries.slice(0, 4).map(([skill, value]) => (
              <li key={skill}>
                {value} {skill}
              </li>
            ))}
          </ul>
        )}

        <ul className="stat-list">
          {auction.charmPoints != null && <li>Charm Points: {formatNumber(auction.charmPoints)}</li>}
          {auction.imbuements != null && <li>Imbuements: {auction.imbuements}/23</li>}
          {auction.questsCompleted != null && <li>Quests: {auction.questsCompleted}/42</li>}
          {auction.bossPoints != null && <li>Boss Points: {formatNumber(auction.bossPoints)}</li>}
          {auction.achievementPoints != null && <li>Achievement Points: {auction.achievementPoints}</li>}
        </ul>
      </div>

      <footer className="auction-card-footer">
        <a href={auction.officialUrl} target="_blank" rel="noreferrer">
          Ver leilão oficial →
        </a>
      </footer>
    </article>
  );
}
