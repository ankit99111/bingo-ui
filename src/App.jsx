import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Result from './pages/Result';

function App() {
  const [isBossMode, setIsBossMode] = useState(false);
  const [isThemeHidden, setIsThemeHidden] = useState(false);
  const [bossUrl, setBossUrl] = useState('https://adminlte.io/themes/v3/index2.html');

  const DASHBOARD_URLS = [
    'https://adminlte.io/themes/v3/pages/widgets.html',
    'https://adminlte.io/themes/v3/pages/layout/top-nav.html',
    'https://adminlte.io/themes/v3/pages/layout/fixed-sidebar-custom.html',
    'https://adminlte.io/themes/v3/pages/calendar.html',
    'https://adminlte.io/themes/v3/pages/kanban.html',
    'https://adminlte.io/themes/v3/pages/forms/general.html',
    'https://adminlte.io/themes/v3/pages/forms/editors.html',
    'https://adminlte.io/themes/v3/pages/tables/data.html',
    'https://adminlte.io/themes/v3/pages/examples/project-add.html',
    'https://adminlte.io/themes/v3/pages/examples/project-detail.html',
    'https://www.google.com',
    'https://reactnative.directory/',
    'https://react.dev/reference/react',
    'https://react.dev/reference/react/Suspense',
    'https://react.dev/reference/eslint-plugin-react-hooks',
    'https://react.dev/reference/rules/react-calls-components-and-hooks',
    'https://react.dev/reference/react-dom/static/prerender',
    'https://react.dev/reference/react-dom/server/renderToPipeableStream'
  ];

  useEffect(() => {
    if (isThemeHidden) {
      document.body.classList.add('theme-hidden');
    } else {
      document.body.classList.remove('theme-hidden');
    }
  }, [isThemeHidden]);

  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      // Trigger Boss Mode on any right click
      e.preventDefault();
      const randomUrl = DASHBOARD_URLS[Math.floor(Math.random() * DASHBOARD_URLS.length)];
      setBossUrl(randomUrl);
      setIsBossMode(true);
    };

    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
  }, []);

  return (
    <Router>
      <div className="app-main-wrapper">
        {/* Global Theme Toggle */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '25px', // Shifted slightly for aesthetics
          zIndex: 9000,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsThemeHidden(!isThemeHidden)}
            style={{
              padding: '8px 15px',
              fontSize: '0.7rem',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(5px)'
            }}
          >
            {isThemeHidden ? '🛸 NORMAL MODE' : '🕶️ STEALTH MODE'}
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lobby/:roomId" element={<Lobby />} />
          <Route path="/game/:roomId" element={<Game />} />
          <Route path="/result/:roomId" element={<Result />} />
        </Routes>

        {isBossMode && (
          <div
            className="boss-mode-overlay"
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              zIndex: 9999, backgroundColor: '#000', cursor: 'default'
            }}
          >
            <button
              onClick={() => setIsBossMode(false)}
              style={{
                position: 'absolute',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                padding: '10px 25px',
                background: 'rgba(20, 20, 25, 0.95)',
                color: 'var(--primary-color)',
                border: '2px solid var(--primary-color)',
                borderRadius: '30px',
                fontWeight: '900',
                fontSize: '0.75rem',
                letterSpacing: '2px',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0, 224, 255, 0.3)',
              }}
            >
              ✕ CLOSE PROJECT VIEW
            </button>
            <iframe
              src={bossUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Dashboard"
            />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
