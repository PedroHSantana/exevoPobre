import { getAdminDb } from '../_lib/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { filterId, ownerId, pushToken } = req.body || {};
  if (!filterId || !ownerId || !pushToken) {
    res.status(400).json({ error: 'filterId, ownerId and pushToken are required' });
    return;
  }

  const db = getAdminDb();
  const ref = db.collection('savedFilters').doc(filterId);
  const doc = await ref.get();
  if (!doc.exists || doc.data().ownerId !== ownerId) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  await ref.update({ pushToken });
  res.status(200).json({ ok: true });
}
