const STORAGE_KEY = 'tibia-bazaar-owner-id';

export function getOwnerId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
