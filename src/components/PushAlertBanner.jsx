import { useEffect, useRef, useState } from 'react';
import { listenForForegroundMessages } from '../lib/firebase';

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.18;
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio unsupported or blocked — the visual banner still works.
  }
}

// Shows an in-page banner and beeps repeatedly whenever a matching-auction
// push arrives while this tab is hidden, so it's hard to miss even if the
// OS notification toast is dismissed or never seen. Stops beeping the
// moment the tab regains focus.
export default function PushAlertBanner() {
  const [alert, setAlert] = useState(null);
  const beepIntervalRef = useRef(null);

  useEffect(() => {
    listenForForegroundMessages((payload) => {
      setAlert(payload);
      beep();
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          clearInterval(beepIntervalRef.current);
          return;
        }
        beep();
      }, 4000);
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearInterval(beepIntervalRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(beepIntervalRef.current);
    };
  }, []);

  if (!alert) return null;

  const goToResults = () => {
    if (alert.link) window.location.assign(alert.link);
  };

  return (
    <div className="push-alert-banner" role="alert">
      <div className="push-alert-text">
        <strong>{alert.title}</strong>
        {alert.body && <span>{alert.body}</span>}
      </div>
      <div className="push-alert-actions">
        {alert.link && (
          <button type="button" className="btn-primary" onClick={goToResults}>
            Ver leilões
          </button>
        )}
        <button type="button" className="push-alert-dismiss" onClick={() => setAlert(null)} aria-label="Fechar">
          ✕
        </button>
      </div>
    </div>
  );
}
