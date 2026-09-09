import { useEffect, useState } from 'react';

function formatRemaining(ms) {
  if (ms <= 0) return 'Encerrado';

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function AuctionCountdown({ endIso }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endIso) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endIso]);

  if (!endIso) return null;

  const remaining = new Date(endIso).getTime() - now;
  const ending = remaining > 0 && remaining < 60 * 60 * 1000; // < 1h left

  return (
    <span className={`auction-countdown ${ending ? 'auction-countdown-urgent' : ''}`}>
      {remaining <= 0 ? 'Encerrado' : `termina em ${formatRemaining(remaining)}`}
    </span>
  );
}
