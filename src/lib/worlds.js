import worldsData from './worldsData.json' with { type: 'json' };

export function getWorldMeta(worldName) {
  return worldsData[worldName] || { location: null, pvpType: null };
}
