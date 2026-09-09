import { useState } from 'react';
import AuctionCountdown from './AuctionCountdown';
import AuctionDetailModal from './AuctionDetailModal';
import OutfitAvatar from './OutfitAvatar';
import { SKILLS, SKILL_ICON, VOCATION_ICON, PVP_ICON, LOCATION_ICON } from '../lib/constants';
import { getWorldMeta } from '../lib/worlds';
import { computeBadges } from '../lib/badges';

function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

function skillBarPct(value) {
  return Math.max(4, Math.min(100, Math.round((value / 150) * 100)));
}

export default function AuctionCard({ auction }) {
  const [showModal, setShowModal] = useState(false);

  const skillSource =
    auction.fullSkills && Object.keys(auction.fullSkills).length > 0 ? auction.fullSkills : auction.skills || {};
  // Fixed canonical order (not sorted by value) — matches how skills are
  // conventionally laid out, only the single highest one gets highlighted.
  const skillEntries = SKILLS.filter((s) => skillSource[s] != null).map((s) => [s, skillSource[s]]);
  const topSkill = skillEntries.reduce((top, cur) => (!top || cur[1] > top[1] ? cur : top), null)?.[0];
  const badges = computeBadges(auction);
  const { pvpType, location } = getWorldMeta(auction.world);

  return (
    <>
      <article className="auction-card" onClick={() => setShowModal(true)} role="button" tabIndex={0}>
        <header className="auction-card-header">
          <div className="auction-outfit-frame">
            <OutfitAvatar src={auction.outfitImageUrl} name={auction.name} vocation={auction.vocation} />
          </div>
          <div className="auction-header-info">
            <h3>
              {auction.name}
              <a
                href={auction.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="external-link-icon"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ver leilão oficial"
              >
                ↗
              </a>
            </h3>
            <p className="auction-meta">
              <span className="vocation-icon">{VOCATION_ICON[auction.vocation] ?? ''}</span>
              Level {formatNumber(auction.level)} - {auction.vocation}
            </p>
          </div>
        </header>

        <div className="info-box-row">
          <div className="info-box">
            <span className="info-box-label">
              {LOCATION_ICON[location] ?? '🌐'} SERVIDOR
            </span>
            <strong className="ellipsis">{auction.world}</strong>
          </div>
          <div className="info-box">
            <span className="info-box-label">{PVP_ICON[pvpType] ?? '❔'} PVP</span>
            <strong>{pvpType ?? '—'}</strong>
          </div>
        </div>

        <div className="info-box-row">
          <div className="info-box">
            <span className="info-box-label">🏁 FIM DO LEILÃO</span>
            <AuctionCountdown endIso={auction.auctionEndIso} />
          </div>
          <div className="info-box">
            <span className="info-box-label">🪙 {auction.bidType === 'minimum' ? 'LANCE MÍNIMO' : 'LANCE ATUAL'}</span>
            <strong className="bid-value">{formatNumber(auction.bid)}</strong>
          </div>
        </div>

        {skillEntries.length > 0 && (
          <div className="skill-bar-grid">
            {skillEntries.slice(0, 8).map(([skill, value]) => (
              <div className="skill-bar-row" key={skill}>
                <span className={`skill-bar-value ${skill === topSkill ? 'skill-bar-value-top' : ''}`}>{value}</span>
                <div className="skill-bar-track-wrap">
                  <span className="skill-bar-name">
                    {SKILL_ICON[skill]} {skill.replace(' Fighting', '').replace(' Level', '')}
                  </span>
                  <div className="skill-bar-track">
                    <div
                      className={`skill-bar-fill ${skill === topSkill ? 'skill-bar-fill-top' : ''}`}
                      style={{ width: `${skillBarPct(value)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="card-divider" />

        <div className="stat-two-col">
          <ul className="modal-stat-list">
            {auction.animusMasteries != null && <li>Animus Masteries: {auction.animusMasteries}</li>}
            {auction.charmPoints != null && <li>Charm points: {formatNumber(auction.charmPoints)}</li>}
            {auction.imbuements != null && <li>Imbuements: {auction.imbuements}/23</li>}
            {auction.bossPoints != null && <li>Boss points: {formatNumber(auction.bossPoints)}</li>}
            {auction.questsCompleted != null && <li>Quests: {auction.questsCompleted}/42</li>}
          </ul>
          <ul className="modal-stat-list">
            <li>
              <span className={`flag-box ${auction.hasWeeklyTaskSlot || auction.weeklyTaskExpansion ? 'flag-on' : ''}`} />
              Weekly Task Expansion
            </li>
            <li>
              <span className={`flag-box ${auction.charmExpansion ? 'flag-on' : ''}`} />
              Charm Expansion
            </li>
            <li>
              <span className={`flag-box ${auction.hasPreySlot || auction.preySlotsCount > 0 ? 'flag-on' : ''}`} />
              Prey Slot
            </li>
            {auction.gemsCount != null && <li>Gems: {auction.gemsCount}</li>}
          </ul>
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
      </article>

      {showModal && <AuctionDetailModal auction={auction} onClose={() => setShowModal(false)} />}
    </>
  );
}
