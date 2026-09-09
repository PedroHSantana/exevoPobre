import { getAdminDb } from '../_lib/firebaseAdmin.js';

// Saved filters are keyed by a client-generated ownerId (stored in the
// browser's localStorage) since this project has no login system.
export default async function handler(req, res) {
  const db = getAdminDb();

  if (req.method === 'GET') {
    const ownerId = req.query.ownerId;
    if (!ownerId) {
      res.status(400).json({ error: 'ownerId is required' });
      return;
    }
    const snap = await db.collection('savedFilters').where('ownerId', '==', ownerId).get();
    res.status(200).json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    return;
  }

  if (req.method === 'POST') {
    const { ownerId, name, criteria, pushToken, email } = req.body || {};
    if (!ownerId || !criteria) {
      res.status(400).json({ error: 'ownerId and criteria are required' });
      return;
    }
    const doc = await db.collection('savedFilters').add({
      ownerId,
      name: name || 'Meu filtro',
      criteria,
      pushToken: pushToken || null,
      email: email || null,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ id: doc.id });
    return;
  }

  if (req.method === 'DELETE') {
    const { id, ownerId } = req.query;
    if (!id || !ownerId) {
      res.status(400).json({ error: 'id and ownerId are required' });
      return;
    }
    const ref = db.collection('savedFilters').doc(id);
    const doc = await ref.get();
    if (!doc.exists || doc.data().ownerId !== ownerId) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await ref.delete();
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
