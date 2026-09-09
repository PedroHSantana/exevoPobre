import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getMessagingIfSupported, VAPID_KEY } from '../lib/firebase';
import { registerPushServiceWorker } from '../lib/push';
import { getOwnerId } from '../lib/ownerId';
import { DEFAULT_FILTERS } from '../lib/filters';
import FilterPanel from '../components/FilterPanel';

export default function AlertsPage() {
  const [ownerId] = useState(getOwnerId);
  const [savedFilters, setSavedFilters] = useState([]);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [status, setStatus] = useState(null);

  const loadFilters = async () => {
    const res = await fetch(`/api/alerts?ownerId=${ownerId}`);
    if (res.ok) setSavedFilters(await res.json());
  };

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enablePush = async () => {
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        setStatus('Notificações push não são suportadas neste navegador.');
        return null;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('Permissão de notificação negada.');
        return null;
      }
      const registration = await registerPushServiceWorker();
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      setPushEnabled(true);
      return token;
    } catch (err) {
      console.error(err);
      setStatus('Falha ao ativar notificações push.');
      return null;
    }
  };

  const saveFilter = async (e) => {
    e.preventDefault();
    setStatus(null);

    let pushToken = null;
    if (pushEnabled) {
      pushToken = await enablePush();
    }

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerId,
        name: name || 'Meu filtro',
        criteria: draftFilters,
        pushToken,
        email: email || null,
      }),
    });

    if (res.ok) {
      setStatus('Filtro salvo! Você será avisado quando surgir um leilão compatível.');
      setName('');
      loadFilters();
    } else {
      setStatus('Erro ao salvar o filtro.');
    }
  };

  const removeFilter = async (id) => {
    await fetch(`/api/alerts?id=${id}&ownerId=${ownerId}`, { method: 'DELETE' });
    loadFilters();
  };

  return (
    <div className="alerts-layout">
      <section>
        <h1>Alertas de Leilão</h1>
        <p>
          Salve um filtro e receba um aviso (push e/ou e-mail) assim que surgir um leilão novo que bate com
          os critérios — sem precisar ficar atualizando a página.
        </p>

        <form onSubmit={saveFilter} className="alert-form">
          <label>
            Nome do filtro
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: EK bom pra farm" />
          </label>

          <label>
            E-mail para aviso (opcional)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
            Ativar notificação no navegador (push)
          </label>

          <button type="submit" className="btn-primary">
            Salvar filtro e alertas
          </button>
        </form>

        {status && <p className="status-message">{status}</p>}
      </section>

      <FilterPanel filters={draftFilters} onChange={setDraftFilters} />

      <section className="saved-filters">
        <h2>Meus filtros salvos</h2>
        {savedFilters.length === 0 && <p>Nenhum filtro salvo ainda.</p>}
        <ul>
          {savedFilters.map((f) => (
            <li key={f.id}>
              <span>{f.name}</span>
              <button type="button" onClick={() => removeFilter(f.id)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
