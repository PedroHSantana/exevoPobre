import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import BazaarPage from './pages/BazaarPage';
import AlertsPage from './pages/AlertsPage';
import { listenForForegroundMessages } from './lib/firebase';

export default function App() {
  useEffect(() => {
    listenForForegroundMessages();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <span className="app-title">Tibia Bazaar Finder</span>
          <nav>
            <NavLink to="/" end>
              Bazar
            </NavLink>
            <NavLink to="/alertas">Alertas</NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<BazaarPage />} />
          <Route path="/alertas" element={<AlertsPage />} />
        </Routes>

        <footer className="app-footer">
          Dados públicos extraídos do bazar oficial do Tibia (
          <a href="https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades" target="_blank" rel="noreferrer">
            tibia.com
          </a>
          ). Ferramenta independente, não afiliada à CipSoft GmbH. Todas as compras e vendas acontecem
          exclusivamente no site/cliente oficial do Tibia.
        </footer>
      </div>
    </BrowserRouter>
  );
}
