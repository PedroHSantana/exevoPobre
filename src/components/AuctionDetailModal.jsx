import { useEffect } from 'react';
import { VOCATION_ICON, SKILL_ICON, PVP_ICON, LOCATION_ICON } from '../lib/constants';
import { getWorldMeta } from '../lib/worlds';
import { computeBadges } from '../lib/badges';

function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

export default function AuctionDetailModal({ auction, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!auction) return null;

  const { pvpType, location } = getWorldMeta(auction.world);
  const skills = auction.fullSkills && Object.keys(auction.fullSkills).length > 0 ? auction.fullSkills : auction.skills || {};
  const skillEntries = Object.entries(skills).sort((a, b) => b[1] - a[1]);
  const badges = computeBadges(auction);
  const otherEntries = (auction.entries || []).filter((e) =>
    ['storeItem', 'goldTotal', 'bonusPromotionPoints', 'worldTransfer', 'achievementNamed', 'other'].includes(e.type)
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <header className="modal-header">
          {auction.outfitImageUrl && (
            <div className="modal-outfit-frame">
              <img src={auction.outfitImageUrl} alt={auction.name} />
            </div>
          )}
          <div>
            <h2>{auction.name}</h2>
            <p className="auction-meta">
              <span className="vocation-icon">{VOCATION_ICON[auction.vocation] ?? ''}</span>
              Level {formatNumber(auction.level)} · {auction.vocation} · {auction.sex}
            </p>
          </div>
        </header>

        <div className="info-box-row">
          <div className="info-box">
            <span className="info-box-label">
              {LOCATION_ICON[location] ?? '🌐'} Servidor
            </span>
            <strong>{auction.world}</strong>
          </div>
          <div className="info-box">
            <span className="info-box-label">{PVP_ICON[pvpType] ?? '❔'} PvP</span>
            <strong>{pvpType ?? '—'}</strong>
          </div>
          <div className="info-box">
            <span className="info-box-label">🏁 Fim do leilão</span>
            <strong>{auction.auctionEnd ?? '—'}</strong>
          </div>
          <div className="info-box">
            <span className="info-box-label">🪙 {auction.bidType === 'minimum' ? 'Bid mínimo' : 'Bid atual'}</span>
            <strong>{formatNumber(auction.bid)} TC</strong>
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
          <section className="modal-section">
            <h3>Skills</h3>
            <div className="skill-grid skill-grid-modal">
              {skillEntries.map(([skill, value]) => (
                <div className="skill-cell" key={skill}>
                  <span className="skill-value">
                    {SKILL_ICON[skill]} {value}
                  </span>
                  <span className="skill-name">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="modal-section">
          <h3>Progresso</h3>
          <ul className="modal-stat-list">
            {auction.animusMasteries != null && <li>Animus Masteries: {auction.animusMasteries}</li>}
            {auction.charmPoints != null && <li>Charm Points: {formatNumber(auction.charmPoints)}</li>}
            {auction.imbuements != null && <li>Imbuements: {auction.imbuements}/23</li>}
            {auction.questsCompleted != null && <li>Quests: {auction.questsCompleted}/42</li>}
            {auction.bossPoints != null && <li>Boss Points: {formatNumber(auction.bossPoints)}</li>}
            {auction.achievementPoints != null && <li>Achievement Points: {auction.achievementPoints}</li>}
            {auction.mountsCount != null && <li>Mounts: {auction.mountsCount}</li>}
            {auction.outfitsCount != null && <li>Outfits: {auction.outfitsCount}</li>}
            {auction.gemsCount != null && <li>Gems revelados: {auction.gemsCount}</li>}
            {auction.blessingsActive != null && (
              <li>
                Blessings: {auction.blessingsActive}/{auction.blessingsTotal}
              </li>
            )}
            <li>{auction.hasWeeklyTaskSlot || auction.weeklyTaskExpansion ? '✅' : '⬜'} Weekly Task Expansion</li>
            <li>{auction.charmExpansion ? '✅' : '⬜'} Charm Expansion</li>
            <li>{auction.hasPreySlot || auction.preySlotsCount > 0 ? '✅' : '⬜'} Prey Slot</li>
          </ul>
        </section>

        {auction.completedQuestLines?.length > 0 && (
          <section className="modal-section">
            <h3>Quest lines completas</h3>
            <div className="tag-list">
              {auction.completedQuestLines.map((q) => (
                <span key={q} className="tag">
                  {q}
                </span>
              ))}
            </div>
          </section>
        )}

        {otherEntries.length > 0 && (
          <section className="modal-section">
            <h3>Outros</h3>
            <ul className="modal-stat-list">
              {otherEntries.map((e, i) => (
                <li key={i}>{e.raw}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="modal-footer">
          <a href={auction.officialUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Ver leilão oficial →
          </a>
        </footer>
      </div>
    </div>
  );
}
