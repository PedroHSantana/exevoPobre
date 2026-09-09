import { useState } from 'react';
import AuctionCountdown from './AuctionCountdown';
import AuctionDetailModal from './AuctionDetailModal';
import { SKILL_ICON, VOCATION_ICON, PVP_ICON, LOCATION_ICON } from '../lib/constants';
import { getWorldMeta } from '../lib/worlds';
import { computeBadges } from '../lib/badges';

function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

export default function AuctionCard({ auction }) {
  const [showModal, setShowModal] = useState(false);

  const skillSource =
    auction.fullSkills && Object.keys(auction.fullSkills).length > 0 ? auction.fullSkills : auction.skills || {};
  const skillEntries = Object.entries(skillSource).sort((a, b) => b[1] - a[1]);
  const badges = computeBadges(auction);
  const { pvpType, location } = getWorldMeta(auction.world);

  return (
    <>
      <article className="auction-card" onClick={() => setShowModal(true)} role="button" tabIndex={0}>
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
              Level {formatNumber(auction.level)} · {auction.vocation}
            </p>
          </div>
        </header>

        <div className="info-box-row">
          <div className="info-box">
            <span className="info-box-label">
              {LOCATION_ICON[location] ?? '🌐'} Servidor
            </span>
            <strong className="ellipsis">{auction.world}</strong>
          </div>
          <div className="info-box">
            <span className="info-box-label">{PVP_ICON[pvpType] ?? '❔'} PvP</span>
            <strong>{pvpType ?? '—'}</strong>
          </div>
        </div>

        <div className="info-box-row">
          <div className="info-box">
            <span className="info-box-label">🏁 Fim do leilão</span>
            <AuctionCountdown endIso={auction.auctionEndIso} />
          </div>
          <div className="info-box">
            <span className="info-box-label">🪙 {auction.bidType === 'minimum' ? 'Mínimo' : 'Atual'}</span>
            <strong className="bid-value">{formatNumber(auction.bid)} TC</strong>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="badge-row">
            {badges.map((b) => (
              <span key={b.key} className={`badge badge-${b.tone}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}

        {skillEntries.length > 0 && (
          <div className="skill-grid">
            {skillEntries.slice(0, 8).map(([skill, value]) => (
              <div className="skill-cell" key={skill}>
                <span className="skill-value">
                  {SKILL_ICON[skill]} {value}
                </span>
                <span className="skill-name">{skill}</span>
              </div>
            ))}
          </div>
        )}

        <div className="stat-chip-row">
          {auction.animusMasteries != null && <span className="stat-chip">✨ Animus {auction.animusMasteries}</span>}
          {auction.charmPoints != null && (
            <span className="stat-chip">💠 Charms {formatNumber(auction.charmPoints)}</span>
          )}
          {auction.imbuements != null && <span className="stat-chip">🧪 Imbue {auction.imbuements}/23</span>}
          {auction.questsCompleted != null && (
            <span className="stat-chip">📜 Quests {auction.questsCompleted}/42</span>
          )}
          {auction.bossPoints != null && <span className="stat-chip">💀 Boss {formatNumber(auction.bossPoints)}</span>}
        </div>

        <footer className="auction-card-footer">
          <a href={auction.officialUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            Ver leilão oficial →
          </a>
          <span className="expand-hint">Clique para ver mais ⤢</span>
        </footer>
      </article>

      {showModal && <AuctionDetailModal auction={auction} onClose={() => setShowModal(false)} />}
    </>
  );
}
