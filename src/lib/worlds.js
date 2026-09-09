import worldsData from './worldsData.json';

export function getWorldMeta(worldName) {
  return worldsData[worldName] || { location: null, pvpType: null };
}
