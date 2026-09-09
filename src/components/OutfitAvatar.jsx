import { useState } from 'react';
import { VOCATION_ICON } from '../lib/constants';

// static.tibia.com currently blocks hotlinked/embedded image requests
// (Cloudflare challenge) even from real browsers and residential IPs, so
// the outfit GIF frequently fails to load. Fall back to a vocation emoji
// instead of showing a broken-image icon.
export default function OutfitAvatar({ src, name, vocation, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`outfit-fallback ${className}`} title={name}>
        {VOCATION_ICON[vocation] ?? '❔'}
      </div>
    );
  }

  return <img src={src} alt={name} className={className} onError={() => setFailed(true)} />;
}
