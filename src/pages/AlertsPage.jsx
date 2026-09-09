import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getMessagingIfSupported, VAPID_KEY } from '../lib/firebase';
import { registerPushServiceWorker } from '../lib/push';
import { getOwnerId } from '../lib/ownerId';
import { DEFAULT_FILTERS } from '../lib/filters';
import FilterPanel from '../components/FilterPanel';

function summarizeCriteria(c) {
  const parts = [];
  if (c.characterName) parts.push(`personagem "${c.characterName}"`);
  if (c.levelMin != null || c.levelMax != null) parts.push(`nível ${c.levelMin ?? 0}-${c.levelMax ?? '∞'}`);
  if (c.vocations?.length) parts.push(c.vocations.join('/'));
  if (Object.keys(c.skillMins || {}).length) {
    const mode = c.skillMinsMode === 'any' ? ' OU ' : ' E ';
    parts.push(Object.entries(c.skillMins).map(([s, v]) => `${s}≥${v}`).join(mode));
  }
  if (c.bidMax != null) parts.push(`bid ≤ ${c.bidMax.toLocaleString('pt-BR')}`);
  if (c.endingWithinMinutes != null) parts.push(`termina em ≤${c.endingWithinMinutes}min`);
  return parts.length ? parts.join(' · ') : 'qualquer leilão';
}

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

  // Returns { token } on success or { error } on failure — never throws,
  // so the caller always has a concrete reason to show instead of it being
  // silently swallowed or overwritten by a later status update.
  const enablePush = async () => {
    try {
      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        return { error: 'Notificações push não são suportadas neste navegador.' };
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { error: 'Permissão de notificação negada.' };
      }
      const registration = await registerPushServiceWorker();
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (!token) return { error: 'getToken() retornou vazio.' };
      setPushEnabled(true);
      return { token };
    } catch (err) {
      console.error(err);
      return { error: `${err.name}: ${err.message}` };
    }
  };

  const saveFilter = async (e) => {
    e.preventDefault();
    setStatus(null);

    let pushToken = null;
    let pushError = null;
    if (pushEnabled) {
      const result = await enablePush();
      pushToken = result.token ?? null;
      pushError = result.error ?? null;
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
      if (pushEnabled && !pushToken) {
        setStatus(
          `Filtro salvo, mas a notificação push NÃO foi ativada (${pushError}). Você só vai receber por e-mail, se preencheu um.`
        );
      } else {
        setStatus('Filtro salvo! Você será avisado quando surgir um leilão compatível.');
      }
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
          Salve um filtro e receba um aviso (push e/ou e-mail) sempre que um leilão bater com os critérios —
          seja um leilão novo, seja um já existente cujo tempo restante ou preço mudou. Dois jeitos comuns de
          usar:
        </p>
        <ul style={{ fontSize: 13, paddingLeft: 18, margin: '0 0 12px' }}>
          <li>
            <strong>Personagem específico:</strong> preencha só o campo "Nome do personagem" e um "Bid máximo"
            — avisa quando o bid daquele personagem ficar abaixo do valor.
          </li>
          <li>
            <strong>Garimpo por critérios:</strong> combine nível, vocação, skills (com "OU" pra pegar sword
            OU axe, por exemplo), bid máximo e "Terminando em até" pra pegar leilões baratos que estão prestes
            a fechar sem ninguém ter notado.
          </li>
        </ul>

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
              <div>
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{summarizeCriteria(f.criteria || {})}</div>
              </div>
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
