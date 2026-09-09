import { useState } from 'react';
import AuctionCountdown from './AuctionCountdown';
import AuctionDetailModal from './AuctionDetailModal';
import { VOCATION_ICON, PVP_ICON, LOCATION_ICON } from '../lib/constants';
import { getWorldMeta } from '../lib/worlds';

function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

export default function AuctionListRow({ auction }) {
  const [showModal, setShowModal] = useState(false);
  const { pvpType, location } = getWorldMeta(auction.world);

  return (
    <>
      <div className="auction-row" onClick={() => setShowModal(true)} role="button" tabIndex={0}>
        <div className="auction-row-outfit">
          {auction.outfitImageUrl && <img src={auction.outfitImageUrl} alt={auction.name} />}
        </div>
        <div className="auction-row-name">
          <strong className="ellipsis">{auction.name}</strong>
          <span className="auction-meta">
            {VOCATION_ICON[auction.vocation]} Level {formatNumber(auction.level)} · {auction.vocation}
          </span>
        </div>
        <div className="auction-row-cell ellipsis">
          {LOCATION_ICON[location] ?? '🌐'} {auction.world}
        </div>
        <div className="auction-row-cell">
          {PVP_ICON[pvpType] ?? '❔'} {pvpType ?? '—'}
        </div>
        <div className="auction-row-cell">
          <AuctionCountdown endIso={auction.auctionEndIso} />
        </div>
        <div className="auction-row-cell auction-row-bid">🪙 {formatNumber(auction.bid)}</div>
        <a
          href={auction.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="external-link-icon"
          onClick={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      </div>

      {showModal && <AuctionDetailModal auction={auction} onClose={() => setShowModal(false)} />}
    </>
  );
}
