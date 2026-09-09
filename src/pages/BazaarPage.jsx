import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, limit as fbLimit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_FILTERS, filterAuctions } from '../lib/filters';
import FilterPanel from '../components/FilterPanel';
import AuctionCard from '../components/AuctionCard';
import AuctionListRow from '../components/AuctionListRow';

const PAGE_SIZE = 60;

export default function BazaarPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('endDate');
  const [view, setView] = useState('grid');

  useEffect(() => {
    const q = query(
      collection(db, 'auctions'),
      where('auctionEndIso', '>', new Date().toISOString()),
      orderBy('auctionEndIso'),
      fbLimit(1000)
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setAuctions(snap.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        console.error('Failed to read auctions:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const list = filterAuctions(auctions, filters);
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'bid') return (a.bid ?? 0) - (b.bid ?? 0);
      if (sortBy === 'level') return (b.level ?? 0) - (a.level ?? 0);
      return new Date(a.auctionEndIso ?? a.auctionEnd) - new Date(b.auctionEndIso ?? b.auctionEnd);
    });
    return sorted.slice(0, PAGE_SIZE);
  }, [auctions, filters, sortBy]);

  return (
    <div className="bazaar-layout">
      <FilterPanel filters={filters} onChange={setFilters} />

      <main className="bazaar-results">
        <div className="results-header">
          <h1>Bazar de Personagens</h1>
          <div className="results-header-actions">
            <div className="view-toggle">
              <button
                type="button"
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
                aria-label="Visualização em grade"
              >
                ▦
              </button>
              <button
                type="button"
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                aria-label="Visualização em lista"
              >
                ☰
              </button>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="endDate">Ordenar: fim do leilão</option>
              <option value="bid">Ordenar: bid</option>
              <option value="level">Ordenar: level</option>
            </select>
          </div>
        </div>

        {loading && <p>Carregando leilões...</p>}
        {!loading && filtered.length === 0 && (
          <p>Nenhum leilão encontrado com esses filtros ainda. O scraper roda periodicamente — tente novamente em alguns minutos.</p>
        )}

        {view === 'grid' ? (
          <div className="auction-grid">
            {filtered.map((auction) => (
              <AuctionCard key={auction.auctionId} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="auction-list">
            {filtered.map((auction) => (
              <AuctionListRow key={auction.auctionId} auction={auction} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
